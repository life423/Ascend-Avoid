/**
 * Manages responsive design and performance adaptations for the game
 * Handles canvas scaling, UI adjustments, and performance optimizations
 * based on device/screen size and capabilities
 */
import { CANVAS, DEVICE_SETTINGS } from '../shared/constants/gameConstants.js';

export default class ResponsiveManager {
  /**
   * Creates a new ResponsiveManager instance
   * @param {Object} options - Configuration options
   * @param {Game} options.game - Reference to the game instance
   */
  constructor(game) {
    this.game = game;
    this.canvas = null;
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
    
    // Performance capabilities
    this.capabilities = {
      highPerformance: true,
      canUseWebGL: false,
      maxParticles: 500,
      targetFPS: 60,
      deviceTier: 'high', // 'high', 'medium', 'low'
      deviceProfile: null  // Will hold detailed performance analysis
    };
  }
  
  /**
   * Initialize the responsive manager with a canvas
   * @param {HTMLCanvasElement} canvas - The game canvas
   */
  init(canvas) {
    this.canvas = canvas;
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Detect device capabilities
    this.detectDeviceCapabilities().then(capabilities => {
      this.capabilities = capabilities;
      console.log("Device capabilities detected:", this.capabilities);
      
      // Apply performance settings based on capabilities
      this.applyPerformanceSettings();
    });
    
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
   * Detect device capabilities for performance optimizations
   * @returns {Promise<Object>} A promise that resolves to device capabilities
   */
  async detectDeviceCapabilities() {
    const capabilities = {
      highPerformance: true,
      canUseWebGL: false,
      maxParticles: 500,
      targetFPS: 60,
      deviceTier: 'high',
      memoryLimit: 'high', // 'high', 'medium', 'low'
      deviceProfile: null
    };
    
    // Check for mobile/low-end devices based on user agent
    const isMobile = /Android|iPhone|iPad|iPod|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isLowEndMobile = /Android 4|Android 5|iPhone 6|iPhone 7|iPhone 8|iPad Mini/i.test(navigator.userAgent);
    
    // Check hardware capabilities
    const hardwareConcurrency = navigator.hardwareConcurrency || 2;
    const deviceMemory = (navigator.deviceMemory || 4);
    
    // Check WebGL support
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      capabilities.canUseWebGL = !!gl;
      
      // Additional WebGL capabilities check if supported
      if (gl) {
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        if (debugInfo) {
          const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
          console.log(`WebGL Renderer: ${renderer}`);
          
          // Detect low-end GPUs
          const isLowEndGPU = /Intel|HD Graphics|GMA|Mali-4|Mali-T|Adreno 3|PowerVR/i.test(renderer);
          if (isLowEndGPU) {
            capabilities.highPerformance = false;
          }
        }
      }
    } catch (e) {
      capabilities.canUseWebGL = false;
      console.warn('WebGL detection failed:', e);
    }
    
    // Run a quick performance test
    const perfScore = await this.runPerformanceTest();
    
    // Determine device tier based on all factors
    if (isLowEndMobile || hardwareConcurrency <= 2 || deviceMemory <= 2 || perfScore < 10) {
      capabilities.deviceTier = 'low';
      capabilities.highPerformance = false;
      capabilities.maxParticles = 50;
      capabilities.targetFPS = 30;
      capabilities.memoryLimit = 'low';
    } else if (isMobile || hardwareConcurrency <= 4 || deviceMemory <= 4 || perfScore < 25) {
      capabilities.deviceTier = 'medium';
      capabilities.highPerformance = false;
      capabilities.maxParticles = 150;
      capabilities.targetFPS = 45;
      capabilities.memoryLimit = 'medium';
    }
    
    // Create device profile for analytics
    capabilities.deviceProfile = {
      userAgent: navigator.userAgent,
      hardwareConcurrency,
      deviceMemory,
      screenSize: {
        width: window.screen.width,
        height: window.screen.height,
        pixelRatio: window.devicePixelRatio || 1
      },
      perfScore,
      webGL: capabilities.canUseWebGL
    };
    
    return capabilities;
  }
  
  /**
   * Run a quick performance test to estimate device capabilities
   * @returns {Promise<number>} Performance score (higher is better)
   */
  async runPerformanceTest() {
    return new Promise(resolve => {
      console.log("Running performance test...");
      
      let frameCount = 0;
      const startTime = performance.now();
      const iterations = 1000;
      
      // Test array operations
      const arrays = [];
      for (let i = 0; i < 10; i++) {
        arrays.push(new Float32Array(1000));
      }
      
      // Test rendering performance
      const testCanvas = document.createElement('canvas');
      testCanvas.width = 200;
      testCanvas.height = 200;
      const ctx = testCanvas.getContext('2d');
      
      // Run the test
      const runIteration = (iter) => {
        if (iter >= iterations) {
          // Test complete
          const duration = performance.now() - startTime;
          const score = Math.round((iterations / duration) * 1000);
          console.log(`Performance test completed with score: ${score}`);
          
          // Cleanup
          arrays.length = 0;
          
          resolve(score);
          return;
        }
        
        // Test array manipulations (CPU)
        for (let i = 0; i < arrays.length; i++) {
          const arr = arrays[i];
          for (let j = 0; j < 100; j++) {
            arr[j] = Math.sin(j) * Math.cos(j);
          }
        }
        
        // Test canvas drawing (GPU)
        if (ctx) {
          ctx.clearRect(0, 0, 200, 200);
          for (let i = 0; i < 10; i++) {
            ctx.fillStyle = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.5)`;
            ctx.beginPath();
            ctx.arc(Math.random() * 200, Math.random() * 200, 10 + Math.random() * 20, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        
        frameCount++;
        
        // Continue test asynchronously to avoid blocking UI
        if (iter % 50 === 0) {
          setTimeout(() => runIteration(iter + 1), 0);
        } else {
          runIteration(iter + 1);
        }
      };
      
      // Start the test
      runIteration(0);
    });
  }
  
  /**
   * Apply performance settings based on detected capabilities
   */
  applyPerformanceSettings() {
    console.log(`Applying performance settings for ${this.capabilities.deviceTier} tier device`);
    
    // Update scalingInfo with performance considerations
    this.scalingInfo.reducedResolution = this.capabilities.deviceTier === 'low';
    
    // Apply settings to game components if they exist
    if (this.game) {
      // Update particle system settings
      if (this.game.particleSystem) {
        const maxParticles = this.capabilities.maxParticles;
        this.game.particleSystem.setMaxParticles(maxParticles);
        console.log(`Set max particles to ${maxParticles}`);
      }
      
      // Update rendering quality
      if (this.canvas) {
        if (this.capabilities.deviceTier === 'low') {
          // Lower quality for low-end devices
          this.canvas.className = 'low-quality';
          
          // Reduce canvas size for low-end devices
          const pixelRatio = 0.75; // 75% of native resolution
          const ctx = this.canvas.getContext('2d');
          ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
        }
      }
      
      // Store settings in game configuration
      if (this.game.config) {
        // Allow game to access device tier for conditional logic
        this.game.config.deviceTier = this.capabilities.deviceTier;
        this.game.config.targetFPS = this.capabilities.targetFPS;
      }
    }
    
    // Apply FPS throttling for lower-end devices
    if (this.capabilities.targetFPS < 60) {
      console.log(`Throttling FPS to target ${this.capabilities.targetFPS} FPS`);
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
