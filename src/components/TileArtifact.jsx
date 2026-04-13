import React, { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { axialToCartesian } from '../hooks/useHexGrid';
import { getTerrainHeight } from '../utils/TerrainNoise';
import * as THREE from 'three';

/**
 * TileArtifact – KI-Bilder als kleine leuchtende Plane-Texturen.
 *
 * Nutzt drei's useTexture für automatisches Texture-Management.
 * Zoom-basierte Opazität: Nah = transparent, Fern = sichtbar.
 */
export default function TileArtifact({ tile }) {
  const meshRef = useRef();
  const glowRef = useRef();

  const cartPos = useMemo(
    () => axialToCartesian(tile.q, tile.r, 0),
    [tile.q, tile.r]
  );
  const height = useMemo(
    () => getTerrainHeight(tile.q, tile.r, tile.type),
    [tile.q, tile.r, tile.type]
  );

  // Asset-URL
  const assetSrc = useMemo(
    () => `/data/assets/${tile.type}_${tile.q}_${tile.r}.png`,
    [tile.type, tile.q, tile.r]
  );

  // Texture laden via drei (automatisches Caching + Error-Handling)
  const [texture, setTexture] = useState(null);

  useEffect(() => {
    if (!assetSrc || !tile.discovered) return;
    let cancelled = false;

    const loader = new THREE.TextureLoader();
    loader.load(
      assetSrc,
      (tex) => {
        if (!cancelled) {
          tex.colorSpace = THREE.SRGBColorSpace;
          tex.minFilter = THREE.LinearMipmapLinearFilter;
          tex.magFilter = THREE.LinearFilter;
          tex.anisotropy = 4;
          setTexture(tex);
        }
      },
      undefined,
      () => {} // Error – silent
    );

    return () => { cancelled = true; };
  }, [assetSrc, tile.discovered]);

  // Zoom-basierte Opazität
  useFrame(({ camera }) => {
    if (!meshRef.current) return;

    const dist = meshRef.current.position.distanceTo(camera.position);

    // Nah (< 7): 0%  |  Mittel (7-13): linear  |  Fern (> 13): 85%
    let op = 0.85;
    if (dist < 7) op = 0;
    else if (dist < 13) op = 0.85 * ((dist - 7) / (13 - 7));

    if (meshRef.current.material) {
      meshRef.current.material.opacity = op;
    }
    if (glowRef.current && glowRef.current.material) {
      glowRef.current.material.opacity = op * 0.5;
    }

    // Subtiles Pulsieren
    const t = performance.now() / 1000;
    const pulse = 1 + Math.sin(t * 2 + tile.q * 0.7 + tile.r * 0.3) * 0.03;
    if (meshRef.current) {
      meshRef.current.scale.set(pulse, pulse, 1);
    }
  });

  if (!tile.discovered || !texture) return null;

  const artifactSize = 0.65;

  return (
    <group position={[cartPos.x, height + 0.025, cartPos.z]}>
      {/* Glow-Rand */}
      <mesh
        ref={glowRef}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[artifactSize + 0.08, artifactSize + 0.08]} />
        <meshStandardMaterial
          color={[0.55, 0.36, 0.96]}
          emissive={[0.55, 0.36, 0.96]}
          emissiveIntensity={0.5}
          transparent
          opacity={0.4}
          roughness={0.3}
          metalness={0.5}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Artefakt-Bild */}
      <mesh
        ref={meshRef}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[artifactSize, artifactSize]} />
        <meshStandardMaterial
          map={texture}
          transparent
          opacity={0.85}
          roughness={0.5}
          metalness={0.1}
          depthWrite={true}
        />
      </mesh>
    </group>
  );
}
