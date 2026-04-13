# 🌌 RealLifeOS - Vollständige Projekt-Dokumentation

**Erstellt:** April 2026
**Aktualisiert:** Montag, 13. April 2026
**Version:** 2.0 — Evolving One Life Game
**Format:** Markdown für KI-Sharing optimiert
**Zielgruppe:** Externe KI-Systeme, Entwickler, Collaborators

---

## 📋 PROJECT SUMMARY

### Mission Statement
> Ein radikal elastisches Lebens-Betriebssystem, das digitale Souveränität, pädagogische Exzellenz, künstlerische Tiefe und persönliche Entwicklung vereint, um echtes "gleichzeitiges Aufblühen" über 5 parallele Lebensformen zu ermöglichen.

### Core Pillars

1. **Gleichzeitiges Aufblühen** - Kognitiv, physisch, kreativ entwickeln
2. **Exzellenz statt Mittelmaß** - Tiefe in allen 5 Identitäten
3. **Mentale Vorbereitung** - Gedankliche Kalibrierung vor Ausführung
4. **Radikale Elastizität** - Anpassung an Lebensphasen & Energie
5. **Intelligence Augmentation** - KI als simuliertes Entwickler-Team (Architect Terminal)
6. **Evolving World** (v2.0) - Die Welt existiert erst, wenn man sie betritt. Biome entfalten sich prozedural, Assets werden asynchron generiert.

---

## 🏗️ TECHNISCHE ARCHITEKTUR (AKTUELL)

### Tech Stack
- **Framework:** React 19.2.4
- **Build Tool:** Vite 8.0.4
- **Styling:** TailwindCSS 4.2.2 + Custom CSS-Variablen (dynamisches Theme)
- **State Management:** Zustand 5.0.0 mit `persist` Middleware
- **Validierung:** Zod 4.3.6 (Schema Firewall)
- **PWA:** vite-plugin-pwa + workbox-window
- **Sprache:** JavaScript (JSX)
- **Runtime:** Browser (ES Modules) + Relay API (Express/Node.js, optional)
- **Persistenz:** localStorage API (Fallback) + Server-Sync via Relay API (v2.0)

### Architektur-Übersicht

```
┌──────────────────────────────────────────────────────────────────┐
│                         App.jsx                                   │
│                     (ThemeProvider Wrapper)                        │
├──────────────────────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────────────────────────┐  │
│  │                    useGameState.js                          │  │
│  │              (Facade / Orchestrator Hook)                    │  │
│  │  ┌────────────────┐ ┌───────────────┐ ┌──────────────────┐ │  │
│  │  │ usePlayerStore  │ │useSkillStore  │ │  useWorldStore   │ │  │
│  │  │  (persist)      │ │  (persist)    │ │  (persist)       │ │  │
│  │  │ localStorage:   │ │ localStorage: │ │ localStorage:    │ │  │
│  │  │ 'player-store'  │ │ 'skill-store' │ │ 'world-store'    │ │  │
│  │  │                 │ │               │ │ + worldState     │ │  │
│  │  │                 │ │               │ │ + Biome-Tracking │ │  │
│  │  │                 │ │               │ │ + Fog of War     │ │  │
│  │  └────────────────┘ └───────────────┘ └──────────────────┘ │  │
│  └────────────────────────────────────────────────────────────┘  │
├──────────────────────────────────────────────────────────────────┤
│  External Config: /data/*.json (via Schema Firewall validiert)    │
│    ├── /data/bosses.json                                          │
│    ├── /data/attacks.json                                         │
│    ├── /data/quests.json                                          │
│    ├── /data/map.json                                             │
│    ├── /data/theme.json                                           │
│    └── /data/assets/          ← KI-generierte Bilder (lazy)       │
├──────────────────────────────────────────────────────────────────┤
│  Utils:                                                           │
│    ├── schemas.js          (Zod Schema + fetchGameData)           │
│    ├── backupManager.js    (Serialize/Download/Restore)           │
│    └── mapGenerator.js     (Prozedurale Hex-Map)                  │
├──────────────────────────────────────────────────────────────────┤
│  Engines:                                                         │
│    ├── audioEngine.js      (Web Audio API Synth)                  │
│    └── particleEngine.js   (Canvas Partikel, Theme-reactiv)       │
├──────────────────────────────────────────────────────────────────┤
│  NEU (v2.0) — Evolving World Components:                          │
│    ├── FallbackImage.jsx   (Robuste Asset-Lade-Logik)             │
│    └── biomes.json         (5 Biome mit Boss-Pools)               │
├──────────────────────────────────────────────────────────────────┤
│  Relay API (relay-api/) — Optionaler Express-Server:              │
│    ├── POST /api/ai/deploy      — KI-Deploy (Dify)               │
│    ├── POST /api/ai/generate_tile — Generative Map               │
│    ├── POST /api/ai/evolve      — Biome-Evolution                │
│    ├── POST /api/ai/save-state  — Single Save State              │
│    ├── GET  /api/ai/load-state  — Load Game State                │
│    └── POST /api/ai/restore_backup — Rollback                    │
└──────────────────────────────────────────────────────────────────┘
```

