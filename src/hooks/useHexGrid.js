/**
 * useHexGrid – Wandelt axiale Hex-Koordinaten (q, r) in kartesische 3D-Positionen um.
 *
 * Pointy-top Hexagon mit flacher Y-Achse (XZ-Ebene in Three.js).
 *
 * ACHTUNG: Die Höhenberechnung wurde auf Simplex Noise migriert.
 * Siehe utils/TerrainNoise.js für getTerrainHeight().
 * Diese Datei enthält nur die axiale Konversion.
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

export { HEX_SIZE };
