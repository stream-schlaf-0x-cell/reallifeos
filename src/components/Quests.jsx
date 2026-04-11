import React, { useState } from "react";
import Icon from "./Icon";
import PRESET_QUESTS from "../data/quests.json";
import { PATH_COLORS } from "../data/constants";
import { getResourceRewards } from "../hooks/useGameState";

const CRAFT_URL = "https://s.craft.me/09MPu0hzH12B7A";

// ─── Path definitions for the claim board ─────────────────────────
const CLAIM_PATHS = [
  {
    id: "socratic",
    title: "Der Sokratiker",
    taskLabel: "Ethik / Schule",
    icon: "scroll",
    gradient: "from-amber-900 to-amber-600",
    border: "border-amber-500/60",
    text: "text-amber-400",
    bg: "bg-amber-900/20",
    hoverBorder: "hover:border-amber-400 hover:shadow-[0_0_20px_rgba(245,158,11,0.15)]",
    rewards: { label: "Gold", icon: "gold" },
  },
  {
    id: "bard",
    title: "Der Barde",
    taskLabel: "Ableton / Musik",
    icon: "music",
    gradient: "from-purple-900 to-purple-600",
    border: "border-purple-500/60",
    text: "text-purple-400",
    bg: "bg-purple-900/20",
    hoverBorder: "hover:border-purple-400 hover:shadow-[0_0_20px_rgba(168,85,247,0.15)]",
    rewards: { label: "Mana", icon: "mana" },
  },
  {
    id: "monk",
    title: "Der Mönch",
    taskLabel: "Zazen / Qi Gong",
    icon: "lotus",
    gradient: "from-emerald-900 to-emerald-600",
    border: "border-emerald-500/60",
    text: "text-emerald-400",
    bg: "bg-emerald-900/20",
    hoverBorder: "hover:border-emerald-400 hover:shadow-[0_0_20px_rgba(16,185,129,0.15)]",
    rewards: { label: "Mana", icon: "mana" },
  },
  {
    id: "acrobat",
    title: "Der Akrobat",
    taskLabel: "Gym / Flow Arts",
    icon: "activity",
    gradient: "from-red-900 to-red-600",
    border: "border-red-500/60",
    text: "text-red-400",
    bg: "bg-red-900/20",
    hoverBorder: "hover:border-red-400 hover:shadow-[0_0_20px_rgba(239,68,68,0.15)]",
    rewards: { label: "MP", icon: "move" },
  },
  {
    id: "architect",
    title: "Der Architekt",
    taskLabel: "Tech / System",
    icon: "server",
    gradient: "from-blue-900 to-blue-600",
    border: "border-blue-500/60",
    text: "text-blue-400",
    bg: "bg-blue-900/20",
    hoverBorder: "hover:border-blue-400 hover:shadow-[0_0_20px_rgba(59,130,246,0.15)]",
    rewards: { label: "MP", icon: "move" },
  },
];

// ─── Parchment Quest Card ─────────────────────────────────────────
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

const QuestCard = ({ quest, onComplete, poiBonuses }) => {
  const rewards = getResourceRewards(quest.path);
  const totalMove = rewards.move + (poiBonuses?.moveRegen || 0);
  const totalGold = rewards.gold + (poiBonuses?.goldRegen || 0);
  const totalMana = rewards.mana + (poiBonuses?.manaRegen || 0);

  return (
    <button
      onClick={() => onComplete(quest)}
      className="group relative flex flex-col min-h-[140px] text-left transition-all active:scale-[0.97] duration-200"
    >
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-amber-950/80 via-slate-900/90 to-slate-900/95 border-2 border-amber-800/30 group-hover:border-amber-600/60 transition-colors overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-700/40 via-amber-500/60 to-amber-700/40"></div>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-700/40 via-amber-500/60 to-amber-700/40"></div>
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-amber-700/40 via-amber-500/60 to-amber-700/40"></div>
        <div className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b from-amber-700/40 via-amber-500/60 to-amber-700/40"></div>
        <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-b from-amber-900/20 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 h-3 bg-gradient-to-t from-amber-900/20 to-transparent"></div>
      </div>
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-15 transition-opacity rounded-2xl bg-gradient-to-r ${PATH_COLORS[quest.path]}`}></div>
      <div className="relative z-10 flex flex-col justify-between flex-1 p-4 md:p-5">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-lg">{PATH_EMOJI[quest.path]}</span>
            <span
              className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border bg-slate-900/60 ${
                quest.path === "architect"
                  ? "text-blue-400 border-blue-800/50"
                  : quest.path === "socratic"
                  ? "text-amber-400 border-amber-800/50"
                  : quest.path === "bard"
                  ? "text-purple-400 border-purple-800/50"
                  : quest.path === "monk"
                  ? "text-emerald-400 border-emerald-800/50"
                  : "text-red-400 border-red-800/50"
              }`}
            >
              {PATH_LABELS[quest.path]}
            </span>
          </div>
          <div className="flex items-center gap-1 bg-indigo-900/50 border border-indigo-700/50 rounded-full px-2 py-0.5">
            <Icon name="zap" className="w-3 h-3 text-indigo-400" />
            <span className="text-xs font-mono font-bold text-indigo-300">
              +{quest.xp} XP
            </span>
          </div>
        </div>
        <p className="font-bold text-sm md:text-base text-slate-100 mb-3 leading-snug">
          {quest.name}
        </p>
        <div className="flex flex-wrap gap-2 pt-3 border-t border-amber-800/20">
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
      </div>
    </button>
  );
};