### Komponenten-Hierarchie

```
<ThemeProvider>
  └─ <AppContent>
      └─ <Layout>
          ├─ <Header>
          │  └─ XP-Bar, Ressourcen, Dev-Toggle, Log-Button, Backup
          ├─ <Navigation>
          │  └─ Tabs: Skillbaum | Quests | Kämpfe | Karte | Architect
          └─ {activeTab content}
              ├─ "tree"     → <SkillTree>
              ├─ "quests"   → <Quests>
              ├─ "battle"   → <BattleArena>
              ├─ "map"      → <WorldMap>
              └─ "architect"→ <ArchitectTerminal>

      {devMode && <DevToolsPanel>}
      {showLog && <ActivityLogView>}
```

### Data Flow

```
User Action (z.B. Quest abschließen)
  ↓
Component Event Handler
  ↓
Facade-Methode in useGameState (z.B. handleQuestComplete)
  ↓
Zustand Store Action (usePlayerStore.complainQuestComplete)
  ↓
  ├─ usePlayerStore: Ressourcen updaten (MP, Gold, Mana)
  ├─ usePlayerStore: addXp() → Level-Up-Check
  └─ useWorldStore: POI-Boni recalculieren
  ↓
Zustand persistiert automatisch nach localStorage
  ↓
Components re-render mit neuem State
  ↓
Toast + Audio + Log-Eintrag
```

---

## 💾 STATE MANAGEMENT: ZUSTAND STORES

### usePlayerStore (`player-store`)

**Persistierte Felder:**
```js
{
  level: 1,
  xp: 0,
  skillPoints: 0,
  movementPoints: 0,
  gold: 0,
  mana: 0,
  customQuests: [],         // User-erstelle Quests
  log: [],                  // Aktivitätsprotokoll (max 100)
  poiBonuses: { manaRegen: 0, goldRegen: 0, moveRegen: 0 },
  toast: null,              // { msg, type } transient
  day: new Date().toLocaleDateString(),
}
```

**Wichtige Actions:**
- `addXp(amount)` → XP addieren, Level-Up-Check, +150 SP pro Level
- `addCustomQuest(name, path, xp, description)` → Neue Custom Quest
- `deleteCustomQuest(questId)` → Quest löschen
- `complainQuestComplete(quest, poiBonuses)` → Quest-Belohnungen + POI-Bonus
- `claimTat(questId)` → Quest als erledigt markieren
- `devSetLevel(level)`, `devSetResources(res)`, `devAddXp(amount)`
- `devResetAll()` → Kompletter Reset
- `showToast(msg, type)` → Toast anzeigen (3s Auto-Dismiss)
- `addLogEntry(type, message)` → Log-Eintrag (max 100, FIFO)
- `setPoiBonuses(bonuses)` → POI-Boni setzen

### useSkillStore (`skill-store`)

**Persistierte Felder:**
```js
{
  skills: [...],  // Flattened Array aller Skills aus SKILL_TREE_DATA
}
```

**Skill-Objekt Struktur:**
```js
{
  id: "soc_ethik_didaktik",
  path: "socratic",
  tier: 1,
  name: "Ethische Grund-Didaktik",
  desc: "Die Basis-Lehrbefähigung...",
  icon: "scroll",
  cost: 50,
  unlocked: false,
  req: ["soc_master_of_arts"],
  isCustom: false,
}
```

**Wichtige Actions:**
- `unlockSkill(skillId)` → Skill freischalten (Audio + Return true/false)
- `addCustomSkill(path, tier, skillData)` → Custom Skill erstellen
- `migrateLegacySkills(oldSkills)` → Legacy-Daten migrieren
- `devUnlockAllSkills()` → Alle freischalten
- `devResetSkills()` → Skills auf Default zurücksetzen
- `getSkillById(skillId)`, `isSkillAvailable(skill)`

### useWorldStore (`world-store`)

