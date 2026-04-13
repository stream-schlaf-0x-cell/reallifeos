// ═══════════════════════════════════════════════════════════════════════════
// RealLifeOS — Relay API (The Bridge)
// Express server that relays requests from the React frontend to Dify AI,
// downloads generated assets, and writes JSON configuration to the shared volume.
// ═══════════════════════════════════════════════════════════════════════════

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  ensureDirectories,
  processImageUrls,
  writeJsonFile,
  resolveTargetFilename,
  extractJsonFromDifyResponse,
  rollbackFile,
  listBackups,
} from './utils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Alias for fs.promises (already using fs/promises import)
const fsPromises = fs;

// ─── Configuration ────────────────────────────────────────────────────────
const PORT = parseInt(process.env.PORT || '3100', 10);
const DIFY_API_URL = process.env.DIFY_API_URL || 'https://api.dify.ai/v1/workflows/run';
const DIFY_API_KEY = process.env.DIFY_API_KEY || '';
const REQUEST_TIMEOUT = parseInt(process.env.REQUEST_TIMEOUT || '120000', 10); // 2 min default

// ─── Express App ──────────────────────────────────────────────────────────
const app = express();

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '10mb' }));

// Request logging
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} → ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// ─── Health Check ─────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    difyApiConfigured: !!DIFY_API_KEY,
    difyApiUrl: DIFY_API_URL,
  });
});

// ─── Main Deploy Endpoint ─────────────────────────────────────────────────
/**
 * POST /api/ai/deploy
 *
 * Receives a user prompt from the React app, forwards it to the Dify AI
 * workflow, processes any generated images, and writes the resulting JSON
 * to the shared data volume.
 *
 * Expected body:
 * {
 *   "action_type": "theme" | "boss" | "quest" | "map" | "skill" | ...,
 *   "user_prompt": "Change the biome to a dark winter theme...",
 *   "current_level": 5,
 *   "coords": [q, r]  // Optional, for map tiles
 * }
 */
