# RealLifeOS - Code Zusammenfassung

Generiert am: Sun Apr 12 14:26:58 UTC 2026

## 📁 Verzeichnisstruktur

```
.
├── CODE_SUMMARY.md
├── IMPLEMENTATION_PLAN.md
├── README.md
├── create_summary.sh
├── dist
│   ├── assets
│   │   ├── index-Cg8Uc_x5.js
│   │   └── index-ajOMCbD1.css
│   ├── favicon.svg
│   ├── icons.svg
│   ├── index.html
│   └── xxx
├── eslint.config.js
├── index.html
├── package-lock.json
├── package.json
├── public
│   ├── favicon.svg
│   ├── icons.svg
│   └── xxx
├── src
│   ├── App.jsx
│   ├── assets
│   │   ├── hero.png
│   │   ├── react.svg
│   │   ├── vite.svg
│   │   └── x
│   ├── components
│   │   ├── ActivityLogView.jsx
│   │   ├── AddQuestModal.jsx
│   │   ├── BattleArena.jsx
│   │   ├── DevToolsPanel.jsx
│   │   ├── Header.jsx
│   │   ├── Icon.jsx
│   │   ├── Layout.jsx
│   │   ├── Navigation.jsx
│   │   ├── Quests.jsx
│   │   ├── SkillTree.jsx
│   │   ├── WorldMap.jsx
│   │   └── vite.svg
│   ├── data
│   │   ├── attacks.json
│   │   ├── bosses.json
│   │   ├── constants.js
│   │   ├── map.json
│   │   ├── quests.json
│   │   ├── skillTreeData.js
│   │   ├── skills.json
│   │   └── xxx
│   ├── engine
│   │   ├── audioEngine.js
│   │   └── particleEngine.js
│   ├── hooks
│   │   └── useGameState.js
│   ├── index.css
│   ├── main.jsx
│   └── utils
│       └── mapGenerator.js
└── vite.config.js

11 directories, 49 files
```

## ⚙️ Konfigurationsdateien

### package.json
```json
{
  "name": "temp",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint .",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^19.2.4",
    "react-dom": "^19.2.4"
  },
  "devDependencies": {
    "@eslint/js": "^9.39.4",
    "@tailwindcss/vite": "^4.2.2",
    "@types/react": "^19.2.14",
    "@types/react-dom": "^19.2.3",
    "@vitejs/plugin-react": "^6.0.1",
    "autoprefixer": "^10.4.27",
    "eslint": "^9.39.4",
    "eslint-plugin-react-hooks": "^7.0.1",
    "eslint-plugin-react-refresh": "^0.5.2",
    "globals": "^17.4.0",
    "postcss": "^8.5.9",
    "tailwindcss": "^4.2.2",
    "vite": "^8.0.4"
  }
}
```

### vite.config.js
```json
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
})```

### eslint.config.js
```json
import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
    },
  },
])
```

## 🧩 React Komponenten (src/components/)

### ActivityLogView.jsx
```jsx
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
```

### AddQuestModal.jsx
```jsx
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
```

### BattleArena.jsx
```jsx
import React, { useState, useEffect, useRef } from "react";
import Icon from "./Icon";
import { PATH_COLORS } from "../data/constants";

const ACTION_TYPE_STYLES = {
  attack: {
    border: "border-red-800/60 hover:border-red-600",
    badge: "bg-red-900/60 text-red-300",
    label: "Angriff",
    icon: "⚔️",
  },
  crit: {
    border: "border-yellow-700/60 hover:border-yellow-500",
    badge: "bg-yellow-900/60 text-yellow-300",
    label: "Kritisch",
    icon: "💥",
  },
  shield: {
    border: "border-blue-800/60 hover:border-blue-600",
    badge: "bg-blue-900/60 text-blue-300",
    label: "Schild",
    icon: "🛡️",
  },
};

const BattleArena = ({ gameState, executeAttack, getAvailableActions, clearDamageEvent }) => {
  const [bossAnim, setBossAnim] = useState("");
  const [floatDmg, setFloatDmg] = useState(null); // { value, type, id }
  const floatIdRef = useRef(0);
  const actions = getAvailableActions();

  const bossHpPercentage = Math.min(
    100,
    Math.max(0, (gameState.bossHp / gameState.currentBoss.maxHp) * 100)
  );

  // Trigger boss animation when damage event changes
  useEffect(() => {
    if (gameState.lastDamageAmount > 0 && gameState.lastDamageType) {
      const type = gameState.lastDamageType;
      // Set floating damage number
      const fid = ++floatIdRef.current;
      setFloatDmg({ value: gameState.lastDamageAmount, type, id: fid });

      // Trigger boss animation
      if (type === "crit") {
        setBossAnim("animate-crit-flash animate-shake");
      } else if (type === "shield") {
        setBossAnim("animate-shield-glow");
      } else {
        setBossAnim("animate-flash-hit animate-shake");
      }

      // Clear after animation
      const t1 = setTimeout(() => setBossAnim(""), 600);
      const t2 = setTimeout(() => setFloatDmg(null), 1000);
      const t3 = setTimeout(() => clearDamageEvent(), 1200);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    }
  }, [gameState.lastDamageAmount, gameState.lastDamageType, clearDamageEvent]);

  const handleAction = (action) => {
    executeAttack(action);
  };

  const canAfford = (action) => {
    return (
      gameState.mana >= action.cost.mana && gameState.gold >= action.cost.gold
    );
  };

  // Group actions by type
  const basicActions = actions.filter((a) => !a.requiresSkill);
  const skillActions = actions.filter((a) => a.requiresSkill);

  return (
    <div className="h-full overflow-y-auto pb-20 flex flex-col lg:flex-row gap-6 md:gap-8 pr-2 md:pr-4 custom-scrollbar">
      {/* LEFT: Boss Display */}
      <div className="flex-1 bg-slate-900/60 border border-slate-700/50 rounded-3xl p-6 md:p-8 flex flex-col items-center justify-center relative overflow-hidden group min-h-[300px]">
        {/* Background ambient glow */}
        <div className="absolute inset-0 bg-gradient-to-t from-red-900/20 to-transparent opacity-50"></div>

        {/* Shield overlay on boss */}
        {gameState.playerShield > 0 && (
          <div className="absolute top-4 right-4 flex items-center gap-1 bg-blue-900/50 border border-blue-600/50 rounded-lg px-2 py-1 text-xs z-20">
            <span className="text-blue-300">🛡️</span>
            <span className="text-blue-300 font-mono">
              {gameState.playerShield} ({gameState.shieldTurnsLeft} Züge)
            </span>
          </div>
        )}

        <h2 className="text-sm md:text-xl text-slate-400 uppercase tracking-widest mb-2 z-10 text-center">
          Aktueller Gegner
        </h2>
        <h1
          className={`text-2xl md:text-4xl lg:text-5xl font-black text-center mb-6 md:mb-8 z-10 ${gameState.currentBoss.color} drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]`}
        >
          {gameState.currentBoss.name}
        </h1>

        {/* Boss Avatar with animations */}
        <div className="w-32 h-32 md:w-48 md:h-48 mb-6 md:mb-8 relative z-10">
          <div
            className={`absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-950 rounded-full border-4 border-slate-700 animate-[spin_10s_linear_infinite] shadow-[0_0_50px_rgba(0,0,0,0.5)] ${bossAnim}`}
          ></div>
          <div
            className={`absolute inset-4 bg-gradient-to-tr from-red-900/40 to-purple-900/40 rounded-full animate-[pulse_2s_ease-in-out_infinite]`}
          ></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Icon
              name="eye"
              className={`w-12 h-12 md:w-16 md:h-16 ${gameState.currentBoss.color} opacity-50`}
            />
          </div>
        </div>

        {/* Floating Damage Number */}
        {floatDmg && (
          <div
            key={floatDmg.id}
            className={`absolute z-30 pointer-events-none font-black text-2xl md:text-4xl animate-float-dmg ${
              floatDmg.type === "crit"
                ? "text-yellow-300 drop-shadow-[0_0_10px_rgba(250,204,0,0.8)]"
                : floatDmg.type === "shield"
                ? "text-blue-300 drop-shadow-[0_0_10px_rgba(96,165,250,0.8)]"
                : "text-red-400 drop-shadow-[0_0_10px_rgba(248,113,113,0.8)]"
            }`}
            style={{ top: "30%", left: "50%", transform: "translateX(-50%)" }}
          >
            {floatDmg.type === "shield"
              ? `🛡️ +${floatDmg.value}`
              : floatDmg.type === "crit"
              ? `💥 ${floatDmg.value}!`
              : `-${floatDmg.value}`}
          </div>
        )}

        {/* HP Bar */}
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

      {/* RIGHT: Actions + Combat Log */}
      <div className="flex-1 flex flex-col gap-6">
        {/* Basic Actions */}
        <div className="bg-slate-900/60 border border-slate-700/50 rounded-3xl p-4 md:p-6">
          <h3 className="text-base md:text-lg font-bold mb-4 flex items-center gap-2">
            <Icon name="zap" /> Basis-Angriffe
          </h3>
          <div className="grid grid-cols-1 gap-3">
            {basicActions.map((action) => {
              const style = ACTION_TYPE_STYLES[action.type] || ACTION_TYPE_STYLES.attack;
              const affordable = canAfford(action);
              return (
                <button
                  key={action.id}
                  onClick={() => affordable && handleAction(action)}
                  disabled={!affordable}
                  className={`p-3 md:p-4 border rounded-xl text-left transition-all active:scale-95 group relative overflow-hidden ${
                    style.border
                  } ${
                    !affordable
                      ? "opacity-40 cursor-not-allowed"
                      : "hover:bg-slate-800/80"
                  }`}
                >
                  {/* Hover gradient */}
                  <div
                    className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity bg-gradient-to-r ${
                      PATH_COLORS[action.path]
                    }`}
                  ></div>

                  <div className="flex justify-between items-start relative z-10 mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{style.icon}</span>
                      <p className="font-bold text-sm md:text-base text-slate-200">
                        {action.name}
                      </p>
                    </div>
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-full ${style.badge}`}
                    >
                      {action.dmg > 0 ? `⚔️ ${action.dmg}` : `🛡️ ${action.shield}`}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mb-3 relative z-10">
                    {action.desc}
                  </p>
                  <div className="flex gap-3 text-xs relative z-10 pt-2 border-t border-slate-700/50">
                    {action.cost.mana > 0 && (
                      <span className="text-blue-400 font-mono flex items-center gap-1">
                        <Icon name="mana" className="w-3 h-3" />{" "}
                        {action.cost.mana}
                      </span>
                    )}
                    {action.cost.gold > 0 && (
                      <span className="text-yellow-500 font-mono flex items-center gap-1">
                        <Icon name="gold" className="w-3 h-3" />{" "}
                        {action.cost.gold}
                      </span>
                    )}
                    {action.shield && (
                      <span className="text-blue-300 font-mono flex items-center gap-1">
                        🛡️ {action.shield} ({action.shieldDuration}Z)
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Skill-Unlock Actions (if any skills are unlocked) */}
        {skillActions.length > 0 && (
          <div className="bg-slate-900/60 border border-slate-700/50 rounded-3xl p-4 md:p-6">
            <h3 className="text-base md:text-lg font-bold mb-4 flex items-center gap-2 text-amber-400">
              <Icon name="brain" /> Spezialfähigkeiten
              <span className="text-[10px] text-slate-500 font-normal ml-1">
                (durch Skills freigeschaltet)
              </span>
            </h3>
            <div className="grid grid-cols-1 gap-3">
              {skillActions.map((action) => {
                const style = ACTION_TYPE_STYLES[action.type] || ACTION_TYPE_STYLES.attack;
                const affordable = canAfford(action);
                const unlockedSkill = gameState.skills.find(
                  (s) => s.id === action.requiresSkill
                );
                const isUnlocked = unlockedSkill?.unlocked;
                return (
                  <button
                    key={action.id}
                    onClick={() => isUnlocked && affordable && handleAction(action)}
                    disabled={!isUnlocked || !affordable}
                    className={`p-3 md:p-4 border rounded-xl text-left transition-all active:scale-95 group relative overflow-hidden ${
                      style.border
                    } ${
                      !isUnlocked || !affordable
                        ? "opacity-40 cursor-not-allowed"
                        : "hover:bg-slate-800/80"
                    }`}
                  >
                    {/* Hover gradient */}
                    <div
                      className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity bg-gradient-to-r ${
                        PATH_COLORS[action.path]
                      }`}
                    ></div>

                    {/* Lock overlay if not unlocked */}
                    {!isUnlocked && (
                      <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center z-20">
                        <span className="text-slate-500 text-xs font-bold flex items-center gap-1">
                          🔒 {unlockedSkill?.name || "Skill benötigt"}
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between items-start relative z-10 mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{style.icon}</span>
                        <p className="font-bold text-sm md:text-base text-slate-200">
                          {action.name}
                        </p>
                      </div>
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-full ${style.badge}`}
                      >
                        {action.dmg > 0 ? `⚔️ ${action.dmg}` : `🛡️ ${action.shield}`}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mb-3 relative z-10">
                      {action.desc}
                    </p>
                    <div className="flex gap-3 text-xs relative z-10 pt-2 border-t border-slate-700/50">
                      {action.cost.mana > 0 && (
                        <span className="text-blue-400 font-mono flex items-center gap-1">
                          <Icon name="mana" className="w-3 h-3" />{" "}
                          {action.cost.mana}
                        </span>
                      )}
                      {action.cost.gold > 0 && (
                        <span className="text-yellow-500 font-mono flex items-center gap-1">
                          <Icon name="gold" className="w-3 h-3" />{" "}
                          {action.cost.gold}
                        </span>
                      )}
                      {action.shield && (
                        <span className="text-blue-300 font-mono flex items-center gap-1">
                          🛡️ {action.shield} ({action.shieldDuration}Z)
                        </span>
                      )}
                      {action.reflect && (
                        <span className="text-purple-300 font-mono flex items-center gap-1">
                          🔄 {action.reflect} Reflektion
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Combat Log */}
        <div className="bg-slate-900/60 border border-slate-700/50 rounded-3xl p-4 md:p-6 flex-1 min-h-[150px] md:min-h-[200px] overflow-y-auto custom-scrollbar">
          <h3 className="text-base md:text-lg font-bold mb-4 flex items-center gap-2 text-slate-400">
            <Icon name="scroll" /> Kampfchronik
          </h3>
          <div className="space-y-2 text-xs md:text-sm font-mono">
            {gameState.combatLog.length === 0 && (
              <p className="text-slate-600 italic">
                Noch keine Kämpfe aufgezeichnet.
              </p>
            )}
            {gameState.combatLog.map((entry, i) => (
              <p
                key={i}
                className={`${
                  i === 0
                    ? "text-slate-300"
                    : entry.includes("BESIEGT")
                    ? "text-emerald-400"
                    : entry.includes("Hinterhalt")
                    ? "text-orange-400"
                    : "text-slate-600"
                }`}
              >
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
```

### DevToolsPanel.jsx
```jsx
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
```

### Header.jsx
```jsx
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
```

### Icon.jsx
```jsx
import React from 'react';

const Icon = ({ name, className = "w-6 h-6" }) => {
  const icons = {
    server: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"
      />
    ),
    database: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"
      />
    ),
    book: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
      />
    ),
    brain: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
      />
    ),
    globe: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    ),
    scroll: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    ),
    edit: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
      />
    ),
    pen: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
      />
    ),
    eye: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
      />
    ),
    crown: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    ),
    music: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
      />
    ),
    radio: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9"
      />
    ),
    headphones: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M10 19l-7-7m0 0l7-7m-7 7h18"
      />
    ),
    cloud: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"
      />
    ),
    sliders: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
      />
    ),
    lotus: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
      />
    ),
    wind: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    ),
    sun: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
      />
    ),
    yin_yang: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
      />
    ),
    heart: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
      />
    ),
    activity: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13 10V3L4 14h7v7l9-11h-7z"
      />
    ),
    zap: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13 10V3L4 14h7v7l9-11h-7z"
      />
    ),
    infinity: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
      />
    ),
    map: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
      />
    ),
    gold: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    ),
    mana: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
      />
    ),
    move: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13 5l7 7-7 7M5 5l7 7-7 7"
      />
    ),
    check: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2.5}
        d="M5 13l4 4L19 7"
      />
    ),
  };

  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      {icons[name] || icons["eye"]}
    </svg>
  );
};

export default Icon;```

### Layout.jsx
```jsx
import React, { useRef } from "react";
import { useParticles } from "../engine/particleEngine";
import Header from "./Header";
import Navigation from "./Navigation";

const Layout = ({ gameState, activeTab, setActiveTab, devMode, onToggleDevMode, onOpenLog, gameLocked, children }) => {
  const canvasRef = useRef(null);
  useParticles(canvasRef);

  return (
    <div className="min-h-[100dvh] bg-slate-950 text-slate-200 font-sans selection:bg-purple-500/30 overflow-x-hidden flex flex-col relative">
      <canvas
        ref={canvasRef}
        className="fixed top-0 left-0 w-full h-full pointer-events-none z-0 opacity-40"
      />

      <div className="relative z-10 max-w-7xl mx-auto p-4 md:p-8 flex flex-col h-[100dvh] w-full">
        <Header
          gameState={gameState}
          devMode={devMode}
          onToggleDevMode={onToggleDevMode}
          onOpenLog={onOpenLog}
          gameLocked={gameLocked}
        />

        {/* Desktop Navigation */}
        <div className="hidden md:block mb-6 shrink-0">
          <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>

        <main className="flex-1 overflow-hidden relative pb-20 md:pb-0">
          {children}
        </main>

        {/* Mobile Navigation (Sticky Bottom) */}
        <div className="md:hidden fixed bottom-0 left-0 w-full bg-slate-900/95 backdrop-blur-md border-t border-slate-800 z-40 p-2">
            <Navigation activeTab={activeTab} setActiveTab={setActiveTab} isMobile={true} />
        </div>
      </div>
    </div>
  );
};

export default Layout;
```

### Navigation.jsx
```jsx
import React from 'react';
import Icon from './Icon';
import { initAudio } from '../engine/audioEngine';

const Navigation = ({ activeTab, setActiveTab, isMobile = false }) => {
  const tabs = [
    { id: "tree", label: "Skill Tree", icon: "brain", activeColor: "bg-indigo-600 shadow-[0_0_15px_rgba(79,70,229,0.5)]" },
    { id: "quests", label: "Quests", icon: "scroll", activeColor: "bg-amber-600 shadow-[0_0_15px_rgba(217,119,6,0.5)]" },
    { id: "battle", label: "Kämpfe", icon: "zap", activeColor: "bg-red-600 shadow-[0_0_15px_rgba(220,38,38,0.5)]" },
    { id: "map", label: "World Map", icon: "map", activeColor: "bg-emerald-600 shadow-[0_0_15px_rgba(5,150,105,0.5)]" }
  ];

  if (isMobile) {
    return (
      <nav className="flex justify-around items-center w-full">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              initAudio();
            }}
            className={`flex flex-col items-center justify-center p-2 w-full rounded-lg transition-all duration-300 ${
              activeTab === tab.id
                ? `text-white ${tab.activeColor}`
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Icon name={tab.icon} className="w-6 h-6 mb-1" />
            <span className="text-[10px] font-bold">{tab.label}</span>
          </button>
        ))}
      </nav>
    );
  }

  return (
    <nav className="flex flex-wrap gap-4">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => {
            setActiveTab(tab.id);
            initAudio();
          }}
          className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 flex items-center gap-2 ${
            activeTab === tab.id
              ? `text-white ${tab.activeColor}`
              : "bg-slate-800/50 text-slate-400 hover:bg-slate-700"
          }`}
        >
          <Icon name={tab.icon} /> {tab.label}
        </button>
      ))}
    </nav>
  );
};

export default Navigation;```

