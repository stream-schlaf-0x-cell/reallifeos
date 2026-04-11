import { useState, useEffect, useCallback } from "react";
import DAILY_BOSSES from "../data/bosses.json";
import INITIAL_MAP_DATA from "../data/map.json";
import ATTACKS from "../data/attacks.json";
import PRESET_QUESTS from "../data/quests.json";
import { playLevelUpSound, playUnlockSound, playHitSound } from "../engine/audioEngine";
import {
  flattenSkills,
  LEGACY_SKILL_MAP,
  SKILL_TREE_DATA,
} from "../data/skillTreeData";
import { generateMap, areHexAdjacent } from "../utils/mapGenerator";

// ─── Game Lock Configuration ──────────────────────────────────────
// Set the date when the game becomes "live" — before this date, game is locked
// Dev mode can override this for testing
const GAME_LOCK_DATE = "2026-05-01T00:00:00";

const isGameLocked = () => {
  const lockDate = new Date(GAME_LOCK_DATE);
  const now = new Date();
  return now < lockDate;
};

// ─── Resource Rewards ───────────────────────────────────────────────
export const getResourceRewards = (path) => {
  switch (path) {
    case "architect":
      return { move: 10, gold: 0, mana: 5 };
    case "acrobat":
      return { move: 15, gold: 0, mana: 0 };
    case "socratic":
      return { move: 0, gold: 25, mana: 5 };
    case "bard":
      return { move: 0, gold: 5, mana: 15 };
    case "monk":
      return { move: 0, gold: 0, mana: 20 };
    default:
      return { move: 0, gold: 0, mana: 0 };
  }
};

// ─── POI Definitions ────────────────────────────────────────────────
const POI_TABLE = {
  monastery: {
    label: "Kloster",
    icon: "lotus",
    bonus: { manaRegen: 2 },
    desc: "+2 Mana pro Quest (permanenter Bonus)",
  },
  academy: {
    label: "Akademie",
    icon: "book",
    bonus: { goldRegen: 3 },
    desc: "+3 Gold pro Quest (permanenter Bonus)",
  },
  gym: {
    label: "Trainingslager",
    icon: "activity",
    bonus: { moveRegen: 3 },
    desc: "+3 MP pro Quest (permanenter Bonus)",
  },
  studio: {
    label: "Studio",
    icon: "music",
    bonus: { manaRegen: 1, goldRegen: 1 },
    desc: "+1 Mana & +1 Gold pro Quest",
  },
  server: {
    label: "Server-Farm",
    icon: "server",
    bonus: { goldRegen: 2, moveRegen: 1 },
    desc: "+2 Gold & +1 MP pro Quest",
  },
  wilds: {
    label: "Wildnis",
    icon: "zap",
    bonus: {},
    ambush: true,
    desc: "⚠️ Hinterhalt! Ein Kampf beginnt!",
  },
  nexus: {
    label: "Nexus",
    icon: "brain",
    bonus: { manaRegen: 1, goldRegen: 1, moveRegen: 1 },
    desc: "+1 Alle Ressourcen pro Quest",
  },
};

const UNCOVER_COST = 10;

