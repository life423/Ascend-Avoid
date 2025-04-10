/**
 * Manages the creation, updating, and recycling of obstacles
 * to improve efficiency and separate concerns.
 * Implements object pooling pattern for memory optimization.
 * Moved from root to managers/ directory for better organization.
 */
import Obstacle from '/js/objects/Obstacle.js';
import { randomIntFromInterval } from '/js/utils/utils.js';

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
    
    // Active obstacles currently in the game
    this.obstacles = [];
    
    // Pool of inactive obstacles ready for reuse
    this.obstaclePool = [];
    
    // Performance tracking
    this.totalCreated = 0;
    this.totalReused = 0;
    
    this.baseCanvasHeight = canvas.height;
    
    // Initial pool size - pre-allocate some obstacles
    this.initialPoolSize = 10;
  }
  
  /**
   * Initialize the obstacle pool with the first obstacle
   */
  initialize() {
    // Pre-allocate a pool of obstacles
    for (let i = 0; i < this.initialPoolSize; i++) {
      const obstacle = this.createNewObstacle();
      // Move offscreen initially
      obstacle.x = -1000;
      obstacle.y = -1000;
      this.obstaclePool.push(obstacle);
    }
    
    // Start with one active obstacle
    this.obstacles = [this.getObstacleFromPool()];
    
    console.log(`Obstacle pool initialized with ${this.initialPoolSize} obstacles`);
  }
  
  /**
   * Get obstacle statistics for performance monitoring
   * @returns {Object} Obstacle usage statistics
   */
  getStats() {
    return {
      active: this.obstacles.length,
      poolSize: this.obstaclePool.length,
      totalCreated: this.totalCreated,
      totalReused: this.totalReused,
      reuseRatio: this.totalReused / (this.totalCreated + this.totalReused) || 0
    };
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
   * @returns {Obstacle} The repositioned obstacle
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
   * Get an obstacle from the pool or create a new one if pool is empty
   * @returns {Obstacle} An obstacle ready for use
   */
  getObstacleFromPool() {
    let obstacle;
    
    // Try to reuse from pool first
    if (this.obstaclePool.length > 0) {
      obstacle = this.obstaclePool.pop();
      this.totalReused++;
      console.log('Reused obstacle from pool');
    } else {
      // Create a new obstacle if pool is empty
      obstacle = this.createNewObstacle();
      this.totalCreated++;
      console.log('Created new obstacle, pool empty');
    }
    
    // Ensure obstacle is properly positioned
    this.respawnObstacle(obstacle);
    
    return obstacle;
  }
  
  /**
   * Release an obstacle back to the pool for reuse
   * @param {Obstacle} obstacle - The obstacle to release
   */
  releaseObstacleToPool(obstacle) {
    // Remove from active obstacles array
    const index = this.obstacles.indexOf(obstacle);
    if (index !== -1) {
      this.obstacles.splice(index, 1);
    }
    
    // Move off-screen to hide
    obstacle.x = -1000;
    obstacle.y = -1000;
    
    // Add to pool for reuse
    this.obstaclePool.push(obstacle);
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
    
    // Get obstacle from pool
    const obstacle = this.getObstacleFromPool();
    
    // Add to active obstacles
    this.obstacles.push(obstacle);
    
    // Log pool statistics occasionally
    if ((this.totalCreated + this.totalReused) % 10 === 0) {
      console.log(`Obstacle pool stats: created=${this.totalCreated}, reused=${this.totalReused}, ` +
                 `active=${this.obstacles.length}, poolSize=${this.obstaclePool.length}`);
    }
  }
  
  /**
   * Update all obstacles
   * @param {number} timestamp - Current timestamp for animation
   * @param {number} score - Current game score (affects speed)
   * @param {Object} scalingInfo - Scaling information for responsive rendering
   */
  update(timestamp, score, scalingInfo) {
    // Track obstacles to remove
    const offscreenObstacles = [];
    
    // Update each obstacle and check if it's off-screen
    for (const obstacle of this.obstacles) {
      // Update obstacle position
      obstacle.update(timestamp, score);
      
      // If obstacle is moving off-screen, mark for recycling
      if (obstacle.x >= this.canvas.width) {
        offscreenObstacles.push(obstacle);
      }
    }
    
    // Handle offscreen obstacles - either return to pool or respawn
    if (offscreenObstacles.length > 0) {
      if (this.obstacles.length <= this.config.getMinObstacles() || this.config.getMinObstacles() === undefined) {
        // Just respawn if we need to maintain minimum count
        for (const obstacle of offscreenObstacles) {
          this.respawnObstacle(obstacle);
        }
      } else {
        // Return some to the pool to optimize memory usage
        for (const obstacle of offscreenObstacles) {
          // Keep a reasonable number active based on game difficulty/screen size
          const shouldReturnToPool = this.obstaclePool.length < 20; // Limit pool size
          
          if (shouldReturnToPool) {
            this.releaseObstacleToPool(obstacle);
          } else {
            // Just respawn if pool is already full
            this.respawnObstacle(obstacle);
          }
        }
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