**Persistierte Felder:**
```js
{
  // ═══ NEU (v2.0): worldState für Biome-Tracking ═══
  worldState: {
    currentBiome: 'default',
    discoveredTileCount: 1,
    totalTiles: 61,
    biomeTransitionCount: 0,
    lastBiomeTriggerCoords: null,
    serverSynced: false,
    lastSaveTimestamp: null,
  },
  
  mapData: { tiles: [...], playerPosition: { q, r } },
  currentBoss: BossObject,
  bossHp: number,
  playerShield: 0,
  shieldTurnsLeft: 0,
  combatLog: [],          // Max 50 Einträge
  damageEvents: [],
  lastDamageAmount: 0,
  lastDamageType: '',
  defeatedBosses: [],
}
```

**Wichtige Actions:**
- `recalcPoiBonuses()` → Boni aus entdeckten Tiles berechnen
- `uncoverTile(tileIndex, playerMp)` → Tile aufdecken (kostet 10 MP, Fog of War Adjacency-Check)
- `checkBiomeTransition(tileIndex)` → Prüft ob Biom-Wechsel trigger
- `transitionBiome(newBiomeId, newMapData, newBosses)` → Wechselt zu neuem Biom
- `getCurrentBiome()` → Gibt aktuelles Biom-Info zurück
- `areHexAdjacent(a, b)` → Prüft Hex-Adjacency (für Fog of War)
- `updateWorldState(updates)` → worldState aktualisieren
- `loadWorldState(serverState)` → Externen Server-State laden
- `executeAttack(attack, bossHp, mana, gold)` → Angriff ausführen
- `applyShield(amount, duration)` → Schild setzen
- `clearDamageEvent()` → Damage-Event zurücksetzen (nach Animation)
- `defeatBoss()` → Boss besiegen, nächsten Boss wählen
- `defeatMapBoss(tileIndex)` → Map-Boss auf Tile besiegen
- `devDefeatBoss()`, `devRevealAllTiles()`, `devResetWorld()`

---

## 🎯 THE FIVE PATHS (5-pfadiges System)

### 🏗️ Der Architekt - System & Tech
**Ressourcen:** Movement Points (MP), Gold
**Focus:** Infrastructure, Automation, Code, Docker, Dify
**Endgame:** Fully autonomous intelligent systems
**Terminal:** Architect Terminal für KI-Kommunikation

### 📜 Der Sokratiker - Intellekt & Lehre
**Ressourcen:** Gold, Mana
**Focus:** Deep Reading, Didaktik, Ethik, Philosophie, Germanistik
**Endgame:** Veröffentlichte Bücher, didaktische Meisterschaft

### 🎵 Der Barde - Musik & Kreativität
**Ressourcen:** Mana
**Focus:** Ableton Live 12, Ambient, Lofi (yrrpheus/yolomeus)
**Endgame:** Komplettes künstlerisches Portfolio

### 🧘 Der Mönch - Geist & Fokus
**Ressourcen:** Mana
**Focus:** Zazen, Qi Gong, tibetische Visualisierung, mentale Resilienz
**Endgame:** Bodhicitta - Erleuchtete Klarheit

### 🤸 Der Akrobat - Körper & Flow
**Ressourcen:** Movement Points (MP)
**Focus:** Gym, Laufen, Jonglieren, Flow Arts
**Endgame:** Peak Physicality, Flow-Meisterschaft

---

## 🎮 GAME MECHANICS

### Resource System

| Ressource | Symbol | Generiert Von | Verwendung |
|-----------|--------|---------------|------------|
| **XP** | ⭐ | Quest-Abschluss, Boss-Defeat | Level-Progression |
| **Skill Points (SP)** | ⚡ | Level-Ups (+150/Level) | Skill-Freischaltung |
| **Gold** | 💛 | Sokratiker, Architekt | Angriffs-Kosten |
| **Mana** | 💙 | Barde, Mönch, andere | Magie/Fähigkeiten |
| **Movement Points (MP)** | 💚 | Akrobat, Architekt | Map-Erkundung |

### Level-Formel
```
XP Required = 100 × 1.5^(level - 1)
Level 1 → 100 XP
Level 2 → 150 XP
Level 3 → 225 XP
(exponentielles Wachstum)
```

### Quest Rewards (Basis pro Pfad)

| Pfad | MP | Gold | Mana |
|------|----|-----|------|
| Architekt | +10 | +0 | +5 |
| Sokratiker | +0 | +25 | +5 |
| Barde | +0 | +5 | +15 |
| Mönch | +0 | +0 | +20 |
| Akrobat | +15 | +0 | +0 |

### POI-Bonus-System (additiv zu Basis-Rewards)

| POI-Typ | Icon | Bonus |
|---------|------|-------|
| Kloster | 🏯 | +2 Mana/Quest |
| Akademie | 🎓 | +3 Gold/Quest |
| Gym | 💪 | +3 MP/Quest |
| Studio | 🎵 | +1 Mana & +1 Gold |
| Server-Farm | 🖥️ | +2 Gold & +1 MP |
| Nexus | 🌀 | +1 Alle Ressourcen |
| Wildnis | ⚔️ | Hinterhalt (Kampf!) |

