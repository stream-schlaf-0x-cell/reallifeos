import React, { useState, useMemo } from 'react';
import Icon from './Icon';
import { PATH_COLORS } from '../data/constants';
import { TIER_LABELS, TIER_COLORS } from '../data/skillTreeData';

const ICON_OPTIONS = [
  'brain', 'scroll', 'pen', 'crown', 'book', 'eye', 'yin_yang',
  'music', 'radio', 'headphones', 'cloud', 'sliders',
  'lotus', 'wind', 'sun', 'heart', 'activity', 'zap', 'infinity',
  'server', 'database', 'globe', 'map', 'edit',
];

const SkillTree = ({ gameState, unlockSkill, addCustomSkill, skillTreeData }) => {
  const [activePath, setActivePath] = useState(null); // null = show all (desktop), path id = focused
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [editMode, setEditMode] = useState(false);

  // Add Custom Skill form state
  const [formPath, setFormPath] = useState('socratic');
  const [formTier, setFormTier] = useState(1);
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formCost, setFormCost] = useState(100);
  const [formIcon, setFormIcon] = useState('eye');
  const [showForm, setShowForm] = useState(false);

  // Build path entries from skillTreeData (dynamic, not hardcoded)
  const pathEntries = useMemo(() => {
    return Object.values(skillTreeData).map((path) => {
      // Collect all skills for this path from gameState
      const pathSkills = gameState.skills.filter((s) => s.path === path.id);
      return { ...path, skills: pathSkills };
    });
  }, [skillTreeData, gameState.skills]);

  // Determine which paths to render
  const visiblePaths = activePath
    ? pathEntries.filter((p) => p.id === activePath)
    : pathEntries;

  // Resolve a skill's unlock state and prerequisite status
  const resolveSkill = (skill) => {
    const stateSkill = gameState.skills.find((s) => s.id === skill.id);
    const isUnlocked = stateSkill?.unlocked || false;
    const _reqsMet = skill.req.every(
      (reqId) => gameState.skills.find((s) => s.id === reqId)?.unlocked
    );
    const isAvailable = !isUnlocked && _reqsMet;
    return { ...skill, isUnlocked, isAvailable };
  };

  const handleAddCustomSkill = () => {
    if (!formName.trim()) return;
    const result = addCustomSkill(formPath, formTier, {
      name: formName.trim(),
      desc: formDesc.trim(),
      cost: Number(formCost) || 100,
      icon: formIcon,
      req: [],
    });
    if (result) {
      setFormName('');
      setFormDesc('');
      setFormCost(100);
      setShowForm(false);
    }
  };

  const renderSkillCard = (skill, pathId) => {
    const { isUnlocked, isAvailable } = resolveSkill(skill);
    const pathColor = PATH_COLORS[pathId] || 'from-slate-800 to-slate-600 border-slate-500';

    return (
      <button
        key={skill.id}
        onClick={() => setSelectedSkill({ ...skill, path: pathId })}
        className={`relative w-full p-3 md:p-4 rounded-xl border-2 text-left transition-all duration-300 group ${
          isUnlocked
            ? `bg-gradient-to-br ${pathColor} opacity-100 shadow-lg`
            : isAvailable
            ? 'bg-slate-800 border-slate-500 hover:border-slate-300 opacity-90 cursor-pointer hover:scale-[1.02]'
            : 'bg-slate-900/60 border-slate-800 opacity-40 cursor-not-allowed grayscale'
        }`}
      >
        <div className="flex justify-between items-start mb-2">
          <div className={`p-2 rounded-lg ${isUnlocked ? 'bg-black/30' : 'bg-slate-700/50'}`}>
            <Icon name={skill.icon} className="w-5 h-5" />
          </div>
          {!isUnlocked && (
            <span className="text-xs font-mono bg-slate-900/80 px-2 py-1 rounded text-amber-400">
              {skill.cost} SP
            </span>
          )}
        </div>
        <h3 className={`font-bold leading-tight text-sm ${isUnlocked ? 'text-white' : 'text-slate-300'}`}>
          {skill.name}
        </h3>
        <p className={`text-xs mt-1 line-clamp-2 ${isUnlocked ? 'text-slate-300' : 'text-slate-500'}`}>
          {skill.desc}
        </p>
        {skill.isCustom && (
          <span className="absolute top-2 right-2 text-[10px] bg-indigo-600/80 text-indigo-200 px-1.5 py-0.5 rounded-full">
            Custom
          </span>
        )}
        {/* Connector line to next tier */}
        {!isUnlocked && skill.req.length > 0 && (
          <div className="absolute -top-3 left-1/2 w-0.5 h-3 bg-slate-700"></div>
        )}
      </button>
    );
  };

  const renderPathColumn = (path) => {
    const tierOrder = ['basis', 'schwelle', 'quantensprung', 'meisterschaft'];

    return (
      <div key={path.id} className="flex flex-col gap-4 min-w-[260px] md:min-w-0 flex-1">
        {/* Path Header */}
        <div className="text-center mb-2 sticky top-0 bg-slate-950/90 backdrop-blur py-3 z-10 border-b border-slate-800">
          <h2 className={`text-lg md:text-xl font-bold bg-gradient-to-r ${PATH_COLORS[path.id]} bg-clip-text text-transparent uppercase tracking-widest`}>
            {path.title}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">{path.subtitle}</p>
          <p className="text-[10px] text-slate-600 mt-0.5 italic">{path.endgameGoal?.slice(0, 60)}…</p>
        </div>

        {/* Tiers */}
        {tierOrder.map((tierKey) => {
          const tier = path.tiers?.[tierKey];
          if (!tier) return null;
          const skills = path.skills.filter((s) => s.tier === tier.tierNumber);
          if (skills.length === 0) return null;

          return (
            <div key={tierKey} className="space-y-2">
              {/* Tier Label */}
              <div className="flex items-center gap-2 px-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Stufe {tier.tierNumber}
                </span>
                <span className="text-[10px] text-slate-600 truncate">
                  {tier.label}
                </span>
                <div className="flex-1 h-px bg-slate-800"></div>
              </div>

              {/* Skill Cards */}
              <div className="space-y-2">
                {skills.map((skill) => renderSkillCard(skill, path.id))}
              </div>
            </div>
          );
        })}

        {/* Add Skill Button (edit mode) */}
        {editMode && (
          <button
            onClick={() => {
              setFormPath(path.id);
              setFormTier(1);
              setShowForm(true);
            }}
            className="w-full py-3 rounded-xl border-2 border-dashed border-slate-700 text-slate-500 hover:text-slate-300 hover:border-slate-500 transition-all text-sm font-bold"
          >
            + Skill hinzufügen
          </button>
        )}
      </div>
    );
  };

  return (
    <>
      {/* ─── Toolbar ──────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2 mb-4 px-2">
        {/* Path Filter Tabs */}
        <div className="flex flex-wrap gap-1.5 flex-1">
          <button
            onClick={() => setActivePath(null)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              !activePath
                ? 'bg-slate-700 text-white shadow'
                : 'bg-slate-800/50 text-slate-500 hover:text-slate-300'
            }`}
          >
            Alle
          </button>
          {pathEntries.map((path) => (
            <button
              key={path.id}
              onClick={() => setActivePath(path.id === activePath ? null : path.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activePath === path.id
                  ? `bg-gradient-to-r ${PATH_COLORS[path.id]} text-white shadow`
                  : 'bg-slate-800/50 text-slate-500 hover:text-slate-300'
              }`}
            >
              {path.title}
            </button>
          ))}
        </div>

        {/* Edit Mode Toggle */}
        <button
          onClick={() => setEditMode(!editMode)}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
            editMode
              ? 'bg-amber-600/20 border-amber-500 text-amber-400'
              : 'bg-slate-800 border-slate-700 text-slate-500 hover:text-slate-300'
          }`}
        >
          {editMode ? '✏️ Edit AN' : '✏️ Edit'}
        </button>

        {/* Global Add Skill Button */}
        {editMode && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-500 transition-all"
          >
            + Neuer Skill
          </button>
        )}
      </div>

      {/* ─── Add Skill Form ───────────────────────────────── */}
      {showForm && editMode && (
        <div className="mx-2 mb-4 p-4 md:p-6 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl">
          <h3 className="text-sm font-bold text-indigo-400 mb-4 uppercase tracking-wider">
            Neuen Skill hinzufügen
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Name */}
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-slate-500 mb-1">Name *</label>
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Skill-Name..."
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
              />
            </div>
            {/* Cost */}
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
            {/* Path */}
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
            {/* Tier */}
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-slate-500 mb-1">Stufe</label>
              <select
                value={formTier}
                onChange={(e) => setFormTier(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
              >
                {[1, 2, 3, 4].map((t) => (
                  <option key={t} value={t}>Stufe {t} — {TIER_LABELS[t]}</option>
                ))}
              </select>
            </div>
            {/* Icon */}
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-slate-500 mb-1">Icon</label>
              <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto custom-scrollbar bg-slate-800 border border-slate-700 rounded-lg p-2">
                {ICON_OPTIONS.map((iconName) => (
                  <button
                    key={iconName}
                    onClick={() => setFormIcon(iconName)}
                    className={`p-1.5 rounded ${
                      formIcon === iconName
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-700 text-slate-400 hover:text-white'
                    }`}
                    title={iconName}
                  >
                    <Icon name={iconName} className="w-4 h-4" />
                  </button>
                ))}
              </div>
            </div>
            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-[10px] uppercase tracking-wider text-slate-500 mb-1">Beschreibung</label>
              <textarea
                value={formDesc}
                onChange={(e) => setFormDesc(e.target.value)}
                placeholder="Skill-Beschreibung..."
                rows={2}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 resize-none"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleAddCustomSkill}
              disabled={!formName.trim()}
              className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all ${
                formName.trim()
                  ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.3)]'
                  : 'bg-slate-800 text-slate-600 cursor-not-allowed'
              }`}
            >
              Skill hinzufügen
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-6 py-2.5 rounded-xl font-bold text-sm bg-slate-800 text-slate-400 hover:text-white transition-all"
            >
              Abbrechen
            </button>
          </div>
        </div>
      )}

      {/* ─── Skill Tree Grid ──────────────────────────────── */}
      <div className="h-full overflow-y-auto overflow-x-auto pb-20 custom-scrollbar px-2">
        <div className="flex gap-6 min-w-max">
          {visiblePaths.map((path) => renderPathColumn(path))}
        </div>
      </div>

      {/* ─── Skill Detail Modal ───────────────────────────── */}
      {selectedSkill && (
        <SkillDetailModal
          skill={selectedSkill}
          gameState={gameState}
          unlockSkill={unlockSkill}
          onClose={() => setSelectedSkill(null)}
        />
      )}
    </>
  );
};

