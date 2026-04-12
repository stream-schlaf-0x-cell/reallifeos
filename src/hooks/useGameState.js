import { useEffect, useState, useCallback, useRef } from 'react';
import { usePlayerStore } from '../stores/usePlayerStore';
import { useSkillStore } from '../stores/useSkillStore';
import { useWorldStore } from '../stores/useWorldStore';
import { SKILL_TREE_DATA } from '../data/skillTreeData';
import { fetchGameData, BossArraySchema, MapDataSchema, AttackArraySchema, QuestArraySchema, logValidationFailure } from '../utils/schemas';
import { autoBackup } from '../utils/backupManager';

// ═══════════════════════════════════════════════════════════════════════════════════
// BUNDLED FALLBACKS (imported from local data — used when external fetch fails)
// ═══════════════════════════════════════════════════════════════════════════════════
import BUNDLED_BOSSES from '../data/bosses.json';
import BUNDLED_MAP from '../data/map.json';
import BUNDLED_ATTACKS from '../data/attacks.json';
import BUNDLED_QUESTS from '../data/quests.json';

// Game Lock Configuration
const GAME_LOCK_DATE = "2026-05-01T00:00:00";

const isGameLocked = () => {
  const lockDate = new Date(GAME_LOCK_DATE);
  const now = new Date();
  return now < lockDate;
};

/**
 * ═══════════════════════════════════════════════════════════════════════════════════
 * MIGRATION HELPER: Lädt alt-Spielstand und verteilt auf neue Stores
 * ═══════════════════════════════════════════════════════════════════════════════════
 */
const migrateLegacyData = () => {
  const legacyData = localStorage.getItem('tim_life_rpg');
  if (!legacyData) return;

  try {
    const parsed = JSON.parse(legacyData);

    // Migrate zu PlayerStore
    usePlayerStore.setState({
      level: parsed.level || 1,
      xp: parsed.xp || 0,
      skillPoints: parsed.skillPoints || 0,
      movementPoints: parsed.movementPoints || 0,
      gold: parsed.gold || 0,
      mana: parsed.mana || 0,
      customQuests: parsed.customQuests || [],
      log: parsed.log || [],
      poiBonuses: parsed.poiBonuses || { manaRegen: 0, goldRegen: 0, moveRegen: 0 },
      day: parsed.day || new Date().toLocaleDateString(),
    });

    // Migrate zu SkillStore
    if (parsed.skills) {
      useSkillStore.getState().migrateLegacySkills(parsed.skills);
    }

    // Migrate zu WorldStore
    useWorldStore.setState({
      mapData: parsed.mapData || useWorldStore.getState().mapData,
      currentBoss: parsed.currentBoss || useWorldStore.getState().currentBoss,
      bossHp: parsed.bossHp !== undefined ? parsed.bossHp : useWorldStore.getState().bossHp,
      playerShield: parsed.playerShield || 0,
      shieldTurnsLeft: parsed.shieldTurnsLeft || 0,
      combatLog: parsed.combatLog || [],
      defeatedBosses: parsed.defeatedBosses || [],
    });

    console.log('✅ Legacy data migrated to Zustand stores');
  } catch (err) {
    console.error('❌ Migration failed:', err);
  }
};

// Run migration once on app start (uses localStorage flag to prevent re-runs)
const runMigration = () => {
  const flag = localStorage.getItem('_rls_migration_done');
  if (flag) return;
  migrateLegacyData();
  localStorage.setItem('_rls_migration_done', '1');
};

/**
 * ═══════════════════════════════════════════════════════════════════════════════════
 * FACADE HOOK: Bündelt alle drei Stores + externe Spiel-Konfiguration + Backup
 * ═══════════════════════════════════════════════════════════════════════════════════
 */
