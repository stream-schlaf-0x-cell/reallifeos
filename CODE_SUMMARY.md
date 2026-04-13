# RealLifeOS - Code Zusammenfassung

Generiert am: Montag, 13. April 2026
**Letztes Update:** Immersive 3D World v3.1 – InstancedMesh, Simplex Noise, Post-Processing

## 📁 Verzeichnisstruktur

```
.
├── CODE_SUMMARY.md
├── COMPLETE_AI_HANDOVER.md
├── IMPLEMENTATION_PLAN.md
├── README.md
├── ZUSTAND_MIGRATION_README.md
├── eslint.config.js
├── index.html
├── package-lock.json
├── package.json
├── vite.config.js
├── Dockerfile                      # NEU: Container-Definition
├── relay-api/                      # NEU: Express Relay Server
│   ├── server.js                   #   API-Endpunkte (deploy, evolve, save-state, ...)
│   ├── utils.js                    #   Image-Pipeline, File-IO, Dify-Parsing
│   └── data/                       #   Shared Volume (wird per Docker gemountet)
│       ├── assets/                 #   KI-generierte Bilder
│       ├── save-state.json         #   Single Save State
│       ├── theme.json              #   Dynamisches Theme
│       └── bosses.json             #   Biom-spezifische Bosse
├── public/
│   ├── favicon.svg
│   ├── icons.svg
│   └── data/                       # Statische Fallback-Daten
│       ├── bosses.json
│       ├── attacks.json
│       ├── quests.json
│       ├── map.json
│       └── theme.json
├── src/
│   ├── App.jsx
│   ├── main.jsx
│   ├── index.css                   # + Glitch-Animationen
│   ├── components/
│   │   ├── ActivityLogView.jsx
│   │   ├── AddQuestModal.jsx
│   │   ├── ArchitectTerminal.jsx   # KI-Deploy Terminal
│   │   ├── BattleArena.jsx         # + FallbackImage für Boss-Avatar
│   │   ├── DevToolsPanel.jsx
│   │   ├── FallbackImage.jsx       # NEU: Robuste Bild-Komponente mit Loading-Glitch
│   │   ├── Header.jsx
│   │   ├── Icon.jsx
│   │   ├── Layout.jsx
│   │   ├── Navigation.jsx
│   │   ├── Quests.jsx
│   │   ├── SkillTree.jsx
│   │   ├── ThemeProvider.jsx       # + Biome-Reload via Custom Event
│   │   └── WorldMap.jsx            # + Fog of War, Biome-Indicator, Server-Sync
│   ├── data/
│   │   ├── attacks.json
│   │   ├── bosses.json
│   │   ├── biomes.json             # NEU: 5 Biome mit Boss-Pools & Trigger-Schwellen
│   │   ├── constants.js
│   │   ├── map.json
│   │   ├── quests.json
│   │   ├── skillTreeData.js
│   │   └── skills.json
│   ├── engine/
│   │   ├── audioEngine.js
│   │   └── particleEngine.js
│   ├── hooks/
│   │   ├── useCoreGameState.js
│   │   └── useGameState.js         # + Server-Sync, Biome-Evolution, Persistence
│   ├── stores/
│   │   ├── usePlayerStore.js       # Level, XP, Ressourcen, Quests
│   │   ├── useSkillStore.js        # Skill-Tree, Freischaltungen
│   │   └── useWorldStore.js        # + worldState, Biome-Tracking, Fog of War
│   └── utils/
│       ├── backupManager.js        # Backup/Restore System
│       ├── mapGenerator.js         # Prozedurale Hex-Map
│       └── schemas.js              # Zod Schema Firewall
└── dist/                           # Build-Output (generiert)
```

## ⚙️ Konfigurationsdateien

