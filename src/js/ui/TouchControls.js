/**
 * On-screen touch controls for mobile devices using DOM elements instead of canvas
 * Moved from root to ui/ directory for better organization.
 */
import { SCALE_FACTOR } from '../utils/utils.js';

export default class TouchControls {
  /**
   * Creates a new TouchControls instance
   * @param {Game} game - The main game instance
   */
  constructor(game) {
    this.game = game;
    this.player = game.player;
    
    // Save current scale for comparison on resize
    this.currentScale = SCALE_FACTOR;
    
    // Control button properties with symbols
    this.buttons = {
      up: { key: 'up', symbol: '▲' },
      down: { key: 'down', symbol: '▼' },
      left: { key: 'left', symbol: '◀' },
      right: { key: 'right', symbol: '▶' },
      restart: { key: 'restart', symbol: '⟳' }
    };
    
    // Active button state
    this.activeButtons = {};
    
    // Check if we're on a touch device (expanded detection)
    this.isTouchDevice = 
      'ontouchstart' in window || 
      navigator.maxTouchPoints > 0 || 
      window.matchMedia("(max-width: 1024px)").matches ||
      window.matchMedia("(pointer: coarse)").matches;
    
    // Always create controls, but hide them on non-touch devices
    this.createControlElements();
    this.setupTouchListeners();
    
    // Hide controls on desktop/mouse-based devices
    if (!this.isTouchDevice) {
      this.hide();
    }
    
    // Handle window resize to show/hide controls dynamically
    window.addEventListener('resize', this.handleResize.bind(this));
  }
  
  /**
   * Handle window resize and adjust controls for the screen size
   */
  handleResize() {
    // Check if device is mobile or touch-enabled
    const isMobile = 
      window.matchMedia("(max-width: 1024px)").matches || 
      window.matchMedia("(pointer: coarse)").matches ||
      'ontouchstart' in window || 
      navigator.maxTouchPoints > 0;
    
    if (isMobile || this.isTouchDevice) {
      this.show();
      this.resize(); // Adjust sizes based on new dimensions
    } else {
      this.hide();
    }
  }
  
  /**
   * Resize touch controls based on screen size
   */
  resize() {
    // If scale factor changed significantly, adjust button sizes
    if (Math.abs(this.currentScale - SCALE_FACTOR) > 0.05) {
      this.currentScale = SCALE_FACTOR;
      
      // Calculate new button size based on viewport
      const buttonSize = Math.max(50, Math.min(70 * SCALE_FACTOR, 100));
      const fontSize = Math.max(18, Math.min(28 * SCALE_FACTOR, 36));
      
      // Get all control buttons
      const buttons = this.container.querySelectorAll('.control-button');
      
      // Update size and font for all buttons
      buttons.forEach(button => {
        button.style.width = `${buttonSize}px`;
        button.style.height = `${buttonSize}px`;
        button.style.fontSize = `${fontSize}px`;
      });
      
      // Update grid size for direction pad
      this.directionControls.style.gridTemplateColumns = `repeat(3, ${buttonSize}px)`;
      this.directionControls.style.gridTemplateRows = `repeat(3, ${buttonSize}px)`;
      
      // Adjust spacing based on screen size
      const spacing = Math.max(5, Math.min(40 * SCALE_FACTOR, 60));
      this.directionControls.style.marginRight = `${spacing}px`;
      this.restartControl.style.marginLeft = `${spacing}px`;
      
      // Update grid gap
      const gridGap = Math.max(4, Math.min(8 * SCALE_FACTOR, 12));
      this.directionControls.style.gridGap = `${gridGap}px`;
    }
  }
  
