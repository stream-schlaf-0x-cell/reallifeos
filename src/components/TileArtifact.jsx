import React, { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { axialToCartesian, getTileHeight } from '../hooks/useHexGrid';

/**
 * TileArtifact – KI-Bilder als kleine leuchtende Plane-Texturen auf der Hex-Oberfläche.
 *
 * STATT großer Html-Billboards werden Bilder als Rune/Artefakt in die
 * Tile-Oberfläche eingelassen. Sie sind maximal halb so groß wie das Hex.
 *
 * Zoom-Logik: Bei Nah-Zoom (camera distance < threshold) wird die Opazität
 * reduziert um die Sicht nicht zu blockieren.
 */
export default function TileArtifact({ tile }) {
  const meshRef = useRef();
  const glowRef = useRef();
  const [texture, setTexture] = useState(null);
  const [opacity, setOpacity] = useState(0);

  const cartPos = useMemo(
    () => axialToCartesian(tile.q, tile.r, 0),
    [tile.q, tile.r]
  );
  const height = getTileHeight(tile.type, tile.q, tile.r);

  // Asset-URL
  const assetSrc = useMemo(
    () => `/data/assets/${tile.type}_${tile.q}_${tile.r}.png`,
    [tile.type, tile.q, tile.r]
  );

  // Texture manuell laden
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
          setTexture(tex);
        }
      },
      undefined,
      () => {
        // Error – silently ignore
      }
    );

    return () => {
      cancelled = true;
    };
  }, [assetSrc, tile.discovered, tile.type, tile.q, tile.r]);

  // Zoom-basierte Opazität
  useFrame(({ camera }) => {
    if (!meshRef.current) return;

    const dx = camera.position.x - meshRef.current.position.x;
    const dy = camera.position.y - meshRef.current.position.y;
    const dz = camera.position.z - meshRef.current.position.z;
    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

    // Opazität: Nah (< 8): 0  |  Mittel (8-14): linear  |  Fern (> 14): 0.8
    const nearT = 8;
    const farT = 14;
    let op = 0.8;
    if (dist < nearT) op = 0;
    else if (dist < farT) op = 0.8 * ((dist - nearT) / (farT - nearT));

    setOpacity(op);

    // Pulsierender Glow
    const t = performance.now() / 1000;
    const pulse = 1 + Math.sin(t * 2 + tile.q + tile.r) * 0.04;
    if (glowRef.current) {
      glowRef.current.scale.set(pulse, pulse, pulse);
    }
  });

  if (!tile.discovered || !texture) return null;

  const artifactSize = 0.7;

  return (
    <group position={[cartPos.x, height + 0.025, cartPos.z]}>
      {/* Glow-Rand */}
      <mesh ref={glowRef} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[artifactSize + 0.1, artifactSize + 0.1]} />
        <meshStandardMaterial
          color={[0.55, 0.36, 0.96]}
          emissive={[0.55, 0.36, 0.96]}
          emissiveIntensity={0.5}
          transparent
          opacity={opacity * 0.5}
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
          opacity={opacity}
          roughness={0.5}
          metalness={0.1}
          depthWrite={true}
        />
      </mesh>
    </group>
  );
}