// ═══════════════════════════════════════════════════════════════
//  Main Quests Component
// ═══════════════════════════════════════════════════════════════
const Quests = ({ handleQuestComplete, gameState, claimTat }) => {
  const poiBonuses = gameState?.poiBonuses || { manaRegen: 0, goldRegen: 0, moveRegen: 0 };
  const [claimedNow, setClaimedNow] = useState(null);

  const handleClaim = (pathId) => {
    claimTat(pathId);
    setClaimedNow(pathId);
    setTimeout(() => setClaimedNow(null), 600);
  };

  return (
    <div className="h-full overflow-y-auto pb-20 custom-scrollbar pr-2 md:pr-4">

      {/* ═══ Header ═══ */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">📜</span>
          <div>
            <h2 className="text-lg md:text-xl font-bold text-amber-400">
              Taten & Pflichten
            </h2>
            <p className="text-[10px] md:text-xs text-slate-500">
              Craft-Aufgaben erledigen → Ressourcen beanspruchen
            </p>
          </div>
        </div>
      </div>

      {/* ═══ Craft Link Card (replaces broken iframe) ═══ */}
      <div className="mb-5 p-4 md:p-5 rounded-2xl border-2 border-slate-700/50 bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-950 shadow-lg">
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

      {/* ═══ Buch der Taten: Honor System Claim Board ═══ */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Icon name="pen" className="w-4 h-4 text-amber-500" />
          <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider">
            Buch der Taten
          </h3>
          <div className="flex-1 h-px bg-gradient-to-r from-amber-800/40 to-transparent"></div>
        </div>
        <p className="text-[11px] text-slate-500 mb-3 italic">
          Aufgabe in Craft erledigt? Hier eintragen — auf Ehrenwort.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 md:gap-3">
          {CLAIM_PATHS.map((cp) => {
            const isFlashing = claimedNow === cp.id;
            return (
              <button
                key={cp.id}
                onClick={() => handleClaim(cp.id)}
                className={`group relative flex flex-col items-center gap-1.5 p-3 md:p-4 rounded-xl border-2 ${cp.border} ${cp.bg} ${cp.hoverBorder} transition-all duration-300 active:scale-95 ${
                  isFlashing ? "scale-105 brightness-125" : ""
                }`}
              >
                {isFlashing && (
                  <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${cp.gradient} opacity-40 animate-pulse`}></div>
                )}
                <div className={`relative p-2 rounded-lg bg-gradient-to-br ${cp.gradient}`}>
                  <Icon name={cp.icon} className="w-5 h-5 text-white" />
                </div>
                <span className={`relative text-xs font-bold ${cp.text} leading-tight text-center`}>
                  {cp.taskLabel}
                </span>
                <div className="relative flex items-center gap-1">
                  <Icon name={cp.rewards.icon} className="w-3 h-3 text-slate-400" />
                  <span className="text-[10px] font-mono text-slate-400">
                    +{cp.rewards.label}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ═══ Classic Quest Board ═══ */}
      <div className="mb-3">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">📋</span>
          <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider">
            Schwarzes Brett
          </h3>
          <div className="flex-1 h-px bg-gradient-to-r from-amber-800/40 to-transparent"></div>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
        {PRESET_QUESTS.map((quest) => (
          <QuestCard
            key={quest.id}
            quest={quest}
            onComplete={handleQuestComplete}
            poiBonuses={poiBonuses}
          />
        ))}
      </div>
    </div>
  );
};

export default Quests;
