// ─── Skill Tree Data ───────────────────────────────────────────────
// The complete 5-path Skill Tree of Life.
// Each path has 4 tiers: basis (1), schwelle (2), quantensprung (3), meisterschaft (4).
// Every skill has: id, name, desc, icon, cost, req (prerequisite skill IDs).
// The `unlocked` flag is managed at runtime in gameState (not here).

export const SKILL_TREE_DATA = {
  // ═══════════════════════════════════════════════════════════
  // Path 1: Der Sokratiker — Intellekt & Lehre → Yields Gold
  // ═══════════════════════════════════════════════════════════
  socratic: {
    id: "socratic",
    title: "Der Sokratiker",
    subtitle: "Intellekt & Lehre",
    yield: "Gold",
    endgameGoal:
      "Publishing books, didactic mastery in Ethics/Philosophy/German, and merging constructive and instructive teaching approaches.",
    tiers: {
      basis: {
        label: "Die Basis",
        tierNumber: 1,
        skills: [
          {
            id: "soc_master_of_arts",
            name: "Master of Arts (Philosophie)",
            desc: "Die Fähigkeit zur radikalen Analyse und zum abstrakten Denken.",
            icon: "brain",
            cost: 0,
            req: [],
          },
          {
            id: "soc_ethik_didaktik",
            name: "Ethische Grund-Didaktik",
            desc: "Die Basis-Lehrbefähigung und Vermittlung moralischer Konzepte.",
            icon: "scroll",
            cost: 50,
            req: ["soc_master_of_arts"],
          },
        ],
      },
      schwelle: {
        label: "Die aktuelle Schwelle",
        tierNumber: 2,
        skills: [
          {
            id: "soc_germanistik",
            name: "Germanistische Grundlegung",
            desc: "Abschluss der Zusatzqualifikation — Verständnis von Sprache als Weltgestaltung.",
            icon: "pen",
            cost: 100,
            req: ["soc_ethik_didaktik"],
          },
          {
            id: "soc_didaktische_alchemie",
            name: "Didaktische Alchemie",
            desc: "Balance zwischen Konstruktion (Schüler erarbeiten selbst) und Instruktion.",
            icon: "edit",
            cost: 120,
            req: ["soc_ethik_didaktik"],
          },
          {
            id: "soc_classroom_command",
            name: "Classroom Command",
            desc: "Authentischer Stil für Präsenz und Struktur im Unterricht.",
            icon: "crown",
            cost: 120,
            req: ["soc_ethik_didaktik"],
          },
        ],
      },
      quantensprung: {
        label: "Der Quantensprung",
        tierNumber: 3,
        skills: [
          {
            id: "soc_deep_reading",
            name: "Deep Reading & Synthesis",
            desc: "Den 'Stapel der Schande' in ein aktives Wissensnetz verwandeln.",
            icon: "book",
            cost: 200,
            req: ["soc_germanistik", "soc_didaktische_alchemie"],
          },
          {
            id: "soc_schreib_flow",
            name: "Der Schreib-Flow",
            desc: "Übergang zum aktiven Produzenten — Reflexionen, Essays.",
            icon: "pen",
            cost: 200,
            req: ["soc_didaktische_alchemie"],
          },
          {
            id: "soc_paed_ganzheit",
            name: "Pädagogische Ganzheitlichkeit",
            desc: "Das fertige funktionale Unterrichtskonzept.",
            icon: "eye",
            cost: 250,
            req: ["soc_classroom_command", "soc_didaktische_alchemie"],
          },
          {
            id: "soc_sokratische_praesenz",
            name: "Sokratische Präsenz",
            desc: "Die Essenz: Den Raum der ethischen Klarheit und Geistesgegenwart im Unterricht halten.",
            icon: "yin_yang",
            cost: 300,
            req: ["soc_deep_reading", "soc_paed_ganzheit"],
          },
        ],
      },
      meisterschaft: {
        label: "Die Meisterschaft",
        tierNumber: 4,
        skills: [
          {
            id: "soc_publikation",
            name: "Publizierte Autorität",
            desc: "Veröffentlichung des ersten Werkes.",
            icon: "book",
            cost: 500,
            req: ["soc_schreib_flow"],
          },
          {
            id: "soc_mentor",
            name: "Mentor der Sokratik",
            desc: "Prägung der Didaktik des Fachbereichs.",
            icon: "crown",
            cost: 600,
            req: ["soc_sokratische_praesenz"],
          },
          {
            id: "soc_phil_leben",
            name: "Philosophische Lebensführung",
            desc: "Vollständige Integration von Denken, Lehren und Sein.",
            icon: "yin_yang",
            cost: 800,
            req: ["soc_mentor", "soc_publikation"],
          },
        ],
      },
    },
  },

  // ═══════════════════════════════════════════════════════════
  // Path 2: Der Barde — Musik & Produktion → Yields Mana
  // ═══════════════════════════════════════════════════════════
  bard: {
    id: "bard",
    title: "Der Barde",
    subtitle: "Musik & Produktion",
    yield: "Mana",
    endgameGoal:
      "Live performances, building a true fanbase, generating passive income, and maintaining an aesthetic digital presence for 'yrrpheus' (Ambient) and 'yolomeus' (Chillhop).",
    tiers: {
      basis: {
        label: "Die Basis",
        tierNumber: 1,
        skills: [
          {
            id: "bar_daw_nav",
            name: "DAW-Navigation & Arrangement",
            desc: "Solides Fundament in Ableton Live 12.",
            icon: "music",
            cost: 0,
            req: [],
          },
          {
            id: "bar_mixing_master",
            name: "Mixing & Mastering Fundament",
            desc: "Grundverständnis für UADx- und Ableton-Plugins.",
            icon: "sliders",
            cost: 50,
            req: ["bar_daw_nav"],
          },
        ],
      },
      schwelle: {
        label: "Die aktuelle Schwelle",
        tierNumber: 2,
        skills: [
          {
            id: "bar_workflow",
            name: "Workflow-Autonomie",
            desc: "Feste Studioumgebung, um in unter 15 Minuten zur ersten Skizze zu kommen.",
            icon: "sliders",
            cost: 100,
            req: ["bar_daw_nav"],
          },
          {
            id: "bar_release_rythmus",
            name: "Der Release-Rhythmus",
            desc: "Den viermonatigen Stillstand brechen; regelmäßige Veröffentlichungen.",
            icon: "radio",
            cost: 120,
            req: ["bar_mixing_master"],
          },
          {
            id: "bar_sound_design",
            name: "Sound Design Erwachen",
            desc: "Eigene Klänge formen statt Presets nutzen.",
            icon: "cloud",
            cost: 120,
            req: ["bar_mixing_master"],
          },
        ],
      },
      quantensprung: {
        label: "Die Dualität",
        tierNumber: 3,
        skills: [
          {
            id: "bar_yrrpheus",
            name: "Atmosphärische Synthese (yrrpheus)",
            desc: "Meisterhafte Erschaffung von Reverb-Kaskaden und Drones.",
            icon: "cloud",
            cost: 200,
            req: ["bar_sound_design"],
          },
          {
            id: "bar_field_rec",
            name: "Field Recording & Textur",
            desc: "Organische Geräusche in elektronische Ambience verweben.",
            icon: "radio",
            cost: 200,
            req: ["bar_sound_design"],
          },
          {
            id: "bar_yolomeus",
            name: "LoFi-Groove & Vibe (yolomeus)",
            desc: "Die Kunst des unperfekten Rhythmus und Humanizing von Beats.",
            icon: "headphones",
            cost: 200,
            req: ["bar_workflow"],
          },
          {
            id: "bar_jazz_harmonik",
            name: "Jazz-Harmonik & Sampling",
            desc: "Fortgeschrittenes Flippen von Samples und komplexe Akkordfolgen.",
            icon: "music",
            cost: 250,
            req: ["bar_yolomeus", "bar_release_rythmus"],
          },
        ],
      },
      meisterschaft: {
        label: "Die Meisterschaft",
        tierNumber: 4,
        skills: [
          {
            id: "bar_aesthetik",
            name: "Ästhetische digitale Präsenz",
            desc: "Kohärentes visuelles und klangliches Branding.",
            icon: "eye",
            cost: 500,
            req: ["bar_yrrpheus", "bar_yolomeus"],
          },
          {
            id: "bar_fan_cult",
            name: "True Fan Cultivation",
            desc: "Aufbau einer Community für passives Einkommen.",
            icon: "heart",
            cost: 600,
            req: ["bar_aesthetik", "bar_release_rythmus"],
          },
          {
            id: "bar_live_set",
            name: "Das Live-Erlebnis",
            desc: "Übertragung der Studio-Tracks in ein fließendes, hybrides Live-Set.",
            icon: "headphones",
            cost: 800,
            req: ["bar_fan_cult", "bar_field_rec"],
          },
        ],
      },
    },
  },

  // ═══════════════════════════════════════════════════════════
  // Path 3: Der Mönch — Achtsamkeit & Schattenarbeit → Buffs & Mana
  // ═══════════════════════════════════════════════════════════
  monk: {
    id: "monk",
    title: "Der Mönch",
    subtitle: "Achtsamkeit & Schattenarbeit",
    yield: "Mana & Passive Buffs",
    endgameGoal:
      "Erleuchtung (Bodhicitta), combining Tibetan Buddhist clarity (insight into Shunyata/Samsara) with Taoist vitality (extreme health via Qi Gong) to fight dark impulses and shadow/addiction.",
    tiers: {
      basis: {
        label: "Die Basis",
        tierNumber: 1,
        skills: [
          {
            id: "mon_dharma",
            name: "Das Fundament des Dharma",
            desc: "Intellektuelles/intuitives Verständnis der Meditationspraxis.",
            icon: "lotus",
            cost: 0,
            req: [],
          },
          {
            id: "mon_beobachter",
            name: "Erfahrung des Beobachters",
            desc: "Das erlebte Wissen um den 'Right Mind'.",
            icon: "eye",
            cost: 50,
            req: ["mon_dharma"],
          },
        ],
      },
      schwelle: {
        label: "The Shadow War / Main Quest",
        tierNumber: 2,
        skills: [
          {
            id: "mon_identity",
            name: "Identity Forging",
            desc: "Zerstörung dunkler Impulse durch Affirmationen und ein neues Selbstkonzept.",
            icon: "yin_yang",
            cost: 100,
            req: ["mon_beobachter"],
          },
          {
            id: "mon_remembrance",
            name: "Remembrance",
            desc: "Alltags-Achtsamkeit zur Unterbrechung des Autopiloten.",
            icon: "lotus",
            cost: 120,
            req: ["mon_beobachter"],
          },
          {
            id: "mon_qigong",
            name: "Qi Gong Fundament",
            desc: "Physisch-energetische Praxis für extreme Gesundheit.",
            icon: "wind",
            cost: 120,
            req: ["mon_dharma"],
          },
        ],
      },
      quantensprung: {
        label: "Die Transformation",
        tierNumber: 3,
        skills: [
          {
            id: "mon_anal_med",
            name: "Analytische Meditation & Mantra-Flow",
            desc: "Kognitives Durchdringen von Konzepten.",
            icon: "brain",
            cost: 200,
            req: ["mon_identity", "mon_remembrance"],
          },
          {
            id: "mon_schatten",
            name: "Schatten-Integration",
            desc: "Transformation dunkler Impulse in karmische Energie und Mitgefühl.",
            icon: "yin_yang",
            cost: 250,
            req: ["mon_identity"],
          },
          {
            id: "mon_tao_tibet",
            name: "Tao-Tibetische Synthese",
            desc: "Nahtlose Verbindung von Qi Gong und Geistes-Klarheit.",
            icon: "sun",
            cost: 300,
            req: ["mon_qigong", "mon_anal_med"],
          },
        ],
      },
      meisterschaft: {
        label: "Die Meisterschaft",
        tierNumber: 4,
        skills: [
          {
            id: "mon_samsara",
            name: "Einsicht in Samsara",
            desc: "Ultimatives Mitgefühl für sich selbst und alle Lebewesen.",
            icon: "heart",
            cost: 500,
            req: ["mon_schatten"],
          },
          {
            id: "mon_shunyata",
            name: "Einsicht in Shunyata",
            desc: "Tiefer Frieden und radikale Gelassenheit (Leerheit).",
            icon: "lotus",
            cost: 600,
            req: ["mon_anal_med", "mon_tao_tibet"],
          },
          {
            id: "mon_bodhicitta",
            name: "Bodhicitta",
            desc: "Die erleuchtete Engine: Zustand extremen Friedens und extremer Vitalität.",
            icon: "sun",
            cost: 800,
            req: ["mon_samsara", "mon_shunyata"],
          },
        ],
      },
    },
  },

  // ═══════════════════════════════════════════════════════════
  // Path 4: Der Akrobat — Körper & Flow Arts → Yields Movement Points
  // ═══════════════════════════════════════════════════════════
  acrobat: {
    id: "acrobat",
    title: "Der Akrobat",
    subtitle: "Körper & Flow Arts",
    yield: "Bewegungspunkte",
    endgameGoal:
      "Extreme physical agility, flexibility, health from within, strong masculine appearance, and mastery of flow arts (Diabolo, juggling balls, fire tools) for resilience.",
    tiers: {
      basis: {
        label: "Die Basis",
        tierNumber: 1,
        skills: [
          {
            id: "acr_kardio",
            name: "Kardiovaskuläre Grundlast",
            desc: "Basis-Fitness und gesunde Ruheherzfrequenz.",
            icon: "heart",
            cost: 0,
            req: [],
          },
          {
            id: "acr_artistik",
            name: "Artistischer Funke",
            desc: "Hand-Auge-Koordination und Basis-Jonglage.",
            icon: "activity",
            cost: 50,
            req: ["acr_kardio"],
          },
        ],
      },
      schwelle: {
        label: "Die aktuelle Schwelle",
        tierNumber: 2,
        skills: [
          {
            id: "acr_laufen",
            name: "Der Lauf-Rhythmus",
            desc: "Wieder-Einstieg ins regelmäßige Laufen als Ausgleich.",
            icon: "zap",
            cost: 100,
            req: ["acr_kardio"],
          },
          {
            id: "acr_eisen",
            name: "Fundamentales Eisen",
            desc: "Kraftsport zum Aufbau einer starken Erscheinung und Gelenkschutz.",
            icon: "activity",
            cost: 120,
            req: ["acr_artistik"],
          },
          {
            id: "acr_diabolo",
            name: "Diabolo & Balls Progression",
            desc: "Bewusstes Erlernen komplexer Muster.",
            icon: "infinity",
            cost: 120,
            req: ["acr_artistik"],
          },
        ],
      },
      quantensprung: {
        label: "Die Transformation",
        tierNumber: 3,
        skills: [
          {
            id: "acr_mobility",
            name: "Movement & Mobility",
            desc: "Fließende Bewegung, Calisthenics (Nil Teisner Style).",
            icon: "activity",
            cost: 200,
            req: ["acr_laufen", "acr_eisen"],
          },
          {
            id: "acr_partner",
            name: "Partner-Akrobatik",
            desc: "Vertrauen, Balance und Hebelwirkungen meistern.",
            icon: "heart",
            cost: 250,
            req: ["acr_eisen"],
          },
          {
            id: "acr_crystal",
            name: "Crystal Flow & Fire Basics",
            desc: "Hypnotische Präzision und erster Umgang mit Feuer.",
            icon: "zap",
            cost: 250,
            req: ["acr_diabolo"],
          },
          {
            id: "acr_resilienz",
            name: "Die Resilienz-Batterie",
            desc: "Training als aktiver Energie- und Stressresistenz-Lieferant.",
            icon: "zap",
            cost: 200,
            req: ["acr_laufen", "acr_mobility"],
          },
        ],
      },
      meisterschaft: {
        label: "Die Meisterschaft",
        tierNumber: 4,
        skills: [
          {
            id: "acr_apex",
            name: "Apex Physicality",
            desc: "Der Körper als perfektes, agiles und kraftvolles Werkzeug.",
            icon: "activity",
            cost: 500,
            req: ["acr_mobility", "acr_resilienz"],
          },
          {
            id: "acr_flow_master",
            name: "Master of the Flow Arts",
            desc: "Absolute Meisterschaft über Diabolo, Bälle und Fire-Tools.",
            icon: "infinity",
            cost: 600,
            req: ["acr_crystal", "acr_diabolo"],
          },
          {
            id: "acr_geschmeidig",
            name: "Geschmeidige Kraft",
            desc: "Elegante, kraftvolle Bewegungen im Alltag und auf der Bühne.",
            icon: "yin_yang",
            cost: 800,
            req: ["acr_apex", "acr_flow_master"],
          },
        ],
      },
    },
  },

  // ═══════════════════════════════════════════════════════════
  // Path 5: Der Architekt — Environmental Design & Tech → Map Upgrades
  // ═══════════════════════════════════════════════════════════
  architect: {
    id: "architect",
    title: "Der Architekt",
    subtitle: "Environmental Design & Tech",
    yield: "Karten-Upgrades",
    endgameGoal:
      "Master of environments (physical, digital, temporal). Complete external cognition via Craft/Nextcloud/Dify to eliminate forgetfulness and achieve hyper-focus.",
    tiers: {
      basis: {
        label: "Die Basis",
        tierNumber: 1,
        skills: [
          {
            id: "arc_server",
            name: "Das Server-Fundament",
            desc: "Autarke Docker/Tailscale-Infrastruktur.",
            icon: "server",
            cost: 0,
            req: [],
          },
          {
            id: "arc_raum",
            name: "Räumliches Bewusstsein",
            desc: "Erkenntnis der Auswirkung von physischen Räumen auf den Flow.",
            icon: "map",
            cost: 50,
            req: ["arc_server"],
          },
        ],
      },
      schwelle: {
        label: "Die aktuelle Schwelle",
        tierNumber: 2,
        skills: [
          {
            id: "arc_craft",
            name: "Craft-Templating",
            desc: "Konsequenter Einsatz vorgefertigter Strukturen (Einstiegs-Schneepflug).",
            icon: "edit",
            cost: 100,
            req: ["arc_server"],
          },
          {
            id: "arc_kalender",
            name: "Die Kalender-Matrix",
            desc: "Aktives Time-Boxing statt Termin-Verwaltung.",
            icon: "sliders",
            cost: 120,
            req: ["arc_raum"],
          },
          {
            id: "arc_workspace",
            name: "Workspace Design",
            desc: "Physische Optimierung von Zimmer und Musik-Setup.",
            icon: "database",
            cost: 120,
            req: ["arc_raum"],
          },
        ],
      },
      quantensprung: {
        label: "Der Quantensprung",
        tierNumber: 3,
        skills: [
          {
            id: "arc_extern",
            name: "Externe Kognition (Anti-Verpeiltheit)",
            desc: "Alles aus dem Arbeitsgedächtnis ins System auslagern.",
            icon: "brain",
            cost: 200,
            req: ["arc_craft", "arc_kalender"],
          },
          {
            id: "arc_okr",
            name: "Ziel-Synthese (OKR)",
            desc: "Vage Wünsche in messbare Ziele/Meilensteine herunterbrechen.",
            icon: "crown",
            cost: 250,
            req: ["arc_kalender", "arc_workspace"],
          },
          {
            id: "arc_interdis",
            name: "Interdisziplinäres Design",
            desc: "UI/UX und Cover-Artworks entwerfen.",
            icon: "eye",
            cost: 250,
            req: ["arc_workspace"],
          },
        ],
      },
      meisterschaft: {
        label: "Die Meisterschaft",
        tierNumber: 4,
        skills: [
          {
            id: "arc_master_env",
            name: "Master of Environments",
            desc: "Umgebungen so designen, dass gute Gewohnheiten unausweichlich sind.",
            icon: "map",
            cost: 500,
            req: ["arc_extern", "arc_okr"],
          },
          {
            id: "arc_auto",
            name: "Automatisierte Orchestrierung",
            desc: "KI-Agenten bereiten autark den Arbeitstag vor.",
            icon: "server",
            cost: 600,
            req: ["arc_extern"],
          },
          {
            id: "arc_interface",
            name: "Das kristallklare Interface",
            desc: "Eine minimalistische Kommandozentrale ohne kognitive Überlastung.",
            icon: "database",
            cost: 800,
            req: ["arc_master_env", "arc_auto"],
          },
        ],
      },
    },
  },
};