export const useGameState = () => {
  // Initialize migration on first call
  useEffect(() => {
    runMigration();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // State aus allen drei Stores
  const playerState = usePlayerStore();
  const skillState = useSkillStore();
  const worldState = useWorldStore();

  // ─── DEV MODE ─────────────────────────────────────────────────────────────────
  const [devMode, setDevMode] = useState(() => {
    const saved = localStorage.getItem('dev_mode');
    return saved === 'true';
  });

  const gameLocked = isGameLocked() && !devMode;

  useEffect(() => {
    localStorage.setItem('dev_mode', devMode);
  }, [devMode]);

  // ─── EXTERNAL GAME CONFIG STATE (fetched from /data/*.json) ───────────────────
  const [gameConfig, setGameConfig] = useState({
    bosses: BUNDLED_BOSSES,
    attacks: BUNDLED_ATTACKS,
    quests: BUNDLED_QUESTS,
    mapData: BUNDLED_MAP,
    configLoading: true,
    configFromFallback: false,
    configErrors: [],
  });

  // Track whether initial config load has happened
  const configLoadedRef = useRef(false);

  // ─── LOAD EXTERNAL GAME CONFIG ────────────────────────────────────────────────
  const loadGameConfig = useCallback(async () => {
    const errors = [];
    let anyFallback = false;

    // Fetch all external configs in parallel
    const [bossesResult, attacksResult, questsResult, mapResult] = await Promise.all([
      fetchGameData('/data/bosses.json', BossArraySchema, BUNDLED_BOSSES, 'Bosses'),
      fetchGameData('/data/attacks.json', AttackArraySchema, BUNDLED_ATTACKS, 'Attacks'),
      fetchGameData('/data/quests.json', QuestArraySchema, BUNDLED_QUESTS, 'Quests'),
      fetchGameData('/data/map.json', MapDataSchema, BUNDLED_MAP, 'Map'),
    ]);

    [
      { label: 'Bosses', result: bossesResult },
      { label: 'Attacks', result: attacksResult },
      { label: 'Quests', result: questsResult },
      { label: 'Map', result: mapResult },
    ].forEach(({ label, result }) => {
      if (result.fromFallback) {
        anyFallback = true;
        if (result.fallbackInvalid) {
          errors.push(`${label}: Even fallback data is invalid!`);
        } else {
          errors.push(`${label}: External fetch failed — using bundled fallback.`);
        }
        logValidationFailure(label, new Error('Fetch failed'), (type, msg) => {
          console.warn(`[ActivityLog] ${type}: ${msg}`);
        });
      }
    });

    // Merge external map data with world store (only on first load, don't overwrite discovered tiles)
    if (!mapResult.fromFallback || !configLoadedRef.current) {
      const externalTiles = mapResult.data.tiles || [];
      const currentTiles = worldState.mapData.tiles || [];

      // Merge: keep current discovered state, add new tiles from external
      const mergedTiles = [...currentTiles];
      externalTiles.forEach((extTile) => {
        const existingIndex = mergedTiles.findIndex(
          (t) => t.q === extTile.q && t.r === extTile.r
        );
        if (existingIndex === -1) {
          // New tile — add it (undiscovered by default)
          mergedTiles.push({
            ...extTile,
            discovered: extTile.discovered || false,
          });
        } else {
          // Existing tile — update type/boss but preserve discovered state
          mergedTiles[existingIndex] = {
            ...mergedTiles[existingIndex],
            type: extTile.type,
            mapBoss: extTile.mapBoss,
            generating: extTile.generating || false,
          };
        }
      });

      useWorldStore.setState({
        mapData: {
          ...mapResult.data,
          tiles: mergedTiles,
        },
      });
    }

    // Update bosses if not from fallback and we have a current boss that matches
    const newBosses = bossesResult.data;
    let currentBoss = worldState.currentBoss;
    let bossHp = worldState.bossHp;

    if (!bossesResult.fromFallback && newBosses.length > 0) {
      // Find current boss in new list
      const currentBossInNew = newBosses.find((b) => b.name === currentBoss?.name);
      if (currentBossInNew) {
        currentBoss = currentBossInNew;
        // Preserve current HP ratio if maxHp changed
        const ratio = currentBoss.maxHp > 0 ? bossHp / currentBoss.maxHp : 1;
        bossHp = Math.max(1, Math.round(currentBossInNew.maxHp * ratio));
      } else {
        // Boss not found — use first new boss
        currentBoss = newBosses[0];
        bossHp = newBosses[0].maxHp;
      }
    }

    setGameConfig({
      bosses: bossesResult.data,
      attacks: attacksResult.data,
      quests: questsResult.data,
      mapData: mapResult.data,
      configLoading: false,
      configFromFallback: anyFallback,
      configErrors: errors,
    });

    configLoadedRef.current = true;
  }, []);

  // Load config on mount
  useEffect(() => {
    loadGameConfig();
  }, [loadGameConfig]);

  // ─── CROSS-STORE ACTIONS ──────────────────────────────────────────────────────

  const handleQuestComplete = (quest) => {
    const poiBonuses = worldState.recalcPoiBonuses();
    playerState.complainQuestComplete(quest, poiBonuses);
    playerState.setPoiBonuses(poiBonuses);
  };

  const executeAttack = (attack) => {
    const result = worldState.executeAttack(
      attack,
      worldState.bossHp,
      playerState.mana,
      playerState.gold
    );

    if (!result.success) {
      playerState.showToast('Nicht genug Ressourcen!', 'error');
      return;
    }

    // Deduct resources from PlayerStore
    usePlayerStore.setState({
      mana: playerState.mana - attack.cost.mana,
      gold: playerState.gold - attack.cost.gold,
    });

    playerState.showToast(
      `${attack.name}: ${result.damage} Schaden!`,
      result.damageType === 'crit' ? 'success' : 'info'
    );

    // Apply shield if applicable
    if (attack.shield) {
      worldState.applyShield(attack.shield, attack.shieldDuration || 3);
    }

    // Check if boss defeated
    if (result.isDefeated) {
      worldState.defeatBoss();
      playerState.showToast(`Boss besiegt: ${worldState.currentBoss.name}!`, 'success');
      playerState.addXp(50); // Bonus XP für Boss-Defeat

      // Auto-backup on boss defeat
      autoBackup(false);
    }
  };

  const unlockSkill = (skillId, skillCost) => {
    if (playerState.skillPoints < skillCost) {
      playerState.showToast('Nicht genug Skillpunkte!', 'error');
      return false;
    }

    const success = skillState.unlockSkill(skillId, skillCost);
    if (success) {
      playerState.showToast('Skill freigeschalten!', 'success');
      // Reduce skill points
      usePlayerStore.setState({ skillPoints: playerState.skillPoints - skillCost });
    }
    return success;
  };

  const uncoverTile = (tileIndex) => {
    const result = worldState.uncoverTile(tileIndex, playerState.movementPoints, playerState.gold);

    if (!result.success) {
      playerState.showToast(`Nicht genug Bewegungspunkte! (Kosten: 10)`, 'error');
      return;
    }

    // Deduct MP
    usePlayerStore.setState({ movementPoints: Math.max(0, playerState.movementPoints - 10) });

    // Recalc POI bonuses
    const newBonuses = worldState.recalcPoiBonuses();
    playerState.setPoiBonuses(newBonuses);

    playerState.showToast('Tile enthüllt!', 'success');

    // Check if this tile is on the edge → trigger generative webhook
    const tile = worldState.mapData.tiles[tileIndex];
    if (tile) {
      checkAndTriggerTileGeneration(tile);
    }
  };

  /**
   * Checks if a newly revealed tile is on the "edge" of the known map
   * and triggers a webhook to the AI to generate the next ring of tiles.
   */
  const checkAndTriggerTileGeneration = useCallback((tile) => {
    // Get adjacent hex coords (axial coordinates)
    const directions = [
      [1, 0], [-1, 0], [0, 1], [0, -1], [1, -1], [-1, 1]
    ];

    directions.forEach(([dq, dr]) => {
      const nq = tile.q + dq;
      const nr = tile.r + dr;

      // Check if adjacent tile exists in current map
      const adjacentExists = worldState.mapData.tiles.some(
        (t) => t.q === nq && t.r === nr
      );

      if (!adjacentExists) {
        // This is an edge tile — trigger generation for the new tile
        const newTileCoords = [nq, nr];

        // Mark as generating in local state
        useWorldStore.setState((state) => ({
          mapData: {
            ...state.mapData,
            tiles: [
              ...state.mapData.tiles,
              {
                q: nq,
                r: nr,
                type: 'unknown',
                discovered: false,
                mapBoss: null,
                generating: true,
              },
            ],
          },
        }));

        // Send webhook to AI (fire and forget)
        const webhookUrl = localStorage.getItem('dify_webhook_url') || '/api/ai/generate';
        fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'generate_tile',
            coords: newTileCoords,
            current_biome: tile.type || 'default',
          }),
        }).catch((err) => {
          console.warn(`[GenerativeMap] Webhook failed for tile [${nq},${nr}]:`, err.message);
        });

        console.log(`[GenerativeMap] Triggered AI generation for tile [${nq},${nr}]`);
      }
    });
  }, [worldState.mapData.tiles]);

  const defeatMapBoss = (tileIndex) => {
    worldState.defeatMapBoss(tileIndex);
    playerState.showToast('Map-Boss besiegt!', 'success');
    playerState.addXp(30);
  };

  const getAvailableActions = () => {
    const unlockedSkillIds = skillState.skills
      .filter((s) => s.unlocked)
      .map((s) => s.id);

    // Use attacks from game config (external or fallback)
    const allAttacks = gameConfig.attacks || BUNDLED_ATTACKS;
    const basicActions = allAttacks.filter((a) => !a.requiresSkill);
    const skillActions = allAttacks.filter(
      (a) => a.requiresSkill && unlockedSkillIds.includes(a.requiresSkill)
    );
    return [...basicActions, ...skillActions];
  };

  const getPoiInfo = (tileType) => {
    // tileType is a string like "monastery", "academy", etc.
    const POI_TABLE = {
      monastery: { label: 'Kloster', icon: 'lotus', bonus: { manaRegen: 2 }, desc: '+2 Mana pro Quest' },
      academy: { label: 'Akademie', icon: 'book', bonus: { goldRegen: 3 }, desc: '+3 Gold pro Quest' },
      gym: { label: 'Trainingslager', icon: 'activity', bonus: { moveRegen: 3 }, desc: '+3 MP pro Quest' },
      studio: { label: 'Studio', icon: 'music', bonus: { manaRegen: 1, goldRegen: 1 }, desc: '+1 Mana & +1 Gold pro Quest' },
      server: { label: 'Server-Farm', icon: 'server', bonus: { goldRegen: 2, moveRegen: 1 }, desc: '+2 Gold & +1 MP pro Quest' },
      wilds: { label: 'Wildnis', icon: 'zap', bonus: {}, ambush: true, desc: '⚠️ Hinterhalt! Ein Kampf beginnt!' },
      nexus: { label: 'Nexus', icon: 'brain', bonus: { manaRegen: 1, goldRegen: 1, moveRegen: 1 }, desc: '+1 Alle Ressourcen pro Quest' },
    };
    return POI_TABLE[tileType] || { label: tileType, icon: 'map', bonus: {}, desc: '' };
  };

  const addCustomSkill = (pathId, tier, skillData) => {
    const newSkill = skillState.addCustomSkill(pathId, tier, skillData);
    playerState.showToast(`Skill "${newSkill.name}" erstellt!`, 'success');
  };

  const addCustomQuest = (name, path, xp, description = '') => {
    playerState.addCustomQuest(name, path, xp, description);
  };

  const deleteCustomQuest = (questId) => {
    playerState.deleteCustomQuest(questId);
  };

  const claimTat = (questId) => {
    playerState.claimTat(questId);
  };

  const clearDamageEvent = () => {
    worldState.clearDamageEvent();
  };

  // ─── BACKUP MANAGER ACTIONS ───────────────────────────────────────────────────

  const handleBackupState = useCallback(() => {
    const filename = autoBackup(true);
    playerState.showToast(`Backup gespeichert: ${filename.filename || 'savegame.json'}`, 'success');
  }, []);

  // ─── DEV TOOLS ────────────────────────────────────────────────────────────────

  const devResetAll = () => {
    if (window.confirm('⚠️ Wirklich ALLES löschen?')) {
      playerState.devResetAll();
      skillState.devResetSkills();
      worldState.devResetWorld();
      playerState.showToast('Kompletter Reset!', 'warning');
    }
  };

  const devSetLevel = (level) => {
    playerState.devSetLevel(level);
  };

  const devSetResources = (resources) => {
    playerState.devSetResources(resources);
  };

  const devAddXp = (amount) => {
    playerState.devAddXp(amount);
  };

  const devUnlockAllSkills = () => {
    skillState.devUnlockAllSkills();
    playerState.showToast('Alle Skills freigeschaltet!', 'info');
  };

  const devRevealAllTiles = () => {
    worldState.devRevealAllTiles();
    playerState.showToast('Alle Map-Tiles enthüllt!', 'info');
  };

  const devDefeatBoss = () => {
    worldState.devDefeatBoss();
    playerState.showToast('Boss besiegt!', 'info');
  };

  const toggleDevMode = () => {
    setDevMode(!devMode);
  };

  // ─── CONFIG RELOAD (manual refresh from external source) ──────────────────────
  const reloadGameConfig = useCallback(() => {
    configLoadedRef.current = false;
    loadGameConfig();
    playerState.showToast('Spiel-Konfiguration wird neu geladen...', 'info');
  }, [loadGameConfig]);

  // ═══════════════════════════════════════════════════════════════════════════════════
  // RETURN: Exakt gleiche API wie alte useGameState + neue Felder
  // ═══════════════════════════════════════════════════════════════════════════════════

  return {
    // Merged Game State
    gameState: {
      // From PlayerStore
      level: playerState.level,
      xp: playerState.xp,
      skillPoints: playerState.skillPoints,
      movementPoints: playerState.movementPoints,
      gold: playerState.gold,
      mana: playerState.mana,
      customQuests: playerState.customQuests,
      log: playerState.log,
      poiBonuses: playerState.poiBonuses,
      day: playerState.day,

      // From SkillStore
      skills: skillState.skills,

      // From WorldStore
      mapData: worldState.mapData,
      currentBoss: worldState.currentBoss,
      bossHp: worldState.bossHp,
      playerShield: worldState.playerShield,
      shieldTurnsLeft: worldState.shieldTurnsLeft,
      combatLog: worldState.combatLog,
      damageEvents: worldState.damageEvents,
      lastDamageAmount: worldState.lastDamageAmount,
      lastDamageType: worldState.lastDamageType,
      defeatedBosses: worldState.defeatedBosses,

      // From External Game Config (merged)
      bosses: gameConfig.bosses,
      attacks: gameConfig.attacks,
      quests: gameConfig.quests,
      configLoading: gameConfig.configLoading,
      configFromFallback: gameConfig.configFromFallback,
      configErrors: gameConfig.configErrors,
    },

    // Actions
    handleQuestComplete,
    executeAttack,
    unlockSkill,
    uncoverTile,
    clearDamageEvent,
    getAvailableActions,
    getPoiInfo,
    addCustomSkill,
    addCustomQuest,
    deleteCustomQuest,
    claimTat,
    defeatMapBoss,

    // Backup Manager
    backupState: handleBackupState,

    // Skill Tree
    skillTreeData: SKILL_TREE_DATA,

    // Toast
    toast: playerState.toast,

    // Dev Tools
    devResetAll,
    devSetLevel,
    devSetResources,
    devAddXp,
    devUnlockAllSkills,
    devRevealAllTiles,
    devDefeatBoss,
    gameLocked,
    devMode,
    toggleDevMode,

    // Config Management
    reloadGameConfig,
  };
};

// Export compatibility helper (needed by other modules)
export const getResourceRewards = (path) => {
  switch (path) {
    case 'architect':
      return { move: 10, gold: 0, mana: 5 };
    case 'acrobat':
      return { move: 15, gold: 0, mana: 0 };
    case 'socratic':
      return { move: 0, gold: 25, mana: 5 };
    case 'bard':
      return { move: 0, gold: 5, mana: 15 };
    case 'monk':
      return { move: 0, gold: 0, mana: 20 };
    default:
      return { move: 0, gold: 0, mana: 0 };
  }
};
