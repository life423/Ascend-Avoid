/**
 * Main game controller class that orchestrates all game systems.
 * This refactored version follows best practices for code organization,
 * state management, and modular design.
 */
import Player from './Player.js';
import Background from './Background.js';
import TouchControls from './TouchControls.js';
import { BASE_CANVAS_WIDTH, BASE_CANVAS_HEIGHT, resizeCanvas } from './utils.js';

// Import our new manager classes
import GameConfig from './GameConfig.js';
import InputManager from './InputManager.js';
import ObstacleManager from './ObstacleManager.js';
import UIManager from './UIManager.js';
import AssetManager from './AssetManager.js';
import MultiplayerManager from './MultiplayerManager.js';
import MultiplayerUI from './MultiplayerUI.js';

export default class Game {
  /**
   * Creates a new Game instance
   */
  constructor() {
    // Get DOM elements
    this.canvas = document.getElementById('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.scoreElement = document.getElementById('score');
    this.highScoreElement = document.getElementById('highScore');

    // Game state
    this.score = 0;
    this.highScore = 0;
    this.lastFrameTime = 0;
    this.particles = [];
    
    // Detect platform
    this.isDesktop = window.matchMedia("(min-width: 1200px)").matches;
    
    // Create configuration with platform detection
    this.config = new GameConfig({ isDesktop: this.isDesktop });
    
    // Set initial game state
    this.gameState = this.config.STATE.READY;
    
    // Initialize managers in the init method
    this.inputManager = null;
    this.obstacleManager = null;
    this.uiManager = null;
    this.assetManager = null;
    this.multiplayerManager = null;
    this.multiplayerUI = null;
    
    // Multiplayer state
    this.isMultiplayerMode = false;
    this.remotePlayers = {};
    
    // Initialize game
    this.init();
  }

  /**
   * Initialize the game and all its components
   */
  async init() {
    console.log('Initializing game...');
    
    // Create UI manager
    this.uiManager = new UIManager({
      scoreElement: this.scoreElement,
      highScoreElement: this.highScoreElement,
      config: this.config
    });
    
    // Show loading screen while we set up
    this.uiManager.showLoading('Loading game assets...');

    // Initialize asset manager and preload assets
    this.assetManager = new AssetManager();
    await this.preloadAssets();
    
    // Set up responsive canvas
    const { widthScale, heightScale } = resizeCanvas(this.canvas);
    console.log(`Canvas scaled to: ${this.canvas.width}x${this.canvas.height} (scale factor: ${widthScale.toFixed(4)})`);
    
    // Create background
    this.background = new Background(this.canvas);
    
    // Create player
    this.player = new Player(this.canvas);

    // Initialize obstacle manager
    this.obstacleManager = new ObstacleManager({
      canvas: this.canvas,
      config: this.config
    });
    this.obstacleManager.initialize();

    // Initialize input manager
    this.inputManager = new InputManager({
      keyMappings: this.config.getKeys()
    });
    
    // We won't auto-initialize multiplayer to prevent breaking the basic game
    // this.initializeMultiplayer();
    
    // Set up for optional multiplayer initialization later
    this.multiplayerManager = null;
    this.multiplayerUI = null;
    
    // Listen for restart events from input manager
    document.addEventListener('game:restart', this.handleRestartEvent.bind(this));
    
    // Set up touch controls if needed
    this.setupTouchControls();
    
    // Set up desktop enhancements if needed
    if (this.isDesktop) {
      this.setupDesktopLayout();
    }

    // Set up window resize event
    this.setupResizeHandler();

    // Hide loading screen
    this.uiManager.hideLoading();
    
    // Set game state to playing
    this.gameState = this.config.STATE.PLAYING;
    
    // Start game loop
    requestAnimationFrame(this.gameLoop.bind(this));
    
    console.log('Game initialized successfully');
  }
  
  /**
   * Initialize multiplayer functionality
   */
  initializeMultiplayer() {
    // Create multiplayer manager
    this.multiplayerManager = new MultiplayerManager();
    
    // Initialize multiplayer UI
    this.multiplayerUI = new MultiplayerUI(this.multiplayerManager);
    
    // Add multiplayer toggle button to UI
    this.addMultiplayerToggle();
    
    // Set up multiplayer event handlers
    this.setupMultiplayerEvents();
  }
  
  /**
   * Add multiplayer toggle button to UI
   */
  addMultiplayerToggle() {
    // Create toggle button
    const toggleButton = document.createElement('button');
    toggleButton.id = 'multiplayer-toggle';
    toggleButton.className = 'multiplayer-toggle-button';
    toggleButton.textContent = 'Multiplayer';
    toggleButton.style.position = 'absolute';
    toggleButton.style.top = '10px';
    toggleButton.style.right = '10px';
    toggleButton.style.padding = '8px 16px';
    toggleButton.style.background = '#0CC7C7';
    toggleButton.style.color = 'white';
    toggleButton.style.border = 'none';
    toggleButton.style.borderRadius = '4px';
    toggleButton.style.fontWeight = 'bold';
    toggleButton.style.cursor = 'pointer';
    toggleButton.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.3)';
    toggleButton.style.zIndex = '100';
    
    // Add hover effect
    toggleButton.addEventListener('mouseover', () => {
      toggleButton.style.background = '#0ffafa';
      toggleButton.style.boxShadow = '0 0 15px rgba(12, 199, 199, 0.5)';
    });
    
    toggleButton.addEventListener('mouseout', () => {
      toggleButton.style.background = '#0CC7C7';
      toggleButton.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.3)';
    });
    
