# RealLifeOS — Master Implementation Plan
# Self-Directive Prompt for Qwen Code
# Date: 2026-04-11

================================================================================
CONTEXT
================================================================================
RealLifeOS is a React + Vite + Tailwind CSS single-page application that 
gamifies real-life personal development as an RPG. The user plays their 
actual life — completing real-world tasks earns in-game resources (XP, Gold, 
Mana, Movement Points, Skill Points) used to progress through skill trees, 
fight bosses, and explore a world map.

Current problems identified from user perspective:
1. Quest page is confusing — too many disconnected sections
2. Guild Bounties (Gilden-Aufträge) and Schwarzes Brett feel like separate systems
3. Task completion buttons aren't directly under the Craft section
4. Map is a joke — static 7 tiles, no exploration, no real bosses
5. Quests aren't editable — can't add custom quests
6. No developer tools for testing (no reset button)
7. No activity log
8. Game needs a "locked" state — data locked until a specific start date
9. Future goal: Apple Health import + Huawei GT 4 watch integration

================================================================================
IMPLEMENTATION REQUIREMENTS
================================================================================

## 1. QUEST PAGE REDESIGN — Merge Guild + Schwarzes Brett + Craft Flow

### 1a. Unified "Guild Hall" Design
- MERGE the "Gilden-Aufträge" (5 premium bounty cards) with the "Schwarzes Brett" 
  (preset quests from quests.json) into a single cohesive section
- Both sections now share the same visual language: the premium Guild Bounty 
  card design (gradient backgrounds, glowing borders, path-colored accents)
- The section is called "Gilden-Halle" (Guild Hall)
- Layout: Two subsections stacked vertically:
  A) "Die Fünf Pfade" — the 5 guild bounties (daily core tasks, session-tracked)
  B) "Schwarzes Brett" — preset quests + custom user quests (persisted, clickable)
- All quest/bounty cards share the same Guild Bounty Card aesthetic

### 1b. Craft Integration Fixed
- The "Taten & Pflichten" header area now has:
  1. Craft link (top — opens external Craft.me doc)
  2. DIRECTLY underneath: the "Schnell-Eintragung" (quick claim) buttons
     — These 5 path buttons MUST be immediately below the Craft card
     — This is the honor-system quick claim: "I did this, reward me"
- Flow: Open Craft → do task → come back → click quick claim button → get rewards

### 1c. Quest Persistence
- Schwarzes Brett quests should track completion in localStorage
- Once completed, they show as done (check mark, faded)
- Custom user-added quests also persist

## 2. GENERATIVE MAP WITH EXPLORATION & BOSSES

### 2a. Procedural Map Generation
- Replace static map.json with a procedural hex map generator
- Generate a larger map: ~50-100 tiles in a hex grid pattern
- Tile types with weighted probabilities:
  - monastery (15%): +2 Mana/Quest
  - academy (15%): +3 Gold/Quest  
  - gym (12%): +3 MP/Quest
  - studio (10%): +1 Mana +1 Gold
  - server (10%): +2 Gold +1 MP
  - nexus (5%): +1 all resources (rare, player starts here)
  - wilds (33%): ambush/encounter tiles
- Store seed in localStorage for reproducibility

### 2b. Exploration Mechanics
- Clicking an undiscovered tile adjacent to a discovered tile costs 10 MP
- Reveals the tile and applies POI bonus
- Non-adjacent tiles require pathfinding through adjacent tiles
- Fog of war hides everything beyond discovered frontier

### 2c. Boss Encounters on Map
- Wilds tiles trigger mini-boss encounters
- Boss defeated → bonus XP + resources + tile permanently cleared
- Boss uses same combat system as Battle Arena
- Map bosses are SEPARATE from the daily bosses in the Battle tab
- Boss difficulty scales with player level

### 2d. Map UI
- Larger SVG viewBox with pan/zoom capability
- Minimap in corner showing full map extent
- Discovered tiles show POI emoji, label, coords
- Player position shown with pulsing green dot
- Wilds tiles show skull/ambush indicator

## 3. EDITABLE QUESTS — Add Custom Quests

### 3a. Add Quest Modal
- "Neue Quest" button in the Schwarzes Brett header
- Opens modal form with fields:
  - Quest name (text input)
  - Path selector (5 colored buttons with emoji)
  - XP reward (number, suggested range 10-100)
  - Optional notes/description
- Custom quests saved to localStorage with `isCustom: true`
- Custom quests render identically to preset quests
- Custom quests can be deleted (trash icon on hover)

### 3b. Quest Data Structure
```
{
  id: "custom_1712345678901_abc123",
  name: "Meditiere 30 Minuten",
  path: "monk",
  xp: 30,
  description: "Tiefe Sitzmeditation am Morgen",
  isCustom: true,
  completed: false,
  createdAt: "2026-04-11T..."
}
```

## 4. DEVELOPER TOOLS PANEL

