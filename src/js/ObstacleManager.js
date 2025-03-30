/**
 * Manages the creation, updating, and recycling of obstacles
 * to improve efficiency and separate concerns.
 */
import Obstacle from './Obstacle.js';
import { randomIntFromInterval } from './utils.js';

export default class ObstacleManager {
  /**
   * Creates a new ObstacleManager
   * @param {Object} options - Configuration options
   * @param {HTMLCanvasElement} options.canvas - The game canvas
   * @param {GameConfig} options.config - Game configuration
   */
  constructor({ canvas, config }) {
    this.canvas = canvas;
    this.config = config;
    this.obstacles = [];
    this.baseCanvasHeight = canvas.height;
  }
  
  /**
   * Initialize the obstacle pool with the first obstacle
   */
  initialize() {
    // Start with one obstacle
    this.obstacles = [this.createNewObstacle()];
  }
  
  /**
   * Create a new obstacle with random properties
   * @returns {Obstacle} The newly created obstacle
   */
  createNewObstacle() {
    // Calculate sizes based on canvas dimensions and config
    const minWidth = Math.max(
      this.canvas.width * this.config.getObstacleMinWidthRatio(),
      30
    );
    
    const maxWidth = Math.max(
      this.canvas.width * this.config.getObstacleMaxWidthRatio(),
      80
    );
    
    // Starting position offscreen to the left
    const startX = -120;
    
    // Height boundaries
    const minY = 20;
    const maxY = this.canvas.height - 50;
    
    // Create the obstacle with random initial position
    return new Obstacle(
      startX,
      randomIntFromInterval(minY, maxY),
      randomIntFromInterval(minWidth, maxWidth),
      this.canvas
    );
  }
  
  /**
   * Reposition an obstacle without overlapping others
   * @param {Obstacle} obstacle - The obstacle to reposition
   */
  respawnObstacle(obstacle) {
    // Start with a position off the left side of the screen
    obstacle.x = -obstacle.width - 20;
    
    // Randomize Y position
    const minY = 20;
    const maxY = this.canvas.height - 50;
    obstacle.y = randomIntFromInterval(minY, maxY);
    
    // Ensure no overlap with other obstacles
    let attempts = 0;
    let hasOverlap = this.checkForOverlap(obstacle);
    
    // Try to find non-overlapping position (max 10 attempts)
    while (hasOverlap && attempts < 10) {
      obstacle.y = randomIntFromInterval(minY, maxY);
      hasOverlap = this.checkForOverlap(obstacle);
      attempts++;
    }
    
    // Recalculate height based on new position
    obstacle.calculateHeight();
    
    return obstacle;
  }
  
  /**
   * Check if an obstacle overlaps with any other obstacles
   * @param {Obstacle} obstacle - The obstacle to check
   * @returns {boolean} Whether the obstacle overlaps with any others
   */
  checkForOverlap(obstacle) {
    for (const other of this.obstacles) {
      if (other === obstacle) continue;
      
      // Simple overlap check
      const horizontalOverlap = 
        obstacle.x < other.x + other.width && 
        obstacle.x + obstacle.width > other.x;
      
      const verticalOverlap = 
        obstacle.y < other.y + other.height && 
        obstacle.y + obstacle.height > other.y;
      
      if (horizontalOverlap && verticalOverlap) {
        return true;
      }
    }
    
    return false;
  }
  
  /**
   * Add a new obstacle to the game
   */
  addObstacle() {
    // Check if we've reached the maximum allowed obstacles
    if (this.obstacles.length >= this.config.getMaxCars()) {
      // Instead of adding a new one, respawn one from the existing pool
      const randomIndex = Math.floor(Math.random() * this.obstacles.length);
      this.respawnObstacle(this.obstacles[randomIndex]);
      return;
    }
    
    // Create and add a new obstacle
    const newObstacle = this.createNewObstacle();
    
    // Make sure it doesn't overlap with existing obstacles
    this.respawnObstacle(newObstacle);
    
    // Add to collection
    this.obstacles.push(newObstacle);
  }
  
  /**
   * Update all obstacles
   * @param {number} timestamp - Current timestamp for animation
   * @param {number} score - Current game score (affects speed)
   */
  update(timestamp, score) {
    // Update each obstacle and check if it's off-screen
    for (const obstacle of this.obstacles) {
      // Update obstacle position
      obstacle.update(timestamp, score);
      
      // If obstacle is moving off-screen, respawn it
      if (obstacle.x >= this.canvas.width) {
        this.respawnObstacle(obstacle);
      }
    }
  }
  
  /**
   * Check for collisions between player and obstacles
   * @param {Player} player - The player object to check against
   * @returns {Obstacle|null} The obstacle that was hit, or null if no collision
   */
  checkCollisions(player) {
    for (const obstacle of this.obstacles) {
      if (obstacle.detectCollision(player)) {
        return obstacle;
      }
    }
    
    return null;
  }
  
  /**
   * Get all obstacles
   * @returns {Array<Obstacle>} The array of obstacles
   */
  getObstacles() {
    return this.obstacles;
  }
  
  /**
   * Reset all obstacles to initial state
   */
  reset() {
    // Clear all obstacles
    this.obstacles = [];
    
    // Add back the initial obstacle
    this.initialize();
  }
}
