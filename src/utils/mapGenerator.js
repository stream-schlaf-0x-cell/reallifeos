/**
 * Procedural Hex Map Generator
 * Generates a weighted random hex grid for the "Archipel des Geistes"
 */

const POI_TYPES = [
  { type: "nexus",    weight: 3,  minCount: 1, maxCount: 1 },
  { type: "monastery", weight: 15, minCount: 3, maxCount: 6 },
  { type: "academy",  weight: 15, minCount: 3, maxCount: 6 },
  { type: "gym",      weight: 12, minCount: 2, maxCount: 5 },
  { type: "studio",   weight: 10, minCount: 2, maxCount: 4 },
  { type: "server",   weight: 10, minCount: 2, maxCount: 4 },
  { type: "wilds",    weight: 35, minCount: 8, maxCount: 18 },
];

const POI_NAMES = {
  nexus: [
    "Zentrum des Geistes", "Kristalliner Nexus", "Quelle der Klarheit",
    "Herz des Archipels", "Ursprung des Wissens",
  ],
  monastery: [
    "Tempel der Stille", "Kloster des Erwachens", "Halle der Achtsamkeit",
    "Garten der Meditation", "Zazen-Pavillon", "Ort des Qi Gong",
  ],
  academy: [
    "Sokratische Akademie", "Halle der Dialektik", "Athenäum der Ethik",
    "Gymnasium des Geistes", "Platos Schatten", "Kavita-Kolleg",
  ],
  gym: [
    "Eisenhalle", "Arena der Disziplin", "Tempel der Physis",
    "Halle der Stärke", "Dojo der Beharrlichkeit", "Flow-Colosseum",
  ],
  studio: [
    "Klanglabor", "Studio der Resonanz", "Frequenz-Schmiede",
    "Ableton-Arkaden", "Raum des Masterings", "yrrpheus-Kammer",
  ],
  server: [
    "Docker Core", "Server-Farm Alpha", "Node der Automation",
    "Dify-Rechenzentrum", "Inbox-Zero-Station", "Craft-Server",
  ],
  wilds: [
    "Unbekanntes Gebiet", "Nebel der Täuschung", "Dschungel der Ablenkung",
    "Schlucht der Prokrastination", "Sumpf der Lethargie",
    "Wüste der Routine", "Gestrüpp der Zweifel", "Höhle des Widerstands",
    "Irrgarten der Zerstreuung", "Ödland der Gleichgültigkeit",
  ],
};

/**
 * Weighted random selection (reserved for future use)
 */
// eslint-disable-next-line no-unused-vars
function weightedRandom(items) {
  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
  let random = Math.random() * totalWeight;
  for (const item of items) {
    random -= item.weight;
    if (random <= 0) return item.type;
  }
  return items[items.length - 1].type;
}

/**
 * Pick a random name for a POI type
 */
function getRandomPoiName(type) {
  const names = POI_NAMES[type] || POI_NAMES.wilds;
  return names[Math.floor(Math.random() * names.length)];
}

/**
 * Generate hex grid coordinates in a spiral pattern from center
 * Returns array of {q, r} axial coordinates
 */
function generateHexRing(radius) {
  const hexes = [];
  if (radius === 0) {
    return [{ q: 0, r: 0 }];
  }

  // Start at "top" of ring and go clockwise
  let q = 0;
  let r = -radius;

  // Direction vectors for hex grid in pointy-top orientation
  const directions = [
    { dq: 1, dr: 0 },   // southeast
    { dq: 0, dr: 1 },   // south
    { dq: -1, dr: 1 },  // southwest
    { dq: -1, dr: 0 },  // northwest
    { dq: 0, dr: -1 },  // north
    { dq: 1, dr: -1 },  // northeast
  ];

  for (let i = 0; i < 6; i++) {
    for (let j = 0; j < radius; j++) {
      hexes.push({ q, r });
      q += directions[i].dq;
      r += directions[i].dr;
    }
  }

  return hexes;
}

/**
 * Generate all hex coordinates up to a given radius
 */
function generateHexGrid(maxRadius) {
  const allHexes = [];
  for (let radius = 0; radius <= maxRadius; radius++) {
    allHexes.push(...generateHexRing(radius));
  }
  return allHexes;
}

