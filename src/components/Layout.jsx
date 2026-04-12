import React, { useRef } from "react";
import { useParticles } from "../engine/particleEngine";
import Header from "./Header";
import Navigation from "./Navigation";

const Layout = ({ gameState, activeTab, setActiveTab, devMode, onToggleDevMode, onOpenLog, gameLocked, onBackup, onReloadConfig, children }) => {
  const canvasRef = useRef(null);
  useParticles(canvasRef);

  return (
    <div className="min-h-[100dvh] text-[color:var(--text-primary)] font-sans selection:bg-purple-500/30 overflow-x-hidden flex flex-col relative" style={{ backgroundColor: 'var(--bg-primary)' }}>
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
          onBackup={onBackup}
          onReloadConfig={onReloadConfig}
        />

        {/* Desktop Navigation */}
        <div className="hidden md:block mb-6 shrink-0">
          <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>

        <main className="flex-1 overflow-hidden relative pb-20 md:pb-0">
          {children}
        </main>

        {/* Mobile Navigation (Sticky Bottom) */}
        <div className="md:hidden fixed bottom-0 left-0 w-full backdrop-blur-md border-t z-40 p-2" style={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', borderColor: 'var(--border-secondary)' }}>
            <Navigation activeTab={activeTab} setActiveTab={setActiveTab} isMobile={true} />
        </div>
      </div>
    </div>
  );
};

export default Layout;
