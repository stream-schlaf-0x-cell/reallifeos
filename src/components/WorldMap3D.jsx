import React, { useCallback, useMemo, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useWorldStore } from '../stores/useWorldStore';
import { useBiomeColors } from '../hooks/useBiomeColors';
import { useInfiniteMap } from '../hooks/useInfiniteMap';
import { ErrorBoundary } from './ErrorBoundary';
import MapOrchestrator from './MapOrchestrator';
import PlayerAvatar from './PlayerAvatar';
import FollowCamera from './FollowCamera';
import InstancedHexGrid from './InstancedHexGrid';
import InstancedDecor from './InstancedDecor';
import TileBillboard from './TileBillboard';
import TileArtifact from './TileArtifact';
import { AmbientDust, FloatingSpores } from './AtmosphericDetails';

const UNCOVER_COST = 10;

/**
 * WorldMap3D v3 – AAA-Indie 3D-Welt:
 *
 * - InstancedMesh Rendering für alle Tiles (Performance)
 * - Simplex Noise Terrain (organische Höhen)
 * - PlayerAvatar mit Momentum-basierter Bewegung
 * - FollowCamera mit Smooth Lerp
 * - Bloom, TiltShift, GodRays Post-Processing
 * - Infinite Map (auto-expand)
 * - Atmospheric Particles (Dust, Spores)
 */
