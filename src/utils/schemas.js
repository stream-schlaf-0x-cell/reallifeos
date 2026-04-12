import { z } from 'zod';

// ═══════════════════════════════════════════════════════════════════════════════════
// SCHEMA FIREWALL: Zod definitions for all external game data
// Ensures the React UI NEVER crashes from malformed external JSON.
// ═══════════════════════════════════════════════════════════════════════════════════

// ─── Boss Schema ─────────────────────────────────────────────────────────────────
export const BossSchema = z.object({
  id: z.union([z.string(), z.number()]),
  name: z.string().min(1),
  title: z.string().optional().default(''),
  maxHp: z.number().int().positive(),
  minHp: z.number().int().nonnegative().optional(),
  avatar: z.string().optional().default('👹'),
  abilities: z.array(z.string()).optional().default([]),
  lore: z.string().optional().default(''),
  rewards: z.object({
    xp: z.number().int().nonnegative().optional().default(50),
    gold: z.number().int().nonnegative().optional().default(0),
    mana: z.number().int().nonnegative().optional().default(0),
  }).optional().default({}),
});

export const BossArraySchema = z.array(BossSchema);

// ─── Map Tile Schema ─────────────────────────────────────────────────────────────
export const MapTileSchema = z.object({
  q: z.number().int(),
  r: z.number().int(),
  type: z.string().min(1),
  discovered: z.boolean().default(false),
  mapBoss: z.object({
    name: z.string().min(1),
    hp: z.number().int().positive(),
    defeated: z.boolean().default(false),
  }).nullable().optional().default(null),
  adjacentToDiscovered: z.boolean().optional().default(false),
  generating: z.boolean().optional().default(false),
}).passthrough();

export const MapDataSchema = z.object({
  tiles: z.array(MapTileSchema),
  playerPosition: z.object({
    q: z.number().int(),
    r: z.number().int(),
  }),
});

// ─── Skill Node Schema ───────────────────────────────────────────────────────────
export const SkillNodeSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  desc: z.string().default(''),
  icon: z.string().default('brain'),
  cost: z.number().int().nonnegative().default(0),
  req: z.array(z.string()).default([]),
});

export const SkillTierSchema = z.object({
  label: z.string().default(''),
  tierNumber: z.number().int().min(1).max(4),
  skills: z.array(SkillNodeSchema),
});

export const SkillPathSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  subtitle: z.string().default(''),
  yield: z.string().default(''),
  endgameGoal: z.string().default(''),
  tiers: z.object({
    basis: SkillTierSchema.optional(),
    schwelle: SkillTierSchema.optional(),
    quantensprung: SkillTierSchema.optional(),
    meisterschaft: SkillTierSchema.optional(),
  }).passthrough(),
});

export const SkillTreeSchema = z.record(z.string(), SkillPathSchema);

// ─── Theme Schema ────────────────────────────────────────────────────────────────
export const ThemeSchema = z.object({
  name: z.string().min(1).default('default'),
  // Core UI colors
  'bg-primary': z.string().default('#020617'),
  'bg-secondary': z.string().default('#0f172a'),
  'bg-tertiary': z.string().default('#1e293b'),
  'text-primary': z.string().default('#e2e8f0'),
  'text-secondary': z.string().default('#94a3b8'),
  'text-muted': z.string().default('#64748b'),
  'border-primary': z.string().default('#334155'),
  'border-secondary': z.string().default('#1e293b'),
  // Path-specific colors
  'path-architect': z.string().default('#3b82f6'),
  'path-socratic': z.string().default('#f59e0b'),
  'path-bard': z.string().default('#a855f7'),
  'path-monk': z.string().default('#10b981'),
  'path-acrobat': z.string().default('#ef4444'),
  // Accent colors
  'accent-primary': z.string().default('#8b5cf6'),
  'accent-secondary': z.string().default('#ec4899'),
  // Resource colors
  'resource-xp': z.string().default('#8b5cf6'),
  'resource-sp': z.string().default('#f59e0b'),
  'resource-mp': z.string().default('#10b981'),
  'resource-gold': z.string().default('#eab308'),
  'resource-mana': z.string().default('#3b82f6'),
  // Particle colors (for canvas engine)
  'particle-hue-min': z.number().int().min(0).max(360).default(200),
  'particle-hue-max': z.number().int().min(0).max(360).default(300),
  'particle-saturation': z.number().int().min(0).max(100).default(50),
  'particle-lightness': z.number().int().min(0).max(100).default(60),
  'particle-count': z.number().int().min(10).max(200).default(70),
  'particle-opacity': z.number().min(0).max(1).default(0.4),
}).passthrough();

