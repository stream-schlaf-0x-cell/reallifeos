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
