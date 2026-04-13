import React, { useRef, useMemo, useCallback, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Instances, Instance } from '@react-three/drei';
import * as THREE from 'three';
import { axialToCartesian } from '../hooks/useHexGrid';
import { getTerrainHeight } from '../utils/TerrainNoise';
import { hexToThreeColor } from '../hooks/useBiomeColors';

/**
 * InstancedHexGrid – Rendert alle Tiles via drei <Instances>.
 *
 * Reveal-Animation: Float32Array-Ref wird in useFrame mutiert.
 * Die reveal-Werte werden direkt an Instance-Positionen weitergegeben.
 * Re-render wird nur bei Bedarf getriggert (wenn sich tiles ändern).
 */
const HEX_RADIUS = 1.8;
const HEX_SEGMENTS = 6;

const hexGeometry = new THREE.CylinderGeometry(HEX_RADIUS, HEX_RADIUS, 1, HEX_SEGMENTS);
const hexTopGeometry = new THREE.CircleGeometry(HEX_RADIUS - 0.05, HEX_SEGMENTS);

export default function InstancedHexGrid({ tiles, colors, onTileClick }) {
  // Reveal-Fortschritt per Ref – mutierbar ohne re-render
  const revealsRef = useRef(new Float32Array(61));

  // Initial: discovered Tiles sind bereits aufgedeckt
  tiles.forEach((tile, i) => {
    if (tile.discovered && revealsRef.current[i] < 1.0) {
      revealsRef.current[i] = 1.0;
    }
  });

  // Statische Tile-Daten (wird bei tiles-Änderung neu berechnet)
  const tileData = useMemo(() => {
    // Ensure reveals array is big enough
    if (revealsRef.current.length < tiles.length) {
      const old = revealsRef.current;
      const next = new Float32Array(Math.max(tiles.length, 61));
      old.copyTo(next);
      revealsRef.current = next;
    }

    return tiles.map((tile, i) => {
      const cartPos = axialToCartesian(tile.q, tile.r, 0);
      const height = getTerrainHeight(tile.q, tile.r, tile.type);

      let color;
      if (!tile.discovered && !tile.generating) color = colors.fog;
      else if (tile.generating) color = colors.generating;
      else if (tile.mapBoss?.defeated) {
        const base = hexToThreeColor(colors.defeated);
        color = `rgb(${(base[0] * 0.3 * 255) | 0}, ${(base[1] * 0.3 * 255) | 0}, ${(base[2] * 0.3 * 255) | 0})`;
      } else {
        color = colors[tile.type] || colors.unknown;
      }

      return { index: i, x: cartPos.x, z: cartPos.z, height, color, tile };
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tiles.map(t => `${t.q},${t.r},${t.type},${t.discovered},${t.generating}`).join('|'), colors]);

  // Minimal state um re-render zu triggern
  const [, setTick] = useState(0);

  // Animate reveals in useFrame
  useFrame(() => {
    const reveals = revealsRef.current;
    let needsRender = false;

    tiles.forEach((tile, i) => {
      if (i >= reveals.length) return;
      const target = tile.discovered ? 1.0 : 0.0;
      if (reveals[i] < target) {
        reveals[i] = Math.min(target, reveals[i] + 0.03);
        needsRender = true;
      }
    });

    // Force re-render wenn sich reveals geändert haben
    if (needsRender) {
      setTick((t) => t + 1);
    }
  });

  const handleClick = useCallback((e, tile, index) => {
    e.stopPropagation();
    if (!tile.discovered && !tile.generating && onTileClick) {
      onTileClick(index, tile);
    }
  }, [onTileClick]);

  // Aktuelle reveal-Werte lesen
  const reveals = revealsRef.current;

  return (
    <group>
      <Instances
        geometry={hexGeometry}
        limit={Math.max(tiles.length, 61)}
      >
        <meshStandardMaterial roughness={0.6} metalness={0.1} transparent depthWrite />
        {tileData.map((data) => {
          const reveal = reveals[data.index] || 0;
          const yPos = reveal * 0 - 3 * (1 - reveal);
          return (
            <Instance
              key={data.index}
              position={[data.x, yPos + data.height / 2, data.z]}
              scale={[1, data.height, 1]}
              color={data.color}
              onClick={(e) => handleClick(e, data.tile, data.index)}
              castShadow
              receiveShadow
            />
          );
        })}
      </Instances>

      <Instances
        geometry={hexTopGeometry}
        limit={Math.max(tiles.length, 61)}
      >
        <meshStandardMaterial roughness={0.35} metalness={0.2} transparent depthWrite />
        {tileData.map((data) => {
          const reveal = reveals[data.index] || 0;
          const yPos = reveal * 0 - 3 * (1 - reveal);
          return (
            <Instance
              key={`top-${data.index}`}
              position={[data.x, yPos + data.height + 0.01, data.z]}
              rotation={[-Math.PI / 2, 0, 0]}
              color={data.color}
              receiveShadow
            />
          );
        })}
      </Instances>
    </group>
  );
}
