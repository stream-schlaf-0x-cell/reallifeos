import { useState, useEffect, useCallback } from "react";
import INITIAL_SKILLS from "../data/skills.json";
import DAILY_BOSSES from "../data/bosses.json";
import INITIAL_MAP_DATA from "../data/map.json";
import ATTACKS from "../data/attacks.json";
import { playLevelUpSound, playUnlockSound, playHitSound } from "../engine/audioEngine";

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
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...parsed,
          movementPoints: parsed.movementPoints || 0,
          gold: parsed.gold || 0,
          mana: parsed.mana || 0,
          mapData: parsed.mapData || INITIAL_MAP_DATA,
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
        };
      } catch {
        // corrupted save – fall through
      }
    }
    return {
      level: 1,
      xp: 0,
      skillPoints: 0,
      skills: INITIAL_SKILLS,
      currentBoss: DAILY_BOSSES[0],
      bossHp: DAILY_BOSSES[0].maxHp,
      day: new Date().toLocaleDateString(),
      log: [],
      movementPoints: 0,
      gold: 0,
      mana: 0,
      mapData: INITIAL_MAP_DATA,
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

        return { ...prev, xp: newXp, level: newLevel, skillPoints: newPoints };
      });
    },
    [showToast]
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

        const logEntry = `[${new Date().toLocaleTimeString()}] Quest: ${quest.name} | +${quest.xp} XP, +${totalMove} MP, +${totalGold} Gold, +${totalMana} Mana.`;

        return {
          ...prev,
          movementPoints: prev.movementPoints + totalMove,
          gold: prev.gold + totalGold,
          mana: prev.mana + totalMana,
          poiBonuses: bonuses,
          log: [logEntry, ...prev.log].slice(0, 10),
        };
      });

      addXp(quest.xp);
      showToast(`Ressourcen erhalten! +${quest.xp} XP`, "success");
    },
    [addXp, showToast]
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
          const skill = prev.skills.find((s) => s.id === attack.requiresSkill);
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
            log: [
              logEntry,
              `🔥 Boss ${prev.currentBoss.name} besiegt! +100 Bonus XP!`,
              ...prev.log,
            ].slice(0, 10),
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
          log: [logEntry, ...prev.log].slice(0, 10),
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
    [showToast]
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
        log: [
          `[${new Date().toLocaleTimeString()}] Skill freigeschaltet: ${skill.name}`,
          ...prev.log,
        ].slice(0, 10),
      }));
      showToast(`Skill freigeschaltet: ${skill.name}!`, "success");
      return true;
    },
    [gameState.skills, gameState.skillPoints, showToast]
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

        newTiles[tileIndex] = { ...tile, discovered: true };

        const bonuses = recalcPoiBonuses(newTiles);
        const poi = POI_TABLE[tile.type];
        let extraLog = `Tile entdeckt: ${poi?.label || tile.type}.`;
        let ambushTriggered = false;

        // Check for ambush
        if (poi?.ambush) {
          extraLog += " ⚠️ HINTERHALT!";
          ambushTriggered = true;
        }

        return {
          ...prev,
          movementPoints: prev.movementPoints - UNCOVER_COST,
          mapData: { ...prev.mapData, tiles: newTiles },
          poiBonuses: bonuses,
          combatLog: ambushTriggered
            ? [`⚠️ Hinterhalt auf ${tile.name}! Kampf beginnt!`, ...prev.combatLog].slice(0, 30)
            : prev.combatLog,
          log: [
            `[${new Date().toLocaleTimeString()}] ${extraLog} -${UNCOVER_COST} MP.`,
            ...prev.log,
          ].slice(0, 10),
        };
      });

      showToast("Neues Gebiet entdeckt!", "success");
    },
    [showToast]
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
    toast,
    showToast,
  };
};
