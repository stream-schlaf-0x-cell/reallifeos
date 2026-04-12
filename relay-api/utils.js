import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

/** Root of the shared data volume. In Docker: /app/data */
export const DATA_DIR = path.resolve(process.env.DATA_DIR || path.join(__dirname, 'data'));
export const ASSETS_DIR = path.join(DATA_DIR, 'assets');

// Image field keys the Dify response may contain
const IMAGE_KEYS = ['imageUrl', 'backgroundImageUrl', 'tileImageUrl', 'image_url', 'background_image_url', 'tile_image_url'];

// action_type → target filename mapping
export const ACTION_TYPE_FILE_MAP = {
  theme: 'theme.json',
  boss: 'bosses.json',
  bosses: 'bosses.json',
  boss_defeated: 'bosses.json',
  quest: 'quests.json',
  quests: 'quests.json',
  map: 'map.json',
  map_tile: 'map.json',
  generate_tile: 'map.json',
  skill: 'skillTreeData.json',
  skills: 'skillTreeData.json',
  attack: 'attacks.json',
  attacks: 'attacks.json',
  deploy: null, // Will be inferred from payload
};

// ═══════════════════════════════════════════════════════════════════════════
// ENSURE DIRECTORIES EXIST
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Creates DATA_DIR and ASSETS_DIR if they don't exist.
 * Safe to call multiple times.
 */
export async function ensureDirectories() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.mkdir(ASSETS_DIR, { recursive: true });
  console.log(`[Utils] Data directory: ${DATA_DIR}`);
  console.log(`[Utils] Assets directory: ${ASSETS_DIR}`);
}

// ═══════════════════════════════════════════════════════════════════════════
// IMAGE PIPELINE
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Downloads an image from a URL and saves it locally.
 * @param {string} url - The remote URL (http/https)
 * @param {string} [preferredName] - Optional preferred filename stem
 * @returns {{ localPath: string, relativePath: string }}
 */
export async function downloadAndSaveImage(url, preferredName) {
  const timestamp = Date.now();
  const ext = path.extname(new URL(url).pathname) || '.png';
  const filename = preferredName
    ? `${preferredName}_${timestamp}${ext}`
    : `${timestamp}${ext}`;

  const localPath = path.join(ASSETS_DIR, filename);
  const relativePath = `/data/assets/${filename}`;

  console.log(`[Utils] Downloading image: ${url} → ${localPath}`);

  const response = await axios.get(url, {
    responseType: 'arraybuffer',
    timeout: 30_000,
    maxContentLength: 50 * 1024 * 1024, // 50 MB max
  });

  await fs.writeFile(localPath, response.data);
  console.log(`[Utils] Image saved: ${relativePath} (${(response.data.length / 1024).toFixed(1)} KB)`);

  return { localPath, relativePath };
}

/**
 * Recursively scans an object for image URL keys and downloads/replaces them.
 * Mutates the object in place.
 * @param {object} obj - The parsed JSON object from Dify
 * @returns {{ mutated: boolean, downloadedCount: number, errors: string[] }}
 */
export async function processImageUrls(obj) {
  if (!obj || typeof obj !== 'object') {
    return { mutated: false, downloadedCount: 0, errors: [] };
  }

  const result = { mutated: false, downloadedCount: 0, errors: [] };

  // Handle arrays
  if (Array.isArray(obj)) {
    for (const item of obj) {
      if (item && typeof item === 'object') {
        const subResult = await processImageUrls(item);
        result.mutated ||= subResult.mutated;
        result.downloadedCount += subResult.downloadedCount;
        result.errors.push(...subResult.errors);
      }
    }
    return result;
  }

  // Scan for known image keys
  for (const key of IMAGE_KEYS) {
    const value = obj[key];
    if (typeof value === 'string' && /^https?:\/\//i.test(value)) {
      try {
        const { relativePath } = await downloadAndSaveImage(value, key);
        obj[key] = relativePath;
        result.mutated = true;
        result.downloadedCount++;
        console.log(`[Utils] Replaced ${key}: "${value}" → "${relativePath}"`);
      } catch (err) {
        const errMsg = `Failed to download ${key} (${value}): ${err.message}`;
        console.error(`[Utils] ${errMsg}`);
        result.errors.push(errMsg);
        // Leave original URL in place on failure so frontend can still try
      }
    }
  }

  // Recurse into nested objects that aren't image keys
  for (const key of Object.keys(obj)) {
    if (IMAGE_KEYS.includes(key)) continue; // Already handled
    const value = obj[key];
    if (value && typeof value === 'object') {
      const subResult = await processImageUrls(value);
      result.mutated ||= subResult.mutated;
      result.downloadedCount += subResult.downloadedCount;
      result.errors.push(...subResult.errors);
    }
  }

  return result;
}

// ═══════════════════════════════════════════════════════════════════════════
// FILE OPERATIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Resolves the target filename from an action_type.
 * Falls back to a generic timestamped file if unknown.
 * @param {string} actionType
 * @returns {string}
 */
export function resolveTargetFilename(actionType) {
  const mapped = ACTION_TYPE_FILE_MAP[actionType];
  if (mapped) return mapped;

  // Fallback: generic config dump
  return `config_${Date.now()}.json`;
}

