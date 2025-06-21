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

// API routes
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

// Register colyseus monitor
app.use(config.monitorPath, monitor());

// IMPORTANT: Serve static files AFTER all API routes
if (process.env.NODE_ENV === 'production') {
  // Serve static files from the dist directory
  const staticPath = path.join(__dirname, '../../dist');
  app.use(express.static(staticPath));
  
  logger.info(`Serving static files from: ${staticPath}`);
  
  // TODO: Add proper SPA routing handler for production
  // For now, just serve static files
} else {
  // Development mode - serve from src directory
  app.use(express.static("src"));
  
  // Root route for development
  app.get("/", (req, res) => {
    res.send("Multiplayer game server is running in development mode");
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

logger.info(`
🎮 Last Player Standing Multiplayer Server
---------------------------------------
Server is running on http://localhost:${port}
Monitor dashboard: http://localhost:${port}${config.monitorPath}
Environment: ${process.env.NODE_ENV || 'development'}
`);
