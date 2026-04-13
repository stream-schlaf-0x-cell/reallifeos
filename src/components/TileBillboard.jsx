import React, { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import { axialToCartesian } from '../hooks/useHexGrid';
import { getTerrainHeight } from '../utils/TerrainNoise';
import * as THREE from 'three';

/**
 * TileBillboard – Zeigt POI-Emoji, Boss-Indikatoren als 3D-native Elemente.
 *
 * KEINE Html-Komponenten für Assets mehr – die Bilder werden als
 * TileArtifact-Planes auf der Hex-Oberfläche gerendert.
 */
export default function TileBillboard({ tile, colors, isPlayerHere, onBossClick }) {
  const cartPos = useMemo(() => axialToCartesian(tile.q, tile.r, 0), [tile.q, tile.r]);
  const height = getTerrainHeight(tile.q, tile.r, tile.type);

  if (!tile.discovered && !tile.generating) return null;

  const hasBoss = tile.mapBoss && !tile.mapBoss.defeated;
  const bossDefeated = tile.mapBoss?.defeated;

  return (
    <group position={[cartPos.x, 0, cartPos.z]}>
      {tile.discovered && (
        <>
          {/* Boss indicator */}
          {hasBoss && (
            <BossIndicator
              tile={tile}
              height={height}
              onBossClick={onBossClick}
            />
          )}

          {/* Defeated boss marker */}
          {bossDefeated && (
            <Text
              position={[0, height + 1.5, 0]}
              fontSize={0.15}
              color="#10b981"
              anchorX="center"
              anchorY="middle"
              outlineWidth={0.02}
              outlineColor="#000000"
            >
              ✓
            </Text>
          )}

          {/* POI Emoji als 3D-Text */}
          <POIEmoji
            tile={tile}
            height={height}
            hasBoss={hasBoss}
            colors={colors}
          />

          {/* Player indicator (kleiner Ring auf dem Boden) */}
          {isPlayerHere && (
            <mesh position={[0, height + 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.3, 0.4, 16]} />
              <meshStandardMaterial
                color={colors.playerRing}
                emissive={colors.playerRing}
                emissiveIntensity={0.8}
                transparent
                opacity={0.6}
                side={THREE.DoubleSide}
              />
            </mesh>
          )}
        </>
      )}

      {/* Generating state */}
      {tile.generating && (
        <GeneratingIndicator position={[0, height + 0.5, 0]} />
      )}
    </group>
  );
}

/**
 * POI-Emoji als rotierender 3D-Text.
 */
function POIEmoji({ tile, height, hasBoss, colors }) {
  const groupRef = useRef();
  const tileColor = useMemo(
    () => colors[tile.type] || colors.unknown,
    [tile.type, colors]
  );

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y += delta * 0.5;
  });

  return (
    <group ref={groupRef} position={[0, hasBoss ? height + 1.0 : height + 0.6, 0]}>
      {/* Glow-Hintergrund */}
      <mesh>
        <sphereGeometry args={[0.25, 8, 6]} />
        <meshStandardMaterial
          color={tileColor}
          emissive={tileColor}
          emissiveIntensity={0.3}
          transparent
          opacity={0.15}
          depthWrite={false}
        />
      </mesh>

      {/* Emoji als Text-Canvas */}
      <Text
        position={[0, 0, 0]}
        fontSize={0.3}
        anchorX="center"
        anchorY="middle"
      >
        {POI_EMOJI[tile.type] || '❓'}
      </Text>
    </group>
  );
}

/**
 * Boss-Skull als 3D-Objekt mit Klick-Handler.
 */
function BossIndicator({ tile, height, onBossClick }) {
  const groupRef = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y += delta * 1.2;
    // Pulsieren
    const s = 1 + Math.sin(performance.now() / 500) * 0.1;
    groupRef.current.scale.setScalar(s);
  });

  const skullColor = hovered ? [0.94, 0.27, 0.27] : [0.98, 0.45, 0.13];

  return (
    <group
      ref={groupRef}
      position={[0, height + 1.3, 0]}
      onClick={(e) => {
        e.stopPropagation();
        if (onBossClick && tile.mapBoss && !tile.mapBoss.defeated) {
          onBossClick(tile.index);
        }
      }}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }}
      onPointerOut={() => setHovered(false)}
      style={{ cursor: 'pointer' }}
    >
      {/* Skull als Dodekaeder */}
      <mesh castShadow>
        <dodecahedronGeometry args={[0.22, 0]} />
        <meshStandardMaterial
          color={skullColor}
          emissive={skullColor}
          emissiveIntensity={hovered ? 0.8 : 0.3}
          roughness={0.3}
          metalness={0.6}
        />
      </mesh>

      {/* Ring darum */}
      <mesh>
        <torusGeometry args={[0.3, 0.03, 8, 16]} />
        <meshStandardMaterial
          color={skullColor}
          emissive={skullColor}
          emissiveIntensity={0.5}
          transparent
          opacity={0.7}
        />
      </mesh>

      {/* Boss name als Text */}
      <Text
        position={[0, -0.4, 0]}
        fontSize={0.12}
        color="#f97316"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.01}
        outlineColor="#000000"
      >
        {tile.mapBoss?.name || 'Boss'}
      </Text>
    </group>
  );
}

/**
 * Generierend-Indikator – pulsierender Zahn.
 */
function GeneratingIndicator({ position }) {
  const ref = useRef();

  useFrame((_, delta) => {
    if (!ref.current) return;
    ref.current.rotation.y += delta * 2;
  });

  return (
    <group position={position}>
      <mesh ref={ref}>
        <torusGeometry args={[0.2, 0.05, 6, 8]} />
        <meshStandardMaterial
          color={[0.55, 0.36, 0.96]}
          emissive={[0.55, 0.36, 0.96]}
          emissiveIntensity={0.5}
          transparent
          opacity={0.6}
        />
      </mesh>
      <Text
        position={[0, -0.3, 0]}
        fontSize={0.1}
        color="rgba(139, 92, 246, 0.5)"
        anchorX="center"
        anchorY="middle"
      >
        KI generiert...
      </Text>
    </group>
  );
}

const POI_EMOJI = {
  monastery: '🏯',
  academy: '🎓',
  gym: '💪',
  studio: '🎵',
  server: '🖥️',
  wilds: '⚔️',
  nexus: '🌀',
  unknown: '❓',
};
