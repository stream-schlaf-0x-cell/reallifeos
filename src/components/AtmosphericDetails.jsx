import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * AtmosphericDetails – Mikro-Deko für lebendige Welt.
 */

/**
 * Deterministischer PRNG – vermeidet Math.random in React render.
 */
function createRng(seed) {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Ambient Dust – Langsam driftende Partikel.
 */
export function AmbientDust({ count = 200, spread = 30 }) {
  const geoRef = useRef();

  const { positions, velocities } = useMemo(() => {
    const rng = createRng(42);
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (rng() - 0.5) * spread;
      pos[i * 3 + 1] = rng() * 8 - 1;
      pos[i * 3 + 2] = (rng() - 0.5) * spread;
      vel[i * 3] = (rng() - 0.5) * 0.003;
      vel[i * 3 + 1] = rng() * 0.002 + 0.001;
      vel[i * 3 + 2] = (rng() - 0.5) * 0.003;
    }
    return { positions: pos, velocities: vel };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sizes = useMemo(() => {
    const rng = createRng(99);
    const arr = new Float32Array(count);
    for (let i = 0; i < count; i++) arr[i] = rng() * 2 + 1;
    return arr;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useFrame(() => {
    const posAttr = geoRef.current?.attributes.position;
    if (!posAttr) return;
    for (let i = 0; i < count; i++) {
      let x = posAttr.getX(i) + velocities[i * 3];
      let y = posAttr.getY(i) + velocities[i * 3 + 1];
      let z = posAttr.getZ(i) + velocities[i * 3 + 2];
      const half = spread / 2;
      if (x > half) x = -half; if (x < -half) x = half;
      if (y > 8) y = -1; if (y < -1) y = 8;
      if (z > half) z = -half; if (z < -half) z = half;
      posAttr.setXYZ(i, x, y, z);
    }
    posAttr.needsUpdate = true;
  });

  return (
    <points ref={(r) => { if (r) geoRef.current = r.geometry; }}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-size" args={[sizes, 1]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.08}
        color="#8b5cf6"
        transparent
        opacity={0.15}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/**
 * Floating Spores – Leuchtende Mini-Partikel.
 */
export function FloatingSpores({ count = 80, spread = 25 }) {
  const meshRef = useRef();

  const positions = useMemo(() => {
    const rng = createRng(77);
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (rng() - 0.5) * spread;
      arr[i * 3 + 1] = rng() * 6;
      arr[i * 3 + 2] = (rng() - 0.5) * spread;
    }
    return arr;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    const posAttr = meshRef.current.geometry.attributes.position;
    for (let i = 0; i < count; i++) {
      let y = posAttr.getY(i) + delta * 0.15;
      if (y > 8) y = 0;
      posAttr.setY(i, y);
    }
    posAttr.needsUpdate = true;
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        color="#f59e0b"
        transparent
        opacity={0.25}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
