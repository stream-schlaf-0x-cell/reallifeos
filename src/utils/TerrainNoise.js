/**
 * TerrainNoise – Simplex Noise basierte Heightmap für organische Landschaft.
 */
import { createNoise2D } from 'simplex-noise';

// Seed-basierter Noise-Generator (deterministisch pro Session)
const SEED = Math.random() * 10000;

// Mulberry32 – deterministischer PRNG
function mulberry32(a) {
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Initialisiere Noise-Generator
const noise2D = createNoise2D(mulberry32(SEED | 0));

const TYPE_HEIGHT = {
  nexus: 0.6, monastery: 0.35, academy: 0.25,
  gym: 0.4, studio: 0.3, server: 0.15, wilds: 0.1,
};

export function getTerrainHeight(q, r, tileType = 'wilds') {
  const s1 = 0.12, s2 = 0.3, s3 = 0.7;
  const o1 = noise2D(q * s1, r * s1) * 1.0;
  const o2 = noise2D(q * s2 + 100, r * s2 + 100) * 0.5;
  const o3 = noise2D(q * s3 + 200, r * s3 + 200) * 0.25;
  const raw = (o1 + o2 + o3) / 1.75;
  const normalized = (raw + 1) / 2;
  return Math.max(0.05, normalized * 0.5 + (TYPE_HEIGHT[tileType] || 0));
}

export function getTileHeight(tileType, q, r) {
  return getTerrainHeight(q, r, tileType);
}

export function getTerrainBlendFactor(q, r) {
  return (noise2D(q * 0.08 + 500, r * 0.08 + 500) + 1) / 2;
}

export { SEED };
