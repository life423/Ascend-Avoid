/**
 * On-screen touch controls for mobile devices using DOM elements instead of canvas
 */
export default class TouchControls {
  constructor(game) {
    this.game = game;
    this.player = game.player;
    
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
    
    // Check if we're on a touch device
    this.isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0 || window.matchMedia("(max-width: 768px)").matches;
    
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
   * Handle window resize to dynamically show/hide touch controls
   */
  handleResize() {
    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    if (isMobile || this.isTouchDevice) {
      this.show();
    } else {
      this.hide();
    }
  }
  
  /**
   * Create DOM elements for touch controls
   */
  createControlElements() {
    // Get the container for controls
    this.container = document.getElementById('touch-controls-container');
    
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
}