### package.json
```json
{
  "name": "temp",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint .",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^19.2.4",
    "react-dom": "^19.2.4",
    "three": "*",
    "@react-three/fiber": "*",
    "@react-three/drei": "*",
    "@react-three/postprocessing": "*",
    "simplex-noise": "*",
    "maath": "*",
    "vite-plugin-pwa": "^1.2.0",
    "workbox-window": "^7.4.0",
    "zod": "^4.3.6",
    "zustand": "^5.0.0"
  },
  "devDependencies": {
    "@eslint/js": "^9.39.4",
    "@tailwindcss/vite": "^4.2.2",
    "@types/react": "^19.2.14",
    "@types/react-dom": "^19.2.3",
    "@vitejs/plugin-react": "^6.0.1",
    "autoprefixer": "^10.4.27",
    "eslint": "^9.39.4",
    "eslint-plugin-react-hooks": "^7.0.1",
    "eslint-plugin-react-refresh": "^0.5.2",
    "globals": "^17.4.0",
    "postcss": "^8.5.9",
    "tailwindcss": "^4.2.2",
    "vite": "^8.0.4"
  }
}
```

### vite.config.js
```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
```

### eslint.config.js
```js
import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: { ecmaVersion: 'latest', ecmaFeatures: { jsx: true }, sourceType: 'module' },
    },
    rules: { 'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }] },
  },
])
```

---

## 🏗️ ARCHITEKTUR-ÜBERBLICK

### State Management: Zustand (3 Stores + Facade)

Das Projekt wurde von einem monolithischen `useGameState` Hook auf **Zustand** mit persistierten Stores migriert:

```
┌─────────────────────────────────────────────────────┐
│                  useGameState.js                     │
│              (Facade / Orchestrator)                 │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ │
│  │ usePlayerStore│ │ useSkillStore│ │  useWorldStore│ │
│  │  (persist)    │ │  (persist)   │ │  (persist)    │ │
│  └──────────────┘ └──────────────┘ └──────────────┘ │
└─────────────────────────────────────────────────────┘
```

**Store-Zuständigkeiten:**

| Store | Persistiert | Verwaltet |
|-------|-------------|-----------|
| **usePlayerStore** | `player-store` | Level, XP, SP, MP, Gold, Mana, Custom Quests, Log, POI-Boni, Toast |
| **useSkillStore** | `skill-store` | Skills (flattened), Freischaltungen, Custom Skills |
| **useWorldStore** | `world-store` | Map-Tiles, Boss HP, Shield, Combat-Log, Defeated Bosses, **Infinite Map (`addRingToMap`)** |

### Neue Hooks (v3.0)

| Hook | Zweck |
|------|-------|
| **useHexGrid.js** | Axiale `(q,r)` → kartesische `(x,y,z)` Konversion, prozedurale Höhenberechnung |
| **useBiomeColors.js** | Liest Theme-Farben aus CSS-Variablen, konvertiert zu Three.js RGB |
| **useInfiniteMap.js** | Überwacht Spielerposition, generiert automatisch neue Hex-Ringe am Kartenrand |

### Migration von Legacy-Daten

Beim ersten App-Start wird automatisch geprüft, ob alte `tim_life_rpg` Daten im localStorage existieren. Falls ja:
- Player-Daten → `usePlayerStore`
- Skills → `useSkillStore` (mit `LEGACY_SKILL_MAP` Mapping)
- World-Daten → `useWorldStore`
- Migrations-Flag `_rls_migration_done` verhindert Wiederholung

---

## 🧩 React Komponenten (src/components/)

### ThemeProvider.jsx — NEU: Dynamisches Theme-System
- Liest Theme von `/data/theme.json` via Schema-Validierung
- Injiziert CSS-Variablen in `:root` (z.B. `--bg-primary`, `--path-architect`)
- Fallback auf Default-Theme wenn Fetch fehlschlägt
- Konfigurierbar: Farben, Partikeleigenschaften (Hue, Count, Opacity)
- Verwendet `fetchGameData()` mit Zod-Validierung

```jsx
<ThemeProvider>
  <AppContent />
</ThemeProvider>
```

