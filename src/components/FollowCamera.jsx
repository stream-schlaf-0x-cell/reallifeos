import React, { useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { axialToCartesian, getTileHeight } from '../hooks/useHexGrid';
import * as THREE from 'three';

/**
 * FollowCamera – Kamera folgt dem PlayerAvatar per Lerp.
 */
export default function FollowCamera({ playerPos, enabled = true }) {
  const { camera } = useThree();

  const playerCartPos = useMemo(() => {
    const height = getTileHeight('nexus', playerPos.q, playerPos.r);
    return axialToCartesian(playerPos.q, playerPos.r, height);
  }, [playerPos.q, playerPos.r]);

  const cameraTarget = useMemo(() => {
    return new THREE.Vector3(
      playerCartPos.x,
      playerCartPos.y + 16,
      playerCartPos.z + 16
    );
  }, [playerCartPos]);

  const lookTarget = useMemo(() => {
    return new THREE.Vector3(
      playerCartPos.x,
      playerCartPos.y + 1.0,
      playerCartPos.z
    );
  }, [playerCartPos]);

  useFrame((_, delta) => {
    if (!enabled) return;

    const clampedDelta = Math.min(delta, 0.05);
    const lerpFactor = 1 - Math.pow(0.001, clampedDelta);

    // Kamera-Position lerp
    camera.position.lerp(cameraTarget, lerpFactor * 0.08);

    // LookAt lerp über quaternion
    const lookMatrix = new THREE.Matrix4().lookAt(
      camera.position,
      lookTarget,
      camera.up
    );
    const targetQuat = new THREE.Quaternion().setFromRotationMatrix(lookMatrix);
    camera.quaternion.slerp(targetQuat, lerpFactor * 0.06);

    // OrbitControls target aktualisieren
    const controls = camera.userData.controls;
    if (controls) {
      controls.target.lerp(lookTarget, lerpFactor * 0.1);
      controls.update();
    }
  });

  return null;
}
