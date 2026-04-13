/**
 * useBiomeColors – Liefert Tile-Farben aus den CSS-Variablen des aktuellen Themes.
 *
 * Liest computed styles von :root und mapped POI-Typen auf Hex-Farbcodes.
 * Fallback auf Default-Farben falls CSS-Variablen nicht gesetzt sind.
 */
import { useMemo } from 'react';

const DEFAULT_COLORS = {
  nexus: '#06b6d4',
  monastery: '#10b981',
  academy: '#f59e0b',
  gym: '#ef4444',
  studio: '#a855f7',
  server: '#3b82f6',
  wilds: '#f97316',
  unknown: '#64748b',
  fog: '#1a1a2e',
  generating: '#8b5cf6',
  defeated: '#10b981',
  playerRing: '#10b981',
  bossRing: '#ef4444',
};

// Mapping: POI type → CSS variable name
const CSS_VAR_MAP = {
  nexus: '--accent-primary',
  monastery: '--path-monk',
  academy: '--path-socratic',
  gym: '--path-acrobat',
  studio: '--path-bard',
  server: '--path-architect',
  wilds: '--accent-secondary',
};

export function useBiomeColors() {
  return useMemo(() => {
    const colors = { ...DEFAULT_COLORS };
    try {
      const root = getComputedStyle(document.documentElement);
      for (const [type, cssVar] of Object.entries(CSS_VAR_MAP)) {
        const val = root.getPropertyValue(cssVar).trim();
        if (val) colors[type] = val;
      }
    } catch {
      // SSR / no document – bleibe bei Defaults
    }
    return colors;
  }, []);
}

/**
 * Konvertiert Hex-Farbe zu Three.js-kompatiblem RGB-Array für Instanzen.
 */
export function hexToThreeColor(hex) {
  const c = hex.replace('#', '');
  const r = parseInt(c.substring(0, 2), 16) / 255;
  const g = parseInt(c.substring(2, 4), 16) / 255;
  const b = parseInt(c.substring(4, 6), 16) / 255;
  return [r, g, b];
}

export { DEFAULT_COLORS };