CSS-Variablen werden genutzt via: `bg-[color:var(--bg-primary)]`, `text-[color:var(--text-primary)]` etc.

### ArchitectTerminal.jsx — NEU: KI-Deploy Command Center
- Neuer Tab "Architect" in der Navigation
- Terminal-Interface für Kommunikation mit AI-Entwickler (Dify Webhook)
- Command-History mit Persistierung in localStorage
- Befehle:
  - **Normale Eingabe** → Sendet an Dify-Webhook (`/api/ai/deploy`)
  - `/config <url>` → Setzt Webhook-URL
  - `/rollback` → Stellt Backup wieder her (`/api/ai/restore_backup`)
  - `/clear` → Löscht Verlauf
- Tastenkürzel: `Strg+Enter` zum Senden
- Toast-Feedback für Erfolg/Fehler

### ActivityLogView.jsx
- Modal mit Protokoll-Einträgen (filterbar nach Typ)
- Typen: QUEST, CLAIM, COMBAT, SKILL, MAP, BOSS, LEVEL, SYSTEM
- Export als JSON-Datei
- 100 Einträge Maximallimit

### AddQuestModal.jsx
- Custom Quest erstellen: Name, Pfad, XP, Beschreibung
- Pfad-Auswahl mit Emoji + Farbcodierung
- XP-Vorauswahl (10, 20, 30, 50, 75, 100) + Freieingabe

### BattleArena.jsx
- Boss-Anzeige mit animiertem Avatar (Shake, Flash, Crit)
- Floating Damage Numbers
- Attack-Aktionen gruppiert nach Basis/Skill
- Resource-Validierung (Mana, Gold)
- Combat-Log mit den letzten 50 Einträgen

### DevToolsPanel.jsx
- RESET ALL, SET LEVEL, SET RESOURCES, ADD XP
- UNLOCK ALL SKILLS, REVEAL ALL TILES, DEFEAT BOSS
- Nur sichtbar wenn `devMode === true`

### Header.jsx, Navigation.jsx, Layout.jsx, Quests.jsx, SkillTree.jsx
- Bestehende Komponenten, aktualisiert für neues State-Management

---

## 🌍 3D World Komponenten (v3.1 — Instanced Mesh Architecture)

### InstancedHexGrid.jsx – Instanced Tile Renderer
- Nutzt drei `<Instances>` (intern InstancedMesh) für alle Hex-Tiles
- **Zwei InstancedMeshes:** Körper + Top-Fläche
- Reveal-Animation direkt über Instance-Matrizen in useFrame (kein React re-render)
- Raycasting pro Instance für Tile-Klicks
- O(1) Render-Kosten unabhängig von Tile-Anzahl

### InstancedDecor.jsx – Instanced Landschafts-Deko
- Pro Tile-Typ separate Instances: Bäume, Kristalle, Lotos, Bücher, Musiknoten
- Shared Geometries für minimale Memory-Nutzung

### TerrainNoise.js – Simplex Noise Heightmap
- Multi-Octave Simplex Noise (3 Octaven) für organische Hügel/Täler
- Deterministisch per Session-Seed + Mulberry32 PRNG
- Tile-Typ-spezifische Höhen-Modifier

### MapOrchestrator.jsx – Scene-Management + Post-Processing
- **Bloom** (intensity: 0.5) – selektiver Glow für emissive Materialien
- **TiltShift2** – Miniature/Diorama DOF-Effekt
- **GodRays** – Volumetrisches Licht von DirectionalLight
- **Vignette** – cinematographische Ränder
- 5-Light Setup + ContactShadows

### PlayerAvatar.jsx – Momentum-basierter Avatar
- Exponential Smoothing (`lerpFactor = 1 - Math.pow(0.05, dt)`) statt Teleportation
- Gleitet sanft zur Zielposition mit kontinuierlicher Hover-Animation