// ─── Skill Detail Modal (extracted for clarity) ─────────────────
const SkillDetailModal = ({ skill, gameState, unlockSkill, onClose }) => {
  const isUnlocked = gameState.skills.find((s) => s.id === skill.id)?.unlocked;
  const reqsMet = skill.req.every(
    (reqId) => gameState.skills.find((s) => s.id === reqId)?.unlocked
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-slate-900 border border-slate-700 p-6 md:p-8 rounded-3xl max-w-md w-full shadow-2xl relative animate-in fade-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-500 hover:text-white text-lg"
        >
          ✕
        </button>

        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <div className={`p-4 rounded-2xl bg-gradient-to-br ${PATH_COLORS[skill.path] || 'from-slate-800 to-slate-600'}`}>
            <Icon name={skill.icon} className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-bold">{skill.name}</h2>
            <p className="text-slate-400 uppercase tracking-widest text-[10px]">
              {TIER_LABELS[skill.tier] || `Stufe ${skill.tier}`}
            </p>
            {skill.isCustom && (
              <span className="text-[10px] bg-indigo-600/60 text-indigo-300 px-2 py-0.5 rounded-full mt-1 inline-block">
                Benutzerdefiniert
              </span>
            )}
          </div>
        </div>

        {/* Description */}
        <p className="text-slate-300 mb-6 leading-relaxed text-sm md:text-base">
          {skill.desc}
        </p>

        {/* Requirements */}
        {!isUnlocked && (
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 mb-6">
            <p className="text-sm text-slate-400 mb-2">Voraussetzungen:</p>
            {skill.req.length === 0 ? (
              <p className="text-sm text-emerald-400">Keine — Basis-Skill</p>
            ) : (
              <ul className="text-sm space-y-1">
                {skill.req.map((reqId) => {
                  const reqSkill = gameState.skills.find((s) => s.id === reqId);
                  const isMet = reqSkill?.unlocked;
                  return (
                    <li key={reqId} className={`flex items-center gap-2 ${isMet ? 'text-emerald-400' : 'text-red-400'}`}>
                      <span>{isMet ? '✓' : '✗'}</span> {reqSkill?.name || reqId}
                    </li>
                  );
                })}
              </ul>
            )}
            <div className="mt-4 pt-4 border-t border-slate-800 flex justify-between items-center">
              <span className="text-sm text-slate-400">Kosten:</span>
              <span className={`font-mono font-bold ${gameState.skillPoints >= skill.cost ? 'text-amber-400' : 'text-red-400'}`}>
                {skill.cost} SP
              </span>
            </div>
          </div>
        )}

        {/* Action Button */}
        {isUnlocked ? (
          <button
            disabled
            className="w-full py-4 rounded-xl bg-slate-800 text-emerald-400 font-bold border border-emerald-900/50 cursor-not-allowed"
          >
            Bereits freigeschaltet ✓
          </button>
        ) : (
          <button
            onClick={() => {
              if (unlockSkill(skill.id)) {
                onClose();
              }
            }}
            className={`w-full py-4 rounded-xl font-bold transition-all ${
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
  );
};

export default SkillTree;
