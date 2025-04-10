/**
 * Base class for game modes implementing the Strategy pattern.
 * This allows clean separation between single-player and multiplayer modes.
 */

export default class GameMode {
  /**
   * Creates a new GameMode instance
   * @param {Object} game - Reference to the main game instance
   */
  constructor(game) {
    if (this.constructor === GameMode) {
      throw new Error('GameMode is an abstract class and cannot be instantiated directly');
    }
    
    this.game = game;
  }
  
  /**
   * Initialize this game mode
   * @returns {Promise} Promise that resolves when initialization is complete
   */
  async initialize() {
    throw new Error('Method initialize() must be implemented by derived classes');
  }
  
  /**
   * Update game state for this mode
   * @param {Object} inputState - Current input state
   * @param {number} deltaTime - Time since last frame in seconds
   * @param {number} timestamp - Current animation timestamp
   */
  update(inputState, deltaTime, timestamp) {
    throw new Error('Method update() must be implemented by derived classes');
  }
  
  /**
   * Handle collision with an obstacle
   * @param {Obstacle} obstacle - The obstacle that was hit
   */
  handleCollision(obstacle) {
    throw new Error('Method handleCollision() must be implemented by derived classes');
  }
  
  /**
   * Check if player has reached the winning line or other win condition
   */
  checkForWinner() {
    throw new Error('Method checkForWinner() must be implemented by derived classes');
  }
  
  /**
   * Reset game state for this mode
   */
  reset() {
    throw new Error('Method reset() must be implemented by derived classes');
  }
  
  /**
   * Complete reset (used after game over)
   */
  completeReset() {
    throw new Error('Method completeReset() must be implemented by derived classes');
  }
  
  /**
   * Activate this game mode
   */
  activate() {
    // Default implementation can be overridden
    console.log(`${this.constructor.name} activated`);
  }
  
  /**
   * Deactivate this game mode
   */
  deactivate() {
    // Default implementation can be overridden
    console.log(`${this.constructor.name} deactivated`);
  }
  
  /**
   * Clean up resources when game mode is no longer needed
   */
  dispose() {
    // Default implementation can be overridden
  }
}
