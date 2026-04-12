// ═══════════════════════════════════════════════════════════════════════════════════
// BACKUP MANAGER: Serializes localStorage user state and triggers downloads.
// ═══════════════════════════════════════════════════════════════════════════════════

const LOCAL_STORAGE_KEYS = [
  'player-store',
  'skill-store',
  'world-store',
  'dev_mode',
];

/**
 * Serializes all Zustand localStorage keys into a formatted JSON blob.
 * @returns {object} The full user state snapshot.
 */
export function serializeUserState() {
  const state = {
    _meta: {
      exportedAt: new Date().toISOString(),
      version: '1.0.0',
      description: 'RealLifeOS User Progression Backup',
    },
  };

  LOCAL_STORAGE_KEYS.forEach((key) => {
    try {
      const raw = localStorage.getItem(key);
      state[key] = raw ? JSON.parse(raw) : null;
    } catch (err) {
      console.warn(`[BackupManager] Failed to parse "${key}":`, err);
      state[key] = { _error: 'Failed to parse', raw: localStorage.getItem(key) };
    }
  });

  return state;
}

/**
 * Triggers a native browser download of the current user state.
 * @param {string} [filename] - Optional custom filename. Defaults to `savegame_YYYY-MM-DD.json`.
 */
export function downloadBackup(filename) {
  const state = serializeUserState();
  const dateStr = new Date().toISOString().split('T')[0];
  const finalFilename = filename || `savegame_${dateStr}.json`;

  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = finalFilename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  return finalFilename;
}

/**
 * Restores user state from a previously downloaded JSON blob.
 * Call this on file upload or paste.
 * @param {object} stateData - The parsed JSON backup object.
 * @returns {{ restored: string[], errors: string[] }}
 */
export function restoreFromBackup(stateData) {
  const restored = [];
  const errors = [];

  LOCAL_STORAGE_KEYS.forEach((key) => {
    try {
      if (stateData[key] !== undefined && stateData[key] !== null) {
        localStorage.setItem(key, JSON.stringify(stateData[key]));
        restored.push(key);
      }
    } catch (err) {
      errors.push(`Failed to restore "${key}": ${err.message}`);
    }
  });

  return { restored, errors };
}

/**
 * Auto-backup trigger: call after significant game events (e.g., Boss Defeat).
 * Silently saves to localStorage as a snapshot, and optionally triggers download.
 * @param {boolean} [triggerDownload=false] - Whether to also trigger a file download.
 */
export function autoBackup(triggerDownload = false) {
  try {
    const state = serializeUserState();
    localStorage.setItem('autosave_backup', JSON.stringify(state));
    console.log('[BackupManager] Auto-backup saved to localStorage.');

    if (triggerDownload) {
      const filename = downloadBackup();
      console.log(`[BackupManager] Auto-backup downloaded: ${filename}`);
      return { success: true, filename };
    }

    return { success: true, filename: null };
  } catch (err) {
    console.error('[BackupManager] Auto-backup failed:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Loads the most recent autosave from localStorage.
 * @returns {object|null} The parsed autosave state, or null if none exists.
 */
export function loadAutoBackup() {
  try {
    const raw = localStorage.getItem('autosave_backup');
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    console.error('[BackupManager] Failed to load autosave:', err);
    return null;
  }
}
