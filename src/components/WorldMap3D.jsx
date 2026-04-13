import React, { useCallback, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useWorldStore } from '../stores/useWorldStore';
import { useBiomeColors } from '../hooks/useBiomeColors';
import { ErrorBoundary } from './ErrorBoundary';
import HexTile from './HexTile';
import TileBillboard from './TileBillboard';

const UNCOVER_COST = 10;

/**
 * WorldMap3D – Vollständige 3D-Weltkarte mit react-three-fiber.
 *
 * Ersetzt die alte 2D-SVG WorldMap. Liest Daten direkt aus useWorldStore
 * und rendert eine rotierbare, zoombare Hexagon-Landschaft.
 */
export default function WorldMap3D() {
  const tiles = useWorldStore((state) => state.mapData.tiles);
  const playerPos = useWorldStore((state) => state.mapData.playerPosition);
  const worldState = useWorldStore((state) => state.worldState);
  const recalcPoiBonuses = useWorldStore((state) => state.recalcPoiBonuses);

  // Memoized POI bonuses
  const poiBonuses = useMemo(() => recalcPoiBonuses(), [recalcPoiBonuses]);

  const colors = useBiomeColors();

  // Biome info
  const biomeInfo = worldState?.currentBiome || 'default';
  const biomeName = typeof biomeInfo === 'object' ? biomeInfo.name : biomeInfo;
  const serverSynced = worldState?.serverSynced || false;

  // Stats
  const discoveredCount = tiles.filter((t) => t.discovered).length;
  const totalCount = tiles.length;
  const generatingCount = tiles.filter((t) => t.generating).length;
  const bossTiles = tiles.filter((t) => t.mapBoss && !t.mapBoss.defeated);

  // Tile-Click Handler – stabil ohne tiles Dependency
  const handleTileClick = useCallback(
    (index) => {
      const currentTiles = useWorldStore.getState().mapData.tiles;
      const tile = currentTiles[index];
      if (tile && !tile.discovered && !tile.generating) {
        useWorldStore.getState().uncoverTile(index);
      }
    },
    []
  );

  // Boss-Click Handler – stabil ohne tiles Dependency
  const handleBossClick = useCallback(
    (tileIndex) => {
      const currentTiles = useWorldStore.getState().mapData.tiles;
      const tile = currentTiles[tileIndex];
      if (tile?.mapBoss && !tile.mapBoss.defeated) {
        if (window.confirm(`⚔️ ${tile.mapBoss.name} angreifen?`)) {
          useWorldStore.getState().defeatMapBoss(tileIndex);
        }
      }
    },
    []
  );

  // Tiles mit Index anreichern
  const tilesWithIndex = useMemo(
    () => tiles.map((t, i) => ({ ...t, index: i })),
    [tiles]
  );

  return (
    <div
      className="h-full rounded-3xl p-4 flex flex-col overflow-hidden relative"
      style={{
        backgroundColor: 'rgba(2, 6, 23, 0.6)',
        border: '1px solid var(--border-primary)',
      }}
    >
      {/* ─── Header ─────────────────────────────────────────────────── */}
      <div className="flex justify-between items-center mb-4 z-10">
        <h2
          className="text-lg md:text-xl font-bold flex items-center gap-2"
          style={{ color: 'var(--path-monk)' }}
        >
          🗺️ Archipel des Geistes
        </h2>
        <div
          className="text-[10px] md:text-xs font-mono flex items-center gap-2"
          style={{ color: 'var(--text-secondary)' }}
        >
          <span
            className="flex items-center gap-1 px-2 py-0.5 rounded-full"
            style={{
              backgroundColor: 'rgba(139, 92, 246, 0.1)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              color: 'var(--accent-primary)',
            }}
          >
            🌍 {biomeName}
          </span>
          {serverSynced && (
            <span title="Mit Server synchronisiert" style={{ color: 'var(--resource-mana)' }}>
              ☁️
            </span>
          )}
          <span>
            {discoveredCount}/{totalCount} entdeckt • {bossTiles.length} Boss active
            {generatingCount > 0 && (
              <span className="ml-2" style={{ color: 'var(--accent-primary)' }}>
                {generatingCount} generierend...
              </span>
            )}
          </span>
        </div>
      </div>

      {/* ─── POI Bonuses Bar ────────────────────────────────────────── */}
      {poiBonuses &&
        (poiBonuses.manaRegen > 0 ||
          poiBonuses.goldRegen > 0 ||
          poiBonuses.moveRegen > 0) && (
          <div className="flex flex-wrap gap-2 mb-3 z-10">
            {poiBonuses.manaRegen > 0 && (
              <div
                className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs"
                style={{
                  backgroundColor: 'rgba(59, 130, 246, 0.1)',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                }}
              >
                <span style={{ color: 'var(--resource-mana)' }} className="font-mono">
                  💎 +{poiBonuses.manaRegen} Mana/Quest
                </span>
              </div>
            )}
            {poiBonuses.goldRegen > 0 && (
              <div
                className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs"
                style={{
                  backgroundColor: 'rgba(234, 179, 8, 0.1)',
                  border: '1px solid rgba(234, 179, 8, 0.3)',
                }}
              >
                <span style={{ color: 'var(--resource-gold)' }} className="font-mono">
                  🪙 +{poiBonuses.goldRegen} Gold/Quest
                </span>
              </div>
            )}
            {poiBonuses.moveRegen > 0 && (
              <div
                className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs"
                style={{
                  backgroundColor: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                }}
              >
                <span style={{ color: 'var(--resource-mp)' }} className="font-mono">
                  ⚡ +{poiBonuses.moveRegen} MP/Quest
                </span>
              </div>
            )}
          </div>
        )}

      {/* ─── 3D Canvas ─────────────────────────────────────────────── */}
      <div
        className="flex-1 relative overflow-hidden rounded-2xl border"
        style={{
          backgroundColor: 'rgba(2, 6, 23, 0.5)',
          borderColor: 'var(--border-secondary)',
        }}
      >
        <ErrorBoundary>
          <Canvas
            camera={{ position: [0, 18, 18], fov: 45, near: 0.1, far: 200 }}
            style={{ width: '100%', height: '100%' }}
            dpr={[1, 2]}
          >
          {/* Licht */}
          <ambientLight intensity={0.4} color="#c8d6e5" />
          <directionalLight
            position={[10, 20, 10]}
            intensity={0.8}
            color="#fff4e6"
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
          />
          <pointLight position={[-10, 8, -10]} intensity={0.3} color="#8b5cf6" />

          {/* Nebel für Fog of War Atmosphäre */}
          <fog attach="fog" args={['#020617', 15, 40]} />

          {/* Hintergrund */}
          <color attach="background" args={['#020617']} />

          {/* Boden-Grid als visuelle Referenz */}
          <gridHelper args={[60, 60, '#1e293b22', '#1e293b11']} position={[0, -3.1, 0]} />

          {/* Hex-Tiles */}
          {tilesWithIndex.map((tile) => {
            const isPlayerHere =
              playerPos.q === tile.q && playerPos.r === tile.r;
            return (
              <React.Fragment key={tile.index}>
                <HexTile
                  tile={tile}
                  colors={colors}
                  isPlayerHere={isPlayerHere}
                  onClick={handleTileClick}
                />
                {(tile.discovered || tile.generating) && (
                  <TileBillboard
                    tile={tile}
                    colors={colors}
                    isPlayerHere={isPlayerHere}
                    onBossClick={handleBossClick}
                  />
                )}
              </React.Fragment>
            );
          })}

          {/* Kamera-Steuerung */}
          <OrbitControls
            enableDamping
            dampingFactor={0.08}
            minDistance={8}
            maxDistance={45}
            maxPolarAngle={Math.PI / 2.2}
            minPolarAngle={Math.PI / 6}
            target={[0, 0, 0]}
            rotateSpeed={0.5}
            zoomSpeed={0.8}
            panSpeed={0.5}
          />
        </Canvas>
        </ErrorBoundary>

        {/* ─── Info Overlay ──────────────────────────────────────── */}
        <div
          className="absolute bottom-4 left-4 p-3 md:p-4 rounded-xl border backdrop-blur-sm max-w-[220px] md:max-w-xs pointer-events-none"
          style={{
            backgroundColor: 'rgba(2, 6, 23, 0.8)',
            borderColor: 'var(--border-primary)',
          }}
        >
          <h3
            className="font-bold text-sm md:text-base mb-1"
            style={{ color: 'var(--text-primary)' }}
          >
            🎮 3D Navigation
          </h3>
          <p
            className="text-[10px] md:text-xs"
            style={{ color: 'var(--text-muted)' }}
          >
            Linke Maustaste: Drehen • Rechte Maustaste: Schwenken •
            Mausrad: Zoomen. Klicke auf unentdeckte Felder.{' '}
            <span style={{ color: 'var(--resource-mp)' }}>{UNCOVER_COST} MP</span>{' '}
            pro Scan. 💀 = Map Boss (klickbar).
          </p>
          <div className="mt-2 flex flex-wrap gap-1">
            {Object.entries(POI_EMOJI).map(([type, emoji]) => (
              <span
                key={type}
                className="text-[10px] px-1 rounded"
                style={{
                  backgroundColor: 'rgba(30, 41, 59, 0.6)',
                  color: colors[type] || colors.unknown,
                }}
              >
                {emoji} {getPoiLabel(type)}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Helpers ────────────────────────────────────────────────────────────────

const POI_EMOJI = {
  monastery: '🏯',
  academy: '🎓',
  gym: '💪',
  studio: '🎵',
  server: '🖥️',
  wilds: '⚔️',
  nexus: '🌀',
  unknown: '❓',
};

const POI_LABELS = {
  monastery: 'Kloster',
  academy: 'Akademie',
  gym: 'Trainingslager',
  studio: 'Studio',
  server: 'Server-Farm',
  wilds: 'Wildnis',
  nexus: 'Nexus',
};

function getPoiLabel(type) {
  return POI_LABELS[type] || type;
}
