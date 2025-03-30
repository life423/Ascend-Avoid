// Use global Colyseus object instead of importing it
// import { Client } from "colyseus.js";
import { GAME_CONSTANTS, PLAYER_COLORS } from "./gameConstants.js";

/**
 * Manages the multiplayer connection and synchronization with the server
 */
export default class MultiplayerManager {
  constructor() {
    // Initialize properties
    this.client = null;
    this.room = null;
    this.isConnected = false;
    this.isMultiplayerMode = false;
    this.localSessionId = null;
    this.serverAddress = "ws://localhost:3000"; // Default server address
    
    // Game state
    this.gameState = null;
    this.players = {};
    this.obstacles = [];
    this.remotePlayers = {};
    
    // Callbacks for game events
    this.onPlayerJoin = null;
    this.onPlayerLeave = null;
    this.onGameStateChange = null;
    this.onConnectionError = null;
    this.onConnectionSuccess = null;
    this.onGameOver = null;
    
    // Input buffer for prediction
    this.inputBuffer = [];
    
    // Bind methods to this instance
    this.handleRoomStateChange = this.handleRoomStateChange.bind(this);
    this.handlePlayerJoined = this.handlePlayerJoined.bind(this);
    this.handlePlayerLeft = this.handlePlayerLeft.bind(this);
  }
  
  /**
   * Initialize the multiplayer client
   */
  init() {
    // Create Colyseus client using global Colyseus object
    if (typeof Colyseus !== 'undefined') {
      this.client = new Colyseus.Client(this.serverAddress);
      console.log("Multiplayer client initialized");
    } else {
      console.error("Colyseus client not loaded. Make sure you've included the Colyseus script in your HTML.");
    }
    
    return this;
  }
  
  /**
   * Set server address
   */
  setServerAddress(address) {
    this.serverAddress = address;
    if (this.client) {
      this.client.endpoint = address;
    }
    return this;
  }
  
  /**
   * Connect to the multiplayer server
   */
  async connect(playerName = "Player") {
    if (!this.client) {
      this.init();
    }
    
    try {
      console.log("Connecting to game server...");
      
      // Join or create a room
      this.room = await this.client.joinOrCreate(GAME_CONSTANTS.GAME.ROOM_NAME, {
        name: playerName
      });
      
      // Set up room event handlers
      this.setupRoomHandlers();
      
      // Set connection state
      this.isConnected = true;
      this.isMultiplayerMode = true;
      this.localSessionId = this.room.sessionId;
      
      console.log(`Connected to room: ${this.room.id} as ${this.room.sessionId}`);
      
      // Call success callback if defined
      if (this.onConnectionSuccess) {
        this.onConnectionSuccess();
      }
      
      return true;
    } catch (error) {
      console.error("Connection error:", error);
      
      // Call error callback if defined
      if (this.onConnectionError) {
        this.onConnectionError(error.message);
      }
      
      return false;
    }
  }
  
  /**
   * Set up room event handlers
   */
  setupRoomHandlers() {
    if (!this.room) return;
    
    // Handle state changes
    this.room.onStateChange(this.handleRoomStateChange);
    
    // Handle player join/leave events
    this.room.onMessage("playerJoined", this.handlePlayerJoined);
    this.room.onMessage("playerLeft", this.handlePlayerLeft);
    
    // Handle disconnection
    this.room.onLeave((code) => {
      this.isConnected = false;
      console.log(`Left room: ${code}`);
    });
  }
  
  /**
   * Handle room state changes
   */
  handleRoomStateChange(state) {
    this.gameState = state;
    
    // Extract players from state
    this.players = this.gameState.players;
    
    // Extract obstacles from state
    this.obstacles = this.gameState.obstacles;
    
    // Update remote players collection
    this.updateRemotePlayers();
    
    // Check for game over
    if (state.gameState === GAME_CONSTANTS.STATE.GAME_OVER && this.onGameOver) {
      this.onGameOver(state.winnerName);
    }
    
    // Call state change callback if defined
    if (this.onGameStateChange) {
      this.onGameStateChange(state);
    }
  }
  
  /**
   * Update remote players collection
   */
  updateRemotePlayers() {
    this.remotePlayers = {};
    
    // Add all players except local player to the remote players collection
    for (const sessionId in this.players) {
      if (sessionId !== this.localSessionId) {
        this.remotePlayers[sessionId] = this.players[sessionId];
      }
    }
  }
  
  /**
   * Handle player joined event
   */
  handlePlayerJoined(data) {
    console.log(`Player joined: ${data.name} (${data.id})`);
    
    if (this.onPlayerJoin) {
      this.onPlayerJoin(data);
    }
  }
  
  /**
   * Handle player left event
   */
  handlePlayerLeft(data) {
    console.log(`Player left: ${data.id}`);
    
    if (this.onPlayerLeave) {
      this.onPlayerLeave(data);
    }
  }
  
  /**
   * Send player input to server
   */
  sendInput(inputState) {
    if (!this.isConnected || !this.room) return;
    
    // Add input to local buffer for prediction
    this.inputBuffer.push({
      input: inputState,
      timestamp: Date.now()
    });
    
    // Send input to server
    this.room.send("input", inputState);
  }
  
  /**
   * Get the local player object
   */
  getLocalPlayer() {
    if (!this.isConnected || !this.localSessionId || !this.players) return null;
    
    return this.players[this.localSessionId];
  }
  
  /**
   * Get a player's color based on their index
   */
  getPlayerColor(playerIndex) {
    return PLAYER_COLORS[playerIndex % PLAYER_COLORS.length];
  }
  
  /**
   * Request game restart
   */
  requestRestart() {
    if (!this.isConnected || !this.room) return;
    
    this.room.send("restartGame");
  }
  
  /**
   * Update player name
   */
  updatePlayerName(name) {
    if (!this.isConnected || !this.room) return;
    
    this.room.send("updateName", { name });
  }
  
  /**
   * Disconnect from the server
   */
  disconnect() {
    if (!this.isConnected || !this.room) return;
    
    console.log("Disconnecting from server...");
    this.room.leave();
    this.isConnected = false;
    this.isMultiplayerMode = false;
    this.room = null;
    
    console.log("Disconnected from server");
  }
  
  /**
   * Check if in multiplayer mode
   */
  isInMultiplayerMode() {
    return this.isMultiplayerMode;
  }
  
  /**
   * Get the current game state
   */
  getGameState() {
    return this.gameState?.gameState || GAME_CONSTANTS.STATE.WAITING;
  }
  
  /**
   * Get arena statistics (size, shrinking, etc.)
   */
  getArenaStats() {
    if (!this.gameState) return null;
    
    return {
      width: this.gameState.arenaWidth,
      height: this.gameState.arenaHeight,
      areaPercentage: this.gameState.areaPercentage,
      elapsedTime: this.gameState.elapsedTime,
      countdownTime: this.gameState.countdownTime
    };
  }
  
  /**
   * Get all remote players
   */
  getRemotePlayers() {
    return this.remotePlayers;
  }
  
  /**
   * Get server-synchronized obstacles
   */
  getObstacles() {
    return this.obstacles || [];
  }
  
  /**
   * Get player alive count
   */
  getAliveCount() {
    return this.gameState?.aliveCount || 0;
  }
  
  /**
   * Get total player count
   */
  getTotalPlayers() {
    return this.gameState?.totalPlayers || 0;
  }
  
  /**
   * Clean up resources
   */
  dispose() {
    this.disconnect();
    this.client = null;
  }
}