### FollowCamera.jsx – Smooth Kamera-Verfolgung
- Exponential Smoothing für Position + Quaternion-Slerp für LookAt
- Getrennte Lerp-Raten: Position (schneller) vs. LookAt (cinematischer)

### TileArtifact.jsx – KI-Bilder als Rune-Planes
- Zoom-Opacity: Distanz < 7 = 0%, 7-13 = linear, > 13 = 85%
- sRGBColorSpace + Anisotropy für scharfe Texturen

### AtmosphericDetails.jsx – Mikro-Partikel
- **AmbientDust:** 150 lila Partikel (AdditiveBlending, driftend)
- **FloatingSpores:** 60 goldene Partikel (aufsteigend)
- Deterministischer PRNG (React-purity compliance)

### WorldMap3D.jsx – Hauptkomponente
- Integriert alle oben genannten Komponenten
- Header mit Biome-Indicator, Server-Sync, Tile-Stats
- POI-Bonuses-Bar, Info-Overlay, ErrorBoundary

### HexShaderMaterial.js – Custom Shader (vorbereitet)
- Vertex/Fragment Shader mit instanceColor, instanceReveal Attributen
- Biome-Blending und Fog-of-War Animation via Shader

### ErrorBoundary.jsx, TileBillboard.jsx, TileDecorator.jsx
- Bestehende Komponenten, kompatibel mit Instanced Rendering

---

## 🛡️ Schema Firewall (src/utils/schemas.js) — NEU

Zod-basierte Validierung **aller** externen JSON-Daten. Verhindert UI-Crashes bei malformed data.

### Definierte Schemas
- **BossSchema** → `bosses.json`
- **MapTileSchema / MapDataSchema** → `map.json`
- **SkillNodeSchema / SkillPathSchema / SkillTreeSchema** → Skill-Tree
- **ThemeSchema** → `theme.json`
- **QuestSchema** → `quests.json`
- **AttackSchema** → `attacks.json`

### fetchGameData(endpoint, schema, fallbackData, label)
1. Fetch von externer URL
2. Zod-Validierung
3. Bei Fehler → Fallback auf gebündelte lokale Daten
4. Logging via `logValidationFailure()`

---

## 💾 Backup Manager (src/utils/backupManager.js) — NEU

### Funktionen
- **serializeUserState()** → Serialisiert alle 3 Zustand-Stores + dev_mode
- **downloadBackup(filename?)** → Trigger JSON-Download (`savegame_YYYY-MM-DD.json`)
- **restoreFromBackup(stateData)** → Stellt Zustand aus JSON-Objekt wieder her
- **autoBackup(triggerDownload?)** → Auto-Backup nach Boss-Defeat etc.
- **loadAutoBackup()** → Lädt letzten Auto-Save

localStorage Keys: `player-store`, `skill-store`, `world-store`, `dev_mode`

---

## 🎮 Game Mechanics

### Resource System

| Resource | Symbol | Generiert Von | Verwendung |
|----------|--------|---------------|------------|
| **XP** | ⭐ | Quest-Abschluss | Level-Progression |
| **Skill Points (SP)** | ⚡ | Level-Ups (+150/Level) | Skill-Freischaltung |
| **Gold** | 💛 | Sokratiker, Architekt | Angriffs-Kosten |
| **Mana** | 💙 | Barde, Mönch | Magie/Fähigkeiten |
| **Movement Points (MP)** | 💚 | Akrobat, Architekt | Map-Erkundung |

### Level-Formel
```
XP Required = 100 × 1.5^(level - 1)
Level 1 → 100 XP
Level 2 → 150 XP
Level 3 → 225 XP
```

### Skill Tree (5 × 4 Matrix)
Jeder der 5 Pfade hat 4 Tiers:
1. **Basis** (0-50 SP)
2. **Schwelle** (100-120 SP)
3. **Quantensprung** (200-300 SP)
4. **Meisterschaft** (500-800 SP)

### Quest Rewards (pro Pfad)

