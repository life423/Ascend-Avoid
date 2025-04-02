/**
 * ResponsiveManager.js
 * 
 * Manages responsive behavior for the game, handling canvas scaling,
 * device detection, and responsive UI sizing to ensure consistent 
 * gameplay experience across various devices and screen sizes.
 */

// No imports needed

export default class ResponsiveManager {
    constructor(game) {
        this.game = game;
        this.canvas = null;
        this.ctx = null;
        
        // Reference dimensions
        this.BASE_WIDTH = 560;
        this.BASE_HEIGHT = 550;
        this.ASPECT_RATIO = this.BASE_HEIGHT / this.BASE_WIDTH;
        
        // Scaling factors
        this.widthScale = 1;
        this.heightScale = 1;
        this.scaleFactor = 1; // General purpose scaling factor
        
        // Device info
        this.deviceInfo = null;
        
        // Performance optimization flags
        this.reducedResolution = false;
        this.frameskipThreshold = 30; // FPS below which we might skip frames
        
        // Resize event handler
        this.resizeHandler = this.debounce(this.resize.bind(this), 250);
    }
    
    /**
     * Initialize the responsive manager with a canvas element
     * @param {HTMLCanvasElement} canvas - The game canvas element
     */
    init(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        
        // Detect device capabilities
        this.updateDeviceInfo();
        
        // Perform initial resize
        this.resize();
        
        // Set up event listeners
        window.addEventListener('resize', this.resizeHandler);
        window.addEventListener('orientationchange', this.resizeHandler);
        
        console.log('ResponsiveManager initialized:', this.deviceInfo);
        
        return this;
    }
    
    /**
     * Detect and update device capabilities and characteristics
     */
    updateDeviceInfo() {
        this.deviceInfo = {
            // Is this a touch-capable device?
            isTouchDevice:
                'ontouchstart' in window ||
                navigator.maxTouchPoints > 0 ||
                window.matchMedia('(pointer: coarse)').matches,
            
            // Device type based on screen size
            isMobile: window.innerWidth < 768,
            isTablet: window.innerWidth >= 768 && window.innerWidth < 1200,
            isDesktop: window.innerWidth >= 1200,
            
            // Display characteristics
            isHighDPI: window.devicePixelRatio > 1.5,
            isLowEndDevice: window.devicePixelRatio < 2 && window.innerWidth < 768,
            pixelRatio: window.devicePixelRatio || 1,
            
            // Orientation
            isLandscape: window.innerWidth > window.innerHeight,
            
            // Window dimensions
            windowWidth: window.innerWidth,
            windowHeight: window.innerHeight
        };
        
        return this.deviceInfo;
    }
    
