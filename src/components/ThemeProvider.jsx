import { useEffect, useState, createContext, useContext, useCallback } from 'react';
import { fetchGameData, ThemeSchema } from '../utils/schemas';

// Default theme fallback — matches public/data/theme.json
const DEFAULT_THEME = {
  name: 'default',
  'bg-primary': '#020617',
  'bg-secondary': '#0f172a',
  'bg-tertiary': '#1e293b',
  'text-primary': '#e2e8f0',
  'text-secondary': '#94a3b8',
  'text-muted': '#64748b',
  'border-primary': '#334155',
  'border-secondary': '#1e293b',
  'path-architect': '#3b82f6',
  'path-socratic': '#f59e0b',
  'path-bard': '#a855f7',
  'path-monk': '#10b981',
  'path-acrobat': '#ef4444',
  'accent-primary': '#8b5cf6',
  'accent-secondary': '#ec4899',
  'resource-xp': '#8b5cf6',
  'resource-sp': '#f59e0b',
  'resource-mp': '#10b981',
  'resource-gold': '#eab308',
  'resource-mana': '#3b82f6',
  'particle-hue-min': 200,
  'particle-hue-max': 300,
  'particle-saturation': 50,
  'particle-lightness': 60,
  'particle-count': 70,
  'particle-opacity': 0.4,
};

const ThemeContext = createContext({
  theme: DEFAULT_THEME,
  loading: true,
  fromFallback: false,
});

// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = () => useContext(ThemeContext);

/**
 * Injects theme CSS variables into document :root.
 * Reads /data/theme.json via the Schema Firewall.
 */
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(DEFAULT_THEME);
  const [loading, setLoading] = useState(true);
  const [fromFallback, setFromFallback] = useState(false);

  // Memoized load function that can be triggered on biome change
  const loadTheme = useCallback(async () => {
    const result = await fetchGameData(
      `/data/theme.json?t=${Date.now()}`, // Cache-bust for biome transitions
      ThemeSchema,
      DEFAULT_THEME,
      'Theme'
    );

    setTheme(result.data);
    setFromFallback(result.fromFallback);
    setLoading(false);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const initialLoad = async () => {
      const result = await fetchGameData(
        '/data/theme.json',
        ThemeSchema,
        DEFAULT_THEME,
        'Theme'
      );

      if (!cancelled) {
        setTheme(result.data);
        setFromFallback(result.fromFallback);
        setLoading(false);
      }
    };

    initialLoad();
    return () => { cancelled = true; };
  }, []);

  // Listen for biome transition reload events
  useEffect(() => {
    const handleReload = () => {
      console.log('[Theme] Biome transition reload triggered');
      loadTheme();
    };

    window.addEventListener('rls-theme-reload', handleReload);
    return () => window.removeEventListener('rls-theme-reload', handleReload);
  }, [loadTheme]);

  // Inject CSS variables into :root whenever theme changes
  useEffect(() => {
    const root = document.documentElement.style;
    Object.entries(theme).forEach(([key, value]) => {
      // Convert kebab-case keys (already kebab in schema) to CSS variables
      const cssVar = `--theme-${key}`;
      root.setProperty(cssVar, String(value));
    });

    // Also set Tailwind-compatible CSS variables for bg/text/border
    // These map to the standard CSS variable utilities used across components
    root.setProperty('--bg-primary', theme['bg-primary']);
    root.setProperty('--bg-secondary', theme['bg-secondary']);
    root.setProperty('--bg-tertiary', theme['bg-tertiary']);
    root.setProperty('--text-primary', theme['text-primary']);
    root.setProperty('--text-secondary', theme['text-secondary']);
    root.setProperty('--text-muted', theme['text-muted']);
    root.setProperty('--border-primary', theme['border-primary']);
    root.setProperty('--border-secondary', theme['border-secondary']);
    root.setProperty('--path-architect', theme['path-architect']);
    root.setProperty('--path-socratic', theme['path-socratic']);
    root.setProperty('--path-bard', theme['path-bard']);
    root.setProperty('--path-monk', theme['path-monk']);
    root.setProperty('--path-acrobat', theme['path-acrobat']);
    root.setProperty('--accent-primary', theme['accent-primary']);
    root.setProperty('--accent-secondary', theme['accent-secondary']);
    root.setProperty('--resource-xp', theme['resource-xp']);
    root.setProperty('--resource-sp', theme['resource-sp']);
    root.setProperty('--resource-mp', theme['resource-mp']);
    root.setProperty('--resource-gold', theme['resource-gold']);
    root.setProperty('--resource-mana', theme['resource-mana']);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, loading, fromFallback }}>
      {children}
    </ThemeContext.Provider>
  );
}