### Skill Tree (5 × 4 Matrix)

Jeder Pfad hat 4 Tiers mit steigenden SP-Kosten:

| Tier | Name | SP-Kosten |
|------|------|-----------|
| 1 | Die Basis | 0-50 |
| 2 | Die aktuelle Schwelle | 100-120 |
| 3 | Der Quantensprung | 200-300 |
| 4 | Die Meisterschaft | 500-800 |

**Skill-Freischaltung:**
1. Prüfe: SP >= cost
2. Prüfe: Alle req-Skills sind freigeschaltet
3. Setze `skill.unlocked = true`
4. Ziehe SP ab
5. Audio + Toast + Log-Eintrag

### Combat System

**Boss-Properties:**
```js
{
  id: "boss_1",
  name: "Dämon der Prokrastination",
  title: "Optional",
  maxHp: 200,
  avatar: "👹",
  abilities: ["Prokrastination", "Selbstzweifel"],
  lore: "Beschreibung...",
  rewards: { xp: 50, gold: 0, mana: 0 },
}
```

**Angriffstypen:**

| Typ | Multiplikator | Visuell | Benötigt Skill |
|-----|--------------|---------|----------------|
| attack | 1.0× | Rot, Shake | Nein |
| crit | 2.5× | Gelb, Crit-Flash | Ja |
| shield | 0 (Schild) | Blau, Shield-Glow | Ja |

**Combat Flow:**
1. Resource-Check (Mana >= cost && Gold >= cost)
2. Schaden berechnen (Crit = ×2.5)
3. Boss-HP aktualisieren
4. Floating Damage Number + Boss-Animation
5. Combat-Log-Eintrag
6. Boss-Defeat-Check → +50 XP, neuer Boss, Auto-Backup

### World Map System (v2.0)

**Hex-Koordinaten:** Axiales System (q, r), Pointy-Top
**Map-Generierung:** `generateMap(radius = 4)` → ~61 Tiles

**Fog of War (NEU):**
- Nur das Start-Tile (Nexus, q=0, r=0) ist zu Beginn entdeckt
- Alle anderen Tiles zeigen "?" und MP-Kosten
- **Adjacency-Regel:** Nur Tiles neben entdeckten können aufgedeckt werden
- Aufdecken kostet **10 MP**
- newly revealed Tiles haben `animate-tile-reveal` Animation

**Generative Map Expansion:**
```
Edge-Tile entdeckt
  → Webhook POST /api/ai/generate_tile
  → Body: { action: 'generate_tile', coords: [q, r], current_biome }
  → Tile wird als "generating: true" markiert (⚙️ KI...)
  → KI generiert benachbarte Tiles
```

**Biome-Evolution (NEU):**
```
Spieler entdeckt N Tiles (Schwellenwert erreicht)
  → checkBiomeTransition(tileIndex)
  → handleBiomeEvolution() wählt zufälliges neues Biom
  → POST /api/ai/evolve (target_biome, current_biome, coords, level)
  → Dify generiert neues theme.json + bosses.json
  → window.dispatchEvent('rls-theme-reload')
  → ThemeProvider lädt Theme neu, loadGameConfig() lädt Bosse
  → Welt hat neues visuelles Theme + neue Boss-Gegner
```

**Server-Sync (NEU):**
- Nach jeder Tile-Entdeckung: `saveStateToServer()` (fire-and-forget)
- Beim App-Start: `loadStateFromServer()` → wendet Server-State an
- Fallback auf localStorage wenn Server nicht erreichbar
- WorldMap zeigt ☁️-Icon wenn mit Server synchronisiert

---

## 🔧 ARCHITECT TERMINAL

### Überblick
Der Architect Terminal ist das Command Center für die Kommunikation mit dem KI-Entwickler. Ersetzt das bisherige passive System durch eine aktive Befehls-Schnittstelle.

### Webhook-Kommunikation
- **Standard-URL:** `/api/ai/deploy`
- **Konfigurierbar:** `/config <neue_url>`
- **Payload:** `{ query, user: 'architect', timestamp }`
- **Erwartete Antwort:** `{ answer }` oder `{ output }`

### Befehle

| Befehl | Funktion |
|--------|----------|
| `Beliebiger Text` | Sendet Query an KI-Webhook |
| `/config <url>` | Setzt Webhook-URL neu |
| `/rollback` | Stellt Spielstand aus Backup wieder her |
| `/clear` | Löscht Terminal-Verlauf |

