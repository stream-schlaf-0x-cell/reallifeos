import React from 'react';
import Icon from './Icon';

const WorldMap = ({ gameState, uncoverTile }) => {
  // Hexagon Rendering Helpers
  const HEX_SIZE = 45;
  const getHexCoords = (q, r) => {
    const x = HEX_SIZE * Math.sqrt(3) * (q + r / 2);
    const y = ((HEX_SIZE * 3) / 2) * r;
    return { x, y };
  };

  return (
    <div className="h-full bg-slate-900/60 border border-slate-700/50 rounded-3xl p-4 flex flex-col overflow-hidden relative">
      <div className="flex justify-between items-center mb-4 z-10">
        <h2 className="text-lg md:text-xl font-bold flex items-center gap-2 text-emerald-400">
          <Icon name="map" /> Archipel des Geistes
        </h2>
        <div className="text-[10px] md:text-xs text-slate-400 font-mono hidden md:block">
          Dify Game Director Interface (V 0.1) • Hex Grid Placeholder
        </div>
      </div>

      <div className="flex-1 relative overflow-hidden bg-slate-950/50 rounded-2xl border border-slate-800/80 flex items-center justify-center">
        {/* SVG Hex Grid Rendering */}
        <svg className="w-full h-full min-h-[300px]" viewBox="-200 -200 400 400" preserveAspectRatio="xMidYMid meet">
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
              return (
                <g
                  key={i}
                  transform={`translate(${x}, ${y})`}
                  className={`transition-all duration-500 hover:scale-105 ${!tile.discovered ? 'cursor-pointer' : ''}`}
                  onClick={() => {
                      if(!tile.discovered) uncoverTile(i);
                  }}
                >
                  <use
                    href="#hex"
                    fill={
                      tile.discovered
                        ? "rgba(15, 23, 42, 0.9)"
                        : "rgba(0, 0, 0, 0.5)"
                    }
                    stroke={
                      isPlayerHere
                        ? "#10b981"
                        : tile.discovered
                        ? "rgba(51, 65, 85, 1)"
                        : "rgba(30, 41, 59, 1)"
                    }
                    strokeWidth={isPlayerHere ? "3" : "1.5"}
                    filter={isPlayerHere ? "url(#glow)" : ""}
                  />
                  {tile.discovered ? (
                    <>
                      <text
                        x="0"
                        y="-5"
                        fill="rgba(203, 213, 225, 0.8)"
                        fontSize="8"
                        textAnchor="middle"
                        fontWeight="bold"
                      >
                        {tile.type.toUpperCase()}
                      </text>
                      <text
                        x="0"
                        y="10"
                        fill="rgba(148, 163, 184, 0.6)"
                        fontSize="6"
                        textAnchor="middle"
                      >
                        {tile.q},{tile.r}
                      </text>
                    </>
                  ) : (
                    <text
                      x="0"
                      y="3"
                      fill="rgba(71, 85, 105, 0.4)"
                      fontSize="12"
                      textAnchor="middle"
                    >
                      ?
                    </text>
                  )}
                  {isPlayerHere && (
                    <circle
                      cx="0"
                      cy="20"
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

        <div className="absolute bottom-4 left-4 bg-slate-900/80 p-3 md:p-4 rounded-xl border border-slate-700 backdrop-blur-sm max-w-[200px] md:max-w-xs pointer-events-none">
          <h3 className="font-bold text-sm md:text-base text-slate-200 mb-1">
            KI Navigation Aktiv
          </h3>
          <p className="text-[10px] md:text-xs text-slate-400">
            Klicke auf unentdeckte Felder. Nutze 10 MP, um sie zu scannen.
          </p>
        </div>
      </div>
    </div>
  );
};

export default WorldMap;