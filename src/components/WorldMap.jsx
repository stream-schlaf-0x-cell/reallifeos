import React, { useState } from "react";
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

const WorldMap = ({ gameState, uncoverTile, getPoiInfo }) => {
  const [revealedTile, setRevealedTile] = useState(null);
  const HEX_SIZE = 45;

  const getHexCoords = (q, r) => {
    const x = HEX_SIZE * Math.sqrt(3) * (q + r / 2);
    const y = ((HEX_SIZE * 3) / 2) * r;
    return { x, y };
  };

  const handleTileClick = (index, tile) => {
    if (!tile.discovered) {
      uncoverTile(index);
      setRevealedTile(index);
      setTimeout(() => setRevealedTile(null), 800);
    }
  };

  return (
    <div className="h-full bg-slate-900/60 border border-slate-700/50 rounded-3xl p-4 flex flex-col overflow-hidden relative">
      {/* Header */}
      <div className="flex justify-between items-center mb-4 z-10">
        <h2 className="text-lg md:text-xl font-bold flex items-center gap-2 text-emerald-400">
          <Icon name="map" /> Archipel des Geistes
        </h2>
        <div className="text-[10px] md:text-xs text-slate-400 font-mono hidden md:block">
          Dify Game Director Interface (V 0.2)
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
          viewBox="-200 -200 400 400"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <polygon
              id="hex"
              points="0,-45 38.97,-22.5 38.97,22.5 0,45 -38.97,22.5 -38.97,-22.5"
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
          </defs>

          {/* Grid Lines (Background context) */}
          <g stroke="rgba(255,255,255,0.03)" strokeWidth="1">
            {[...Array(10)].map((_, i) => (
              <line
                key={`v${i}`}
                x1={-200 + i * 40}
                y1="-200"
                x2={-200 + i * 40}
                y2="200"
              />
            ))}
            {[...Array(10)].map((_, i) => (
              <line
                key={`h${i}`}
                x1="-200"
                y1={-200 + i * 40}
                x2="200"
                y2={-200 + i * 40}
              />
            ))}
          </g>

          {/* Render Map Data */}
          <g>
            {gameState.mapData.tiles.map((tile, i) => {
              const { x, y } = getHexCoords(tile.q, tile.r);
              const isPlayerHere =
                gameState.mapData.playerPosition.q === tile.q &&
                gameState.mapData.playerPosition.r === tile.r;
              const poi = getPoiInfo(tile.type);
              const justRevealed = revealedTile === i;
              const borderColor = tile.discovered
                ? POI_BORDER_COLORS[tile.type] || "rgba(51, 65, 85, 1)"
                : "rgba(30, 41, 59, 1)";

              return (
                <g
                  key={i}
                  transform={`translate(${x}, ${y})`}
                  className={`transition-all duration-500 hover:scale-105 ${
                    !tile.discovered ? "cursor-pointer" : ""
                  }`}
                  onClick={() => handleTileClick(i, tile)}
                >
                  {/* Hex base */}
                  <use
                    href="#hex"
                    fill={
                      tile.discovered
                        ? "rgba(15, 23, 42, 0.9)"
                        : "rgba(0, 0, 0, 0.5)"
                    }
                    stroke={isPlayerHere ? "#10b981" : borderColor}
                    strokeWidth={isPlayerHere ? "3" : "1.5"}
                    filter={isPlayerHere || tile.discovered ? "url(#glow)" : ""}
                    className={justRevealed ? "animate-tile-reveal" : ""}
                  />

                  {/* Discovered tile content */}
                  {tile.discovered ? (
                    <>
                      {/* POI Emoji */}
                      {POI_EMOJI[tile.type] && (
                        <text
                          x="0"
                          y="-10"
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
                        y="6"
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
                      {/* POI bonus indicator */}
                      {poi.bonus && Object.keys(poi.bonus).length > 0 && (
                        <circle
                          cx="28"
                          cy="-28"
                          r="5"
                          fill={borderColor}
                          opacity="0.8"
                        />
                      )}
                      {/* Ambush warning */}
                      {poi.ambush && (
                        <text
                          x="0"
                          y="-22"
                          fill="#f97316"
                          fontSize="8"
                          textAnchor="middle"
                          fontWeight="bold"
                          className="animate-pulse"
                        >
                          ⚠
                        </text>
                      )}
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
                      cy="24"
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

        {/* Info overlay */}
        <div className="absolute bottom-4 left-4 bg-slate-900/80 p-3 md:p-4 rounded-xl border border-slate-700 backdrop-blur-sm max-w-[200px] md:max-w-xs pointer-events-none">
          <h3 className="font-bold text-sm md:text-base text-slate-200 mb-1">
            KI Navigation Aktiv
          </h3>
          <p className="text-[10px] md:text-xs text-slate-400">
            Klicke auf unentdeckte Felder.{" "}
            <span className="text-emerald-400">{UNCOVER_COST} MP</span> pro
            Scan. Entdeckte POIs geben permanente Boni!
          </p>
          {/* POI Legend */}
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