### Persistenz
- Verlauf → `localStorage: architect_terminal_history`
- Webhook-URL → `localStorage: dify_webhook_url`

---

## 🛡️ SCHEMA FIREWALL (Zod Validierung)

### Prinzip
**NIEMALS** ungeprüfte externe Daten in den State lassen. Jedes `/data/*.json` wird gegen ein Zod-Schema validiert. Bei Fehlschlag → Fallback auf lokale gebündelte Daten.

### fetchGameData(endpoint, schema, fallbackData, label)

```js
const result = await fetchGameData('/data/bosses.json', BossArraySchema, BUNDLED_BOSSES, 'Bosses');

// Result:
{
  data: [...],           // Validierte Daten
  fromFallback: false,   // true wenn Fallback genutzt
  fallbackInvalid: false // true wenn sogar Fallback invalid
}
```

### Schema-Definitionen

**BossSchema:** `id, name, title?, maxHp, minHp?, avatar?, abilities?, lore?, rewards?`
**MapTileSchema:** `q, r, type, discovered, mapBoss?, adjacentToDiscovered?, generating?`
**AttackSchema:** `id, name, dmg, type, cost{mana, gold}, requiresSkill?, shield?, shieldDuration?, desc`
**QuestSchema:** `id, name, path(enum), xp, description?, tier?, tags?, prerequisites?`
**ThemeSchema:** Alle CSS-Variablen + Partikeleigenschaften
**SkillTreeSchema:** `record<pathId, SkillPathSchema{tiers{basis, schwelle, quantensprung, meisterschaft}}`

---

## 💾 BACKUP MANAGER

### Speicherung

LocalStorage-Keys der 3 Stores:
- `player-store` → Zustand-persistiertes Player-Objekt
- `skill-store` → Zustand-persistiertes Skill-Objekt
- `world-store` → Zustand-persistiertes World-Objekt
- `dev_mode` → Boolean-String

### Funktionen

**serializeUserState()**
```js
{
  _meta: { exportedAt, version: '1.0.0', description },
  'player-store': {...},
  'skill-store': {...},
  'world-store': {...},
  'dev_mode': 'true'/'false',
}
```

**downloadBackup(filename?)**
- Erzeugt JSON-Blob
- Trigger Browser-Download
- Default-Name: `savegame_YYYY-MM-DD.json`

**restoreFromBackup(stateData)**
- Schreibt alle Keys zurück in localStorage
- Return: `{ restored: string[], errors: string[] }`

**autoBackup(triggerDownload?)**
- Speichert Snapshot in `localStorage: autosave_backup`
- Optional: Trigger Download
- Wird automatisch nach Boss-Defeat aufgerufen

---

## 🎨 DYNAMISCHES THEME-SYSTEM

### ThemeProvider
Lädt Theme von `/data/theme.json` mit Zod-Validierung. Injiziert CSS-Variablen in `:root`.

### CSS-Variablen (injected)

```css
/* Core UI */
--bg-primary, --bg-secondary, --bg-tertiary
--text-primary, --text-secondary, --text-muted
--border-primary, --border-secondary

/* Path Colors */
--path-architect, --path-socratic, --path-bard, --path-monk, --path-acrobat

/* Accents */
--accent-primary, --accent-secondary

/* Resources */
--resource-xp, --resource-sp, --resource-mp, --resource-gold, --resource-mana

/* Particles */
--particle-hue-min, --particle-hue-max
--particle-saturation, --particle-lightness
--particle-count, --particle-opacity
```

### Verwendung in Komponenten
```jsx
style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
className="border-[color:var(--border-primary)]"
```

### Fallback-Kette
1. Versuche `/data/theme.json` zu fetchen
2. Validiere gegen ThemeSchema
3. Bei Fehler → Default-Theme (in ThemeProvider hardcoded)
4. `fromFallback` Flag für UI-Warnung verfügbar

---

## 🔊 AUDIO ENGINE

Web Audio API Synthesizer mit LFO-Modulation:

```js
playHitSound()      // [65.41, 130.81] Hz Triangle → Combat Hit
playLevelUpSound()  // [261.63, 329.63, 392, 493.88] Hz Sine → Level Up
playUnlockSound()   // [440, 659.25] Hz Sine → Skill Unlock
```

**Features:**
- LFO auf Detune (0.1-2 Hz, zufällig)
- Exponential Envelope (Attack 20% → Decay)
- Master Gain (0.15 Peak)
- Lazy Init (AudioContext erst bei erstem Sound)

---

## 🎨 PARTIKEL-HINTERGRUND

Canvas-basiert, liest Konfiguration aus CSS-Variablen:

