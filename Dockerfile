# Multi-stage build for optimized container size
FROM node:22-alpine AS builder
WORKDIR /app

# Copy package files for better layer caching
COPY package*.json ./
COPY server/package*.json ./server/

# Install dependencies
RUN npm ci
RUN cd server && npm ci

# Copy source code
COPY . .

# Build client and server
RUN npm run dev

# Production stage
FROM node:22-alpine
WORKDIR /app

# Copy only production dependencies
COPY server/package*.json ./server/
RUN cd server && npm ci --omit=dev

# Copy built assets from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server/dist ./server/dist

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Start the server
CMD ["node", "server/dist/index.js"]