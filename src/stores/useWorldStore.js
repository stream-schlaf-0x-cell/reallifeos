import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { playHitSound } from '../engine/audioEngine';
import DAILY_BOSSES from '../data/bosses.json';
import ATTACKS from '../data/attacks.json';
import { generateMap, areHexAdjacent } from '../utils/mapGenerator';

const POI_TABLE = {
  monastery: { label: 'Kloster', icon: 'lotus', bonus: { manaRegen: 2 }, desc: '+2 Mana pro Quest' },
  academy: { label: 'Akademie', icon: 'book', bonus: { goldRegen: 3 }, desc: '+3 Gold pro Quest' },
  gym: { label: 'Trainingslager', icon: 'activity', bonus: { moveRegen: 3 }, desc: '+3 MP pro Quest' },
  studio: { label: 'Studio', icon: 'music', bonus: { manaRegen: 1, goldRegen: 1 }, desc: '+1M & +1G' },
  server: { label: 'Server-Farm', icon: 'server', bonus: { goldRegen: 2, moveRegen: 1 }, desc: '+2G & +1MP' },
  wilds: { label: 'Wildnis', icon: 'zap', bonus: {}, ambush: true, desc: 'Hinterhalt!' },
  nexus: { label: 'Nexus', icon: 'brain', bonus: { manaRegen: 1, goldRegen: 1, moveRegen: 1 }, desc: '+1 All' },
};

/**
 * World Store: Verwaltet Map, Combat, Bosses und World-State
 */
