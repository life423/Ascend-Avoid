import { GAME_SETTINGS } from './constants.js';
import { getSprite } from './sprites.js';
import { SCALE_FACTOR, BASE_CANVAS_WIDTH, BASE_CANVAS_HEIGHT } from './utils.js';

export default class Player {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    // Base size that will be scaled
    this.baseWidth = 30;
    this.baseHeight = 30;
    // Actual size after scaling
    this.width = this.baseWidth * SCALE_FACTOR;
    this.height = this.baseHeight * SCALE_FACTOR;
    this.resetPosition();
    
    // Movement state
    this.movementKeys = {
      up: false,
      down: false,
      left: false,
      right: false
    };
    
    this.canMove = {
      up: true,
      down: true,
      left: true,
      right: true
    };
  }
  
  resetPosition() {
    // Update dimensions based on current scale factor
    this.width = this.baseWidth * SCALE_FACTOR;
    this.height = this.baseHeight * SCALE_FACTOR;
    
    // Position player at the bottom center
    this.x = this.canvas.width / 2 - this.width / 2;
    this.y = this.canvas.height - this.height - (10 * SCALE_FACTOR); // Position near the bottom with padding
  }
  
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
  
  setMovementKey(key, value) {
    this.movementKeys[key] = value;
  }
  
  move() {
    // Calculate movement step size based on scale factor
    const baseStepX = BASE_CANVAS_WIDTH * 0.07;
    const baseStepY = BASE_CANVAS_HEIGHT * 0.07;
    
    // Scale the movement speed
    const moveX = Math.max(baseStepX * SCALE_FACTOR, GAME_SETTINGS.MIN_STEP * SCALE_FACTOR);
    const moveY = Math.max(baseStepY * SCALE_FACTOR, GAME_SETTINGS.MIN_STEP * SCALE_FACTOR);
    
    // Calculate scaled winning line position
    const scaledWinningLine = GAME_SETTINGS.WINNING_LINE * (this.canvas.height / BASE_CANVAS_HEIGHT);
    
    // Move up - Prevent player from going above winning line
    if (this.movementKeys.up && this.canMove.up && this.y > scaledWinningLine + (10 * SCALE_FACTOR)) {
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
