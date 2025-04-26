/**
 * Manages the multiplayer connection and synchronization with the server.
 * TypeScript implementation for multiplayer functionality.
 */
import { GAME_CONSTANTS, PLAYER_COLORS } from '../constants/gameConstants';
import { InputState, NetworkPlayer } from '../types';

// Define additional types needed for MultiplayerManager
interface GameState {
  gameState: string;
  obstacles?: any[];
  arenaWidth?: number;
  arenaHeight?: number;
  players?: Record<string, NetworkPlayer>;
  aliveCount?: number;
  totalPlayers?: number;
  areaPercentage?: number;
  elapsedTime?: number;
  countdownTime?: number;
  winnerName?: string;
}

interface BufferedInput {
  input: InputState;
  timestamp: number;
}

interface ArenaStats {
  width?: number;
  height?: number;
  areaPercentage: number;
  elapsedTime?: number;
  countdownTime?: number;
}

// For Colyseus client which will be dynamically imported
interface Client {
  new(endpoint: string): Client;
  joinOrCreate: (roomName: string, options: any) => Promise<Room>;
  endpoint: string;
}

interface Room {
  id: string;
  sessionId: string;
  onStateChange: (callback: (state: any) => void) => void;
  onMessage: (type: string, callback: (data: any) => void) => void;
  onLeave: (callback: (code: number) => void) => void;
  send: (type: string, data?: any) => void;
  leave: () => void;
}

export default class MultiplayerManager {
  private client: any;
  private room: Room | null;
  private isConnected: boolean;
  private isMultiplayerMode: boolean;
  private localSessionId: string | null;
  private serverAddress: string;
  private gameState: GameState | null;
  private players: Record<string, NetworkPlayer>;
  private obstacles: any[];
  private remotePlayers: Record<string, NetworkPlayer>;
  private inputBuffer: BufferedInput[];

  // Callbacks for game events
  public onPlayerJoin: ((player: NetworkPlayer) => void) | null;
  public onPlayerLeave: ((player: NetworkPlayer) => void) | null;
  public onGameStateChange: ((gameState: GameState) => void) | null;
  public onConnectionError: ((error: string) => void) | null;
  public onConnectionSuccess: (() => void) | null;
  public onGameOver: ((winnerName: string) => void) | null;
  
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
   * @returns This instance for chaining
   */
  init(): MultiplayerManager {
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
   * @param address - The server address
   * @returns This instance for chaining
   */
  setServerAddress(address: string): MultiplayerManager {
    this.serverAddress = address;
    if (this.client) {
      this.client.endpoint = address;
    }
    return this;
  }

  /**
   * Connect to the multiplayer server
   * @param playerName - The player's name
   * @returns Whether the connection was successful
   */
  async connect(playerName = 'Player'): Promise<boolean> {
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
    } catch (error: any) {
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
  private setupRoomHandlers(): void {
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
   * @param state - The new room state
   */
  private handleRoomStateChange(state: GameState): void {
    this.gameState = state;

    // Extract players from state
    if (state.players) {
      this.players = state.players;
      
      // Update remote players collection
      this.updateRemotePlayers();
    }

    // Extract obstacles from state
    if (state.obstacles) {
      this.obstacles = state.obstacles;
    }

    // Check for game over
    if (
      state.gameState === GAME_CONSTANTS.STATE.GAME_OVER &&
      this.onGameOver &&
      state.winnerName
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
  private updateRemotePlayers(): void {
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
   * @param data - Player joined data
   */
  private handlePlayerJoined(data: NetworkPlayer): void {
    console.log(`Player joined: ${data.name} (${data.id})`);

    if (this.onPlayerJoin) {
      this.onPlayerJoin(data);
    }
  }

  /**
   * Handle player left event
   * @param data - Player left data
   */
  private handlePlayerLeft(data: NetworkPlayer): void {
    console.log(`Player left: ${data.id}`);

    if (this.onPlayerLeave) {
      this.onPlayerLeave(data);
    }
  }

  /**
   * Send player input to server
   * @param inputState - The input state to send
   */
  sendInput(inputState: InputState): void {
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
   * @returns The local player object, or null if not connected
   */
  getLocalPlayer(): NetworkPlayer | null {
    if (!this.isConnected || !this.localSessionId || !this.players) {
      return null;
    }

    return this.players[this.localSessionId] || null;
  }

  /**
   * Get a player's color based on their index
   * @param playerIndex - The player's index
   * @returns The player's color
   */
  getPlayerColor(playerIndex: number): string {
    return PLAYER_COLORS[playerIndex % PLAYER_COLORS.length];
  }

  /**
   * Request game restart
   */
  requestRestart(): void {
    if (!this.isConnected || !this.room) return;

    this.room.send('restartGame');
  }

  /**
   * Update player name
   * @param name - The new player name
   */
  updatePlayerName(name: string): void {
    if (!this.isConnected || !this.room) return;

    this.room.send('updateName', { name });
  }

  /**
   * Disconnect from the server
   */
  disconnect(): void {
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
   * @returns Whether in multiplayer mode
   */
  isInMultiplayerMode(): boolean {
    return this.isMultiplayerMode;
  }

  /**
   * Get the current game state
   * @returns The current game state
   */
  getGameState(): string {
    return this.gameState?.gameState || GAME_CONSTANTS.STATE.WAITING;
  }

  /**
   * Get arena statistics (size, shrinking, etc.)
   * @returns Arena statistics, or null if not connected
   */
  getArenaStats(): ArenaStats | null {
    if (!this.gameState) return null;

    return {
      width: this.gameState.arenaWidth,
      height: this.gameState.arenaHeight,
      areaPercentage: this.gameState.areaPercentage || 100,
      elapsedTime: this.gameState.elapsedTime,
      countdownTime: this.gameState.countdownTime,
    };
  }

  /**
   * Get all remote players
   * @returns Remote players
   */
  getRemotePlayers(): Record<string, NetworkPlayer> {
    return this.remotePlayers;
  }

  /**
   * Get server-synchronized obstacles
   * @returns Obstacles
   */
  getObstacles(): any[] {
    return this.obstacles || [];
  }

  /**
   * Get player alive count
   * @returns Player alive count
   */
  getAliveCount(): number {
    return this.gameState?.aliveCount || 0;
  }

  /**
   * Get total player count
   * @returns Total player count
   */
  getTotalPlayers(): number {
    return this.gameState?.totalPlayers || 0;
  }

  /**
   * Clean up resources
   */
  dispose(): void {
    this.disconnect();
    this.client = null;
  }
}