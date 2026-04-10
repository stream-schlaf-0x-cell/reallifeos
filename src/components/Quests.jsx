import React from 'react';
import Icon from './Icon';
import PRESET_QUESTS from '../data/quests.json';
import { PATH_COLORS } from '../data/constants';

const Quests = ({ handleQuestComplete }) => {
  return (
    <div className="h-full overflow-y-auto pb-20 custom-scrollbar pr-2 md:pr-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {PRESET_QUESTS.map((quest) => (
          <button
            key={quest.id}
            onClick={() => handleQuestComplete(quest)}
            className="p-4 md:p-6 bg-slate-900/80 hover:bg-slate-800 border-2 border-slate-700/50 hover:border-slate-500 rounded-2xl text-left transition-all active:scale-95 group relative overflow-hidden flex flex-col justify-between min-h-[120px]"
          >
            <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity bg-gradient-to-r ${PATH_COLORS[quest.path]}`}></div>
            
            <div className="relative z-10 mb-4">
                <p className="font-bold text-base md:text-lg text-slate-200">
                {quest.name}
                </p>
                <p className="text-xs text-slate-400 uppercase tracking-widest mt-1">Pfad: {quest.path}</p>
            </div>

            <div className="flex justify-between items-center text-sm relative z-10 w-full mt-auto pt-4 border-t border-slate-700/50">
                <span className="text-indigo-400 font-mono font-bold flex items-center gap-1">
                    <Icon name="zap" className="w-4 h-4"/> +{quest.xp} XP
                </span>
                <span className="text-slate-400 font-mono text-xs flex gap-2">
                    {/* Simplified view of rewards to keep UI clean, the actual rewards are shown in the toast/log */}
                    <span>+Ressourcen</span>
                </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Quests;