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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create the Express app
const app = express();

// Apply middleware
app.use(cors());
app.use(express.json());

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, '../dist')));

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

// Health check endpoint (required for container health monitoring)
app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Define routes
app.get("/", (req, res) => {
  res.send("Multiplayer game server is running");
});

// Register game rooms
gameServer.define(GAME_CONSTANTS.GAME.ROOM_NAME, GameRoom)
  .enableRealtimeListing();

// Register colyseus monitor
app.use(config.monitorPath, monitor());

// Catch-all route - serve index.html for client-side routing (must be last)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// Start the server
const port = config.port;
gameServer.listen(port);

logger.info(`
🎮 Last Player Standing Multiplayer Server
---------------------------------------
Server is running on http://localhost:${port}
Monitor dashboard: http://localhost:${port}${config.monitorPath}
`);
