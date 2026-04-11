import React from "react";
import Icon from "./Icon";
import PRESET_QUESTS from "../data/quests.json";
import { PATH_COLORS } from "../data/constants";
import { getResourceRewards } from "../hooks/useGameState";

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
      className="group relative flex flex-col min-h-[160px] text-left transition-all active:scale-[0.97] duration-200"
    >
      {/* Scroll parchment background */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-amber-950/80 via-slate-900/90 to-slate-900/95 border-2 border-amber-800/30 group-hover:border-amber-600/60 transition-colors overflow-hidden">
        {/* Scroll edge decorations */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-700/40 via-amber-500/60 to-amber-700/40"></div>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-700/40 via-amber-500/60 to-amber-700/40"></div>
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-amber-700/40 via-amber-500/60 to-amber-700/40"></div>
        <div className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b from-amber-700/40 via-amber-500/60 to-amber-700/40"></div>
        {/* Scroll roll effect (top/bottom cylinder illusion) */}
        <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-b from-amber-900/20 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 h-3 bg-gradient-to-t from-amber-900/20 to-transparent"></div>
      </div>

      {/* Hover glow */}
      <div
        className={`absolute inset-0 opacity-0 group-hover:opacity-15 transition-opacity rounded-2xl bg-gradient-to-r ${PATH_COLORS[quest.path]}`}
      ></div>

      {/* Content */}
      <div className="relative z-10 flex flex-col justify-between flex-1 p-4 md:p-5">
        {/* Header: Path emoji + Path name */}
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
          {/* XP Badge */}
          <div className="flex items-center gap-1 bg-indigo-900/50 border border-indigo-700/50 rounded-full px-2 py-0.5">
            <Icon name="zap" className="w-3 h-3 text-indigo-400" />
            <span className="text-xs font-mono font-bold text-indigo-300">
              +{quest.xp} XP
            </span>
          </div>
        </div>

        {/* Quest Name */}
        <p className="font-bold text-sm md:text-base text-slate-100 mb-3 leading-snug">
          {quest.name}
        </p>

        {/* Resource Rewards */}
        <div className="flex flex-wrap gap-2 pt-3 border-t border-amber-800/20">
          {totalMove > 0 && (
            <div className="flex items-center gap-1 bg-emerald-900/30 border border-emerald-700/30 rounded-md px-2 py-1">
              <Icon name="move" className="w-3 h-3 text-emerald-400" />
              <span className="text-xs font-mono font-bold text-emerald-300">
                +{totalMove} MP
              </span>
              {(poiBonuses?.moveRegen || 0) > 0 && (
                <span className="text-[9px] text-emerald-500 ml-0.5">
                  (+{poiBonuses.moveRegen} POI)
                </span>
              )}
            </div>
          )}
          {totalGold > 0 && (
            <div className="flex items-center gap-1 bg-yellow-900/30 border border-yellow-700/30 rounded-md px-2 py-1">
              <Icon name="gold" className="w-3 h-3 text-yellow-400" />
              <span className="text-xs font-mono font-bold text-yellow-300">
                +{totalGold} G
              </span>
              {(poiBonuses?.goldRegen || 0) > 0 && (
                <span className="text-[9px] text-yellow-500 ml-0.5">
                  (+{poiBonuses.goldRegen} POI)
                </span>
              )}
            </div>
          )}
          {totalMana > 0 && (
            <div className="flex items-center gap-1 bg-blue-900/30 border border-blue-700/30 rounded-md px-2 py-1">
              <Icon name="mana" className="w-3 h-3 text-blue-400" />
              <span className="text-xs font-mono font-bold text-blue-300">
                +{totalMana} M
              </span>
              {(poiBonuses?.manaRegen || 0) > 0 && (
                <span className="text-[9px] text-blue-500 ml-0.5">
                  (+{poiBonuses.manaRegen} POI)
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </button>
  );
};

const Quests = ({ handleQuestComplete, gameState }) => {
  const poiBonuses = gameState?.poiBonuses || {
    manaRegen: 0,
    goldRegen: 0,
    moveRegen: 0,
  };

  return (
    <div className="h-full overflow-y-auto pb-20 custom-scrollbar pr-2 md:pr-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4 md:mb-6">
        <div className="flex items-center gap-2">
          <span className="text-2xl">📜</span>
          <div>
            <h2 className="text-lg md:text-xl font-bold text-amber-400">
              Schwarzes Brett
            </h2>
            <p className="text-[10px] md:text-xs text-slate-500">
              Quests abschließen = Ressourcen verdienen
            </p>
          </div>
        </div>
      </div>

      {/* Quest Grid */}
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