/**
 * Generate the full procedural map
 * @param {number} maxRadius - How many rings from center (default 4 = 61 tiles)
 * @param {number} seed - Optional seed for reproducibility (not used yet)
 * @returns {{ tiles: Array, playerPosition: {q, r} }}
 */
export function generateMap(maxRadius = 4, seed = null) {
  // If seed provided, we could seed the RNG (future enhancement)
  if (seed !== null) {
    // For now, just use Math.random — seeded RNG would need a custom PRNG
  }

  const hexCoords = generateHexGrid(maxRadius);
  const totalTiles = hexCoords.length;

  // Calculate how many of each type we want
  const typeCounts = {};
  let assigned = 0;
  for (const poi of POI_TYPES) {
    const count = Math.min(
      poi.maxCount,
      Math.max(poi.minCount, Math.floor((poi.weight / 100) * totalTiles))
    );
    typeCounts[poi.type] = count;
    assigned += count;
  }

  // Ensure we have at least 1 nexus (center)
  typeCounts.nexus = Math.max(1, typeCounts.nexus);

  // Fill remaining with wilds if we haven't assigned enough
  const remaining = totalTiles - assigned;
  if (remaining > 0) {
    typeCounts.wilds = (typeCounts.wilds || 0) + remaining;
  }

  // Build pool of types
  const typePool = [];
  for (const [type, count] of Object.entries(typeCounts)) {
    for (let i = 0; i < count; i++) {
      typePool.push(type);
    }
  }

  // Shuffle the pool
  for (let i = typePool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [typePool[i], typePool[j]] = [typePool[j], typePool[i]];
  }

  // Create tiles
  const tiles = hexCoords.map((coord, index) => {
    const tileType = typePool[index] || "wilds";
    const isCenter = coord.q === 0 && coord.r === 0;

    return {
      q: coord.q,
      r: coord.r,
      type: isCenter ? "nexus" : tileType,
      name: isCenter
        ? "Zentrum des Geistes"
        : getRandomPoiName(tileType),
      discovered: isCenter, // Only center starts discovered
      mapBoss: null, // Will be populated for wilds tiles
    };
  });

  // Assign map bosses to some wilds tiles
  const MAP_BOSSES = [
    { id: "map_boss_1", name: "Wächter der Ablenkung", type: "Wildnis", color: "text-orange-400", baseHp: 100 },
    { id: "map_boss_2", name: "Schatten der Unordnung", type: "Wildnis", color: "text-orange-400", baseHp: 120 },
    { id: "map_boss_3", name: "Dämon der Bequemlichkeit", type: "Wildnis", color: "text-orange-400", baseHp: 150 },
    { id: "map_boss_4", name: "Hydra der faulen Ausreden", type: "Wildnis", color: "text-orange-400", baseHp: 180 },
    { id: "map_boss_5", name: "Golem der Selbstzweifel", type: "Wildnis", color: "text-orange-400", baseHp: 200 },
  ];

  let bossIndex = 0;
  tiles.forEach((tile) => {
    if (tile.type === "wilds" && bossIndex < MAP_BOSSES.length) {
      // Not every wilds tile gets a boss — roughly 40% chance
      if (Math.random() < 0.4 && bossIndex < MAP_BOSSES.length) {
        const baseBoss = MAP_BOSSES[bossIndex];
        tile.mapBoss = {
          ...baseBoss,
          maxHp: baseBoss.baseHp,
          currentHp: baseBoss.baseHp,
          defeated: false,
        };
        bossIndex++;
      }
    }
  });

  return {
    tiles,
    playerPosition: { q: 0, r: 0 },
  };
}

/**
 * Check if two hex tiles are adjacent
 */
export function areHexAdjacent(a, b) {
  const dq = Math.abs(a.q - b.q);
  const dr = Math.abs(a.r - b.r);
  const ds = Math.abs((a.q + a.r) - (b.q + b.r));
  // In axial coordinates, two hexes are adjacent if max of (dq, dr, ds) === 1
  return Math.max(dq, dr, ds) === 1;
}
