# ═══════════════════════════════════════════════════════════════════════════
# RealLifeOS Relay API — Dockerfile
# Node 20 Alpine — minimal production image
# ═══════════════════════════════════════════════════════════════════════════
FROM node:20-alpine AS base

# Set working directory
WORKDIR /app

# ─── Install dependencies ─────────────────────────────────────────────────
COPY package.json ./
RUN npm ci --omit=dev --no-audit --no-fund

# ─── Application code ─────────────────────────────────────────────────────
COPY server.js ./
COPY utils.js ./

# ─── Create data directories ──────────────────────────────────────────────
RUN mkdir -p /app/data/assets

# ─── Runtime config ───────────────────────────────────────────────────────
ENV NODE_ENV=production
ENV PORT=3100
ENV DATA_DIR=/app/data

# Expose the API port
EXPOSE 3100

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3100/health || exit 1

# Start the server
CMD ["node", "server.js"]
