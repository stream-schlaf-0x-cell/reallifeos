import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { playUnlockSound } from '../engine/audioEngine';
import { flattenSkills, LEGACY_SKILL_MAP, SKILL_TREE_DATA } from '../data/skillTreeData';

/**
 * Skill Store: Verwaltet Skilltree, Freischaltungen und Custom Skills
 */
export const useSkillStore = create(
  persist(
    (set, get) => ({
      // ═══════════════════════════════════ STATE ═══════════════════════════════════
      skills: flattenSkills(),

      // ═══════════════════════════════════ HELPERS ═══════════════════════════════════

      /**
       * Holt den aktuellen Skill-State
       */
      getSkillById: (skillId) => {
        const state = get();
        return state.skills.find((s) => s.id === skillId);
      },

      /**
       * Prüft, ob ein Skill verfügbar ist (nicht freigeschaltet, aber Voraussetzungen erfüllt)
       */
      isSkillAvailable: (skill) => {
        const state = get();
        const stateSkill = state.skills.find((s) => s.id === skill.id);
        if (!stateSkill || stateSkill.unlocked) return false;
        // Check prerequisites
        return skill.req.every((reqId) => {
          const reqSkill = state.skills.find((s) => s.id === reqId);
          return reqSkill?.unlocked;
        });
      },

      // ═══════════════════════════════════ SKILL MECHANICS ═══════════════════════════════════

      /**
       * Freischaltet einen Skill
       */
      unlockSkill: (skillId, skillPointsCost) => {
        const state = get();
        const skillToUnlock = state.skills.find((s) => s.id === skillId);

        if (!skillToUnlock) return false;
        if (skillToUnlock.unlocked) return false;

        set((state) => ({
          skills: state.skills.map((s) =>
            s.id === skillId ? { ...s, unlocked: true } : s
          ),
        }));

        playUnlockSound();
        return true;
      },

      /**
       * Addiert einen custom Skill (vom User erstellt)
       */
      addCustomSkill: (path, tier, skillData) => {
        const id = `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const newSkill = {
          id,
          name: skillData.name,
          desc: skillData.desc,
          icon: skillData.icon,
          cost: skillData.cost,
          req: skillData.req || [],
          tier,
          path,
          unlocked: false,
          isCustom: true,
        };

        set((state) => ({
          skills: [...state.skills, newSkill],
        }));

        return newSkill;
      },

      /**
       * Migriert legacy Skills von altem Format zu neuem
       */
      migrateLegacySkills: (oldSkills) => {
        let baseSkills = flattenSkills();

        if (Array.isArray(oldSkills)) {
          // Migiere alte Freischaltungen
          oldSkills.forEach((legacySkill) => {
            if (legacySkill.unlocked) {
              const newId = LEGACY_SKILL_MAP[legacySkill.id];
              if (newId) {
                const target = baseSkills.find((s) => s.id === newId);
                if (target) target.unlocked = true;
              }
            }
          });

          // Repl custom Skills
          oldSkills.forEach((savedSkill) => {
            if (savedSkill.isCustom && !baseSkills.find((s) => s.id === savedSkill.id)) {
              baseSkills.push(savedSkill);
            }
          });
        }

        set({ skills: baseSkills });
      },

      // ═══════════════════════════════════ DEV TOOLS ═══════════════════════════════════

      /**
       * Schaltet alle Skills frei (Dev-Modus)
       */
      devUnlockAllSkills: () => {
        set((state) => ({
          skills: state.skills.map((s) => ({ ...s, unlocked: true })),
        }));
      },

      /**
       * Setzt Skills zurück (Dev-Modus)
       */
      devResetSkills: () => {
        set({ skills: flattenSkills() });
      },
    }),
    {
      name: 'skill-store',
      // Migration wird in der Facade gehandhabt
    }
  )
);
