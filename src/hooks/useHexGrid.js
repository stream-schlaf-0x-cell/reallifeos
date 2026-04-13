/**
 * useHexGrid – Wandelt axiale Hex-Koordinaten (q, r) in kartesische 3D-Positionen um.
 *
 * Pointy-top Hexagon mit flacher Y-Achse (XZ-Ebene in Three.js).
 * y wird später für die prozedurale Höhe genutzt.
 */
import { useMemo } from 'react';

const HEX_SIZE = 2.0; // 3D-Welt: jedes Hexagon ~2 Einheiten Radius

/**
 * Axiale → kartesische Konversion für pointy-top Hexagone.
 * Legt das Grid in die XZ-Ebene (y = 0 als Basis).
 */
export function axialToCartesian(q, r, height = 0) {
  const x = HEX_SIZE * (Math.sqrt(3) * q + (Math.sqrt(3) / 2) * r);
  const z = HEX_SIZE * (1.5 * r);
  return { x, y: height, z };
}

/**
 * Hook: Berechnet alle Tile-Positionen einmal memoized.
 */
export function useHexGrid(tiles) {
  return useMemo(() => {
    return tiles.map((tile) => {
      const pos = axialToCartesian(tile.q, tile.r, 0);
      return { ...tile, x: pos.x, y: pos.y, z: pos.z };
    });
  }, [tiles]);
}

/**
 * Berechnet prozedurale Höhe basierend auf Tile-Typ und einem einfachen Hash.
 * Erzeugt organische Landschaft ohne externe Rausch-Bibliothek.
 */
export function getTileHeight(tileType, q, r) {
  // Einfacher deterministischer "Noise" aus Koordinaten + Typ
  const hash = ((q * 374761393 + r * 668265263) & 0x7fffffff) / 0x7fffffff;
  const baseHeight = hash * 0.4; // 0–0.4 Variation

  // Biome/Typ-Bonus: bestimmte Typen sind leicht erhöht
  const typeHeight = {
    nexus: 0.6,
    monastery: 0.3,
    academy: 0.2,
    gym: 0.35,
    studio: 0.25,
    server: 0.15,
    wilds: 0.1,
  };

  return baseHeight + (typeHeight[tileType] || 0);
}

export { HEX_SIZE };
