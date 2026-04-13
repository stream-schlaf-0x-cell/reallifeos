import React, { useRef } from 'react';
import { ContactShadows } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';

/**
 * MapOrchestrator – Zentrales Scene-Management.
 *
 * Bündelt:
 * - Beleuchtung (Ambient + Directional + Point)
 * - ContactShadows für Bodenschatten
 * - Bloom Post-Processing für emissive Materialien
 * - Vignette für cinematographischen Look
 */
export default function MapOrchestrator() {
  const shadowRef = useRef();

  return (
    <>
      {/* ═══ BELEUCHTUNG ═══ */}
      {/* Weiches Umgebungslicht */}
      <ambientLight intensity={0.35} color="#c8d6e5" />

      {/* Hauptlicht – warm, von oben-rechts */}
      <directionalLight
        position={[12, 20, 8]}
        intensity={0.9}
        color="#fff4e6"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={0.5}
        shadow-camera-far={60}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
        shadow-bias={-0.001}
      />

      {/* Fülllicht – kühl, von links */}
      <directionalLight
        position={[-10, 8, -10]}
        intensity={0.25}
        color="#a0c4ff"
      />

      {/* Akzentlicht – Lila, von unten */}
      <pointLight
        position={[0, -2, 0]}
        intensity={0.4}
        color="#8b5cf6"
        distance={30}
        decay={2}
      />

      {/* Hemisphere Light für natürliche Himmelsfarbe */}
      <hemisphereLight
        args={['#87ceeb', '#362a1a', 0.2]}
      />

      {/* ═══ SCHATTEN ═══ */}
      {/* ContactShadows – weiche Kontakt-Schatten auf dem Boden */}
      <ContactShadows
        ref={shadowRef}
        position={[0, -3.05, 0]}
        opacity={0.5}
        scale={40}
        blur={2.5}
        far={6}
        resolution={512}
        color="#000000"
      />

      {/* ═══ POST-PROCESSING ═══ */}
      <EffectComposer
        disableNormalPass
        multisampling={4}
      >
        {/* Bloom – Glow für alle emissive Materialien */}
        <Bloom
          intensity={0.6}
          luminanceThreshold={0.15}
          luminanceSmoothing={0.9}
          mipmapBlur
          radius={0.4}
        />

        {/* Vignette – dunkle Ränder für Film-Look */}
        <Vignette
          eskil={false}
          offset={0.1}
          darkness={0.5}
        />
      </EffectComposer>

      {/* ═══ HINTERGRUND ═══ */}
      <color attach="background" args={['#020617']} />

      {/* Atmosphärischer Nebel */}
      <fog attach="fog" args={['#020617', 20, 50]} />
    </>
  );
}
