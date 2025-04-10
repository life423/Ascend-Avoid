/**
 * SinglePlayerMode implementation for the game.
 * Encapsulates all logic specific to single-player gameplay.
 */
import GameMode from './GameMode.js';
import { CANVAS, STATE } from '../shared/constants/gameConstants.js';

export default class SinglePlayerMode extends GameMode {
  /**
   * Creates a new SinglePlayerMode instance
   * @param {Game} game - Reference to the main game instance
   */
  constructor(game) {
    super(game);
    
    // Single player specific state
    this.score = 0;
    this.highScore = 0;
    this.lastObstacleAdded = 0;
  }
  
  /**
   * Initialize this game mode
   * @returns {Promise} Promise that resolves when initialization is complete
   */
  async initialize() {
    // Reset scores
    this.score = 0;
    this.highScore = 0;
    
    // Initialize player position
    this.game.player.resetPosition();
    
    // Initialize obstacle manager
    this.game.obstacleManager.initialize();
    
    // Set game state to playing
    this.game.gameState = STATE.PLAYING;
    
    // Update UI
    this.game.uiManager.updateScore(0);
    this.game.uiManager.updateHighScore(0);
    
    return Promise.resolve();
  }
  
  /**
   * Update game state for single-player mode
   * @param {Object} inputState - Current input state
   * @param {number} deltaTime - Time since last frame in seconds
   * @param {number} timestamp - Current animation timestamp
   */
  update(inputState, deltaTime, timestamp) {
    if (this.game.gameState !== STATE.PLAYING) return;
    
    // Update player movement based on input
    this.updatePlayerMovement(inputState);
    
    // Update player
    this.game.player.move();
    
    // Update obstacles - use current scaling info for speed adjustments
    this.game.obstacleManager.update(timestamp, this.score, this.game.scalingInfo);
    
    // Check for collisions
    const collision = this.game.obstacleManager.checkCollisions(this.game.player);
    if (collision) {
      this.handleCollision(collision);
    }
  }
  
  /**
   * Update player movement based on input state
   * @param {Object} inputState - Current input state
   */
  updatePlayerMovement(inputState) {
    // Apply input to player movement
    this.game.player.setMovementKey('up', inputState.up);
    this.game.player.setMovementKey('down', inputState.down);
    this.game.player.setMovementKey('left', inputState.left);
    this.game.player.setMovementKey('right', inputState.right);
    
    // Special case for up movement - make it more responsive
    // and scale with screen size
    if (inputState.up && this.game.player.y > 30) {
      // Apply an immediate boost when pressing up, scaled by screen size
      const boostAmount = 30 * this.game.scalingInfo.heightScale;
      this.game.player.y -= boostAmount * 0.1;
    }
  }
  
  /**
   * Handle collision with obstacle
   * @param {Obstacle} obstacle - The obstacle that was hit
   */
  handleCollision(obstacle) {
    // Play collision sound
    if (this.game.assetManager) {
      this.game.assetManager.playSound('collision', 0.3);
    }
    
    // Flash screen red
    this.game.uiManager.flashScreen('#ff0000', 200);
    
    // Set game state to game over
    this.game.gameState = STATE.GAME_OVER;
    
    // Show game over screen
    this.game.uiManager.showGameOver(
      this.score,
      this.highScore,
      this.completeReset.bind(this)
    );
  }
  
  /**
   * Add obstacles based on current score
   */
  addObstaclesBasedOnScore() {
    // Add initial obstacles for new game
    if (this.score <= 2) {
      this.game.obstacleManager.addObstacle();
    }
    
    // Add obstacles as score increases (difficulty progression)
    if (this.score % 4 === 0) {
      this.game.obstacleManager.addObstacle();
    }
    
    // On small screens, cap the max number of obstacles to avoid overwhelming the player
    if (
      this.game.scalingInfo.widthScale < 0.7 &&
      this.game.obstacleManager.getObstacles().length > 7
    ) {
      return;
    }
  }
  
  /**
   * Add celebration particles when scoring
   */
  addScoreParticles() {
    // Get the winning line position
    const scaledWinningLine = this.game.getWinningLinePosition();
    
    // Number of particles based on score (more particles for higher scores)
    const particleCount = Math.min(10 + this.score * 2, 50);
    
    if (this.game.particleSystem) {
      // Use particle system if available
      this.game.particleSystem.createCelebration({
        x: this.game.player.x + this.game.player.width / 2,
        y: scaledWinningLine,
        count: particleCount,
        minSize: 2 * this.game.scalingInfo.widthScale,
        maxSize: 7 * this.game.scalingInfo.widthScale,
        minLife: 20,
        maxLife: 40,
      });
    }
  }
  
  /**
   * Check if player has reached the winning line
   */
  checkForWinner() {
    if (this.game.gameState !== STATE.PLAYING) return;
    
    // Calculate scaled winning line position
    const scaledWinningLine = this.game.getWinningLinePosition();
    
    if (this.game.player.y < scaledWinningLine) {
      // Increment score
      this.score++;
      this.game.uiManager.updateScore(this.score);
      
      // Add more obstacles as game progresses
      this.addObstaclesBasedOnScore();
      
      // Add visual effects
      this.addScoreParticles();
      
      // Play score sound
      if (this.game.assetManager) {
        this.game.assetManager.playSound('score', 0.3);
      }
      
      // Reset player to bottom of screen
      this.game.player.resetPosition();
      
      // Update high score if needed
      this.updateHighScore();
    }
  }
  
  /**
   * Update the high score if needed
   */
  updateHighScore() {
    if (this.score > this.highScore) {
      this.highScore = this.score;
      this.game.uiManager.updateHighScore(this.highScore);
    }
  }
  
  /**
   * Reset game state
   */
  reset() {
    this.score = 0;
    this.game.uiManager.updateScore(0);
    this.game.obstacleManager.reset();
    this.game.player.resetPosition();
    
    // Clear particles
    if (this.game.particleSystem) {
      this.game.particleSystem.clear();
    }
  }
  
  /**
   * Complete reset after game over
   */
  completeReset() {
    // Hide any game over UI
    this.game.uiManager.hideGameOver();
    
    // Reset game elements
    this.reset();
    
    // Set game state back to playing
    this.game.gameState = STATE.PLAYING;
  }
  
  /**
   * Activate single-player mode
   */
  activate() {
    super.activate();
    this.game.isMultiplayerMode = false;
    this.reset();
    this.game.gameState = STATE.PLAYING;
  }
  
  /**
   * Get the current score
   * @returns {number} The current score
   */
  getScore() {
    return this.score;
  }
  
  /**
   * Get the high score
   * @returns {number} The high score
   */
  getHighScore() {
    return this.highScore;
  }
}