app.post('/api/ai/deploy', async (req, res) => {
  const startTime = Date.now();

  try {
    // ── Validate input ────────────────────────────────────────────────
    const { action_type, user_prompt, current_level, coords, ...extraInputs } = req.body;

    if (!user_prompt || typeof user_prompt !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Missing or invalid "user_prompt". Must be a non-empty string.',
      });
    }

    if (!action_type || typeof action_type !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Missing or invalid "action_type". Must be a string (e.g., "theme", "boss", "map").',
      });
    }

    if (!DIFY_API_KEY) {
      console.error('[RelayAPI] DIFY_API_KEY is not configured!');
      return res.status(500).json({
        success: false,
        error: 'Dify API key not configured on the server.',
      });
    }

    console.log(`[RelayAPI] Deploy request: action_type="${action_type}", prompt="${user_prompt.substring(0, 80)}..."`);

    // ── Build Dify workflow inputs ────────────────────────────────────
    const difyInputs = {
      action_type,
      user_prompt,
      current_level: String(current_level || 'unknown'),
    };

    // Add optional fields
    if (coords && Array.isArray(coords) && coords.length === 2) {
      difyInputs.coords_q = String(coords[0]);
      difyInputs.coords_r = String(coords[1]);
    }

    // Merge any extra inputs from the request body
    for (const [key, value] of Object.entries(extraInputs)) {
      difyInputs[key] = typeof value === 'object' ? JSON.stringify(value) : String(value);
    }

    // ── Call Dify Workflow API ────────────────────────────────────────
    console.log(`[RelayAPI] Calling Dify: ${DIFY_API_URL}`);

    const difyResponse = await axios.post(
      DIFY_API_URL,
      {
        inputs: difyInputs,
        response_mode: 'blocking',
        user: 'RealLifeOS',
      },
      {
        headers: {
          'Authorization': `Bearer ${DIFY_API_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: REQUEST_TIMEOUT,
      }
    );

    console.log(`[RelayAPI] Dify responded in ${Date.now() - startTime}ms`);

    // ── Extract JSON data from Dify response ──────────────────────────
    let gameData;
    try {
      gameData = extractJsonFromDifyResponse(difyResponse.data);
    } catch (err) {
      console.error(`[RelayAPI] Failed to extract JSON from Dify: ${err.message}`);
      return res.status(502).json({
        success: false,
        error: `Dify response parsing failed: ${err.message}`,
        difyResponsePreview: JSON.stringify(difyResponse.data).substring(0, 1000),
      });
    }

    // ── Asset Pipeline: Download images and mutate URLs to local paths ──
    const imageResult = await processImageUrls(gameData);

    if (imageResult.downloadedCount > 0) {
      console.log(`[RelayAPI] Downloaded ${imageResult.downloadedCount} image(s)`);
    }
    if (imageResult.errors.length > 0) {
      console.warn(`[RelayAPI] Image download warnings:`, imageResult.errors);
    }

    // ── Determine target filename ─────────────────────────────────────
    const targetFilename = resolveTargetFilename(action_type);

    // ── Write to shared volume ────────────────────────────────────────
    const writeResult = await writeJsonFile(targetFilename, gameData);

    console.log(`[RelayAPI] Deploy complete: ${targetFilename} (${writeResult.bytesWritten} bytes)`);

    // ── Success response ──────────────────────────────────────────────
    res.json({
      success: true,
      action_type,
      targetFile: targetFilename,
      imagesDownloaded: imageResult.downloadedCount,
      imageErrors: imageResult.errors,
      fileSize: writeResult.bytesWritten,
      duration: Date.now() - startTime,
    });
  } catch (err) {
    const errorDetails = err.response?.data
      ? `Dify API error: ${JSON.stringify(err.response.data).substring(0, 500)}`
      : err.message;

    console.error(`[RelayAPI] Deploy failed: ${errorDetails}`);

    // Map HTTP errors to appropriate status codes
    const statusCode = err.response?.status === 401 ? 401 : 500;

    res.status(statusCode).json({
      success: false,
      error: statusCode === 401 ? 'Invalid Dify API key' : `Relay API error: ${errorDetails}`,
      duration: Date.now() - startTime,
    });
  }
});

// ─── Generate Tile Endpoint ───────────────────────────────────────────────
/**
 * POST /api/ai/generate_tile
 *
 * Specialized endpoint for generative map expansion. Triggered by the
 * WorldMap component when a player reveals an edge tile.
 *
 * Expected body:
 * {
 *   "action": "generate_tile",
 *   "coords": [q, r],
 *   "current_biome": "academy"
 * }
 *
 * This endpoint sets action_type="map" automatically.
 */
app.post('/api/ai/generate_tile', async (req, res) => {
  const startTime = Date.now();

  try {
    const { action, coords, current_biome, current_level } = req.body;

    if (!coords || !Array.isArray(coords) || coords.length !== 2) {
      return res.status(400).json({
        success: false,
        error: 'Missing or invalid "coords". Must be [q, r].',
      });
    }

    console.log(`[RelayAPI] Generate tile: [${coords[0]}, ${coords[1]}], biome="${current_biome}"`);

    // Forward to Dify with map-specific parameters
    const difyResponse = await axios.post(
      DIFY_API_URL,
      {
        inputs: {
          action_type: 'map_tile',
          user_prompt: `Generate a new map tile at coordinates [${coords[0]}, ${coords[1]}] adjacent to a ${current_biome || 'unknown'} tile.`,
          coords_q: String(coords[0]),
          coords_r: String(coords[1]),
          current_biome: String(current_biome || 'default'),
          current_level: String(current_level || 'unknown'),
        },
        response_mode: 'blocking',
        user: 'RealLifeOS',
      },
      {
        headers: {
          'Authorization': `Bearer ${DIFY_API_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: REQUEST_TIMEOUT,
      }
    );

    // Extract and process the response
    let gameData;
    try {
      gameData = extractJsonFromDifyResponse(difyResponse.data);
    } catch (err) {
      return res.status(502).json({
        success: false,
        error: `Dify response parsing failed: ${err.message}`,
      });
    }

    // Process any images
    const imageResult = await processImageUrls(gameData);

    // Write to map.json (merging handled by frontend poll)
    const writeResult = await writeJsonFile('map.json', gameData);

    console.log(`[RelayAPI] Tile generated: [${coords[0]}, ${coords[1]}] → map.json (${writeResult.bytesWritten} bytes)`);

    res.json({
      success: true,
      coords,
      targetFile: 'map.json',
      imagesDownloaded: imageResult.downloadedCount,
      fileSize: writeResult.bytesWritten,
      duration: Date.now() - startTime,
    });
  } catch (err) {
    const errorDetails = err.response?.data
      ? `Dify API error: ${JSON.stringify(err.response.data).substring(0, 500)}`
      : err.message;

    console.error(`[RelayAPI] Generate tile failed: ${errorDetails}`);
    res.status(500).json({
      success: false,
      error: `Tile generation failed: ${errorDetails}`,
      duration: Date.now() - startTime,
    });
  }
});

// ─── Rollback Endpoint ────────────────────────────────────────────────────
/**
 * POST /api/ai/restore_backup
 *
 * Restores the most recent backup of a specified file, or all files.
 *
 * Expected body (optional):
 * {
 *   "file": "theme.json"  // If omitted, returns list of available backups
 * }
 */
