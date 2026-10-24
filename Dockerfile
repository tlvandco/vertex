# Multi-stage production Dockerfile for VERTEX Studio
# Optimized for free container hosts: Render, Fly.io, Railway, Google Cloud Run

# Stage 1: Build stage
FROM node:22-alpine AS builder
WORKDIR /app

# Install build dependencies
COPY package.json package-lock.json* ./
RUN npm ci

# Copy source code and build production assets
COPY . .
RUN npm run build

# Stage 2: Runtime stage
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Install production dependencies only
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy compiled SPA bundle and bundled server.cjs
COPY --from=builder /app/dist ./dist

# Create persistent data volume directory
RUN mkdir -p /app/data && chown -R node:node /app
USER node

EXPOSE 3000

# Container healthcheck for Render / Cloud Run / Kubernetes
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

CMD ["node", "dist/server.cjs"]