// ─── Main Hook ──────────────────────────────────────────────────────
export const useGameState = () => {
  const [gameState, setGameState] = useState(() => {
    const saved = localStorage.getItem("tim_life_rpg");
    let baseSkills = flattenSkills();

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Migrate legacy unlocked states
        if (parsed.skills && Array.isArray(parsed.skills)) {
          parsed.skills.forEach((legacySkill) => {
            if (legacySkill.unlocked) {
              const newId = LEGACY_SKILL_MAP[legacySkill.id];
              if (newId) {
                const target = baseSkills.find((s) => s.id === newId);
                if (target) target.unlocked = true;
              }
            }
          });
        }
        // Also restore new-format unlocked states if they exist
        if (parsed.skills && Array.isArray(parsed.skills)) {
          parsed.skills.forEach((savedSkill) => {
            if (savedSkill.unlocked && savedSkill.isCustom !== undefined) {
              // This is a new-format skill
              const target = baseSkills.find((s) => s.id === savedSkill.id);
              if (target) {
                target.unlocked = true;
              } else if (savedSkill.isCustom) {
                // Custom skill from a previous session — add it
                baseSkills.push(savedSkill);
              }
            }
          });
        }

        return {
          ...parsed,
          skills: baseSkills,
          movementPoints: parsed.movementPoints || 0,
          gold: parsed.gold || 0,
          mana: parsed.mana || 0,
          mapData: parsed.mapData || generateMap(4),
          bossHp: parsed.bossHp ?? DAILY_BOSSES[0].maxHp,
          currentBoss: parsed.currentBoss || DAILY_BOSSES[0],
          // Combat extras
          playerShield: parsed.playerShield || 0,
          shieldTurnsLeft: parsed.shieldTurnsLeft || 0,
          combatLog: parsed.combatLog || [],
          damageEvents: [],       // transient, never persisted
          lastDamageAmount: 0,    // for animation trigger
          lastDamageType: "",     // "hit" | "crit" | "heal" | "shield"
          poiBonuses: parsed.poiBonuses || { manaRegen: 0, goldRegen: 0, moveRegen: 0 },
          defeatedBosses: parsed.defeatedBosses || [],
          customQuests: parsed.customQuests || [],
          log: parsed.log || [],
        };
      } catch {
        // corrupted save – fall through
      }
    }
    return {
      level: 1,
      xp: 0,
      skillPoints: 0,
      skills: baseSkills,
      currentBoss: DAILY_BOSSES[0],
      bossHp: DAILY_BOSSES[0].maxHp,
      day: new Date().toLocaleDateString(),
      log: [],
      customQuests: [],
      movementPoints: 0,
      gold: 0,
      mana: 0,
      mapData: generateMap(4),
      playerShield: 0,
      shieldTurnsLeft: 0,
      combatLog: [],
      damageEvents: [],
      lastDamageAmount: 0,
      lastDamageType: "",
      poiBonuses: { manaRegen: 0, goldRegen: 0, moveRegen: 0 },
      defeatedBosses: [],
    };
  });

  const [toast, setToast] = useState(null);

  // ─── Enhanced Log Helper ──────────────────────────────────────────
  const addLogEntry = useCallback((prev, type, message) => {
    const entry = {
      timestamp: new Date().toISOString(),
      time: new Date().toLocaleTimeString(),
      type, // QUEST, CLAIM, COMBAT, SKILL, MAP, BOSS, LEVEL, SYSTEM
      message,
    };
    return [entry, ...prev.log].slice(0, 100);
  }, []);

  // Persist – strip transient fields
  useEffect(() => {
    const { damageEvents: _, ...persisted } = gameState;
    localStorage.setItem("tim_life_rpg", JSON.stringify(persisted));
  }, [gameState]);

  const showToast = useCallback((msg, type = "info") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  // ─── XP / Level-Up ──────────────────────────────────────────────
  const addXp = useCallback(
    (amount) => {
      let leveledUp = false;
      setGameState((prev) => {
        let newXp = prev.xp + amount;
        let newLevel = prev.level;
        let newPoints = prev.skillPoints;

        while (
          newXp >= Math.floor(100 * Math.pow(1.5, newLevel - 1))
        ) {
          newXp -= Math.floor(100 * Math.pow(1.5, newLevel - 1));
          newLevel++;
          newPoints += 150;
          leveledUp = true;
        }

        if (leveledUp) {
          playLevelUpSound();
          setTimeout(
            () =>
              showToast(
                `Level Up! Du bist jetzt Level ${newLevel}. +150 Skillpunkte!`,
                "success"
              ),
            0
          );
        }

        const newState = { ...prev, xp: newXp, level: newLevel, skillPoints: newPoints };
        if (leveledUp) {
          newState.log = addLogEntry(prev, "LEVEL", `Level Up! Jetzt Level ${newLevel}. +150 SP.`);
        }
        return newState;
      });
    },
    [showToast, addLogEntry]
  );

  // ─── POI Bonus helper ───────────────────────────────────────────
  const recalcPoiBonuses = (tiles) => {
    const bonuses = { manaRegen: 0, goldRegen: 0, moveRegen: 0 };
    tiles.forEach((t) => {
      if (!t.discovered) return;
      const poi = POI_TABLE[t.type];
      if (!poi || !poi.bonus) return;
      if (poi.bonus.manaRegen) bonuses.manaRegen += poi.bonus.manaRegen;
      if (poi.bonus.goldRegen) bonuses.goldRegen += poi.bonus.goldRegen;
      if (poi.bonus.moveRegen) bonuses.moveRegen += poi.bonus.moveRegen;
    });
    return bonuses;
  };

  // ─── Quest Complete ─────────────────────────────────────────────
  const handleQuestComplete = useCallback(
    (quest) => {
      setGameState((prev) => {
        const baseRewards = getResourceRewards(quest.path);
        const bonuses = recalcPoiBonuses(prev.mapData.tiles);

        const totalMove = baseRewards.move + bonuses.moveRegen;
        const totalGold = baseRewards.gold + bonuses.goldRegen;
        const totalMana = baseRewards.mana + bonuses.manaRegen;

        const updatedQuests = (prev.customQuests || []).map((q) =>
          q.id === quest.id ? { ...q, completed: true, completedAt: new Date().toISOString() } : q
        );

        return {
          ...prev,
          movementPoints: prev.movementPoints + totalMove,
          gold: prev.gold + totalGold,
          mana: prev.mana + totalMana,
          poiBonuses: bonuses,
          customQuests: updatedQuests,
          log: addLogEntry(prev, "QUEST", `Quest: "${quest.name}" | +${quest.xp} XP, +${totalMove} MP, +${totalGold} Gold, +${totalMana} Mana.`),
        };
      });

      addXp(quest.xp);
      showToast(`Ressourcen erhalten! +${quest.xp} XP`, "success");
    },
    [addXp, showToast, addLogEntry]
  );

  // ─── Execute Attack / Ability ───────────────────────────────────
  const executeAttack = useCallback(
    (attack) => {
      setGameState((prev) => {
        // Resource check
        if (prev.mana < attack.cost.mana || prev.gold < attack.cost.gold) {
          setTimeout(
            () => showToast("Nicht genug Ressourcen!", "error"),
            0
          );
          return prev;
        }

        // Skill requirement check
        if (attack.requiresSkill) {
          // Support both legacy IDs (mon_3, soc_3, etc.) and new IDs
          const checkId = LEGACY_SKILL_MAP[attack.requiresSkill] || attack.requiresSkill;
          const skill = prev.skills.find((s) => s.id === checkId);
          if (!skill || !skill.unlocked) {
            setTimeout(
              () =>
                showToast(
                  `Skill "${skill?.name || attack.requiresSkill}" muss freigeschaltet sein!`,
                  "error"
                ),
              0
            );
            return prev;
          }
        }

        playHitSound();

        let dmg = attack.dmg || 0;

        // Critical hit multiplier
        if (attack.type === "crit") {
          dmg = Math.floor(dmg * 1); // already inflated in data
        }

        let newBossHp = prev.bossHp - dmg;
        if (newBossHp < 0) newBossHp = 0;

        // Shield logic
        let newShield = prev.playerShield;
        let newShieldTurns = prev.shieldTurnsLeft;
        if (attack.shield) {
          newShield = attack.shield;
          newShieldTurns = attack.shieldDuration;
        } else if (prev.shieldTurnsLeft > 0) {
          newShieldTurns = prev.shieldTurnsLeft - 1;
          if (newShieldTurns <= 0) newShield = 0;
        }

        // Movement refund (for Geist-Körper-Kombo)
        let moveRefund = attack.refundMove || 0;

        const logEntry = `[${new Date().toLocaleTimeString()}] ${attack.name} | -${dmg} HP${attack.shield ? `, +${attack.shield} Shield` : ""}`;

        // Boss defeated?
        if (newBossHp <= 0 && attack.dmg > 0) {
          playLevelUpSound();
          const bossIndex = DAILY_BOSSES.findIndex(
            (b) => b.id === prev.currentBoss.id
          );
          const nextBossIndex = (bossIndex + 1) % DAILY_BOSSES.length;
          const nextBoss = DAILY_BOSSES[nextBossIndex];
          const defeatedList = [...(prev.defeatedBosses || []), prev.currentBoss.id];

          return {
            ...prev,
            mana: prev.mana - attack.cost.mana,
            gold: prev.gold - attack.cost.gold + moveRefund,
            bossHp: nextBoss.maxHp,
            currentBoss: nextBoss,
            playerShield: newShield,
            shieldTurnsLeft: newShieldTurns,
            combatLog: [
              `${logEntry} 🔥 BOSS BESIEGT!`,
              `Naechster: ${nextBoss.name}`,
              ...prev.combatLog,
            ].slice(0, 30),
            log: addLogEntry(prev, "BOSS", `Boss "${prev.currentBoss.name}" besiegt! +100 Bonus XP. Naechster: ${nextBoss.name}`),
            lastDamageAmount: dmg,
            lastDamageType: attack.type === "crit" ? "crit" : "hit",
            defeatedBosses: defeatedList,
          };
        }

        return {
          ...prev,
          mana: prev.mana - attack.cost.mana,
          gold: prev.gold - attack.cost.gold + moveRefund,
          bossHp: newBossHp,
          playerShield: newShield,
          shieldTurnsLeft: newShieldTurns,
          combatLog: [logEntry, ...prev.combatLog].slice(0, 30),
          log: addLogEntry(prev, "COMBAT", logEntry),
          lastDamageAmount: dmg,
          lastDamageType:
            attack.type === "shield"
              ? "shield"
              : attack.type === "crit"
              ? "crit"
              : "hit",
        };
      });

      const typeLabel =
        attack.type === "crit"
          ? "KRITISCHER TREFFER!"
          : attack.type === "shield"
          ? "Schild aktiviert!"
          : "Angriff erfolgreich!";
      if (attack.dmg > 0) {
        showToast(`${typeLabel} -${attack.dmg} HP`, attack.type === "crit" ? "success" : "info");
      } else if (attack.shield) {
        showToast(`Schild: +${attack.shield} HP Block für ${attack.shieldDuration} Züge`, "success");
      }
    },
    [showToast, addLogEntry]
  );

  // ─── Unlock Skill ───────────────────────────────────────────────
  const unlockSkill = useCallback(
    (skillId) => {
      const skill = gameState.skills.find((s) => s.id === skillId);
      if (!skill || skill.unlocked) return false;

      const reqsMet = skill.req.every((reqId) => {
        const reqSkill = gameState.skills.find((s) => s.id === reqId);
        return reqSkill && reqSkill.unlocked;
      });

      if (!reqsMet) {
        showToast("Voraussetzungen nicht erfüllt!", "error");
        return false;
      }

      if (gameState.skillPoints < skill.cost) {
        showToast("Nicht genug Skillpunkte!", "error");
        return false;
      }

      playUnlockSound();
      setGameState((prev) => ({
        ...prev,
        skillPoints: prev.skillPoints - skill.cost,
        skills: prev.skills.map((s) =>
          s.id === skillId ? { ...s, unlocked: true } : s
        ),
        log: addLogEntry(prev, "SKILL", `Skill freigeschaltet: "${skill.name}" (-${skill.cost} SP)`),
      }));
      showToast(`Skill freigeschaltet: ${skill.name}!`, "success");
      return true;
    },
    [gameState.skills, gameState.skillPoints, showToast, addLogEntry]
  );

  // ─── Uncover Map Tile ───────────────────────────────────────────
  const uncoverTile = useCallback(
    (tileIndex) => {
      setGameState((prev) => {
        if (prev.movementPoints < UNCOVER_COST) {
          setTimeout(
            () => showToast(`Nicht genug MP! Kostet ${UNCOVER_COST} MP.`, "error"),
            0
          );
          return prev;
        }

        const newTiles = [...prev.mapData.tiles];
        const tile = newTiles[tileIndex];
        if (tile.discovered) return prev;

        // Check adjacency — must be adjacent to at least one discovered tile
        const hasAdjacentDiscovered = newTiles.some(
          (t, i) => t.discovered && i !== tileIndex && areHexAdjacent(t, tile)
        );
        if (!hasAdjacentDiscovered) {
          setTimeout(
            () => showToast("Zu weit entfernt! Nur benachbarte Felder möglich.", "error"),
            0
          );
          return prev;
        }

        newTiles[tileIndex] = { ...tile, discovered: true };

        const bonuses = recalcPoiBonuses(newTiles);
        const poi = POI_TABLE[tile.type];
        let extraLog = `Tile entdeckt: ${poi?.label || tile.type}.`;
        let ambushTriggered = false;

        // Check for map boss on wilds tile
        if (tile.mapBoss && !tile.mapBoss.defeated) {
          extraLog += " ⚠️ MAP BOSS: " + tile.mapBoss.name + "!";
          ambushTriggered = true;
        }

        return {
          ...prev,
          movementPoints: prev.movementPoints - UNCOVER_COST,
          mapData: { ...prev.mapData, tiles: newTiles },
          poiBonuses: bonuses,
          combatLog: ambushTriggered
            ? [`⚠️ Map Boss auf ${tile.name}: ${tile.mapBoss.name}!`, ...prev.combatLog].slice(0, 30)
            : prev.combatLog,
          log: addLogEntry(prev, "MAP", `${extraLog} -${UNCOVER_COST} MP.`),
        };
      });

      showToast("Neues Gebiet entdeckt!", "success");
    },
    [showToast, addLogEntry]
  );

  // ─── Clear damage animation trigger (called by BattleArena after anim) ─
  const clearDamageEvent = useCallback(() => {
    setGameState((prev) => ({
      ...prev,
      lastDamageAmount: 0,
      lastDamageType: "",
    }));
  }, []);

  // ─── Available actions (filter attacks by unlocked skills) ───────
  const getAvailableActions = useCallback(() => {
    const unlockedSkillIds = new Set(
      gameState.skills.filter((s) => s.unlocked).map((s) => s.id)
    );

    return ATTACKS.filter((a) => {
      if (!a.requiresSkill) return true;
      return unlockedSkillIds.has(a.requiresSkill);
    });
  }, [gameState.skills]);

  // ─── POI info helper ────────────────────────────────────────────
  const getPoiInfo = useCallback((tileType) => {
    return POI_TABLE[tileType] || { label: tileType, icon: "map", bonus: {}, desc: "" };
  }, []);

  // ─── Claim Task (Honor System) ──────────────────────────────────
  const claimTat = useCallback(
    (pathId) => {
      const rewards = getResourceRewards(pathId);
      const bonuses = recalcPoiBonuses(
        gameState.mapData?.tiles || INITIAL_MAP_DATA.tiles
      );

      const totalMove = rewards.move + bonuses.moveRegen;
      const totalGold = rewards.gold + bonuses.goldRegen;
      const totalMana = rewards.mana + bonuses.manaRegen;

      // Build reward summary
      const parts = [];
      if (totalMove > 0) parts.push(`+${totalMove} MP`);
      if (totalGold > 0) parts.push(`+${totalGold} Gold`);
      if (totalMana > 0) parts.push(`+${totalMana} Mana`);
      const rewardStr = parts.join(", ") || "Nichts";

      const pathNames = {
        architect: "Architekt",
        socratic: "Sokratiker",
        bard: "Barde",
        monk: "Mönch",
        acrobat: "Akrobat",
      };

      setGameState((prev) => ({
        ...prev,
        movementPoints: prev.movementPoints + totalMove,
        gold: prev.gold + totalGold,
        mana: prev.mana + totalMana,
        poiBonuses: bonuses,
        log: addLogEntry(prev, "CLAIM", `Tat vollbracht (${pathNames[pathId] || pathId}): ${rewardStr}.`),
      }));

      showToast(`Tat eingetragen! ${rewardStr}`, "success");
    },
    [gameState.mapData, showToast, addLogEntry]
  );

  // ─── Add Custom Skill ───────────────────────────────────────────
  const addCustomSkill = useCallback((pathId, tierNumber, skillData) => {
    // Validate path
    if (!SKILL_TREE_DATA[pathId]) {
      showToast(`Unbekannter Pfad: ${pathId}`, "error");
      return false;
    }

    // Validate tier
    const tierKey = Object.keys(SKILL_TREE_DATA[pathId].tiers).find(
      (k) => SKILL_TREE_DATA[pathId].tiers[k].tierNumber === tierNumber
    );
    if (!tierKey) {
      showToast(`Ungültige Stufe: ${tierNumber}`, "error");
      return false;
    }

    // Generate unique ID
    const id = `custom_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

    const newSkill = {
      id,
      path: pathId,
      tier: tierNumber,
      name: skillData.name,
      desc: skillData.desc || "Benutzerdefinierter Skill.",
      icon: skillData.icon || "eye",
      cost: skillData.cost || 100,
      unlocked: false,
      req: skillData.req || [],
      isCustom: true,
    };

    setGameState((prev) => ({
      ...prev,
      skills: [...prev.skills, newSkill],
      log: addLogEntry(prev, "SKILL", `Neuer Skill hinzugefügt: "${newSkill.name}" (Pfad: ${pathId}, Stufe: ${tierNumber})`),
    }));

    showToast(`Skill "${newSkill.name}" hinzugefügt!`, "success");
    return newSkill;
  }, [showToast, addLogEntry]);

  // ─── Add Custom Quest ───────────────────────────────────────────
  const addCustomQuest = useCallback((questData) => {
    const id = `custom_quest_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const newQuest = {
      id,
      name: questData.name,
      path: questData.path,
      xp: questData.xp || 30,
      description: questData.description || "",
      isCustom: true,
      completed: false,
      createdAt: new Date().toISOString(),
    };

    setGameState((prev) => {
      const existingCustom = prev.customQuests || [];
      return {
        ...prev,
        customQuests: [...existingCustom, newQuest],
        log: addLogEntry(prev, "SYSTEM", `Neue Quest erstellt: "${newQuest.name}" (${newQuest.path}, ${newQuest.xp} XP)`),
      };
    });

    showToast(`Quest "${newQuest.name}" erstellt!`, "success");
    return newQuest;
  }, [showToast, addLogEntry]);

  // ─── Delete Custom Quest ────────────────────────────────────────
  const deleteCustomQuest = useCallback((questId) => {
    setGameState((prev) => ({
      ...prev,
      customQuests: (prev.customQuests || []).filter((q) => q.id !== questId),
    }));
    showToast("Quest gelöscht.", "info");
  }, [showToast]);

  // ─── Defeat Map Boss ────────────────────────────────────────────
  const defeatMapBoss = useCallback((tileIndex) => {
    setGameState((prev) => {
      const newTiles = [...prev.mapData.tiles];
      const tile = newTiles[tileIndex];
      if (!tile || !tile.mapBoss || tile.mapBoss.defeated) return prev;

      const levelBonus = Math.max(0, prev.level - 1) * 20;
      const bonusXp = 50 + levelBonus;
      const bonusGold = 20 + prev.level * 5;
      const bonusMana = 15 + prev.level * 3;

      newTiles[tileIndex] = {
        ...tile,
        mapBoss: { ...tile.mapBoss, defeated: true },
      };

      return {
        ...prev,
        mapData: { ...prev.mapData, tiles: newTiles },
        gold: prev.gold + bonusGold,
        mana: prev.mana + bonusMana,
        log: addLogEntry(prev, "BOSS", `Map Boss "${tile.mapBoss.name}" auf ${tile.name} besiegt! +${bonusXp} XP, +${bonusGold} Gold, +${bonusMana} Mana.`),
      };
    });

    addXp(50 + Math.max(0, (gameState.level || 1) - 1) * 20);
    showToast("Map Boss besiegt!", "success");
  }, [showToast, addXp, addLogEntry, gameState.level]);

  // ─── Dev Actions ────────────────────────────────────────────────
  const devResetAll = useCallback(() => {
    localStorage.removeItem("tim_life_rpg");
    window.location.reload();
  }, []);

  const devSetLevel = useCallback((level) => {
    setGameState((prev) => ({
      ...prev,
      level,
      xp: 0,
      skillPoints: prev.skillPoints + (level - prev.level) * 150,
      log: addLogEntry(prev, "SYSTEM", `[DEV] Level auf ${level} gesetzt.`),
    }));
    showToast(`Level auf ${level} gesetzt.`, "info");
  }, [showToast, addLogEntry]);

  const devSetResources = useCallback((resources) => {
    setGameState((prev) => {
      const updated = { ...prev };
      if (resources.skillPoints !== undefined) updated.skillPoints = resources.skillPoints;
      if (resources.gold !== undefined) updated.gold = resources.gold;
      if (resources.mana !== undefined) updated.mana = resources.mana;
      if (resources.movementPoints !== undefined) updated.movementPoints = resources.movementPoints;
      updated.log = addLogEntry(prev, "SYSTEM", `[DEV] Ressourcen gesetzt: ${JSON.stringify(resources)}`);
      return updated;
    });
    showToast("Ressourcen aktualisiert.", "info");
  }, [showToast, addLogEntry]);

  const devAddXp = useCallback((amount) => {
    addXp(amount);
    showToast(`+${amount} XP (DEV)`, "info");
  }, [addXp, showToast]);

  const devUnlockAllSkills = useCallback(() => {
    setGameState((prev) => ({
      ...prev,
      skills: prev.skills.map((s) => ({ ...s, unlocked: true })),
      log: addLogEntry(prev, "SYSTEM", "[DEV] Alle Skills freigeschaltet."),
    }));
    showToast("Alle Skills freigeschaltet!", "info");
  }, [showToast, addLogEntry]);

  const devRevealAllTiles = useCallback(() => {
    setGameState((prev) => {
      const newTiles = prev.mapData.tiles.map((t) => ({ ...t, discovered: true }));
      const bonuses = recalcPoiBonuses(newTiles);
      return {
        ...prev,
        mapData: { ...prev.mapData, tiles: newTiles },
        poiBonuses: bonuses,
        log: addLogEntry(prev, "SYSTEM", "[DEV] Alle Kartenfelder aufgedeckt."),
      };
    });
    showToast("Alle Kartenfelder aufgedeckt!", "info");
  }, [showToast, addLogEntry]);

  const devDefeatBoss = useCallback(() => {
    setGameState((prev) => {
      const bossIndex = DAILY_BOSSES.findIndex((b) => b.id === prev.currentBoss.id);
      const nextBossIndex = (bossIndex + 1) % DAILY_BOSSES.length;
      const nextBoss = DAILY_BOSSES[nextBossIndex];
      const defeatedList = [...(prev.defeatedBosses || []), prev.currentBoss.id];
      return {
        ...prev,
        bossHp: nextBoss.maxHp,
        currentBoss: nextBoss,
        defeatedBosses: defeatedList,
        log: addLogEntry(prev, "SYSTEM", `[DEV] Boss "${prev.currentBoss.name}" besiegt.`),
      };
    });
    showToast("Boss besiegt! (DEV)", "info");
  }, [showToast, addLogEntry]);

  // ─── Game Lock State ────────────────────────────────────────────
  const [gameLocked, setGameLocked] = useState(() => {
    // Dev mode overrides lock
    const devMode = localStorage.getItem("tim_life_rpg_dev") === "true";
    if (devMode) return false;
    return isGameLocked();
  });

  const [devMode, setDevMode] = useState(() => {
    return localStorage.getItem("tim_life_rpg_dev") === "true";
  });

  const toggleDevMode = useCallback(() => {
    setDevMode((prev) => {
      const newVal = !prev;
      localStorage.setItem("tim_life_rpg_dev", String(newVal));
      if (newVal) {
        setGameLocked(false);
      } else {
        setGameLocked(isGameLocked());
      }
      return newVal;
    });
  }, []);

  return {
    gameState,
    setGameState,
    addXp,
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
    defeatMapBoss,
    claimTat,
    skillTreeData: SKILL_TREE_DATA,
    toast,
    showToast,
    // Dev actions
    devResetAll,
    devSetLevel,
    devSetResources,
    devAddXp,
    devUnlockAllSkills,
    devRevealAllTiles,
    devDefeatBoss,
    // Lock / dev mode
    gameLocked,
    devMode,
    toggleDevMode,
  };
};