```js
getParticleConfig() → {
  hueMin: 200, hueMax: 300,  // Blau-Violett Bereich
  saturation: 50, lightness: 60,
  count: 70, opacity: 0.4
}
```

70 Partikel, 60 FPS, wrappen an Canvas-Rändern.

---

## 📊 AKTIVITÄTS-LOGGING

### Log-Einträge

```js
{
  timestamp: "2026-04-13T14:27:00.000Z",
  time: "14:27:00",
  type: "QUEST" | "CLAIM" | "COMBAT" | "SKILL" | "MAP" | "BOSS" | "LEVEL" | "SYSTEM",
  message: "Menschenlesbare Beschreibung"
}
```

### Log-Typen

| Typ | Emoji | Beispiel |
|-----|-------|----------|
| QUEST | 📜 | `Quest: "45 Min. Ableton" | +40 XP, +0 MP, +0 Gold, +40 Mana` |
| CLAIM | ✍️ | `Quest claimed and completed` |
| COMBAT | ⚔️ | `808-Donner vs Prokrastination: 80 Schaden` |
| SKILL | 🧠 | `Skill 'Qi Gong Heilung' freigeschaltet für 30 SP` |
| MAP | 🗺️ | `Tile [q=-1,r=2] enthüllt: Akademie` |
| BOSS | 💀 | `Boss besiegt: Die Hydra der unkorrigierten Klausuren` |
| LEVEL | ⬆️ | `Level Up! Jetzt Level 5. +150 SP.` |
| SYSTEM | ⚙️ | `Bosses: External fetch failed. Using fallback.` |

- Max 100 Einträge (FIFO)
- Export als JSON via ActivityLogView
- Filterbar nach Typ

---

## 🔒 GAME LOCK

```js
const GAME_LOCK_DATE = "2026-05-01T00:00:00";
```
- Blockiert Spiel bis Startdatum
- Dev-Mode umgeht Lock vollständig
- UI: Overlay mit "🔒 Spiel Gesperrt"

---

## 🗺️ DATENQUELLEN & EXTERNE KONFIG

### Externe JSON-Dateien (validiert via Schema Firewall)

| Datei | Pfad | Schema | Fallback |
|-------|------|--------|----------|
| Bosses | `/data/bosses.json` | BossArraySchema | `src/data/bosses.json` |
| Attacks | `/data/attacks.json` | AttackArraySchema | `src/data/attacks.json` |
| Quests | `/data/quests.json` | QuestArraySchema | `src/data/quests.json` |
| Map | `/data/map.json` | MapDataSchema | `src/data/map.json` |
| Theme | `/data/theme.json` | ThemeSchema | Hardcoded Default |
| **Biome** | `src/data/biomes.json` | — | **NEU (v2.0)** |
| **Save State** | `/data/save-state.json` | — | **NEU (v2.0)** |

### Konfig-Reload
- Automatisch beim App-Start (plus Server-State-Load)
- Manuell: `reloadGameConfig()` via Header-Button
- Theme-Reload: `window.dispatchEvent('rls-theme-reload')`
- Merge-Logik: Behält entdeckte Tiles, aktualisiert Typen/Bosse

### Asset-Verzeichnis (`/data/assets/`)
- **Anfangs leer** — KI generiert Bilder asynchron im Hintergrund
- **FallbackImage** Komponente zeigt Loading-Glitch bis Bild verfügbar ist
- **Polling:** Alle 3s Retry für bis zu 3 Minuten
- **Pfade in JSON:** `/data/assets/1712345678.png` (relativ)

---

## 📝 MIGRATION (Legacy → Zustand)

### Automatische Migration beim ersten Start

```js
// Aus alt: localStorage 'tim_life_rpg'
// Nach neu: player-store, skill-store, world-store

// Player-Daten: direkt gemappt
legacy.level → player-store.level
legacy.xp → player-store.xp
// ...

// Skills: via LEGACY_SKILL_MAP remapped
old 'arc_1' → new 'arc_server'
old 'soc_3' → new 'soc_germanistik'
// ...

// World-Daten: direkt gemappt
legacy.mapData → world-store.mapData
legacy.currentBoss → world-store.currentBoss
// ...
```

Migrations-Flag: `localStorage['_rls_migration_done'] = '1'`

---

## 🚀 BUILD & DEPLOYMENT

### Commands
```bash
npm install          # Dependencies installieren
npm run dev          # Vite Dev Server (HMR)
npm run build        # Production Build → dist/
npm run preview      # Vite Preview Server
npm run lint         # ESLint prüfen
```

### Deployment-Ziele
- Statische Hosting-Plattformen (Netlify, Vercel, GitHub Pages)
- Beliebiger HTTP-Server (keine Server-seitige Logik)
- Electron (Desktop-App)

