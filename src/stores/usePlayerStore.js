import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { playLevelUpSound, playUnlockSound } from '../engine/audioEngine';

/**
 * Player Store: Verwaltet Level, XP, Ressourcen, Quests und Aktivitätsprotokoll
 */
export const usePlayerStore = create(
  persist(
    (set, get) => ({
      // ═══════════════════════════════════ STATE ═══════════════════════════════════
      level: 1,
      xp: 0,
      skillPoints: 0,
      movementPoints: 0,
      gold: 0,
      mana: 0,
      customQuests: [],
      log: [],
      poiBonuses: { manaRegen: 0, goldRegen: 0, moveRegen: 0 },
      toast: null,
      day: new Date().toLocaleDateString(),

      // ═══════════════════════════════════ HELPERS ═══════════════════════════════════
      showToast: (msg, type = 'info') => {
        set({ toast: { msg, type } });
        setTimeout(() => set({ toast: null }), 3000);
      },

      addLogEntry: (type, message) => {
        set((state) => ({
          log: [
            {
              timestamp: new Date().toISOString(),
              time: new Date().toLocaleTimeString(),
              type,
              message,
            },
            ...state.log,
          ].slice(0, 100),
        }));
      },

      // ═══════════════════════════════════ PROGRESSIVE MECHANICS ═══════════════════════════════════
      /**
       * Addiert XP und triggert Level-ups.
       * Kann mehrfache Level in einer Call möglich machen.
       */
      addXp: (amount) => {
        set((state) => {
          let newXp = state.xp + amount;
          let newLevel = state.level;
          let newPoints = state.skillPoints;
          let leveledUp = false;

          while (newXp >= Math.floor(100 * Math.pow(1.5, newLevel - 1))) {
            newXp -= Math.floor(100 * Math.pow(1.5, newLevel - 1));
            newLevel++;
            newPoints += 150;
            leveledUp = true;
          }

          if (leveledUp) {
            playLevelUpSound();
            setTimeout(
              () =>
                get().showToast(
                  `Level Up! Du bist jetzt Level ${newLevel}. +150 Skillpunkte!`,
                  'success'
                ),
              0
            );
          }

          const newState = { xp: newXp, level: newLevel, skillPoints: newPoints };
          if (leveledUp) {
            setTimeout(() => {
              get().addLogEntry('LEVEL', `Level Up! Jetzt Level ${newLevel}. +150 SP.`);
            }, 0);
          }
          return newState;
        });
      },

      // ═══════════════════════════════════ QUEST MECHANICS ═══════════════════════════════════

      /**
       * Addiert custom Quest zur Liste (wird in Facade genutzt)
       */
      addCustomQuest: (name, path, xp, description = '') => {
        const id = `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        set((state) => ({
          customQuests: [
            {
              id,
              name,
              path,
              xp,
              description,
              completed: false,
            },
            ...state.customQuests,
          ],
        }));
        get().showToast(`Quest erstellt: "${name}"`, 'success');
      },

      /**
       * Löscht eine custom Quest
       */
      deleteCustomQuest: (questId) => {
        set((state) => ({
          customQuests: state.customQuests.filter((q) => q.id !== questId),
        }));
      },

      /**
       * Markiert Quest als complete + gibt Rewards
       * Wird von der Facade mit POI-Bonuses genutzt
       */
      complainQuestComplete: (quest, poiBonuses = { manaRegen: 0, goldRegen: 0, moveRegen: 0 }) => {
        const getResourceRewards = (path) => {
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

        const baseRewards = getResourceRewards(quest.path);
        const totalMove = baseRewards.move + poiBonuses.moveRegen;
        const totalGold = baseRewards.gold + poiBonuses.goldRegen;
        const totalMana = baseRewards.mana + poiBonuses.manaRegen;

        set((state) => ({
          movementPoints: state.movementPoints + totalMove,
          gold: state.gold + totalGold,
          mana: state.mana + totalMana,
          poiBonuses,
          customQuests: state.customQuests.map((q) =>
            q.id === quest.id ? { ...q, completed: true, completedAt: new Date().toISOString() } : q
          ),
        }));

        get().addXp(quest.xp);
        get().showToast(`Ressourcen erhalten! +${quest.xp} XP`, 'success');
      },

      /**
       * claimTat: alternate name for quest completion (from original code)
       */
      claimTat: (questId) => {
        const quest = get().customQuests.find((q) => q.id === questId);
        if (quest && !quest.completed) {
          get().complainQuestComplete(quest, get().poiBonuses);
        }
      },

      // ═══════════════════════════════════ DEV TOOLS ═══════════════════════════════════

      devSetLevel: (level) => {
        set({ level: Math.max(1, level) });
        get().showToast(`Level gesetzt auf ${level}`, 'info');
      },

      devSetResources: (resources) => {
        set({
          skillPoints: Math.max(0, resources.skillPoints || 0),
          gold: Math.max(0, resources.gold || 0),
          mana: Math.max(0, resources.mana || 0),
          movementPoints: Math.max(0, resources.movementPoints || 0),
        });
        get().showToast('Ressourcen aktualisiert', 'info');
      },

      devAddXp: (amount) => {
        get().addXp(amount);
        get().showToast(`+${amount} XP hinzugefügt`, 'info');
      },

      devResetResources: () => {
        set({
          level: 1,
          xp: 0,
          skillPoints: 0,
          movementPoints: 0,
          gold: 0,
          mana: 0,
        });
        get().showToast('Ressourcen zurückgesetzt', 'warning');
      },

      setPoiBonuses: (bonuses) => {
        set({ poiBonuses: bonuses });
      },

      // ═══════════════════════════════════ RESET ═══════════════════════════════════
      devResetAll: () => {
        set({
          level: 1,
          xp: 0,
          skillPoints: 0,
          movementPoints: 0,
          gold: 0,
          mana: 0,
          customQuests: [],
          log: [],
          poiBonuses: { manaRegen: 0, goldRegen: 0, moveRegen: 0 },
          day: new Date().toLocaleDateString(),
        });
        get().showToast('Kompletter Reset durchgeführt!', 'warning');
      },
    }),
    {
      name: 'player-store',
      // Wir don't persist einzeln; Migration wird in der Facade gehandhabt
    }
  )
);
