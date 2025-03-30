# Multi-stage build for optimized image size

# Stage 1: Build client assets
FROM node:18-alpine AS client-builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Set up server
FROM node:18-alpine
WORKDIR /app
# Copy server dependencies and install
COPY server/package*.json ./server/
RUN cd server && npm install --production
# Copy shared utilities
COPY shared ./shared
# Copy built client assets
COPY --from=client-builder /app/dist ./dist
# Copy server code
COPY server ./server
# Environment variables
ENV NODE_ENV=production
ENV PORT=3000
# Expose required ports
EXPOSE 3000
# Start command
CMD ["node", "server/index.js"]