### Umgebungsvariablen
- **Keine** erforderlich
- **Kein** Backend nötig
- Vollständig Client-seitig

### Webhook-Integrationen (optional)
- `/api/ai/deploy` → Architect Terminal (KI-Deploy)
- `/api/ai/generate` → Generative Map Expansion
- `/api/ai/restore_backup` → Rollback aus Terminal

---

## 🔧 ERWEITERUNGSANLEITUNG

### Neuen Skill hinzufügen
1. Eintrag in `SKILL_TREE_DATA.js` im richtigen Pfad/Tier
2. `id`, `name`, `desc`, `icon`, `cost`, `req` definieren
3. `flattenSkills()` generiert automatisch flaches Array
4. Falls neuer Angriff benötigt wird: `attacks.json` ergänzen

### Neuen Angriff hinzufügen
1. Eintrag in `attacks.json`: `id, name, dmg, type, cost{mana, gold}, requiresSkill?, desc`
2. Typ: `attack`, `crit`, oder `shield`
3. Bei `type: crit` → automatisch 2.5× Schaden
4. Bei `type: shield` → `shield` und `shieldDuration` angeben

### Neuen POI-Typ hinzufügen
1. In `POI_TABLE` (useWorldStore) mit Bonus-Konfiguration
2. In `map.json` als Tile-Typ verwenden
3. In WorldMap.jsx Icon + styling hinzufügen

### Neue Attack-Animation hinzufügen
1. CSS `@keyframes` in `index.css` definieren
2. Klasse in BattleArena.jsx basierend auf `lastDamageType` setzen
3. Float-Damage-Number anpassen

### Externe Datenquelle hinzufügen
1. Zod-Schema in `schemas.js` definieren
2. `fetchGameData()` mit Schema + Fallback aufrufen
3. In `loadGameConfig()` einbinden
4. GameState-Objekt in useGameState erweitern

---

## 🎯 USE CASES & WORKFLOWS

### Täglicher Workflow
```
1. App öffnen (State lädt aus localStorage)
2. Verfügbare Quests prüfen
3. Reale Aufgabe erledigen (30-60 Min)
4. Quest als abgeschlossen markieren
5. Ressourcen-Anstieg + Level-Fortschritt sehen
6. Optional: Neuen Skill freischalten
7. Optional: Map erkunden (Tiles aufdecken)
8. Optional: Boss-Kampf
9. Schließen (Auto-Save)
```

### Architect Terminal Workflow
```
1. Architect-Tab öffnen
2. Prompt eingeben (z.B. "Erstelle neue Quest für Dify-Training")
3. Strg+Enter → an KI senden
4. Antwort erscheint im Terminal
5. Bei Problemen: /rollback für Restore
6. /config <url> für andere KI-Endpunkte
```

### Backup / Restore Workflow
```
Export:
  → Header → Backup-Button → Download JSON

Import:
  → Restore aus JSON-Datei (wird noch implementiert)
  → Oder: /rollback im Architect Terminal

Auto-Backup:
  → Nach jedem Boss-Defeat automatisch
  → Gespeichert in localStorage: autosave_backup
```

---

## 📐 CODE KONVENTIONEN

### Naming
- Komponenten: PascalCase (`BattleArena`, `SkillTree`)
- Hooks: camelCase mit `use` Prefix (`useGameState`)
- Stores: camelCase mit `use` Prefix (`usePlayerStore`)
- Utils: camelCase (`fetchGameData`, `autoBackup`)
- Konstanten: UPPER_SNAKE_CASE (`GAME_LOCK_DATE`, `POI_TABLE`)

### Struktur
- Komponenten in `src/components/`
- Stores in `src/stores/`
- Hooks in `src/hooks/`
- Daten in `src/data/`
- Utilities in `src/utils/`
- Engines in `src/engine/`

### Styling
- TailwindCSS mit `@import "tailwindcss"`
- Dynamische Theme-Farben via CSS-Variablen
- Custom Scrollbar (`.custom-scrollbar`)
- Animationen in `@layer components`

---

## 🌐 INTERNATIONALISIERUNG

**Aktuelle Sprache:** Deutsch (Deutsch)

Alle UI-Texte, Quest-Namen, Skill-Beschreibungen in Deutsch.

**Beispiele:**
- Button: "Freischalten" (Unlock)
- Toast: "Nicht genug Ressourcen!"
- Label: "Bewegungspunkte"
- Tab: "Kämpfe"

---

## 📞 BEKANNTE LIMITATIONEN

