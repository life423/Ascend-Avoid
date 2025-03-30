/**
 * Handles and normalizes all input for the game, decoupling input handling
 * from game logic. Supports keyboard and touch controls.
 */
export default class InputManager {
  /**
   * Creates a new InputManager
   * @param {Object} options - Configuration options
   * @param {Object} options.keyMappings - Key mappings for controls
   */
  constructor({ keyMappings }) {
    // Store key mappings
    this.keyMappings = keyMappings;
    
    // Internal state for tracking pressed keys
    this.keys = {
      up: false,
      down: false,
      left: false,
      right: false,
      restart: false
    };
    
    // Touch state tracking
    this.touchStart = { x: 0, y: 0 };
    this.isTouchDevice = false;
    
    // Bind methods to maintain context
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
    this.handleTouchStart = this.handleTouchStart.bind(this);
    this.handleTouchEnd = this.handleTouchEnd.bind(this);
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Detect if device supports touch
    this.detectTouchSupport();
  }
  
  /**
   * Set up event listeners for keyboard and touch input
   */
  setupEventListeners() {
    // Keyboard events
    document.addEventListener('keydown', this.handleKeyDown);
    document.addEventListener('keyup', this.handleKeyUp);
  }
  
  /**
   * Set up touch event listeners for a specific canvas
   * @param {HTMLCanvasElement} canvas - The canvas element for touch controls
   */
  setupTouchControls(canvas) {
    if (canvas) {
      canvas.addEventListener('touchstart', this.handleTouchStart);
      canvas.addEventListener('touchend', this.handleTouchEnd);
    }
  }
  
  /**
   * Remove all event listeners - important for cleanup
   */
  removeEventListeners() {
    // Remove keyboard events
    document.removeEventListener('keydown', this.handleKeyDown);
    document.removeEventListener('keyup', this.handleKeyUp);
    
    // Can't remove touch events here since we don't store canvas reference
    // This should be handled in dispose() with a stored canvas reference
  }
  
  /**
   * Detect if the device supports touch
   */
  detectTouchSupport() {
    this.isTouchDevice = (
      window.matchMedia("(max-width: 1024px)").matches || 
      window.matchMedia("(pointer: coarse)").matches ||
      ('ontouchstart' in window) || 
      (navigator.maxTouchPoints > 0)
    );
  }
  
  /**
   * Handle keydown events
   * @param {KeyboardEvent} e - The keyboard event
   */
  handleKeyDown(e) {
    // Look for movement keys
    if (this.keyMappings.UP.includes(e.key) || e.keyCode === 38) {
      this.keys.up = true;
    }
    
    if (this.keyMappings.DOWN.includes(e.key) || e.keyCode === 40) {
      this.keys.down = true;
    }
    
    if (this.keyMappings.LEFT.includes(e.key) || e.keyCode === 37) {
      this.keys.left = true;
    }
    
    if (this.keyMappings.RIGHT.includes(e.key) || e.keyCode === 39) {
      this.keys.right = true;
    }
    
    // Check for restart key
    if (this.keyMappings.RESTART.includes(e.key)) {
      this.keys.restart = true;
      
      // Fire a custom event for restart to avoid checking each frame
      document.dispatchEvent(new CustomEvent('game:restart'));
    }
    
    // Debug logging if needed
    if (window.DEBUG) {
      console.log('Key down:', e.key, e.keyCode);
    }
  }
  
  /**
   * Handle keyup events
   * @param {KeyboardEvent} e - The keyboard event
   */
  handleKeyUp(e) {
    // Release movement keys
    if (this.keyMappings.UP.includes(e.key) || e.keyCode === 38) {
      this.keys.up = false;
    }
    
    if (this.keyMappings.DOWN.includes(e.key) || e.keyCode === 40) {
      this.keys.down = false;
    }
    
    if (this.keyMappings.LEFT.includes(e.key) || e.keyCode === 37) {
      this.keys.left = false;
    }
    
    if (this.keyMappings.RIGHT.includes(e.key) || e.keyCode === 39) {
      this.keys.right = false;
    }
    
    if (this.keyMappings.RESTART.includes(e.key)) {
      this.keys.restart = false;
    }
    
    // Debug logging if needed
    if (window.DEBUG) {
      console.log('Key up:', e.key, e.keyCode);
    }
  }
  
  /**
   * Handle touch start events
   * @param {TouchEvent} e - The touch event
   */
  handleTouchStart(e) {
    e.preventDefault();
    const touch = e.touches[0];
    this.touchStart.x = touch.clientX;
    this.touchStart.y = touch.clientY;
  }
  
  /**
   * Handle touch end events
   * @param {TouchEvent} e - The touch event
   */
  handleTouchEnd(e) {
    e.preventDefault();
    const touch = e.changedTouches[0];
    const touchEndX = touch.clientX;
    const touchEndY = touch.clientY;
    
    // Calculate deltas
    const deltaX = touchEndX - this.touchStart.x;
    const deltaY = touchEndY - this.touchStart.y;
    
    // Determine swipe direction based on the larger delta
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // Horizontal swipe
      if (deltaX > 20) {
        this.setTemporaryInput('right');
      } else if (deltaX < -20) {
        this.setTemporaryInput('left');
      }
    } else {
      // Vertical swipe
      if (deltaY > 20) {
        this.setTemporaryInput('down');
      } else if (deltaY < -20) {
        this.setTemporaryInput('up');
      }
    }
  }
  
  /**
   * Set a temporary input (for swipes)
   * @param {string} direction - The direction ('up', 'down', 'left', 'right')
   * @param {number} duration - How long to apply the input in ms
   */
  setTemporaryInput(direction, duration = 100) {
    // Set the input to true
    this.keys[direction] = true;
    
    // Reset after the specified duration
    setTimeout(() => {
      this.keys[direction] = false;
    }, duration);
  }
  
  /**
   * Get the current input state
   * @returns {Object} The current input state
   */
  getInputState() {
    // Return a copy of the current keys state to prevent external modification
    return { ...this.keys };
  }
  
  /**
   * Register a custom touch button
   * @param {HTMLElement} element - The button element
   * @param {string} inputName - The input to activate ('up', 'down', etc.)
   */
  registerTouchButton(element, inputName) {
    if (element && this.keys.hasOwnProperty(inputName)) {
      // Add touch listeners to the button
      element.addEventListener('touchstart', (e) => {
        e.preventDefault();
        this.keys[inputName] = true;
        element.classList.add('active');
      });
      
      element.addEventListener('touchend', (e) => {
        e.preventDefault();
        this.keys[inputName] = false;
        element.classList.remove('active');
      });
      
      // Also handle mouse events for testing on desktop
      element.addEventListener('mousedown', (e) => {
        this.keys[inputName] = true;
        element.classList.add('active');
      });
      
      element.addEventListener('mouseup', (e) => {
        this.keys[inputName] = false;
        element.classList.remove('active');
      });
      
      // Handle case where mouse exits button while pressed
      element.addEventListener('mouseleave', (e) => {
        if (element.classList.contains('active')) {
          this.keys[inputName] = false;
          element.classList.remove('active');
        }
      });
    }
  }
  
  /**
   * Clean up resources and remove event listeners
   */
  dispose() {
    this.removeEventListeners();
  }
}