export default function WorldMap3D() {
  const tiles = useWorldStore((s) => s.mapData.tiles);
  const playerPos = useWorldStore((s) => s.mapData.playerPosition);
  const worldState = useWorldStore((s) => s.worldState);
  const recalcPoiBonuses = useWorldStore((s) => s.recalcPoiBonuses);

  const poiBonuses = useMemo(() => recalcPoiBonuses(), [recalcPoiBonuses]);
  const colors = useBiomeColors();

  // Infinite Map
  useInfiniteMap(playerPos);

  const biomeName = typeof worldState?.currentBiome === 'object'
    ? worldState.currentBiome.name
    : worldState?.currentBiome || 'default';
  const serverSynced = worldState?.serverSynced || false;

  const discoveredCount = tiles.filter((t) => t.discovered).length;
  const totalCount = tiles.length;
  const generatingCount = tiles.filter((t) => t.generating).length;
  const bossTiles = tiles.filter((t) => t.mapBoss && !t.mapBoss.defeated);

  // Stable click handlers
  const handleTileClick = useCallback((index, tile) => {
    if (tile && !tile.discovered && !tile.generating) {
      useWorldStore.getState().uncoverTile(index);
    }
  }, []);

  const handleBossClick = useCallback((tileIndex) => {
    const currentTiles = useWorldStore.getState().mapData.tiles;
    const tile = currentTiles[tileIndex];
    if (tile?.mapBoss && !tile.mapBoss.defeated) {
      if (window.confirm(`⚔️ ${tile.mapBoss.name} angreifen?`)) {
        useWorldStore.getState().defeatMapBoss(tileIndex);
      }
    }
  }, []);

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
        <h2 className="text-lg md:text-xl font-bold flex items-center gap-2" style={{ color: 'var(--path-monk)' }}>
          🗺️ Archipel des Geistes
        </h2>
        <div className="text-[10px] md:text-xs font-mono flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full" style={{
            backgroundColor: 'rgba(139, 92, 246, 0.1)',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            color: 'var(--accent-primary)',
          }}>
            🌍 {biomeName}
          </span>
          {serverSynced && <span style={{ color: 'var(--resource-mana)' }}>☁️</span>}
          <span>
            {discoveredCount}/{totalCount} • {bossTiles.length} Boss
            {generatingCount > 0 && (
              <span className="ml-2" style={{ color: 'var(--accent-primary)' }}>
                {generatingCount} ⚙️
              </span>
            )}
          </span>
        </div>
      </div>

      {/* ─── POI Bonuses Bar ────────────────────────────────────────── */}
      {poiBonuses && (poiBonuses.manaRegen > 0 || poiBonuses.goldRegen > 0 || poiBonuses.moveRegen > 0) && (
        <div className="flex flex-wrap gap-2 mb-3 z-10">
          {poiBonuses.manaRegen > 0 && (
            <div className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs" style={{
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
            }}>
              <span style={{ color: 'var(--resource-mana)' }} className="font-mono">
                💎 +{poiBonuses.manaRegen}
              </span>
            </div>
          )}
          {poiBonuses.goldRegen > 0 && (
            <div className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs" style={{
              backgroundColor: 'rgba(234, 179, 8, 0.1)',
              border: '1px solid rgba(234, 179, 8, 0.3)',
            }}>
              <span style={{ color: 'var(--resource-gold)' }} className="font-mono">
                🪙 +{poiBonuses.goldRegen}
              </span>
            </div>
          )}
          {poiBonuses.moveRegen > 0 && (
            <div className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs" style={{
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
            }}>
              <span style={{ color: 'var(--resource-mp)' }} className="font-mono">
                ⚡ +{poiBonuses.moveRegen}
              </span>
            </div>
          )}
        </div>
      )}

      {/* ─── 3D Canvas ─────────────────────────────────────────────── */}
      <div className="flex-1 relative overflow-hidden rounded-2xl border" style={{
        backgroundColor: 'rgba(2, 6, 23, 0.5)',
        borderColor: 'var(--border-secondary)',
      }}>
        <ErrorBoundary>
          <Canvas
            camera={{ position: [0, 18, 18], fov: 40, near: 0.1, far: 120 }}
            style={{ width: '100%', height: '100%' }}
            dpr={[1, 1.5]}
            shadows
          >
            <Suspense fallback={null}>
              {/* Scene Orchestration: Licht, Schatten, Post-Processing */}
              <MapOrchestrator />

              {/* Player Avatar mit Momentum */}
              <PlayerAvatar playerPos={playerPos} colors={colors} />

              {/* Smooth Follow Camera */}
              <FollowCamera playerPos={playerPos} enabled />

              {/* Instanced Hex Tiles – Performance */}
              <InstancedHexGrid
                tiles={tiles}
                colors={colors}
                onTileClick={handleTileClick}
              />

              {/* Instanced Landschafts-Deko */}
              <InstancedDecor tiles={tiles} colors={colors} />

              {/* Per-Tile Billboards (3D-Text für POI, Boss) */}
              {tiles.map((tile, i) => {
                const isPlayerHere = playerPos.q === tile.q && playerPos.r === tile.r;
                return (
                  <React.Fragment key={`bb-${i}`}>
                    {(tile.discovered || tile.generating) && (
                      <TileBillboard
                        tile={{ ...tile, index: i }}
                        colors={colors}
                        isPlayerHere={isPlayerHere}
                        onBossClick={handleBossClick}
                      />
                    )}
                    {/* KI-Bild als Artefakt */}
                    {tile.discovered && (
                      <TileArtifact tile={tile} />
                    )}
                  </React.Fragment>
                );
              })}

              {/* Atmospheric Particles */}
              <AmbientDust count={150} spread={35} />
              <FloatingSpores count={60} spread={28} />

              {/* Kamera-Steuerung */}
              <OrbitControls
                enableDamping
                dampingFactor={0.05}
                minDistance={5}
                maxDistance={50}
                maxPolarAngle={Math.PI / 2.1}
                minPolarAngle={Math.PI / 10}
                rotateSpeed={0.35}
                zoomSpeed={0.8}
                panSpeed={0.35}
              />
            </Suspense>
          </Canvas>
        </ErrorBoundary>

        {/* ─── Info Overlay ──────────────────────────────────────── */}
        <div className="absolute bottom-4 left-4 p-3 md:p-4 rounded-xl border backdrop-blur-sm max-w-[220px] md:max-w-xs pointer-events-none" style={{
          backgroundColor: 'rgba(2, 6, 23, 0.8)',
          borderColor: 'var(--border-primary)',
        }}>
          <h3 className="font-bold text-sm md:text-base mb-1" style={{ color: 'var(--text-primary)' }}>
            🎮 3D Welt
          </h3>
          <p className="text-[10px] md:text-xs" style={{ color: 'var(--text-muted)' }}>
            Links: Drehen • Rechts: Schwenken • Rad: Zoom.
            Klicke auf unentdeckte Felder ({UNCOVER_COST} MP).
          </p>
          <div className="mt-2 flex flex-wrap gap-1">
            {Object.entries(POI_EMOJI).map(([type, emoji]) => (
              <span key={type} className="text-[10px] px-1 rounded" style={{
                backgroundColor: 'rgba(30, 41, 59, 0.6)',
                color: colors[type] || colors.unknown,
              }}>
                {emoji} {POI_LABELS[type]}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const POI_EMOJI = {
  monastery: '🏯', academy: '🎓', gym: '💪', studio: '🎵',
  server: '🖥️', wilds: '⚔️', nexus: '🌀', unknown: '❓',
};

const POI_LABELS = {
  monastery: 'Kloster', academy: 'Akademie', gym: 'Trainingslager',
  studio: 'Studio', server: 'Server-Farm', wilds: 'Wildnis', nexus: 'Nexus',
};