### 4a. Dev Toggle
- Hidden dev panel accessible via keyboard shortcut (Ctrl+Shift+D) 
  OR a small "🔧" button in the Header (only visible in dev mode)
- Dev mode toggle stored in localStorage key `tim_life_rpg_dev`
- When dev mode is ON: show dev panel as a collapsible sidebar

### 4b. Dev Panel Features
- **RESET ALL** button — wipes localStorage["tim_life_rpg"], reloads page
- **Set Level** — number input to set player level directly
- **Set Resources** — inputs for SP, Gold, Mana, MP
- **Add XP** — quick-add XP buttons (+100, +500, +1000)
- **Unlock All Skills** — one-click unlock every skill
- **Reveal All Map Tiles** — instant full map reveal
- **Force Boss Defeat** — instantly defeat current boss
- **Game State Inspector** — JSON dump of current gameState
- **Activity Log Viewer** — full log history (not just last 10)

## 5. ACTIVITY LOG SYSTEM

### 5a. Enhanced Logging
- Expand log storage from 10 entries to 100 entries
- New log entry types:
  - `[QUEST]` — quest completion
  - `[CLAIM]` — quick claim / guild bounty
  - `[COMBAT]` — battle actions
  - `[SKILL]` — skill unlocks
  - `[MAP]` — tile discoveries
  - `[BOSS]` — boss defeats
  - `[LEVEL]` — level ups
  - `[SYSTEM]` — game events (reset, dev actions)

### 5b. Activity Log View
- New tab or modal to view full activity history
- Filterable by type (quest, combat, skill, map, system)
- Timestamps preserved
- Exportable as JSON (preparation for Apple Health integration)

### 5c. Log Data Structure for Future Health Integration
```
{
  timestamp: "2026-04-11T08:30:00Z",
  type: "QUEST",
  path: "acrobat",
  action: "Gym / Laufen gewesen",
  duration: 45,  // minutes — future: from Huawei GT 4
  resources: { xp: 60, move: 15, gold: 0, mana: 0 },
  source: "manual"  // future: "huawei_watch", "apple_health"
}
```

## 6. GAME LOCK/UNLOCK SYSTEM

### 6a. Lock State
- Game has a `locked` flag in localStorage: `tim_life_rpg_locked`
- When locked:
  - All UI shows a "Game Locked" overlay with a lock icon
  - No actions can be performed (buttons disabled)
  - Message: "Das Spiel ist gesperrt. Startdatum: [DATE]"
  - Dev tools still work (for testing)
- When unlocked:
  - Full game access
  - Lock date stored: `tim_life_rpg_lockDate`

### 6b. Lock Date
- Default lock date set to a future date (e.g., 2026-05-01)
- Once the lock date is reached/passed, game auto-unlocks
- Dev mode can override lock (for testing)
- First unlock is permanent — can't re-lock

### 6c. Transition Plan
- User develops and tests in dev mode (unlocked)
- When ready: set lock date, clear all data
- On the lock date: game becomes live, user starts fresh
- All systems must work perfectly from day one

## 7. GAME LOGIC FIXES

### 7a. Quest Completion Flow
- Ensure quest complete button properly awards XP + resources
- POI bonuses correctly calculated and displayed
- Toast notifications fire correctly

### 7b. Combat System
- Shield logic verified (duration decrements correctly)
- Boss defeat advances to next boss
- Combat log entries are accurate
- Skill requirements properly checked (legacy ID mapping)

### 7c. Skill Tree
- Prerequisites enforced correctly
- SP deduction on unlock
- Legacy migration works

### 7d. Map
- MP cost deduction on tile reveal
- POI bonus recalculation
- Ambush triggers on wilds tiles

================================================================================
EXECUTION ORDER
================================================================================

Phase 1: Foundation
  1. Add activity log expansion to useGameState.js
  2. Add game lock/unlock system to useGameState.js
  3. Add dev tools state management

Phase 2: Developer Tools
  4. Create DevToolsPanel component
  5. Add dev mode toggle to Header
  6. Wire up reset button and all dev actions

Phase 3: Quest Page Redesign  
  7. Redesign Quests.jsx — merge guild + brett, fix craft flow
  8. Create custom quest cards with guild bounty aesthetic
  9. Add quest completion persistence

Phase 4: Editable Quests
  10. Create AddQuestModal component
  11. Add custom quest management to useGameState.js
  12. Wire up quest CRUD in Quests.jsx

Phase 5: Generative Map
  13. Create map generator utility
  14. Rewrite WorldMap.jsx with procedural generation
  15. Add exploration pathfinding
  16. Add map boss encounter system

Phase 6: Activity Log
  17. Create ActivityLogView component
  18. Expand log system in useGameState.js
  19. Add log filtering and export

Phase 7: Polish & Verify
  20. Fix any game logic bugs
  21. Test all flows end-to-end
  22. Build and verify

================================================================================
END OF MASTER PLAN
================================================================================
