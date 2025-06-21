import pkg from "colyseus";
const { Server } = pkg;
import { WebSocketTransport } from "@colyseus/ws-transport";
import { createServer } from "http";
import express from "express";
import cors from "cors";
import { monitor } from "@colyseus/monitor";
import path from 'path';
import { fileURLToPath } from 'url';

// Import our game room
import { GameRoom } from "./rooms/GameRoom.js";
import { GAME_CONSTANTS } from "./constants/serverConstants.js";
import config from "./config.js";
import logger from "./utils/logger.js";

// ES modules compatibility for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create the Express app
const app = express();

// Apply middleware
app.use(cors());
app.use(express.json());

// Create HTTP server
const httpServer = createServer(app);

// Create colyseus server
const gameServer = new Server({
  transport: new WebSocketTransport({
    server: httpServer,
    pingInterval: config.pingInterval,
    pingMaxRetries: config.pingMaxRetries
  })
});

// IMPORTANT: Define API routes BEFORE static file serving

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    port: config.port
  });
});

// API routes with /api prefix
app.get("/api/status", (req, res) => {
  res.json({
    server: "running",
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// Register game rooms
gameServer.define(GAME_CONSTANTS.GAME.ROOM_NAME, GameRoom)
  .enableRealtimeListing();

// Register colyseus monitor (only in development)
if (process.env.NODE_ENV !== 'production') {
  app.use(config.monitorPath, monitor());
}

// IMPORTANT: Serve static files AFTER all API routes
if (process.env.NODE_ENV === 'production') {
  // Serve static files from the dist directory
  const staticPath = path.join(__dirname, '../../dist');
  app.use(express.static(staticPath));
  
  logger.info(`Serving static files from: ${staticPath}`);
  
  // Handle client-side routing - serve index.html for all non-API routes
  app.get('*', (req, res, next) => {
    // Skip API and WebSocket routes
    if (req.path.startsWith('/api') || 
        req.path.startsWith('/ws') || 
        req.path.startsWith('/health') ||
        req.path.startsWith(config.monitorPath)) {
      return next();
    }
    
    // Serve index.html for all other routes (SPA routing)
    res.sendFile(path.join(staticPath, 'index.html'));
  });
} else {
  // Development mode - don't serve static files, let Vite handle it
  app.get("/", (req, res) => {
    res.json({
      message: "Multiplayer game server is running in development mode",
      websocket: `ws://localhost:${config.port}`,
      frontend: "http://localhost:5173 (served by Vite)",
      monitor: `http://localhost:${config.port}${config.monitorPath}`
    });
  });
}

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start the server
const port = config.port;
gameServer.listen(port);

if (process.env.NODE_ENV === 'production') {
  logger.info(`
🎮 Production Server - Single Port Architecture
-----------------------------------------------
✅ Frontend: http://localhost:${port} (static files)
✅ Backend API: http://localhost:${port}/api/*
✅ WebSocket: ws://localhost:${port}
✅ Environment: ${process.env.NODE_ENV}
-----------------------------------------------
Everything runs on port ${port} 🚀
`);
} else {
  logger.info(`
🎮 Development Server
---------------------------------------
Backend: http://localhost:${port}
Frontend: http://localhost:5173 (Vite)
Monitor: http://localhost:${port}${config.monitorPath}
Environment: ${process.env.NODE_ENV || 'development'}
`);
}
