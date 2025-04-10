/**
 * Abstract base class for game modes implementing the Strategy Pattern.
 * This class defines the interface that all game modes must implement.
 */
export default class GameMode {
  /**
   * Creates a new GameMode instance
   * @param {Game} game - Reference to the main game controller
   */
  constructor(game) {
    if (this.constructor === GameMode) {
      throw new Error('GameMode is an abstract class and cannot be instantiated directly');
    }
    
    this.game = game;
    this.initialized = false;
  }
  
  /**
   * Initialize the game mode
   * @returns {Promise<void>} A promise that resolves when initialization is complete
   */
  async initialize() {
    this.initialized = true;
    return Promise.resolve();
  }
  
  /**
   * Update game state for this mode
   * @param {Object} inputState - Current input state
   * @param {number} deltaTime - Time since last frame in seconds
   * @param {number} timestamp - Current timestamp for animation
   */
  update(inputState, deltaTime, timestamp) {
    throw new Error('Method "update" must be implemented by derived classes');
  }
  
  /**
   * Render game elements specific to this mode
   * @param {number} timestamp - Current timestamp for animation
   */
  render(timestamp) {
    throw new Error('Method "render" must be implemented by derived classes');
  }
  
  /**
   * Handle post-update operations like win/lose detection
   * @returns {void}
   */
  postUpdate() {
    throw new Error('Method "postUpdate" must be implemented by derived classes');
  }
  
  /**
   * Handle game reset
   * @returns {void}
   */
  reset() {
    throw new Error('Method "reset" must be implemented by derived classes');
  }
  
  /**
   * Handle complete reset after game over
   * @returns {void}
   */
  completeReset() {
    throw new Error('Method "completeReset" must be implemented by derived classes');
  }
  
  /**
   * Clean up resources when switching away from this mode
   * @returns {void}
   */
  dispose() {
    // Default implementation is a no-op
  }
}