app.post('/api/ai/restore_backup', async (req, res) => {
  try {
    const { file } = req.body || {};

    if (!file) {
      // List available backups
      const { backups } = await listBackups();
      return res.json({
        success: true,
        action: 'list_backups',
        backups,
        count: backups.length,
      });
    }

    console.log(`[RelayAPI] Rollback requested for: ${file}`);
    const result = await rollbackFile(file);

    if (result.restored) {
      res.json({
        success: true,
        action: 'rollback',
        file,
        fromBackup: result.fromBackup,
      });
    } else {
      res.status(404).json({
        success: false,
        action: 'rollback',
        file,
        error: result.error,
      });
    }
  } catch (err) {
    console.error(`[RelayAPI] Rollback failed: ${err.message}`);
    res.status(500).json({
      success: false,
      error: `Rollback failed: ${err.message}`,
    });
  }
});

// ─── List Backups Endpoint ────────────────────────────────────────────────
/**
 * GET /api/ai/backups
 * Returns a list of all available backup files.
 */
app.get('/api/ai/backups', async (_req, res) => {
  try {
    const { backups } = await listBackups();
    res.json({ success: true, backups, count: backups.length });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── Save State Endpoint (Single Save State Persistence) ────────────────────
/**
 * POST /api/ai/save-state
 * 
 * Speichert den gesamten Spielzustand (worldState, mapData, defeatedBosses)
 * als einzelne JSON-Datei im Data-Volume.
 * 
 * Expected body:
 * {
 *   "worldState": { "currentBiome": "default", "discoveredTileCount": 5, ... },
 *   "mapData": { "tiles": [...], "playerPosition": { "q": 0, "r": 0 } },
 *   "defeatedBosses": ["map_boss_1", ...],
 *   "timestamp": 1712345678901
 * }
 */
app.post('/api/ai/save-state', async (req, res) => {
  const startTime = Date.now();

  try {
    const { worldState, mapData, defeatedBosses, timestamp } = req.body;

    if (!worldState || !mapData) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: worldState and mapData',
      });
    }

    const stateData = {
      worldState,
      mapData,
      defeatedBosses: defeatedBosses || [],
      timestamp: timestamp || Date.now(),
      version: '2.0', // Evolving World version
    };

    const writeResult = await writeJsonFile('save-state.json', stateData);

    console.log(`[RelayAPI] State saved: save-state.json (${writeResult.bytesWritten} bytes)`);

    res.json({
      success: true,
      targetFile: 'save-state.json',
      fileSize: writeResult.bytesWritten,
      duration: Date.now() - startTime,
    });
  } catch (err) {
    console.error(`[RelayAPI] Save state failed: ${err.message}`);
    res.status(500).json({
      success: false,
      error: `Save state error: ${err.message}`,
      duration: Date.now() - startTime,
    });
  }
});

// ─── Load State Endpoint (Stateless Frontend) ───────────────────────────────
/**
 * GET /api/ai/load-state
 * 
 * Lädt den gespeicherten Spielzustand vom Server.
 * Frontend ist "stateless" und lädt beim Start immer vom Server.
 * 
 * Returns: Full save state or 404 if no state exists
 */
app.get('/api/ai/load-state', async (req, res) => {
  try {
    const statePath = path.join(DATA_DIR, 'save-state.json');

    try {
      await fsPromises.access(statePath);
    } catch {
      // File doesn't exist — no saved state
      return res.status(404).json({
        success: false,
        error: 'No saved state found',
      });
    }

    const stateData = await fsPromises.readFile(statePath, 'utf-8');
    const parsed = JSON.parse(stateData);

    console.log(`[RelayAPI] State loaded: save-state.json`);

    res.json({
      success: true,
      ...parsed,
    });
  } catch (err) {
    console.error(`[RelayAPI] Load state failed: ${err.message}`);
    res.status(500).json({
      success: false,
      error: `Load state error: ${err.message}`,
    });
  }
});

// ─── Evolve Endpoint (Biome Transition) ─────────────────────────────────────
/**
 * POST /api/ai/evolve
 * 
 * Trigger Biome-Evolution: Sendet Prompt an Dify, um neues theme.json
 * und bosses.json für das Ziel-Biom zu generieren.
 * 
 * Expected body:
 * {
 *   "action_type": "evolve",
 *   "current_biome": "default",
 *   "target_biome": "crystal_caves",
 *   "coords": { "q": 2, "r": -1 },
 *   "current_level": 5,
 *   "discovered_count": 4
 * }
 */
