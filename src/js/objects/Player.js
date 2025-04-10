/**
 * Player class representing the player entity in the game.
 * Moved from root to objects/ directory for better organization.
 */
import { GAME, PLAYER } from '../shared/constants/gameConstants.js';
import { getSprite } from '../sprites.js';
import { SCALE_FACTOR, BASE_CANVAS_WIDTH, BASE_CANVAS_HEIGHT } from '../utils/utils.js';

export default class Player {
  /**
   * Creates a new Player instance
   * @param {HTMLCanvasElement} canvas - The game canvas
   */
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    
    // Base size that will be scaled
    this.baseWidth = PLAYER.BASE_WIDTH;
    this.baseHeight = PLAYER.BASE_HEIGHT;
    
    // Actual size after scaling
    this.width = this.baseWidth * SCALE_FACTOR;
    this.height = this.baseHeight * SCALE_FACTOR;
    
    // Set initial position
    this.resetPosition();
    
    // Movement state
    this.movementKeys = {
      up: false,
      down: false,
      left: false,
      right: false
    };
    
    // Movement cooldown flags to prevent continuous movement
    this.canMove = {
      up: true,
      down: true,
      left: true,
      right: true
    };
  }
  
  /**
   * Reset player to starting position at the bottom center of the screen
   */
  resetPosition() {
    // Update dimensions based on current scale factor
    this.width = this.baseWidth * SCALE_FACTOR;
    this.height = this.baseHeight * SCALE_FACTOR;
    
    // Position player at the bottom center
    this.x = this.canvas.width / 2 - this.width / 2;
    this.y = this.canvas.height - this.height - (10 * SCALE_FACTOR); // Position near the bottom with padding
  }
  
  /**
   * Draw the player on the canvas
   * @param {number} timestamp - Current timestamp for animation
   */
  draw(timestamp = 0) {
    // Calculate responsive size based on scale factor
    const playerSize = Math.max(
      this.baseWidth * SCALE_FACTOR,
      15
    );
    
    // Update dimensions for collision detection
    this.width = playerSize;
    this.height = playerSize;
    
    // Get and draw animated player sprite with current timestamp for animation
    const playerSprite = getSprite('player', 0, timestamp);
    this.ctx.drawImage(playerSprite, this.x, this.y, playerSize, playerSize);
  }
  
  /**
   * Set a movement key state
   * @param {string} key - The key to set ('up', 'down', 'left', 'right')
   * @param {boolean} value - The value to set
   */
  setMovementKey(key, value) {
    this.movementKeys[key] = value;
  }
  
  /**
   * Move the player based on current input state
   */
  move() {
    // Calculate movement step size based on scale factor
    const baseStepX = BASE_CANVAS_WIDTH * 0.07;
    const baseStepY = BASE_CANVAS_HEIGHT * 0.07;
    
    // Scale the movement speed
    const moveX = Math.max(baseStepX * SCALE_FACTOR, PLAYER.MIN_STEP * SCALE_FACTOR);
    const moveY = Math.max(baseStepY * SCALE_FACTOR, PLAYER.MIN_STEP * SCALE_FACTOR);
    
    // Calculate scaled winning line position
    const scaledWinningLine = GAME.WINNING_LINE * (this.canvas.height / BASE_CANVAS_HEIGHT);
    
    // Move up - Allow player to reach the winning line
    if (this.movementKeys.up && this.canMove.up && this.y > scaledWinningLine - (this.height / 2)) {
      this.y -= moveY;
      this.canMove.up = false;
    }
    if (!this.movementKeys.up) {
      this.canMove.up = true;
    }
    
    // Move down
    if (this.movementKeys.down && this.canMove.down && this.y + this.height <= this.canvas.height - (10 * SCALE_FACTOR)) {
      this.y += moveY;
      this.canMove.down = false;
    }
    if (!this.movementKeys.down) {
      this.canMove.down = true;
    }
    
    // Move right
    if (this.movementKeys.right && this.canMove.right && this.x < this.canvas.width - this.width - (5 * SCALE_FACTOR)) {
      this.x += moveX;
      this.canMove.right = false;
    }
    if (!this.movementKeys.right) {
      this.canMove.right = true;
    }
    
    // Move left
    if (this.movementKeys.left && this.canMove.left && this.x > (5 * SCALE_FACTOR)) {
      this.x -= moveX;
      this.canMove.left = false;
    }
    if (!this.movementKeys.left) {
      this.canMove.left = true;
    }
  }
}
