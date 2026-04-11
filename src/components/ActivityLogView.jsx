import React, { useState } from "react";
import Icon from "./Icon";

const LOG_TYPE_CONFIG = {
  QUEST: { emoji: "📜", color: "text-amber-400", bg: "bg-amber-900/20 border-amber-700/30" },
  CLAIM: { emoji: "✍️", color: "text-emerald-400", bg: "bg-emerald-900/20 border-emerald-700/30" },
  COMBAT: { emoji: "⚔️", color: "text-red-400", bg: "bg-red-900/20 border-red-700/30" },
  SKILL: { emoji: "🧠", color: "text-purple-400", bg: "bg-purple-900/20 border-purple-700/30" },
  MAP: { emoji: "🗺️", color: "text-cyan-400", bg: "bg-cyan-900/20 border-cyan-700/30" },
  BOSS: { emoji: "💀", color: "text-orange-400", bg: "bg-orange-900/20 border-orange-700/30" },
  LEVEL: { emoji: "⬆️", color: "text-indigo-400", bg: "bg-indigo-900/20 border-indigo-700/30" },
  SYSTEM: { emoji: "⚙️", color: "text-slate-400", bg: "bg-slate-800/30 border-slate-600/30" },
};

const ALL_TYPES = ["ALL", "QUEST", "CLAIM", "COMBAT", "SKILL", "MAP", "BOSS", "LEVEL", "SYSTEM"];

const ActivityLogView = ({ gameState, onClose }) => {
  const [filter, setFilter] = useState("ALL");

  const logs = (gameState.log || []).filter((entry) => {
    if (filter === "ALL") return true;
    return entry.type === filter;
  });

  const handleExport = () => {
    const data = JSON.stringify(gameState.log || [], null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `reallifeos-log-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[85vh] rounded-2xl bg-slate-900 border-2 border-slate-600/50 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700/50 bg-gradient-to-r from-slate-800/50 to-slate-900/50 shrink-0">
          <div className="flex items-center gap-2">
            <Icon name="sliders" className="w-5 h-5 text-slate-300" />
            <h3 className="text-base font-bold text-slate-200">Aktivitätsprotokoll</h3>
            <span className="text-xs text-slate-500 font-mono">
              ({(gameState.log || []).length} Einträge)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExport}
              className="px-3 py-1 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs font-bold transition-colors"
              title="Log als JSON exportieren"
            >
              📥 Export
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-md hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex flex-wrap gap-1.5 p-3 border-b border-slate-800/50 shrink-0">
          {ALL_TYPES.map((type) => {
            const config = type !== "ALL" ? LOG_TYPE_CONFIG[type] : null;
            return (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                  filter === type
                    ? "bg-slate-600 text-white shadow"
                    : "bg-slate-800/50 text-slate-500 hover:text-slate-300 hover:bg-slate-700/50"
                }`}
              >
                {type === "ALL" ? "Alle" : `${config?.emoji} ${type}`}
              </button>
            );
          })}
        </div>

        {/* Log entries */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-1.5">
          {logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-500">
              <Icon name="eye" className="w-8 h-8 mb-2 opacity-30" />
              <p className="text-sm">Keine Einträge gefunden.</p>
            </div>
          ) : (
            logs.map((entry, i) => {
              const config = LOG_TYPE_CONFIG[entry.type] || LOG_TYPE_CONFIG.SYSTEM;
              return (
                <div
                  key={i}
                  className={`flex items-start gap-2.5 p-2.5 rounded-lg border ${config.bg} transition-colors`}
                >
                  <span className="text-base shrink-0 mt-0.5">{config.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-200 leading-snug">{entry.message}</p>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                      {entry.time || entry.timestamp}
                    </p>
                  </div>
                  <span
                    className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded shrink-0 ${config.bg}`}
                    style={{ color: "inherit" }}
                  >
                    {entry.type}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivityLogView;
