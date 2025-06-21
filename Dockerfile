# Multi-stage build for optimized single container

# Stage 1: Build everything
FROM node:18-alpine AS builder
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY server/package*.json ./server/

# Install all dependencies
RUN npm ci --legacy-peer-deps
RUN cd server && npm ci --legacy-peer-deps

# Copy source files
COPY . .

# Build frontend with Vite
RUN npm run build:client

# Build server TypeScript
RUN cd server && npm run build

# Stage 2: Production runtime
FROM node:18-alpine
WORKDIR /app

# Install production dependencies only
COPY server/package*.json ./server/
RUN cd server && npm ci --production --legacy-peer-deps

# Copy built frontend (static files)
COPY --from=builder /app/dist ./dist

# Copy compiled server
COPY --from=builder /app/server/dist ./server/dist

# Environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Only expose the backend port (serves everything)
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Start the server (which serves both frontend and backend)
CMD ["node", "server/dist/index.js"]
