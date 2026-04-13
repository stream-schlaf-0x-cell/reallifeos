import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'data/*.json'],
      manifest: {
        name: 'RealLifeOS — One Life Game',
        short_name: 'RealLifeOS',
        description: 'A gamified life-management engine. Evolve without recompiling.',
        theme_color: '#020617',
        background_color: '#020617',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'favicon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,json}'],
        runtimeCaching: [
          {
            urlPattern: /^\/data\/.*\.json$/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'game-data-cache',
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60 * 24, // 24 hours
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'static-assets',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
            },
          },
          {
            urlPattern: /\.(?:js|css)$/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'js-css-cache',
            },
          },
          {
            urlPattern: ({ request }) => request.mode === 'navigate',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'html-cache',
            },
          },
        ],
      },
      devOptions: {
        enabled: false, // Enable manually during dev testing
      },
    }),
  ],
  // ─── Dev Server Proxy ───────────────────────────────────────────────
  // Forwards /api/ai/* and /data/* requests to the relay-api container.
  // In Docker, both containers share the same network.
  // Locally (outside Docker), set VITE_RELAY_URL env var.
  server: {
    proxy: {
      '/api/ai': {
        target: process.env.VITE_RELAY_URL || 'http://reallifeos-relay-api:3100',
        changeOrigin: true,
        timeout: 180000,          // 3 Minuten — Dify braucht ~80s für 3 Bilder
        proxyTimeout: 180000,     // 3 Minuten — sonst Vite bricht vorher ab
      },
      '/data': {
        target: process.env.VITE_RELAY_URL || 'http://reallifeos-relay-api:3100',
        changeOrigin: true,
        timeout: 180000,
        proxyTimeout: 180000,
      },
    },
  },
})