| Pfad | XP | MP | Gold | Mana |
|------|-----|----|-----|------|
| Architekt | Variabel | +10 | +0 | +5 |
| Sokratiker | Variabel | +0 | +25 | +5 |
| Barde | Variabel | +0 | +5 | +15 |
| Mönch | Variabel | +0 | +0 | +20 |
| Akrobat | Variabel | +15 | +0 | +0 |

### Combat System
- **Basic Attack** → Schaden nur (Kosten: 0-25 Mana)
- **Critical Hit** → 2.5× Schaden (benötigt Skill-Freischaltung)
- **Shield** → Blockt Schaden für N Turns (Kosten: Mana)
- Boss-Defeat → +50 XP Bonus, neuer Boss erscheint, Auto-Backup

### POI Map System
19-Hex Grid mit prozedural generierten POIs:
- 🏯 Kloster → +2 Mana/Quest
- 🎓 Akademie → +3 Gold/Quest
- 💪 Gym → +3 MP/Quest
- 🎵 Studio → +1 Mana & +1 Gold
- 🖥️ Server-Farm → +2 Gold & +1 MP
- ⚔️ Wildnis → Hinterhalt (Kampf)
- 🌀 Nexus → +1 Alle Ressourcen

### Generative Map Expansion
Beim Aufdecken von Edge-Tiles wird ein Webhook an die KI gesendet (`/api/ai/generate`) um benachbarte Tiles zu generieren.

---

## 🌍 EVOLVING WORLD SYSTEM (v2.0 — NEU)

### Fog of War & Prozedurale Map
- **Nur das Start-Tile (Nexus) ist zu Beginn sichtbar**
- Alle anderen Tiles liegen im Nebel (Fog of War) — angezeigt als "?"
- **Adjacency-Regel:** Nur Tiles neben bereits entdeckten können aufgedeckt werden
- **Kosten:** 10 MP pro Tile-Entdeckung
- **Generative Expansion:** Edge-Tiles triggern KI-Generierung neuer benachbarter Tiles

### Biome-System
Die Welt besteht aus 5 Biom-Typen, die sich beim Erkunden entfalten:

| Biom | Name | Trigger | Bonus |
|------|------|---------|-------|
| `default` | Nexus-Ebene | Start-Biom | +1 All |
| `crystal_caves` | Kristallhöhlen | 4 Tiles | +1 Mana/Quest |
| `iron_forge` | Eisenschmiede | 4 Tiles | +1 MP/Quest |
| `data_streams` | Datenströme | 4 Tiles | +1 Gold/Quest |
| `shadow_garden` | Schattengarten | 5 Tiles | +1 Mana & +1 Gold |

Jedes Biom hat:
- **Eigene Boss-Pools** (3 Bosse pro Biom, steigende HP)
- **Tile-Verteilung** (gewichtet nach Biom-Typ)
- **Trigger-Schwellenwert** (benötigte entdeckte Tiles)

### Biome-Evolution Flow
```
Spieler entdeckt N Tiles (Schwellenwert erreicht)
  → checkBiomeTransition() prüft Evolution
  → triggerBiomeEvolution() sendet POST /api/ai/evolve
  → Dify generiert neues theme.json + bosses.json
  → ThemeProvider lädt neues Theme (rls-theme-reload Event)
  → Welt verändert sich visuell und mechanisch
```

### Server-Sync & Single Save State
**Prinzip:** Frontend ist "stateless" — der Server ist die Source of Truth.

| Endpoint | Methode | Zweck |
|----------|---------|-------|
| `/api/ai/save-state` | POST | Speichert worldState + mapData + defeatedBosses |
| `/api/ai/load-state` | GET | Lädt Spielzustand (404 wenn keiner existiert) |
| `/api/ai/evolve` | POST | Trigger Biom-Evolution (Dify-Integration) |

