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
    clearDamageEvent,
    getAvailableActions,
    getPoiInfo,
    toast,
  } = useGameState();

  const [activeTab, setActiveTab] = useState("tree");

  return (
    <>
      <Layout
        gameState={gameState}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      >
        {activeTab === "tree" && (
          <SkillTree gameState={gameState} unlockSkill={unlockSkill} />
        )}
        {activeTab === "quests" && (
          <Quests
            handleQuestComplete={handleQuestComplete}
            gameState={gameState}
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
          />
        )}
      </Layout>

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
    </>
  );
}
