import React, { useState } from "react";
import Icon from "./Icon";
import PRESET_QUESTS from "../data/quests.json";
import { PATH_COLORS } from "../data/constants";
import { getResourceRewards } from "../hooks/useGameState";

const CRAFT_URL = "https://s.craft.me/09MPu0hzH12B7A";

// ═══════════════════════════════════════════════════════════════
//  Gilden-Aufträge: Gleichzeitiges Aufblühen
//  The 5 Core Guild Bounties — honor-system, session-tracked
// ═══════════════════════════════════════════════════════════════
const GUILD_BOUNTIES = [
  {
    id: "socratic",
    title: "Die Sokratische Schmiede",
    description:
      "30 Min Kavita-Textarbeit oder KI-gestützte Unterrichtsplanung.",
    icon: "scroll",
    pathLabel: "Sokratiker",
    pathEmoji: "📜",
    rewardText: "+50 Gold",
    rewardDetail: { icon: "gold", amount: 50, label: "Gold" },
    gradient: "from-amber-900/80 via-amber-950/90 to-slate-950/95",
    border: "border-amber-500/40",
    borderHover: "hover:border-amber-400/80",
    accentText: "text-amber-400",
    accentBg: "bg-amber-500",
    accentGlow: "rgba(245,158,11,0.25)",
    btnGradient: "from-amber-600 to-amber-500",
    btnHover: "hover:from-amber-500 hover:to-amber-400",
    btnText: "text-slate-950",
    completedBorder: "border-emerald-500/50",
    completedBg: "bg-emerald-900/10",
  },
  {
    id: "bard",
    title: "Kanalisierung des Flows",
    description: "45 Min Ableton Live Session für yrrpheus/yolomeus.",
    icon: "music",
    pathLabel: "Barde",
    pathEmoji: "🎵",
    rewardText: "+40 Mana",
    rewardDetail: { icon: "mana", amount: 40, label: "Mana" },
    gradient: "from-purple-900/80 via-purple-950/90 to-slate-950/95",
    border: "border-purple-500/40",
    borderHover: "hover:border-purple-400/80",
    accentText: "text-purple-400",
    accentBg: "bg-purple-500",
    accentGlow: "rgba(168,85,247,0.25)",
    btnGradient: "from-purple-600 to-purple-500",
    btnHover: "hover:from-purple-500 hover:to-purple-400",
    btnText: "text-white",
    completedBorder: "border-emerald-500/50",
    completedBg: "bg-emerald-900/10",
  },
  {
    id: "monk",
    title: "Innere Ausrichtung",
    description:
      "20 Min Zazen, Qi Gong oder Visualisierung zur mentalen Vorbereitung.",
    icon: "lotus",
    pathLabel: "Mönch",
    pathEmoji: "🧘",
    rewardText: "+50 Mana",
    rewardDetail: { icon: "mana", amount: 50, label: "Mana" },
    gradient: "from-emerald-900/80 via-emerald-950/90 to-slate-950/95",
    border: "border-emerald-500/40",
    borderHover: "hover:border-emerald-400/80",
    accentText: "text-emerald-400",
    accentBg: "bg-emerald-500",
    accentGlow: "rgba(16,185,129,0.25)",
    btnGradient: "from-emerald-600 to-emerald-500",
    btnHover: "hover:from-emerald-500 hover:to-emerald-400",
    btnText: "text-slate-950",
    completedBorder: "border-emerald-500/50",
    completedBg: "bg-emerald-900/10",
  },
  {
    id: "acrobat",
    title: "Physische Resilienz",
    description: "Gym, Laufen oder Flow Arts/Jonglage.",
    icon: "activity",
    pathLabel: "Akrobat",
    pathEmoji: "🤸",
    rewardText: "+30 Bewegungspunkte",
    rewardDetail: { icon: "move", amount: 30, label: "MP" },
    gradient: "from-red-900/80 via-red-950/90 to-slate-950/95",
    border: "border-red-500/40",
    borderHover: "hover:border-red-400/80",
    accentText: "text-red-400",
    accentBg: "bg-red-500",
    accentGlow: "rgba(239,68,68,0.25)",
    btnGradient: "from-red-600 to-red-500",
    btnHover: "hover:from-red-500 hover:to-red-400",
    btnText: "text-white",
    completedBorder: "border-emerald-500/50",
    completedBg: "bg-emerald-900/10",
  },
  {
    id: "architect",
    title: "Wartung des Motors",
    description:
      "System-Revision in Craft, Dify-Optimierung oder Inbox Zero.",
    icon: "server",
    pathLabel: "Architekt",
    pathEmoji: "🏗️",
    rewardText: "+20 Bewegungspunkte",
    rewardDetail: { icon: "move", amount: 20, label: "MP" },
    gradient: "from-blue-900/80 via-blue-950/90 to-slate-950/95",
    border: "border-blue-500/40",
    borderHover: "hover:border-blue-400/80",
    accentText: "text-blue-400",
    accentBg: "bg-blue-500",
    accentGlow: "rgba(59,130,246,0.25)",
    btnGradient: "from-blue-600 to-blue-500",
    btnHover: "hover:from-blue-500 hover:to-blue-400",
    btnText: "text-white",
    completedBorder: "border-emerald-500/50",
    completedBg: "bg-emerald-900/10",
  },
];

