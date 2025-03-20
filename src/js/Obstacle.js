import { GAME_SETTINGS } from './constants.js';
import { randomIntFromInterval } from './utils.js';
import { getSprite } from './sprites.js';

export default class Obstacle {
  constructor(x, y, width, canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.x = x;
    this.y = y;
    this.width = width;
    
    // Calculate height based on canvas dimensions
    this.calculateHeight();
    
    this.baseSpeed = GAME_SETTINGS.BASE_SPEED;
    this.speed = this.baseSpeed;
    this.lastUpdateTime = 0;
    
    // Random variant for visual diversity (0-2)
    this.variant = randomIntFromInterval(0, 2);
    
    // Collision state
    this.isColliding = false;
    this.explosionFrame = 0;
  }
  
  // Recalculate height based on canvas dimensions
  calculateHeight() {
    this.height = Math.max(this.canvas.height * 0.04, 20);
  }
  
  // Method which draws the obstacle
  draw(timestamp = 0) {
    if (this.isColliding) {
      // Draw explosion when colliding
      const explosionSprite = getSprite('explosion', this.explosionFrame);
      // Center explosion on obstacle
      const explosionSize = Math.max(this.width, this.height) * 1.5;
      this.ctx.drawImage(
        explosionSprite, 
        this.x + (this.width/2) - (explosionSize/2),
        this.y + (this.height/2) - (explosionSize/2),
        explosionSize,
        explosionSize
      );
    } else {
      // Get and draw obstacle sprite with variant
      const obstacleSprite = getSprite('obstacle', this.variant, timestamp);
      this.ctx.drawImage(obstacleSprite, this.x, this.y, this.width, this.height);
    }
  }

  // Method which causes the obstacles to move across the screen consistently
  update(timestamp, score) {
    // On first update, initialize the time
    if (this.lastUpdateTime === 0) {
      this.lastUpdateTime = timestamp;
      return;
    }
    
    // Calculate time-based movement for consistent speed across devices
    const deltaTime = (timestamp - this.lastUpdateTime) / 16.67; // Normalize to ~60fps
    this.lastUpdateTime = timestamp;
    
    // If colliding, advance explosion animation but don't move
    if (this.isColliding) {
      // Advance explosion animation
      if (timestamp % 5 === 0) {
        this.explosionFrame++;
      }
      
      // Reset obstacle after explosion finishes
      if (this.explosionFrame > 4) {
        this.resetObstacle();
      }
    } else {
      // Update speed based on score (increases difficulty)
      this.speed = this.baseSpeed + (score / 10);
      
      // Move the obstacle
      if (this.x < this.canvas.width) {
        // Use deltaTime for frame-rate independent movement
        this.x += this.speed * deltaTime;
      } else {
        // Reset position when off screen
        this.resetObstacle();
      }
    }
    
    this.draw(timestamp);
  }
  
  // Reset obstacle position and properties
  resetObstacle() {
    this.x = -this.width;
    // Randomize the y position for variety
    this.y = randomIntFromInterval(20, this.canvas.height - 50);
    // Randomize variant for visual diversity
    this.variant = randomIntFromInterval(0, 2);
    // Recalculate height in case canvas was resized
    this.calculateHeight();
    // Reset collision state
    this.isColliding = false;
    this.explosionFrame = 0;
  }
  
  // Collision detection with player
  detectCollision(player) {
    const colliding = (
      this.x < player.x + player.width && 
      this.x + this.width > player.x && 
      this.y < player.y + player.height && 
      this.y + this.height > player.y
    );
    
    // Set collision state (for explosion animation)
    if (colliding && !this.isColliding) {
      this.isColliding = true;
      this.explosionFrame = 0;
    }
    
    return colliding;
  }
}
