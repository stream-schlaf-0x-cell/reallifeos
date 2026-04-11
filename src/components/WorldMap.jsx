import React, { useState, useCallback } from "react";
import Icon from "./Icon";

const UNCOVER_COST = 10;

const POI_EMOJI = {
  monastery: "🏯",
  academy: "🎓",
  gym: "💪",
  studio: "🎵",
  server: "🖥️",
  wilds: "⚔️",
  nexus: "🌀",
};

const POI_BORDER_COLORS = {
  monastery: "#10b981",
  academy: "#f59e0b",
  gym: "#ef4444",
  studio: "#a855f7",
  server: "#3b82f6",
  wilds: "#f97316",
  nexus: "#06b6d4",
};

const WorldMap = ({ gameState, uncoverTile, getPoiInfo, defeatMapBoss }) => {
  const [revealedTile, setRevealedTile] = useState(null);
  const [viewBox, setViewBox] = useState({ x: -300, y: -300, w: 600, h: 600 });
  const HEX_SIZE = 45;

  const getHexCoords = useCallback((q, r) => {
    const x = HEX_SIZE * Math.sqrt(3) * (q + r / 2);
    const y = ((HEX_SIZE * 3) / 2) * r;
    return { x, y };
  }, []);

  const handleTileClick = useCallback((index, tile) => {
    if (!tile.discovered) {
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
  const bossTiles = tiles.filter((t) => t.mapBoss && !t.mapBoss.defeated);

  return (
    <div className="h-full bg-slate-900/60 border border-slate-700/50 rounded-3xl p-4 flex flex-col overflow-hidden relative">
      {/* Header */}
      <div className="flex justify-between items-center mb-4 z-10">
        <h2 className="text-lg md:text-xl font-bold flex items-center gap-2 text-emerald-400">
          <Icon name="map" /> Archipel des Geistes
        </h2>
        <div className="text-[10px] md:text-xs text-slate-400 font-mono">
          {discoveredCount}/{totalCount} entdeckt • {bossTiles.length} Boss active
        </div>
      </div>

      {/* POI Bonuses Bar */}
      {gameState.poiBonuses &&
        (gameState.poiBonuses.manaRegen > 0 ||
          gameState.poiBonuses.goldRegen > 0 ||
          gameState.poiBonuses.moveRegen > 0) && (
          <div className="flex flex-wrap gap-2 mb-3 z-10">
            {gameState.poiBonuses.manaRegen > 0 && (
              <div className="flex items-center gap-1 bg-blue-900/40 border border-blue-700/50 rounded-lg px-2 py-1 text-xs">
                <Icon name="mana" className="w-3 h-3 text-blue-400" />
                <span className="text-blue-300 font-mono">
                  +{gameState.poiBonuses.manaRegen} Mana/Quest
                </span>
              </div>
            )}
            {gameState.poiBonuses.goldRegen > 0 && (
              <div className="flex items-center gap-1 bg-yellow-900/40 border border-yellow-700/50 rounded-lg px-2 py-1 text-xs">
                <Icon name="gold" className="w-3 h-3 text-yellow-400" />
                <span className="text-yellow-300 font-mono">
                  +{gameState.poiBonuses.goldRegen} Gold/Quest
                </span>
              </div>
            )}
            {gameState.poiBonuses.moveRegen > 0 && (
              <div className="flex items-center gap-1 bg-emerald-900/40 border border-emerald-700/50 rounded-lg px-2 py-1 text-xs">
                <Icon name="move" className="w-3 h-3 text-emerald-400" />
                <span className="text-emerald-300 font-mono">
                  +{gameState.poiBonuses.moveRegen} MP/Quest
                </span>
              </div>
            )}
          </div>
        )}

      {/* Map Area */}
      <div className="flex-1 relative overflow-hidden bg-slate-950/50 rounded-2xl border border-slate-800/80 flex items-center justify-center">
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
                ? POI_BORDER_COLORS[tile.type] || "rgba(51, 65, 85, 1)"
                : "rgba(30, 41, 59, 1)";
              const hasBoss = tile.mapBoss && !tile.mapBoss.defeated;
              const bossDefeated = tile.mapBoss && tile.mapBoss.defeated;

              return (
                <g
                  key={i}
                  transform={`translate(${x}, ${y})`}
                  className={`transition-all duration-500 ${
                    !tile.discovered ? "cursor-pointer hover:scale-110" : ""
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
                        : "rgba(0, 0, 0, 0.5)"
                    }
                    stroke={isPlayerHere ? "#10b981" : hasBoss ? "#f97316" : borderColor}
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
                            stroke="#f97316"
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
                        {poi.label.toUpperCase()}
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
                      fill="#10b981"
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
          <button onClick={() => zoom(0.8)} className="w-7 h-7 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-300 hover:text-white hover:border-slate-500 text-xs font-bold transition-colors flex items-center justify-center">
            +
          </button>
          <button onClick={() => zoom(1.25)} className="w-7 h-7 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-300 hover:text-white hover:border-slate-500 text-xs font-bold transition-colors flex items-center justify-center">
            −
          </button>
          <div className="h-1"></div>
          <button onClick={() => pan(0, -PAN_AMOUNT)} className="w-7 h-7 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-300 hover:text-white hover:border-slate-500 text-xs transition-colors">↑</button>
          <div className="flex gap-1">
            <button onClick={() => pan(-PAN_AMOUNT, 0)} className="w-7 h-7 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-300 hover:text-white hover:border-slate-500 text-xs transition-colors">←</button>
            <button onClick={() => pan(PAN_AMOUNT, 0)} className="w-7 h-7 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-300 hover:text-white hover:border-slate-500 text-xs transition-colors">→</button>
          </div>
          <button onClick={() => pan(0, PAN_AMOUNT)} className="w-7 h-7 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-300 hover:text-white hover:border-slate-500 text-xs transition-colors">↓</button>
          <button onClick={() => setViewBox({ x: -300, y: -300, w: 600, h: 600 })} className="w-7 h-7 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 text-[9px] font-bold transition-colors mt-1" title="Zentrieren">
            ⊙
          </button>
        </div>

        {/* Info overlay */}
        <div className="absolute bottom-4 left-4 bg-slate-900/80 p-3 md:p-4 rounded-xl border border-slate-700 backdrop-blur-sm max-w-[200px] md:max-w-xs pointer-events-none">
          <h3 className="font-bold text-sm md:text-base text-slate-200 mb-1">
            KI Navigation Aktiv
          </h3>
          <p className="text-[10px] md:text-xs text-slate-400">
            Klicke auf unentdeckte Felder neben bereits entdeckten.{" "}
            <span className="text-emerald-400">{UNCOVER_COST} MP</span> pro Scan.
            💀 Skull = Map Boss (klickbar).
          </p>
          <div className="mt-2 flex flex-wrap gap-1">
            {Object.entries(POI_EMOJI).map(([type, emoji]) => {
              const poi = getPoiInfo(type);
              return (
                <span
                  key={type}
                  className="text-[10px] bg-slate-800/60 px-1 rounded"
                  style={{ color: POI_BORDER_COLORS[type] || "#94a3b8" }}
                >
                  {emoji} {poi.label}
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
