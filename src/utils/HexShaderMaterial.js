/**
 * HexShaderMaterial – Custom Shader-Material für Biome-Blending.
 *
 * Nutzt drei-custom-shader-material nicht direkt (vermeidet extra Dependency).
 * Stattdessen: Eigenes ShaderMaterial das onBeforeCompile nutzt.
 *
 * Features:
 * - Per-Instance Farbe (via instanceColor)
 * - Smooth Biome-Blending über Global Uniforms
 * - Emissive Glow für Kanten
 * - Vertex Displacement für Fog-of-War Animation
 */
import * as THREE from 'three';

/**
 * Erzeugt ein ShaderMaterial für Hex-Tiles mit Biome-Blending.
 *
 * Uniforms:
 * - uBiomeBlend: [0,1] – wie stark zum nächsten Biome geblendet wird
 * - uNextBiomeColor: Ziel-Farbe für Blending
 * - uFogColor: Nebel-Farbe
 * - uFogDensity: Nebel-Dichte
 */
export function createHexShaderMaterial(options = {}) {
  const {
    baseColor = new THREE.Color(0.1, 0.1, 0.2),
    emissiveColor = new THREE.Color(0.3, 0.2, 0.6),
    emissiveIntensity = 0.1,
    transparent = true,
    opacity = 1.0,
  } = options;

  return new THREE.ShaderMaterial({
    uniforms: {
      uBaseColor: { value: baseColor },
      uEmissiveColor: { value: emissiveColor },
      uEmissiveIntensity: { value: emissiveIntensity },
      uOpacity: { value: opacity },
      uTime: { value: 0 },
    },
    vertexShader: `
      attribute vec3 instanceColor;
      attribute float instanceHeight;
      attribute float instanceReveal;
      
      varying vec3 vColor;
      varying vec3 vWorldPosition;
      varying float vReveal;
      varying vec3 vNormal;
      
      void main() {
        vColor = instanceColor;
        vReveal = instanceReveal;
        vNormal = normalize(normalMatrix * normal);
        
        vec3 pos = position;
        // Fog of War: Y-Position basierend auf reveal-Fortschritt
        pos.y = pos.y * instanceReveal - 3.0 * (1.0 - instanceReveal);
        
        vec4 worldPos = instanceMatrix * vec4(pos, 1.0);
        vWorldPosition = worldPos.xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 uBaseColor;
      uniform vec3 uEmissiveColor;
      uniform float uEmissiveIntensity;
      uniform float uOpacity;
      uniform float uTime;
      
      varying vec3 vColor;
      varying vec3 vWorldPosition;
      varying float vReveal;
      varying vec3 vNormal;
      
      void main() {
        // Basis-Farbe mit Instance-Farbe mischen
        vec3 color = mix(uBaseColor, vColor, 0.85);
        
        // Emissive Edge-Glow (Fresnel-ähnlich)
        float fresnel = 1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0)));
        float edgeGlow = pow(fresnel, 2.0) * uEmissiveIntensity;
        color += uEmissiveColor * edgeGlow;
        
        // Fog of War: Fade-Out für unentdeckte Tiles
        float alpha = uOpacity * smoothstep(0.0, 0.3, vReveal);
        
        // Subtile Puls-Animation für entdeckte Tiles
        float pulse = sin(uTime * 0.5 + vWorldPosition.x * 0.3 + vWorldPosition.z * 0.3) * 0.02;
        color += pulse * vColor;
        
        gl_FragColor = vec4(color, alpha);
      }
    `,
    transparent,
    side: THREE.DoubleSide,
    depthWrite: true,
  });
}

/**
 * Erzeugt ein ShaderMaterial für die Tile-Top-Fläche.
 */
export function createTopSurfaceMaterial(options = {}) {
  const {
    baseColor = new THREE.Color(0.12, 0.12, 0.22),
    transparent = true,
    opacity = 1.0,
  } = options;

  return new THREE.ShaderMaterial({
    uniforms: {
      uBaseColor: { value: baseColor },
      uOpacity: { value: opacity },
      uTime: { value: 0 },
    },
    vertexShader: `
      attribute vec3 instanceColor;
      attribute float instanceReveal;
      
      varying vec3 vColor;
      varying vec2 vUv;
      varying float vReveal;
      
      void main() {
        vColor = instanceColor;
        vUv = uv;
        vReveal = instanceReveal;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 uBaseColor;
      uniform float uOpacity;
      uniform float uTime;
      
      varying vec3 vColor;
      varying vec2 vUv;
      varying float vReveal;
      
      void main() {
        // Hex-Muster als subtile Textur
        vec2 p = vUv * 6.0;
        float hexPattern = sin(p.x * 3.14159) * sin(p.y * 3.14159);
        hexPattern = smoothstep(0.3, 0.7, hexPattern) * 0.05;
        
        vec3 color = mix(uBaseColor, vColor, 0.7) + hexPattern;
        float alpha = uOpacity * smoothstep(0.0, 0.3, vReveal);
        
        gl_FragColor = vec4(color, alpha);
      }
    `,
    transparent,
    side: THREE.DoubleSide,
    depthWrite: true,
  });
}
