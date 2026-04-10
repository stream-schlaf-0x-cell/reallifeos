import React, { useState } from 'react';
import Icon from './Icon';
import { PATH_COLORS } from '../data/constants';

const SkillTree = ({ gameState, unlockSkill }) => {
  const [selectedSkill, setSelectedSkill] = useState(null);

  const getPathSkills = (pathId) =>
    gameState.skills.filter((s) => s.path === pathId);

  const paths = [
    { id: "architect", title: "Der Architekt", sub: "Tech, Docker, AI", colorTheme: "blue" },
    { id: "socratic", title: "Der Sokratiker", sub: "Lehre, Philosophie", colorTheme: "amber" },
    { id: "bard", title: "Der Barde", sub: "Ableton, Ambient", colorTheme: "purple" },
    { id: "monk", title: "Der Mönch", sub: "Qi Gong, Zazen", colorTheme: "emerald" },
    { id: "acrobat", title: "Der Akrobat", sub: "Jonglage, Gym", colorTheme: "red" },
  ];

  return (
    <>
      <div className="h-full overflow-y-auto overflow-x-auto pb-20 custom-scrollbar pr-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 min-w-[1000px] md:min-w-0">
          {paths.map((path) => (
            <div key={path.id} className="flex flex-col gap-4">
              <div className="text-center mb-4 sticky top-0 bg-slate-950/80 backdrop-blur py-2 z-10 border-b border-slate-800">
                <h2 className={`text-xl font-bold text-${path.colorTheme}-400 uppercase tracking-widest`}>
                  {path.title}
                </h2>
                <p className="text-xs text-slate-500">{path.sub}</p>
              </div>
              {getPathSkills(path.id).map((skill) => {
                const isUnlocked = skill.unlocked;
                const reqsMet = skill.req.every(
                  (reqId) => gameState.skills.find((s) => s.id === reqId)?.unlocked
                );
                const isAvailable = !isUnlocked && reqsMet;
                return (
                  <button
                    key={skill.id}
                    onClick={() => setSelectedSkill(skill)}
                    className={`relative p-4 rounded-xl border-2 text-left transition-all duration-300 group ${
                      isUnlocked
                        ? `bg-gradient-to-br ${PATH_COLORS[path.id]} opacity-100`
                        : isAvailable
                        ? "bg-slate-800 border-slate-600 hover:border-slate-400 opacity-90 cursor-pointer"
                        : "bg-slate-900 border-slate-800 opacity-40 cursor-not-allowed grayscale"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className={`p-2 rounded-lg ${isUnlocked ? "bg-black/30" : "bg-slate-700/50"}`}>
                        <Icon name={skill.icon} className="w-5 h-5" />
                      </div>
                      {!isUnlocked && (
                        <span className="text-xs font-mono bg-slate-900 px-2 py-1 rounded text-amber-400">
                          {skill.cost} SP
                        </span>
                      )}
                    </div>
                    <h3 className={`font-bold leading-tight mb-1 ${isUnlocked ? "text-white" : "text-slate-300"}`}>
                      {skill.name}
                    </h3>
                    {skill.req.length > 0 && !isUnlocked && (
                      <div className="absolute -top-3 left-1/2 w-0.5 h-3 bg-slate-700"></div>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {selectedSkill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 p-6 md:p-8 rounded-3xl max-w-md w-full shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setSelectedSkill(null)}
              className="absolute top-4 right-4 text-slate-500 hover:text-white"
            >
              ✕
            </button>
            <div className="flex items-center gap-4 mb-6">
              <div className={`p-4 rounded-2xl bg-gradient-to-br ${PATH_COLORS[selectedSkill.path]}`}>
                <Icon name={selectedSkill.icon} className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-xl md:text-2xl font-bold">{selectedSkill.name}</h2>
                <p className="text-slate-400 uppercase tracking-widest text-xs">
                  Pfad: {selectedSkill.path}
                </p>
              </div>
            </div>
            <p className="text-slate-300 mb-8 leading-relaxed text-sm md:text-base">
              {selectedSkill.desc}
            </p>
            {!selectedSkill.unlocked && (
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 mb-8">
                <p className="text-sm text-slate-400 mb-2">Voraussetzungen:</p>
                {selectedSkill.req.length === 0 ? (
                  <p className="text-sm text-emerald-400">Keine</p>
                ) : (
                  <ul className="text-sm space-y-1">
                    {selectedSkill.req.map((reqId) => {
                      const reqSkill = gameState.skills.find((s) => s.id === reqId);
                      const isMet = reqSkill?.unlocked;
                      return (
                        <li key={reqId} className={`flex items-center gap-2 ${isMet ? "text-emerald-400" : "text-red-400"}`}>
                          <span>{isMet ? "✓" : "✗"}</span> {reqSkill?.name || "Unbekannt"}
                        </li>
                      );
                    })}
                  </ul>
                )}
                <div className="mt-4 pt-4 border-t border-slate-800 flex justify-between items-center">
                  <span className="text-sm text-slate-400">Kosten:</span>
                  <span className={`font-mono font-bold ${gameState.skillPoints >= selectedSkill.cost ? "text-amber-400" : "text-red-400"}`}>
                    {selectedSkill.cost} SP
                  </span>
                </div>
              </div>
            )}
            {selectedSkill.unlocked ? (
              <button disabled className="w-full py-4 rounded-xl bg-slate-800 text-emerald-400 font-bold border border-emerald-900/50 cursor-not-allowed">
                Bereits freigeschaltet
              </button>
            ) : (
              <button
                onClick={() => {
                  if (unlockSkill(selectedSkill.id)) {
                    setSelectedSkill(null);
                  }
                }}
                className={`w-full py-4 rounded-xl font-bold transition-all ${
                  gameState.skillPoints >= selectedSkill.cost &&
                  selectedSkill.req.every((r) => gameState.skills.find((s) => s.id === r)?.unlocked)
                    ? "bg-amber-500 hover:bg-amber-400 text-slate-900 shadow-[0_0_20px_rgba(245,158,11,0.4)]"
                    : "bg-slate-800 text-slate-500 cursor-not-allowed"
                }`}
              >
                Skill Freischalten
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default SkillTree;