app.post('/api/ai/evolve', async (req, res) => {
  const startTime = Date.now();

  try {
    const { action_type, current_biome, target_biome, coords, current_level, discovered_count } = req.body;

    if (!target_biome || typeof target_biome !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Missing or invalid "target_biome"',
      });
    }

    if (!DIFY_API_KEY) {
      return res.status(500).json({
        success: false,
        error: 'Dify API key not configured on the server.',
      });
    }

    console.log(`[RelayAPI] Evolve request: ${current_biome} → ${target_biome}`);

    // Build Dify prompt for biome evolution
    const prompt = `Evolve the game world from biome "${current_biome || 'default'}" to biome "${target_biome}". 
    Generate a new theme.json with appropriate colors and atmosphere for the ${target_biome} biome.
    Also generate new bosses.json with 3 bosses fitting the ${target_biome} theme.
    The player is at level ${current_level || 'unknown'} and has discovered ${discovered_count || 'unknown'} tiles.`;

    // Call Dify
    const difyResponse = await axios.post(
      DIFY_API_URL,
      {
        inputs: {
          action_type: 'theme',
          user_prompt: prompt,
          current_level: String(current_level || 'unknown'),
          target_biome: target_biome,
          current_biome: String(current_biome || 'default'),
        },
        response_mode: 'blocking',
        user: 'RealLifeOS',
      },
      {
        headers: {
          'Authorization': `Bearer ${DIFY_API_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: REQUEST_TIMEOUT,
      }
    );

    // Extract and process theme data
    let themeData;
    try {
      themeData = extractJsonFromDifyResponse(difyResponse.data);
    } catch (err) {
      return res.status(502).json({
        success: false,
        error: `Dify response parsing failed: ${err.message}`,
      });
    }

    // Process images for theme
    const imageResult = await processImageUrls(themeData);

    // Write theme.json
    const writeResult = await writeJsonFile('theme.json', themeData);

    console.log(`[RelayAPI] Evolve complete: theme.json for ${target_biome}`);

    res.json({
      success: true,
      action: 'evolve',
      fromBiome: current_biome,
      toBiome: target_biome,
      targetFile: 'theme.json',
      imagesDownloaded: imageResult.downloadedCount,
      fileSize: writeResult.bytesWritten,
      duration: Date.now() - startTime,
    });
  } catch (err) {
    const errorDetails = err.response?.data
      ? `Dify API error: ${JSON.stringify(err.response.data).substring(0, 500)}`
      : err.message;

    console.error(`[RelayAPI] Evolve failed: ${errorDetails}`);
    res.status(err.response?.status === 401 ? 401 : 500).json({
      success: false,
      error: err.response?.status === 401 ? 'Invalid Dify API key' : `Evolve error: ${errorDetails}`,
      duration: Date.now() - startTime,
    });
  }
});

// ─── 404 Handler ──────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found. Available: POST /api/ai/deploy, POST /api/ai/generate_tile, POST /api/ai/evolve, POST /api/ai/save-state, GET /api/ai/load-state, POST /api/ai/restore_backup, GET /api/ai/backups, GET /health',
  });
});

// ─── Global Error Handler ─────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error(`[RelayAPI] Unhandled error:`, err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
  });
});

// ─── Start Server ─────────────────────────────────────────────────────────
async function main() {
  try {
    // Ensure data directories exist
    await ensureDirectories();

    // Validate configuration
    if (!DIFY_API_KEY) {
      console.warn('⚠️  [RelayAPI] DIFY_API_KEY is not set. Deploy endpoints will return 500.');
    }

    app.listen(PORT, '0.0.0.0', () => {
      console.log('╔══════════════════════════════════════════════════════════╗');
      console.log('║     RealLifeOS Relay API — The Bridge                    ║');
      console.log('╠══════════════════════════════════════════════════════════╣');
      console.log(`║  Server running on port ${PORT}                              ║`);
      console.log(`║  Dify API: ${DIFY_API_URL}`);
      console.log(`║  Data volume: ${process.env.DATA_DIR || '/app/data'}                          ║`);
      console.log(`║  CORS origin: ${process.env.CORS_ORIGIN || '*'}                        ║`);
      console.log('╠══════════════════════════════════════════════════════════╣');
      console.log('║  POST /api/ai/deploy        — Send prompt to Dify       ║');
      console.log('║  POST /api/ai/generate_tile — Generate new map tile     ║');
      console.log('║  POST /api/ai/evolve        — Biome evolution           ║');
      console.log('║  POST /api/ai/save-state    — Save game state           ║');
      console.log('║  GET  /api/ai/load-state    — Load game state           ║');
      console.log('║  POST /api/ai/restore_backup — Rollback to backup       ║');
      console.log('║  GET  /api/ai/backups        — List available backups   ║');
      console.log('║  GET  /health                — Health check             ║');
      console.log('╚══════════════════════════════════════════════════════════╝');
    });
  } catch (err) {
    console.error('[RelayAPI] Failed to start server:', err);
    process.exit(1);
  }
}

main();
