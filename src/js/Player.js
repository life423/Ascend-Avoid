import { GAME_SETTINGS } from './constants.js';
import { getSprite } from './sprites.js';

export default class Player {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.width = 30;
    this.height = 30;
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
    this.x = this.canvas.width / 2;
    this.y = this.canvas.height - 70; // Position near bottom
  }
  
  draw(timestamp = 0) {
    // Calculate responsive size
    const playerSize = Math.max(
      Math.min(this.canvas.width, this.canvas.height) * GAME_SETTINGS.PLAYER_SIZE_RATIO, 
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
    // Calculate movement step size based on canvas dimensions
    const stepSizeX = this.canvas.width * 0.07;
    const stepSizeY = this.canvas.height * 0.07;
    
    // Use the larger of the calculated or minimum step size
    const moveX = Math.max(stepSizeX, GAME_SETTINGS.MIN_STEP);
    const moveY = Math.max(stepSizeY, GAME_SETTINGS.MIN_STEP);
    
    // Move up
    if (this.movementKeys.up && this.canMove.up && this.y > 0) {
      this.y -= moveY;
      this.canMove.up = false;
    }
    if (!this.movementKeys.up) {
      this.canMove.up = true;
    }
    
    // Move down
    if (this.movementKeys.down && this.canMove.down && this.y + this.height <= this.canvas.height - 10) {
      this.y += moveY;
      this.canMove.down = false;
    }
    if (!this.movementKeys.down) {
      this.canMove.down = true;
    }
    
    // Move right
    if (this.movementKeys.right && this.canMove.right && this.x < this.canvas.width - this.width) {
      this.x += moveX;
      this.canMove.right = false;
    }
    if (!this.movementKeys.right) {
      this.canMove.right = true;
    }
    
    // Move left
    if (this.movementKeys.left && this.canMove.left && this.x > 20) {
      this.x -= moveX;
      this.canMove.left = false;
    }
    if (!this.movementKeys.left) {
      this.canMove.left = true;
    }
  }
}
