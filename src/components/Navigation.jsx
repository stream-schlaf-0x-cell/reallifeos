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

export default Navigation;