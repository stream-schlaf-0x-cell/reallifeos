import React, { useState, useMemo } from 'react';
import Icon from './Icon';
import { PATH_COLORS } from '../data/constants';
import { TIER_LABELS } from '../data/skillTreeData';

const ICON_OPTIONS = [
  'brain', 'scroll', 'pen', 'crown', 'book', 'eye', 'yin_yang',
  'music', 'radio', 'headphones', 'cloud', 'sliders',
  'lotus', 'wind', 'sun', 'heart', 'activity', 'zap', 'infinity',
  'server', 'database', 'globe', 'map', 'edit',
];

// ─── Resolve a single skill node ──────────────────────────────
const resolveSkill = (skill, skills) => {
  const stateSkill = skills.find((s) => s.id === skill.id);
  const isUnlocked = stateSkill?.unlocked || false;
  const _reqsMet = skill.req.every(
    (reqId) => skills.find((s) => s.id === reqId)?.unlocked
  );
  return { ...skill, isUnlocked, isAvailable: !isUnlocked && _reqsMet };
};

// ─── Single Skill Card ────────────────────────────────────────
const SkillCard = ({ skill, pathId, onSelect }) => {
  const { isUnlocked, isAvailable } = skill;
  const pathColor = PATH_COLORS[pathId] || 'from-slate-800 to-slate-600 border-slate-500';

  return (
    <button
      onClick={onSelect}
      className={`relative w-full p-3 md:p-3.5 rounded-xl border-2 text-left transition-all duration-200 group ${
        isUnlocked
          ? `bg-gradient-to-br ${pathColor} shadow-lg`
          : isAvailable
          ? 'bg-slate-800 border-slate-600 hover:border-slate-400 cursor-pointer hover:scale-[1.02]'
          : 'bg-slate-900/50 border-slate-800/60 opacity-50 cursor-not-allowed grayscale'
      }`}
    >
      <div className="flex items-start gap-2">
        <div className={`p-1.5 rounded-lg shrink-0 ${isUnlocked ? 'bg-black/30' : 'bg-slate-700/50'}`}>
          <Icon name={skill.icon} className="w-4 h-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-1">
            <h4 className={`font-bold leading-tight text-xs md:text-sm truncate ${isUnlocked ? 'text-white' : 'text-slate-300'}`}>
              {skill.name}
            </h4>
            {!isUnlocked && (
              <span className="text-[10px] font-mono bg-slate-900/80 px-1.5 py-0.5 rounded text-amber-400 shrink-0">
                {skill.cost}
              </span>
            )}
          </div>
          <p className={`text-[11px] mt-0.5 line-clamp-2 ${isUnlocked ? 'text-slate-300' : 'text-slate-500'}`}>
            {skill.desc}
          </p>
        </div>
      </div>
    </button>
  );
};

