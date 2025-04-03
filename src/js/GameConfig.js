/**
 * A class to encapsulate game configuration, avoiding mutation of global constants
 * and providing clean access to game settings based on platform.
 */
import { 
  GAME,
  PLAYER,
  OBSTACLE,
  STATE,
  DESKTOP_SETTINGS,
  KEYS
} from '../../shared/constants/gameConstants.js';

export default class GameConfig {
  /**
   * Creates a new GameConfig instance
   * @param {Object} options - Configuration options
   * @param {boolean} options.isDesktop - Whether the game is running on desktop
   */
  constructor({ isDesktop = false } = {}) {
    // Create a local copy of settings to avoid mutating the original
    this.settings = {
      WINNING_LINE: GAME.WINNING_LINE,
      BASE_SPEED: OBSTACLE.BASE_SPEED,
      PLAYER_SIZE_RATIO: PLAYER.SIZE_RATIO,
      MIN_STEP: PLAYER.MIN_STEP,
      OBSTACLE_MIN_WIDTH_RATIO: OBSTACLE.MIN_WIDTH_RATIO,
      OBSTACLE_MAX_WIDTH_RATIO: OBSTACLE.MAX_WIDTH_RATIO,
      MAX_CARS: GAME.MAX_OBSTACLES,
      DIFFICULTY_INCREASE_RATE: GAME.DIFFICULTY_INCREASE_RATE
    };
    
    // Apply platform-specific settings if on desktop
    if (isDesktop) {
      this.settings = { ...this.settings, ...DESKTOP_SETTINGS };
    }
    
    // Save platform information
    this.isDesktop = isDesktop;
    
    // Debug settings based on URL parameters
    this.debug = {
      enabled: new URLSearchParams(window.location.search).get('debug') === 'true',
      showCollisions: new URLSearchParams(window.location.search).get('debug') === 'true',
      showFPS: new URLSearchParams(window.location.search).get('debug') === 'true'
    };
    
    // Game state constants - use the standardized ones from constants
    this.STATE = STATE;
  }
  
  /**
   * Get the winning line position, scaled by the canvas height ratio if needed
   * @param {number} canvasHeight - Current canvas height (optional)
   * @param {number} baseCanvasHeight - Base canvas height (optional)
   * @returns {number} The winning line position
   */
  getWinningLine(canvasHeight, baseCanvasHeight) {
    const winningLine = this.settings.WINNING_LINE;
    
    // If canvas dimensions are provided, scale the winning line
    if (canvasHeight && baseCanvasHeight) {
      return winningLine * (canvasHeight / baseCanvasHeight);
    }
    
    return winningLine;
  }
  
  /**
   * Get the base movement speed for obstacles
   * @returns {number} The base movement speed
   */
  getBaseSpeed() {
    return this.settings.BASE_SPEED;
  }
  
  /**
   * Get the minimum step size for player movement
   * @returns {number} The minimum step size
   */
  getMinStep() {
    return this.settings.MIN_STEP;
  }
  
  /**
   * Get the player size ratio relative to canvas
   * @returns {number} The player size ratio
   */
  getPlayerSizeRatio() {
    return this.settings.PLAYER_SIZE_RATIO;
  }
  
  /**
   * Get the minimum obstacle width ratio
   * @returns {number} The minimum obstacle width ratio
   */
  getObstacleMinWidthRatio() {
    return this.settings.OBSTACLE_MIN_WIDTH_RATIO;
  }
  
  /**
   * Get the maximum obstacle width ratio
   * @returns {number} The maximum obstacle width ratio
   */
  getObstacleMaxWidthRatio() {
    return this.settings.OBSTACLE_MAX_WIDTH_RATIO;
  }
  
  /**
   * Get the maximum number of obstacles/cars
   * @returns {number} The maximum number of cars
   */
  getMaxCars() {
    return this.settings.MAX_CARS;
  }
  
  /**
   * Get the difficulty increase rate
   * @returns {number} The difficulty increase rate
   */
  getDifficultyIncreaseRate() {
    return this.settings.DIFFICULTY_INCREASE_RATE;
  }
  
  /**
   * Check if debug mode is enabled
   * @returns {boolean} Whether debug mode is enabled
   */
  isDebugEnabled() {
    return this.debug.enabled;
  }
  
  /**
   * Check if collision debugging is enabled
   * @returns {boolean} Whether collision debugging is enabled
   */
  showCollisions() {
    return this.debug.showCollisions;
  }
  
  /**
   * Get the key mappings
   * @returns {Object} The key mappings
   */
  getKeys() {
    return KEYS;
  }
}
