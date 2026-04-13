import React, { useMemo } from 'react';
import { Instances, Instance } from '@react-three/drei';
import * as THREE from 'three';
import { axialToCartesian } from '../hooks/useHexGrid';
import { getTerrainHeight } from '../utils/TerrainNoise';
import { hexToThreeColor } from '../hooks/useBiomeColors';

/**
 * InstancedDecor – Rendert Landschafts-Deko (Bäume, Kristalle, etc.)
 * als InstancedMesh für Performance.
 *
 * Pro Tile-Typ wird ein passender Decor-Typ als InstancedMesh gerendert.
 * Nur entdeckte Tiles erhalten Dekor.
 */

// Shared geometries
const coneGeo = new THREE.ConeGeometry(0.18, 0.35, 6);
const cylinderGeo = new THREE.CylinderGeometry(0.04, 0.06, 0.3, 5);
const octaGeo = new THREE.OctahedronGeometry(0.12, 0);
const torusGeo = new THREE.TorusGeometry(0.15, 0.04, 6, 8);
const boxGeo = new THREE.BoxGeometry(0.12, 0.04, 0.18);
const dodecaGeo = new THREE.DodecahedronGeometry(0.15, 0);
const torusKnotGeo = new THREE.TorusKnotGeometry(0.08, 0.025, 32, 8, 2, 3);

/**
 * Berechnet Dekor-Positionen für ein Tile.
 */
function getDecorPositions(tile, count, spread) {
  const cartPos = axialToCartesian(tile.q, tile.r, 0);
  const height = getTerrainHeight(tile.type, tile.q, tile.r);
  const positions = [];

  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2 + tile.q * 0.5 + tile.r * 0.3;
    const radius = spread * (0.5 + ((i * 7 + tile.q * 3) % 10) / 20);
    positions.push({
      x: cartPos.x + Math.cos(angle) * radius,
      y: height + 0.05,
      z: cartPos.z + Math.sin(angle) * radius,
    });
  }
  return positions;
}

export default function InstancedDecor({ tiles, colors }) {
  // Gruppiere Tiles nach Typ für effizientes Instancing
  const groupedTiles = useMemo(() => {
    const groups = {};
    tiles.forEach((tile) => {
      if (!tile.discovered) return;
      if (!groups[tile.type]) groups[tile.type] = [];
      groups[tile.type].push(tile);
    });
    return groups;
  }, [tiles]);

  const tileColor = (type) => {
    const rgb = hexToThreeColor(colors[type] || colors.unknown);
    return new THREE.Color(rgb[0], rgb[1], rgb[2]);
  };

  return (
    <group>
      {/* ─── WILDS: Bäume + Felsen ─── */}
      {groupedTiles.wilds && groupedTiles.wilds.length > 0 && (
        <>
          {/* Baum-Kronen */}
          <Instances geometry={coneGeo} limit={groupedTiles.wilds.length * 3}>
            <meshStandardMaterial roughness={0.5} metalness={0.3} transparent opacity={0.85} />
            {groupedTiles.wilds.map((tile) => {
              const positions = getDecorPositions(tile, 3, 0.8);
              return positions.slice(0, 2).map((pos, i) => (
                <Instance
                  key={`tree-${tile.index}-${i}`}
                  position={[pos.x, pos.y + 0.3, pos.z]}
                  color={tileColor('wilds')}
                />
              ));
            })}
          </Instances>

          {/* Baum-Stämme */}
          <Instances geometry={cylinderGeo} limit={groupedTiles.wilds.length * 3}>
            <meshStandardMaterial color={[0.35, 0.2, 0.1]} roughness={0.8} />
            {groupedTiles.wilds.map((tile) => {
              const positions = getDecorPositions(tile, 3, 0.8);
              return positions.slice(0, 2).map((pos, i) => (
                <Instance
                  key={`trunk-${tile.index}-${i}`}
                  position={[pos.x, pos.y + 0.15, pos.z]}
                />
              ));
            })}
          </Instances>

          {/* Felsen */}
          <Instances geometry={dodecaGeo} limit={groupedTiles.wilds.length}>
            <meshStandardMaterial roughness={0.8} transparent opacity={0.7} />
            {groupedTiles.wilds.map((tile) => {
              const positions = getDecorPositions(tile, 3, 0.8);
              const pos = positions[2];
              if (!pos) return null;
              return (
                <Instance
                  key={`rock-${tile.index}`}
                  position={[pos.x, pos.y + 0.1, pos.z]}
                  color={tileColor('wilds').clone().multiplyScalar(0.7)}
                />
              );
            })}
          </Instances>
        </>
      )}

      {/* ─── NEXUS: Kristalle ─── */}
      {groupedTiles.nexus && groupedTiles.nexus.length > 0 && (
        <Instances geometry={octaGeo} limit={groupedTiles.nexus.length * 4}>
          <meshStandardMaterial
            roughness={0.2}
            metalness={0.5}
            transparent
            opacity={0.7}
            emissive={tileColor('nexus')}
            emissiveIntensity={0.5}
          />
          {groupedTiles.nexus.map((tile) =>
            getDecorPositions(tile, 4, 0.6).map((pos, i) => (
              <Instance
                key={`crystal-${tile.index}-${i}`}
                position={[pos.x, pos.y + 0.1, pos.z]}
                color={tileColor('nexus')}
              />
            ))
          )}
        </Instances>
      )}

      {/* ─── MONASTERY: Lotos ─── */}
      {groupedTiles.monastery && groupedTiles.monastery.length > 0 && (
        <Instances geometry={torusGeo} limit={groupedTiles.monastery.length * 2}>
          <meshStandardMaterial roughness={0.4} metalness={0.1} transparent opacity={0.85} />
          {groupedTiles.monastery.map((tile) =>
            getDecorPositions(tile, 2, 0.7).map((pos, i) => (
              <Instance
                key={`lotus-${tile.index}-${i}`}
                position={[pos.x, pos.y + 0.05, pos.z]}
                rotation={[-Math.PI / 2, 0, 0]}
                color={tileColor('monastery')}
              />
            ))
          )}
        </Instances>
      )}

      {/* ─── ACADEMY: Bücher ─── */}
      {groupedTiles.academy && groupedTiles.academy.length > 0 && (
        <Instances geometry={boxGeo} limit={groupedTiles.academy.length * 2}>
          <meshStandardMaterial roughness={0.7} transparent opacity={0.85} />
          {groupedTiles.academy.map((tile) =>
            getDecorPositions(tile, 2, 0.6).map((pos, i) => (
              <Instance
                key={`book-${tile.index}-${i}`}
                position={[pos.x, pos.y + 0.04 * (i + 1), pos.z]}
                color={tileColor('academy')}
              />
            ))
          )}
        </Instances>
      )}

      {/* ─── STUDIO: Musiknoten ─── */}
      {groupedTiles.studio && groupedTiles.studio.length > 0 && (
        <Instances geometry={torusKnotGeo} limit={groupedTiles.studio.length * 2}>
          <meshStandardMaterial
            roughness={0.4}
            metalness={0.3}
            transparent
            opacity={0.8}
            emissive={tileColor('studio')}
            emissiveIntensity={0.3}
          />
          {groupedTiles.studio.map((tile) =>
            getDecorPositions(tile, 2, 0.6).map((pos, i) => (
              <Instance
                key={`note-${tile.index}-${i}`}
                position={[pos.x, pos.y + 0.1, pos.z]}
                color={tileColor('studio')}
              />
            ))
          )}
        </Instances>
      )}
    </group>
  );
}
