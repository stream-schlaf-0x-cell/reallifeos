import React, { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { axialToCartesian } from '../hooks/useHexGrid';
import { getTerrainHeight } from '../utils/TerrainNoise';
import * as THREE from 'three';

/**
 * FollowCamera – Smooth, damped camera that follows the player.
 *
 * Uses manual lerp for silky-smooth movement.
 * No maath dependency needed – simple exponential smoothing works perfectly.
 */
export default function FollowCamera({ playerPos, enabled = true }) {
  const { camera } = useThree();
  const isInitial = useRef(true);

  // Smooth follow targets
  const currentPos = useRef(new THREE.Vector3(0, 18, 18));
  const currentLookAt = useRef(new THREE.Vector3(0, 0, 0));

  const playerCartPos = useMemo(() => {
    const height = getTerrainHeight(playerPos.q, playerPos.r, 'nexus');
    return axialToCartesian(playerPos.q, playerPos.r, height);
  }, [playerPos.q, playerPos.r]);

  // Desired camera offset relative to player
  const CAMERA_OFFSET = new THREE.Vector3(0, 16, 16);

  useFrame((_, delta) => {
    if (!enabled) return;

    // Clamp delta to avoid spiral of death
    const dt = Math.min(delta, 0.05);

    // Target position = player + offset
    const targetPos = new THREE.Vector3(
      playerCartPos.x + CAMERA_OFFSET.x,
      playerCartPos.y + CAMERA_OFFSET.y,
      playerCartPos.z + CAMERA_OFFSET.z
    );

    // Target look-at = player position + slight height
    const targetLook = new THREE.Vector3(
      playerCartPos.x,
      playerCartPos.y + 1.0,
      playerCartPos.z
    );

    if (isInitial.current) {
      camera.position.copy(targetPos);
      currentPos.current.copy(targetPos);
      camera.lookAt(targetLook);
      currentLookAt.current.copy(targetLook);
      isInitial.current = false;
      return;
    }

    // Exponential smoothing (lerp factor per second)
    // Higher = snappier, Lower = more cinematic drift
    const posLerp = 1 - Math.pow(0.01, dt);  // ~4.6x smoothing
    const lookLerp = 1 - Math.pow(0.02, dt); // Slightly slower for cinematic feel

    // Smoothly interpolate position
    currentPos.current.lerp(targetPos, posLerp * 0.06);
    camera.position.copy(currentPos.current);

    // Smoothly interpolate look-at
    currentLookAt.current.lerp(targetLook, lookLerp * 0.05);
    camera.lookAt(currentLookAt.current);

    // Update OrbitControls target if available
    const controls = camera.userData.controls;
    if (controls) {
      controls.target.lerp(targetLook, lookLerp * 0.08);
    }
  });

  return null;
}
