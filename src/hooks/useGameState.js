import { useState, useEffect } from "react";
import INITIAL_SKILLS from "../data/skills.json";
import DAILY_BOSSES from "../data/bosses.json";
import INITIAL_MAP_DATA from "../data/map.json";
import { playLevelUpSound, playUnlockSound, playHitSound } from "../engine/audioEngine";

const getResourceRewards = (path) => {
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

export const useGameState = () => {
  const [gameState, setGameState] = useState(() => {
    const saved = localStorage.getItem("tim_life_rpg");
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...parsed,
        movementPoints: parsed.movementPoints || 0,
        gold: parsed.gold || 0,
        mana: parsed.mana || 0,
        mapData: parsed.mapData || INITIAL_MAP_DATA,
        bossHp: parsed.bossHp ?? DAILY_BOSSES[0].maxHp,
        currentBoss: parsed.currentBoss || DAILY_BOSSES[0],
      };
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
    };
  });

  const [toast, setToast] = useState(null);

  useEffect(() => {
    localStorage.setItem("tim_life_rpg", JSON.stringify(gameState));
  }, [gameState]);

  const showToast = (msg, type = "info") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const addXp = (amount) => {
    let newXp = gameState.xp + amount;
    let newLevel = gameState.level;
    let newPoints = gameState.skillPoints;
    let leveledUp = false;

    while (newXp >= Math.floor(100 * Math.pow(1.5, newLevel - 1))) {
      newXp -= Math.floor(100 * Math.pow(1.5, newLevel - 1));
      newLevel++;
      newPoints += 150;
      leveledUp = true;
    }

    setGameState((prev) => ({
      ...prev,
      xp: newXp,
      level: newLevel,
      skillPoints: newPoints,
    }));

    if (leveledUp) {
      playLevelUpSound();
      showToast(`Level Up! Du bist jetzt Level ${newLevel}. +150 Skillpunkte!`, "success");
    }
  };

  const handleQuestComplete = (quest) => {
    const rewards = getResourceRewards(quest.path);

    const logEntry = `[${new Date().toLocaleTimeString()}] Quest: ${quest.name} | +${quest.xp} XP, +${rewards.move} MP, +${rewards.gold} Gold, +${rewards.mana} Mana.`;

    setGameState((prev) => ({
      ...prev,
      movementPoints: prev.movementPoints + rewards.move,
      gold: prev.gold + rewards.gold,
      mana: prev.mana + rewards.mana,
      log: [logEntry, ...prev.log].slice(0, 10),
    }));
    
    addXp(quest.xp);
    showToast(`Ressourcen erhalten! +${quest.xp} XP`);
  };

  const executeAttack = (attack) => {
    if (gameState.mana < attack.cost.mana || gameState.gold < attack.cost.gold) {
      showToast("Nicht genügend Ressourcen für diesen Angriff!", "error");
      return;
    }

    playHitSound();

    let newBossHp = gameState.bossHp - attack.dmg;
    if (newBossHp < 0) newBossHp = 0; // Prevent dying logic (we keep it simple for now, boss just respawns or stays 0)

    const logEntry = `[${new Date().toLocaleTimeString()}] Angriff: ${attack.name} | -${attack.dmg} HP, -${attack.cost.mana} Mana, -${attack.cost.gold} Gold.`;

    if (newBossHp <= 0) {
      playLevelUpSound();
      const nextBossIndex = (DAILY_BOSSES.findIndex((b) => b.id === gameState.currentBoss.id) + 1) % DAILY_BOSSES.length;
      const nextBoss = DAILY_BOSSES[nextBossIndex];

      setGameState((prev) => ({
        ...prev,
        mana: prev.mana - attack.cost.mana,
        gold: prev.gold - attack.cost.gold,
        bossHp: nextBoss.maxHp,
        currentBoss: nextBoss,
        log: [
          logEntry,
          `🔥 Boss ${prev.currentBoss.name} besiegt! +100 Bonus XP!`,
          ...prev.log,
        ].slice(0, 10),
      }));
      addXp(100);
      showToast(`Boss besiegt! Nächster Boss: ${nextBoss.name}`, "success");
    } else {
      setGameState((prev) => ({
        ...prev,
        mana: prev.mana - attack.cost.mana,
        gold: prev.gold - attack.cost.gold,
        bossHp: newBossHp,
        log: [logEntry, ...prev.log].slice(0, 10),
      }));
      showToast(`Angriff erfolgreich! -${attack.dmg} HP`);
    }
  };

  const unlockSkill = (skillId) => {
    const skill = gameState.skills.find((s) => s.id === skillId);
    if (!skill || skill.unlocked) return;

    const reqsMet = skill.req.every((reqId) => {
      const reqSkill = gameState.skills.find((s) => s.id === reqId);
      return reqSkill && reqSkill.unlocked;
    });

    if (!reqsMet) {
      showToast("Voraussetzungen nicht erfüllt!", "error");
      return false;
    }

    if (gameState.skillPoints < skill.cost) {
      showToast("Nicht genügend Skillpunkte!", "error");
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
  };
  
  const uncoverTile = (tileIndex) => {
    const COST = 10;
    if (gameState.movementPoints < COST) {
      showToast(`Nicht genügend MP! Kostet ${COST} MP.`, "error");
      return;
    }
    
    setGameState(prev => {
        const newTiles = [...prev.mapData.tiles];
        newTiles[tileIndex] = { ...newTiles[tileIndex], discovered: true };
        
        return {
            ...prev,
            movementPoints: prev.movementPoints - COST,
            mapData: {
                ...prev.mapData,
                tiles: newTiles
            },
            log: [
                `[${new Date().toLocaleTimeString()}] Map Tile entdeckt. -${COST} MP.`,
                ...prev.log,
            ].slice(0, 10),
        }
    });
    
    showToast("Neues Gebiet entdeckt!", "success");
  };

  return {
    gameState,
    setGameState, // Exporting just in case, but better to use specific actions
    addXp,
    handleQuestComplete,
    executeAttack,
    unlockSkill,
    uncoverTile,
    toast,
    showToast
  };
};