/**
 * Writes a JSON object to the data directory.
 * @param {string} filename - Target filename (e.g., 'theme.json')
 * @param {object} data - The JSON object to write
 * @param {object} [options]
 * @param {boolean} [options.backUp=true] - Whether to create a backup before overwriting
 * @returns {{ filePath: string, bytesWritten: number }}
 */
export async function writeJsonFile(filename, data, options = {}) {
  const { backUp = true } = options;
  const filePath = path.join(DATA_DIR, filename);

  // Create backup of existing file
  if (backUp) {
    try {
      await fs.access(filePath);
      const backupPath = `${filePath}.${Date.now()}.bak`;
      await fs.copyFile(filePath, backupPath);
      console.log(`[Utils] Backup created: ${path.basename(backupPath)}`);
    } catch {
      // File doesn't exist, no backup needed
    }
  }

  const jsonStr = JSON.stringify(data, null, 2);
  await fs.writeFile(filePath, jsonStr, 'utf-8');

  const bytesWritten = Buffer.byteLength(jsonStr, 'utf-8');
  console.log(`[Utils] File written: ${filename} (${(bytesWritten / 1024).toFixed(1)} KB)`);

  return { filePath, bytesWritten };
}

// ═══════════════════════════════════════════════════════════════════════════
// DIFY RESPONSE PARSING
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Extracts the JSON payload from a Dify workflow response.
 * Dify may return the JSON in different shapes depending on workflow config.
 *
 * Handles:
 *  - Direct JSON string in `outputs.text` / `outputs.result` / `outputs.data`
 *  - Wrapped JSON object in `outputs`
 *  - Raw string that needs JSON extraction
 *
 * @param {object} difyResponse - The parsed HTTP response from Dify
 * @returns {object} The parsed game data object
 */
export function extractJsonFromDifyResponse(difyResponse) {
  const outputs = difyResponse?.data?.outputs || difyResponse?.outputs || difyResponse;

  if (!outputs) {
    throw new Error('Dify response missing "outputs" field');
  }

  // Try common output field names
  const candidates = [outputs.text, outputs.result, outputs.data, outputs.json, outputs.output];

  for (const candidate of candidates) {
    if (typeof candidate === 'string') {
      // Try parsing as JSON — may be wrapped in markdown code blocks
      const cleaned = candidate.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '').trim();
      try {
        return JSON.parse(cleaned);
      } catch {
        // Not valid JSON, continue searching
      }
    }
    if (candidate && typeof candidate === 'object' && !Array.isArray(candidate)) {
      // It's already an object — might be our data
      if (Object.keys(candidate).length > 0) {
        return candidate;
      }
    }
  }

  // If outputs itself is the data object
  if (typeof outputs === 'object' && Object.keys(outputs).length > 0) {
    return outputs;
  }

  throw new Error(
    'Could not extract JSON from Dify response. ' +
    `Available keys: ${Object.keys(outputs).join(', ')}. ` +
    `Response preview: ${JSON.stringify(outputs).substring(0, 500)}`
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ROLLBACK / RESTORE
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Restores the most recent backup of a given file.
 * @param {string} filename - The target file (e.g., 'theme.json')
 * @returns {{ restored: boolean, fromBackup: string | null, error: string | null }}
 */
export async function rollbackFile(filename) {
  const filePath = path.join(DATA_DIR, filename);
  const dirFiles = await fs.readdir(DATA_DIR);

  // Find all backups for this file, sorted by timestamp (newest first)
  const backupPattern = new RegExp(`^${filename}\\.(\\d+)\\.bak$`);
  const backups = dirFiles
    .map((f) => {
      const match = f.match(backupPattern);
      return match ? { filename: f, timestamp: parseInt(match[1], 10) } : null;
    })
    .filter(Boolean)
    .sort((a, b) => b.timestamp - a.timestamp);

  if (backups.length === 0) {
    return { restored: false, fromBackup: null, error: `No backups found for ${filename}` };
  }

  const latestBackup = backups[0];
  const backupPath = path.join(DATA_DIR, latestBackup.filename);

  try {
    await fs.copyFile(backupPath, filePath);
    console.log(`[Utils] Rollback: Restored ${filename} from ${latestBackup.filename}`);
    return { restored: true, fromBackup: latestBackup.filename, error: null };
  } catch (err) {
    return { restored: false, fromBackup: null, error: `Rollback failed: ${err.message}` };
  }
}

/**
 * Lists all available backups in the data directory.
 * @returns {{ backups: Array<{filename: string, timestamp: number, size: number}> }}
 */
export async function listBackups() {
  const dirFiles = await fs.readdir(DATA_DIR);
  const backupPattern = /^(.+)\.(\d+)\.bak$/;

  const backups = [];
  for (const f of dirFiles) {
    const match = f.match(backupPattern);
    if (match) {
      const stats = await fs.stat(path.join(DATA_DIR, f));
      backups.push({
        filename: f,
        targetFile: match[1],
        timestamp: parseInt(match[2], 10),
        size: stats.size,
      });
    }
  }

  backups.sort((a, b) => b.timestamp - a.timestamp);
  return { backups };
}
