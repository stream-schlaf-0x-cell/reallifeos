import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { axialToCartesian, getTileHeight } from '../hooks/useHexGrid';
import { hexToThreeColor } from '../hooks/useBiomeColors';

/**
 * PlayerAvatar – Schwebender Low-Poly Monk (Oktaeder-Diamant).
 *
 * Hängt über dem playerPosition-Tile, rotiert sanft und pulsiert.
 * Der Avatar dient als visueller Anker und Kamera-Zielpunkt.
 */
export default function PlayerAvatar({ playerPos, colors }) {
  const groupRef = useRef();
  const innerRef = useRef();

  const cartPos = useMemo(() => {
    const height = getTileHeight('nexus', playerPos.q, playerPos.r);
    return axialToCartesian(playerPos.q, playerPos.r, height);
  }, [playerPos.q, playerPos.r]);

  const avatarColor = useMemo(() => hexToThreeColor(colors.playerRing), [colors]);
  const glowColor = useMemo(() => hexToThreeColor(colors.playerRing).map(c => c * 0.5), [colors]);

  // Floating animation
  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    // Sanftes Schweben
    groupRef.current.position.y = cartPos.y + 1.8 + Math.sin(t * 1.5) * 0.25;
    // Langsame Rotation
    if (innerRef.current) {
      innerRef.current.rotation.y = t * 0.8;
      innerRef.current.rotation.x = Math.sin(t * 0.5) * 0.15;
    }
  });

  return (
    <group ref={groupRef} position={[cartPos.x, cartPos.y + 1.8, cartPos.z]}>
      {/* Outer glow sphere (transparent) */}
      <mesh>
        <sphereGeometry args={[0.7, 8, 6]} />
        <meshStandardMaterial
          color={glowColor}
          emissive={avatarColor}
          emissiveIntensity={0.6}
          transparent
          opacity={0.15}
          roughness={1}
          metalness={0}
        />
      </mesh>

      {/* Haupt-Diamant (Oktaeder) */}
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

        {/* Inneres Kreuz – Monk Symbol */}
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

      {/* Point Light am Avatar */}
      <pointLight
        position={[0, 0, 0]}
        color={avatarColor}
        intensity={1.5}
        distance={6}
        decay={2}
      />

      {/* Bodenschatten */}
      <mesh position={[0, -cartPos.y - 1.8, 0]} rotation={[-Math.PI / 2, 0, 0]}>
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
