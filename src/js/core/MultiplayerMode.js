/**
 * MultiplayerMode implementation for the game.
 * Encapsulates all logic specific to multiplayer gameplay.
 */
import GameMode from './GameMode.js';
import { STATE } from '../shared/constants/gameConstants.js';

export default class MultiplayerMode extends GameMode {
  /**
   * Creates a new MultiplayerMode instance
   * @param {Game} game - Reference to the main game instance
   */
  constructor(game) {
    super(game);
    
    // Multiplayer specific properties
    this.multiplayerManager = null;
    this.remotePlayers = {};
    this.winner = null;
  }
  
  /**
   * Initialize this game mode
   * @returns {Promise} Promise that resolves when initialization is complete
   */
  async initialize() {
    // Initialize multiplayer manager if it doesn't exist
    if (!this.multiplayerManager) {
      // Check if the game already has a multiplayer manager
      if (this.game.multiplayerManager) {
        this.multiplayerManager = this.game.multiplayerManager;
      } else {
        // Create new multiplayer manager
        // We'll import it here to avoid circular dependencies
        const MultiplayerManager = (await import('../multiplayer/MultiplayerManager.js')).default;
        this.multiplayerManager = new MultiplayerManager();
        
        // Initialize the multiplayer manager
        this.multiplayerManager.init();
        
        // Store reference in the game object
        this.game.multiplayerManager = this.multiplayerManager;
      }
      
      // Set up event handlers for multiplayer events
      this.setupMultiplayerEventHandlers();
    }
    
    // Connect to server
    try {
      // Update UI to show connecting state
      this.game.uiManager.showLoading('Connecting to game server...');
      
      // Get player name from UI or use default
      const playerName = this.game.multiplayerUI ? 
        this.game.multiplayerUI.getPlayerName() : 'Player';
      
      // Connect to server
      const connected = await this.multiplayerManager.connect(playerName);
      
      if (!connected) {
        throw new Error('Failed to connect to multiplayer server');
      }
      
      // Hide loading screen
      this.game.uiManager.hideLoading();
      
      // Set game state
      this.game.gameState = STATE.WAITING;
      
      return true;
    } catch (error) {
      console.error('Multiplayer initialization error:', error);
      
      // Show error message
      this.game.uiManager.hideLoading();
      this.game.uiManager.showError(
        'Connection Error',
        'Failed to connect to multiplayer server. Check your connection and try again.',
        () => {
          // Switch back to single player mode
          this.game.setGameMode('singleplayer');
        }
      );
      
      return false;
    }
  }
  
  /**
   * Set up event handlers for multiplayer events
   */
  setupMultiplayerEventHandlers() {
    // Handle player join events
    this.multiplayerManager.onPlayerJoin = (data) => {
      console.log(`Player joined: ${data.name} (${data.id})`);
      
      // Update UI if available
      if (this.game.multiplayerUI) {
        this.game.multiplayerUI.updatePlayerList(
          this.multiplayerManager.getRemotePlayers(),
          this.multiplayerManager.getTotalPlayers()
        );
      }
    };
    
    // Handle player leave events
    this.multiplayerManager.onPlayerLeave = (data) => {
      console.log(`Player left: ${data.id}`);
      
      // Update UI if available
      if (this.game.multiplayerUI) {
        this.game.multiplayerUI.updatePlayerList(
          this.multiplayerManager.getRemotePlayers(),
          this.multiplayerManager.getTotalPlayers()
        );
      }
    };
    
    // Handle game state changes
    this.multiplayerManager.onGameStateChange = (state) => {
      // Update game state
      this.game.gameState = state.gameState;
      
      // Update remote players
      this.remotePlayers = this.multiplayerManager.getRemotePlayers();
      
      // Update UI based on game state
      if (this.game.multiplayerUI) {
        this.game.multiplayerUI.updateGameState(
          state.gameState,
          this.multiplayerManager.getRemotePlayers(),
          this.multiplayerManager.getTotalPlayers(),
          this.multiplayerManager.getAliveCount()
        );
        
        // If waiting, update countdown
        if (state.gameState === STATE.STARTING && state.countdownTime) {
          this.game.multiplayerUI.updateCountdown(state.countdownTime);
        }
      }
    };
    
    // Handle game over events
    this.multiplayerManager.onGameOver = (winnerName) => {
      this.winner = winnerName;
      
      // Update UI
      if (this.game.multiplayerUI) {
        this.game.multiplayerUI.showGameOver(
          winnerName,
          this.completeReset.bind(this)
        );
      }
    };
    
    // Handle connection errors
    this.multiplayerManager.onConnectionError = (error) => {
      console.error('Connection error:', error);
      
      // Show error message
      this.game.uiManager.showError(
        'Connection Error',
        `Lost connection to multiplayer server: ${error}`,
        () => {
          // Switch back to single player mode
          this.game.setGameMode('singleplayer');
        }
      );
    };
    
    // Handle successful connection
    this.multiplayerManager.onConnectionSuccess = () => {
      console.log('Connected to multiplayer server');
      
      // Update UI if available
      if (this.game.multiplayerUI) {
        this.game.multiplayerUI.showConnected();
      }
    };
  }
  