    /**
     * Resize the canvas based on the parent container and device characteristics
     */
    resize() {
        if (!this.canvas) return;
        
        // Update device info on resize
        this.updateDeviceInfo();
        
        const container = this.canvas.parentElement;
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight || this.BASE_HEIGHT;
        
        let canvasWidth, canvasHeight;
        
        // Calculate optimal canvas size based on device type
        if (this.deviceInfo.isDesktop) {
            // Desktop - prioritize quality and precision
            canvasWidth = containerWidth;
            canvasHeight = Math.max(containerHeight, this.BASE_HEIGHT);
            
            // Apply max-width constraint if needed
            const maxWidth = 1200; // Match CSS max-width
            if (canvasWidth > maxWidth) {
                canvasWidth = maxWidth;
                canvasHeight = canvasWidth * this.ASPECT_RATIO;
            }
            
            // Check if height would exceed window constraints
            const maxHeight = window.innerHeight * 0.85;
            if (canvasHeight > maxHeight) {
                canvasHeight = maxHeight;
                canvasWidth = canvasHeight / this.ASPECT_RATIO;
            }
            
            // Desktop performance optimization - adjust based on DPI
            this.reducedResolution = false;
            if (this.deviceInfo.isHighDPI && canvasWidth * this.deviceInfo.pixelRatio > 1800) {
                // For very high resolution screens, we can use a slightly lower resolution buffer
                this.reducedResolution = true;
            }
        } else {
            // Mobile/Tablet - prioritize performance
            
            // Determine if we should use reduced resolution based on device capability
            this.reducedResolution = this.deviceInfo.isLowEndDevice;
            
            // Start with container width
            const bodyWidth = document.body.clientWidth;
            canvasWidth = Math.min(containerWidth, bodyWidth * 0.95);
            canvasWidth = Math.max(canvasWidth, 280); // Minimum usable width
            canvasHeight = canvasWidth * this.ASPECT_RATIO;
            
            // Constrain height for mobile devices (especially important in landscape)
            const maxHeight = window.innerHeight * (this.deviceInfo.isLandscape ? 0.6 : 0.7);
            if (canvasHeight > maxHeight) {
                canvasHeight = maxHeight;
                canvasWidth = canvasHeight / this.ASPECT_RATIO;
            }
        }
        
        // Set display size via CSS (this is what you see on screen)
        this.canvas.style.width = `${canvasWidth}px`;
        this.canvas.style.height = `${canvasHeight}px`;
        
        // Set internal canvas buffer size (may differ from display size for performance)
        if (this.reducedResolution) {
            // Lower internal resolution for performance
            const reductionFactor = this.deviceInfo.isLowEndDevice ? 0.5 : 0.75;
            this.canvas.width = Math.floor(canvasWidth * reductionFactor);
            this.canvas.height = Math.floor(canvasHeight * reductionFactor);
            
            // Enable smoothing when downscaling
            this.ctx.imageSmoothingEnabled = true;
            this.ctx.imageSmoothingQuality = 'high';
            
            console.log(`Using reduced resolution: ${this.canvas.width}x${this.canvas.height}`);
        } else {
            // Match buffer size to display size for crisp rendering
            this.canvas.width = Math.floor(canvasWidth);
            this.canvas.height = Math.floor(canvasHeight);
            
            // Optimize image smoothing based on content and device
            if (this.deviceInfo.isHighDPI) {
                // For pixel art on high-DPI displays, disable smoothing for crisp pixels
                this.ctx.imageSmoothingEnabled = false;
            } else {
                // For everything else, use smoothing
                this.ctx.imageSmoothingEnabled = true;
                this.ctx.imageSmoothingQuality = 'high';
            }
        }
        
        // Calculate scaling factors relative to our base design dimensions
        this.widthScale = canvasWidth / this.BASE_WIDTH;
        this.heightScale = canvasHeight / this.BASE_HEIGHT;
        this.scaleFactor = this.widthScale; // Use width as the primary scaling factor
        
        // Log the new dimensions
        console.log(`Canvas resized: ${this.canvas.width}x${this.canvas.height} (Scale: ${this.scaleFactor.toFixed(2)})`);
        
        // Notify game that a resize occurred
        if (this.game && typeof this.game.onResize === 'function') {
            this.game.onResize(this.widthScale, this.heightScale);
        }
        
        return {
            widthScale: this.widthScale,
            heightScale: this.heightScale,
            scaleFactor: this.scaleFactor,
            reducedResolution: this.reducedResolution,
            displayWidth: canvasWidth,
            displayHeight: canvasHeight,
            bufferWidth: this.canvas.width,
            bufferHeight: this.canvas.height
        };
    }
    
    /**
     * Get appropriate sizes for UI elements based on device type and screen size
     * @returns {Object} Object containing responsive size values
     */
    getUISizes() {
        return {
            // Button sizes that work well on different devices
            buttonSize: this.deviceInfo.isMobile
                ? this.deviceInfo.isLandscape ? 45 : 55
                : this.deviceInfo.isTablet
                    ? 65
                    : 70,
            
            // Font sizes that work well at different screen sizes
            fontSize: this.deviceInfo.isMobile
                ? this.deviceInfo.isLandscape ? 16 : 20
                : this.deviceInfo.isTablet
                    ? 24
                    : 28,
            
            // Spacing that looks proportional at different sizes
            spacing: this.deviceInfo.isMobile
                ? this.deviceInfo.isLandscape ? 5 : 10
                : this.deviceInfo.isTablet
                    ? 15
                    : 20,
                    
            // Return device info for additional context
            deviceInfo: this.deviceInfo
        };
    }
    
