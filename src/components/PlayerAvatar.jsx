import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { axialToCartesian } from '../hooks/useHexGrid';
import { getTerrainHeight } from '../utils/TerrainNoise';
import { hexToThreeColor } from '../hooks/useBiomeColors';
import * as THREE from 'three';

/**
 * PlayerAvatar – Schwebender Low-Poly Monk mit Momentum-basierter Bewegung.
 *
 * Statt zu teleportieren, gleitet der Avatar sanft zur Zielposition.
 * Kontinuierliche Hover-Animation + Rotation.
 */
export default function PlayerAvatar({ playerPos, colors }) {
  const groupRef = useRef();
  const innerRef = useRef();

  // Smooth position tracking
  const currentPos = useRef(new THREE.Vector3(0, 3, 0));

  const cartPos = useMemo(() => {
    const height = getTerrainHeight(playerPos.q, playerPos.r, 'nexus');
    return axialToCartesian(playerPos.q, playerPos.r, height);
  }, [playerPos.q, playerPos.r]);

  const avatarColor = useMemo(() => hexToThreeColor(colors.playerRing), [colors]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    const dt = Math.min(delta, 0.05);
    const t = performance.now() / 1000;

    // Zielposition: Über dem Tile + Hover
    const targetY = cartPos.y + 1.8 + Math.sin(t * 1.5) * 0.25;

    // Smooth position lerp (Momentum)
    const lerpFactor = 1 - Math.pow(0.05, dt);
    currentPos.current.x += (cartPos.x - currentPos.current.x) * lerpFactor * 0.08;
    currentPos.current.y += (targetY - currentPos.current.y) * lerpFactor * 0.08;
    currentPos.current.z += (cartPos.z - currentPos.current.z) * lerpFactor * 0.08;

    groupRef.current.position.copy(currentPos.current);

    // Inner rotation
    if (innerRef.current) {
      innerRef.current.rotation.y = t * 0.8;
      innerRef.current.rotation.x = Math.sin(t * 0.5) * 0.15;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Outer glow */}
      <mesh>
        <sphereGeometry args={[0.7, 8, 6]} />
        <meshStandardMaterial
          color={avatarColor.map(c => c * 0.5)}
          emissive={avatarColor}
          emissiveIntensity={0.6}
          transparent
          opacity={0.15}
          roughness={1}
          metalness={0}
          depthWrite={false}
        />
      </mesh>

      {/* Haupt-Diamant */}
      <group ref={innerRef}>
        <mesh castShadow>
          <octahedronGeometry args={[0.35, 0]} />
          <meshStandardMaterial
            color={avatarColor}
            emissive={avatarColor}
            emissiveIntensity={1.2}
            roughness={0.2}
            metalness={0.8}
          />
        </mesh>

        {/* Kreuz-Symbol */}
        <mesh rotation={[0, Math.PI / 4, 0]}>
          <boxGeometry args={[0.5, 0.06, 0.06]} />
          <meshStandardMaterial
            color="#ffffff"
            emissive={avatarColor}
            emissiveIntensity={0.8}
            roughness={0.3}
            metalness={0.6}
          />
        </mesh>
        <mesh rotation={[Math.PI / 2, Math.PI / 4, 0]}>
          <boxGeometry args={[0.5, 0.06, 0.06]} />
          <meshStandardMaterial
            color="#ffffff"
            emissive={avatarColor}
            emissiveIntensity={0.8}
            roughness={0.3}
            metalness={0.6}
          />
        </mesh>
      </group>

      {/* Point Light */}
      <pointLight
        position={[0, 0, 0]}
        color={avatarColor}
        intensity={1.5}
        distance={6}
        decay={2}
      />

      {/* Bodenschatten */}
      <mesh
        position={[0, -1.5, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <circleGeometry args={[0.6, 16]} />
        <meshBasicMaterial
          color={avatarColor}
          transparent
          opacity={0.12}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