  /**
   * Create DOM elements for touch controls
   */
  createControlElements() {
    // Get the container for controls
    this.container = document.getElementById('touch-controls-container');
    
    // Make container responsive to viewport size
    this.container.style.maxWidth = '100%';
    
    // Create directional controls container
    this.directionControls = document.createElement('div');
    this.directionControls.className = 'direction-controls';
    
    // Create restart control container
    this.restartControl = document.createElement('div');
    this.restartControl.className = 'restart-control';
    
    // Create directional buttons
    for (const direction of ['up', 'down', 'left', 'right']) {
      const button = document.createElement('div');
      button.className = `control-button ${direction}`;
      button.dataset.key = direction;
      button.textContent = this.buttons[direction].symbol;
      this.directionControls.appendChild(button);
    }
    
    // Create restart button
    const restartButton = document.createElement('div');
    restartButton.className = 'control-button restart';
    restartButton.dataset.key = 'restart';
    restartButton.textContent = this.buttons.restart.symbol;
    this.restartControl.appendChild(restartButton);
    
    // Add controls to the container
    this.container.appendChild(this.directionControls);
    this.container.appendChild(this.restartControl);
    
    // Store references to all buttons for easy access
    this.buttonElements = {
      up: this.directionControls.querySelector('.up'),
      down: this.directionControls.querySelector('.down'),
      left: this.directionControls.querySelector('.left'),
      right: this.directionControls.querySelector('.right'),
      restart: this.restartControl.querySelector('.restart')
    };
  }
  
  /**
   * Set up touch event listeners for all control buttons
   */
  setupTouchListeners() {
    // For each button, add event listeners
    Object.keys(this.buttonElements).forEach(key => {
      const button = this.buttonElements[key];
      
      // Touch start - activate button
      button.addEventListener('touchstart', (e) => {
        e.preventDefault();
        this.handleButtonActivation(key, true, e.changedTouches[0].identifier);
      }, { passive: false });
      
      // Touch end - deactivate button
      button.addEventListener('touchend', (e) => {
        e.preventDefault();
        this.handleButtonActivation(key, false, e.changedTouches[0].identifier);
      }, { passive: false });
      
      // Touch cancel - deactivate button
      button.addEventListener('touchcancel', (e) => {
        e.preventDefault();
        this.handleButtonActivation(key, false, e.changedTouches[0].identifier);
      }, { passive: false });
      
      // Touch leave - deactivate button if touch moves out
      button.addEventListener('touchleave', (e) => {
        e.preventDefault();
        this.handleButtonActivation(key, false, e.changedTouches[0].identifier);
      }, { passive: false });
    });
  }
  
  /**
   * Handle button activation state
   * @param {string} key - The button key (up, down, left, right, restart)
   * @param {boolean} isActive - Whether to activate or deactivate the button
   * @param {number} touchId - Touch identifier to keep track of which touch is on which button
   */
  handleButtonActivation(key, isActive, touchId) {
    const button = this.buttonElements[key];
    
    if (isActive) {
      // Activate button
      button.classList.add('active');
      this.activeButtons[key] = touchId;
      
      // Trigger action based on button
      if (key === 'restart') {
        this.game.resetGame();
      } else {
        this.player.setMovementKey(key, true);
      }
    } else {
      // If this touch ID matches the one that activated this button
      if (this.activeButtons[key] === touchId) {
        // Deactivate button
        button.classList.remove('active');
        delete this.activeButtons[key];
        
        // Stop movement for movement keys
        if (key !== 'restart') {
          this.player.setMovementKey(key, false);
        }
      }
    }
  }
  
  /**
   * Hide the touch controls - called when touch is not supported or not needed
   */
  hide() {
    if (this.container) {
      this.container.style.display = 'none';
    }
  }
  
  /**
   * Show the touch controls
   */
  show() {
    if (this.container) {
      this.container.style.display = 'flex';
    }
  }
  
  /**
   * Draw the touch controls - empty method to match Game's expectations
   * Since we're using DOM elements, no actual canvas drawing is needed
   */
  draw() {
    // No canvas drawing needed - controls are DOM elements
    // This method exists to match the Game class expectations
    return; // Explicitly return to ensure method is recognized
  }
}