    /**
     * Scale a position from base dimensions to current canvas dimensions
     * @param {number} x - X coordinate in base dimensions
     * @param {number} y - Y coordinate in base dimensions
     * @returns {Object} Scaled coordinates
     */
    scalePosition(x, y) {
        return {
            x: x * this.widthScale,
            y: y * this.heightScale
        };
    }
    
    /**
     * Scale a size from base dimensions to current canvas dimensions
     * @param {number} width - Width in base dimensions
     * @param {number} height - Height in base dimensions
     * @returns {Object} Scaled dimensions
     */
    scaleSize(width, height) {
        if (height === undefined) {
            // If only one dimension is provided, scale it uniformly
            return width * this.scaleFactor;
        }
        
        return {
            width: width * this.widthScale,
            height: height * this.heightScale
        };
    }
    
    /**
     * Convert touch/mouse event coordinates to canvas coordinates
     * @param {Event} event - The mouse or touch event
     * @returns {Object} Coordinates relative to the canvas
     */
    getCanvasCoordinates(event) {
        const rect = this.canvas.getBoundingClientRect();
        let x, y;
        
        // Handle both mouse and touch events
        if (event.touches && event.touches.length) {
            // Touch event
            x = event.touches[0].clientX - rect.left;
            y = event.touches[0].clientY - rect.top;
        } else {
            // Mouse event
            x = event.clientX - rect.left;
            y = event.clientY - rect.top;
        }
        
        // Convert to canvas internal coordinates if resolution is reduced
        if (this.reducedResolution) {
            x = (x / rect.width) * this.canvas.width;
            y = (y / rect.height) * this.canvas.height;
        }
        
        return { x, y };
    }
    
    /**
     * Checks if the canvas needs to be resized (e.g., due to window resize or orientation change)
     * @returns {boolean} True if the canvas needs to be resized
     */
    needsResize() {
        const container = this.canvas.parentElement;
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight || this.BASE_HEIGHT;
        
        // Check if orientation changed
        const isLandscape = window.innerWidth > window.innerHeight;
        const orientationChanged = isLandscape !== this.deviceInfo.isLandscape;
        
        // Check if size changed significantly
        const canvasDisplayWidth = parseFloat(this.canvas.style.width);
        const sizeDifference = Math.abs(canvasDisplayWidth - containerWidth) / containerWidth;
        const sizeChanged = sizeDifference > 0.05; // More than 5% difference
        
        return orientationChanged || sizeChanged;
    }
    
    /**
     * Cleanup resources and event listeners
     */
    cleanup() {
        window.removeEventListener('resize', this.resizeHandler);
        window.removeEventListener('orientationchange', this.resizeHandler);
    }
    
    /**
     * Debounce function to limit how often a function can be called
     * @param {Function} func - The function to debounce
     * @param {number} wait - Time to wait in milliseconds
     * @returns {Function} Debounced function
     */
    debounce(func, wait) {
        let timeout;
        return function(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    /**
     * Throttle function to ensure a function doesn't execute more than once in a given timeframe
     * @param {Function} func - The function to throttle
     * @param {number} limit - Minimum time between executions in milliseconds
     * @returns {Function} Throttled function
     */
    throttle(func, limit) {
        let lastFunc;
        let lastRan;
        return function(...args) {
            if (!lastRan) {
                func(...args);
                lastRan = Date.now();
            } else {
                clearTimeout(lastFunc);
                lastFunc = setTimeout(function() {
                    if ((Date.now() - lastRan) >= limit) {
                        func(...args);
                        lastRan = Date.now();
                    }
                }, limit - (Date.now() - lastRan));
            }
        };
    }
}
