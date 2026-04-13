import React, { useRef } from 'react';
import { ContactShadows } from '@react-three/drei';
import { EffectComposer, Bloom, TiltShift2, GodRays, Vignette } from '@react-three/postprocessing';

/**
 * MapOrchestrator – Zentrales Scene-Management.
 *
 * Bündelt:
 * - Beleuchtung (Ambient + Directional + Hemisphere + Point)
 * - ContactShadows für Bodenschatten
 * - Post-Processing: Bloom, TiltShift (DOF), GodRays, Vignette
 */
export default function MapOrchestrator() {
  const godRaysRef = useRef();
  const sunRef = useRef();

  return (
    <>
      {/* ═══ BELEUCHTUNG ═══ */}
      {/* Warmes Umgebungslicht */}
      <ambientLight intensity={0.3} color="#c8d6e5" />

      {/* Hauptlicht – warm, von oben-rechts (auch GodRays-Quelle) */}
      <directionalLight
        ref={sunRef}
        position={[12, 20, 8]}
        intensity={0.8}
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

      {/* Hemisphere Light für natürliche Himmels-/Bodenfarbe */}
      <hemisphereLight args={['#87ceeb', '#362a1a', 0.15]} />

      {/* ═══ SCHATTEN ═══ */}
      <ContactShadows
        position={[0, -3.05, 0]}
        opacity={0.45}
        scale={40}
        blur={2.5}
        far={6}
        resolution={512}
        color="#000000"
      />

      {/* ═══ POST-PROCESSING ═══ */}
      <EffectComposer
        disableNormalPass
        multisampling={2}
      >
        {/* Bloom – selektiver Glow für emissive Materialien */}
        <Bloom
          intensity={0.5}
          luminanceThreshold={0.2}
          luminanceSmoothing={0.92}
          mipmapBlur
          radius={0.35}
        />

        {/* Tilt-Shift / Miniature DOF – Diorama-Effekt */}
        <TiltShift2
          blur={0.15}
        />

        {/* GodRays – Volumetrisches Licht von der Sonne */}
        <GodRays
          ref={godRaysRef}
          sun={sunRef}
          samples={40}
          density={0.9}
          decay={0.96}
          weight={0.4}
          exposure={0.12}
          clampMax={1.0}
        />

        {/* Vignette – dunkle Ränder für Film-Look */}
        <Vignette
          eskil={false}
          offset={0.12}
          darkness={0.45}
        />
      </EffectComposer>

      {/* ═══ HINTERGRUND ═══ */}
      <color attach="background" args={['#020617']} />

      {/* Atmosphärischer Nebel */}
      <fog attach="fog" args={['#020617', 22, 55]} />
    </>
  );
}
