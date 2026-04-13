import { useState } from "react";

/**
 * Minimal core-logic Hook für XP, Level & Boss-Combat.
 * Kann parallel zum bestehenden useGameState verwendet werden.
 */
const XP_PER_LEVEL_BASE = 100;
const XP_SCALING_FACTOR = 1.5;

function calculateXpThreshold(level) {
  return Math.floor(XP_PER_LEVEL_BASE * Math.pow(XP_SCALING_FACTOR, level - 1));
}

export function useCoreGameState() {
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [isAgentThinking, setIsAgentThinking] = useState(false);
  const [currentBoss, setCurrentBoss] = useState({
    name: "Dämon der Prokrastination",
    hp: 200,
    maxHp: 200,
    path: "socratic",
  });

  const mockBossNames = [
    "Dämon der Prokrastination",
    "Wächter der Ablenkung",
    "Schatten der Zweifel",
    "Herr der Aufschieberei",
    "Nebel der Apathie",
    "Phantom der Perfektion",
    "Golem der Routine",
    "Kreatur der Angst",
    "Erzfeind der Disziplin",
    "Lords des Chaos",
  ];

  function addXp(amount) {
    setXp((prevXp) => {
      let newXp = prevXp + amount;
      setLevel((prevLevel) => {
        let newLevel = prevLevel;
        let threshold = calculateXpThreshold(newLevel);
        while (newXp >= threshold) {
          newXp -= threshold;
          newLevel += 1;
          threshold = calculateXpThreshold(newLevel);
        }
        return newLevel;
      });
      return newXp;
    });
  }

  function attackBoss(damage) {
    if (isAgentThinking) return;

    setCurrentBoss((prev) => {
      const newHp = prev.hp - damage;
      console.log("Boss HP:", newHp);

      if (newHp <= 0) {
        setIsAgentThinking(true);

        const randomName =
          mockBossNames[Math.floor(Math.random() * mockBossNames.length)];
        const newMaxHp = Math.ceil(prev.maxHp * 1.15);

        setTimeout(() => {
          setCurrentBoss({
            name: randomName,
            hp: newMaxHp,
            maxHp: newMaxHp,
            path: "socratic",
          });
          setIsAgentThinking(false);
        }, 2000);

        return { ...prev, hp: 0 };
      }
      return { ...prev, hp: newHp };
    });
  }

  return { xp, level, currentBoss, isAgentThinking, addXp, attackBoss };
}