**Beim App-Start:**
1. Frontend ruft `/api/ai/load-state` auf
2. Server-State wird angewendet (Map, Bosse, Biom)
3. Falls kein Server-State: Lokaler Zustand wird genutzt

**Bei jeder Änderung:**
- Tile-Entdeckung → `saveStateToServer()` (fire-and-forget)
- Boss-Defeat → Auto-Backup + Server-Sync

### FallbackImage — Robuste Asset-Lade-Logik
**Problem:** `/data/assets/` ist anfangs leer. Dify generiert Bilder asynchron im Hintergrund.

**Lösung:** `FallbackImage` Komponente mit 3 Zuständen:

1. **Loading** → Animierter "Loading-Glitch" Placeholder
   - Scanlines-Animation, pulsierendes Emoji, "Generiere..." Text
   - Fortschrittsbalken (Retry-Fortschritt)
2. **Polling** → Automatisches Retry alle 3s (max. 60 × = 3 Min)
   - Prüft ob Bild physisch im Ordner verfügbar ist
   - Cache-Bust via `?retry=timestamp`
3. **Error** → Stylischer Platzhalter mit Emoji
   - **Kein 404-Broken-Image** — App stürzt nicht ab
   - "Asset pending" Text, gedämpftes Design

**Verwendung:** Boss-Avatare in BattleArena, zukünftig auch Tile-Bilder

---

## 🔊 Audio Engine (src/engine/audioEngine.js)

Web Audio API Synthesizer:
- **playHitSound()** → [65.41, 130.81] Hz Triangle (1s)
- **playLevelUpSound()** → [261.63, 329.63, 392, 493.88] Hz Sine (3s)
- **playUnlockSound()** → [440, 659.25] Hz Sine (2s)
- LFO-Modulation auf Detune
- Exponential Envelope (Attack → Decay)

---

## 🎨 Partikel-Hintergrund (src/engine/particleEngine.js)

- Canvas-basierter Partikeleffekt (70 Partikel)
- Liest Konfiguration aus CSS-Variablen (`--particle-hue-min/max`, etc.)
- 60 FPS via `requestAnimationFrame`
- Theme-reactive Farben

---

## 🔒 Game Lock System

```js
const GAME_LOCK_DATE = "2026-05-01T00:00:00";
const isGameLocked = () => new Date() < new Date(GAME_LOCK_DATE);
```
- Dev-Mode umgeht Lock
- Overlay: "Spiel Gesperrt" Meldung

---

## 🌐 Internationalisierung

**Sprache:** Deutsch (alle UI-Texte, Quests, Skills)

---

## 🚀 Build & Deployment

```bash
npm install          # Dependencies
npm run dev          # Dev Server (Vite Hot Reload)
npm run build        # Production Build
npm run preview      # Preview Build lokal
npm run lint         # ESLint
```

- **Vollständig Client-seitig**, kein Backend nötig
- **localStorage** für Persistenz
- Deploybar auf Netlify, Vercel, GitHub Pages, beliebigem HTTP-Server

---

## 📋 Wichtige Konstanten

### POI_TABLE
```js
{
  monastery: { label: 'Kloster', bonus: { manaRegen: 2 } },
  academy:   { label: 'Akademie', bonus: { goldRegen: 3 } },
  gym:       { label: 'Trainingslager', bonus: { moveRegen: 3 } },
  studio:    { label: 'Studio', bonus: { manaRegen: 1, goldRegen: 1 } },
  server:    { label: 'Server-Farm', bonus: { goldRegen: 2, moveRegen: 1 } },
  wilds:     { label: 'Wildnis', ambush: true },
  nexus:     { label: 'Nexus', bonus: { manaRegen: 1, goldRegen: 1, moveRegen: 1 } },
}
```

### Pfade und Farben
```
Architekt → Blue    (#3B82F6)
Sokratiker → Amber  (#F59E0B)
Barde → Purple      (#A855F7)
Mönch → Emerald     (#10B981)
Akrobat → Red       (#EF4444)
```
