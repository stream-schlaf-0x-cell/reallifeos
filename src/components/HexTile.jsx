import React, { useRef, useMemo, useState, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import { axialToCartesian, getTileHeight } from '../hooks/useHexGrid';
import { hexToThreeColor } from '../hooks/useBiomeColors';

/**
 * HexTile – Einzelnes 3D-Hexagon als Zylinder mit 6 radialen Segmenten.
 *
 * OPTIMIERT:
 * - Weniger Geometrie-Aufrufe (merged edge + main)
 * - Stabilere useFrame-Animation
 * - Besserer Hover-Effekt
 */
export default function HexTile({ tile, colors, isPlayerHere, onClick }) {
  const groupRef = useRef();
  const topRef = useRef();
  const [hovered, setHovered] = useState(false);

  // Höhe & Position
  const height = getTileHeight(tile.type, tile.q, tile.r);
  const cartPos = useMemo(() => axialToCartesian(tile.q, tile.r, 0), [tile.q, tile.r]);

  // Animation
  const targetY = useMemo(() => tile.discovered ? 0 : -3, [tile.discovered]);
  const startY = -3;

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const clampedDelta = Math.min(delta, 0.1);
    const speed = tile.discovered ? 5 : 2;
    const diff = targetY - groupRef.current.position.y;
    if (Math.abs(diff) < 0.001) {
      groupRef.current.position.y = targetY;
      return;
    }
    groupRef.current.position.y += diff * Math.min(clampedDelta * speed, 1);
  });

  // Farben
  const tileColor = useMemo(() => {
    if (!tile.discovered && !tile.generating) return hexToThreeColor(colors.fog);
    if (tile.generating) return hexToThreeColor(colors.generating);
    if (tile.mapBoss?.defeated) {
      const base = hexToThreeColor(colors.defeated);
      return base.map(c => c * 0.3);
    }
    return hexToThreeColor(colors[tile.type] || colors.unknown);
  }, [tile, colors]);

  const edgeColor = useMemo(() => {
    if (isPlayerHere) return hexToThreeColor(colors.playerRing);
    if (tile.mapBoss && !tile.mapBoss.defeated) return hexToThreeColor(colors.bossRing);
    if (tile.discovered) return hexToThreeColor(colors[tile.type] || colors.unknown);
    if (tile.generating) return hexToThreeColor(colors.generating);
    return hexToThreeColor(colors.fog);
  }, [tile, isPlayerHere, colors]);

  const handleClick = useCallback((e) => {
    e.stopPropagation();
    if (!tile.discovered && !tile.generating && onClick) {
      onClick(tile.index);
    }
  }, [tile.discovered, tile.generating, tile.index, onClick]);

  const opacity = tile.discovered ? 0.95 : tile.generating ? 0.5 : 0.15;
  const emissiveIntensity = hovered && !tile.discovered ? 0.15 : 0;
  const edgeEmissive = isPlayerHere ? 0.5 : (tile.mapBoss && !tile.mapBoss.defeated) ? 0.3 : 0.05;

  return (
    <group ref={groupRef} position={[cartPos.x, startY, cartPos.z]}>
      {/* Haupt-Hexagon */}
      <mesh
        position={[0, height / 2, 0]}
        onClick={handleClick}
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }}
        onPointerOut={() => setHovered(false)}
        castShadow
        receiveShadow
      >
        <cylinderGeometry args={[1.8, 1.8, height, 6]} />
        <meshStandardMaterial
          color={tileColor}
          emissive={tileColor}
          emissiveIntensity={emissiveIntensity}
          roughness={0.6}
          metalness={0.1}
          transparent
          opacity={opacity}
        />
      </mesh>

      {/* Top-Fläche (etwas heller) */}
      <mesh
        ref={topRef}
        position={[0, height + 0.01, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <circleGeometry args={[1.75, 6]} />
        <meshStandardMaterial
          color={tileColor.map(c => Math.min(1, c * 1.15))}
          roughness={0.35}
          metalness={0.2}
          transparent
          opacity={opacity}
        />
      </mesh>

      {/* Wireframe-Edge */}
      <mesh position={[0, height / 2, 0]}>
        <cylinderGeometry args={[1.82, 1.82, height + 0.02, 6]} />
        <meshStandardMaterial
          color={edgeColor}
          emissive={edgeColor}
          emissiveIntensity={edgeEmissive}
          roughness={0.3}
          metalness={0.5}
          transparent
          opacity={isPlayerHere ? 0.7 : 0.35}
          wireframe
        />
      </mesh>
    </group>
  );
}