export const useWorldStore = create(
  persist(
    (set, get) => ({
      // ═══════════════════════════════════ STATE ═══════════════════════════════════
      mapData: generateMap(4),
      currentBoss: DAILY_BOSSES[0],
      bossHp: DAILY_BOSSES[0].maxHp,
      playerShield: 0,
      shieldTurnsLeft: 0,
      combatLog: [],
      damageEvents: [],
      lastDamageAmount: 0,
      lastDamageType: '',
      defeatedBosses: [],

      // ═══════════════════════════════════ HELPER ACTIONS ═══════════════════════════════════

      /**
       * Recalculiert POI-Bonuses basierend auf discovered tiles
       */
      recalcPoiBonuses: () => {
        const tiles = get().mapData.tiles || [];
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
      },

      /**
       * Holt POI-Infos für ein Tile
       */
      getPoiInfo: (tileIndex) => {
        const tile = get().mapData.tiles[tileIndex];
        if (!tile) return null;
        return POI_TABLE[tile.type] || null;
      },

      /**
       * Holt verfügbare Kampfaktionen basierend auf Skills
       */
      getAvailableActions: (unlockedSkillIds = []) => {
        const basicActions = ATTACKS.filter((a) => !a.requiresSkill);
        const skillActions = ATTACKS.filter((a) =>
          a.requiresSkill && unlockedSkillIds.includes(a.requiresSkill)
        );
        return [...basicActions, ...skillActions];
      },

      // ═══════════════════════════════════ MAP MECHANICS ═══════════════════════════════════

      /**
       * Enthüllt ein Tile der Karte
       * Kostet 10 MP
       */
      uncoverTile: (tileIndex, playerMp, playerGold) => {
        const UNCOVER_COST = 10;
        if (playerMp < UNCOVER_COST) return { success: false, reason: 'not_enough_mp' };

        set((state) => ({
          mapData: {
            ...state.mapData,
            tiles: state.mapData.tiles.map((t, i) =>
              i === tileIndex ? { ...t, discovered: true } : t
            ),
          },
        }));

        return { success: true };
      },

      /**
       * Schaltet alle Map-Tiles frei (Dev-Mode)
       */
      devRevealAllTiles: () => {
        set((state) => ({
          mapData: {
            ...state.mapData,
            tiles: state.mapData.tiles.map((t) => ({ ...t, discovered: true })),
          },
        }));
      },

      // ═══════════════════════════════════ COMBAT MECHANICS ═══════════════════════════════════

      /**
       * Führt Angriff aus
       * Wird von der Facade genutzt, um auch PlayerStore (resources) zu updaten
       */
      executeAttack: (attack, currentBossHp, playerMana, playerGold) => {
        // Resource check
        if (playerMana < attack.cost.mana || playerGold < attack.cost.gold) {
          return { success: false, reason: 'not_enough_resources' };
        }

        playHitSound();

        let damage = attack.dmg || 0;
        let damageType = attack.type || 'attack';

        // Critical hit multiplier
        if (damageType === 'crit') {
          damage = Math.floor(damage * 2.5);
        }

        const newBossHp = Math.max(0, currentBossHp - damage);
        const isDefeated = newBossHp === 0;

        set((state) => ({
          bossHp: newBossHp,
          lastDamageAmount: damage,
          lastDamageType: damageType,
          combatLog: [
            `${attack.name} vs ${state.currentBoss.name}: ${damage} Schaden`,
            ...state.combatLog,
          ].slice(0, 50),
        }));

        return {
          success: true,
          damage,
          damageType,
          isDefeated,
          resourceCost: attack.cost,
        };
      },

      /**
       * Cleart Damage-Event (nach Animation)
       */
      clearDamageEvent: () => {
        set({
          lastDamageAmount: 0,
          lastDamageType: '',
        });
      },

      /**
       * Setzt Shield auf (falls Skill verwendet wird)
       */
      applyShield: (shieldAmount, duration) => {
        set({
          playerShield: shieldAmount,
          shieldTurnsLeft: duration,
        });
      },

      /**
       * Reduziert Shield-Haltbarkeit um 1 pro Zug
       */
      decrementShield: () => {
        set((state) => ({
          shieldTurnsLeft: Math.max(0, state.shieldTurnsLeft - 1),
          playerShield:
            state.shieldTurnsLeft <= 1 ? 0 : state.playerShield,
        }));
      },

      /**
       * Besiegt den aktuellen Boss und wählt neuen
       */
      defeatBoss: () => {
        const currentBoss = get().currentBoss;
        const nextBossIndex = (DAILY_BOSSES.indexOf(currentBoss) + 1) % DAILY_BOSSES.length;
        const nextBoss = DAILY_BOSSES[nextBossIndex];

        set((state) => ({
          currentBoss: nextBoss,
          bossHp: nextBoss.maxHp,
          defeatedBosses: [...state.defeatedBosses, currentBoss],
          combatLog: [`Boss besiegt: ${currentBoss.name}`, ...state.combatLog].slice(0, 50),
        }));
      },

      /**
       * Besiegt einen Map-Boss (auf spezifischem Tile)
       */
      defeatMapBoss: (tileIndex) => {
        set((state) => ({
          mapData: {
            ...state.mapData,
            tiles: state.mapData.tiles.map((t, i) =>
              i === tileIndex && t.mapBoss
                ? { ...t, mapBoss: { ...t.mapBoss, defeated: true } }
                : t
            ),
          },
        }));
      },

      // ═══════════════════════════════════ DEV TOOLS ═══════════════════════════════════

      /**
       * Besiegt aktuellen Boss sofort (Dev-Mode)
       */
      devDefeatBoss: () => {
        get().defeatBoss();
      },

      /**
       * Setzt Boss/Map zurück (Dev-Mode)
       */
      devResetWorld: () => {
        set({
          mapData: generateMap(4),
          currentBoss: DAILY_BOSSES[0],
          bossHp: DAILY_BOSSES[0].maxHp,
          playerShield: 0,
          shieldTurnsLeft: 0,
          combatLog: [],
          damageEvents: [],
          lastDamageAmount: 0,
          lastDamageType: '',
          defeatedBosses: [],
        });
      },
    }),
    {
      name: 'world-store',
      // Migration wird in der Facade gehandhabt
    }
  )
);