// ─── Path definitions for the quick-claim board ─────────────────────────
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
//  Guild Bounty Card — premium glowing datapad aesthetic
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
      {/* Animated top accent line */}
      <div
        className={`absolute top-0 left-0 right-0 h-0.5 transition-opacity duration-500 ${
          isCompleted ? "bg-emerald-500/60" : `bg-gradient-to-r ${bounty.btnGradient}`
        }`}
      ></div>

      {/* Card body */}
      <div className={`relative flex flex-col p-4 md:p-5 bg-gradient-to-br ${bounty.gradient}`}>
        {/* Header: emoji + path badge */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br ${bounty.btnGradient} shadow-lg transition-transform duration-300 ${
                isCompleted ? "scale-90" : isHovered ? "scale-105" : ""
              }`}
            >
              <Icon name={isCompleted ? "check" : bounty.icon} className="w-5 h-5 text-white" />
            </div>
            <div>
              <span
                className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border bg-slate-900/60 ${bounty.accentText} ${
                  isCompleted ? "border-emerald-700/50 text-emerald-400" : ""
                }`}
              >
                {isCompleted ? "Vollbracht" : bounty.pathLabel}
              </span>
            </div>
          </div>
        </div>

        {/* Title */}
        <h4
          className={`text-base md:text-lg font-bold mb-1.5 leading-tight transition-colors duration-300 ${
            isCompleted ? "text-emerald-300/80 line-through decoration-emerald-500/50" : "text-slate-100"
          }`}
        >
          {bounty.title}
        </h4>

        {/* Description */}
        <p
          className={`text-xs md:text-sm leading-relaxed mb-4 transition-colors duration-300 ${
            isCompleted ? "text-slate-500" : "text-slate-400"
          }`}
        >
          {bounty.description}
        </p>

        {/* Reward pill */}
        <div className="flex items-center gap-1.5 mb-4">
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${
            isCompleted
              ? "bg-emerald-900/30 border-emerald-700/40"
              : `bg-slate-900/60 border-slate-700/40`
          }`}>
            <Icon
              name={bounty.rewardDetail.icon}
              className={`w-3.5 h-3.5 ${isCompleted ? "text-emerald-400" : bounty.accentText}`}
            />
            <span className={`text-xs font-mono font-bold ${
              isCompleted ? "text-emerald-300" : bounty.accentText
            }`}>
              {bounty.rewardText}
            </span>
          </div>
        </div>

        {/* Spacer pushes button to bottom */}
        <div className="flex-1"></div>

        {/* Claim / Completed button */}
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
const Quests = ({ handleQuestComplete, gameState, claimTat }) => {
  const poiBonuses = gameState?.poiBonuses || { manaRegen: 0, goldRegen: 0, moveRegen: 0 };
  const [claimedNow, setClaimedNow] = useState(null);
  // Session-level completion tracking for Guild Bounties
  const [completedBounties, setCompletedBounties] = useState({});

  const handleClaim = (pathId) => {
    claimTat(pathId);
    setClaimedNow(pathId);
    // Mark bounty as completed for this session
    setCompletedBounties((prev) => ({ ...prev, [pathId]: true }));
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

      {/* ═══════════════════════════════════════════════════════
          Gilden-Aufträge: Gleichzeitiges Aufblühen
          Premium Guild Bounty Cards — session-tracked
         ═══════════════════════════════════════════════════════ */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xl">⚔️</span>
          <h3 className="text-base md:text-lg font-bold text-amber-400 uppercase tracking-wider">
            Gilden-Aufträge
          </h3>
          <div className="flex-1 h-px bg-gradient-to-r from-amber-800/40 to-transparent"></div>
        </div>
        <p className="text-xs text-slate-500 mb-1 italic font-medium">
          Gleichzeitiges Aufblühen — Die fünf Pfade zur Meisterschaft
        </p>
        <p className="text-[11px] text-slate-600 mb-4">
          Erledige die Aufgabe in Craft, dann hier auf Ehrenwort eintragen. Belohnung wird sofort gutgeschrieben.
        </p>

        {/* Responsive grid: 1 col mobile → 2 col tablet → 3 col desktop → 5 col wide */}
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

      {/* ═══ Buch der Taten: Honor System Quick-Claim Board ═══ */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Icon name="pen" className="w-4 h-4 text-amber-500" />
          <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider">
            Schnell-Eintragung
          </h3>
          <div className="flex-1 h-px bg-gradient-to-r from-amber-800/40 to-transparent"></div>
        </div>
        <p className="text-[11px] text-slate-500 mb-3 italic">
          Aufgabe erledigt? Schnell eintragen — auf Ehrenwort.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 md:gap-3">
          {CLAIM_PATHS.map((cp) => {
            const isFlashing = claimedNow === cp.id;
            const isCompleted = completedBounties[cp.id];
            return (
              <button
                key={cp.id}
                onClick={() => !isCompleted && handleClaim(cp.id)}
                disabled={isCompleted}
                className={`group relative flex flex-col items-center gap-1.5 p-3 md:p-4 rounded-xl border-2 transition-all duration-300 ${
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
                    <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
                <div className={`relative p-2 rounded-lg bg-gradient-to-br ${cp.gradient} ${isCompleted ? "opacity-40" : ""}`}>
                  <Icon name={isCompleted ? "check" : cp.icon} className="w-5 h-5 text-white" />
                </div>
                {!isCompleted && (
                  <>
                    <span className={`relative text-xs font-bold ${cp.text} leading-tight text-center`}>
                      {cp.taskLabel}
                    </span>
                    <div className="relative flex items-center gap-1">
                      <Icon name={cp.rewards.icon} className="w-3 h-3 text-slate-400" />
                      <span className="text-[10px] font-mono text-slate-400">
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