  /**
   * Update game state for multiplayer mode
   * @param {Object} inputState - Current input state
   * @param {number} deltaTime - Time since last frame in seconds
   * @param {number} timestamp - Current animation timestamp
   */
  update(inputState, deltaTime, timestamp) {
    // Send player input to server if connected and playing
    if (
      this.multiplayerManager.isConnected &&
      this.multiplayerManager.isInMultiplayerMode() &&
      this.game.gameState === STATE.PLAYING
    ) {
      // Send input to server
      this.multiplayerManager.sendInput(inputState);
      
      // Update local player movement for responsiveness
      // (server will correct any discrepancies)
      this.updatePlayerMovement(inputState);
      this.game.player.move();
    }
    
    // Get obstacles from server instead of using local obstacle manager
    const serverObstacles = this.multiplayerManager.getObstacles();
    
    // Update remote players (interpolation/prediction can be added here)
    // This is a simplified implementation
    this.updateRemotePlayers(deltaTime);
    
    // Check for collisions (handled server-side, but we can provide visual feedback)
    if (this.game.gameState === STATE.PLAYING) {
      // Visual updates only - actual collision detection is on the server
      this.checkVisualCollisions(serverObstacles);
    }
  }
  
  /**
   * Update player movement for visual feedback
   * @param {Object} inputState - Current input state
   */
  updatePlayerMovement(inputState) {
    // Get local player from multiplayer manager
    const localPlayer = this.multiplayerManager.getLocalPlayer();
    if (!localPlayer) return;
    
    // Apply input to player movement
    this.game.player.setMovementKey('up', inputState.up);
    this.game.player.setMovementKey('down', inputState.down);
    this.game.player.setMovementKey('left', inputState.left);
    this.game.player.setMovementKey('right', inputState.right);
  }
  
  /**
   * Update remote players
   * @param {number} deltaTime - Time since last frame in seconds
   */
  updateRemotePlayers(deltaTime) {
    // Get remote players from multiplayer manager
    this.remotePlayers = this.multiplayerManager.getRemotePlayers();
    
    // Update remote player positions (can be expanded with interpolation)
    // This is a simplified implementation
  }
  
  /**
   * Check for visual collisions (feedback only, actual logic is on server)
   * @param {Array} serverObstacles - Obstacles from the server
   */
  checkVisualCollisions(serverObstacles) {
    // Check only for visual feedback, not actual collision handling
    // The server handles the real collision detection
  }
  
  /**
   * Handle collision with obstacle
   * @param {Obstacle} obstacle - The obstacle that was hit
   */
  handleCollision(obstacle) {
    // In multiplayer, collisions are handled by the server
    // This is just for visual effects
    
    // Play collision sound
    if (this.game.assetManager) {
      this.game.assetManager.playSound('collision', 0.3);
    }
    
    // Flash screen red
    this.game.uiManager.flashScreen('#ff0000', 200);
  }
  
  /**
   * Check for winner - not needed in multiplayer as the server determines this
   */
  checkForWinner() {
    // Server handles win condition in multiplayer
  }
  
  /**
   * Reset game state
   */
  reset() {
    // Reset player position
    this.game.player.resetPosition();
    
    // Reset winner
    this.winner = null;
    
    // Request server to reset game
    if (this.multiplayerManager.isConnected) {
      this.multiplayerManager.requestRestart();
    }
  }
  
  /**
   * Complete reset after game over
   */
  completeReset() {
    // Hide game over UI
    if (this.game.multiplayerUI) {
      this.game.multiplayerUI.hideGameOver();
    }
    
    // Reset game elements
    this.reset();
  }
  
  /**
   * Activate multiplayer mode
   */
  activate() {
    super.activate();
    this.game.isMultiplayerMode = true;
    
    // Show multiplayer UI if it exists
    if (this.game.multiplayerUI) {
      this.game.multiplayerUI.show();
    }
  }
  
  /**
   * Deactivate multiplayer mode
   */
  deactivate() {
    super.deactivate();
    
    // Disconnect from server
    if (this.multiplayerManager && this.multiplayerManager.isConnected) {
      this.multiplayerManager.disconnect();
    }
    
    // Hide multiplayer UI if it exists
    if (this.game.multiplayerUI) {
      this.game.multiplayerUI.hide();
    }
  }
  
  /**
   * Clean up resources
   */
  dispose() {
    // Disconnect from server
    if (this.multiplayerManager) {
      this.multiplayerManager.disconnect();
    }
  }
}