### Aktuell
- Single-Player nur (kein Multiplayer/Sharing)
- Kein Cloud-Sync (nur localStorage + optionaler Relay-Server)
- Kein echtes Backend für Seasons/Events
- Keine Social Features
- Restore-UI für Backup-Import noch nicht implementiert
- Biome-Evolution erfordert konfigurierten Dify-API-Key auf Relay-Server
- Server-Sync ist fire-and-forget (keine Queue/Retry bei Offline)

### Behoben (v2.0) ✅
- ~~Map verändert sich nicht dynamisch~~ → Generative Map Expansion aktiv
- ~~Statische Welt~~ → Biome-System mit prozeduraler Evolution
- ~~Kein Asset-Support~~ → FallbackImage mit Loading-Glitch + Polling
- ~~Kein Server-Sync~~ → save-state / load-state Endpunkte

### Geplante Erweiterungen
- Cloud-Save-Synchronisation
- Prozedurale Boss-Namen/Persönlichkeiten
- Skill-Interaktionen (Combos)
- Cosmetic Skins/Themes
- Bestenlisten
- Achievement-System
- Mod-Support
- Vollständiges Restore-UI
- Offline-Queue für Server-Sync

---

## 🎓 PÄDAGOGISCHE WERTE

Das System verkörpert:

- **Selbstgesteuertes Lernen:** Eigener Fortschritt, eigenes Tempo
- **Multidisziplinäre Entwicklung:** 5 distinkte Skill-Kategorien
- **Metakognition:** Logging + Reflexion der Anstrengungsverteilung
- **Gamification-Theorie:** Intrinsische Motivation durch Progression
- **Holistisches Wachstum:** Geist, Körper, Intellekt, Kreativität
- **Resilienz-Aufbau:** Boss = Lebensherausforderung = Wachstumschance
- **Ressourcenmanagement:** Strategische Allokation endlicher Ressourcen
- **Langzeit-Vision:** Endgame-Ziele motivieren zu nachhaltigem Einsatz

---

## 🔗 INTEGRATIONSPUNKTE

### Mit anderen KI-Systemen
- **Query:** Aktueller Spielstand via JSON-Export verfügbar
- **State-Reset:** Vollständiges Wipe verfügbar zum Testen
- **Log-Analyse:** Aktivitätsprotokolle exportierbar für AI-Coaching
- **Curriculum-Sync:** Quest-Namen können mit echtem Kurswork abgeglichen werden

### Mit Backend-Diensten (Zukunft)
- API-Endpunkt zum Validen protokollierter Aktivitäten
- Cloud-Save in persistente Datenbank
- Discord/Slack-Integration für Erinnerungen
- Kalender-Sync für geplante Quests
- Analytics-Dashboard

---

## 📦 SHARING DIESES DOKUMENTS

### Für LLMs/Chat-Systeme
- Dieses gesamte Dokument als Context laden
- Follow-up-Fragen zu spezifischen Komponenten stellen
- Code-Generierung für neue Features anfordern
- Architektonisches Feedback einholen
- Gameplay-Balance analysieren lassen

### Für menschliche Entwickler
- Mit PROJECT SUMMARY + THE FIVE PATHS beginnen
- GAME MECHANICS für Feature-Überblick prüfen
- TECHNISCHE ARCHITEKTUR für Code-Struktur studieren
- ERWEITERUNGSANLEITUNG für neue Features nutzen

### Für Spieler/Nutzer
- THE FIVE PATHS lesen um das System zu verstehen
- GAME MECHANICS Workflows durchgehen
- ACTIVITY LOGGING prüfen um Fortschritt zu verstehen
- ARCHITECT TERMINAL für KI-Kommunikation nutzen

---

## 🏁 FAZIT

**RealLifeOS** ist ein sorgfältig designed System zur Ermöglichung von **gleichzeitigem Aufblühen** über 5 Lebensdimensionen durch gamifizierte Progression, strategisches Ressourcenmanagement und persistente Zustandsspeicherung.

Die Architektur ist sauber, erweiterbar und komplett für Browser-Deployment ohne Backend-Abhängigkeiten gebaut. Alle Mechaniken verstärken die Kernphilosophie: Echte Disziplin → Digitale Belohnung → Intrinsische Motivation → Nachhaltiges Wachstum.

**Mission:** Tägliche Praxis in ein lebendiges, evolvierendes RPG verwandeln, in dem Schüler/Lehrer/Lebenslang-Lernende ihr multidimensionales Wachstum visualisieren, verfolgen und feiern können.

---

**Dokument Version:** 2.0
**Aktualisiert:** Montag, 13. April 2026
**Für:** Externe KI-Systeme & Collaborators
**Lizenz:** Privat (Tim's System)
