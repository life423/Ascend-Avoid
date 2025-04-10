/**
 * Manages the multiplayer connection and synchronization with the server.
 * Refactored to be in the dedicated multiplayer directory structure.
 */
import { GAME_CONSTANTS, PLAYER_COLORS } from '../shared/constants/gameConstants.js';

export default class MultiplayerManager {
  /**
   * Creates a new MultiplayerManager instance
   */
  constructor() {
    // Initialize properties
    this.client = null;
    this.room = null;
    this.isConnected = false;
    this.isMultiplayerMode = false;
    this.localSessionId = null;
    
    // Determine server address based on environment
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      this.serverAddress = `${protocol}//${window.location.hostname}:3000`;
    } else {
      // In production, connect to same hostname but with ws/wss protocol
      this.serverAddress = `${protocol}//${window.location.hostname}`;
    }
    
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
   * @returns {MultiplayerManager} This instance for chaining
   */
  init() {
    // Import Colyseus client from npm package
    try {
      // Dynamic import to load on demand
      import('colyseus.js').then(ColyseusModule => {
        const { Client } = ColyseusModule;
        this.client = new Client(this.serverAddress);
        console.log('Multiplayer client initialized');
      });
    } catch (e) {
      console.error('Failed to load Colyseus client:', e);
    }

    return this;
  }

  /**
   * Set server address
   * @param {string} address - The server address
   * @returns {MultiplayerManager} This instance for chaining
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
   * @param {string} playerName - The player's name
   * @returns {Promise<boolean>} Whether the connection was successful
   */
  async connect(playerName = 'Player') {
    if (!this.client) {
      this.init();
    }

    try {
      console.log('Connecting to game server...');

      // Join or create a room
      this.room = await this.client.joinOrCreate(
        GAME_CONSTANTS.GAME.ROOM_NAME,
        {
          name: playerName,
        }
      );

      // Set up room event handlers
      this.setupRoomHandlers();

      // Set connection state
      this.isConnected = true;
      this.isMultiplayerMode = true;
      this.localSessionId = this.room.sessionId;

      console.log(
        `Connected to room: ${this.room.id} as ${this.room.sessionId}`
      );

      // Call success callback if defined
      if (this.onConnectionSuccess) {
        this.onConnectionSuccess();
      }

      return true;
    } catch (error) {
      console.error('Connection error:', error);

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
    this.room.onMessage('playerJoined', this.handlePlayerJoined);
    this.room.onMessage('playerLeft', this.handlePlayerLeft);

    // Handle disconnection
    this.room.onLeave(code => {
      this.isConnected = false;
      console.log(`Left room: ${code}`);
    });
  }

  /**
   * Handle room state changes
   * @param {Object} state - The new room state
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
    if (
      state.gameState === GAME_CONSTANTS.STATE.GAME_OVER &&
      this.onGameOver
    ) {
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
   * @param {Object} data - Player joined data
   */
  handlePlayerJoined(data) {
    console.log(`Player joined: ${data.name} (${data.id})`);

    if (this.onPlayerJoin) {
      this.onPlayerJoin(data);
    }
  }

  /**
   * Handle player left event
   * @param {Object} data - Player left data
   */
  handlePlayerLeft(data) {
    console.log(`Player left: ${data.id}`);

    if (this.onPlayerLeave) {
      this.onPlayerLeave(data);
    }
  }

  /**
   * Send player input to server
   * @param {Object} inputState - The input state to send
   */
  sendInput(inputState) {
    if (!this.isConnected || !this.room) return;

    // Add input to local buffer for prediction
    this.inputBuffer.push({
      input: inputState,
      timestamp: Date.now(),
    });

    // Send input to server
    this.room.send('input', inputState);
  }

  /**
   * Get the local player object
   * @returns {Object|null} The local player object, or null if not connected
   */
  getLocalPlayer() {
    if (!this.isConnected || !this.localSessionId || !this.players)
      return null;

    return this.players[this.localSessionId];
  }

  /**
   * Get a player's color based on their index
   * @param {number} playerIndex - The player's index
   * @returns {string} The player's color
   */
  getPlayerColor(playerIndex) {
    return PLAYER_COLORS[playerIndex % PLAYER_COLORS.length];
  }

  /**
   * Request game restart
   */
  requestRestart() {
    if (!this.isConnected || !this.room) return;

    this.room.send('restartGame');
  }

  /**
   * Update player name
   * @param {string} name - The new player name
   */
  updatePlayerName(name) {
    if (!this.isConnected || !this.room) return;

    this.room.send('updateName', { name });
  }

  /**
   * Disconnect from the server
   */
  disconnect() {
    if (!this.isConnected || !this.room) return;

    console.log('Disconnecting from server...');
    this.room.leave();
    this.isConnected = false;
    this.isMultiplayerMode = false;
    this.room = null;

    console.log('Disconnected from server');
  }

  /**
   * Check if in multiplayer mode
   * @returns {boolean} Whether in multiplayer mode
   */
  isInMultiplayerMode() {
    return this.isMultiplayerMode;
  }

  /**
   * Get the current game state
   * @returns {string} The current game state
   */
  getGameState() {
    return this.gameState?.gameState || GAME_CONSTANTS.STATE.WAITING;
  }

  /**
   * Get arena statistics (size, shrinking, etc.)
   * @returns {Object|null} Arena statistics, or null if not connected
   */
  getArenaStats() {
    if (!this.gameState) return null;

    return {
      width: this.gameState.arenaWidth,
      height: this.gameState.arenaHeight,
      areaPercentage: this.gameState.areaPercentage,
      elapsedTime: this.gameState.elapsedTime,
      countdownTime: this.gameState.countdownTime,
    };
  }

  /**
   * Get all remote players
   * @returns {Object} Remote players
   */
  getRemotePlayers() {
    return this.remotePlayers;
  }

  /**
   * Get server-synchronized obstacles
   * @returns {Array} Obstacles
   */
  getObstacles() {
    return this.obstacles || [];
  }

  /**
   * Get player alive count
   * @returns {number} Player alive count
   */
  getAliveCount() {
    return this.gameState?.aliveCount || 0;
  }

  /**
   * Get total player count
   * @returns {number} Total player count
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
