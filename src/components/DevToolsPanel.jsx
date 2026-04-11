import React, { useState } from "react";
import Icon from "./Icon";

const DevToolsPanel = ({
  gameState,
  devResetAll,
  devSetLevel,
  devSetResources,
  devAddXp,
  devUnlockAllSkills,
  devRevealAllTiles,
  devDefeatBoss,
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const [levelInput, setLevelInput] = useState(gameState.level);
  const [spInput, setSpInput] = useState(gameState.skillPoints);
  const [goldInput, setGoldInput] = useState(gameState.gold);
  const [manaInput, setManaInput] = useState(gameState.mana);
  const [mpInput, setMpInput] = useState(gameState.movementPoints);

  const handleApplyResources = () => {
    devSetResources({
      skillPoints: parseInt(spInput, 10) || 0,
      gold: parseInt(goldInput, 10) || 0,
      mana: parseInt(manaInput, 10) || 0,
      movementPoints: parseInt(mpInput, 10) || 0,
    });
  };

  if (collapsed) {
    return (
      <button
        onClick={() => setCollapsed(false)}
        className="fixed bottom-4 right-4 z-50 p-2 rounded-xl bg-slate-800 border border-slate-600 text-slate-400 hover:text-white hover:border-amber-500 transition-all"
        title="Dev Tools öffnen"
      >
        <Icon name="sliders" className="w-5 h-5" />
      </button>
    );
  }

  return (
    <div className="fixed top-4 right-4 z-50 w-80 max-h-[90vh] overflow-y-auto custom-scrollbar rounded-2xl bg-slate-900/95 backdrop-blur-xl border-2 border-amber-600/50 shadow-[0_0_40px_rgba(245,158,11,0.15)]">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-slate-700/50 bg-gradient-to-r from-amber-900/30 to-slate-900/50">
        <div className="flex items-center gap-2">
          <span className="text-lg">🔧</span>
          <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider">
            Dev Tools
          </h3>
        </div>
        <button
          onClick={() => setCollapsed(true)}
          className="p-1 rounded-md hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="p-4 space-y-5">
        {/* ═══ RESET ALL ═══ */}
        <div>
          <button
            onClick={() => {
              if (window.confirm("⚠️ ALLE Daten löschen und von vorne beginnen?")) {
                devResetAll();
              }
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm transition-all shadow-lg hover:shadow-red-500/25 active:scale-[0.97]"
          >
            ⚠️ RESET ALL — Alles löschen
          </button>
          <p className="text-[10px] text-slate-500 mt-1 text-center">
            Löscht gesamten Spielstand. Nicht widerrufbar!
          </p>
        </div>

        {/* ═══ LEVEL ═══ */}
        <div>
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 block">
            Level
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              min="1"
              max="100"
              value={levelInput}
              onChange={(e) => setLevelInput(e.target.value)}
              className="flex-1 bg-slate-800 border border-slate-600 rounded-lg px-3 py-1.5 text-sm text-white font-mono focus:border-amber-500 focus:outline-none"
            />
            <button
              onClick={() => devSetLevel(parseInt(levelInput, 10) || 1)}
              className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-colors"
            >
              Set
            </button>
          </div>
        </div>

        {/* ═══ RESOURCES ═══ */}
        <div>
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 block">
            Ressourcen
          </label>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-1.5 bg-slate-800 rounded-lg px-2 py-1.5 border border-slate-700">
              <Icon name="zap" className="w-3.5 h-3.5 text-amber-400" />
              <input
                type="number"
                value={spInput}
                onChange={(e) => setSpInput(e.target.value)}
                className="w-full bg-transparent text-xs text-white font-mono focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-1.5 bg-slate-800 rounded-lg px-2 py-1.5 border border-slate-700">
              <Icon name="gold" className="w-3.5 h-3.5 text-yellow-400" />
              <input
                type="number"
                value={goldInput}
                onChange={(e) => setGoldInput(e.target.value)}
                className="w-full bg-transparent text-xs text-white font-mono focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-1.5 bg-slate-800 rounded-lg px-2 py-1.5 border border-slate-700">
              <Icon name="mana" className="w-3.5 h-3.5 text-blue-400" />
              <input
                type="number"
                value={manaInput}
                onChange={(e) => setManaInput(e.target.value)}
                className="w-full bg-transparent text-xs text-white font-mono focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-1.5 bg-slate-800 rounded-lg px-2 py-1.5 border border-slate-700">
              <Icon name="move" className="w-3.5 h-3.5 text-emerald-400" />
              <input
                type="number"
                value={mpInput}
                onChange={(e) => setMpInput(e.target.value)}
                className="w-full bg-transparent text-xs text-white font-mono focus:outline-none"
              />
            </div>
          </div>
          <button
            onClick={handleApplyResources}
            className="w-full mt-2 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-bold transition-colors"
          >
            Ressourcen anwenden
          </button>
        </div>

        {/* ═══ QUICK XP ═══ */}
        <div>
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 block">
            Schnell XP
          </label>
          <div className="flex gap-2">
            {[100, 500, 1000].map((amount) => (
              <button
                key={amount}
                onClick={() => devAddXp(amount)}
                className="flex-1 py-1.5 rounded-lg bg-indigo-600/70 hover:bg-indigo-500 text-white text-xs font-bold transition-colors"
              >
                +{amount}
              </button>
            ))}
          </div>
        </div>

        {/* ═══ QUICK ACTIONS ═══ */}
        <div>
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 block">
            Quick Actions
          </label>
          <div className="space-y-2">
            <button
              onClick={devUnlockAllSkills}
              className="w-full py-1.5 rounded-lg bg-purple-600/70 hover:bg-purple-500 text-white text-xs font-bold transition-colors"
            >
              🔓 Alle Skills freischalten
            </button>
            <button
              onClick={devRevealAllTiles}
              className="w-full py-1.5 rounded-lg bg-emerald-600/70 hover:bg-emerald-500 text-white text-xs font-bold transition-colors"
            >
              🗺️ Alle Tiles aufdecken
            </button>
            <button
              onClick={devDefeatBoss}
              className="w-full py-1.5 rounded-lg bg-red-600/70 hover:bg-red-500 text-white text-xs font-bold transition-colors"
            >
              ⚔️ Boss besiegen
            </button>
          </div>
        </div>

        {/* ═══ STATE INSPECTOR ═══ */}
        <div>
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 block">
            State Inspector
          </label>
          <details className="bg-slate-800/50 rounded-lg border border-slate-700 overflow-hidden">
            <summary className="px-3 py-2 text-xs text-slate-400 cursor-pointer hover:text-white">
              gameState (JSON)
            </summary>
            <pre className="px-3 pb-3 text-[10px] text-slate-300 font-mono overflow-x-auto max-h-40 overflow-y-auto custom-scrollbar">
              {JSON.stringify(gameState, null, 2)}
            </pre>
          </details>
        </div>
      </div>
    </div>
  );
};

export default DevToolsPanel;
