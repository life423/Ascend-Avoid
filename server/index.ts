import pkg from "colyseus";
const { Server } = pkg;
import { WebSocketTransport } from "@colyseus/ws-transport";
import { createServer } from "http";
import express from "express";
import cors from "cors";
import { monitor } from "@colyseus/monitor";

// Import our game room
import { GameRoom } from "./rooms/GameRoom";
import { GAME_CONSTANTS, SERVER } from "./constants/serverConstants";

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
    pingInterval: SERVER.PING_INTERVAL, // Use constant from serverConstants
    pingMaxRetries: SERVER.PING_MAX_RETRIES // Use constant from serverConstants
  })
});

// Define routes
app.get("/", (req, res) => {
  res.send("Multiplayer game server is running");
});

// Register game rooms
gameServer.define(GAME_CONSTANTS.GAME.ROOM_NAME, GameRoom)
  .enableRealtimeListing();

// Register colyseus monitor (available at /colyseus)
app.use(SERVER.MONITOR_PATH, monitor());

// Start the server
const port = Number(process.env.PORT) || SERVER.DEFAULT_PORT;
gameServer.listen(port);

console.log(`
🎮 Last Player Standing Multiplayer Server
---------------------------------------
Server is running on http://localhost:${port}
Monitor dashboard: http://localhost:${port}${SERVER.MONITOR_PATH}
`);
