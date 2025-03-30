const { Server } = require("colyseus");
const { WebSocketTransport } = require("@colyseus/ws-transport");
const { createServer } = require("http");
const express = require("express");
const cors = require("cors");
const { monitor } = require("@colyseus/monitor");

// Import our game room
const { GameRoom } = require("./rooms/GameRoom.js");
const { GAME_CONSTANTS } = require("../shared/utils/gameConstants.cjs");

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
    pingInterval: 5000, // Ping clients every 5 seconds
    pingMaxRetries: 3 // Allow max 3 missed pings before considering connection lost
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
app.use("/colyseus", monitor());

// Start the server
const port = process.env.PORT || 3000;
gameServer.listen(port);

console.log(`
🎮 Last Player Standing Multiplayer Server
---------------------------------------
Server is running on http://localhost:${port}
Monitor dashboard: http://localhost:${port}/colyseus
`);
