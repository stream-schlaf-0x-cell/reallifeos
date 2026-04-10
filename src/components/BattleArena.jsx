import React from 'react';
import Icon from './Icon';
import ATTACKS from '../data/attacks.json';
import { PATH_COLORS } from '../data/constants';

const BattleArena = ({ gameState, executeAttack }) => {
  const bossHpPercentage = Math.min(
    100,
    Math.max(0, (gameState.bossHp / gameState.currentBoss.maxHp) * 100)
  );

  return (
    <div className="h-full overflow-y-auto pb-20 flex flex-col lg:flex-row gap-6 md:gap-8 pr-2 md:pr-4 custom-scrollbar">
      <div className="flex-1 bg-slate-900/60 border border-slate-700/50 rounded-3xl p-6 md:p-8 flex flex-col items-center justify-center relative overflow-hidden group min-h-[300px]">
        <div className="absolute inset-0 bg-gradient-to-t from-red-900/20 to-transparent opacity-50"></div>
        <h2 className="text-sm md:text-xl text-slate-400 uppercase tracking-widest mb-2 z-10 text-center">
          Aktueller Gegner
        </h2>
        <h1 className={`text-2xl md:text-4xl lg:text-5xl font-black text-center mb-6 md:mb-8 z-10 ${gameState.currentBoss.color} drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]`}>
          {gameState.currentBoss.name}
        </h1>
        <div className="w-32 h-32 md:w-48 md:h-48 mb-6 md:mb-8 relative z-10">
          <div className={`absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-950 rounded-full border-4 border-slate-700 animate-[spin_10s_linear_infinite] shadow-[0_0_50px_rgba(0,0,0,0.5)]`}></div>
          <div className={`absolute inset-4 bg-gradient-to-tr from-red-900/40 to-purple-900/40 rounded-full animate-[pulse_2s_ease-in-out_infinite]`}></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Icon name="eye" className={`w-12 h-12 md:w-16 md:h-16 ${gameState.currentBoss.color} opacity-50`} />
          </div>
        </div>
        <div className="w-full max-w-md z-10">
          <div className="flex justify-between text-xs md:text-sm font-bold mb-2">
            <span className="text-slate-300">Integrität</span>
            <span className="text-red-400">
              {gameState.bossHp} / {gameState.currentBoss.maxHp} HP
            </span>
          </div>
          <div className="h-4 md:h-6 bg-slate-950 rounded-full border-2 border-slate-800 overflow-hidden relative p-0.5">
            <div
              className="h-full bg-red-600 rounded-full transition-all duration-500 ease-out relative"
              style={{ width: `${bossHpPercentage}%` }}
            >
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-white/30 to-transparent"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-6">
        <div className="bg-slate-900/60 border border-slate-700/50 rounded-3xl p-4 md:p-6">
          <h3 className="text-base md:text-lg font-bold mb-4 flex items-center gap-2">
            <Icon name="zap" /> Aktionen (Angriffe)
          </h3>
          <div className="grid grid-cols-1 gap-3">
            {ATTACKS.map((attack) => (
              <button
                key={attack.id}
                onClick={() => executeAttack(attack)}
                className="p-3 md:p-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-500 rounded-xl text-left transition-all active:scale-95 group relative overflow-hidden"
              >
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity bg-gradient-to-r ${PATH_COLORS[attack.path]}`}></div>
                <div className="flex justify-between items-start relative z-10 mb-1">
                    <p className="font-bold text-sm md:text-base text-slate-200">
                        {attack.name}
                    </p>
                    <span className="text-red-400 font-mono text-sm md:text-base">
                        ⚔️ {attack.dmg}
                    </span>
                </div>
                <p className="text-xs text-slate-400 mb-3 relative z-10">{attack.desc}</p>
                <div className="flex gap-3 text-xs relative z-10 pt-2 border-t border-slate-700/50">
                    {attack.cost.mana > 0 && (
                        <span className="text-blue-400 font-mono flex items-center gap-1">
                            <Icon name="mana" className="w-3 h-3"/> -{attack.cost.mana}
                        </span>
                    )}
                    {attack.cost.gold > 0 && (
                        <span className="text-yellow-500 font-mono flex items-center gap-1">
                            <Icon name="gold" className="w-3 h-3"/> -{attack.cost.gold}
                        </span>
                    )}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-700/50 rounded-3xl p-4 md:p-6 flex-1 min-h-[150px] md:min-h-[200px] overflow-y-auto custom-scrollbar">
          <h3 className="text-base md:text-lg font-bold mb-4 flex items-center gap-2 text-slate-400">
            <Icon name="scroll" /> Chronik
          </h3>
          <div className="space-y-2 text-xs md:text-sm font-mono">
            {gameState.log.length === 0 && (
              <p className="text-slate-600 italic">
                Die Chronik ist leer.
              </p>
            )}
            {gameState.log.map((entry, i) => (
              <p key={i} className={`${i === 0 ? "text-slate-300" : "text-slate-600"}`}>
                {entry}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BattleArena;