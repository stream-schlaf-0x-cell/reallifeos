import { useRef, useCallback, useEffect } from 'react';
import { useWorldStore } from '../stores/useWorldStore';

/**
 * useInfiniteMap – Überwacht ob sich der Spieler dem Kartenrand nähert
 * und generiert automatisch neue Ringe.
 *
 * RING_THRESHOLD: Wie viele Ringe vom Zentrum entfernt wir generieren.
 * Startet mit radius 4 (61 tiles). Wenn der Spieler Ring 3 erreicht,
 * generiere Ring 5, etc.
 */

const RING_THRESHOLD = 2; // Ringe vor dem Rand generieren

export function useInfiniteMap(playerPos) {
  const generatedRingsRef = useRef(new Set());
  const maxGeneratedRef = useRef(4); // Start-Ring

  const checkAndExpand = useCallback(() => {
    if (!playerPos) return;

    const { q, r } = playerPos;
    // Axiale Distanz vom Zentrum
    const dist = Math.max(
      Math.abs(q),
      Math.abs(r),
      Math.abs(-q - r)
    );

    // Wenn Spieler sich dem generierten Rand nähert → neuen Ring generieren
    if (dist >= maxGeneratedRef.current - RING_THRESHOLD) {
      const newRing = maxGeneratedRef.current + 1;

      // Verhindere doppelte Generierung
      if (generatedRingsRef.current.has(newRing)) return;
      generatedRingsRef.current.add(newRing);

      useWorldStore.getState().addRingToMap(newRing);
      maxGeneratedRef.current = newRing;
    }
  }, [playerPos]);

  // Prüfe bei jeder Spielerbewegung
  useEffect(() => {
    checkAndExpand();
  }, [playerPos?.q, playerPos?.r, checkAndExpand]);

  // Initial den maximalen existierenden Ring finden
  useEffect(() => {
    const tiles = useWorldStore.getState().mapData.tiles;
    let maxRing = 0;
    tiles.forEach(t => {
      const dist = Math.max(Math.abs(t.q), Math.abs(t.r), Math.abs(-t.q - t.r));
      if (dist > maxRing) maxRing = dist;
    });
    maxGeneratedRef.current = maxRing;
  }, []);

  return { checkAndExpand };
}
