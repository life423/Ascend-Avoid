/**
 * Manages responsive UI scaling and device-specific adaptations.
 * Centralizes all responsive behavior that was previously mixed with game configuration.
 */
import { CANVAS, DEVICE_SETTINGS } from '../shared/constants/gameConstants.js';

export default class ResponsiveManager {
  /**
   * Creates a new ResponsiveManager instance
   * @param {Object} options - Configuration options
   * @param {HTMLCanvasElement} options.canvas - The game canvas
   * @param {Function} options.onResize - Callback to handle resize events
   */
  constructor({ canvas, onResize }) {
    this.canvas = canvas;
    this.onResize = onResize;
    this.baseCanvasWidth = CANVAS.BASE_WIDTH;
    this.baseCanvasHeight = CANVAS.BASE_HEIGHT;
    
    // Current device settings
    this.isDesktop = this.detectDesktop();
    this.deviceSettings = this.isDesktop ? DEVICE_SETTINGS.DESKTOP : DEVICE_SETTINGS.MOBILE;
    
    // Scaling information
    this.scalingInfo = {
      widthScale: 1,
      heightScale: 1,
      pixelRatio: window.devicePixelRatio || 1,
      reducedResolution: false
    };
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Initial resize
    this.handleResize();
  }
  
  /**
   * Set up event listeners for responsive behavior
   */
  setupEventListeners() {
    // Listen for window resize
    window.addEventListener('resize', this.handleResize.bind(this));
    
    // Listen for orientation change on mobile
    window.addEventListener('orientationchange', this.handleResize.bind(this));
    
    // Listen for visibility change to handle tab switching
    document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
  }
  
  /**
   * Handle window resize event
   */
  handleResize() {
    // Re-check device type
    const wasDesktop = this.isDesktop;
    this.isDesktop = this.detectDesktop();
    
    // Update device settings if device type changed
    if (wasDesktop !== this.isDesktop) {
      this.deviceSettings = this.isDesktop ? DEVICE_SETTINGS.DESKTOP : DEVICE_SETTINGS.MOBILE;
    }
    
    // Resize canvas
    this.resizeCanvas();
    
    // Execute callback if provided
    if (this.onResize) {
      this.onResize(this.scalingInfo.widthScale, this.scalingInfo.heightScale, this.isDesktop);
    }
  }
  
  /**
   * Handle document visibility change (active tab changes)
   */
  handleVisibilityChange() {
    if (document.visibilityState === 'visible') {
      // Force a resize check when tab becomes visible again
      this.handleResize();
    }
  }
  
  /**
   * Detect if current viewport is desktop sized
   * @returns {boolean} Whether the current viewport is desktop sized
   */
  detectDesktop() {
    return window.matchMedia('(min-width: 1200px)').matches;
  }
  
  /**
   * Resize canvas to match viewport, maintaining aspect ratio
   */
  resizeCanvas() {
    if (!this.canvas) return;
    
    // Get parent container dimensions
    const parent = this.canvas.parentElement;
    const parentWidth = parent.clientWidth;
    const parentHeight = parent.clientHeight;
    
    // Calculate scaling factors
    const widthScale = parentWidth / this.baseCanvasWidth;
    const heightScale = parentHeight / this.baseCanvasHeight;
    
    // Determine if we're in a constrained space
    const isConstrained = widthScale < 0.8 || heightScale < 0.8;
    
    // Calculate canvas dimensions
    let canvasWidth, canvasHeight;
    
    if (this.isDesktop) {
      // On desktop, try to maintain aspect ratio
      const scale = Math.min(widthScale, heightScale);
      canvasWidth = this.baseCanvasWidth * scale;
      canvasHeight = this.baseCanvasHeight * scale;
    } else {
      // On mobile, fill the container
      canvasWidth = parentWidth;
      canvasHeight = parentHeight;
    }
    
    // Apply dimensions to canvas
    this.canvas.style.width = `${canvasWidth}px`;
    this.canvas.style.height = `${canvasHeight}px`;
    
    // Set canvas resolution
    const pixelRatio = window.devicePixelRatio || 1;
    
    // Reduce resolution for low-end devices or severely constrained spaces
    const reduceResolution = isConstrained && !this.isDesktop;
    const effectivePixelRatio = reduceResolution ? 1 : pixelRatio;
    
    // Update canvas internal dimensions for correct rendering
    this.canvas.width = canvasWidth * effectivePixelRatio;
    this.canvas.height = canvasHeight * effectivePixelRatio;
    
    // Scale canvas context to match pixel ratio
    const ctx = this.canvas.getContext('2d');
    ctx.scale(effectivePixelRatio, effectivePixelRatio);
    
    // Update scaling info
    this.scalingInfo = {
      widthScale: canvasWidth / this.baseCanvasWidth,
      heightScale: canvasHeight / this.baseCanvasHeight,
      pixelRatio: effectivePixelRatio,
      reducedResolution: reduceResolution
    };
    
    console.log(`Canvas resized: ${canvasWidth}x${canvasHeight}, scale: ${this.scalingInfo.widthScale.toFixed(2)}`);
  }
  
  /**
   * Get the current device settings
   * @returns {Object} The current device settings
   */
  getDeviceSettings() {
    return this.deviceSettings;
  }
  
  /**
   * Get the current scaling information
   * @returns {Object} The current scaling information
   */
  getScalingInfo() {
    return this.scalingInfo;
  }
  
  /**
   * Check if the current device is desktop
   * @returns {boolean} Whether the current device is desktop
   */
  isDesktopDevice() {
    return this.isDesktop;
  }
  
  /**
   * Calculate a responsive value based on the base value and scaling
   * @param {number} baseValue - The base value
   * @param {string} dimension - The dimension to scale by ('width', 'height', or 'both')
   * @returns {number} The scaled value
   */
  getResponsiveValue(baseValue, dimension = 'both') {
    if (dimension === 'width') {
      return baseValue * this.scalingInfo.widthScale;
    } else if (dimension === 'height') {
      return baseValue * this.scalingInfo.heightScale;
    } else {
      // Use average scaling for 'both'
      const avgScale = (this.scalingInfo.widthScale + this.scalingInfo.heightScale) / 2;
      return baseValue * avgScale;
    }
  }
  
  /**
   * Clean up resources (important for memory management)
   */
  dispose() {
    // Remove event listeners
    window.removeEventListener('resize', this.handleResize);
    window.removeEventListener('orientationchange', this.handleResize);
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
  }
}
