import React from 'react';
import Icon from './Icon';

const Header = ({ gameState, devMode, onToggleDevMode, onOpenLog, gameLocked, onBackup, onReloadConfig }) => {
  const requiredXpForNextLevel = Math.floor(
    100 * Math.pow(1.5, gameState.level - 1)
  );

  const xpPercentage = Math.min(
    100,
    Math.max(0, (gameState.xp / requiredXpForNextLevel) * 100)
  );

  return (
    <header className="backdrop-blur-md rounded-2xl p-4 md:p-6 mb-4 md:mb-6 shadow-2xl shrink-0 border" style={{
      backgroundColor: 'rgba(15, 23, 42, 0.8)',
      borderColor: 'var(--border-primary)',
    }}>
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 md:gap-6">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center text-xl md:text-2xl font-bold border-2 shrink-0" style={{
            background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
            boxShadow: '0 0 20px rgba(139, 92, 246, 0.4)',
            borderColor: 'var(--accent-primary)',
          }}>
            L{gameState.level}
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black tracking-tight bg-clip-text text-transparent" style={{
              backgroundImage: 'linear-gradient(to right, var(--text-primary), var(--text-secondary))',
            }}>
              Tim&apos;s Second Brain RPG
            </h1>
            <p className="text-xs md:text-sm" style={{ color: 'var(--text-secondary)' }}>
              Meister der Disziplinen • Ethik & Algorithmen
            </p>
          </div>
        </div>

        <div className="flex-1 w-full max-w-md">
          <div className="flex justify-between text-[10px] md:text-xs font-bold uppercase tracking-wider mb-1 md:mb-2" style={{ color: 'var(--text-secondary)' }}>
            <span>Erfahrung</span>
            <span>
              {Math.floor(gameState.xp)} / {requiredXpForNextLevel} XP
            </span>
          </div>
          <div className="h-3 md:h-4 rounded-full overflow-hidden border mb-3 md:mb-4 p-0.5" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }}>
            <div
              className="h-full rounded-full transition-all duration-1000 ease-out relative"
              style={{
                width: `${xpPercentage}%`,
                background: 'linear-gradient(to right, var(--accent-primary), var(--accent-secondary), #ec4899)',
              }}
            >
              <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(45deg,rgba(255,255,255,0.15)25%,transparent_25%,transparent_50%,rgba(255,255,255,0.15)50%,rgba(255,255,255,0.15)75%,transparent_75%,transparent)] bg-[length:1rem_1rem] animate-[stripes_1s_linear_infinite]"></div>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-1 md:gap-2">
            <div className="flex items-center justify-center gap-1 px-1 py-1 md:px-2 md:py-1.5 rounded-lg border" style={{ backgroundColor: 'rgba(30, 41, 59, 0.5)', borderColor: 'var(--border-primary)' }}>
              <Icon name="zap" className="w-3 h-3 md:w-4 md:h-4" style={{ color: 'var(--resource-sp)' }} />
              <span className="text-[10px] md:text-xs font-mono font-bold" style={{ color: 'var(--text-primary)' }}>
                {gameState.skillPoints}
              </span>
            </div>
            <div className="flex items-center justify-center gap-1 px-1 py-1 md:px-2 md:py-1.5 rounded-lg border" style={{ backgroundColor: 'rgba(30, 41, 59, 0.5)', borderColor: 'var(--border-primary)' }}>
              <Icon name="move" className="w-3 h-3 md:w-4 md:h-4" style={{ color: 'var(--resource-mp)' }} />
              <span className="text-[10px] md:text-xs font-mono font-bold" style={{ color: 'var(--text-primary)' }}>
                {gameState.movementPoints}
              </span>
            </div>
            <div className="flex items-center justify-center gap-1 px-1 py-1 md:px-2 md:py-1.5 rounded-lg border" style={{ backgroundColor: 'rgba(30, 41, 59, 0.5)', borderColor: 'var(--border-primary)' }}>
              <Icon name="gold" className="w-3 h-3 md:w-4 md:h-4" style={{ color: 'var(--resource-gold)' }} />
              <span className="text-[10px] md:text-xs font-mono font-bold" style={{ color: 'var(--text-primary)' }}>
                {gameState.gold}
              </span>
            </div>
            <div className="flex items-center justify-center gap-1 px-1 py-1 md:px-2 md:py-1.5 rounded-lg border" style={{ backgroundColor: 'rgba(30, 41, 59, 0.5)', borderColor: 'var(--border-primary)' }}>
              <Icon name="mana" className="w-3 h-3 md:w-4 md:h-4" style={{ color: 'var(--resource-mana)' }} />
              <span className="text-[10px] md:text-xs font-mono font-bold" style={{ color: 'var(--text-primary)' }}>
                {gameState.mana}
              </span>
            </div>
          </div>
        </div>

        {/* Utility buttons: Log + Dev toggle + Backup + Reload */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Game locked indicator */}
          {gameLocked && (
            <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border" style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', borderColor: 'rgba(239, 68, 68, 0.3)' }} title="Spiel ist gesperrt">
              <span className="text-sm">🔒</span>
              <span className="text-[10px] font-bold hidden md:inline" style={{ color: 'var(--path-acrobat)' }}>Gesperrt</span>
            </div>
          )}

          {/* Backup State */}
          {onBackup && (
            <button
              onClick={onBackup}
              className="p-2 rounded-lg border transition-all text-sm"
              style={{ backgroundColor: 'rgba(30, 41, 59, 0.5)', borderColor: 'var(--border-primary)', color: 'var(--text-secondary)' }}
              title="Spielstand sichern"
            >
              💾
            </button>
          )}

          {/* Reload Config */}
          {onReloadConfig && (
            <button
              onClick={onReloadConfig}
              className="p-2 rounded-lg border transition-all text-sm"
              style={{ backgroundColor: 'rgba(30, 41, 59, 0.5)', borderColor: 'var(--border-primary)', color: 'var(--text-secondary)' }}
              title="Spiel-Konfiguration neu laden"
            >
              🔄
            </button>
          )}

          {/* Activity Log */}
          <button
            onClick={onOpenLog}
            className="p-2 rounded-lg border transition-all"
            style={{ backgroundColor: 'rgba(30, 41, 59, 0.5)', borderColor: 'var(--border-primary)', color: 'var(--text-secondary)' }}
            title="Aktivitätsprotokoll"
          >
            <Icon name="eye" className="w-4 h-4" />
          </button>

          {/* Dev mode toggle */}
          <button
            onClick={onToggleDevMode}
            className={`p-2 rounded-lg border transition-all ${
              devMode ? "" : "hover:text-slate-300"
            }`}
            style={{
              backgroundColor: devMode ? 'rgba(245, 158, 11, 0.2)' : 'rgba(30, 41, 59, 0.5)',
              borderColor: devMode ? 'rgba(245, 158, 11, 0.4)' : 'var(--border-primary)',
              color: devMode ? 'var(--resource-sp)' : 'var(--text-muted)',
            }}
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
