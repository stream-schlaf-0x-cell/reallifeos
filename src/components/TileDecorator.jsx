import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { axialToCartesian } from '../hooks/useHexGrid';
import { getTerrainHeight } from '../utils/TerrainNoise';
import { hexToThreeColor } from '../hooks/useBiomeColors';

/**
 * TileDecorator – Platziert Low-Poly Landschafts-Objekte auf Hex-Tiles.
 *
 * Basierend auf dem tile.type werden passende Dekorationen generiert:
 * - wilds:   Bäume (Kegel + Stamm), Felsen
 * - nexus:   schwebende Kristalle
 * - monastery: Lotos-Blüten (Torus)
 * - academy: Bücherstapel (Boxen)
 * - gym:     Hanteln
 * - studio:  Musiknoten (TorusKnoten mini)
 * - server:  Antennen
 *
 * Alle Objekte animieren beim Aufdecken (Spring-Skalierung).
 */

// Dekorations-Konfiguration pro Tile-Typ
const DECOR_CONFIG = {
  wilds: {
    count: 3,
    spread: 0.8,
    items: ['tree', 'tree', 'rock'],
  },
  nexus: {
    count: 4,
    spread: 0.6,
    items: ['crystal', 'crystal', 'crystal', 'crystal'],
  },
  monastery: {
    count: 2,
    spread: 0.7,
    items: ['lotus', 'lotus'],
  },
  academy: {
    count: 2,
    spread: 0.6,
    items: ['book', 'book'],
  },
  gym: {
    count: 2,
    spread: 0.7,
    items: ['dumbbell', 'dumbbell'],
  },
  studio: {
    count: 2,
    spread: 0.6,
    items: ['note', 'note'],
  },
  server: {
    count: 2,
    spread: 0.5,
    items: ['antenna', 'antenna'],
  },
};

/**
 * Einzelnes Dekor-Objekt mit Spring-Animation.
 */
function DecorItem({ type, position, color, discovered }) {
  const meshRef = useRef();
  const targetScale = discovered ? 1 : 0;

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    const speed = 4;
    const s = meshRef.current.scale;
    const diff = targetScale - s.x;
    if (Math.abs(diff) < 0.001) {
      s.setScalar(targetScale);
      return;
    }
    const newS = s.x + diff * Math.min(delta * speed, 1);
    s.setScalar(Math.max(0, newS));
  });

  const matProps = {
    color,
    roughness: 0.5,
    metalness: 0.3,
    transparent: true,
    opacity: discovered ? 0.85 : 0,
  };

  switch (type) {
    case 'tree':
      return (
        <group position={position}>
          {/* Stamm */}
          <mesh ref={meshRef} position={[0, 0.15, 0]} castShadow>
            <cylinderGeometry args={[0.04, 0.06, 0.3, 5]} />
            <meshStandardMaterial color={[0.35, 0.2, 0.1]} roughness={0.8} />
          </mesh>
          {/* Krone */}
          <mesh position={[0, 0.45, 0]} castShadow>
            <coneGeometry args={[0.18, 0.35, 6]} />
            <meshStandardMaterial {...matProps} />
          </mesh>
        </group>
      );

    case 'rock':
      return (
        <mesh ref={meshRef} position={position} castShadow>
          <dodecahedronGeometry args={[0.15, 0]} />
          <meshStandardMaterial {...matProps} color={color.map(c => c * 0.7)} roughness={0.8} />
        </mesh>
      );

    case 'crystal':
      return (
        <mesh ref={meshRef} position={position} castShadow>
          <octahedronGeometry args={[0.12, 0]} />
          <meshStandardMaterial
            {...matProps}
            emissive={color}
            emissiveIntensity={0.5}
            transparent
            opacity={discovered ? 0.7 : 0}
          />
        </mesh>
      );

    case 'lotus':
      return (
        <mesh ref={meshRef} position={position} rotation={[-Math.PI / 2, 0, 0]} castShadow>
          <torusGeometry args={[0.15, 0.04, 6, 8]} />
          <meshStandardMaterial {...matProps} roughness={0.4} metalness={0.1} />
        </mesh>
      );

    case 'book':
      return (
        <group position={position}>
          <mesh ref={meshRef} castShadow>
            <boxGeometry args={[0.12, 0.04, 0.18]} />
            <meshStandardMaterial {...matProps} roughness={0.7} />
          </mesh>
          <mesh position={[0, 0.05, 0.01]} castShadow>
            <boxGeometry args={[0.11, 0.03, 0.17]} />
            <meshStandardMaterial {...matProps} color={color.map(c => Math.min(1, c * 1.3))} roughness={0.7} />
          </mesh>
        </group>
      );

    case 'dumbbell':
      return (
        <group position={position}>
          <mesh ref={meshRef} castShadow>
            <cylinderGeometry args={[0.03, 0.03, 0.25, 6]} />
            <meshStandardMaterial color={[0.5, 0.5, 0.5]} roughness={0.3} metalness={0.8} />
          </mesh>
          <mesh position={[0.13, 0, 0]} castShadow>
            <cylinderGeometry args={[0.07, 0.07, 0.06, 8]} />
            <meshStandardMaterial color={color} roughness={0.4} metalness={0.6} />
          </mesh>
          <mesh position={[-0.13, 0, 0]} castShadow>
            <cylinderGeometry args={[0.07, 0.07, 0.06, 8]} />
            <meshStandardMaterial color={color} roughness={0.4} metalness={0.6} />
          </mesh>
        </group>
      );

    case 'note':
      return (
        <mesh ref={meshRef} position={position} castShadow>
          <torusKnotGeometry args={[0.08, 0.025, 32, 8, 2, 3]} />
          <meshStandardMaterial
            {...matProps}
            emissive={color}
            emissiveIntensity={0.3}
          />
        </mesh>
      );

    case 'antenna':
      return (
        <group position={position}>
          <mesh ref={meshRef} castShadow>
            <cylinderGeometry args={[0.02, 0.03, 0.35, 4]} />
            <meshStandardMaterial color={[0.4, 0.4, 0.5]} roughness={0.3} metalness={0.7} />
          </mesh>
          <mesh position={[0, 0.2, 0]} castShadow>
            <sphereGeometry args={[0.05, 6, 4]} />
            <meshStandardMaterial
              color={color}
              emissive={color}
              emissiveIntensity={0.8}
              roughness={0.2}
              metalness={0.5}
            />
          </mesh>
        </group>
      );

    default:
      return null;
  }
}

export default function TileDecorator({ tile, colors }) {
  const cartPos = useMemo(
    () => axialToCartesian(tile.q, tile.r, 0),
    [tile.q, tile.r]
  );
  const height = getTerrainHeight(tile.q, tile.r, tile.type);

  const config = DECOR_CONFIG[tile.type];
  if (!config || !tile.discovered) return null;

  // Deterministische Positionen basierend auf q,r
  const decorations = config.items.map((item, i) => {
    const angle = (i / config.count) * Math.PI * 2 + tile.q * 0.5 + tile.r * 0.3;
    const radius = config.spread * (0.5 + ((i * 7 + tile.q * 3) % 10) / 20);
    const x = cartPos.x + Math.cos(angle) * radius;
    const z = cartPos.z + Math.sin(angle) * radius;
    const y = height + 0.05;

    const tileColor = hexToThreeColor(colors[tile.type] || colors.unknown);

    return (
      <DecorItem
        key={`${tile.index}-${i}`}
        type={item}
        position={[x, y, z]}
        color={tileColor}
        discovered={tile.discovered}
      />
    );
  });

  return <group>{decorations}</group>;
}