// ─── Helper: Flatten all skills from the tree into an array ───────
export function flattenSkills() {
  const all = [];
  Object.values(SKILL_TREE_DATA).forEach((path) => {
    Object.values(path.tiers).forEach((tier) => {
      tier.skills.forEach((skill) => {
        all.push({
          id: skill.id,
          path: path.id,
          tier: tier.tierNumber,
          name: skill.name,
          desc: skill.desc,
          icon: skill.icon,
          cost: skill.cost,
          unlocked: false,
          req: skill.req,
          isCustom: false,
        });
      });
    });
  });

  // Backward-compat migration: for the existing skills.json unlocked states
  // These legacy IDs map to some of the new skills (or we simply keep defaults).
  // The migration of existing unlock states is handled in useGameState.
  return all;
}

// ─── Legacy mapping: old skills.json → new skill IDs ─────────────
// This preserves the unlocked state of the old skills when migrating.
export const LEGACY_SKILL_MAP = {
  arc_1: "arc_server",
  arc_2: "arc_extern",
  arc_3: "arc_craft",
  arc_4: "arc_auto",
  arc_5: "arc_master_env",
  soc_1: "soc_ethik_didaktik",
  soc_2: "soc_didaktische_alchemie",
  soc_3: "soc_germanistik",
  soc_4: "soc_deep_reading",
  soc_5: "soc_phil_leben",
  bar_1: "bar_daw_nav",
  bar_2: "bar_release_rythmus",
  bar_3: "bar_yolomeus",
  bar_4: "bar_yrrpheus",
  bar_5: "bar_mixing_master",
  mon_1: "mon_dharma",
  mon_2: "mon_qigong",
  mon_3: "mon_anal_med",
  mon_4: "mon_bodhicitta",
  acr_1: "acr_kardio",
  acr_2: "acr_diabolo",
  acr_3: "acr_laufen",
  acr_4: "acr_apex",
};

// ─── Tier labels for display ─────────────────────────────────────
export const TIER_LABELS = {
  1: "Die Basis",
  2: "Die aktuelle Schwelle",
  3: "Der Quantensprung",
  4: "Die Meisterschaft",
};

// ─── Tier color themes for borders/backgrounds ───────────────────
export const TIER_COLORS = {
  1: "border-slate-700 bg-slate-800/40",
  2: "border-amber-800/40 bg-amber-900/10",
  3: "border-purple-800/40 bg-purple-900/10",
  4: "border-yellow-600/40 bg-yellow-900/10",
};
