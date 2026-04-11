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