// ─── Quest Schema ────────────────────────────────────────────────────────────────
export const QuestSchema = z.object({
  id: z.union([z.string(), z.number()]),
  name: z.string().min(1),
  path: z.enum(['architect', 'socratic', 'bard', 'monk', 'acrobat']),
  xp: z.number().int().positive(),
  description: z.string().default(''),
  tier: z.number().int().min(1).max(4).optional().default(1),
  tags: z.array(z.string()).optional().default([]),
  prerequisites: z.array(z.string()).optional().default([]),
}).passthrough();

export const QuestArraySchema = z.array(QuestSchema);

// ─── Attack Schema (for attacks.json) ────────────────────────────────────────────
export const AttackSchema = z.object({
  id: z.union([z.string(), z.number()]),
  name: z.string().min(1),
  dmg: z.number().int().nonnegative().default(0),
  type: z.enum(['attack', 'crit', 'shield']).default('attack'),
  cost: z.object({
    mana: z.number().int().nonnegative().default(0),
    gold: z.number().int().nonnegative().default(0),
  }),
  requiresSkill: z.string().nullable().optional().default(null),
  shield: z.number().int().nonnegative().optional().default(0),
  shieldDuration: z.number().int().positive().optional().default(3),
  desc: z.string().default(''),
});

export const AttackArraySchema = z.array(AttackSchema);

// ═══════════════════════════════════════════════════════════════════════════════════
// GENERIC FETCH UTILITY with Zod validation + fallback
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Fetches game data from an endpoint, validates against a Zod schema,
 * and falls back to bundled data on validation failure.
 *
 * @param {string} endpoint - URL or path to fetch (e.g., '/data/bosses.json')
 * @param {z.ZodType} schema - Zod schema to validate against
 * @param {*} fallbackData - Bundled default data to use if validation fails
 * @param {string} dataLabel - Human-readable label for logging (e.g., 'Bosses')
 * @returns {Promise<{ data: *, fromFallback: boolean }>}
 */
export async function fetchGameData(endpoint, schema, fallbackData, dataLabel = 'Data') {
  try {
    const response = await fetch(endpoint);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const rawJson = await response.json();
    const validated = schema.parse(rawJson);

    console.log(`✅ [Schema Firewall] ${dataLabel} validated successfully from ${endpoint}`);
    return { data: validated, fromFallback: false };
  } catch (error) {
    // Determine error type for detailed logging
    let errorDetails = '';
    if (error instanceof z.ZodError) {
      errorDetails = error.errors
        .map((e) => `  - ${e.path.join('.')}: ${e.message}`)
        .join('\n');
      console.warn(
        `⚠️ [Schema Firewall] ${dataLabel} Zod validation failed for ${endpoint}:\n${errorDetails}\n→ Falling back to bundled data.`
      );
    } else {
      console.warn(
        `⚠️ [Schema Firewall] ${dataLabel} fetch failed for ${endpoint}: ${error.message}\n→ Falling back to bundled data.`
      );
    }

    // Validate fallback data too (in case bundled data is also corrupted)
    try {
      const validatedFallback = schema.parse(fallbackData);
      console.log(`✅ [Schema Firewall] Using validated fallback for ${dataLabel}`);
      return { data: validatedFallback, fromFallback: true };
    } catch (fallbackError) {
      console.error(
        `🚨 [Schema Firewall] CRITICAL: Even fallback data for ${dataLabel} is invalid!`,
        fallbackError instanceof z.ZodError
          ? fallbackError.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ')
          : fallbackError.message
      );
      // Return raw fallback as last resort — better than crashing
      return { data: fallbackData, fromFallback: true, fallbackInvalid: true };
    }
  }
}

/**
 * Helper to log a validation failure to the in-game Activity Log.
 * Call this from components after fetchGameData returns fromFallback: true.
 */
export function logValidationFailure(dataLabel, error, addLogEntry) {
  const msg = error instanceof z.ZodError
    ? `${dataLabel}: Schema validation failed — ${error.errors.length} error(s). Using fallback.`
    : `${dataLabel}: Fetch failed (${error.message}). Using fallback.`;

  if (typeof addLogEntry === 'function') {
    addLogEntry('SYSTEM', msg);
  }
}
