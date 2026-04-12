import { useEffect, useState } from 'react';
import { usePlayerStore } from '../stores/usePlayerStore';
import { useSkillStore } from '../stores/useSkillStore';
import { useWorldStore } from '../stores/useWorldStore';
import { SKILL_TREE_DATA } from '../data/skillTreeData';

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

// Run migration once on app start
let migrationDone = false;

/**
 * ═══════════════════════════════════════════════════════════════════════════════════
 * FACADE HOOK: Bündelt alle drei Stores und bietet alte API
 * ═══════════════════════════════════════════════════════════════════════════════════
 */
export const useGameState = () => {
  // Initialize migration on first call
  if (!migrationDone) {
    migrationDone = true;
    migrateLegacyData();
  }

  // State aus allen drei Stores
  const playerState = usePlayerStore();
  const skillState = useSkillStore();
  const worldState = useWorldStore();

  // DEV MODE
  const [devMode, setDevMode] = useState(() => {
    const saved = localStorage.getItem('dev_mode');
    return saved === 'true';
  });

  const gameLocked = isGameLocked() && !devMode;

  // Persist dev mode preference
  useEffect(() => {
    localStorage.setItem('dev_mode', devMode);
  }, [devMode]);

  /**
   * ═══════════════════════════════════════════════════════════════════════════════════
   * CROSS-STORE ACTIONS: Logik, die mehrere Stores betrifft
   * ═══════════════════════════════════════════════════════════════════════════════════
   */

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
    }
  };

  const unlockSkill = (skillId, skillCost) => {
    if (playerState.skillPoints < skillCost) {
      playerState.showToast('Nicht genug Skillpunkte!', 'error');
      return;
    }

    const success = skillState.unlockSkill(skillId, skillCost);
    if (success) {
      playerState.showToast('Skill freigeschalten!', 'success');
      // Reduce skill points
      usePlayerStore.setState({ skillPoints: playerState.skillPoints - skillCost });
    }
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
  };

  const defeatMapBoss = (tileIndex) => {
    worldState.defeatMapBoss(tileIndex);
    playerState.showToast('Map-Boss besiegt!', 'success');
    playerState.addXp(30);
  };

  const getAvailableActions = () => {
    const unlockedSkillIds = skillState.skills
      .filter((s) => s.unlocked)
      .map((s) => s.id);
    return worldState.getAvailableActions(unlockedSkillIds);
  };

  const getPoiInfo = (tileIndex) => {
    return worldState.getPoiInfo(tileIndex);
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

  // ═══════════════════════════════════════════════════════════════════════════════════
  // DEV TOOLS
  // ═══════════════════════════════════════════════════════════════════════════════════

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

  // ═══════════════════════════════════════════════════════════════════════════════════
  // RETURN: Exakt gleiche API wie alte useGameState
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
