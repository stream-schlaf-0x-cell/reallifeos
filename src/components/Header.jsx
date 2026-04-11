import React from 'react';
import Icon from './Icon';

const Header = ({ gameState, devMode, onToggleDevMode, onOpenLog, gameLocked }) => {
  const requiredXpForNextLevel = Math.floor(
    100 * Math.pow(1.5, gameState.level - 1)
  );

  const xpPercentage = Math.min(
    100,
    Math.max(0, (gameState.xp / requiredXpForNextLevel) * 100)
  );

  return (
    <header className="bg-slate-900/80 backdrop-blur-md border border-slate-700/50 rounded-2xl p-4 md:p-6 mb-4 md:mb-6 shadow-2xl shrink-0">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 md:gap-6">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xl md:text-2xl font-bold shadow-[0_0_20px_rgba(139,92,246,0.4)] border-2 border-indigo-300 shrink-0">
            L{gameState.level}
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-100 to-slate-400">
              Tim&apos;s Second Brain RPG
            </h1>
            <p className="text-xs md:text-sm text-slate-400">
              Meister der Disziplinen • Ethik & Algorithmen
            </p>
          </div>
        </div>

        <div className="flex-1 w-full max-w-md">
          <div className="flex justify-between text-[10px] md:text-xs font-bold text-slate-400 mb-1 md:mb-2 uppercase tracking-wider">
            <span>Erfahrung</span>
            <span>
              {Math.floor(gameState.xp)} / {requiredXpForNextLevel} XP
            </span>
          </div>
          <div className="h-3 md:h-4 bg-slate-800 rounded-full overflow-hidden border border-slate-700 mb-3 md:mb-4">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-1000 ease-out relative"
              style={{ width: `${xpPercentage}%` }}
            >
              <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(45deg,rgba(255,255,255,0.15)25%,transparent_25%,transparent_50%,rgba(255,255,255,0.15)50%,rgba(255,255,255,0.15)75%,transparent_75%,transparent)] bg-[length:1rem_1rem] animate-[stripes_1s_linear_infinite]"></div>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-1 md:gap-2">
            <div className="flex items-center justify-center gap-1 bg-slate-800/50 px-1 py-1 md:px-2 md:py-1.5 rounded-lg border border-slate-700/50">
              <Icon name="zap" className="w-3 h-3 md:w-4 md:h-4 text-amber-400" />
              <span className="text-[10px] md:text-xs font-mono font-bold text-slate-300">
                {gameState.skillPoints}
              </span>
            </div>
            <div className="flex items-center justify-center gap-1 bg-slate-800/50 px-1 py-1 md:px-2 md:py-1.5 rounded-lg border border-slate-700/50">
              <Icon name="move" className="w-3 h-3 md:w-4 md:h-4 text-emerald-400" />
              <span className="text-[10px] md:text-xs font-mono font-bold text-slate-300">
                {gameState.movementPoints}
              </span>
            </div>
            <div className="flex items-center justify-center gap-1 bg-slate-800/50 px-1 py-1 md:px-2 md:py-1.5 rounded-lg border border-slate-700/50">
              <Icon name="gold" className="w-3 h-3 md:w-4 md:h-4 text-yellow-500" />
              <span className="text-[10px] md:text-xs font-mono font-bold text-slate-300">
                {gameState.gold}
              </span>
            </div>
            <div className="flex items-center justify-center gap-1 bg-slate-800/50 px-1 py-1 md:px-2 md:py-1.5 rounded-lg border border-slate-700/50">
              <Icon name="mana" className="w-3 h-3 md:w-4 md:h-4 text-blue-400" />
              <span className="text-[10px] md:text-xs font-mono font-bold text-slate-300">
                {gameState.mana}
              </span>
            </div>
          </div>
        </div>

        {/* Utility buttons: Log + Dev toggle */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Game locked indicator */}
          {gameLocked && (
            <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-900/30 border border-red-700/40" title="Spiel ist gesperrt">
              <span className="text-sm">🔒</span>
              <span className="text-[10px] font-bold text-red-400 hidden md:inline">Gesperrt</span>
            </div>
          )}

          {/* Activity Log */}
          <button
            onClick={onOpenLog}
            className="p-2 rounded-lg bg-slate-800/50 border border-slate-700/50 text-slate-400 hover:text-slate-200 hover:border-slate-600 transition-all"
            title="Aktivitätsprotokoll"
          >
            <Icon name="eye" className="w-4 h-4" />
          </button>

          {/* Dev mode toggle */}
          <button
            onClick={onToggleDevMode}
            className={`p-2 rounded-lg border transition-all ${
              devMode
                ? "bg-amber-900/40 border-amber-600/50 text-amber-400"
                : "bg-slate-800/50 border-slate-700/50 text-slate-500 hover:text-slate-300"
            }`}
            title={devMode ? "Dev Mode: AN" : "Dev Mode: AUS"}
          >
            <span className="text-sm">🔧</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
