import React, { useState, useCallback } from "react";
import Icon from "./Icon";
import FallbackImage from "./FallbackImage";

const UNCOVER_COST = 10;

const POI_EMOJI = {
  monastery: "🏯",
  academy: "🎓",
  gym: "💪",
  studio: "🎵",
  server: "🖥️",
  wilds: "⚔️",
  nexus: "🌀",
  unknown: "❓",
};

// Default border colors — overridden by CSS variables from theme
const DEFAULT_POI_BORDER = {
  monastery: "#10b981",
  academy: "#f59e0b",
  gym: "#ef4444",
  studio: "#a855f7",
  server: "#3b82f6",
  wilds: "#f97316",
  nexus: "#06b6d4",
  unknown: "#64748b",
};

const WorldMap = ({ gameState, uncoverTile, getPoiInfo, defeatMapBoss }) => {
  const [revealedTile, setRevealedTile] = useState(null);
  const [viewBox, setViewBox] = useState({ x: -300, y: -300, w: 600, h: 600 });
  const HEX_SIZE = 45;

  // Extract biome info from gameState
  const biomeInfo = gameState.biomeInfo || gameState.worldState?.currentBiome || 'default';
  const biomeName = typeof biomeInfo === 'object' ? biomeInfo.name : biomeInfo;
  const serverSynced = gameState.worldState?.serverSynced || false;

  const getHexCoords = useCallback((q, r) => {
    const x = HEX_SIZE * Math.sqrt(3) * (q + r / 2);
    const y = ((HEX_SIZE * 3) / 2) * r;
    return { x, y };
  }, []);

  const handleTileClick = useCallback((index, tile) => {
    if (!tile.discovered && !tile.generating) {
      uncoverTile(index);
      setRevealedTile(index);
      setTimeout(() => setRevealedTile(null), 800);
    }
  }, [uncoverTile]);

  const handleBossClick = useCallback((tileIndex, e) => {
    e.stopPropagation();
    const tile = gameState.mapData.tiles[tileIndex];
    if (tile?.mapBoss && !tile.mapBoss.defeated) {
      if (window.confirm(`⚔️ ${tile.mapBoss.name} angreifen?`)) {
        defeatMapBoss(tileIndex);
      }
    }
  }, [gameState.mapData.tiles, defeatMapBoss]);

  // Pan controls
  const PAN_AMOUNT = 100;
  const pan = (dx, dy) => {
    setViewBox((prev) => ({
      ...prev,
      x: prev.x + dx,
      y: prev.y + dy,
    }));
  };

  // Zoom controls
  const zoom = (factor) => {
    setViewBox((prev) => {
      const newW = Math.max(200, Math.min(1200, prev.w * factor));
      const newH = Math.max(200, Math.min(1200, prev.h * factor));
      return { ...prev, w: newW, h: newH };
    });
  };

  // Calculate map bounds for centering
  const tiles = gameState.mapData.tiles || [];
  let minQ = 0, maxQ = 0, minR = 0, maxR = 0;
  tiles.forEach((t) => {
    if (t.q < minQ) minQ = t.q;
    if (t.q > maxQ) maxQ = t.q;
    if (t.r < minR) minR = t.r;
    if (t.r > maxR) maxR = t.r;
  });

  const discoveredCount = tiles.filter((t) => t.discovered).length;
  const totalCount = tiles.length;
  const generatingCount = tiles.filter((t) => t.generating).length;
  const bossTiles = tiles.filter((t) => t.mapBoss && !t.mapBoss.defeated);

  // Helper to get POI border color from CSS variable or fallback
  const getPoiBorderColor = (type) => {
    const cssVar = getComputedStyle(document.documentElement).getPropertyValue(`--path-${type}`).trim();
    return cssVar || DEFAULT_POI_BORDER[type] || "rgba(51, 65, 85, 1)";
  };

  return (
    <div className="h-full rounded-3xl p-4 flex flex-col overflow-hidden relative" style={{
      backgroundColor: 'rgba(2, 6, 23, 0.6)',
      border: '1px solid var(--border-primary)',
    }}>
      {/* Header */}
      <div className="flex justify-between items-center mb-4 z-10">
        <h2 className="text-lg md:text-xl font-bold flex items-center gap-2" style={{ color: 'var(--path-monk)' }}>
          <Icon name="map" /> Archipel des Geistes
        </h2>
        <div className="text-[10px] md:text-xs font-mono flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
          {/* Biome indicator */}
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full" style={{
            backgroundColor: 'rgba(139, 92, 246, 0.1)',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            color: 'var(--accent-primary)',
          }}>
            🌍 {biomeName}
          </span>
          
          {/* Server sync status */}
          {serverSynced && (
            <span title="Mit Server synchronisiert" style={{ color: 'var(--resource-mana)' }}>☁️</span>
          )}
          
          <span>{discoveredCount}/{totalCount} entdeckt • {bossTiles.length} Boss active
          {generatingCount > 0 && (
            <span className="ml-2" style={{ color: 'var(--accent-primary)' }}>
              {generatingCount} generierend...
            </span>
          )}</span>
        </div>
      </div>

      {/* POI Bonuses Bar */}
      {gameState.poiBonuses &&
        (gameState.poiBonuses.manaRegen > 0 ||
          gameState.poiBonuses.goldRegen > 0 ||
          gameState.poiBonuses.moveRegen > 0) && (
          <div className="flex flex-wrap gap-2 mb-3 z-10">
            {gameState.poiBonuses.manaRegen > 0 && (
              <div className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs" style={{
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
              }}>
                <Icon name="mana" className="w-3 h-3" style={{ color: 'var(--resource-mana)' }} />
                <span style={{ color: 'var(--resource-mana)' }} className="font-mono">
                  +{gameState.poiBonuses.manaRegen} Mana/Quest
                </span>
              </div>
            )}
            {gameState.poiBonuses.goldRegen > 0 && (
              <div className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs" style={{
                backgroundColor: 'rgba(234, 179, 8, 0.1)',
                border: '1px solid rgba(234, 179, 8, 0.3)',
              }}>
                <Icon name="gold" className="w-3 h-3" style={{ color: 'var(--resource-gold)' }} />
                <span style={{ color: 'var(--resource-gold)' }} className="font-mono">
                  +{gameState.poiBonuses.goldRegen} Gold/Quest
                </span>
              </div>
            )}
            {gameState.poiBonuses.moveRegen > 0 && (
              <div className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs" style={{
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
              }}>
                <Icon name="move" className="w-3 h-3" style={{ color: 'var(--resource-mp)' }} />
                <span style={{ color: 'var(--resource-mp)' }} className="font-mono">
                  +{gameState.poiBonuses.moveRegen} MP/Quest
                </span>
              </div>
            )}
          </div>
        )}

      {/* Map Area */}
      <div className="flex-1 relative overflow-hidden rounded-2xl border flex items-center justify-center" style={{
        backgroundColor: 'rgba(2, 6, 23, 0.5)',
        borderColor: 'var(--border-secondary)',
      }}>
        <svg
          className="w-full h-full min-h-[300px]"
          viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`}
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <polygon
              id="hex"
              points={`0,${-HEX_SIZE} ${HEX_SIZE * Math.sqrt(3) / 2},${-HEX_SIZE / 2} ${HEX_SIZE * Math.sqrt(3) / 2},${HEX_SIZE / 2} 0,${HEX_SIZE} ${-HEX_SIZE * Math.sqrt(3) / 2},${HEX_SIZE / 2} ${-HEX_SIZE * Math.sqrt(3) / 2},${-HEX_SIZE / 2}`}
            />
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="poiGlow">
              <feGaussianBlur stdDeviation="5" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="bossGlow">
              <feGaussianBlur stdDeviation="4" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Background grid lines */}
          <g stroke="rgba(255,255,255,0.02)" strokeWidth="1">
            {[-400, -300, -200, -100, 0, 100, 200, 300, 400].map((pos) => (
              <React.Fragment key={pos}>
                <line x1={pos} y1="-400" x2={pos} y2="400" />
                <line x1="-400" y1={pos} x2="400" y2={pos} />
              </React.Fragment>
            ))}
          </g>

          {/* Hex tiles */}
          <g>
            {tiles.map((tile, i) => {
              const { x, y } = getHexCoords(tile.q, tile.r);
              const isPlayerHere =
                gameState.mapData.playerPosition.q === tile.q &&
                gameState.mapData.playerPosition.r === tile.r;
              const poi = getPoiInfo(tile.type);
              const justRevealed = revealedTile === i;
              const borderColor = tile.discovered
                ? getPoiBorderColor(tile.type)
                : tile.generating
                  ? 'rgba(139, 92, 246, 0.5)'
                  : "rgba(30, 41, 59, 1)";
              const hasBoss = tile.mapBoss && !tile.mapBoss.defeated;
              const bossDefeated = tile.mapBoss && tile.mapBoss.defeated;

              return (
                <g
                  key={i}
                  transform={`translate(${x}, ${y})`}
                  className={`transition-all duration-500 ${
                    !tile.discovered && !tile.generating ? "cursor-pointer hover:scale-110" : ""
                  }`}
                  onClick={() => handleTileClick(i, tile)}
                >
                  {/* Hex base */}
                  <use
                    href="#hex"
                    fill={
                      tile.discovered
                        ? bossDefeated
                          ? "rgba(16, 185, 129, 0.1)"
                          : "rgba(15, 23, 42, 0.9)"
                        : tile.generating
                          ? "rgba(139, 92, 246, 0.08)"
                          : "rgba(0, 0, 0, 0.5)"
                    }
                    stroke={isPlayerHere ? "var(--path-monk)" : hasBoss ? "var(--path-acrobat)" : borderColor}
                    strokeWidth={isPlayerHere ? "3" : hasBoss ? "2.5" : "1.5"}
                    filter={isPlayerHere || tile.discovered ? "url(#glow)" : ""}
                    className={justRevealed ? "animate-tile-reveal" : ""}
                  />

                  {tile.discovered ? (
                    <>
                      {/* Boss indicator */}
                      {hasBoss && (
                        <g
                          className="cursor-pointer"
                          onClick={(e) => handleBossClick(i, e)}
                        >
                          <circle
                            cx="0"
                            cy="-30"
                            r="10"
                            fill="rgba(249, 115, 22, 0.3)"
                            stroke="var(--path-acrobat)"
                            strokeWidth="1.5"
                            filter="url(#bossGlow)"
                            className="animate-pulse"
                          />
                          <text
                            x="0"
                            y="-26"
                            fontSize="12"
                            textAnchor="middle"
                            filter="url(#bossGlow)"
                          >
                            💀
                          </text>
                        </g>
                      )}

                      {/* Defeated boss marker */}
                      {bossDefeated && (
                        <text x="0" y="-30" fontSize="10" textAnchor="middle" className="opacity-50">
                          ✅
                        </text>
                      )}

                      {/* POI Emoji */}
                      {POI_EMOJI[tile.type] && (
                        <text
                          x="0"
                          y={hasBoss ? "-12" : "-10"}
                          fontSize="16"
                          textAnchor="middle"
                          filter="url(#poiGlow)"
                        >
                          {POI_EMOJI[tile.type]}
                        </text>
                      )}
                      {/* POI Type */}
                      <text
                        x="0"
                        y={hasBoss ? "2" : "6"}
                        fill={borderColor}
                        fontSize="7"
                        textAnchor="middle"
                        fontWeight="bold"
                      >
                        {poi?.label?.toUpperCase() || tile.type.toUpperCase()}
                      </text>
                      {/* Coords */}
                      <text
                        x="0"
                        y="16"
                        fill="rgba(148, 163, 184, 0.5)"
                        fontSize="6"
                        textAnchor="middle"
                      >
                        {tile.q},{tile.r}
                      </text>
                    </>
                  ) : tile.generating ? (
                    /* Generating state */
                    <>
                      <text
                        x="0"
                        y="3"
                        fill="rgba(139, 92, 246, 0.6)"
                        fontSize="10"
                        textAnchor="middle"
                        className="animate-pulse"
                      >
                        ⚙️
                      </text>
                      <text
                        x="0"
                        y="16"
                        fill="rgba(139, 92, 246, 0.4)"
                        fontSize="5"
                        textAnchor="middle"
                      >
                        KI...
                      </text>
                    </>
                  ) : (
                    /* Fog of war */
                    <>
                      <text
                        x="0"
                        y="3"
                        fill="rgba(71, 85, 105, 0.4)"
                        fontSize="12"
                        textAnchor="middle"
                      >
                        ?
                      </text>
                      <text
                        x="0"
                        y="16"
                        fill="rgba(71, 85, 105, 0.25)"
                        fontSize="5"
                        textAnchor="middle"
                      >
                        {UNCOVER_COST} MP
                      </text>
                    </>
                  )}

                  {/* Player indicator */}
                  {isPlayerHere && (
                    <circle
                      cx="0"
                      cy="28"
                      r="4"
                      fill="var(--path-monk)"
                      className="animate-pulse"
                    />
                  )}
                </g>
              );
            })}
          </g>
        </svg>

        {/* Pan/Zoom controls */}
        <div className="absolute top-3 right-3 flex flex-col gap-1 z-10">
          <button onClick={() => zoom(0.8)} className="w-7 h-7 rounded-lg border text-xs font-bold transition-colors flex items-center justify-center" style={{
            backgroundColor: 'rgba(30, 41, 59, 0.8)',
            borderColor: 'var(--border-primary)',
            color: 'var(--text-secondary)',
          }}>
            +
          </button>
          <button onClick={() => zoom(1.25)} className="w-7 h-7 rounded-lg border text-xs font-bold transition-colors flex items-center justify-center" style={{
            backgroundColor: 'rgba(30, 41, 59, 0.8)',
            borderColor: 'var(--border-primary)',
            color: 'var(--text-secondary)',
          }}>
            −
          </button>
          <div className="h-1"></div>
          <button onClick={() => pan(0, -PAN_AMOUNT)} className="w-7 h-7 rounded-lg border text-xs transition-colors" style={{
            backgroundColor: 'rgba(30, 41, 59, 0.8)',
            borderColor: 'var(--border-primary)',
            color: 'var(--text-secondary)',
          }}>↑</button>
          <div className="flex gap-1">
            <button onClick={() => pan(-PAN_AMOUNT, 0)} className="w-7 h-7 rounded-lg border text-xs transition-colors" style={{
              backgroundColor: 'rgba(30, 41, 59, 0.8)',
              borderColor: 'var(--border-primary)',
              color: 'var(--text-secondary)',
            }}>←</button>
            <button onClick={() => pan(PAN_AMOUNT, 0)} className="w-7 h-7 rounded-lg border text-xs transition-colors" style={{
              backgroundColor: 'rgba(30, 41, 59, 0.8)',
              borderColor: 'var(--border-primary)',
              color: 'var(--text-secondary)',
            }}>→</button>
          </div>
          <button onClick={() => pan(0, PAN_AMOUNT)} className="w-7 h-7 rounded-lg border text-xs transition-colors" style={{
            backgroundColor: 'rgba(30, 41, 59, 0.8)',
            borderColor: 'var(--border-primary)',
            color: 'var(--text-secondary)',
          }}>↓</button>
          <button onClick={() => setViewBox({ x: -300, y: -300, w: 600, h: 600 })} className="w-7 h-7 rounded-lg border text-[9px] font-bold transition-colors mt-1" style={{
            backgroundColor: 'rgba(30, 41, 59, 0.8)',
            borderColor: 'var(--border-primary)',
            color: 'var(--text-muted)',
          }} title="Zentrieren">
            ⊙
          </button>
        </div>

        {/* Info overlay */}
        <div className="absolute bottom-4 left-4 p-3 md:p-4 rounded-xl border backdrop-blur-sm max-w-[200px] md:max-w-xs pointer-events-none" style={{
          backgroundColor: 'rgba(2, 6, 23, 0.8)',
          borderColor: 'var(--border-primary)',
        }}>
          <h3 className="font-bold text-sm md:text-base mb-1" style={{ color: 'var(--text-primary)' }}>
            KI Navigation Aktiv
          </h3>
          <p className="text-[10px] md:text-xs" style={{ color: 'var(--text-muted)' }}>
            Klicke auf unentdeckte Felder neben bereits entdeckten.{" "}
            <span style={{ color: 'var(--resource-mp)' }}>{UNCOVER_COST} MP</span> pro Scan.
            💀 Skull = Map Boss (klickbar).
          </p>
          <div className="mt-2 flex flex-wrap gap-1">
            {Object.entries(POI_EMOJI).map(([type, emoji]) => {
              const poi = getPoiInfo(type);
              return (
                <span
                  key={type}
                  className="text-[10px] px-1 rounded"
                  style={{ backgroundColor: 'rgba(30, 41, 59, 0.6)', color: getPoiBorderColor(type) }}
                >
                  {emoji} {poi?.label || type}
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorldMap;
