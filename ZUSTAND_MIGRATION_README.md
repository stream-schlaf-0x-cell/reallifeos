# Zustand Stores Migration - Phase 1

## Status: ✅ Implementation Complete

Dies ist die Phase-1 Refactoring der RealLifeOS-App. Der monolithische `useState` wurde in drei separate Zustand-Stores aufgeteilt, während die Facade-API unverändert bleibt.

---

## 📦 Installation

```bash
npm install zustand
# oder
yarn add zustand
```

---

## 🏗️ Store-Architektur

### Drei Neue Stores (`src/stores/`)

#### 1. **usePlayerStore.js** 
- **State**: Level, XP, Ressourcen (Gold/Mana/MP), Quests, Aktivitätslog
- **Responsibility**: Player Progression, Resource Management, Quest System
- **Key Actions**:
  - `addXp(amount)` - XP hinzufügen + Level-up Check
  - `complainQuestComplete(quest, poiBonuses)` - Quest abschließen
  - `addCustomQuest()` - Custom Quest erstellen
  - `showToast(msg, type)` - Toast-Benachrichtigungen

#### 2. **useSkillStore.js**
- **State**: Skilltree (flattened array), Freischaltungen
- **Responsibility**: Skill Management, Tree Progression
- **Key Actions**:
  - `unlockSkill(skillId, cost)` - Skill freischalten
  - `addCustomSkill(path, tier, data)` - Custom Skill hinzufügen
  - `migrateLegacySkills(oldSkills)` - Migration Alt → Neu
  - `devUnlockAllSkills()` - Dev Helper

#### 3. **useWorldStore.js**
- **State**: Map, Combat State, Boss Info, Combat Log
- **Responsibility**: World State, Combat System, Map Management
- **Key Actions**:
  - `executeAttack(attack,...)` - Kampflogik
  - `uncoverTile(tileIndex)` - Map-Tile enthüllen
  - `defeatBoss()` - Boss besiegt → nächster Boss
  - `recalcPoiBonuses()` - POI-Boni neu berechnen

---

## 🔄 Die Facade (`src/hooks/useGameState.js`)

Die alte `useGameState.js` wurde zu einer **Facade**, die:
1. ✅ Die alten Hooks importiert
2. ✅ Cross-Store-Logik koordiniert (z.B. Quest→XP)
3. ✅ Exakt die gleiche API exportiert
4. ✅ Alte localStorage-Daten migriert

**Resultat:** UI-Komponenten brauchen KEINE Änderungen!

```javascript
// App.jsx - UNCHANGED!
const { gameState, handleQuestComplete, executeAttack, ... } = useGameState();

// Funktioniert genau wie vorher
```

---

## 🔐 Persistierung & Migration

### Custom Storage Integration

Die drei Stores verwenden intern die `persist`-Middleware von Zustand:
- **usePlayerStore** → `player-store` key
- **useSkillStore** → `skill-store` key
- **useWorldStore** → `world-store` key

### Legacy Migration

Beim App-Start:
1. Alte localStorage Key `"tim_life_rpg"` wird gelesen
2. Daten werden auf die drei neuen Stores verteilt
3. Migrationshooks (z.B. `migrateLegacySkills`) konvertieren alte Skill-IDs

```javascript
// In der Facade
const migrateLegacyData = () => {
  const legacyData = localStorage.getItem('tim_life_rpg');
  if (!legacyData) return;
  
  // Parse old data
  const parsed = JSON.parse(legacyData);
  
  // Distribute to new stores
  usePlayerStore.setState({ /* ... */ });
  useSkillStore.getState().migrateLegacySkills(parsed.skills);
  useWorldStore.setState({ /* ... */ });
};
```

---

## 🔗 Cross-Store Actions

Einige Aktionen betreffen mehrere Stores. Diese werden in der **Facade** koordiniert:

### Quest Completion
```javascript
// Facade koordiniert
const handleQuestComplete = (quest) => {
  const poiBonuses = worldState.recalcPoiBonuses(); // WorldStore
  playerState.complainQuestComplete(quest, poiBonuses); // PlayerStore
  playerState.setPoiBonuses(poiBonuses); // PlayerStore
};
// Player sieht: Ressourcen ↑, XP ↑, Log Entry ✓
```

