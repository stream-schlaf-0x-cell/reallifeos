import React, { useState } from "react";
import Icon from "./Icon";

const PATHS = [
  { id: "architect", emoji: "🏗️", label: "Architekt", color: "blue" },
  { id: "socratic", emoji: "📜", label: "Sokratiker", color: "amber" },
  { id: "bard", emoji: "🎵", label: "Barde", color: "purple" },
  { id: "monk", emoji: "🧘", label: "Mönch", color: "emerald" },
  { id: "acrobat", emoji: "🤸", label: "Akrobat", color: "red" },
];

const PATH_BORDER = {
  architect: "border-blue-500 bg-blue-500/20 text-blue-400",
  socratic: "border-amber-500 bg-amber-500/20 text-amber-400",
  bard: "border-purple-500 bg-purple-500/20 text-purple-400",
  monk: "border-emerald-500 bg-emerald-500/20 text-emerald-400",
  acrobat: "border-red-500 bg-red-500/20 text-red-400",
};

const PATH_BTN = {
  architect: "border-blue-600 bg-blue-900/40 hover:bg-blue-800/60 text-blue-300",
  socratic: "border-amber-600 bg-amber-900/40 hover:bg-amber-800/60 text-amber-300",
  bard: "border-purple-600 bg-purple-900/40 hover:bg-purple-800/60 text-purple-300",
  monk: "border-emerald-600 bg-emerald-900/40 hover:bg-emerald-800/60 text-emerald-300",
  acrobat: "border-red-600 bg-red-900/40 hover:bg-red-800/60 text-red-300",
};

const AddQuestModal = ({ onAdd, onClose }) => {
  const [name, setName] = useState("");
  const [path, setPath] = useState("monk");
  const [xp, setXp] = useState(30);
  const [description, setDescription] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAdd({ name: name.trim(), path, xp: parseInt(xp, 10) || 30, description: description.trim() });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-md rounded-2xl bg-slate-900 border-2 border-amber-600/50 shadow-[0_0_60px_rgba(245,158,11,0.1)] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700/50 bg-gradient-to-r from-amber-900/30 to-slate-900/50">
          <div className="flex items-center gap-2">
            <Icon name="scroll" className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-amber-400">Neue Quest erstellen</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Name */}
          <div>
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 block">
              Quest-Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="z.B. 30 Min. Meditation am Morgen"
              className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
              autoFocus
            />
          </div>

          {/* Path selector */}
          <div>
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 block">
              Pfad
            </label>
            <div className="grid grid-cols-5 gap-1.5">
              {PATHS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPath(p.id)}
                  className={`flex flex-col items-center gap-0.5 p-2 rounded-lg border-2 transition-all ${
                    path === p.id
                      ? PATH_BORDER[p.id]
                      : "border-slate-700 bg-slate-800/50 text-slate-500 hover:border-slate-600"
                  }`}
                >
                  <span className="text-lg">{p.emoji}</span>
                  <span className="text-[8px] font-bold leading-tight">{p.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* XP */}
          <div>
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 block">
              XP Belohnung
            </label>
            <div className="flex gap-2">
              {[10, 20, 30, 50, 75, 100].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setXp(val)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    xp === val
                      ? "bg-indigo-600 text-white shadow-lg"
                      : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200 border border-slate-700"
                  }`}
                >
                  {val}
                </button>
              ))}
            </div>
            <input
              type="number"
              min="1"
              max="999"
              value={xp}
              onChange={(e) => setXp(e.target.value)}
              className="w-full mt-2 bg-slate-800 border border-slate-600 rounded-lg px-3 py-1.5 text-sm text-white font-mono focus:border-amber-500 focus:outline-none"
            />
          </div>

          {/* Description (optional) */}
          <div>
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 block">
              Beschreibung (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Details zur Aufgabe..."
              rows={2}
              className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none resize-none"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={!name.trim()}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-bold text-sm shadow-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-[0.97]"
          >
            Quest erstellen
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddQuestModal;
