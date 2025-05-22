import pkg from "colyseus";
const { Server } = pkg;
import { WebSocketTransport } from "@colyseus/ws-transport";
import { createServer } from "http";
import express from "express";
import cors from "cors";
import { monitor } from "@colyseus/monitor";

// Import our game room
import { GameRoom } from "./rooms/GameRoom";
import { GAME_CONSTANTS } from "./constants/serverConstants";
import config from "./config";
import logger from "./utils/logger";

// Create the Express app
const app = express();

// Apply middleware
app.use(cors());
app.use(express.json());

// Serve static files from the appropriate directory based on environment
if (process.env.NODE_ENV === 'production') {
  app.use(express.static("dist"));
} else {
  app.use(express.static("src"));
}

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

// Define routes
app.get("/", (req, res) => {
  res.send("Multiplayer game server is running");
});

// Register game rooms
gameServer.define(GAME_CONSTANTS.GAME.ROOM_NAME, GameRoom)
  .enableRealtimeListing();

// Register colyseus monitor
app.use(config.monitorPath, monitor());

// Start the server
const port = config.port;
gameServer.listen(port);

logger.info(`
🎮 Last Player Standing Multiplayer Server
---------------------------------------
Server is running on http://localhost:${port}
Monitor dashboard: http://localhost:${port}${config.monitorPath}
`);
