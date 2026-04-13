import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { playHitSound } from '../engine/audioEngine';
import DAILY_BOSSES from '../data/bosses.json';
import ATTACKS from '../data/attacks.json';
import { generateMap } from '../utils/mapGenerator';
import BIOMES from '../data/biomes.json';

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
 * World Store: Verwaltet Map, Combat, Bosses, Biome-Evolution und World-State
 * 
 * ═══════════════════════════════════════════════════════════════════════
 * EVOLVING WORLD ARCHITECTURE:
 * - worldState tracked globalen Fortschritt (biome, discoveredTiles, defeatedBosses)
 * - Fog of War: Nur Start-Tile sichtbar, benachbarte Tiles werden entdeckt
 * - Biome-System: Beim Betreten neuer Tiles kann ein Biom-Wechsel trigger
 * - Persistence: Server-Sync über Facade, Frontend lädt Zustand vom Relay
 * ═══════════════════════════════════════════════════════════════════════
 */
export const useWorldStore = create(
  persist(
    (set, get) => ({
      // ═══════════════════════════════════ STATE ═══════════════════════════════════
      
      /**
       * worldState: Globaler Welt-Zustand für Biome-Tracking & Persistence
       */
      worldState: {
        currentBiome: 'default',
        discoveredTileCount: 1,
        totalTiles: 61,
        biomeTransitionCount: 0,
        lastBiomeTriggerCoords: null,
        serverSynced: false,
        lastSaveTimestamp: null,
      },

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
       * Enthüllt ein Tile der Karte (Fog of War)
       * Kostet 10 MP
       * 
       * EVOLVING WORLD:
       * - Nur Tiles adjacent zu bereits entdeckten Tiles können aufgedeckt werden
       * - Triggert Biome-Check und Server-Sync
       */
      // eslint-disable-next-line no-unused-vars
      uncoverTile: (tileIndex, playerMp, _playerGold) => {
        const UNCOVER_COST = 10;
        if (playerMp < UNCOVER_COST) return { success: false, reason: 'not_enough_mp' };

        const tile = get().mapData.tiles[tileIndex];
        if (!tile) return { success: false, reason: 'invalid_tile' };
        
        // Fog of War: Check if adjacent to any discovered tile
        const isAdjacentToDiscovered = get().mapData.tiles.some(
          (t, i) => t.discovered && i !== tileIndex && get().areHexAdjacent(t, tile)
        );
        
        // Allow uncovering if adjacent OR if it's the starting tile
        const isStartingTile = tile.q === 0 && tile.r === 0;
        if (!isAdjacentToDiscovered && !isStartingTile && !tile.discovered) {
          return { success: false, reason: 'fog_of_war_not_adjacent' };
        }

        set((state) => {
          const newDiscoveredCount = state.mapData.tiles.filter(
            (t, i) => t.discovered || i === tileIndex
          ).length;

          return {
            mapData: {
              ...state.mapData,
              tiles: state.mapData.tiles.map((t, i) =>
                i === tileIndex ? { ...t, discovered: true } : t
              ),
            },
            worldState: {
              ...state.worldState,
              discoveredTileCount: newDiscoveredCount,
              lastSaveTimestamp: Date.now(),
            },
          };
        });

        return { success: true };
      },

      /**
       * Aktualisiert den worldState mit Server-Sync Info
       */
      updateWorldState: (updates) => {
        set((state) => ({
          worldState: {
            ...state.worldState,
            ...updates,
            lastSaveTimestamp: Date.now(),
          },
        }));
      },

      /**
       * Lädt externen worldState vom Server (wird von Facade aufgerufen)
       */
      loadWorldState: (serverState) => {
        if (!serverState) return;
        
        set((state) => ({
          worldState: {
            ...state.worldState,
            ...serverState,
            serverSynced: true,
            lastSaveTimestamp: Date.now(),
          },
        }));
      },

      // ═══════════════════════════════════ BIOME MECHANICS ═══════════════════════════════════

      /**
       * Prüft ob ein Biom-Wechsel notwendig ist basierend auf entdeckten Tiles
       * 
       * LOGIK:
       * - Zähle entdeckte Tiles pro Biom-Typ (via tileDistribution)
       * - Wenn Schwellenwert erreicht → triggerBiomeTransition
       */
      checkBiomeTransition: (tileIndex) => {
        const tile = get().mapData.tiles[tileIndex];
        if (!tile || !tile.discovered) return { shouldTransition: false };

        const currentBiome = get().worldState.currentBiome;
        const biomeConfig = BIOMES[currentBiome];
        if (!biomeConfig) return { shouldTransition: false };

        // Check if we should transition to a different biome
        // This is triggered when player discovers enough tiles in current biome
        const discoveredTiles = get().mapData.tiles.filter(t => t.discovered);
        const discoveredCount = discoveredTiles.length;

        // Simple threshold-based transition: after N tiles, try to evolve
        if (discoveredCount >= biomeConfig.triggerThreshold) {
          return {
            shouldTransition: true,
            currentBiome,
            tileCoords: { q: tile.q, r: tile.r },
            discoveredCount,
          };
        }

        return { shouldTransition: false };
      },

      /**
       * Wechselt zu einem neuen Biom (wird von Facade nach Server-Request aufgerufen)
       */
      transitionBiome: (newBiomeId, newMapData, newBosses) => {
        if (!BIOMES[newBiomeId]) {
          console.warn(`[Biome] Unknown biome: ${newBiomeId}, keeping current`);
          return { success: false };
        }

        set((state) => ({
          worldState: {
            ...state.worldState,
            currentBiome: newBiomeId,
            biomeTransitionCount: state.worldState.biomeTransitionCount + 1,
            lastBiomeTriggerCoords: state.worldState.lastBiomeTriggerCoords,
            lastSaveTimestamp: Date.now(),
          },
          mapData: newMapData || state.mapData,
          currentBoss: newBosses?.[0] || state.currentBoss,
          bossHp: newBosses?.[0]?.maxHp || state.bossHp,
        }));

        console.log(`[Biome] Transitioned to: ${BIOMES[newBiomeId].name}`);
        return { success: true, biome: BIOMES[newBiomeId] };
      },

      /**
       * Holt aktuelles Biom-Info
       */
      getCurrentBiome: () => {
        const biomeId = get().worldState.currentBiome;
        return BIOMES[biomeId] || BIOMES.default;
      },

      /**
       * Prüft ob ein Tile adjacent zu einem anderen ist (für Fog of War)
       */
      areHexAdjacent: (a, b) => {
        const dq = Math.abs(a.q - b.q);
        const dr = Math.abs(a.r - b.r);
        const ds = Math.abs((a.q + a.r) - (b.q + b.r));
        return Math.max(dq, dr, ds) === 1;
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
          defeatedBosses: [
            ...state.defeatedBosses,
            state.mapData.tiles[tileIndex]?.mapBoss?.id,
          ].filter(Boolean),
        }));
      },

      /**
       * Fügt einen neuen Hex-Ring an die bestehende Map an (Infinite Map).
       * Wird automatisch aufgerufen wenn sich der Spieler dem Kartenrand nähert.
       */
      addRingToMap: (ringRadius) => {
        // Hex-Ring-Koordinaten generieren (gleiche Logik wie mapGenerator)
        const newHexes = [];
        if (ringRadius === 0) {
          newHexes.push({ q: 0, r: 0 });
        } else {
          let q = 0;
          let r = -ringRadius;
          const directions = [
            { dq: 1, dr: 0 }, { dq: 0, dr: 1 }, { dq: -1, dr: 1 },
            { dq: -1, dr: 0 }, { dq: 0, dr: -1 }, { dq: 1, dr: -1 },
          ];
          for (let i = 0; i < 6; i++) {
            for (let j = 0; j < ringRadius; j++) {
              newHexes.push({ q, r });
              q += directions[i].dq;
              r += directions[i].dr;
            }
          }
        }

        // Prüfe welche Tiles bereits existieren
        const existingTiles = get().mapData.tiles;
        const existingSet = new Set(existingTiles.map(t => `${t.q},${t.r}`));

        // POI-Typ gewichtet wählen
        const POI_TYPES = [
          { type: 'nexus', weight: 3 }, { type: 'monastery', weight: 15 },
          { type: 'academy', weight: 15 }, { type: 'gym', weight: 12 },
          { type: 'studio', weight: 10 }, { type: 'server', weight: 10 },
          { type: 'wilds', weight: 35 },
        ];
        const totalWeight = POI_TYPES.reduce((s, p) => s + p.weight, 0);

        const newTiles = newHexes
          .filter(h => !existingSet.has(`${h.q},${h.r}`))
          .map((coord) => {
            // Gewichtete Zufallsauswahl
            let rand = Math.random() * totalWeight;
            let tileType = 'wilds';
            for (const poi of POI_TYPES) {
              rand -= poi.weight;
              if (rand <= 0) { tileType = poi.type; break; }
            }

            const POI_NAMES = {
              nexus: ['Kristalliner Nexus', 'Quelle der Klarheit'],
              monastery: ['Tempel der Stille', 'Kloster des Erwachens', 'Halle der Achtsamkeit'],
              academy: ['Sokratische Akademie', 'Halle der Dialektik', 'Athenäum der Ethik'],
              gym: ['Eisenhalle', 'Arena der Disziplin', 'Tempel der Physis'],
              studio: ['Klanglabor', 'Studio der Resonanz', 'Frequenz-Schmiede'],
              server: ['Docker Core', 'Server-Farm Alpha', 'Node der Automation'],
              wilds: ['Unbekanntes Gebiet', 'Nebel der Täuschung', 'Dschungel der Ablenkung',
                       'Schlucht der Prokrastination', 'Sumpf der Lethargie'],
            };
            const names = POI_NAMES[tileType] || POI_NAMES.wilds;

            return {
              q: coord.q,
              r: coord.r,
              type: tileType,
              name: names[Math.floor(Math.random() * names.length)],
              discovered: false,
              generating: false,
              mapBoss: tileType === 'wilds' && Math.random() < 0.15
                ? {
                    id: `map_boss_${Date.now()}_${coord.q}_${coord.r}`,
                    name: 'Wächter der Wildnis',
                    type: 'Wildnis',
                    maxHp: 100 + ringRadius * 20,
                    currentHp: 100 + ringRadius * 20,
                    defeated: false,
                  }
                : null,
            };
          });

        if (newTiles.length === 0) return;

        set((state) => ({
          mapData: {
            ...state.mapData,
            tiles: [...existingTiles, ...newTiles],
          },
          worldState: {
            ...state.worldState,
            totalTiles: state.mapData.tiles.length + newTiles.length,
          },
        }));

        console.log(`[InfiniteMap] Added ${newTiles.length} tiles for ring ${ringRadius}`);
      },

      // ═══════════════════════════════════ DEV TOOLS ═══════════════════════════════════

      /**
       * Besiegt aktuellen Boss sofort (Dev-Mode)
       */
      devDefeatBoss: () => {
        get().defeatBoss();
      },

      /**
       * Setzt alle Map-Tiles frei (Dev-Mode)
       */
      devRevealAllTiles: () => {
        set((state) => ({
          mapData: {
            ...state.mapData,
            tiles: state.mapData.tiles.map((t) => ({ ...t, discovered: true })),
          },
          worldState: {
            ...state.worldState,
            discoveredTileCount: state.mapData.tiles.length,
          },
        }));
      },

      /**
       * Setzt Boss/Map zurück (Dev-Mode)
       */
      devResetWorld: () => {
        set({
          worldState: {
            currentBiome: 'default',
            discoveredTileCount: 1,
            totalTiles: 61,
            biomeTransitionCount: 0,
            lastBiomeTriggerCoords: null,
            serverSynced: false,
            lastSaveTimestamp: null,
          },
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