### Quests.jsx
```jsx
import React, { useState } from "react";
import Icon from "./Icon";
import PRESET_QUESTS from "../data/quests.json";
import { PATH_COLORS } from "../data/constants";
import { getResourceRewards } from "../hooks/useGameState";
import AddQuestModal from "./AddQuestModal";

const CRAFT_URL = "https://s.craft.me/09MPu0hzH12B7A";

// ═══════════════════════════════════════════════════════════════
//  PATH CONFIGURATION
// ═══════════════════════════════════════════════════════════════
const PATH_EMOJI = {
  architect: "🏗️",
  socratic: "📜",
  bard: "🎵",
  monk: "🧘",
  acrobat: "🤸",
};

const PATH_LABELS = {
  architect: "Architekt",
  socratic: "Sokratiker",
  bard: "Barde",
  monk: "Mönch",
  acrobat: "Akrobat",
};

const CLAIM_PATHS = [
  {
    id: "socratic", title: "Der Sokratiker", taskLabel: "Ethik / Schule",
    icon: "scroll", gradient: "from-amber-900 to-amber-600",
    border: "border-amber-500/60", text: "text-amber-400",
    bg: "bg-amber-900/20",
    hoverBorder: "hover:border-amber-400 hover:shadow-[0_0_20px_rgba(245,158,11,0.15)]",
    rewards: { label: "Gold", icon: "gold" },
  },
  {
    id: "bard", title: "Der Barde", taskLabel: "Ableton / Musik",
    icon: "music", gradient: "from-purple-900 to-purple-600",
    border: "border-purple-500/60", text: "text-purple-400",
    bg: "bg-purple-900/20",
    hoverBorder: "hover:border-purple-400 hover:shadow-[0_0_20px_rgba(168,85,247,0.15)]",
    rewards: { label: "Mana", icon: "mana" },
  },
  {
    id: "monk", title: "Der Mönch", taskLabel: "Zazen / Qi Gong",
    icon: "lotus", gradient: "from-emerald-900 to-emerald-600",
    border: "border-emerald-500/60", text: "text-emerald-400",
    bg: "bg-emerald-900/20",
    hoverBorder: "hover:border-emerald-400 hover:shadow-[0_0_20px_rgba(16,185,129,0.15)]",
    rewards: { label: "Mana", icon: "mana" },
  },
  {
    id: "acrobat", title: "Der Akrobat", taskLabel: "Gym / Flow Arts",
    icon: "activity", gradient: "from-red-900 to-red-600",
    border: "border-red-500/60", text: "text-red-400",
    bg: "bg-red-900/20",
    hoverBorder: "hover:border-red-400 hover:shadow-[0_0_20px_rgba(239,68,68,0.15)]",
    rewards: { label: "MP", icon: "move" },
  },
  {
    id: "architect", title: "Der Architekt", taskLabel: "Tech / System",
    icon: "server", gradient: "from-blue-900 to-blue-600",
    border: "border-blue-500/60", text: "text-blue-400",
    bg: "bg-blue-900/20",
    hoverBorder: "hover:border-blue-400 hover:shadow-[0_0_20px_rgba(59,130,246,0.15)]",
    rewards: { label: "MP", icon: "move" },
  },
];

// ═══════════════════════════════════════════════════════════════
//  GUILD BOUNTY CONFIG (the 5 core paths)
// ═══════════════════════════════════════════════════════════════
const GUILD_BOUNTIES = [
  {
    id: "socratic", title: "Die Sokratische Schmiede",
    description: "30 Min Kavita-Textarbeit oder KI-gestützte Unterrichtsplanung.",
    icon: "scroll", pathLabel: "Sokratiker", pathEmoji: "📜",
    rewardText: "+50 Gold", rewardDetail: { icon: "gold", amount: 50, label: "Gold" },
    gradient: "from-amber-900/80 via-amber-950/90 to-slate-950/95",
    border: "border-amber-500/40", borderHover: "hover:border-amber-400/80",
    accentText: "text-amber-400", accentBg: "bg-amber-500",
    accentGlow: "rgba(245,158,11,0.25)",
    btnGradient: "from-amber-600 to-amber-500",
    btnHover: "hover:from-amber-500 hover:to-amber-400",
    btnText: "text-slate-950",
    completedBorder: "border-emerald-500/50", completedBg: "bg-emerald-900/10",
  },
  {
    id: "bard", title: "Kanalisierung des Flows",
    description: "45 Min Ableton Live Session für yrrpheus/yolomeus.",
    icon: "music", pathLabel: "Barde", pathEmoji: "🎵",
    rewardText: "+40 Mana", rewardDetail: { icon: "mana", amount: 40, label: "Mana" },
    gradient: "from-purple-900/80 via-purple-950/90 to-slate-950/95",
    border: "border-purple-500/40", borderHover: "hover:border-purple-400/80",
    accentText: "text-purple-400", accentBg: "bg-purple-500",
    accentGlow: "rgba(168,85,247,0.25)",
    btnGradient: "from-purple-600 to-purple-500",
    btnHover: "hover:from-purple-500 hover:to-purple-400",
    btnText: "text-white",
    completedBorder: "border-emerald-500/50", completedBg: "bg-emerald-900/10",
  },
  {
    id: "monk", title: "Innere Ausrichtung",
    description: "20 Min Zazen, Qi Gong oder Visualisierung zur mentalen Vorbereitung.",
    icon: "lotus", pathLabel: "Mönch", pathEmoji: "🧘",
    rewardText: "+50 Mana", rewardDetail: { icon: "mana", amount: 50, label: "Mana" },
    gradient: "from-emerald-900/80 via-emerald-950/90 to-slate-950/95",
    border: "border-emerald-500/40", borderHover: "hover:border-emerald-400/80",
    accentText: "text-emerald-400", accentBg: "bg-emerald-500",
    accentGlow: "rgba(16,185,129,0.25)",
    btnGradient: "from-emerald-600 to-emerald-500",
    btnHover: "hover:from-emerald-500 hover:to-emerald-400",
    btnText: "text-slate-950",
    completedBorder: "border-emerald-500/50", completedBg: "bg-emerald-900/10",
  },
  {
    id: "acrobat", title: "Physische Resilienz",
    description: "Gym, Laufen oder Flow Arts/Jonglage.",
    icon: "activity", pathLabel: "Akrobat", pathEmoji: "🤸",
    rewardText: "+30 Bewegungspunkte", rewardDetail: { icon: "move", amount: 30, label: "MP" },
    gradient: "from-red-900/80 via-red-950/90 to-slate-950/95",
    border: "border-red-500/40", borderHover: "hover:border-red-400/80",
    accentText: "text-red-400", accentBg: "bg-red-500",
    accentGlow: "rgba(239,68,68,0.25)",
    btnGradient: "from-red-600 to-red-500",
    btnHover: "hover:from-red-500 hover:to-red-400",
    btnText: "text-white",
    completedBorder: "border-emerald-500/50", completedBg: "bg-emerald-900/10",
  },
  {
    id: "architect", title: "Wartung des Motors",
    description: "System-Revision in Craft, Dify-Optimierung oder Inbox Zero.",
    icon: "server", pathLabel: "Architekt", pathEmoji: "🏗️",
    rewardText: "+20 Bewegungspunkte", rewardDetail: { icon: "move", amount: 20, label: "MP" },
    gradient: "from-blue-900/80 via-blue-950/90 to-slate-950/95",
    border: "border-blue-500/40", borderHover: "hover:border-blue-400/80",
    accentText: "text-blue-400", accentBg: "bg-blue-500",
    accentGlow: "rgba(59,130,246,0.25)",
    btnGradient: "from-blue-600 to-blue-500",
    btnHover: "hover:from-blue-500 hover:to-blue-400",
    btnText: "text-white",
    completedBorder: "border-emerald-500/50", completedBg: "bg-emerald-900/10",
  },
];

// ═══════════════════════════════════════════════════════════════
//  Quest Card — unified guild bounty aesthetic
// ═══════════════════════════════════════════════════════════════
const QuestCard = ({ quest, onComplete, onDelete, poiBonuses }) => {
  const rewards = getResourceRewards(quest.path);
  const totalMove = rewards.move + (poiBonuses?.moveRegen || 0);
  const totalGold = rewards.gold + (poiBonuses?.goldRegen || 0);
  const totalMana = rewards.mana + (poiBonuses?.manaRegen || 0);
  const isCompleted = quest.completed || quest.completedAt;

  const pathBorder = {
    architect: "border-blue-500/40 hover:border-blue-400/80",
    socratic: "border-amber-500/40 hover:border-amber-400/80",
    bard: "border-purple-500/40 hover:border-purple-400/80",
    monk: "border-emerald-500/40 hover:border-emerald-400/80",
    acrobat: "border-red-500/40 hover:border-red-400/80",
  };
  const pathGradient = {
    architect: "from-blue-900/60 via-blue-950/70 to-slate-950/95",
    socratic: "from-amber-900/60 via-amber-950/70 to-slate-950/95",
    bard: "from-purple-900/60 via-purple-950/70 to-slate-950/95",
    monk: "from-emerald-900/60 via-emerald-950/70 to-slate-950/95",
    acrobat: "from-red-900/60 via-red-950/70 to-slate-950/95",
  };
  const pathBadge = {
    architect: "text-blue-400 border-blue-800/50",
    socratic: "text-amber-400 border-amber-800/50",
    bard: "text-purple-400 border-purple-800/50",
    monk: "text-emerald-400 border-emerald-800/50",
    acrobat: "text-red-400 border-red-800/50",
  };
  const pathBtn = {
    architect: "from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400",
    socratic: "from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400",
    bard: "from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400",
    monk: "from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400",
    acrobat: "from-red-600 to-red-500 hover:from-red-500 hover:to-red-400",
  };

  return (
    <div
      className={`group relative rounded-2xl border-2 overflow-hidden transition-all duration-500 ${
        isCompleted
          ? "border-emerald-500/50 bg-emerald-900/10 opacity-70"
          : `${pathBorder[quest.path] || "border-slate-700/40"}`
      }`}
    >
      {/* Top accent line */}
      <div className={`absolute top-0 left-0 right-0 h-0.5 ${
        isCompleted ? "bg-emerald-500/60" : `bg-gradient-to-r ${pathBtn[quest.path] || "from-slate-600 to-slate-500"}`
      }`}></div>

      <div className={`relative flex flex-col p-4 md:p-5 bg-gradient-to-br ${pathGradient[quest.path] || "from-slate-900 via-slate-900/95 to-slate-950"}`}>
        {/* Header: emoji + path badge + XP */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br ${pathBtn[quest.path] || "from-slate-600 to-slate-500"} shadow-lg transition-transform duration-300 ${
                isCompleted ? "scale-90 opacity-60" : ""
              }`}
            >
              <Icon name={isCompleted ? "check" : "scroll"} className="w-5 h-5 text-white" />
            </div>
            <span
              className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border bg-slate-900/60 ${
                isCompleted ? "border-emerald-700/50 text-emerald-400" : pathBadge[quest.path] || "text-slate-400 border-slate-700/50"
              }`}
            >
              {isCompleted ? "Vollbracht" : `${PATH_EMOJI[quest.path]} ${PATH_LABELS[quest.path]}`}
            </span>
          </div>
          <div className="flex items-center gap-1 bg-indigo-900/50 border border-indigo-700/50 rounded-full px-2 py-0.5">
            <Icon name="zap" className="w-3 h-3 text-indigo-400" />
            <span className="text-xs font-mono font-bold text-indigo-300">+{quest.xp} XP</span>
          </div>
        </div>

        {/* Title */}
        <h4
          className={`text-base md:text-lg font-bold mb-1.5 leading-tight transition-colors duration-300 ${
            isCompleted ? "text-emerald-300/80 line-through decoration-emerald-500/50" : "text-slate-100"
          }`}
        >
          {quest.name}
        </h4>

        {/* Description (custom quests only) */}
        {quest.description && (
          <p className={`text-xs leading-relaxed mb-4 ${isCompleted ? "text-slate-500" : "text-slate-400"}`}>
            {quest.description}
          </p>
        )}

        {/* Reward pills */}
        <div className="flex flex-wrap gap-2 mb-4">
          {totalMove > 0 && (
            <div className="flex items-center gap-1 bg-emerald-900/30 border border-emerald-700/30 rounded-md px-2 py-1">
              <Icon name="move" className="w-3 h-3 text-emerald-400" />
              <span className="text-xs font-mono font-bold text-emerald-300">+{totalMove} MP</span>
              {(poiBonuses?.moveRegen || 0) > 0 && (
                <span className="text-[9px] text-emerald-500 ml-0.5">(+{poiBonuses.moveRegen})</span>
              )}
            </div>
          )}
          {totalGold > 0 && (
            <div className="flex items-center gap-1 bg-yellow-900/30 border border-yellow-700/30 rounded-md px-2 py-1">
              <Icon name="gold" className="w-3 h-3 text-yellow-400" />
              <span className="text-xs font-mono font-bold text-yellow-300">+{totalGold} G</span>
              {(poiBonuses?.goldRegen || 0) > 0 && (
                <span className="text-[9px] text-yellow-500 ml-0.5">(+{poiBonuses.goldRegen})</span>
              )}
            </div>
          )}
          {totalMana > 0 && (
            <div className="flex items-center gap-1 bg-blue-900/30 border border-blue-700/30 rounded-md px-2 py-1">
              <Icon name="mana" className="w-3 h-3 text-blue-400" />
              <span className="text-xs font-mono font-bold text-blue-300">+{totalMana} M</span>
              {(poiBonuses?.manaRegen || 0) > 0 && (
                <span className="text-[9px] text-blue-500 ml-0.5">(+{poiBonuses.manaRegen})</span>
              )}
            </div>
          )}
        </div>

        {/* Spacer */}
        <div className="flex-1"></div>

        {/* Action button or completed state */}
        {isCompleted ? (
          <div className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-900/20 border border-emerald-700/30">
            <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-sm font-bold text-emerald-400">Abgeschlossen</span>
          </div>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => onComplete(quest)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r ${pathBtn[quest.path] || "from-slate-600 to-slate-500"} text-white font-bold text-sm shadow-lg transition-all duration-300 active:scale-[0.97]`}
            >
              <Icon name="pen" className="w-4 h-4" />
              Vollzug melden
            </button>
            {quest.isCustom && onDelete && (
              <button
                onClick={() => onDelete(quest.id)}
                className="px-3 py-2.5 rounded-xl bg-red-900/30 border border-red-700/40 text-red-400 hover:bg-red-900/50 hover:text-red-300 transition-all"
                title="Quest löschen"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
//  Guild Bounty Card (for the 5 core bounties — session tracked)
// ═══════════════════════════════════════════════════════════════
const GuildBountyCard = ({ bounty, isCompleted, onClaim }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`group relative rounded-2xl border-2 overflow-hidden transition-all duration-500 ${
        isCompleted
          ? `${bounty.completedBorder} ${bounty.completedBg} opacity-70`
          : `${bounty.border} ${bounty.borderHover}`
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={
        !isCompleted && isHovered
          ? { boxShadow: `0 0 30px ${bounty.accentGlow}, 0 0 60px ${bounty.accentGlow.replace("0.25", "0.1")}` }
          : isCompleted
          ? { boxShadow: "0 0 20px rgba(16,185,129,0.15)" }
          : {}
      }
    >
      <div className={`absolute top-0 left-0 right-0 h-0.5 transition-opacity duration-500 ${
        isCompleted ? "bg-emerald-500/60" : `bg-gradient-to-r ${bounty.btnGradient}`
      }`}></div>

      <div className={`relative flex flex-col p-4 md:p-5 bg-gradient-to-br ${bounty.gradient}`}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br ${bounty.btnGradient} shadow-lg transition-transform duration-300 ${
                isCompleted ? "scale-90" : isHovered ? "scale-105" : ""
              }`}
            >
              <Icon name={isCompleted ? "check" : bounty.icon} className="w-5 h-5 text-white" />
            </div>
            <span
              className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border bg-slate-900/60 ${
                isCompleted ? "border-emerald-700/50 text-emerald-400" : bounty.accentText
              }`}
            >
              {isCompleted ? "Vollbracht" : bounty.pathLabel}
            </span>
          </div>
        </div>

        <h4 className={`text-base md:text-lg font-bold mb-1.5 leading-tight transition-colors duration-300 ${
          isCompleted ? "text-emerald-300/80 line-through decoration-emerald-500/50" : "text-slate-100"
        }`}>
          {bounty.title}
        </h4>

        <p className={`text-xs md:text-sm leading-relaxed mb-4 transition-colors duration-300 ${
          isCompleted ? "text-slate-500" : "text-slate-400"
        }`}>
          {bounty.description}
        </p>

        <div className="flex items-center gap-1.5 mb-4">
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${
            isCompleted ? "bg-emerald-900/30 border-emerald-700/40" : "bg-slate-900/60 border-slate-700/40"
          }`}>
            <Icon name={bounty.rewardDetail.icon} className={`w-3.5 h-3.5 ${isCompleted ? "text-emerald-400" : bounty.accentText}`} />
            <span className={`text-xs font-mono font-bold ${isCompleted ? "text-emerald-300" : bounty.accentText}`}>
              {bounty.rewardText}
            </span>
          </div>
        </div>

        <div className="flex-1"></div>

        {isCompleted ? (
          <div className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-900/20 border border-emerald-700/30">
            <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-sm font-bold text-emerald-400">Vollzug gemeldet</span>
          </div>
        ) : (
          <button
            onClick={() => onClaim(bounty.id)}
            className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r ${bounty.btnGradient} ${bounty.btnHover} ${bounty.btnText} font-bold text-sm shadow-lg transition-all duration-300 active:scale-[0.97] hover:shadow-xl`}
          >
            <Icon name="pen" className="w-4 h-4" />
            Vollzug melden
          </button>
        )}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
//  Main Quests Component
// ═══════════════════════════════════════════════════════════════
const Quests = ({ handleQuestComplete, gameState, claimTat, addCustomQuest, deleteCustomQuest }) => {
  const poiBonuses = gameState?.poiBonuses || { manaRegen: 0, goldRegen: 0, moveRegen: 0 };
  const [claimedNow, setClaimedNow] = useState(null);
  const [completedBounties, setCompletedBounties] = useState({});
  const [showAddQuest, setShowAddQuest] = useState(false);

  const handleClaim = (pathId) => {
    claimTat(pathId);
    setClaimedNow(pathId);
    setCompletedBounties((prev) => ({ ...prev, [pathId]: true }));
    setTimeout(() => setClaimedNow(null), 600);
  };

  // Combine preset quests with custom quests
  const allQuests = [
    ...PRESET_QUESTS,
    ...(gameState.customQuests || []),
  ];

  return (
    <div className="h-full overflow-y-auto pb-20 custom-scrollbar pr-2 md:pr-4">

      {/* ═══ Header ═══ */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">⚔️</span>
          <div>
            <h2 className="text-lg md:text-xl font-bold text-amber-400">
              Gilden-Halle
            </h2>
            <p className="text-[10px] md:text-xs text-slate-500">
              Craft → Taten erledigen → Ressourcen beanspruchen
            </p>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════
          CRAFT SECTION — Link + Quick Claim DIRECTLY underneath
         ═══════════════════════════════════════════════════════ */}
      <div className="mb-6">
        {/* Craft Link Card */}
        <div className="p-4 md:p-5 rounded-2xl border-2 border-slate-700/50 bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-950 shadow-lg">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-800 to-amber-600 shrink-0">
              <Icon name="edit" className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-amber-400 mb-0.5">
                Dein Craft — Taten-Übersicht
              </h3>
              <p className="text-[11px] text-slate-500 leading-snug mb-3">
                Öffne dein Craft-Dokument, hake erledigte Aufgaben ab und komme zurück, um deine Ressourcen einzufordern.
              </p>
              <a
                href={CRAFT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-900 font-bold text-xs transition-all shadow-[0_0_15px_rgba(217,119,6,0.2)] hover:shadow-[0_0_25px_rgba(217,119,6,0.4)]"
              >
                <Icon name="globe" className="w-3.5 h-3.5" />
                In Craft öffnen
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* ═══ Schnell-Eintragung — DIRECTLY under Craft card ═══ */}
        <div className="mt-4">
          <div className="flex items-center gap-2 mb-2">
            <Icon name="pen" className="w-4 h-4 text-amber-500" />
            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              Schnell-Eintragung
            </h3>
            <div className="flex-1 h-px bg-gradient-to-r from-amber-800/40 to-transparent"></div>
          </div>
          <p className="text-[10px] text-slate-500 mb-2 italic">
            Aufgabe in Craft erledigt? Hier auf Ehrenwort eintragen.
          </p>

          <div className="grid grid-cols-5 gap-1.5 md:gap-2">
            {CLAIM_PATHS.map((cp) => {
              const isFlashing = claimedNow === cp.id;
              const isCompleted = completedBounties[cp.id];
              return (
                <button
                  key={cp.id}
                  onClick={() => !isCompleted && handleClaim(cp.id)}
                  disabled={isCompleted}
                  className={`group relative flex flex-col items-center gap-1 p-2 md:p-3 rounded-xl border-2 transition-all duration-300 ${
                    isCompleted
                      ? "border-emerald-700/30 bg-emerald-900/10 opacity-50 cursor-not-allowed"
                      : `${cp.border} ${cp.bg} ${cp.hoverBorder} active:scale-95 ${isFlashing ? "scale-105 brightness-125" : ""}`
                  }`}
                >
                  {isFlashing && !isCompleted && (
                    <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${cp.gradient} opacity-40 animate-pulse`}></div>
                  )}
                  {isCompleted && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                  <div className={`relative p-1.5 rounded-lg bg-gradient-to-br ${cp.gradient} ${isCompleted ? "opacity-40" : ""}`}>
                    <Icon name={isCompleted ? "check" : cp.icon} className="w-4 h-4 text-white" />
                  </div>
                  {!isCompleted && (
                    <>
                      <span className={`relative text-[9px] md:text-xs font-bold ${cp.text} leading-tight text-center`}>
                        {cp.taskLabel}
                      </span>
                      <div className="relative flex items-center gap-0.5">
                        <Icon name={cp.rewards.icon} className="w-2.5 h-2.5 text-slate-400" />
                        <span className="text-[8px] font-mono text-slate-400">
                          +{cp.rewards.label}
                        </span>
                      </div>
                    </>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════
          GILDEN-AUFTRÄGE — The 5 Core Guild Bounties
         ═══════════════════════════════════════════════════════ */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xl">🏰</span>
          <h3 className="text-base md:text-lg font-bold text-amber-400 uppercase tracking-wider">
            Gilden-Aufträge
          </h3>
          <div className="flex-1 h-px bg-gradient-to-r from-amber-800/40 to-transparent"></div>
        </div>
        <p className="text-xs text-slate-500 mb-1 italic font-medium">
          Gleichzeitiges Aufblühen — Die fünf Pfade zur Meisterschaft
        </p>
        <p className="text-[11px] text-slate-600 mb-4">
          Erledige die Aufgabe in Craft, dann hier auf Ehrenwort eintragen.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 md:gap-4">
          {GUILD_BOUNTIES.map((bounty) => (
            <GuildBountyCard
              key={bounty.id}
              bounty={bounty}
              isCompleted={!!completedBounties[bounty.id]}
              onClaim={handleClaim}
            />
          ))}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════
          SCHWARZES BRETT — Preset + Custom Quests (unified)
         ═══════════════════════════════════════════════════════ */}
      <div className="mb-3">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">📋</span>
          <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider">
            Schwarzes Brett
          </h3>
          <div className="flex-1 h-px bg-gradient-to-r from-amber-800/40 to-transparent"></div>
          <button
            onClick={() => setShowAddQuest(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600/20 border border-amber-600/40 text-amber-400 hover:bg-amber-600/30 transition-all"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            <span className="text-xs font-bold">Neue Quest</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
        {allQuests.map((quest) => (
          <QuestCard
            key={quest.id}
            quest={quest}
            onComplete={handleQuestComplete}
            onDelete={quest.isCustom ? deleteCustomQuest : null}
            poiBonuses={poiBonuses}
          />
        ))}
      </div>

      {/* Add Quest Modal */}
      {showAddQuest && (
        <AddQuestModal
          onAdd={addCustomQuest}
          onClose={() => setShowAddQuest(false)}
        />
      )}
    </div>
  );
};

export default Quests;
```

### SkillTree.jsx
```jsx
import React, { useState, useMemo } from 'react';
import Icon from './Icon';
import { PATH_COLORS } from '../data/constants';
import { TIER_LABELS } from '../data/skillTreeData';

const ICON_OPTIONS = [
  'brain', 'scroll', 'pen', 'crown', 'book', 'eye', 'yin_yang',
  'music', 'radio', 'headphones', 'cloud', 'sliders',
  'lotus', 'wind', 'sun', 'heart', 'activity', 'zap', 'infinity',
  'server', 'database', 'globe', 'map', 'edit',
];

// ─── Resolve a single skill node ──────────────────────────────
const resolveSkill = (skill, skills) => {
  const stateSkill = skills.find((s) => s.id === skill.id);
  const isUnlocked = stateSkill?.unlocked || false;
  const _reqsMet = skill.req.every(
    (reqId) => skills.find((s) => s.id === reqId)?.unlocked
  );
  return { ...skill, isUnlocked, isAvailable: !isUnlocked && _reqsMet };
};

// ─── Single Skill Card ────────────────────────────────────────
const SkillCard = ({ skill, pathId, onSelect }) => {
  const { isUnlocked, isAvailable } = skill;
  const pathColor = PATH_COLORS[pathId] || 'from-slate-800 to-slate-600 border-slate-500';

  return (
    <button
      onClick={onSelect}
      className={`relative w-full p-3 md:p-3.5 rounded-xl border-2 text-left transition-all duration-200 group ${
        isUnlocked
          ? `bg-gradient-to-br ${pathColor} shadow-lg`
          : isAvailable
          ? 'bg-slate-800 border-slate-600 hover:border-slate-400 cursor-pointer hover:scale-[1.02]'
          : 'bg-slate-900/50 border-slate-800/60 opacity-50 cursor-not-allowed grayscale'
      }`}
    >
      <div className="flex items-start gap-2">
        <div className={`p-1.5 rounded-lg shrink-0 ${isUnlocked ? 'bg-black/30' : 'bg-slate-700/50'}`}>
          <Icon name={skill.icon} className="w-4 h-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-1">
            <h4 className={`font-bold leading-tight text-xs md:text-sm truncate ${isUnlocked ? 'text-white' : 'text-slate-300'}`}>
              {skill.name}
            </h4>
            {!isUnlocked && (
              <span className="text-[10px] font-mono bg-slate-900/80 px-1.5 py-0.5 rounded text-amber-400 shrink-0">
                {skill.cost}
              </span>
            )}
          </div>
          <p className={`text-[11px] mt-0.5 line-clamp-2 ${isUnlocked ? 'text-slate-300' : 'text-slate-500'}`}>
            {skill.desc}
          </p>
        </div>
      </div>
    </button>
  );
};

// ─── Path Column / Section ────────────────────────────────────
const PathSection = ({ path, skills, onSelectSkill, editMode, onAddSkill }) => {
  const [collapsed, setCollapsed] = useState(false);
  const tierOrder = ['basis', 'schwelle', 'quantensprung', 'meisterschaft'];

  return (
    <div className="flex flex-col">
      {/* Path Header — clickable to collapse on mobile */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="md:cursor-default text-center md:pointer-events-none py-3 border-b border-slate-800/60 sticky top-0 bg-slate-950/90 backdrop-blur z-10"
      >
        <h2 className={`text-sm md:text-base font-bold bg-gradient-to-r ${PATH_COLORS[path.id]} bg-clip-text text-transparent uppercase tracking-widest`}>
          {path.title}
        </h2>
        <p className="text-[10px] text-slate-600 mt-0.5">{path.subtitle}</p>
        <span className="md:hidden text-[10px] text-slate-600">
          {collapsed ? '▼ zeigen' : '▲ zuklappen'}
        </span>
      </button>

      {!collapsed && (
        <div className="flex flex-col gap-3 p-2 md:p-0">
          {tierOrder.map((tierKey) => {
            const tier = path.tiers?.[tierKey];
            if (!tier) return null;
            const tierSkills = skills
              .filter((s) => s.tier === tier.tierNumber)
              .map((s) => resolveSkill(s, skills));
            if (tierSkills.length === 0) return null;

            return (
              <div key={tierKey} className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-slate-600">
                    {tier.tierNumber}
                  </span>
                  <div className="flex-1 h-px bg-slate-800/60"></div>
                </div>
                <div className="space-y-1.5">
                  {tierSkills.map((skill) => (
                    <SkillCard
                      key={skill.id}
                      skill={skill}
                      pathId={path.id}
                      onSelect={() => onSelectSkill({ ...skill, path: path.id })}
                    />
                  ))}
                </div>
              </div>
            );
          })}

          {editMode && (
            <button
              onClick={() => onAddSkill(path.id)}
              className="w-full py-2.5 rounded-xl border-2 border-dashed border-slate-700/60 text-slate-600 hover:text-slate-400 hover:border-slate-500 transition-all text-xs font-bold mt-1"
            >
              + Skill
            </button>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Add Skill Modal Form ─────────────────────────────────────
const AddSkillForm = ({ onClose, onAdd, skillTreeData, preselectedPath }) => {
  const [formPath, setFormPath] = useState(preselectedPath || 'socratic');
  const [formTier, setFormTier] = useState(1);
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formCost, setFormCost] = useState(100);
  const [formIcon, setFormIcon] = useState('eye');

  const handleAdd = () => {
    if (!formName.trim()) return;
    onAdd(formPath, formTier, {
      name: formName.trim(),
      desc: formDesc.trim(),
      cost: Number(formCost) || 100,
      icon: formIcon,
      req: [],
    });
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center p-0 md:p-4 bg-slate-950/80 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-slate-900 border border-slate-700 md:rounded-3xl rounded-t-3xl w-full max-w-lg shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-wider">Neuen Skill hinzufügen</h3>
            <button onClick={onClose} className="text-slate-500 hover:text-white text-lg">✕</button>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div className="col-span-2">
              <label className="block text-[10px] uppercase tracking-wider text-slate-500 mb-1">Name *</label>
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Skill-Name…"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-slate-500 mb-1">Pfad</label>
              <select
                value={formPath}
                onChange={(e) => { setFormPath(e.target.value); setFormTier(1); }}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
              >
                {Object.values(skillTreeData).map((p) => (
                  <option key={p.id} value={p.id}>{p.title}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-slate-500 mb-1">Stufe</label>
              <select
                value={formTier}
                onChange={(e) => setFormTier(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
              >
                {[1, 2, 3, 4].map((t) => (
                  <option key={t} value={t}>Stufe {t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-slate-500 mb-1">SP Kosten</label>
              <input
                type="number"
                value={formCost}
                onChange={(e) => setFormCost(e.target.value)}
                min="0"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-slate-500 mb-1">Icon</label>
              <div className="flex flex-wrap gap-1 max-h-12 overflow-y-auto custom-scrollbar bg-slate-800 border border-slate-700 rounded-lg p-1.5">
                {ICON_OPTIONS.map((iconName) => (
                  <button
                    key={iconName}
                    onClick={() => setFormIcon(iconName)}
                    className={`p-1 rounded ${formIcon === iconName ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-400 hover:text-white'}`}
                  >
                    <Icon name={iconName} className="w-3.5 h-3.5" />
                  </button>
                ))}
              </div>
            </div>
            <div className="col-span-2">
              <label className="block text-[10px] uppercase tracking-wider text-slate-500 mb-1">Beschreibung</label>
              <textarea
                value={formDesc}
                onChange={(e) => setFormDesc(e.target.value)}
                placeholder="Beschreibung…"
                rows={2}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 resize-none"
              />
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <button
              onClick={handleAdd}
              disabled={!formName.trim()}
              className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all ${
                formName.trim()
                  ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.3)]'
                  : 'bg-slate-800 text-slate-600 cursor-not-allowed'
              }`}
            >
              Hinzufügen
            </button>
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl font-bold text-sm bg-slate-800 text-slate-500 hover:text-white transition-all"
            >
              Abbrechen
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Skill Detail Modal ───────────────────────────────────────
const SkillDetailModal = ({ skill, gameState, unlockSkill, onClose }) => {
  const isUnlocked = gameState.skills.find((s) => s.id === skill.id)?.unlocked;
  const reqsMet = skill.req.every(
    (reqId) => gameState.skills.find((s) => s.id === reqId)?.unlocked
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 bg-slate-950/80 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-slate-900 border border-slate-700 md:rounded-3xl rounded-t-3xl max-w-md w-full shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 md:p-7">
          <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white text-lg">✕</button>

          <div className="flex items-center gap-4 mb-5">
            <div className={`p-3.5 rounded-2xl bg-gradient-to-br ${PATH_COLORS[skill.path] || 'from-slate-800 to-slate-600'}`}>
              <Icon name={skill.icon} className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-bold">{skill.name}</h2>
              <p className="text-slate-500 text-[10px] uppercase tracking-widest">
                {TIER_LABELS[skill.tier] || `Stufe ${skill.tier}`}
              </p>
              {skill.isCustom && (
                <span className="text-[10px] bg-indigo-600/60 text-indigo-300 px-2 py-0.5 rounded-full mt-1 inline-block">
                  Benutzerdefiniert
                </span>
              )}
            </div>
          </div>

          <p className="text-slate-300 mb-5 leading-relaxed text-sm">{skill.desc}</p>

          {!isUnlocked && (
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 mb-5">
              <p className="text-xs text-slate-500 mb-1.5">Voraussetzungen:</p>
              {skill.req.length === 0 ? (
                <p className="text-xs text-emerald-400">Keine — Basis-Skill</p>
              ) : (
                <ul className="text-xs space-y-0.5">
                  {skill.req.map((reqId) => {
                    const reqSkill = gameState.skills.find((s) => s.id === reqId);
                    const isMet = reqSkill?.unlocked;
                    return (
                      <li key={reqId} className={`flex items-center gap-1.5 ${isMet ? 'text-emerald-400' : 'text-red-400'}`}>
                        <span>{isMet ? '✓' : '✗'}</span> {reqSkill?.name || reqId}
                      </li>
                    );
                  })}
                </ul>
              )}
              <div className="mt-3 pt-3 border-t border-slate-800 flex justify-between items-center">
                <span className="text-xs text-slate-500">Kosten:</span>
                <span className={`font-mono font-bold text-sm ${gameState.skillPoints >= skill.cost ? 'text-amber-400' : 'text-red-400'}`}>
                  {skill.cost} SP
                </span>
              </div>
            </div>
          )}

          {isUnlocked ? (
            <button disabled className="w-full py-3.5 rounded-xl bg-slate-800 text-emerald-400 font-bold border border-emerald-900/50 cursor-not-allowed text-sm">
              Bereits freigeschaltet ✓
            </button>
          ) : (
            <button
              onClick={() => { if (unlockSkill(skill.id)) onClose(); }}
              className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all ${
                gameState.skillPoints >= skill.cost && reqsMet
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-900 shadow-[0_0_20px_rgba(245,158,11,0.4)]'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              Skill Freischalten
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
//  Main SkillTree Component
// ═══════════════════════════════════════════════════════════════
const SkillTree = ({ gameState, unlockSkill, addCustomSkill, skillTreeData }) => {
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForPath, setAddForPath] = useState(null);

  // Build path entries dynamically from data
  const pathEntries = useMemo(() => {
    return Object.values(skillTreeData).map((path) => ({
      ...path,
      skills: gameState.skills.filter((s) => s.path === path.id),
    }));
  }, [skillTreeData, gameState.skills]);

  const handleOpenAddForm = (pathId) => {
    setAddForPath(pathId);
    setShowAddForm(true);
  };

  return (
    <>
      {/* ─── Minimal Toolbar ──────────────────────────────── */}
      <div className="flex items-center justify-between px-2 mb-2">
        <div className="flex items-center gap-2">
          <Icon name="brain" className="w-4 h-4 text-indigo-400" />
          <span className="text-[10px] uppercase tracking-widest text-slate-600 font-bold">
            Skillbaum
          </span>
          <span className="text-[10px] text-slate-700">
            {gameState.skillPoints} SP verfügbar
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setEditMode(!editMode)}
            className={`px-2.5 py-1 rounded-md text-[10px] font-bold border transition-all ${
              editMode
                ? 'bg-amber-600/20 border-amber-500/60 text-amber-400'
                : 'bg-transparent border-slate-700 text-slate-600 hover:text-slate-400'
            }`}
          >
            {editMode ? '✓ Fertig' : '+ Bearbeiten'}
          </button>
          {editMode && (
            <button
              onClick={() => { setAddForPath(null); setShowAddForm(true); }}
              className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-indigo-600 text-white hover:bg-indigo-500 transition-all"
            >
              Neuer Skill
            </button>
          )}
        </div>
      </div>

      {/* ─── Skill Grid: 1 col mobile → 2 iPad → 3 lg → 5 xl  */}
      <div className="h-full overflow-y-auto pb-20 custom-scrollbar">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-0 md:gap-4 px-1">
          {pathEntries.map((path) => (
            <div
              key={path.id}
              className="border border-slate-800/40 md:rounded-2xl md:bg-slate-900/30 md:border md:border-slate-800/40 overflow-hidden"
            >
              <PathSection
                path={path}
                skills={path.skills}
                onSelectSkill={setSelectedSkill}
                editMode={editMode}
                onAddSkill={handleOpenAddForm}
              />
            </div>
          ))}
        </div>
      </div>

      {/* ─── Modals ───────────────────────────────────────── */}
      {selectedSkill && (
        <SkillDetailModal
          skill={selectedSkill}
          gameState={gameState}
          unlockSkill={unlockSkill}
          onClose={() => setSelectedSkill(null)}
        />
      )}

      {showAddForm && (
        <AddSkillForm
          onClose={() => setShowAddForm(false)}
          onAdd={(pathId, tier, data) => {
            addCustomSkill(pathId, tier, data);
            setShowAddForm(false);
          }}
          skillTreeData={skillTreeData}
          preselectedPath={addForPath}
        />
      )}
    </>
  );
};

export default SkillTree;
```

### WorldMap.jsx
```jsx
import React, { useState, useCallback } from "react";
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

const WorldMap = ({ gameState, uncoverTile, getPoiInfo, defeatMapBoss }) => {
  const [revealedTile, setRevealedTile] = useState(null);
  const [viewBox, setViewBox] = useState({ x: -300, y: -300, w: 600, h: 600 });
  const HEX_SIZE = 45;

  const getHexCoords = useCallback((q, r) => {
    const x = HEX_SIZE * Math.sqrt(3) * (q + r / 2);
    const y = ((HEX_SIZE * 3) / 2) * r;
    return { x, y };
  }, []);

  const handleTileClick = useCallback((index, tile) => {
    if (!tile.discovered) {
      uncoverTile(index);
      setRevealedTile(index);
      setTimeout(() => setRevealedTile(null), 800);
    }
  }, [uncoverTile]);

  const handleBossClick = useCallback((tileIndex, e) => {
    e.stopPropagation();
    const tile = gameState.mapData.tiles[tileIndex];
    if (tile?.mapBoss && !tile.mapBoss.defeated) {
      if (window.confirm(`⚔️ ${tile.mapBoss.name} angreifen?`)) {
        defeatMapBoss(tileIndex);
      }
    }
  }, [gameState.mapData.tiles, defeatMapBoss]);

  // Pan controls
  const PAN_AMOUNT = 100;
  const pan = (dx, dy) => {
    setViewBox((prev) => ({
      ...prev,
      x: prev.x + dx,
      y: prev.y + dy,
    }));
  };

  // Zoom controls
  const zoom = (factor) => {
    setViewBox((prev) => {
      const newW = Math.max(200, Math.min(1200, prev.w * factor));
      const newH = Math.max(200, Math.min(1200, prev.h * factor));
      return { ...prev, w: newW, h: newH };
    });
  };

  // Calculate map bounds for centering
  const tiles = gameState.mapData.tiles || [];
  let minQ = 0, maxQ = 0, minR = 0, maxR = 0;
  tiles.forEach((t) => {
    if (t.q < minQ) minQ = t.q;
    if (t.q > maxQ) maxQ = t.q;
    if (t.r < minR) minR = t.r;
    if (t.r > maxR) maxR = t.r;
  });

  const discoveredCount = tiles.filter((t) => t.discovered).length;
  const totalCount = tiles.length;
  const bossTiles = tiles.filter((t) => t.mapBoss && !t.mapBoss.defeated);

  return (
    <div className="h-full bg-slate-900/60 border border-slate-700/50 rounded-3xl p-4 flex flex-col overflow-hidden relative">
      {/* Header */}
      <div className="flex justify-between items-center mb-4 z-10">
        <h2 className="text-lg md:text-xl font-bold flex items-center gap-2 text-emerald-400">
          <Icon name="map" /> Archipel des Geistes
        </h2>
        <div className="text-[10px] md:text-xs text-slate-400 font-mono">
          {discoveredCount}/{totalCount} entdeckt • {bossTiles.length} Boss active
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
          viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`}
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <polygon
              id="hex"
              points={`0,${-HEX_SIZE} ${HEX_SIZE * Math.sqrt(3) / 2},${-HEX_SIZE / 2} ${HEX_SIZE * Math.sqrt(3) / 2},${HEX_SIZE / 2} 0,${HEX_SIZE} ${-HEX_SIZE * Math.sqrt(3) / 2},${HEX_SIZE / 2} ${-HEX_SIZE * Math.sqrt(3) / 2},${-HEX_SIZE / 2}`}
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
            <filter id="bossGlow">
              <feGaussianBlur stdDeviation="4" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Background grid lines */}
          <g stroke="rgba(255,255,255,0.02)" strokeWidth="1">
            {[-400, -300, -200, -100, 0, 100, 200, 300, 400].map((pos) => (
              <React.Fragment key={pos}>
                <line x1={pos} y1="-400" x2={pos} y2="400" />
                <line x1="-400" y1={pos} x2="400" y2={pos} />
              </React.Fragment>
            ))}
          </g>

          {/* Hex tiles */}
          <g>
            {tiles.map((tile, i) => {
              const { x, y } = getHexCoords(tile.q, tile.r);
              const isPlayerHere =
                gameState.mapData.playerPosition.q === tile.q &&
                gameState.mapData.playerPosition.r === tile.r;
              const poi = getPoiInfo(tile.type);
              const justRevealed = revealedTile === i;
              const borderColor = tile.discovered
                ? POI_BORDER_COLORS[tile.type] || "rgba(51, 65, 85, 1)"
                : "rgba(30, 41, 59, 1)";
              const hasBoss = tile.mapBoss && !tile.mapBoss.defeated;
              const bossDefeated = tile.mapBoss && tile.mapBoss.defeated;

              return (
                <g
                  key={i}
                  transform={`translate(${x}, ${y})`}
                  className={`transition-all duration-500 ${
                    !tile.discovered ? "cursor-pointer hover:scale-110" : ""
                  }`}
                  onClick={() => handleTileClick(i, tile)}
                >
                  {/* Hex base */}
                  <use
                    href="#hex"
                    fill={
                      tile.discovered
                        ? bossDefeated
                          ? "rgba(16, 185, 129, 0.1)"
                          : "rgba(15, 23, 42, 0.9)"
                        : "rgba(0, 0, 0, 0.5)"
                    }
                    stroke={isPlayerHere ? "#10b981" : hasBoss ? "#f97316" : borderColor}
                    strokeWidth={isPlayerHere ? "3" : hasBoss ? "2.5" : "1.5"}
                    filter={isPlayerHere || tile.discovered ? "url(#glow)" : ""}
                    className={justRevealed ? "animate-tile-reveal" : ""}
                  />

                  {tile.discovered ? (
                    <>
                      {/* Boss indicator */}
                      {hasBoss && (
                        <g
                          className="cursor-pointer"
                          onClick={(e) => handleBossClick(i, e)}
                        >
                          <circle
                            cx="0"
                            cy="-30"
                            r="10"
                            fill="rgba(249, 115, 22, 0.3)"
                            stroke="#f97316"
                            strokeWidth="1.5"
                            filter="url(#bossGlow)"
                            className="animate-pulse"
                          />
                          <text
                            x="0"
                            y="-26"
                            fontSize="12"
                            textAnchor="middle"
                            filter="url(#bossGlow)"
                          >
                            💀
                          </text>
                        </g>
                      )}

                      {/* Defeated boss marker */}
                      {bossDefeated && (
                        <text x="0" y="-30" fontSize="10" textAnchor="middle" className="opacity-50">
                          ✅
                        </text>
                      )}

                      {/* POI Emoji */}
                      {POI_EMOJI[tile.type] && (
                        <text
                          x="0"
                          y={hasBoss ? "-12" : "-10"}
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
                        y={hasBoss ? "2" : "6"}
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
                      cy="28"
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

        {/* Pan/Zoom controls */}
        <div className="absolute top-3 right-3 flex flex-col gap-1 z-10">
          <button onClick={() => zoom(0.8)} className="w-7 h-7 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-300 hover:text-white hover:border-slate-500 text-xs font-bold transition-colors flex items-center justify-center">
            +
          </button>
          <button onClick={() => zoom(1.25)} className="w-7 h-7 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-300 hover:text-white hover:border-slate-500 text-xs font-bold transition-colors flex items-center justify-center">
            −
          </button>
          <div className="h-1"></div>
          <button onClick={() => pan(0, -PAN_AMOUNT)} className="w-7 h-7 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-300 hover:text-white hover:border-slate-500 text-xs transition-colors">↑</button>
          <div className="flex gap-1">
            <button onClick={() => pan(-PAN_AMOUNT, 0)} className="w-7 h-7 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-300 hover:text-white hover:border-slate-500 text-xs transition-colors">←</button>
            <button onClick={() => pan(PAN_AMOUNT, 0)} className="w-7 h-7 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-300 hover:text-white hover:border-slate-500 text-xs transition-colors">→</button>
          </div>
          <button onClick={() => pan(0, PAN_AMOUNT)} className="w-7 h-7 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-300 hover:text-white hover:border-slate-500 text-xs transition-colors">↓</button>
          <button onClick={() => setViewBox({ x: -300, y: -300, w: 600, h: 600 })} className="w-7 h-7 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 text-[9px] font-bold transition-colors mt-1" title="Zentrieren">
            ⊙
          </button>
        </div>

        {/* Info overlay */}
        <div className="absolute bottom-4 left-4 bg-slate-900/80 p-3 md:p-4 rounded-xl border border-slate-700 backdrop-blur-sm max-w-[200px] md:max-w-xs pointer-events-none">
          <h3 className="font-bold text-sm md:text-base text-slate-200 mb-1">
            KI Navigation Aktiv
          </h3>
          <p className="text-[10px] md:text-xs text-slate-400">
            Klicke auf unentdeckte Felder neben bereits entdeckten.{" "}
            <span className="text-emerald-400">{UNCOVER_COST} MP</span> pro Scan.
            💀 Skull = Map Boss (klickbar).
          </p>
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
```

## 🪝 Custom Hooks (src/hooks/)

### useGameState.js
```javascript
import { useState, useEffect, useCallback } from "react";
import DAILY_BOSSES from "../data/bosses.json";
import INITIAL_MAP_DATA from "../data/map.json";
import ATTACKS from "../data/attacks.json";
import PRESET_QUESTS from "../data/quests.json";
import { playLevelUpSound, playUnlockSound, playHitSound } from "../engine/audioEngine";
import {
  flattenSkills,
  LEGACY_SKILL_MAP,
  SKILL_TREE_DATA,
} from "../data/skillTreeData";
import { generateMap, areHexAdjacent } from "../utils/mapGenerator";

// ─── Game Lock Configuration ──────────────────────────────────────
// Set the date when the game becomes "live" — before this date, game is locked
// Dev mode can override this for testing
const GAME_LOCK_DATE = "2026-05-01T00:00:00";

const isGameLocked = () => {
  const lockDate = new Date(GAME_LOCK_DATE);
  const now = new Date();
  return now < lockDate;
};

// ─── Resource Rewards ───────────────────────────────────────────────
export const getResourceRewards = (path) => {
  switch (path) {
    case "architect":
      return { move: 10, gold: 0, mana: 5 };
    case "acrobat":
      return { move: 15, gold: 0, mana: 0 };
    case "socratic":
      return { move: 0, gold: 25, mana: 5 };
    case "bard":
      return { move: 0, gold: 5, mana: 15 };
    case "monk":
      return { move: 0, gold: 0, mana: 20 };
    default:
      return { move: 0, gold: 0, mana: 0 };
  }
};

// ─── POI Definitions ────────────────────────────────────────────────
const POI_TABLE = {
  monastery: {
    label: "Kloster",
    icon: "lotus",
    bonus: { manaRegen: 2 },
    desc: "+2 Mana pro Quest (permanenter Bonus)",
  },
  academy: {
    label: "Akademie",
    icon: "book",
    bonus: { goldRegen: 3 },
    desc: "+3 Gold pro Quest (permanenter Bonus)",
  },
  gym: {
    label: "Trainingslager",
    icon: "activity",
    bonus: { moveRegen: 3 },
    desc: "+3 MP pro Quest (permanenter Bonus)",
  },
  studio: {
    label: "Studio",
    icon: "music",
    bonus: { manaRegen: 1, goldRegen: 1 },
    desc: "+1 Mana & +1 Gold pro Quest",
  },
  server: {
    label: "Server-Farm",
    icon: "server",
    bonus: { goldRegen: 2, moveRegen: 1 },
    desc: "+2 Gold & +1 MP pro Quest",
  },
  wilds: {
    label: "Wildnis",
    icon: "zap",
    bonus: {},
    ambush: true,
    desc: "⚠️ Hinterhalt! Ein Kampf beginnt!",
  },
  nexus: {
    label: "Nexus",
    icon: "brain",
    bonus: { manaRegen: 1, goldRegen: 1, moveRegen: 1 },
    desc: "+1 Alle Ressourcen pro Quest",
  },
};

const UNCOVER_COST = 10;

// ─── Main Hook ──────────────────────────────────────────────────────
export const useGameState = () => {
  const [gameState, setGameState] = useState(() => {
    const saved = localStorage.getItem("tim_life_rpg");
    let baseSkills = flattenSkills();

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Migrate legacy unlocked states
        if (parsed.skills && Array.isArray(parsed.skills)) {
          parsed.skills.forEach((legacySkill) => {
            if (legacySkill.unlocked) {
              const newId = LEGACY_SKILL_MAP[legacySkill.id];
              if (newId) {
                const target = baseSkills.find((s) => s.id === newId);
                if (target) target.unlocked = true;
              }
            }
          });
        }
        // Also restore new-format unlocked states if they exist
        if (parsed.skills && Array.isArray(parsed.skills)) {
          parsed.skills.forEach((savedSkill) => {
            if (savedSkill.unlocked && savedSkill.isCustom !== undefined) {
              // This is a new-format skill
              const target = baseSkills.find((s) => s.id === savedSkill.id);
              if (target) {
                target.unlocked = true;
              } else if (savedSkill.isCustom) {
                // Custom skill from a previous session — add it
                baseSkills.push(savedSkill);
              }
            }
          });
        }

        return {
          ...parsed,
          skills: baseSkills,
          movementPoints: parsed.movementPoints || 0,
          gold: parsed.gold || 0,
          mana: parsed.mana || 0,
          mapData: parsed.mapData || generateMap(4),
          bossHp: parsed.bossHp ?? DAILY_BOSSES[0].maxHp,
          currentBoss: parsed.currentBoss || DAILY_BOSSES[0],
          // Combat extras
          playerShield: parsed.playerShield || 0,
          shieldTurnsLeft: parsed.shieldTurnsLeft || 0,
          combatLog: parsed.combatLog || [],
          damageEvents: [],       // transient, never persisted
          lastDamageAmount: 0,    // for animation trigger
          lastDamageType: "",     // "hit" | "crit" | "heal" | "shield"
          poiBonuses: parsed.poiBonuses || { manaRegen: 0, goldRegen: 0, moveRegen: 0 },
          defeatedBosses: parsed.defeatedBosses || [],
          customQuests: parsed.customQuests || [],
          log: parsed.log || [],
        };
      } catch {
        // corrupted save – fall through
      }
    }
    return {
      level: 1,
      xp: 0,
      skillPoints: 0,
      skills: baseSkills,
      currentBoss: DAILY_BOSSES[0],
      bossHp: DAILY_BOSSES[0].maxHp,
      day: new Date().toLocaleDateString(),
      log: [],
      customQuests: [],
      movementPoints: 0,
      gold: 0,
      mana: 0,
      mapData: generateMap(4),
      playerShield: 0,
      shieldTurnsLeft: 0,
      combatLog: [],
      damageEvents: [],
      lastDamageAmount: 0,
      lastDamageType: "",
      poiBonuses: { manaRegen: 0, goldRegen: 0, moveRegen: 0 },
      defeatedBosses: [],
    };
  });

  const [toast, setToast] = useState(null);

  // ─── Enhanced Log Helper ──────────────────────────────────────────
  const addLogEntry = useCallback((prev, type, message) => {
    const entry = {
      timestamp: new Date().toISOString(),
      time: new Date().toLocaleTimeString(),
      type, // QUEST, CLAIM, COMBAT, SKILL, MAP, BOSS, LEVEL, SYSTEM
      message,
    };
    return [entry, ...prev.log].slice(0, 100);
  }, []);

  // Persist – strip transient fields
  useEffect(() => {
    const { damageEvents: _, ...persisted } = gameState;
    localStorage.setItem("tim_life_rpg", JSON.stringify(persisted));
  }, [gameState]);

  const showToast = useCallback((msg, type = "info") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  // ─── XP / Level-Up ──────────────────────────────────────────────
  const addXp = useCallback(
    (amount) => {
      let leveledUp = false;
      setGameState((prev) => {
        let newXp = prev.xp + amount;
        let newLevel = prev.level;
        let newPoints = prev.skillPoints;

        while (
          newXp >= Math.floor(100 * Math.pow(1.5, newLevel - 1))
        ) {
          newXp -= Math.floor(100 * Math.pow(1.5, newLevel - 1));
          newLevel++;
          newPoints += 150;
          leveledUp = true;
        }

        if (leveledUp) {
          playLevelUpSound();
          setTimeout(
            () =>
              showToast(
                `Level Up! Du bist jetzt Level ${newLevel}. +150 Skillpunkte!`,
                "success"
              ),
            0
          );
        }

        const newState = { ...prev, xp: newXp, level: newLevel, skillPoints: newPoints };
        if (leveledUp) {
          newState.log = addLogEntry(prev, "LEVEL", `Level Up! Jetzt Level ${newLevel}. +150 SP.`);
        }
        return newState;
      });
    },
    [showToast, addLogEntry]
  );

  // ─── POI Bonus helper ───────────────────────────────────────────
  const recalcPoiBonuses = (tiles) => {
    const bonuses = { manaRegen: 0, goldRegen: 0, moveRegen: 0 };
    tiles.forEach((t) => {
      if (!t.discovered) return;
      const poi = POI_TABLE[t.type];
      if (!poi || !poi.bonus) return;
      if (poi.bonus.manaRegen) bonuses.manaRegen += poi.bonus.manaRegen;
      if (poi.bonus.goldRegen) bonuses.goldRegen += poi.bonus.goldRegen;
      if (poi.bonus.moveRegen) bonuses.moveRegen += poi.bonus.moveRegen;
    });
    return bonuses;
  };

  // ─── Quest Complete ─────────────────────────────────────────────
  const handleQuestComplete = useCallback(
    (quest) => {
      setGameState((prev) => {
        const baseRewards = getResourceRewards(quest.path);
        const bonuses = recalcPoiBonuses(prev.mapData.tiles);

        const totalMove = baseRewards.move + bonuses.moveRegen;
        const totalGold = baseRewards.gold + bonuses.goldRegen;
        const totalMana = baseRewards.mana + bonuses.manaRegen;

        const updatedQuests = (prev.customQuests || []).map((q) =>
          q.id === quest.id ? { ...q, completed: true, completedAt: new Date().toISOString() } : q
        );

        return {
          ...prev,
          movementPoints: prev.movementPoints + totalMove,
          gold: prev.gold + totalGold,
          mana: prev.mana + totalMana,
          poiBonuses: bonuses,
          customQuests: updatedQuests,
          log: addLogEntry(prev, "QUEST", `Quest: "${quest.name}" | +${quest.xp} XP, +${totalMove} MP, +${totalGold} Gold, +${totalMana} Mana.`),
        };
      });

      addXp(quest.xp);
      showToast(`Ressourcen erhalten! +${quest.xp} XP`, "success");
    },
    [addXp, showToast, addLogEntry]
  );

  // ─── Execute Attack / Ability ───────────────────────────────────
  const executeAttack = useCallback(
    (attack) => {
      setGameState((prev) => {
        // Resource check
        if (prev.mana < attack.cost.mana || prev.gold < attack.cost.gold) {
          setTimeout(
            () => showToast("Nicht genug Ressourcen!", "error"),
            0
          );
          return prev;
        }

        // Skill requirement check
        if (attack.requiresSkill) {
          // Support both legacy IDs (mon_3, soc_3, etc.) and new IDs
          const checkId = LEGACY_SKILL_MAP[attack.requiresSkill] || attack.requiresSkill;
          const skill = prev.skills.find((s) => s.id === checkId);
          if (!skill || !skill.unlocked) {
            setTimeout(
              () =>
                showToast(
                  `Skill "${skill?.name || attack.requiresSkill}" muss freigeschaltet sein!`,
                  "error"
                ),
              0
            );
            return prev;
          }
        }

        playHitSound();

        let dmg = attack.dmg || 0;

        // Critical hit multiplier
        if (attack.type === "crit") {
          dmg = Math.floor(dmg * 1); // already inflated in data
        }

        let newBossHp = prev.bossHp - dmg;
        if (newBossHp < 0) newBossHp = 0;

        // Shield logic
        let newShield = prev.playerShield;
        let newShieldTurns = prev.shieldTurnsLeft;
        if (attack.shield) {
          newShield = attack.shield;
          newShieldTurns = attack.shieldDuration;
        } else if (prev.shieldTurnsLeft > 0) {
          newShieldTurns = prev.shieldTurnsLeft - 1;
          if (newShieldTurns <= 0) newShield = 0;
        }

        // Movement refund (for Geist-Körper-Kombo)
        let moveRefund = attack.refundMove || 0;

        const logEntry = `[${new Date().toLocaleTimeString()}] ${attack.name} | -${dmg} HP${attack.shield ? `, +${attack.shield} Shield` : ""}`;

        // Boss defeated?
        if (newBossHp <= 0 && attack.dmg > 0) {
          playLevelUpSound();
          const bossIndex = DAILY_BOSSES.findIndex(
            (b) => b.id === prev.currentBoss.id
          );
          const nextBossIndex = (bossIndex + 1) % DAILY_BOSSES.length;
          const nextBoss = DAILY_BOSSES[nextBossIndex];
          const defeatedList = [...(prev.defeatedBosses || []), prev.currentBoss.id];

          return {
            ...prev,
            mana: prev.mana - attack.cost.mana,
            gold: prev.gold - attack.cost.gold + moveRefund,
            bossHp: nextBoss.maxHp,
            currentBoss: nextBoss,
            playerShield: newShield,
            shieldTurnsLeft: newShieldTurns,
            combatLog: [
              `${logEntry} 🔥 BOSS BESIEGT!`,
              `Naechster: ${nextBoss.name}`,
              ...prev.combatLog,
            ].slice(0, 30),
            log: addLogEntry(prev, "BOSS", `Boss "${prev.currentBoss.name}" besiegt! +100 Bonus XP. Naechster: ${nextBoss.name}`),
            lastDamageAmount: dmg,
            lastDamageType: attack.type === "crit" ? "crit" : "hit",
            defeatedBosses: defeatedList,
          };
        }

        return {
          ...prev,
          mana: prev.mana - attack.cost.mana,
          gold: prev.gold - attack.cost.gold + moveRefund,
          bossHp: newBossHp,
          playerShield: newShield,
          shieldTurnsLeft: newShieldTurns,
          combatLog: [logEntry, ...prev.combatLog].slice(0, 30),
          log: addLogEntry(prev, "COMBAT", logEntry),
          lastDamageAmount: dmg,
          lastDamageType:
            attack.type === "shield"
              ? "shield"
              : attack.type === "crit"
              ? "crit"
              : "hit",
        };
      });

      const typeLabel =
        attack.type === "crit"
          ? "KRITISCHER TREFFER!"
          : attack.type === "shield"
          ? "Schild aktiviert!"
          : "Angriff erfolgreich!";
      if (attack.dmg > 0) {
        showToast(`${typeLabel} -${attack.dmg} HP`, attack.type === "crit" ? "success" : "info");
      } else if (attack.shield) {
        showToast(`Schild: +${attack.shield} HP Block für ${attack.shieldDuration} Züge`, "success");
      }
    },
    [showToast, addLogEntry]
  );

  // ─── Unlock Skill ───────────────────────────────────────────────
  const unlockSkill = useCallback(
    (skillId) => {
      const skill = gameState.skills.find((s) => s.id === skillId);
      if (!skill || skill.unlocked) return false;

      const reqsMet = skill.req.every((reqId) => {
        const reqSkill = gameState.skills.find((s) => s.id === reqId);
        return reqSkill && reqSkill.unlocked;
      });

      if (!reqsMet) {
        showToast("Voraussetzungen nicht erfüllt!", "error");
        return false;
      }

      if (gameState.skillPoints < skill.cost) {
        showToast("Nicht genug Skillpunkte!", "error");
        return false;
      }

      playUnlockSound();
      setGameState((prev) => ({
        ...prev,
        skillPoints: prev.skillPoints - skill.cost,
        skills: prev.skills.map((s) =>
          s.id === skillId ? { ...s, unlocked: true } : s
        ),
        log: addLogEntry(prev, "SKILL", `Skill freigeschaltet: "${skill.name}" (-${skill.cost} SP)`),
      }));
      showToast(`Skill freigeschaltet: ${skill.name}!`, "success");
      return true;
    },
    [gameState.skills, gameState.skillPoints, showToast, addLogEntry]
  );

  // ─── Uncover Map Tile ───────────────────────────────────────────
  const uncoverTile = useCallback(
    (tileIndex) => {
      setGameState((prev) => {
        if (prev.movementPoints < UNCOVER_COST) {
          setTimeout(
            () => showToast(`Nicht genug MP! Kostet ${UNCOVER_COST} MP.`, "error"),
            0
          );
          return prev;
        }

        const newTiles = [...prev.mapData.tiles];
        const tile = newTiles[tileIndex];
        if (tile.discovered) return prev;

        // Check adjacency — must be adjacent to at least one discovered tile
        const hasAdjacentDiscovered = newTiles.some(
          (t, i) => t.discovered && i !== tileIndex && areHexAdjacent(t, tile)
        );
        if (!hasAdjacentDiscovered) {
          setTimeout(
            () => showToast("Zu weit entfernt! Nur benachbarte Felder möglich.", "error"),
            0
          );
          return prev;
        }

        newTiles[tileIndex] = { ...tile, discovered: true };

        const bonuses = recalcPoiBonuses(newTiles);
        const poi = POI_TABLE[tile.type];
        let extraLog = `Tile entdeckt: ${poi?.label || tile.type}.`;
        let ambushTriggered = false;

        // Check for map boss on wilds tile
        if (tile.mapBoss && !tile.mapBoss.defeated) {
          extraLog += " ⚠️ MAP BOSS: " + tile.mapBoss.name + "!";
          ambushTriggered = true;
        }

        return {
          ...prev,
          movementPoints: prev.movementPoints - UNCOVER_COST,
          mapData: { ...prev.mapData, tiles: newTiles },
          poiBonuses: bonuses,
          combatLog: ambushTriggered
            ? [`⚠️ Map Boss auf ${tile.name}: ${tile.mapBoss.name}!`, ...prev.combatLog].slice(0, 30)
            : prev.combatLog,
          log: addLogEntry(prev, "MAP", `${extraLog} -${UNCOVER_COST} MP.`),
        };
      });

      showToast("Neues Gebiet entdeckt!", "success");
    },
    [showToast, addLogEntry]
  );

  // ─── Clear damage animation trigger (called by BattleArena after anim) ─
  const clearDamageEvent = useCallback(() => {
    setGameState((prev) => ({
      ...prev,
      lastDamageAmount: 0,
      lastDamageType: "",
    }));
  }, []);

  // ─── Available actions (filter attacks by unlocked skills) ───────
  const getAvailableActions = useCallback(() => {
    const unlockedSkillIds = new Set(
      gameState.skills.filter((s) => s.unlocked).map((s) => s.id)
    );

    return ATTACKS.filter((a) => {
      if (!a.requiresSkill) return true;
      return unlockedSkillIds.has(a.requiresSkill);
    });
  }, [gameState.skills]);

  // ─── POI info helper ────────────────────────────────────────────
  const getPoiInfo = useCallback((tileType) => {
    return POI_TABLE[tileType] || { label: tileType, icon: "map", bonus: {}, desc: "" };
  }, []);

  // ─── Claim Task (Honor System) ──────────────────────────────────
  const claimTat = useCallback(
    (pathId) => {
      const rewards = getResourceRewards(pathId);
      const bonuses = recalcPoiBonuses(
        gameState.mapData?.tiles || INITIAL_MAP_DATA.tiles
      );

      const totalMove = rewards.move + bonuses.moveRegen;
      const totalGold = rewards.gold + bonuses.goldRegen;
      const totalMana = rewards.mana + bonuses.manaRegen;

      // Build reward summary
      const parts = [];
      if (totalMove > 0) parts.push(`+${totalMove} MP`);
      if (totalGold > 0) parts.push(`+${totalGold} Gold`);
      if (totalMana > 0) parts.push(`+${totalMana} Mana`);
      const rewardStr = parts.join(", ") || "Nichts";

      const pathNames = {
        architect: "Architekt",
        socratic: "Sokratiker",
        bard: "Barde",
        monk: "Mönch",
        acrobat: "Akrobat",
      };

      setGameState((prev) => ({
        ...prev,
        movementPoints: prev.movementPoints + totalMove,
        gold: prev.gold + totalGold,
        mana: prev.mana + totalMana,
        poiBonuses: bonuses,
        log: addLogEntry(prev, "CLAIM", `Tat vollbracht (${pathNames[pathId] || pathId}): ${rewardStr}.`),
      }));

      showToast(`Tat eingetragen! ${rewardStr}`, "success");
    },
    [gameState.mapData, showToast, addLogEntry]
  );

  // ─── Add Custom Skill ───────────────────────────────────────────
  const addCustomSkill = useCallback((pathId, tierNumber, skillData) => {
    // Validate path
    if (!SKILL_TREE_DATA[pathId]) {
      showToast(`Unbekannter Pfad: ${pathId}`, "error");
      return false;
    }

    // Validate tier
    const tierKey = Object.keys(SKILL_TREE_DATA[pathId].tiers).find(
      (k) => SKILL_TREE_DATA[pathId].tiers[k].tierNumber === tierNumber
    );
    if (!tierKey) {
      showToast(`Ungültige Stufe: ${tierNumber}`, "error");
      return false;
    }

    // Generate unique ID
    const id = `custom_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

    const newSkill = {
      id,
      path: pathId,
      tier: tierNumber,
      name: skillData.name,
      desc: skillData.desc || "Benutzerdefinierter Skill.",
      icon: skillData.icon || "eye",
      cost: skillData.cost || 100,
      unlocked: false,
      req: skillData.req || [],
      isCustom: true,
    };

    setGameState((prev) => ({
      ...prev,
      skills: [...prev.skills, newSkill],
      log: addLogEntry(prev, "SKILL", `Neuer Skill hinzugefügt: "${newSkill.name}" (Pfad: ${pathId}, Stufe: ${tierNumber})`),
    }));

    showToast(`Skill "${newSkill.name}" hinzugefügt!`, "success");
    return newSkill;
  }, [showToast, addLogEntry]);

  // ─── Add Custom Quest ───────────────────────────────────────────
  const addCustomQuest = useCallback((questData) => {
    const id = `custom_quest_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const newQuest = {
      id,
      name: questData.name,
      path: questData.path,
      xp: questData.xp || 30,
      description: questData.description || "",
      isCustom: true,
      completed: false,
      createdAt: new Date().toISOString(),
    };

    setGameState((prev) => {
      const existingCustom = prev.customQuests || [];
      return {
        ...prev,
        customQuests: [...existingCustom, newQuest],
        log: addLogEntry(prev, "SYSTEM", `Neue Quest erstellt: "${newQuest.name}" (${newQuest.path}, ${newQuest.xp} XP)`),
      };
    });

    showToast(`Quest "${newQuest.name}" erstellt!`, "success");
    return newQuest;
  }, [showToast, addLogEntry]);

  // ─── Delete Custom Quest ────────────────────────────────────────
  const deleteCustomQuest = useCallback((questId) => {
    setGameState((prev) => ({
      ...prev,
      customQuests: (prev.customQuests || []).filter((q) => q.id !== questId),
    }));
    showToast("Quest gelöscht.", "info");
  }, [showToast]);

  // ─── Defeat Map Boss ────────────────────────────────────────────
  const defeatMapBoss = useCallback((tileIndex) => {
    setGameState((prev) => {
      const newTiles = [...prev.mapData.tiles];
      const tile = newTiles[tileIndex];
      if (!tile || !tile.mapBoss || tile.mapBoss.defeated) return prev;

      const levelBonus = Math.max(0, prev.level - 1) * 20;
      const bonusXp = 50 + levelBonus;
      const bonusGold = 20 + prev.level * 5;
      const bonusMana = 15 + prev.level * 3;

      newTiles[tileIndex] = {
        ...tile,
        mapBoss: { ...tile.mapBoss, defeated: true },
      };

      return {
        ...prev,
        mapData: { ...prev.mapData, tiles: newTiles },
        gold: prev.gold + bonusGold,
        mana: prev.mana + bonusMana,
        log: addLogEntry(prev, "BOSS", `Map Boss "${tile.mapBoss.name}" auf ${tile.name} besiegt! +${bonusXp} XP, +${bonusGold} Gold, +${bonusMana} Mana.`),
      };
    });

    addXp(50 + Math.max(0, (gameState.level || 1) - 1) * 20);
    showToast("Map Boss besiegt!", "success");
  }, [showToast, addXp, addLogEntry, gameState.level]);

  // ─── Dev Actions ────────────────────────────────────────────────
  const devResetAll = useCallback(() => {
    localStorage.removeItem("tim_life_rpg");
    window.location.reload();
  }, []);

  const devSetLevel = useCallback((level) => {
    setGameState((prev) => ({
      ...prev,
      level,
      xp: 0,
      skillPoints: prev.skillPoints + (level - prev.level) * 150,
      log: addLogEntry(prev, "SYSTEM", `[DEV] Level auf ${level} gesetzt.`),
    }));
    showToast(`Level auf ${level} gesetzt.`, "info");
  }, [showToast, addLogEntry]);

  const devSetResources = useCallback((resources) => {
    setGameState((prev) => {
      const updated = { ...prev };
      if (resources.skillPoints !== undefined) updated.skillPoints = resources.skillPoints;
      if (resources.gold !== undefined) updated.gold = resources.gold;
      if (resources.mana !== undefined) updated.mana = resources.mana;
      if (resources.movementPoints !== undefined) updated.movementPoints = resources.movementPoints;
      updated.log = addLogEntry(prev, "SYSTEM", `[DEV] Ressourcen gesetzt: ${JSON.stringify(resources)}`);
      return updated;
    });
    showToast("Ressourcen aktualisiert.", "info");
  }, [showToast, addLogEntry]);

  const devAddXp = useCallback((amount) => {
    addXp(amount);
    showToast(`+${amount} XP (DEV)`, "info");
  }, [addXp, showToast]);

  const devUnlockAllSkills = useCallback(() => {
    setGameState((prev) => ({
      ...prev,
      skills: prev.skills.map((s) => ({ ...s, unlocked: true })),
      log: addLogEntry(prev, "SYSTEM", "[DEV] Alle Skills freigeschaltet."),
    }));
    showToast("Alle Skills freigeschaltet!", "info");
  }, [showToast, addLogEntry]);

  const devRevealAllTiles = useCallback(() => {
    setGameState((prev) => {
      const newTiles = prev.mapData.tiles.map((t) => ({ ...t, discovered: true }));
      const bonuses = recalcPoiBonuses(newTiles);
      return {
        ...prev,
        mapData: { ...prev.mapData, tiles: newTiles },
        poiBonuses: bonuses,
        log: addLogEntry(prev, "SYSTEM", "[DEV] Alle Kartenfelder aufgedeckt."),
      };
    });
    showToast("Alle Kartenfelder aufgedeckt!", "info");
  }, [showToast, addLogEntry]);

  const devDefeatBoss = useCallback(() => {
    setGameState((prev) => {
      const bossIndex = DAILY_BOSSES.findIndex((b) => b.id === prev.currentBoss.id);
      const nextBossIndex = (bossIndex + 1) % DAILY_BOSSES.length;
      const nextBoss = DAILY_BOSSES[nextBossIndex];
      const defeatedList = [...(prev.defeatedBosses || []), prev.currentBoss.id];
      return {
        ...prev,
        bossHp: nextBoss.maxHp,
        currentBoss: nextBoss,
        defeatedBosses: defeatedList,
        log: addLogEntry(prev, "SYSTEM", `[DEV] Boss "${prev.currentBoss.name}" besiegt.`),
      };
    });
    showToast("Boss besiegt! (DEV)", "info");
  }, [showToast, addLogEntry]);

  // ─── Game Lock State ────────────────────────────────────────────
  const [gameLocked, setGameLocked] = useState(() => {
    // Dev mode overrides lock
    const devMode = localStorage.getItem("tim_life_rpg_dev") === "true";
    if (devMode) return false;
    return isGameLocked();
  });

  const [devMode, setDevMode] = useState(() => {
    return localStorage.getItem("tim_life_rpg_dev") === "true";
  });

  const toggleDevMode = useCallback(() => {
    setDevMode((prev) => {
      const newVal = !prev;
      localStorage.setItem("tim_life_rpg_dev", String(newVal));
      if (newVal) {
        setGameLocked(false);
      } else {
        setGameLocked(isGameLocked());
      }
      return newVal;
    });
  }, []);

  return {
    gameState,
    setGameState,
    addXp,
    handleQuestComplete,
    executeAttack,
    unlockSkill,
    uncoverTile,
    clearDamageEvent,
    getAvailableActions,
    getPoiInfo,
    addCustomSkill,
    addCustomQuest,
    deleteCustomQuest,
    defeatMapBoss,
    claimTat,
    skillTreeData: SKILL_TREE_DATA,
    toast,
    showToast,
    // Dev actions
    devResetAll,
    devSetLevel,
    devSetResources,
    devAddXp,
    devUnlockAllSkills,
    devRevealAllTiles,
    devDefeatBoss,
    // Lock / dev mode
    gameLocked,
    devMode,
    toggleDevMode,
  };
};
```

## ⚙️ Engine (src/engine/)

### audioEngine.js
```javascript
// ==========================================
// AUDIO ENGINE (Ambient / Downtempo Vibe)
// ==========================================
const AudioContext = window.AudioContext || window.webkitAudioContext;
let audioCtx;

export const initAudio = () => {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
};

const playAmbientChord = (frequencies, duration = 2, type = "sine") => {
  if (!audioCtx) return;
  const masterGain = audioCtx.createGain();
  masterGain.connect(audioCtx.destination);
  masterGain.gain.setValueAtTime(0, audioCtx.currentTime);
  masterGain.gain.linearRampToValueAtTime(
    0.15,
    audioCtx.currentTime + duration * 0.2
  );
  masterGain.gain.exponentialRampToValueAtTime(
    0.001,
    audioCtx.currentTime + duration
  );

  frequencies.forEach((freq) => {
    const osc = audioCtx.createOscillator();
    const lfo = audioCtx.createOscillator();
    const lfoGain = audioCtx.createGain();

    osc.type = type;
    osc.frequency.value = freq;

    lfo.type = "sine";
    lfo.frequency.value = Math.random() * 2 + 0.1;
    lfoGain.gain.value = 3;

    lfo.connect(lfoGain);
    lfoGain.connect(osc.detune);

    osc.connect(masterGain);
    osc.start(audioCtx.currentTime);
    osc.stop(audioCtx.currentTime + duration);
    lfo.start(audioCtx.currentTime);
    lfo.stop(audioCtx.currentTime + duration);
  });
};

export const playHitSound = () => {
  initAudio();
  playAmbientChord([65.41, 130.81], 1, "triangle");
};

export const playLevelUpSound = () => {
  initAudio();
  playAmbientChord([261.63, 329.63, 392.0, 493.88], 3, "sine");
};

export const playUnlockSound = () => {
  initAudio();
  playAmbientChord([440.0, 659.25], 2, "sine");
};```

### particleEngine.js
```javascript
import { useEffect } from "react";

// ==========================================
// PARTIKEL ENGINE HOOK
// ==========================================
class Particle {
  constructor(canvas) {
    this.canvas = canvas;
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.size = Math.random() * 2 + 0.5;
    this.speedX = Math.random() * 0.5 - 0.25;
    this.speedY = Math.random() * 0.5 - 0.25;
    this.color = `rgba(${Math.floor(
      Math.random() * 100 + 100
    )}, ${Math.floor(Math.random() * 100 + 100)}, ${Math.floor(
      Math.random() * 155 + 100
    )}, ${Math.random() * 0.4 + 0.1})`;
  }
  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    if (this.x > this.canvas.width) this.x = 0;
    else if (this.x < 0) this.x = this.canvas.width;
    if (this.y > this.canvas.height) this.y = 0;
    else if (this.y < 0) this.y = this.canvas.height;
  }
  draw(ctx) {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

export const useParticles = (canvasRef) => {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animationFrameId;
    let particles = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", resize);
    resize();

    const initParticles = () => {
      particles = [];
      for (let i = 0; i < 70; i++) {
        particles.push(new Particle(canvas));
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.update();
        p.draw(ctx);
      });
      animationFrameId = requestAnimationFrame(animate);
    };

    initParticles();
    animate();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [canvasRef]);
};```

## 🛠️ Utilities (src/utils/)

### mapGenerator.js
```javascript
/**
 * Procedural Hex Map Generator
 * Generates a weighted random hex grid for the "Archipel des Geistes"
 */

const POI_TYPES = [
  { type: "nexus",    weight: 3,  minCount: 1, maxCount: 1 },
  { type: "monastery", weight: 15, minCount: 3, maxCount: 6 },
  { type: "academy",  weight: 15, minCount: 3, maxCount: 6 },
  { type: "gym",      weight: 12, minCount: 2, maxCount: 5 },
  { type: "studio",   weight: 10, minCount: 2, maxCount: 4 },
  { type: "server",   weight: 10, minCount: 2, maxCount: 4 },
  { type: "wilds",    weight: 35, minCount: 8, maxCount: 18 },
];

const POI_NAMES = {
  nexus: [
    "Zentrum des Geistes", "Kristalliner Nexus", "Quelle der Klarheit",
    "Herz des Archipels", "Ursprung des Wissens",
  ],
  monastery: [
    "Tempel der Stille", "Kloster des Erwachens", "Halle der Achtsamkeit",
    "Garten der Meditation", "Zazen-Pavillon", "Ort des Qi Gong",
  ],
  academy: [
    "Sokratische Akademie", "Halle der Dialektik", "Athenäum der Ethik",
    "Gymnasium des Geistes", "Platos Schatten", "Kavita-Kolleg",
  ],
  gym: [
    "Eisenhalle", "Arena der Disziplin", "Tempel der Physis",
    "Halle der Stärke", "Dojo der Beharrlichkeit", "Flow-Colosseum",
  ],
  studio: [
    "Klanglabor", "Studio der Resonanz", "Frequenz-Schmiede",
    "Ableton-Arkaden", "Raum des Masterings", "yrrpheus-Kammer",
  ],
  server: [
    "Docker Core", "Server-Farm Alpha", "Node der Automation",
    "Dify-Rechenzentrum", "Inbox-Zero-Station", "Craft-Server",
  ],
  wilds: [
    "Unbekanntes Gebiet", "Nebel der Täuschung", "Dschungel der Ablenkung",
    "Schlucht der Prokrastination", "Sumpf der Lethargie",
    "Wüste der Routine", "Gestrüpp der Zweifel", "Höhle des Widerstands",
    "Irrgarten der Zerstreuung", "Ödland der Gleichgültigkeit",
  ],
};

/**
 * Weighted random selection (reserved for future use)
 */
// eslint-disable-next-line no-unused-vars
function weightedRandom(items) {
  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
  let random = Math.random() * totalWeight;
  for (const item of items) {
    random -= item.weight;
    if (random <= 0) return item.type;
  }
  return items[items.length - 1].type;
}

/**
 * Pick a random name for a POI type
 */
function getRandomPoiName(type) {
  const names = POI_NAMES[type] || POI_NAMES.wilds;
  return names[Math.floor(Math.random() * names.length)];
}

/**
 * Generate hex grid coordinates in a spiral pattern from center
 * Returns array of {q, r} axial coordinates
 */
function generateHexRing(radius) {
  const hexes = [];
  if (radius === 0) {
    return [{ q: 0, r: 0 }];
  }

  // Start at "top" of ring and go clockwise
  let q = 0;
  let r = -radius;

  // Direction vectors for hex grid in pointy-top orientation
  const directions = [
    { dq: 1, dr: 0 },   // southeast
    { dq: 0, dr: 1 },   // south
    { dq: -1, dr: 1 },  // southwest
    { dq: -1, dr: 0 },  // northwest
    { dq: 0, dr: -1 },  // north
    { dq: 1, dr: -1 },  // northeast
  ];

  for (let i = 0; i < 6; i++) {
    for (let j = 0; j < radius; j++) {
      hexes.push({ q, r });
      q += directions[i].dq;
      r += directions[i].dr;
    }
  }

  return hexes;
}

/**
 * Generate all hex coordinates up to a given radius
 */
function generateHexGrid(maxRadius) {
  const allHexes = [];
  for (let radius = 0; radius <= maxRadius; radius++) {
    allHexes.push(...generateHexRing(radius));
  }
  return allHexes;
}

/**
 * Generate the full procedural map
 * @param {number} maxRadius - How many rings from center (default 4 = 61 tiles)
 * @param {number} seed - Optional seed for reproducibility (not used yet)
 * @returns {{ tiles: Array, playerPosition: {q, r} }}
 */
export function generateMap(maxRadius = 4, seed = null) {
  // If seed provided, we could seed the RNG (future enhancement)
  if (seed !== null) {
    // For now, just use Math.random — seeded RNG would need a custom PRNG
  }

  const hexCoords = generateHexGrid(maxRadius);
  const totalTiles = hexCoords.length;

  // Calculate how many of each type we want
  const typeCounts = {};
  let assigned = 0;
  for (const poi of POI_TYPES) {
    const count = Math.min(
      poi.maxCount,
      Math.max(poi.minCount, Math.floor((poi.weight / 100) * totalTiles))
    );
    typeCounts[poi.type] = count;
    assigned += count;
  }

  // Ensure we have at least 1 nexus (center)
  typeCounts.nexus = Math.max(1, typeCounts.nexus);

  // Fill remaining with wilds if we haven't assigned enough
  const remaining = totalTiles - assigned;
  if (remaining > 0) {
    typeCounts.wilds = (typeCounts.wilds || 0) + remaining;
  }

  // Build pool of types
  const typePool = [];
  for (const [type, count] of Object.entries(typeCounts)) {
    for (let i = 0; i < count; i++) {
      typePool.push(type);
    }
  }

  // Shuffle the pool
  for (let i = typePool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [typePool[i], typePool[j]] = [typePool[j], typePool[i]];
  }

  // Create tiles
  const tiles = hexCoords.map((coord, index) => {
    const tileType = typePool[index] || "wilds";
    const isCenter = coord.q === 0 && coord.r === 0;

    return {
      q: coord.q,
      r: coord.r,
      type: isCenter ? "nexus" : tileType,
      name: isCenter
        ? "Zentrum des Geistes"
        : getRandomPoiName(tileType),
      discovered: isCenter, // Only center starts discovered
      mapBoss: null, // Will be populated for wilds tiles
    };
  });

  // Assign map bosses to some wilds tiles
  const MAP_BOSSES = [
    { id: "map_boss_1", name: "Wächter der Ablenkung", type: "Wildnis", color: "text-orange-400", baseHp: 100 },
    { id: "map_boss_2", name: "Schatten der Unordnung", type: "Wildnis", color: "text-orange-400", baseHp: 120 },
    { id: "map_boss_3", name: "Dämon der Bequemlichkeit", type: "Wildnis", color: "text-orange-400", baseHp: 150 },
    { id: "map_boss_4", name: "Hydra der faulen Ausreden", type: "Wildnis", color: "text-orange-400", baseHp: 180 },
    { id: "map_boss_5", name: "Golem der Selbstzweifel", type: "Wildnis", color: "text-orange-400", baseHp: 200 },
  ];

  let bossIndex = 0;
  tiles.forEach((tile) => {
    if (tile.type === "wilds" && bossIndex < MAP_BOSSES.length) {
      // Not every wilds tile gets a boss — roughly 40% chance
      if (Math.random() < 0.4 && bossIndex < MAP_BOSSES.length) {
        const baseBoss = MAP_BOSSES[bossIndex];
        tile.mapBoss = {
          ...baseBoss,
          maxHp: baseBoss.baseHp,
          currentHp: baseBoss.baseHp,
          defeated: false,
        };
        bossIndex++;
      }
    }
  });

  return {
    tiles,
    playerPosition: { q: 0, r: 0 },
  };
}

/**
 * Check if two hex tiles are adjacent
 */
export function areHexAdjacent(a, b) {
  const dq = Math.abs(a.q - b.q);
  const dr = Math.abs(a.r - b.r);
  const ds = Math.abs((a.q + a.r) - (b.q + b.r));
  // In axial coordinates, two hexes are adjacent if max of (dq, dr, ds) === 1
  return Math.max(dq, dr, ds) === 1;
}
```

## 📊 Daten & Konstanten (src/data/)

### constants.js
```js
export const PATH_COLORS = {
  architect: "from-blue-900 to-blue-600 border-blue-400 shadow-blue-500/50",
  socratic: "from-amber-900 to-amber-600 border-amber-400 shadow-amber-500/50",
  bard: "from-purple-900 to-purple-600 border-purple-400 shadow-purple-500/50",
  monk: "from-emerald-900 to-emerald-600 border-emerald-400 shadow-emerald-500/50",
  acrobat: "from-red-900 to-red-600 border-red-400 shadow-red-500/50",
};```

### skillTreeData.js
```js
// ─── Skill Tree Data ───────────────────────────────────────────────
// The complete 5-path Skill Tree of Life.
// Each path has 4 tiers: basis (1), schwelle (2), quantensprung (3), meisterschaft (4).
// Every skill has: id, name, desc, icon, cost, req (prerequisite skill IDs).
// The `unlocked` flag is managed at runtime in gameState (not here).

export const SKILL_TREE_DATA = {
  // ═══════════════════════════════════════════════════════════
  // Path 1: Der Sokratiker — Intellekt & Lehre → Yields Gold
  // ═══════════════════════════════════════════════════════════
  socratic: {
    id: "socratic",
    title: "Der Sokratiker",
    subtitle: "Intellekt & Lehre",
    yield: "Gold",
    endgameGoal:
      "Publishing books, didactic mastery in Ethics/Philosophy/German, and merging constructive and instructive teaching approaches.",
    tiers: {
      basis: {
        label: "Die Basis",
        tierNumber: 1,
        skills: [
          {
            id: "soc_master_of_arts",
            name: "Master of Arts (Philosophie)",
            desc: "Die Fähigkeit zur radikalen Analyse und zum abstrakten Denken.",
            icon: "brain",
            cost: 0,
            req: [],
          },
          {
            id: "soc_ethik_didaktik",
            name: "Ethische Grund-Didaktik",
            desc: "Die Basis-Lehrbefähigung und Vermittlung moralischer Konzepte.",
            icon: "scroll",
            cost: 50,
            req: ["soc_master_of_arts"],
          },
        ],
      },
      schwelle: {
        label: "Die aktuelle Schwelle",
        tierNumber: 2,
        skills: [
          {
            id: "soc_germanistik",
            name: "Germanistische Grundlegung",
            desc: "Abschluss der Zusatzqualifikation — Verständnis von Sprache als Weltgestaltung.",
            icon: "pen",
            cost: 100,
            req: ["soc_ethik_didaktik"],
          },
          {
            id: "soc_didaktische_alchemie",
            name: "Didaktische Alchemie",
            desc: "Balance zwischen Konstruktion (Schüler erarbeiten selbst) und Instruktion.",
            icon: "edit",
            cost: 120,
            req: ["soc_ethik_didaktik"],
          },
          {
            id: "soc_classroom_command",
            name: "Classroom Command",
            desc: "Authentischer Stil für Präsenz und Struktur im Unterricht.",
            icon: "crown",
            cost: 120,
            req: ["soc_ethik_didaktik"],
          },
        ],
      },
      quantensprung: {
        label: "Der Quantensprung",
        tierNumber: 3,
        skills: [
          {
            id: "soc_deep_reading",
            name: "Deep Reading & Synthesis",
            desc: "Den 'Stapel der Schande' in ein aktives Wissensnetz verwandeln.",
            icon: "book",
            cost: 200,
            req: ["soc_germanistik", "soc_didaktische_alchemie"],
          },
          {
            id: "soc_schreib_flow",
            name: "Der Schreib-Flow",
            desc: "Übergang zum aktiven Produzenten — Reflexionen, Essays.",
            icon: "pen",
            cost: 200,
            req: ["soc_didaktische_alchemie"],
          },
          {
            id: "soc_paed_ganzheit",
            name: "Pädagogische Ganzheitlichkeit",
            desc: "Das fertige funktionale Unterrichtskonzept.",
            icon: "eye",
            cost: 250,
            req: ["soc_classroom_command", "soc_didaktische_alchemie"],
          },
          {
            id: "soc_sokratische_praesenz",
            name: "Sokratische Präsenz",
            desc: "Die Essenz: Den Raum der ethischen Klarheit und Geistesgegenwart im Unterricht halten.",
            icon: "yin_yang",
            cost: 300,
            req: ["soc_deep_reading", "soc_paed_ganzheit"],
          },
        ],
      },
      meisterschaft: {
        label: "Die Meisterschaft",
        tierNumber: 4,
        skills: [
          {
            id: "soc_publikation",
            name: "Publizierte Autorität",
            desc: "Veröffentlichung des ersten Werkes.",
            icon: "book",
            cost: 500,
            req: ["soc_schreib_flow"],
          },
          {
            id: "soc_mentor",
            name: "Mentor der Sokratik",
            desc: "Prägung der Didaktik des Fachbereichs.",
            icon: "crown",
            cost: 600,
            req: ["soc_sokratische_praesenz"],
          },
          {
            id: "soc_phil_leben",
            name: "Philosophische Lebensführung",
            desc: "Vollständige Integration von Denken, Lehren und Sein.",
            icon: "yin_yang",
            cost: 800,
            req: ["soc_mentor", "soc_publikation"],
          },
        ],
      },
    },
  },

  // ═══════════════════════════════════════════════════════════
  // Path 2: Der Barde — Musik & Produktion → Yields Mana
  // ═══════════════════════════════════════════════════════════
  bard: {
    id: "bard",
    title: "Der Barde",
    subtitle: "Musik & Produktion",
    yield: "Mana",
    endgameGoal:
      "Live performances, building a true fanbase, generating passive income, and maintaining an aesthetic digital presence for 'yrrpheus' (Ambient) and 'yolomeus' (Chillhop).",
    tiers: {
      basis: {
        label: "Die Basis",
        tierNumber: 1,
        skills: [
          {
            id: "bar_daw_nav",
            name: "DAW-Navigation & Arrangement",
            desc: "Solides Fundament in Ableton Live 12.",
            icon: "music",
            cost: 0,
            req: [],
          },
          {
            id: "bar_mixing_master",
            name: "Mixing & Mastering Fundament",
            desc: "Grundverständnis für UADx- und Ableton-Plugins.",
            icon: "sliders",
            cost: 50,
            req: ["bar_daw_nav"],
          },
        ],
      },
      schwelle: {
        label: "Die aktuelle Schwelle",
        tierNumber: 2,
        skills: [
          {
            id: "bar_workflow",
            name: "Workflow-Autonomie",
            desc: "Feste Studioumgebung, um in unter 15 Minuten zur ersten Skizze zu kommen.",
            icon: "sliders",
            cost: 100,
            req: ["bar_daw_nav"],
          },
          {
            id: "bar_release_rythmus",
            name: "Der Release-Rhythmus",
            desc: "Den viermonatigen Stillstand brechen; regelmäßige Veröffentlichungen.",
            icon: "radio",
            cost: 120,
            req: ["bar_mixing_master"],
          },
          {
            id: "bar_sound_design",
            name: "Sound Design Erwachen",
            desc: "Eigene Klänge formen statt Presets nutzen.",
            icon: "cloud",
            cost: 120,
            req: ["bar_mixing_master"],
          },
        ],
      },
      quantensprung: {
        label: "Die Dualität",
        tierNumber: 3,
        skills: [
          {
            id: "bar_yrrpheus",
            name: "Atmosphärische Synthese (yrrpheus)",
            desc: "Meisterhafte Erschaffung von Reverb-Kaskaden und Drones.",
            icon: "cloud",
            cost: 200,
            req: ["bar_sound_design"],
          },
          {
            id: "bar_field_rec",
            name: "Field Recording & Textur",
            desc: "Organische Geräusche in elektronische Ambience verweben.",
            icon: "radio",
            cost: 200,
            req: ["bar_sound_design"],
          },
          {
            id: "bar_yolomeus",
            name: "LoFi-Groove & Vibe (yolomeus)",
            desc: "Die Kunst des unperfekten Rhythmus und Humanizing von Beats.",
            icon: "headphones",
            cost: 200,
            req: ["bar_workflow"],
          },
          {
            id: "bar_jazz_harmonik",
            name: "Jazz-Harmonik & Sampling",
            desc: "Fortgeschrittenes Flippen von Samples und komplexe Akkordfolgen.",
            icon: "music",
            cost: 250,
            req: ["bar_yolomeus", "bar_release_rythmus"],
          },
        ],
      },
      meisterschaft: {
        label: "Die Meisterschaft",
        tierNumber: 4,
        skills: [
          {
            id: "bar_aesthetik",
            name: "Ästhetische digitale Präsenz",
            desc: "Kohärentes visuelles und klangliches Branding.",
            icon: "eye",
            cost: 500,
            req: ["bar_yrrpheus", "bar_yolomeus"],
          },
          {
            id: "bar_fan_cult",
            name: "True Fan Cultivation",
            desc: "Aufbau einer Community für passives Einkommen.",
            icon: "heart",
            cost: 600,
            req: ["bar_aesthetik", "bar_release_rythmus"],
          },
          {
            id: "bar_live_set",
            name: "Das Live-Erlebnis",
            desc: "Übertragung der Studio-Tracks in ein fließendes, hybrides Live-Set.",
            icon: "headphones",
            cost: 800,
            req: ["bar_fan_cult", "bar_field_rec"],
          },
        ],
      },
    },
  },

  // ═══════════════════════════════════════════════════════════
  // Path 3: Der Mönch — Achtsamkeit & Schattenarbeit → Buffs & Mana
  // ═══════════════════════════════════════════════════════════
  monk: {
    id: "monk",
    title: "Der Mönch",
    subtitle: "Achtsamkeit & Schattenarbeit",
    yield: "Mana & Passive Buffs",
    endgameGoal:
      "Erleuchtung (Bodhicitta), combining Tibetan Buddhist clarity (insight into Shunyata/Samsara) with Taoist vitality (extreme health via Qi Gong) to fight dark impulses and shadow/addiction.",
    tiers: {
      basis: {
        label: "Die Basis",
        tierNumber: 1,
        skills: [
          {
            id: "mon_dharma",
            name: "Das Fundament des Dharma",
            desc: "Intellektuelles/intuitives Verständnis der Meditationspraxis.",
            icon: "lotus",
            cost: 0,
            req: [],
          },
          {
            id: "mon_beobachter",
            name: "Erfahrung des Beobachters",
            desc: "Das erlebte Wissen um den 'Right Mind'.",
            icon: "eye",
            cost: 50,
            req: ["mon_dharma"],
          },
        ],
      },
      schwelle: {
        label: "The Shadow War / Main Quest",
        tierNumber: 2,
        skills: [
          {
            id: "mon_identity",
            name: "Identity Forging",
            desc: "Zerstörung dunkler Impulse durch Affirmationen und ein neues Selbstkonzept.",
            icon: "yin_yang",
            cost: 100,
            req: ["mon_beobachter"],
          },
          {
            id: "mon_remembrance",
            name: "Remembrance",
            desc: "Alltags-Achtsamkeit zur Unterbrechung des Autopiloten.",
            icon: "lotus",
            cost: 120,
            req: ["mon_beobachter"],
          },
          {
            id: "mon_qigong",
            name: "Qi Gong Fundament",
            desc: "Physisch-energetische Praxis für extreme Gesundheit.",
            icon: "wind",
            cost: 120,
            req: ["mon_dharma"],
          },
        ],
      },
      quantensprung: {
        label: "Die Transformation",
        tierNumber: 3,
        skills: [
          {
            id: "mon_anal_med",
            name: "Analytische Meditation & Mantra-Flow",
            desc: "Kognitives Durchdringen von Konzepten.",
            icon: "brain",
            cost: 200,
            req: ["mon_identity", "mon_remembrance"],
          },
          {
            id: "mon_schatten",
            name: "Schatten-Integration",
            desc: "Transformation dunkler Impulse in karmische Energie und Mitgefühl.",
            icon: "yin_yang",
            cost: 250,
            req: ["mon_identity"],
          },
          {
            id: "mon_tao_tibet",
            name: "Tao-Tibetische Synthese",
            desc: "Nahtlose Verbindung von Qi Gong und Geistes-Klarheit.",
            icon: "sun",
            cost: 300,
            req: ["mon_qigong", "mon_anal_med"],
          },
        ],
      },
      meisterschaft: {
        label: "Die Meisterschaft",
        tierNumber: 4,
        skills: [
          {
            id: "mon_samsara",
            name: "Einsicht in Samsara",
            desc: "Ultimatives Mitgefühl für sich selbst und alle Lebewesen.",
            icon: "heart",
            cost: 500,
            req: ["mon_schatten"],
          },
          {
            id: "mon_shunyata",
            name: "Einsicht in Shunyata",
            desc: "Tiefer Frieden und radikale Gelassenheit (Leerheit).",
            icon: "lotus",
            cost: 600,
            req: ["mon_anal_med", "mon_tao_tibet"],
          },
          {
            id: "mon_bodhicitta",
            name: "Bodhicitta",
            desc: "Die erleuchtete Engine: Zustand extremen Friedens und extremer Vitalität.",
            icon: "sun",
            cost: 800,
            req: ["mon_samsara", "mon_shunyata"],
          },
        ],
      },
    },
  },

  // ═══════════════════════════════════════════════════════════
  // Path 4: Der Akrobat — Körper & Flow Arts → Yields Movement Points
  // ═══════════════════════════════════════════════════════════
  acrobat: {
    id: "acrobat",
    title: "Der Akrobat",
    subtitle: "Körper & Flow Arts",
    yield: "Bewegungspunkte",
    endgameGoal:
      "Extreme physical agility, flexibility, health from within, strong masculine appearance, and mastery of flow arts (Diabolo, juggling balls, fire tools) for resilience.",
    tiers: {
      basis: {
        label: "Die Basis",
        tierNumber: 1,
        skills: [
          {
            id: "acr_kardio",
            name: "Kardiovaskuläre Grundlast",
            desc: "Basis-Fitness und gesunde Ruheherzfrequenz.",
            icon: "heart",
            cost: 0,
            req: [],
          },
          {
            id: "acr_artistik",
            name: "Artistischer Funke",
            desc: "Hand-Auge-Koordination und Basis-Jonglage.",
            icon: "activity",
            cost: 50,
            req: ["acr_kardio"],
          },
        ],
      },
      schwelle: {
        label: "Die aktuelle Schwelle",
        tierNumber: 2,
        skills: [
          {
            id: "acr_laufen",
            name: "Der Lauf-Rhythmus",
            desc: "Wieder-Einstieg ins regelmäßige Laufen als Ausgleich.",
            icon: "zap",
            cost: 100,
            req: ["acr_kardio"],
          },
          {
            id: "acr_eisen",
            name: "Fundamentales Eisen",
            desc: "Kraftsport zum Aufbau einer starken Erscheinung und Gelenkschutz.",
            icon: "activity",
            cost: 120,
            req: ["acr_artistik"],
          },
          {
            id: "acr_diabolo",
            name: "Diabolo & Balls Progression",
            desc: "Bewusstes Erlernen komplexer Muster.",
            icon: "infinity",
            cost: 120,
            req: ["acr_artistik"],
          },
        ],
      },
      quantensprung: {
        label: "Die Transformation",
        tierNumber: 3,
        skills: [
          {
            id: "acr_mobility",
            name: "Movement & Mobility",
            desc: "Fließende Bewegung, Calisthenics (Nil Teisner Style).",
            icon: "activity",
            cost: 200,
            req: ["acr_laufen", "acr_eisen"],
          },
          {
            id: "acr_partner",
            name: "Partner-Akrobatik",
            desc: "Vertrauen, Balance und Hebelwirkungen meistern.",
            icon: "heart",
            cost: 250,
            req: ["acr_eisen"],
          },
          {
            id: "acr_crystal",
            name: "Crystal Flow & Fire Basics",
            desc: "Hypnotische Präzision und erster Umgang mit Feuer.",
            icon: "zap",
            cost: 250,
            req: ["acr_diabolo"],
          },
          {
            id: "acr_resilienz",
            name: "Die Resilienz-Batterie",
            desc: "Training als aktiver Energie- und Stressresistenz-Lieferant.",
            icon: "zap",
            cost: 200,
            req: ["acr_laufen", "acr_mobility"],
          },
        ],
      },
      meisterschaft: {
        label: "Die Meisterschaft",
        tierNumber: 4,
        skills: [
          {
            id: "acr_apex",
            name: "Apex Physicality",
            desc: "Der Körper als perfektes, agiles und kraftvolles Werkzeug.",
            icon: "activity",
            cost: 500,
            req: ["acr_mobility", "acr_resilienz"],
          },
          {
            id: "acr_flow_master",
            name: "Master of the Flow Arts",
            desc: "Absolute Meisterschaft über Diabolo, Bälle und Fire-Tools.",
            icon: "infinity",
            cost: 600,
            req: ["acr_crystal", "acr_diabolo"],
          },
          {
            id: "acr_geschmeidig",
            name: "Geschmeidige Kraft",
            desc: "Elegante, kraftvolle Bewegungen im Alltag und auf der Bühne.",
            icon: "yin_yang",
            cost: 800,
            req: ["acr_apex", "acr_flow_master"],
          },
        ],
      },
    },
  },

  // ═══════════════════════════════════════════════════════════
  // Path 5: Der Architekt — Environmental Design & Tech → Map Upgrades
  // ═══════════════════════════════════════════════════════════
  architect: {
    id: "architect",
    title: "Der Architekt",
    subtitle: "Environmental Design & Tech",
    yield: "Karten-Upgrades",
    endgameGoal:
      "Master of environments (physical, digital, temporal). Complete external cognition via Craft/Nextcloud/Dify to eliminate forgetfulness and achieve hyper-focus.",
    tiers: {
      basis: {
        label: "Die Basis",
        tierNumber: 1,
        skills: [
          {
            id: "arc_server",
            name: "Das Server-Fundament",
            desc: "Autarke Docker/Tailscale-Infrastruktur.",
            icon: "server",
            cost: 0,
            req: [],
          },
          {
            id: "arc_raum",
            name: "Räumliches Bewusstsein",
            desc: "Erkenntnis der Auswirkung von physischen Räumen auf den Flow.",
            icon: "map",
            cost: 50,
            req: ["arc_server"],
          },
        ],
      },
      schwelle: {
        label: "Die aktuelle Schwelle",
        tierNumber: 2,
        skills: [
          {
            id: "arc_craft",
            name: "Craft-Templating",
            desc: "Konsequenter Einsatz vorgefertigter Strukturen (Einstiegs-Schneepflug).",
            icon: "edit",
            cost: 100,
            req: ["arc_server"],
          },
          {
            id: "arc_kalender",
            name: "Die Kalender-Matrix",
            desc: "Aktives Time-Boxing statt Termin-Verwaltung.",
            icon: "sliders",
            cost: 120,
            req: ["arc_raum"],
          },
          {
            id: "arc_workspace",
            name: "Workspace Design",
            desc: "Physische Optimierung von Zimmer und Musik-Setup.",
            icon: "database",
            cost: 120,
            req: ["arc_raum"],
          },
        ],
      },
      quantensprung: {
        label: "Der Quantensprung",
        tierNumber: 3,
        skills: [
          {
            id: "arc_extern",
            name: "Externe Kognition (Anti-Verpeiltheit)",
            desc: "Alles aus dem Arbeitsgedächtnis ins System auslagern.",
            icon: "brain",
            cost: 200,
            req: ["arc_craft", "arc_kalender"],
          },
          {
            id: "arc_okr",
            name: "Ziel-Synthese (OKR)",
            desc: "Vage Wünsche in messbare Ziele/Meilensteine herunterbrechen.",
            icon: "crown",
            cost: 250,
            req: ["arc_kalender", "arc_workspace"],
          },
          {
            id: "arc_interdis",
            name: "Interdisziplinäres Design",
            desc: "UI/UX und Cover-Artworks entwerfen.",
            icon: "eye",
            cost: 250,
            req: ["arc_workspace"],
          },
        ],
      },
      meisterschaft: {
        label: "Die Meisterschaft",
        tierNumber: 4,
        skills: [
          {
            id: "arc_master_env",
            name: "Master of Environments",
            desc: "Umgebungen so designen, dass gute Gewohnheiten unausweichlich sind.",
            icon: "map",
            cost: 500,
            req: ["arc_extern", "arc_okr"],
          },
          {
            id: "arc_auto",
            name: "Automatisierte Orchestrierung",
            desc: "KI-Agenten bereiten autark den Arbeitstag vor.",
            icon: "server",
            cost: 600,
            req: ["arc_extern"],
          },
          {
            id: "arc_interface",
            name: "Das kristallklare Interface",
            desc: "Eine minimalistische Kommandozentrale ohne kognitive Überlastung.",
            icon: "database",
            cost: 800,
            req: ["arc_master_env", "arc_auto"],
          },
        ],
      },
    },
  },
};

// ─── Helper: Flatten all skills from the tree into an array ───────
export function flattenSkills() {
  const all = [];
  Object.values(SKILL_TREE_DATA).forEach((path) => {
    Object.values(path.tiers).forEach((tier) => {
      tier.skills.forEach((skill) => {
        all.push({
          id: skill.id,
          path: path.id,
          tier: tier.tierNumber,
          name: skill.name,
          desc: skill.desc,
          icon: skill.icon,
          cost: skill.cost,
          unlocked: false,
          req: skill.req,
          isCustom: false,
        });
      });
    });
  });

  // Backward-compat migration: for the existing skills.json unlocked states
  // These legacy IDs map to some of the new skills (or we simply keep defaults).
  // The migration of existing unlock states is handled in useGameState.
  return all;
}

// ─── Legacy mapping: old skills.json → new skill IDs ─────────────
// This preserves the unlocked state of the old skills when migrating.
export const LEGACY_SKILL_MAP = {
  arc_1: "arc_server",
  arc_2: "arc_extern",
  arc_3: "arc_craft",
  arc_4: "arc_auto",
  arc_5: "arc_master_env",
  soc_1: "soc_ethik_didaktik",
  soc_2: "soc_didaktische_alchemie",
  soc_3: "soc_germanistik",
  soc_4: "soc_deep_reading",
  soc_5: "soc_phil_leben",
  bar_1: "bar_daw_nav",
  bar_2: "bar_release_rythmus",
  bar_3: "bar_yolomeus",
  bar_4: "bar_yrrpheus",
  bar_5: "bar_mixing_master",
  mon_1: "mon_dharma",
  mon_2: "mon_qigong",
  mon_3: "mon_anal_med",
  mon_4: "mon_bodhicitta",
  acr_1: "acr_kardio",
  acr_2: "acr_diabolo",
  acr_3: "acr_laufen",
  acr_4: "acr_apex",
};

// ─── Tier labels for display ─────────────────────────────────────
export const TIER_LABELS = {
  1: "Die Basis",
  2: "Die aktuelle Schwelle",
  3: "Der Quantensprung",
  4: "Die Meisterschaft",
};

// ─── Tier color themes for borders/backgrounds ───────────────────
export const TIER_COLORS = {
  1: "border-slate-700 bg-slate-800/40",
  2: "border-amber-800/40 bg-amber-900/10",
  3: "border-purple-800/40 bg-purple-900/10",
  4: "border-yellow-600/40 bg-yellow-900/10",
};
```

### attacks.json
```json
[
  {
    "id": "att_1",
    "name": "Sokratischer Schlag",
    "desc": "Zertrümmere Illusionen durch reine Logik.",
    "cost": { "mana": 10, "gold": 0 },
    "dmg": 50,
    "type": "attack",
    "path": "socratic",
    "requiresSkill": null
  },
  {
    "id": "att_2",
    "name": "Refactoring-Sturm",
    "desc": "Löst technische Schulden auf.",
    "cost": { "mana": 5, "gold": 15 },
    "dmg": 60,
    "type": "attack",
    "path": "architect",
    "requiresSkill": null
  },
  {
    "id": "att_3",
    "name": "808-Donner",
    "desc": "Mächtiger Sub-Bass-Angriff.",
    "cost": { "mana": 20, "gold": 0 },
    "dmg": 80,
    "type": "attack",
    "path": "bard",
    "requiresSkill": null
  },
  {
    "id": "att_4",
    "name": "Fokus-Mantra",
    "desc": "Ein sanfter, aber durchdringender Strahl der Klarheit.",
    "cost": { "mana": 0, "gold": 25 },
    "dmg": 45,
    "type": "attack",
    "path": "monk",
    "requiresSkill": null
  },
  {
    "id": "att_5",
    "name": "Kinetische Entladung",
    "desc": "Explosiver Angriff aus der Bewegung.",
    "cost": { "mana": 15, "gold": 10 },
    "dmg": 70,
    "type": "attack",
    "path": "acrobat",
    "requiresSkill": null
  },
  {
    "id": "att_6",
    "name": "Tibetischer Schutzschild",
    "desc": "Errichte eine mentale Barriere. Blockt 40 Schaden für 3 Züge.",
    "cost": { "mana": 25, "gold": 0 },
    "dmg": 0,
    "shield": 40,
    "shieldDuration": 3,
    "type": "shield",
    "path": "monk",
    "requiresSkill": "mon_3"
  },
  {
    "id": "att_7",
    "name": "Qi Gong Heilung",
    "desc": "Stelle 30 Boss-HP wieder her... warte, heile dich selbst! Reduziere Boss-HP um 30.",
    "cost": { "mana": 30, "gold": 0 },
    "dmg": 30,
    "type": "attack",
    "path": "monk",
    "requiresSkill": "mon_2"
  },
  {
    "id": "att_8",
    "name": "Germanistik Kritischer Schlag",
    "desc": "Verwende akademisches Wissen für einen vernichtenden Kritischen Treffer! 2.5x Schaden.",
    "cost": { "mana": 0, "gold": 40 },
    "dmg": 120,
    "type": "crit",
    "path": "socratic",
    "requiresSkill": "soc_3"
  },
  {
    "id": "att_9",
    "name": "UADx Mastering Bass-Drop",
    "desc": "Ein frequenz-perfekter Bass-Drop. Ignoriert 50% der Rüstung.",
    "cost": { "mana": 35, "gold": 0 },
    "dmg": 100,
    "type": "attack",
    "path": "bard",
    "requiresSkill": "bar_5"
  },
  {
    "id": "att_10",
    "name": "Dify KI-Analyse",
    "desc": "Schwachstellen-Scan. nexter Angriff kostet 50% weniger.",
    "cost": { "mana": 15, "gold": 10 },
    "dmg": 35,
    "type": "attack",
    "path": "architect",
    "requiresSkill": "arc_4"
  },
  {
    "id": "att_11",
    "name": "Geist-Körper-Kombo",
    "desc": "Perfekte Symbiose. +60 DMG und +10 MP refundiert.",
    "cost": { "mana": 10, "gold": 10 },
    "dmg": 60,
    "refundMove": 10,
    "type": "attack",
    "path": "acrobat",
    "requiresSkill": "acr_4"
  },
  {
    "id": "att_12",
    "name": "Kavita Wissensschild",
    "desc": "Bibliothek des Wissens. Blockt 25 Schaden, reflektiert 15 DMG.",
    "cost": { "mana": 10, "gold": 20 },
    "dmg": 15,
    "shield": 25,
    "shieldDuration": 3,
    "reflect": 15,
    "type": "shield",
    "path": "architect",
    "requiresSkill": "arc_3"
  }
]
```

### bosses.json
```json
[
  {
    "id": "boss_1",
    "name": "Dämon der Prokrastination",
    "maxHp": 200,
    "type": "Mental",
    "color": "text-purple-400"
  },
  {
    "id": "boss_2",
    "name": "Die Hydra der unkorrigierten Klausuren",
    "maxHp": 300,
    "type": "Arbeit",
    "color": "text-red-400"
  },
  {
    "id": "boss_3",
    "name": "Technischer Schulden-Goliath",
    "maxHp": 250,
    "type": "System",
    "color": "text-blue-400"
  },
  {
    "id": "boss_4",
    "name": "Nebel der Lethargie",
    "maxHp": 150,
    "type": "Körper",
    "color": "text-gray-400"
  }
]```

### map.json
```json
{
  "tiles": [
    {
      "q": 0,
      "r": 0,
      "type": "nexus",
      "name": "Zentrum des Geistes",
      "discovered": true
    },
    {
      "q": 1,
      "r": 0,
      "type": "academy",
      "name": "Sokratische Akademie",
      "discovered": true
    },
    {
      "q": 0,
      "r": 1,
      "type": "monastery",
      "name": "Tempel der Stille",
      "discovered": true
    },
    { "q": -1, "r": 1, "type": "studio", "name": "Klanglabor", "discovered": false },
    { "q": -1, "r": 0, "type": "server", "name": "Docker Core", "discovered": false },
    { "q": 0, "r": -1, "type": "gym", "name": "Eisenhalle", "discovered": false },
    {
      "q": 1,
      "r": -1,
      "type": "wilds",
      "name": "Unbekanntes Gebiet",
      "discovered": false
    }
  ],
  "playerPosition": { "q": 0, "r": 0 }
}```

### quests.json
```json
[
  {
    "id": "q1",
    "name": "45 Min. Ableton (yrrpheus)",
    "xp": 40,
    "path": "bard"
  },
  {
    "id": "q2",
    "name": "Ethik-Stunde vorbereitet",
    "xp": 50,
    "path": "socratic"
  },
  {
    "id": "q3",
    "name": "20 Min. Qi Gong / Meditation",
    "xp": 30,
    "path": "monk"
  },
  {
    "id": "q4",
    "name": "Docker / Dify Server Wartung",
    "xp": 40,
    "path": "architect"
  },
  {
    "id": "q5",
    "name": "Jonglage / Flow Arts Session",
    "xp": 35,
    "path": "acrobat"
  },
  {
    "id": "q6",
    "name": "10 Seiten philosophischer Text gelesen",
    "xp": 25,
    "path": "socratic"
  },
  { 
    "id": "q7", 
    "name": "Gym / Laufen gewesen", 
    "xp": 60, 
    "path": "acrobat" 
  }
]```

### skills.json
```json
[
  {
    "id": "arc_1",
    "path": "architect",
    "name": "Docker Fundament",
    "cost": 0,
    "unlocked": true,
    "desc": "Basis-Setup des Headless Windows PC. Laufwerk D: ist bereit.",
    "icon": "server",
    "req": []
  },
  {
    "id": "arc_2",
    "path": "architect",
    "name": "Paperless OCR",
    "cost": 100,
    "unlocked": false,
    "desc": "Automatischer Nextcloud-Scan-Ordner zu Paperless-ngx läuft fehlerfrei.",
    "icon": "database",
    "req": ["arc_1"]
  },
  {
    "id": "arc_3",
    "path": "architect",
    "name": "Kavita Bibliothek",
    "cost": 150,
    "unlocked": false,
    "desc": "Calibre Auto-Export in Kavita (Port 5000) für PDFs und EPUBs.",
    "icon": "book",
    "req": ["arc_1"]
  },
  {
    "id": "arc_4",
    "path": "architect",
    "name": "Dify Mistral Pipeline",
    "cost": 300,
    "unlocked": false,
    "desc": "Lokaler KI-Agent mit Parent-Child Retrieval (1500 Tokens) über 80+ PDFs.",
    "icon": "brain",
    "req": ["arc_2", "arc_3"]
  },
  {
    "id": "arc_5",
    "path": "architect",
    "name": "Digitale Souveränität",
    "cost": 800,
    "unlocked": false,
    "desc": "Komplette OPDS-Kopplung an Yomu via Tailscale. Das Zweite Gehirn lebt.",
    "icon": "globe",
    "req": ["arc_4"]
  },
  {
    "id": "soc_1",
    "path": "socratic",
    "name": "Ethik Curriculum",
    "cost": 0,
    "unlocked": true,
    "desc": "Grundlegendes Verständnis der Lehrpläne.",
    "icon": "scroll",
    "req": []
  },
  {
    "id": "soc_2",
    "path": "socratic",
    "name": "Dify Unterrichtsplaner",
    "cost": 150,
    "unlocked": false,
    "desc": "Nutzung des 'Sokratischen Architekten' (System Prompt) für Stundenentwürfe.",
    "icon": "edit",
    "req": ["soc_1"]
  },
  {
    "id": "soc_3",
    "path": "socratic",
    "name": "Germanistik Zusatz",
    "cost": 200,
    "unlocked": false,
    "desc": "Erfolgreiche Bearbeitung eines Uni-Skripts für das Zusatzfach.",
    "icon": "pen",
    "req": ["soc_1"]
  },
  {
    "id": "soc_4",
    "path": "socratic",
    "name": "Kant & Konstruktivismus",
    "cost": 400,
    "unlocked": false,
    "desc": "Meisterhafte Integration komplexer Philosophie in zugänglichen Unterricht.",
    "icon": "eye",
    "req": ["soc_2"]
  },
  {
    "id": "soc_5",
    "path": "socratic",
    "name": "Pädagogische Exzellenz",
    "cost": 1000,
    "unlocked": false,
    "desc": "Vollständige Symbiose aus KI-Assistenz und humanistischem Lehramt.",
    "icon": "crown",
    "req": ["soc_3", "soc_4"]
  },
  {
    "id": "bar_1",
    "path": "bard",
    "name": "Ableton Live 12 Basis",
    "cost": 0,
    "unlocked": true,
    "desc": "Das digitale Studio auf dem Windows PC ist eingerichtet.",
    "icon": "music",
    "req": []
  },
  {
    "id": "bar_2",
    "path": "bard",
    "name": "Navidrome Streaming",
    "cost": 120,
    "unlocked": false,
    "desc": "Subsonic API an Amperfy. Eigene Tracks weltweit verfügbar.",
    "icon": "radio",
    "req": ["bar_1"]
  },
  {
    "id": "bar_3",
    "path": "bard",
    "name": "yolomeus: LoFi Groove",
    "cost": 250,
    "unlocked": false,
    "desc": "Meisterschaft über Ableton Drum Rack, Glue Compressor & Vinyl Distortion.",
    "icon": "headphones",
    "req": ["bar_1"]
  },
  {
    "id": "bar_4",
    "path": "bard",
    "name": "yrrpheus: Ambient Space",
    "cost": 250,
    "unlocked": false,
    "desc": "Meisterschaft über UADx Lexicon 224, Valhalla Supermassive & DeepMind 6.",
    "icon": "cloud",
    "req": ["bar_1"]
  },
  {
    "id": "bar_5",
    "path": "bard",
    "name": "UADx Mastering",
    "cost": 500,
    "unlocked": false,
    "desc": "Fairchild 670, Pultec EQP-1A und Ampex ATR-102 auf dem Master-Bus.",
    "icon": "sliders",
    "req": ["bar_3", "bar_4"]
  },
  {
    "id": "mon_1",
    "path": "monk",
    "name": "Zazen Basis",
    "cost": 0,
    "unlocked": true,
    "desc": "Die Fähigkeit, in der Stille zu sitzen.",
    "icon": "lotus",
    "req": []
  },
  {
    "id": "mon_2",
    "path": "monk",
    "name": "Qi Gong Routinen",
    "cost": 100,
    "unlocked": false,
    "desc": "Tägliche Praxis zur Lenkung des Energieflusses.",
    "icon": "wind",
    "req": ["mon_1"]
  },
  {
    "id": "mon_3",
    "path": "monk",
    "name": "Tibetische Visualisierung",
    "cost": 300,
    "unlocked": false,
    "desc": "Komplexe geistige Konstruktionen aufbauen und halten.",
    "icon": "sun",
    "req": ["mon_2"]
  },
  {
    "id": "mon_4",
    "path": "monk",
    "name": "Bewusste Lebensführung",
    "cost": 600,
    "unlocked": false,
    "desc": "Integration buddhistischer Prinzipien in den stressigen Schulalltag.",
    "icon": "yin_yang",
    "req": ["mon_3"]
  },
  {
    "id": "acr_1",
    "path": "acrobat",
    "name": "Körperliches Fundament",
    "cost": 0,
    "unlocked": true,
    "desc": "Gesunde Ernährung und Huawei Watch GT4 Tracking aktiv.",
    "icon": "heart",
    "req": []
  },
  {
    "id": "acr_2",
    "path": "acrobat",
    "name": "Flow Arts & Jonglage",
    "cost": 150,
    "unlocked": false,
    "desc": "3-Ball Kaskade und Grundformen der Flow Arts gemeistert.",
    "icon": "activity",
    "req": ["acr_1"]
  },
  {
    "id": "acr_3",
    "path": "acrobat",
    "name": "Gym & Laufen",
    "cost": 200,
    "unlocked": false,
    "desc": "Regelmäßige physische Belastung zur Stressresistenz.",
    "icon": "zap",
    "req": ["acr_1"]
  },
  {
    "id": "acr_4",
    "path": "acrobat",
    "name": "Geist-Körper-Symbiose",
    "cost": 500,
    "unlocked": false,
    "desc": "Die Erkenntnis, dass physischer Flow und mentaler Flow (Coding/Musik) eins sind.",
    "icon": "infinity",
    "req": ["acr_2", "acr_3"]
  }
]```

## 📄 Haupt-Dateien

### main.jsx
```jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)```

### App.jsx
```jsx
import React, { useState } from "react";
import { useGameState } from "./hooks/useGameState";
import Layout from "./components/Layout";
import SkillTree from "./components/SkillTree";
import Quests from "./components/Quests";
import BattleArena from "./components/BattleArena";
import WorldMap from "./components/WorldMap";
import DevToolsPanel from "./components/DevToolsPanel";
import ActivityLogView from "./components/ActivityLogView";

export default function App() {
  const {
    gameState,
    handleQuestComplete,
    executeAttack,
    unlockSkill,
    uncoverTile,
    clearDamageEvent,
    getAvailableActions,
    getPoiInfo,
    addCustomSkill,
    addCustomQuest,
    deleteCustomQuest,
    claimTat,
    skillTreeData,
    toast,
    devResetAll,
    devSetLevel,
    devSetResources,
    devAddXp,
    devUnlockAllSkills,
    devRevealAllTiles,
    devDefeatBoss,
    gameLocked,
    devMode,
    toggleDevMode,
    defeatMapBoss,
  } = useGameState();

  const [activeTab, setActiveTab] = useState("tree");
  const [showLog, setShowLog] = useState(false);

  return (
    <>
      <Layout
        gameState={gameState}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        devMode={devMode}
        onToggleDevMode={toggleDevMode}
        onOpenLog={() => setShowLog(true)}
        gameLocked={gameLocked}
      >
        {gameLocked && !devMode ? (
          /* ═══ LOCKED OVERLAY ═══ */
          <div className="h-full flex flex-col items-center justify-center gap-4 text-center">
            <div className="text-6xl">🔒</div>
            <h2 className="text-2xl font-bold text-red-400">Spiel Gesperrt</h2>
            <p className="text-sm text-slate-400 max-w-sm">
              Das Spiel ist bis zum Startdatum gesperrt. Nutze den Dev-Mode zum Testen.
            </p>
          </div>
        ) : (
          <>
            {activeTab === "tree" && (
              <SkillTree
                gameState={gameState}
                unlockSkill={unlockSkill}
                addCustomSkill={addCustomSkill}
                skillTreeData={skillTreeData}
              />
            )}
            {activeTab === "quests" && (
              <Quests
                handleQuestComplete={handleQuestComplete}
                gameState={gameState}
                claimTat={claimTat}
                addCustomQuest={addCustomQuest}
                deleteCustomQuest={deleteCustomQuest}
              />
            )}
            {activeTab === "battle" && (
              <BattleArena
                gameState={gameState}
                executeAttack={executeAttack}
                getAvailableActions={getAvailableActions}
                clearDamageEvent={clearDamageEvent}
              />
            )}
            {activeTab === "map" && (
              <WorldMap
                gameState={gameState}
                uncoverTile={uncoverTile}
                getPoiInfo={getPoiInfo}
                defeatMapBoss={defeatMapBoss}
              />
            )}
          </>
        )}
      </Layout>

      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-20 md:bottom-8 left-1/2 -translate-x-1/2 px-4 md:px-6 py-2 md:py-3 rounded-full font-bold shadow-2xl z-50 text-sm md:text-base whitespace-nowrap transition-all duration-300 ${
            toast.type === "error"
              ? "bg-red-600 text-white"
              : toast.type === "success"
              ? "bg-emerald-500 text-slate-950"
              : "bg-indigo-600 text-white"
          }`}
        >
          {toast.msg}
        </div>
      )}

      {/* Dev Tools Panel */}
      {devMode && (
        <DevToolsPanel
          gameState={gameState}
          devResetAll={devResetAll}
          devSetLevel={devSetLevel}
          devSetResources={devSetResources}
          devAddXp={devAddXp}
          devUnlockAllSkills={devUnlockAllSkills}
          devRevealAllTiles={devRevealAllTiles}
          devDefeatBoss={devDefeatBoss}
        />
      )}

      {/* Activity Log View */}
      {showLog && (
        <ActivityLogView
          gameState={gameState}
          onClose={() => setShowLog(false)}
        />
      )}
    </>
  );
}
```

### index.css
```css
@import "tailwindcss";

@theme {
  --color-slate-950: #020617;
}

@layer components {
  .custom-scrollbar::-webkit-scrollbar {
    height: 8px;
    width: 8px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: rgba(15, 23, 42, 1);
    border-radius: 4px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(51, 65, 85, 1);
    border-radius: 4px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: rgba(71, 85, 105, 1);
  }

  /* Combat Animations */
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-6px); }
    20%, 40%, 60%, 80% { transform: translateX(6px); }
  }
  .animate-shake {
    animation: shake 0.5s ease-in-out;
  }

  @keyframes flash-red {
    0%, 100% { filter: brightness(1); }
    50% { filter: brightness(2.5) saturate(0) hue-rotate(320deg); }
  }
  .animate-flash-hit {
    animation: flash-red 0.35s ease-out;
  }

  @keyframes float-up {
    0% { opacity: 1; transform: translateY(0) scale(1); }
    100% { opacity: 0; transform: translateY(-60px) scale(1.3); }
  }
  .animate-float-dmg {
    animation: float-up 1s ease-out forwards;
  }

  @keyframes heal-pulse {
    0%, 100% { filter: brightness(1); }
    50% { filter: brightness(1.8) hue-rotate(80deg); }
  }
  .animate-heal-pulse {
    animation: heal-pulse 0.5s ease-out;
  }

  @keyframes shield-glow {
    0% { box-shadow: 0 0 0 0 rgba(96, 165, 250, 0.6); }
    100% { box-shadow: 0 0 30px 15px rgba(96, 165, 250, 0); }
  }
  .animate-shield-glow {
    animation: shield-glow 0.6s ease-out;
  }

  @keyframes crit-flash {
    0%, 100% { filter: brightness(1); }
    25% { filter: brightness(3) saturate(0); }
    50% { filter: brightness(1.5) hue-rotate(40deg); }
  }
  .animate-crit-flash {
    animation: crit-flash 0.6s ease-out;
  }

  @keyframes tile-reveal {
    0% { opacity: 0; transform: scale(0.5) rotate(180deg); }
    100% { opacity: 1; transform: scale(1) rotate(0deg); }
  }
  .animate-tile-reveal {
    animation: tile-reveal 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  }

  /* Scroll-style quest card */
  @keyframes scroll-glow {
    0%, 100% { box-shadow: 0 0 8px rgba(217, 119, 6, 0.15); }
    50% { box-shadow: 0 0 20px rgba(217, 119, 6, 0.35); }
  }
  .animate-scroll-glow {
    animation: scroll-glow 3s ease-in-out infinite;
  }

  /* Guild bounty card completion animation */
  @keyframes bounty-complete {
    0% { transform: scale(1); }
    30% { transform: scale(1.05); }
    60% { transform: scale(0.98); }
    100% { transform: scale(1); }
  }
  .animate-bounty-complete {
    animation: bounty-complete 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  /* Subtle idle glow for guild bounty cards */
  @keyframes card-idle-glow {
    0%, 100% { box-shadow: 0 0 10px rgba(245, 158, 11, 0.08); }
    50% { box-shadow: 0 0 25px rgba(245, 158, 11, 0.18); }
  }
  .animate-card-glow {
    animation: card-idle-glow 4s ease-in-out infinite;
  }
}
```

## 📋 README

🌌 Tim's Second Brain & RPG: Architektur für Gleichzeitiges Aufblühen
Ein radikal elastisches Lebens-Betriebssystem, das digitale Souveränität, pädagogische Exzellenz, künstlerische Tiefe und persönliche Entwicklung vereint. Es ist mehr als ein Werkzeug – es ist das Framework für Intelligence Augmentation, gestaltet für Fokus, Klarheit und tiefgreifendes Wachstum.

📜 1. Die System-Philosophie (Der innere Antrieb)
Dieses System existiert nicht zum stumpfen Abarbeiten von To-dos. Es ist die Antwort auf das Paradoxon, alles zugleich zu wollen, ohne an den eigenen Ansprüchen auszubrennen.

Gleichzeitiges Aufblühen: Das absolute Kernziel. Echtes Wachstum passiert parallel auf kognitiven, physischen und kreativen Ebenen. Das System visualisiert und fördert diesen holistischen Fortschritt.

Exzellenz statt Mittelmaß: Ein Werkzeug für Wirksamkeit und Tiefe in allen Identitäten (Lehrer, Musiker, Buddhist, Partner). Keine Kompromisse mehr bei der Qualität des eigenen Denkens und Handelns.

Die vier Lebensformer: Das Design des Systems zielt permanent darauf ab, den Willen zu stärken, Zeit bewusst zu designieren, Ressourcen zu vergrößern und den Fokus messerscharf zu trainieren.

Schutz vor Überforderung: Durch mentale Vorbereitung und radikale Klarheit fungiert das System als Schutzschild gegen den Schmerz des "Nicht-Habens" und kognitive Überlastung.

🖋️ 2. Architektur des Geistes (Craft & Design)
Das Frontend und die Struktur – primär abgebildet in Craft und der React-RPG-App – folgen strengen ästhetischen und strukturellen Prinzipien:

Radikale Elastizität: Die Struktur ist niemals starr. Sie atmet mit und passt sich dynamisch an neue Lebensphasen, veränderte Herausforderungen und schwankende Energielevel an.

Mentale Vorbereitung als Hebel: Das System erzwingt Phasen der gedanklichen Kalibrierung. Bevor gehandelt wird, wird der Geist ausgerichtet, was die physische Umsetzung drastisch erleichtert.

Ästhetik & Klarheit: Visuell ansprechend, minimalistisch und intuitiv. Überladene Textwüsten werden eliminiert, um Raum für echtes Lesen, tiefes Schreiben und strategische Projektentwicklung zu schaffen.

🤖 3. Das KI-Paradigma (Intelligence Augmentation)
Künstliche Intelligenz ist hier kein Chatbot, sondern ein simuliertes Entwickler- und Beraterteam, das auf dem eigenen Server lebt.

Gegenseitige KI-Verfeinerung: Agenten arbeiten nicht isoliert. Ein System aus sich gegenseitig verbessernden und hinterfragenden KIs hebt erste Ideen iterativ auf ein Genialitäts-Level.

KI als "Einstiegs-Schneepflug": Die KI räumt den Weg frei. Sie baut im Vorfeld perfekte Strukturen (Templates, Unterrichts-Gliederungen, Projektpläne), um den kognitiven Widerstand beim Start einer Aufgabe massiv zu senken.

Digitale Souveränität: Das Fundament bleibt autark und lokal. Durch strategische API-Nutzung (z.B. OpenRouter) wird dieses Fundament jedoch global skaliert.

🗺️ 4. Die 5 Pfade (Gamification & Heroes of Might and Magic)
Um den abstrakten Fortschritt spürbar zu machen, übersetzt eine maßgeschneiderte React-App den Alltag in eine "Heroes of Might and Magic"-ähnliche Erfahrung. Reale Disziplin ist der Treibstoff (Movement Points, Gold, Mana) für die Erkundung der World-Map auf dem iPad.

Der Sokratiker (Lehre & Philosophie): Viel lesen, tief schreiben. Vorbereitung des Ethik- und Germanistik-Unterrichts durch Kant, Konstruktivismus und den Sokratischen Architekten. (Generiert Gold/Wissen)

Der Barde (Musik & Sounddesign): Flow-Zustände in Ableton Live 12. Die Evolution von yrrpheus (Ambient) und yolomeus (LoFi). (Generiert Mana/Kreativität)

Der Mönch (Geist & Fokus): Zazen, Qi Gong, Atemübungen und tibetische Visualisierungen zur Lenkung der eigenen Energie. (Generiert Mana/Resilienz)

Der Akrobat (Körper & Flow): Physische Belastung (Gym, Laufen) und das Meistern der Flow Arts (Jonglage) als geistig-körperliche Symbiose. (Generiert Movement Points)

Der Architekt (Struktur & Tech): Der Baumeister des Systems. Weiterentwicklung der Server-Infrastruktur, Craft-Workflows und KI-Agenten. (Ermöglicht Map-Upgrades)

⚙️ 5. Workflow, Zeit-Management & Zwingende Revision
Skalierbares Commitment: Gestartet wird mit kleinen, extrem machbaren Gewohnheiten. Sobald der Profit (kognitiv oder zeitlich) spürbar wird, skaliert das zeitliche Investment in das System.

Zwingende Revision: Wissen und Strukturen verrotten ohne Pflege. Das System beinhaltet eingebaute Feedback-Schleifen, aktives Abfragen von Wissen (Spaced Repetition) und regelmäßige Meta-Prüfungen der Workflows selbst.

Der unsichtbare Motor: Ein Headless Windows 10 PC (Docker) fungiert im Hintergrund als Arbeitstier für Dify, Paperless-ngx, Kavita und Navidrome. Die Interaktion findet nahtlos, sicher und hochästhetisch über das iPad Pro (via Tailscale) statt.

"Ich bin bewusst und frei. Dieses System ist das Werkzeug, mit dem ich meine Träume realisiere und mein Leben proaktiv gestalte."
