/**
 * On-screen touch controls for mobile devices
 */
export default class TouchControls {
  constructor(game) {
    this.game = game;
    this.canvas = game.canvas;
    this.player = game.player;
    this.ctx = this.canvas.getContext('2d');
    
    // Control button properties
    this.buttons = {
      up: { x: 75, y: 75, radius: 30, key: 'up', symbol: '▲' },
      down: { x: 75, y: 150, radius: 30, key: 'down', symbol: '▼' },
      left: { x: 30, y: 115, radius: 30, key: 'left', symbol: '◀' },
      right: { x: 120, y: 115, radius: 30, key: 'right', symbol: '▶' },
      restart: { x: this.canvas.width - 40, y: 40, radius: 25, key: 'restart', symbol: 'R' }
    };
    
    // Active button state
    this.activeButtons = {};
    
    // Touch state
    this.touches = [];
    
    // Check if we're on a touch device
    this.isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    // Only set up touch controls if we're on a touch device
    if (this.isTouchDevice) {
      this.setupTouchListeners();
    }
  }
  
  /**
   * Set up touch event listeners
   */
  setupTouchListeners() {
    this.canvas.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
    this.canvas.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
    this.canvas.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false });
    this.canvas.addEventListener('touchcancel', this.handleTouchEnd.bind(this), { passive: false });
  }
  
  /**
   * Handle touch start event
   */
  handleTouchStart(e) {
    e.preventDefault();
    
    // Get canvas-relative coordinates
    const rect = this.canvas.getBoundingClientRect();
    const touches = e.changedTouches;
    
    for (let i = 0; i < touches.length; i++) {
      const touch = touches[i];
      const touchX = touch.clientX - rect.left;
      const touchY = touch.clientY - rect.top;
      
      // Check if the touch is on a button
      for (const [key, button] of Object.entries(this.buttons)) {
        if (this.isPointInButton(touchX, touchY, button)) {
          this.activeButtons[button.key] = touch.identifier;
          
          // Activate the button
          if (button.key === 'restart') {
            this.game.resetGame();
          } else {
            this.player.setMovementKey(button.key, true);
          }
        }
      }
      
      // Store touch for tracking
      this.touches.push({
        id: touch.identifier,
        x: touchX,
        y: touchY
      });
    }
  }
  
  /**
   * Handle touch move event
   */
  handleTouchMove(e) {
    e.preventDefault();
    
    // Get canvas-relative coordinates
    const rect = this.canvas.getBoundingClientRect();
    const touches = e.changedTouches;
    
    for (let i = 0; i < touches.length; i++) {
      const touch = touches[i];
      const touchX = touch.clientX - rect.left;
      const touchY = touch.clientY - rect.top;
      
      // Update touch position
      for (let j = 0; j < this.touches.length; j++) {
        if (this.touches[j].id === touch.identifier) {
          this.touches[j].x = touchX;
          this.touches[j].y = touchY;
          break;
        }
      }
      
      // Check if touch is still on the buttons
      for (const [key, button] of Object.entries(this.buttons)) {
        if (this.activeButtons[button.key] === touch.identifier) {
          // If touch moved out of button, deactivate it
          if (!this.isPointInButton(touchX, touchY, button) && button.key !== 'restart') {
            delete this.activeButtons[button.key];
            this.player.setMovementKey(button.key, false);
          }
        } else if (this.isPointInButton(touchX, touchY, button)) {
          // If touch moved into button, activate it
          this.activeButtons[button.key] = touch.identifier;
          
          if (button.key === 'restart') {
            this.game.resetGame();
          } else {
            this.player.setMovementKey(button.key, true);
          }
        }
      }
    }
  }
  
  /**
   * Handle touch end event
   */
  handleTouchEnd(e) {
    e.preventDefault();
    
    const touches = e.changedTouches;
    
    for (let i = 0; i < touches.length; i++) {
      const touch = touches[i];
      
      // Remove touch from tracking
      for (let j = 0; j < this.touches.length; j++) {
        if (this.touches[j].id === touch.identifier) {
          this.touches.splice(j, 1);
          break;
        }
      }
      
      // Check if the touch was on a button
      for (const [key, button] of Object.entries(this.buttons)) {
        if (this.activeButtons[button.key] === touch.identifier) {
          // Deactivate button
          delete this.activeButtons[button.key];
          if (button.key !== 'restart') {
            this.player.setMovementKey(button.key, false);
          }
        }
      }
    }
  }
  
  /**
   * Check if a point is within a button
   */
  isPointInButton(x, y, button) {
    const dx = x - button.x;
    const dy = y - button.y;
    return dx * dx + dy * dy <= button.radius * button.radius;
  }
  
  /**
   * Draw touch controls
   */
  draw() {
    // Only draw controls on touch devices
    if (!this.isTouchDevice) return;
    
    // Draw each button
    for (const [key, button] of Object.entries(this.buttons)) {
      // Button fill
      this.ctx.fillStyle = this.activeButtons[button.key] !== undefined
        ? 'rgba(12, 199, 199, 0.8)'
        : 'rgba(100, 100, 100, 0.5)';
      
      // Draw button
      this.ctx.beginPath();
      this.ctx.arc(button.x, button.y, button.radius, 0, Math.PI * 2);
      this.ctx.fill();
      
      // Button border
      this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
      this.ctx.lineWidth = 2;
      this.ctx.stroke();
      
      // Button text
      this.ctx.fillStyle = 'white';
      this.ctx.font = `${button.radius * 0.8}px Arial`;
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(button.symbol, button.x, button.y);
    }
  }
}
