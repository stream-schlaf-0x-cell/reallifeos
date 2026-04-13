import React, { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { axialToCartesian, getTileHeight } from '../hooks/useHexGrid';
import FallbackImage from './FallbackImage';

/**
 * TileBillboard – Zeigt POI-Emoji, Boss-Indikatoren und KI-Assets als Billboard
 * auf einem 3D-Hexagon. Nutzt FallbackImage für die 2D-KI-Bilder.
 *
 * PROPS:
 * - tile: Tile-Daten (q, r, type, discovered, generating, mapBoss, name)
 * - colors: Farbtabelle
 * - isPlayerHere: boolean
 * - onBossClick: Callback(tileIndex)
 */
export default function TileBillboard({ tile, colors, isPlayerHere, onBossClick }) {
  const cartPos = useMemo(() => axialToCartesian(tile.q, tile.r, 0), [tile.q, tile.r]);
  const height = getTileHeight(tile.type, tile.q, tile.r);

  if (!tile.discovered && !tile.generating) return null;

  const hasBoss = tile.mapBoss && !tile.mapBoss.defeated;
  const bossDefeated = tile.mapBoss?.defeated;

  return (
    <group position={[cartPos.x, 0, cartPos.z]}>
      {/* POI-Emoji als Text-Label */}
      {tile.discovered && (
        <>
          {/* Boss indicator */}
          {hasBoss && (
            <BossBillboard
              tile={tile}
              height={height}
              onBossClick={onBossClick}
            />
          )}

          {/* Defeated boss marker */}
          {bossDefeated && (
            <Html position={[0, height + 1.8, 0]} center distanceFactor={12}>
              <div
                style={{
                  fontSize: '12px',
                  opacity: 0.5,
                  pointerEvents: 'none',
                  textShadow: '0 0 4px rgba(16, 185, 129, 0.5)',
                }}
              >
                ✅
              </div>
            </Html>
          )}

          {/* POI Emoji Label */}
          <Html position={[0, hasBoss ? height + 1.2 : height + 0.8, 0]} center distanceFactor={12}>
            <div
              style={{
                fontSize: '18px',
                filter: 'drop-shadow(0 0 6px rgba(139, 92, 246, 0.4))',
                pointerEvents: 'none',
                userSelect: 'none',
              }}
            >
              {POI_EMOJI[tile.type] || '❓'}
            </div>
          </Html>

          {/* POI Typ-Label */}
          <Html position={[0, hasBoss ? height + 0.6 : height + 0.3, 0]} center distanceFactor={12}>
            <div
              style={{
                fontSize: '8px',
                fontWeight: 'bold',
                color: colors[tile.type] || colors.unknown,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                whiteSpace: 'nowrap',
                pointerEvents: 'none',
                textShadow: `0 0 8px ${colors[tile.type] || colors.unknown}40`,
              }}
            >
              {getPoiLabel(tile.type)}
            </div>
          </Html>

          {/* Koordinaten */}
          <Html position={[0, height - 0.3, 0]} center distanceFactor={12}>
            <div
              style={{
                fontSize: '7px',
                color: 'rgba(148, 163, 184, 0.4)',
                pointerEvents: 'none',
                whiteSpace: 'nowrap',
              }}
            >
              {tile.q},{tile.r}
            </div>
          </Html>

          {/* Player indicator */}
          {isPlayerHere && (
            <Html position={[0, height + 0.05, 0]} center distanceFactor={12}>
              <div
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: colors.playerRing,
                  boxShadow: `0 0 12px ${colors.playerRing}, 0 0 24px ${colors.playerRing}40`,
                  animation: 'pulse 2s ease-in-out infinite',
                }}
              />
            </Html>
          )}

          {/* KI-Asset Billboard (FallbackImage) */}
          <AssetBillboard tile={tile} height={height} />
        </>
      )}

      {/* Generating state */}
      {tile.generating && (
        <Html position={[0, 0.5, 0]} center distanceFactor={12}>
          <div
            style={{
              fontSize: '12px',
              color: 'rgba(139, 92, 246, 0.6)',
              animation: 'pulse 1.5s ease-in-out infinite',
              pointerEvents: 'none',
            }}
          >
            ⚙️
          </div>
        </Html>
      )}
    </group>
  );
}

/**
 * Boss-Billboard – Skull mit Klick-Handler als 3D-Billboard.
 */
function BossBillboard({ tile, height, onBossClick }) {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.y += delta * 1.5;
  });

  return (
    <group position={[0, height + 1.5, 0]}>
      <Html center distanceFactor={10}>
        <div
          onClick={(e) => {
            e.stopPropagation();
            if (onBossClick && tile.mapBoss && !tile.mapBoss.defeated) {
              onBossClick(tile.index);
            }
          }}
          style={{
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '2px',
          }}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          {/* Skull background circle */}
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              backgroundColor: 'rgba(249, 115, 22, 0.3)',
              border: `2px solid ${hovered ? '#ef4444' : '#f97316'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: hovered
                ? '0 0 16px rgba(239, 68, 68, 0.6)'
                : '0 0 8px rgba(249, 115, 22, 0.4)',
              animation: 'pulse 2s ease-in-out infinite',
              transition: 'box-shadow 0.2s, border-color 0.2s',
            }}
          >
            <span style={{ fontSize: '14px' }}>💀</span>
          </div>
          {/* Boss name */}
          <div
            style={{
              fontSize: '7px',
              color: '#f97316',
              fontWeight: 'bold',
              whiteSpace: 'nowrap',
              maxWidth: '80px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              textAlign: 'center',
              textShadow: '0 0 4px rgba(249, 115, 22, 0.5)',
            }}
          >
            {tile.mapBoss?.name}
          </div>
        </div>
      </Html>
    </group>
  );
}

/**
 * Asset-Billboard – Zeigt das KI-generierte Bild eines Tiles als vertikalen
 * "Papieraufsteller" der sich zur Kamera dreht.
 */
function AssetBillboard({ tile, height }) {
  const assetSrc = tile.discovered ? `/data/assets/${tile.type}_${tile.q}_${tile.r}.png` : null;
  if (!assetSrc) return null;

  return (
    <group position={[0, height + 2.2, 0]}>
      <Html center distanceFactor={10} transform sprite>
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '8px',
            overflow: 'hidden',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            boxShadow: '0 0 12px rgba(139, 92, 246, 0.2)',
          }}
        >
          <FallbackImage
            src={assetSrc}
            alt={`${tile.name || tile.type} (${tile.q},${tile.r})`}
            fallbackIcon={POI_EMOJI[tile.type] || '🎮'}
            width="64px"
            height="64px"
          />
        </div>
      </Html>
    </group>
  );
}

// ─── Helpers ────────────────────────────────────────────────────────────────

const POI_EMOJI = {
  monastery: '🏯',
  academy: '🎓',
  gym: '💪',
  studio: '🎵',
  server: '🖥️',
  wilds: '⚔️',
  nexus: '🌀',
  unknown: '❓',
};

const POI_LABELS = {
  monastery: 'Kloster',
  academy: 'Akademie',
  gym: 'Trainingslager',
  studio: 'Studio',
  server: 'Server-Farm',
  wilds: 'Wildnis',
  nexus: 'Nexus',
};

function getPoiLabel(type) {
  return POI_LABELS[type] || type;
}