    // Add click event
    toggleButton.addEventListener('click', () => {
      // Show multiplayer UI
      this.multiplayerUI.toggle();
    });
    
    // Add to document
    document.body.appendChild(toggleButton);
  }
  
  /**
   * Set up multiplayer event handlers
   */
  setupMultiplayerEvents() {
    // Handle connection success
    this.multiplayerManager.onConnectionSuccess = () => {
      console.log('Connected to multiplayer server');
      this.isMultiplayerMode = true;
      
      // Reset game
      this.resetGame();
    };
    
    // Handle disconnection
    this.multiplayerManager.onConnectionError = (error) => {
      console.error('Multiplayer connection error:', error);
      this.isMultiplayerMode = false;
    };
    
    // Handle game state changes
    this.multiplayerManager.onGameStateChange = (state) => {
      // Update remote players
      this.remotePlayers = this.multiplayerManager.getRemotePlayers();
      
      // Handle game state transitions
      if (state.gameState === 'playing' && this.gameState !== this.config.STATE.PLAYING) {
        // Switch to playing state
        this.gameState = this.config.STATE.PLAYING;
      } else if (state.gameState === 'game_over' && this.gameState !== this.config.STATE.GAME_OVER) {
        // Switch to game over state
        this.gameState = this.config.STATE.GAME_OVER;
        
        // Check if local player won
        const localPlayer = this.multiplayerManager.getLocalPlayer();
        const isWinner = localPlayer && state.winnerName === localPlayer.name;
        
        // Show game over screen
        this.uiManager.showGameOver(
          localPlayer ? localPlayer.score : 0,
          this.highScore,
          this.completeReset.bind(this),
          state.winnerName,
          isWinner
        );
      }
    };
  }
  
  /**
   * Preload all game assets
   */
  async preloadAssets() {
    // Define game assets to preload
    const imageAssets = [
      { key: 'player', src: 'assets/images/player.png' },
      { key: 'obstacle', src: 'assets/images/obstacle.png' }
    ];
    
    // Preload assets (will expand with more assets as needed)
    try {
      const result = await this.assetManager.loadAssets(imageAssets, []);
      if (!result.success) {
        console.error('Failed to load some game assets');
      }
    } catch (error) {
      console.error('Error loading assets:', error);
    }
    
    return true;
  }
  
  /**
   * Set up mobile touch controls
   */
  setupTouchControls() {
    // Check if device supports touch
    const isTouchDevice = (
      window.matchMedia("(max-width: 1024px)").matches || 
      window.matchMedia("(pointer: coarse)").matches ||
      ('ontouchstart' in window) || 
      (navigator.maxTouchPoints > 0)
    );
    
    if (isTouchDevice) {
      console.log("Touch device detected, optimizing controls");
      
      // Set up canvas touch events
      this.inputManager.setupTouchControls(this.canvas);
      
      // Create touch controls overlay
      this.touchControls = new TouchControls(this);
      this.touchControls.show();
      
      // Register touch buttons with input manager
      if (this.touchControls.buttonElements) {
        for (const [direction, button] of Object.entries(this.touchControls.buttonElements)) {
          this.inputManager.registerTouchButton(button, direction);
        }
      }
    }
  }
  
  /**
   * Set up desktop-specific layout and enhancements
   */
  setupDesktopLayout() {
    console.log('Setting up desktop-optimized layout');
    
    // Add desktop layout class for CSS targeting
    document.body.classList.add('desktop-layout');
    
    // Ensure the wrapper has proper dimensions for the canvas
    const wrapper = this.canvas.parentElement;
    if (wrapper) {
      wrapper.style.minHeight = '600px';
      wrapper.style.aspectRatio = '3 / 4';
    }
    
    // Ensure canvas uses container dimensions properly
    if (this.canvas) {
      // Let the CSS handle the display size
      this.canvas.style.width = '100%';
      this.canvas.style.height = '100%';
      
      // Force a resize to ensure game elements scale properly
      const { widthScale, heightScale } = resizeCanvas(this.canvas);
      
      // Update game elements with new scale
      this.player.resetPosition();
    }
    
    // Add keyboard control visual helpers for desktop
    this.addDesktopVisualEnhancements();
  }
  
  /**
   * Set up window resize handler with debouncing
   */
  setupResizeHandler() {
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        console.log('Window resized, updating game elements');
        
        // Update desktop status in case window size changed categories
        this.isDesktop = window.matchMedia("(min-width: 1200px)").matches;
        
        // Resize canvas and get the new scale factors
        const { widthScale, heightScale } = resizeCanvas(this.canvas);
        
        // Update game elements with new scale
        this.player.resetPosition();
        this.background.resize();
        
        // Update obstacles
        const obstacles = this.obstacleManager.getObstacles();
        for (const obstacle of obstacles) {
          obstacle.calculateHeight();
        }
        
        // Update touch controls if they exist
        if (this.touchControls) {
          this.touchControls.resize();
        }
      }, 250); // debounce resize events
    });
  }
  
  /**
   * Add visual enhancements for desktop mode
   */
  addDesktopVisualEnhancements() {
    // Add keyboard controls visual indicator for desktop
    const keyboardHelperElement = document.createElement('div');
    keyboardHelperElement.id = 'keyboard-helper';
    keyboardHelperElement.className = 'keyboard-helper';
    keyboardHelperElement.innerHTML = `
      <div class="key-container">
        <div class="key-row">
          <div class="key wasd">W</div>
        </div>
        <div class="key-row">
          <div class="key wasd">A</div>
          <div class="key wasd">S</div>
          <div class="key wasd">D</div>
        </div>
        <div class="key-label">WASD to move</div>
      </div>
      <div class="key-container">
        <div class="key-row">
          <div class="key arrows">↑</div>
        </div>
        <div class="key-row">
          <div class="key arrows">←</div>
          <div class="key arrows">↓</div>
          <div class="key arrows">→</div>
        </div>
        <div class="key-label">Arrows to move</div>
      </div>
      <div class="key-container">
        <div class="key restart">R</div>
        <div class="key-label">Restart</div>
      </div>
    `;
    
    // Add the keyboard helper to the game container
    const gameUIContainer = document.getElementById('game-ui-container');
    if (gameUIContainer) {
      gameUIContainer.appendChild(keyboardHelperElement);
      
      // Add styles for the keyboard helper
      const style = document.createElement('style');
      style.textContent = `
        .keyboard-helper {
          display: flex;
          justify-content: center;
          gap: 30px;
          margin: 20px auto;
          max-width: 800px;
        }
        
        .key-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin: 0 10px;
        }
        
        .key-row {
          display: flex;
          gap: 5px;
          margin: 5px 0;
        }
        
        .key {
          width: 40px;
          height: 40px;
          background: rgba(0, 0, 0, 0.4);
          border: 2px solid var(--primary-color);
          border-radius: 6px;
          display: flex;
          justify-content: center;
          align-items: center;
          font-size: 18px;
          color: white;
          box-shadow: 0 0 10px var(--primary-glow);
        }
        
        .key.arrows {
          font-size: 22px;
        }
        
        .key.restart {
          background: rgba(255, 60, 60, 0.2);
          border-color: rgba(255, 60, 60, 0.8);
        }
        
        .key-label {
          margin-top: 8px;
          font-size: 14px;
          color: var(--highlight-color);
        }
        
        /* Hide on mobile/touch devices */
        @media (max-width: 1199px), (pointer: coarse) {
          .keyboard-helper {
            display: none;
          }
        }
      `;
      document.head.appendChild(style);
    }
  }
  
  /**
   * Handle restart event from input manager
   */
  handleRestartEvent() {
    // Only handle restart events in GAME_OVER state
    if (this.gameState === this.config.STATE.GAME_OVER) {
      this.completeReset();
    } else if (this.gameState === this.config.STATE.PLAYING) {
      // In playing state, just reset the current game
      this.resetGame();
    }
  }

  /**
   * Main game loop
   * @param {number} timestamp - Current animation timestamp
   */
  gameLoop(timestamp) {
    // Request next frame first to ensure smooth animation
    requestAnimationFrame(this.gameLoop.bind(this));
    
    // Skip frames if needed for performance on slower devices
    if (timestamp - this.lastFrameTime < 16) {
      // Aim for max 60fps
      return;
    }
    
    // Calculate delta time (in seconds)
    const deltaTime = (timestamp - this.lastFrameTime) / 1000;
    this.lastFrameTime = timestamp;
    
    // Skip updates if game is paused or in game over state
    if (this.gameState !== this.config.STATE.PLAYING) {
      // Just render the current state without updating
      this.render(timestamp);
      return;
    }
    
    try {
      // 1. Update phase
      this.update(deltaTime, timestamp);
      
      // 2. Render phase
      this.render(timestamp);
      
      // 3. Post-update phase (check win/lose conditions)
      this.postUpdate();
    } catch (error) {
      console.error('Error in game loop:', error);
    }
  }
  
  /**
   * Update game state
   * @param {number} deltaTime - Time since last frame in seconds
   * @param {number} timestamp - Current animation timestamp
   */
  update(deltaTime, timestamp) {
    // Get current input state
    const inputState = this.inputManager.getInputState();
    
    // Handle updates differently based on multiplayer mode
    if (this.isMultiplayerMode) {
      // In multiplayer mode, send input to server
      this.updateMultiplayerMode(inputState, deltaTime, timestamp);
    } else {
      // In single player mode, update locally
      this.updateSinglePlayerMode(inputState, deltaTime, timestamp);
    }
    
    // Update particles
    this.updateParticles(deltaTime);
  }
  
  /**
   * Update game in singleplayer mode
   */
  updateSinglePlayerMode(inputState, deltaTime, timestamp) {
    // Update player movement based on input
    this.updatePlayerMovement(inputState);
    
    // Update player
    this.player.move();
    
    // Update obstacles
    this.obstacleManager.update(timestamp, this.score);
    
    // Check for collisions
    const collision = this.obstacleManager.checkCollisions(this.player);
    if (collision) {
      this.handleCollision(collision);
    }
  }
  
  /**
   * Update game in multiplayer mode
   */
  updateMultiplayerMode(inputState, deltaTime, timestamp) {
    // Send input to server
    this.multiplayerManager.sendInput(inputState);
    
    // Get local player state from server
    const localPlayer = this.multiplayerManager.getLocalPlayer();
    if (localPlayer) {
      // Update local player position from server
      this.player.x = localPlayer.x;
      this.player.y = localPlayer.y;
      
      // Update local player state
      if (localPlayer.state !== 'alive' && this.gameState === this.config.STATE.PLAYING) {
        // Player died
        this.gameState = this.config.STATE.GAME_OVER;
      }
    }
  }
  
  /**
   * Update player movement based on input state
   * @param {Object} inputState - Current input state
   */
  updatePlayerMovement(inputState) {
    // Apply input to player movement
    this.player.setMovementKey('up', inputState.up);
    this.player.setMovementKey('down', inputState.down);
    this.player.setMovementKey('left', inputState.left);
    this.player.setMovementKey('right', inputState.right);
    
    // Special case for up movement - make it more responsive
    if (inputState.up && this.player.y > 30) {
      // Apply an immediate boost when pressing up
      const boostAmount = 30 * (this.canvas.height / BASE_CANVAS_HEIGHT);
      this.player.y -= boostAmount * 0.1;
    }
  }
  
  /**
   * Handle collision with obstacle
   * @param {Obstacle} obstacle - The obstacle that was hit
   */
  handleCollision(obstacle) {
    // Play collision sound
    if (this.assetManager) {
      this.assetManager.playSound('collision', 0.3);
    } else {
      // Fallback to legacy sound method
      const playSound = (window.playSound || (() => {}));
      playSound('collision');
    }
    
    // Flash screen red
    this.uiManager.flashScreen('#ff0000', 200);
    
    // Set game state to game over
    this.gameState = this.config.STATE.GAME_OVER;
    
    // Show game over screen
    this.uiManager.showGameOver(
      this.score,
      this.highScore,
      this.completeReset.bind(this)
    );
  }
  
  /**
   * Render the game
   * @param {number} timestamp - Current animation timestamp
   */
  render(timestamp) {
    // Draw background (replaces clearRect)
    this.background.update(timestamp);
    
    // Get obstacles based on game mode
    let obstacles;
    if (this.isMultiplayerMode) {
      // In multiplayer mode, get obstacles from server
      obstacles = this.multiplayerManager.getObstacles();
    } else {
      // In singleplayer mode, get obstacles from local manager
      obstacles = this.obstacleManager.getObstacles();
    }
    
    // Draw obstacles
    for (const obstacle of obstacles) {
      if (typeof obstacle.draw === 'function') {
        // Local obstacle instance
        obstacle.draw(this.ctx);
      } else {
        // Server obstacle data
        this.drawServerObstacle(obstacle, timestamp);
      }
    }
    
    // Draw remote players in multiplayer mode
    if (this.isMultiplayerMode) {
      this.drawRemotePlayers(timestamp);
    }
    
    // Draw local player
    this.player.draw(timestamp);
    
    // Draw particles
    this.drawParticles();
    
    // Draw touch controls if active and draw method exists
    if (this.touchControls && typeof this.touchControls.draw === 'function') {
      this.touchControls.draw();
    }
    
    // Draw winning line
    this.drawWinningLine(timestamp);
    
    // Draw arena boundary in multiplayer mode
    if (this.isMultiplayerMode) {
      this.drawArenaBoundary();
    }
    
    // Draw debug information if enabled
    if (this.config.isDebugEnabled()) {
      this.drawDebugInfo(timestamp);
    }
  }
  
  /**
   * Draw server-synchronized obstacle
   */
  drawServerObstacle(obstacle, timestamp) {
    // Get sprite for obstacle with variant
    const obstacleSprite = getSprite ? getSprite('obstacle', obstacle.variant || 0, timestamp) : null;
    
    if (obstacleSprite) {
      // Draw using sprite
      this.ctx.drawImage(
        obstacleSprite,
        obstacle.x,
        obstacle.y,
        obstacle.width,
        obstacle.height
      );
    } else {
      // Fallback drawing
      this.ctx.fillStyle = '#2196F3';
      this.ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    }
  }
  
  /**
   * Draw remote players
   */
  drawRemotePlayers(timestamp) {
    // Import sprite function if available
    const getSprite = window.getSprite || null;
    
    // Draw each remote player
    for (const id in this.remotePlayers) {
      const playerData = this.remotePlayers[id];
      if (!playerData) continue;
      
      // Skip rendering dead players
      if (playerData.state !== 'alive') continue;
      
      // Get player sprite if available
      const playerSprite = getSprite ? getSprite('player', 0, timestamp) : null;
      
      // Get player color from index
      const playerColor = this.multiplayerManager.getPlayerColor(playerData.playerIndex);
      
      if (playerSprite) {
        // Draw using sprite with color tint
        this.ctx.save();
        this.ctx.globalAlpha = 0.85; // Slight transparency to differentiate
        this.ctx.drawImage(
          playerSprite,
          playerData.x,
          playerData.y,
          playerData.width,
          playerData.height
        );
        
        // Draw colored outline
        this.ctx.strokeStyle = playerColor;
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(
          playerData.x,
          playerData.y,
          playerData.width,
          playerData.height
        );
        this.ctx.restore();
      } else {
        // Fallback drawing
        this.ctx.fillStyle = playerColor;
        this.ctx.fillRect(
          playerData.x,
          playerData.y,
          playerData.width,
          playerData.height
        );
      }
      
      // Draw player name above
      this.ctx.font = '10px Arial';
      this.ctx.fillStyle = 'white';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(
        playerData.name,
        playerData.x + playerData.width / 2,
        playerData.y - 5
      );
    }
  }
  
  /**
   * Draw arena boundary in multiplayer mode
   */
  drawArenaBoundary() {
    if (!this.multiplayerManager) return;
    
    const arenaStats = this.multiplayerManager.getArenaStats();
    if (!arenaStats || arenaStats.areaPercentage >= 100) return;
    
    // Calculate the shrinking arena
    const shrinkScale = arenaStats.areaPercentage / 100;
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;
    
    // Size of the shrunk arena
    const arenaWidth = this.canvas.width * shrinkScale;
    const arenaHeight = this.canvas.height * shrinkScale;
    
    // Draw arena boundary
    this.ctx.strokeStyle = 'rgba(255, 0, 0, 0.7)';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(
      centerX - arenaWidth / 2,
      centerY - arenaHeight / 2,
      arenaWidth,
      arenaHeight
    );
    
    // Add warning text if arena is small
    if (arenaStats.areaPercentage < 60) {
      this.ctx.font = '16px Arial';
      this.ctx.fillStyle = 'rgba(255, 0, 0, 0.7)';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(
        'WARNING: ARENA SHRINKING',
        centerX,
        centerY - arenaHeight / 2 - 10
      );
    }
  }
  
  /**
   * Post-update phase for checking game conditions
   */
  postUpdate() {
    // Only run these checks if the game is in PLAYING state
    if (this.gameState !== this.config.STATE.PLAYING) return;
    
    // Check for winner
    this.checkForWinner();
    
    // Update high score
    this.updateHighScore();
  }
  
  /**
   * Reset game after collision
   */
  resetGame() {
    this.score = 0;
    this.uiManager.updateScore(0);
    this.obstacleManager.reset();
    this.player.resetPosition();
    this.particles = [];
  }
  
  /**
   * Complete reset after game over
   */
  completeReset() {
    // Hide any game over UI
    this.uiManager.hideGameOver();
    
    // Reset game elements
    this.resetGame();
    
    // Set game state back to playing
    this.gameState = this.config.STATE.PLAYING;
    
    // Request restart in multiplayer mode
    if (this.isMultiplayerMode) {
      this.multiplayerManager.requestRestart();
    }
  }
  
  /**
   * Add celebration particles when scoring
   */
  addScoreParticles() {
    // Number of particles based on score (more particles for higher scores)
    const particleCount = Math.min(10 + (this.score * 2), 50);
    
    // Get the winning line position
    const scaledWinningLine = this.config.getWinningLine(
      this.canvas.height,
      BASE_CANVAS_HEIGHT
    );
    
    for (let i = 0; i < particleCount; i++) {
      this.particles.push({
        x: this.player.x + this.player.width / 2,
        y: scaledWinningLine,
        size: Math.random() * 5 + 2,
        color: `hsl(${Math.random() * 60 + 180}, 100%, 70%)`,
        vx: Math.random() * 6 - 3,
        vy: Math.random() * -5 - 2,
        alpha: 1,
        life: Math.random() * 30 + 20
      });
    }
  }
  
  /**
   * Update all particles
   * @param {number} deltaTime - Time since last frame in seconds
   */
  updateParticles(deltaTime) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      
      // Update position
      p.x += p.vx;
      p.y += p.vy;
      
      // Apply gravity
      p.vy += 0.2;
      
      // Fade out
      p.alpha = p.life / 50;
      
      // Reduce life
      p.life--;
      
      // Remove dead particles
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }
  
  /**
   * Draw all particles
   */
  drawParticles() {
    for (const p of this.particles) {
      // Draw particle
      this.ctx.globalAlpha = p.alpha;
      this.ctx.fillStyle = p.color;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fill();
    }
    
    // Reset global alpha
    this.ctx.globalAlpha = 1;
  }
  
  /**
   * Check if player has reached the winning line
   */
  checkForWinner() {
    // Calculate scaled winning line position
    const scaledWinningLine = this.config.getWinningLine(
      this.canvas.height,
      BASE_CANVAS_HEIGHT
    );
    
    if (this.player.y < scaledWinningLine) {
      // Increment score
      this.score++;
      this.uiManager.updateScore(this.score);
      
      // Add more obstacles as game progresses
      this.addObstaclesBasedOnScore();
      
      // Add visual effects
      this.addScoreParticles();
      
      // Play score sound
      if (this.assetManager) {
        this.assetManager.playSound('score', 0.3);
      } else {
        // Fallback to legacy sound method
        const playSound = (window.playSound || (() => {}));
        playSound('score');
      }
      
      // Reset player to bottom of screen
      this.player.resetPosition();
    }
  }
  
  /**
   * Add obstacles based on current score
   */
  addObstaclesBasedOnScore() {
    // Add initial obstacles for new game
    if (this.score <= 2) {
      this.obstacleManager.addObstacle();
    }
    
    // Add obstacles as score increases (difficulty progression)
    if (this.score % 4 === 0) {
      this.obstacleManager.addObstacle();
    }
  }
  
  /**
   * Update the high score if needed
   */
  updateHighScore() {
    if (this.score > this.highScore) {
      this.highScore = this.score;
      this.uiManager.updateHighScore(this.highScore);
    }
  }
  
  /**
   * Draw the winning line
   * @param {number} timestamp - Current animation timestamp
   */
  drawWinningLine(timestamp) {
    // Only draw winning line if score is high enough or on desktop
    if (this.score <= 5 && !this.isDesktop) return;
    
    // Get the winning line position
    const scaledWinningLine = this.config.getWinningLine(
      this.canvas.height,
      BASE_CANVAS_HEIGHT
    );
    
    // Draw winning line
    if (this.isDesktop) {
      // Enhanced visual feedback for desktop
      this.ctx.beginPath();
      this.ctx.moveTo(0, scaledWinningLine);
      this.ctx.lineTo(this.canvas.width, scaledWinningLine);
      
      // Pulsing effect
      const glowIntensity = 0.3 + 0.2 * Math.sin(timestamp / 500);
      this.ctx.strokeStyle = `rgba(0, 255, 255, ${glowIntensity})`;
      this.ctx.lineWidth = 2;
      this.ctx.stroke();
      
      // Draw subtle grid pattern on desktop
      if (this.config.isDebugEnabled() || this.score > 5) {
        this.drawGridPattern();
      }
    } else {
      // Standard line for mobile
      this.ctx.beginPath();
      this.ctx.moveTo(0, scaledWinningLine);
      this.ctx.lineTo(this.canvas.width, scaledWinningLine);
      this.ctx.strokeStyle = 'rgba(255,255,255,0.3)';
      this.ctx.stroke();
    }
  }
  
  /**
   * Draw a subtle grid pattern for desktop view
   */
  drawGridPattern() {
    // Draw a subtle grid pattern visible only on desktop
    this.ctx.beginPath();
    this.ctx.strokeStyle = "rgba(0, 255, 255, 0.05)";
    this.ctx.lineWidth = 0.5;
    
    const gridSize = 30;
    
    // Vertical lines
    for (let x = 0; x < this.canvas.width; x += gridSize) {
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.canvas.height);
    }
    
    // Horizontal lines
    for (let y = 0; y < this.canvas.height; y += gridSize) {
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.canvas.width, y);
    }
    
    this.ctx.stroke();
  }
  
  /**
   * Draw debug information
   * @param {number} timestamp - Current animation timestamp
   */
  drawDebugInfo(timestamp) {
    // Set debug text styles
    this.ctx.font = '12px monospace';
    this.ctx.fillStyle = 'yellow';
    this.ctx.textAlign = 'left';
    this.ctx.textBaseline = 'top';
    
    // Display fps
    const fps = Math.round(1000 / Math.max(1, timestamp - this.lastFrameTime));
    this.ctx.fillText(`FPS: ${fps}`, 10, 10);
    
    // Display player position
    this.ctx.fillText(`Player: (${Math.round(this.player.x)}, ${Math.round(this.player.y)})`, 10, 25);
    
    // Display obstacle count
    this.ctx.fillText(`Obstacles: ${this.obstacleManager.getObstacles().length}`, 10, 40);
    
    // Display particle count
    this.ctx.fillText(`Particles: ${this.particles.length}`, 10, 55);
    
    // Display game state
    this.ctx.fillText(`State: ${this.gameState}`, 10, 70);
    
    // Draw player hitbox
    this.ctx.strokeStyle = 'yellow';
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(
      this.player.x, this.player.y, 
      this.player.width, this.player.height
    );
  }
  
  /**
   * Clean up resources (important for memory management)
   */
  dispose() {
    // Remove event listeners
    window.removeEventListener('resize', this.handleDesktopResize);
    document.removeEventListener('game:restart', this.handleRestartEvent);
    
    // Dispose managers
    if (this.inputManager) {
      this.inputManager.dispose();
    }
    
    if (this.uiManager) {
      this.uiManager.dispose();
    }
    
    if (this.assetManager) {
      this.assetManager.dispose();
    }
    
    if (this.multiplayerManager) {
      this.multiplayerManager.dispose();
    }
    
    // Stop animation frame
    this.gameState = this.config.STATE.PAUSED;
  }
}