// ─── Path Column / Section ────────────────────────────────────
const PathSection = ({ path, skills, onSelectSkill, editMode, onAddSkill }) => {
  const [collapsed, setCollapsed] = useState(false);
  const tierOrder = ['basis', 'schwelle', 'quantensprung', 'meisterschaft'];

  return (
    <div className="flex flex-col">
      {/* Path Header — clickable to collapse on mobile */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="md:cursor-default text-center md:pointer-events-none py-3 border-b border-slate-800/60 sticky top-0 bg-slate-950/90 backdrop-blur z-10"
      >
        <h2 className={`text-sm md:text-base font-bold bg-gradient-to-r ${PATH_COLORS[path.id]} bg-clip-text text-transparent uppercase tracking-widest`}>
          {path.title}
        </h2>
        <p className="text-[10px] text-slate-600 mt-0.5">{path.subtitle}</p>
        <span className="md:hidden text-[10px] text-slate-600">
          {collapsed ? '▼ zeigen' : '▲ zuklappen'}
        </span>
      </button>

      {!collapsed && (
        <div className="flex flex-col gap-3 p-2 md:p-0">
          {tierOrder.map((tierKey) => {
            const tier = path.tiers?.[tierKey];
            if (!tier) return null;
            const tierSkills = skills
              .filter((s) => s.tier === tier.tierNumber)
              .map((s) => resolveSkill(s, skills));
            if (tierSkills.length === 0) return null;

            return (
              <div key={tierKey} className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-slate-600">
                    {tier.tierNumber}
                  </span>
                  <div className="flex-1 h-px bg-slate-800/60"></div>
                </div>
                <div className="space-y-1.5">
                  {tierSkills.map((skill) => (
                    <SkillCard
                      key={skill.id}
                      skill={skill}
                      pathId={path.id}
                      onSelect={() => onSelectSkill({ ...skill, path: path.id })}
                    />
                  ))}
                </div>
              </div>
            );
          })}

          {editMode && (
            <button
              onClick={() => onAddSkill(path.id)}
              className="w-full py-2.5 rounded-xl border-2 border-dashed border-slate-700/60 text-slate-600 hover:text-slate-400 hover:border-slate-500 transition-all text-xs font-bold mt-1"
            >
              + Skill
            </button>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Add Skill Modal Form ─────────────────────────────────────
const AddSkillForm = ({ onClose, onAdd, skillTreeData, preselectedPath }) => {
  const [formPath, setFormPath] = useState(preselectedPath || 'socratic');
  const [formTier, setFormTier] = useState(1);
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formCost, setFormCost] = useState(100);
  const [formIcon, setFormIcon] = useState('eye');

  const handleAdd = () => {
    if (!formName.trim()) return;
    onAdd(formPath, formTier, {
      name: formName.trim(),
      desc: formDesc.trim(),
      cost: Number(formCost) || 100,
      icon: formIcon,
      req: [],
    });
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center p-0 md:p-4 bg-slate-950/80 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-slate-900 border border-slate-700 md:rounded-3xl rounded-t-3xl w-full max-w-lg shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-wider">Neuen Skill hinzufügen</h3>
            <button onClick={onClose} className="text-slate-500 hover:text-white text-lg">✕</button>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div className="col-span-2">
              <label className="block text-[10px] uppercase tracking-wider text-slate-500 mb-1">Name *</label>
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Skill-Name…"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                autoFocus
              />
            </div>
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
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-slate-500 mb-1">Stufe</label>
              <select
                value={formTier}
                onChange={(e) => setFormTier(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
              >
                {[1, 2, 3, 4].map((t) => (
                  <option key={t} value={t}>Stufe {t}</option>
                ))}
              </select>
            </div>
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
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-slate-500 mb-1">Icon</label>
              <div className="flex flex-wrap gap-1 max-h-12 overflow-y-auto custom-scrollbar bg-slate-800 border border-slate-700 rounded-lg p-1.5">
                {ICON_OPTIONS.map((iconName) => (
                  <button
                    key={iconName}
                    onClick={() => setFormIcon(iconName)}
                    className={`p-1 rounded ${formIcon === iconName ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-400 hover:text-white'}`}
                  >
                    <Icon name={iconName} className="w-3.5 h-3.5" />
                  </button>
                ))}
              </div>
            </div>
            <div className="col-span-2">
              <label className="block text-[10px] uppercase tracking-wider text-slate-500 mb-1">Beschreibung</label>
              <textarea
                value={formDesc}
                onChange={(e) => setFormDesc(e.target.value)}
                placeholder="Beschreibung…"
                rows={2}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 resize-none"
              />
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <button
              onClick={handleAdd}
              disabled={!formName.trim()}
              className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all ${
                formName.trim()
                  ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.3)]'
                  : 'bg-slate-800 text-slate-600 cursor-not-allowed'
              }`}
            >
              Hinzufügen
            </button>
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl font-bold text-sm bg-slate-800 text-slate-500 hover:text-white transition-all"
            >
              Abbrechen
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Skill Detail Modal ───────────────────────────────────────
const SkillDetailModal = ({ skill, gameState, unlockSkill, onClose }) => {
  const isUnlocked = gameState.skills.find((s) => s.id === skill.id)?.unlocked;
  const reqsMet = skill.req.every(
    (reqId) => gameState.skills.find((s) => s.id === reqId)?.unlocked
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 bg-slate-950/80 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-slate-900 border border-slate-700 md:rounded-3xl rounded-t-3xl max-w-md w-full shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 md:p-7">
          <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white text-lg">✕</button>

          <div className="flex items-center gap-4 mb-5">
            <div className={`p-3.5 rounded-2xl bg-gradient-to-br ${PATH_COLORS[skill.path] || 'from-slate-800 to-slate-600'}`}>
              <Icon name={skill.icon} className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-bold">{skill.name}</h2>
              <p className="text-slate-500 text-[10px] uppercase tracking-widest">
                {TIER_LABELS[skill.tier] || `Stufe ${skill.tier}`}
              </p>
              {skill.isCustom && (
                <span className="text-[10px] bg-indigo-600/60 text-indigo-300 px-2 py-0.5 rounded-full mt-1 inline-block">
                  Benutzerdefiniert
                </span>
              )}
            </div>
          </div>

          <p className="text-slate-300 mb-5 leading-relaxed text-sm">{skill.desc}</p>

          {!isUnlocked && (
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 mb-5">
              <p className="text-xs text-slate-500 mb-1.5">Voraussetzungen:</p>
              {skill.req.length === 0 ? (
                <p className="text-xs text-emerald-400">Keine — Basis-Skill</p>
              ) : (
                <ul className="text-xs space-y-0.5">
                  {skill.req.map((reqId) => {
                    const reqSkill = gameState.skills.find((s) => s.id === reqId);
                    const isMet = reqSkill?.unlocked;
                    return (
                      <li key={reqId} className={`flex items-center gap-1.5 ${isMet ? 'text-emerald-400' : 'text-red-400'}`}>
                        <span>{isMet ? '✓' : '✗'}</span> {reqSkill?.name || reqId}
                      </li>
                    );
                  })}
                </ul>
              )}
              <div className="mt-3 pt-3 border-t border-slate-800 flex justify-between items-center">
                <span className="text-xs text-slate-500">Kosten:</span>
                <span className={`font-mono font-bold text-sm ${gameState.skillPoints >= skill.cost ? 'text-amber-400' : 'text-red-400'}`}>
                  {skill.cost} SP
                </span>
              </div>
            </div>
          )}

          {isUnlocked ? (
            <button disabled className="w-full py-3.5 rounded-xl bg-slate-800 text-emerald-400 font-bold border border-emerald-900/50 cursor-not-allowed text-sm">
              Bereits freigeschaltet ✓
            </button>
          ) : (
            <button
              onClick={() => { if (unlockSkill(skill.id)) onClose(); }}
              className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all ${
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
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
//  Main SkillTree Component
// ═══════════════════════════════════════════════════════════════
const SkillTree = ({ gameState, unlockSkill, addCustomSkill, skillTreeData }) => {
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForPath, setAddForPath] = useState(null);

  // Build path entries dynamically from data
  const pathEntries = useMemo(() => {
    return Object.values(skillTreeData).map((path) => ({
      ...path,
      skills: gameState.skills.filter((s) => s.path === path.id),
    }));
  }, [skillTreeData, gameState.skills]);

  const handleOpenAddForm = (pathId) => {
    setAddForPath(pathId);
    setShowAddForm(true);
  };

  return (
    <>
      {/* ─── Minimal Toolbar ──────────────────────────────── */}
      <div className="flex items-center justify-between px-2 mb-2">
        <div className="flex items-center gap-2">
          <Icon name="brain" className="w-4 h-4 text-indigo-400" />
          <span className="text-[10px] uppercase tracking-widest text-slate-600 font-bold">
            Skillbaum
          </span>
          <span className="text-[10px] text-slate-700">
            {gameState.skillPoints} SP verfügbar
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setEditMode(!editMode)}
            className={`px-2.5 py-1 rounded-md text-[10px] font-bold border transition-all ${
              editMode
                ? 'bg-amber-600/20 border-amber-500/60 text-amber-400'
                : 'bg-transparent border-slate-700 text-slate-600 hover:text-slate-400'
            }`}
          >
            {editMode ? '✓ Fertig' : '+ Bearbeiten'}
          </button>
          {editMode && (
            <button
              onClick={() => { setAddForPath(null); setShowAddForm(true); }}
              className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-indigo-600 text-white hover:bg-indigo-500 transition-all"
            >
              Neuer Skill
            </button>
          )}
        </div>
      </div>

      {/* ─── Skill Grid: 1 col mobile → 2 iPad → 3 lg → 5 xl  */}
      <div className="h-full overflow-y-auto pb-20 custom-scrollbar">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-0 md:gap-4 px-1">
          {pathEntries.map((path) => (
            <div
              key={path.id}
              className="border border-slate-800/40 md:rounded-2xl md:bg-slate-900/30 md:border md:border-slate-800/40 overflow-hidden"
            >
              <PathSection
                path={path}
                skills={path.skills}
                onSelectSkill={setSelectedSkill}
                editMode={editMode}
                onAddSkill={handleOpenAddForm}
              />
            </div>
          ))}
        </div>
      </div>

      {/* ─── Modals ───────────────────────────────────────── */}
      {selectedSkill && (
        <SkillDetailModal
          skill={selectedSkill}
          gameState={gameState}
          unlockSkill={unlockSkill}
          onClose={() => setSelectedSkill(null)}
        />
      )}

      {showAddForm && (
        <AddSkillForm
          onClose={() => setShowAddForm(false)}
          onAdd={(pathId, tier, data) => {
            addCustomSkill(pathId, tier, data);
            setShowAddForm(false);
          }}
          skillTreeData={skillTreeData}
          preselectedPath={addForPath}
        />
      )}
    </>
  );
};

export default SkillTree;
