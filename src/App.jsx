import React, { useState } from "react";
import { useGameState } from "./hooks/useGameState";
import Layout from "./components/Layout";
import SkillTree from "./components/SkillTree";
import Quests from "./components/Quests";
import BattleArena from "./components/BattleArena";
import WorldMap from "./components/WorldMap";

export default function App() {
  const {
    gameState,
    handleQuestComplete,
    executeAttack,
    unlockSkill,
    uncoverTile,
    toast
  } = useGameState();

  const [activeTab, setActiveTab] = useState("tree");

  return (
    <>
      <Layout gameState={gameState} activeTab={activeTab} setActiveTab={setActiveTab}>
        {activeTab === "tree" && <SkillTree gameState={gameState} unlockSkill={unlockSkill} />}
        {activeTab === "quests" && <Quests gameState={gameState} handleQuestComplete={handleQuestComplete} />}
        {activeTab === "battle" && <BattleArena gameState={gameState} executeAttack={executeAttack} />}
        {activeTab === "map" && <WorldMap gameState={gameState} uncoverTile={uncoverTile} />}
      </Layout>

      {toast && (
        <div
          className={`fixed bottom-20 md:bottom-8 left-1/2 -translate-x-1/2 px-4 md:px-6 py-2 md:py-3 rounded-full font-bold shadow-2xl z-50 animate-in slide-in-from-bottom-4 text-sm md:text-base whitespace-nowrap ${
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
    </>
  );
}