### Attack Execution
```javascript
const executeAttack = (attack) => {
  const result = worldState.executeAttack(...); // WorldStore
  usePlayerStore.setState({ mana: ..., gold: ... }); // PlayerStore
  if (result.isDefeated) {
    worldState.defeatBoss(); // WorldStore
    playerState.addXp(50); // PlayerStore
  }
};
```

---

## 🛠️ Dev Tools

Alle Dev-Funktionen sind pro Store verfügbar:

```javascript
// Dev Mode (in Facade)
playerState.devSetLevel(10);
playerState.devSetResources({ gold: 1000, mana: 500 });
skillState.devUnlockAllSkills();
worldState.devRevealAllTiles();
```

---

## ✅ Vorsorgemaßnahmen

### 1. **Keine UI-Bruch**
- Alle bestehenden Component Props bleiben identisch
- `gameState` Objekt hat exakt die gleiche Struk tur
- Alle Action-Signaturen sind identisch

### 2. **Vollständige Daten-Persistierung**
- Alte localStorage wird migriert (kein Datenverlust)
- Neue Stores persisten automatisch via Zustand
- Extra Backup des alten Keys (optional behalten)

### 3. **Sound & Feedback Beibehalten**
- `playLevelUpSound()` noch in PlayerStore
- `playUnlockSound()` noch in SkillStore
- `playHitSound()` noch in WorldStore
- Toast-System funktioniert über PlayerStore

### 4. **Settings separated**
- Dev Mode wird in Facade verwaltet (nicht in Stores)
- Game Lock Logic auch in Facade
- localStorage keys: `dev_mode`

---

## 🧪 Testing / Validation

Um die Migration zu validieren:

```bash
# 1. npm installieren
npm install

# 2. Dev-Server starten
npm run dev

# 3. Im Browser öffnen
# - Spielstand sollte migriert sein
# - Alle Buttons funktionieren wie vorher
# - Keine Console-Fehler

# 4. Dev Mode aktivieren
# - DevToolsPanel sollte funktionieren
# - All Dev Actions funktionieren
```

---

## 📋 Aktualisierte Dateien

```
src/
├── hooks/
│   ├── useGameState.js              [COMPLETELY REFACTORED]
│   │   ├── Facade, Migration, API
│   │
├── stores/
│   ├── usePlayerStore.js            [NEW]
│   ├── useSkillStore.js             [NEW]
│   └── useWorldStore.js             [NEW]
│
└── ... (alles andere bleibt unverändert)

package.json                           [+ zustand dependency]
```

---

## 🔄 Next Steps (Phase 2)

Nach dieser Migration sind mögliche nächste Schritte:

1. **Selektive Re-Renders optimieren**
   - Zustand macht bereits Shallow-Vergleiche
   - Könnten aber kleinere Sub-Stores splitten

2. **Async Thunks hinzufügen** (falls Backend nötig)
   - Redux-Thunk-ähnliches Muster
   - Oder externe API-Calls in separaten Actions

3. **DevTools Integration**
   - Zustand hat Devtools-Middleware
   - Ermöglicht Redux DevTools Debugging

4. **Persistence Fine-Tuning**
   - Optionale Encryption der Saves
   - Cloud Sync (später)
   - Versioning von Save-Formats

---

## 📞 Troubleshooting

### "undefined store" Fehler
→ Stelle sicher, dass die Stores vor `useGameState` importiert  sind. Zustand lazy-lädt nicht, also die Imports sofort durchgeführt.

### Game State nicht persistiert
→ Prüfe Browser DevTools → Application → localStorage
→ Sollte Keys sehen: `player-store`, `skill-store`, `world-store`

### Migration nicht getriggert
→ Check Chrome DevTools → Console
→ Should see: `✅ Legacy data migrated to Zustand stores`

### Dev Mode startet nicht
→ localStorage `dev_mode` key prüfen
→ Button im Header togglen

---

## 🎯 Resultat

✅ **Monolith → Modular**: 3 unabhängige, testbare Stores  
✅ **Keine UI-Änderungen**: Facade hält alles kompatibel  
✅ **Daten-Migration**: Spielstand wird vollständig übernommen  
✅ **Bessere Code-Organization**: Klare Verantwortung pro Store  
✅ **Performance Ready**: Zustand optimiert Re-Renders smart  

---

**Version:** 1.0  
**Date:** April 2026  
**Status:** ✅ Ready for Testing
