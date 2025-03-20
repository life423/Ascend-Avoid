/**
 * Advanced sprite system for game entities
 */

// Animation frame timing (milliseconds)
const ANIMATION_SPEED = 200;

/**
 * Sprite Manager class to handle sprite creation, caching, and animation
 */
export class SpriteManager {
  constructor() {
    // Initialize sprite cache
    this.frameCache = {};
    this.spriteSheets = {};
    this.currentFrame = 0;
    this.lastFrameTime = 0;
    
    // Create all sprites on initialization
    this.initializeSprites();
  }
  
  /**
   * Initialize all game sprites
   */
  initializeSprites() {
    // Create player sprite frames
    this.createPlayerSprites();
    
    // Create obstacle sprite frames
    this.createObstacleSprites();
    
    // Create effect sprites
    this.createEffectSprites();
  }
  
  /**
   * Create player character sprites with multiple animation frames
   */
  createPlayerSprites() {
    // Create sprite sheet with 4 frames of animation
    const frames = [];
    
    // Frame 1: Basic character
    frames.push(this.createPlayerFrame(0));
    
    // Frame 2: Slight movement
    frames.push(this.createPlayerFrame(1));
    
    // Frame 3: Different position
    frames.push(this.createPlayerFrame(2));
    
    // Frame 4: Return to slight movement
    frames.push(this.createPlayerFrame(3));
    
    // Store in sprite sheets
    this.spriteSheets.player = frames;
  }
  
  /**
   * Create a single player animation frame
   * @param {number} frameIndex - The index of the animation frame
   * @returns {HTMLImageElement} The frame image
   */
  createPlayerFrame(frameIndex) {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    
    // Base shape - white rounded square
    ctx.fillStyle = 'white';
    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(0, 0, 32, 32, 8);
    } else {
      // Fallback for browsers without roundRect
      this.drawRoundedRect(ctx, 0, 0, 32, 32, 8);
    }
    ctx.fill();
    
    // Eye positions change slightly based on frame for "blinking" effect
    const eyePositionY = frameIndex === 2 ? 10 : 8;
    const eyeSize = frameIndex === 2 ? 3 : 4;
    
    // Add eyes
    ctx.fillStyle = '#6690cc';
    ctx.beginPath();
    ctx.arc(10, eyePositionY, eyeSize, 0, Math.PI * 2);
    ctx.arc(22, eyePositionY, eyeSize, 0, Math.PI * 2);
    ctx.fill();
    
    // Pupils
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(10, eyePositionY, eyeSize/2, 0, Math.PI * 2);
    ctx.arc(22, eyePositionY, eyeSize/2, 0, Math.PI * 2);
    ctx.fill();
    
    // Mouth changes based on frame
    ctx.fillStyle = '#333';
    
    if (frameIndex === 1 || frameIndex === 3) {
      // Slight smile
      ctx.beginPath();
      ctx.arc(16, 22, 8, 0.1, Math.PI - 0.1, false);
      ctx.stroke();
    } else if (frameIndex === 0) {
      // Neutral
      ctx.fillRect(10, 22, 12, 2);
    } else {
      // Open mouth
      ctx.beginPath();
      ctx.arc(16, 22, 5, 0, Math.PI, false);
      ctx.fill();
    }
    
    // Highlight effect that moves across frames
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    const highlightX = (frameIndex * 8) % 24;
    ctx.beginPath();
    ctx.arc(highlightX + 4, 4, 3, 0, Math.PI * 2);
    ctx.fill();
    
    // Convert to image
    const image = new Image();
    image.src = canvas.toDataURL('image/png');
    return image;
  }
  
  /**
   * Create obstacle sprites with multiple variants
   */
  createObstacleSprites() {
    // Create several obstacle variants
    const variants = [];
    
    // Create 3 different obstacle types
    for (let i = 0; i < 3; i++) {
      variants.push(this.createObstacleVariant(i));
    }
    
    this.spriteSheets.obstacle = variants;
  }
  
  /**
   * Create a single obstacle variant
   * @param {number} variantIndex - The variant index (0-2)
   * @returns {HTMLImageElement} The obstacle image
   */
  createObstacleVariant(variantIndex) {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    
    // Different color gradients for each variant
    let startColor, endColor, patternColor;
    
    switch (variantIndex) {
      case 0: // Cyan obstacle
        startColor = '#1FF2F2';
        endColor = '#0CC7C7';
        patternColor = '#0FF0F0';
        break;
      case 1: // Purple obstacle
        startColor = '#9D65FF';
        endColor = '#7A4FCC';
        patternColor = '#8A5AE0';
        break;
      case 2: // Orange obstacle
        startColor = '#FF9F45';
        endColor = '#E07D20';
        patternColor = '#FFB86C';
        break;
    }
    
    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, 64, 32);
    gradient.addColorStop(0, startColor);
    gradient.addColorStop(1, endColor);
    
    ctx.fillStyle = gradient;
    
    // Different shapes for each variant
    if (variantIndex === 0) {
      // Rectangle with rounded corners
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(0, 0, 64, 32, 6);
      } else {
        // Fallback for browsers without roundRect
        this.drawRoundedRect(ctx, 0, 0, 64, 32, 6);
      }
      ctx.fill();
    } else if (variantIndex === 1) {
      // Diamond-like shape
      ctx.beginPath();
      ctx.moveTo(32, 0);
      ctx.lineTo(64, 16);
      ctx.lineTo(32, 32);
      ctx.lineTo(0, 16);
      ctx.closePath();
      ctx.fill();
    } else {
      // Pill shape
      ctx.beginPath();
      ctx.arc(16, 16, 16, Math.PI/2, Math.PI*3/2);
      ctx.arc(48, 16, 16, Math.PI*3/2, Math.PI/2);
      ctx.closePath();
      ctx.fill();
    }
    
    // Add pattern details
    ctx.fillStyle = patternColor;
    
    // Different patterns for each variant
    if (variantIndex === 0) {
      // Horizontal lines
      for (let i = 0; i < 3; i++) {
        ctx.fillRect(8, 8 + (i * 8), 48, 3);
      }
    } else if (variantIndex === 1) {
      // Circle pattern
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.arc(32, 16, 12 - (i * 4), 0, Math.PI * 2);
        ctx.stroke();
      }
    } else {
      // Dots pattern
      for (let x = 0; x < 4; x++) {
        for (let y = 0; y < 2; y++) {
          ctx.beginPath();
          ctx.arc(10 + (x * 15), 10 + (y * 12), 3, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
    
    // Add border/glow effect
    ctx.strokeStyle = startColor;
    ctx.lineWidth = 2;
    
    if (variantIndex === 0) {
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(2, 2, 60, 28, 5);
      } else {
        // Fallback for browsers without roundRect
        this.drawRoundedRect(ctx, 2, 2, 60, 28, 5);
      }
      ctx.stroke();
    } else if (variantIndex === 1) {
      ctx.beginPath();
      ctx.moveTo(32, 2);
      ctx.lineTo(62, 16);
      ctx.lineTo(32, 30);
      ctx.lineTo(2, 16);
      ctx.closePath();
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.arc(16, 16, 14, Math.PI/2, Math.PI*3/2);
      ctx.arc(48, 16, 14, Math.PI*3/2, Math.PI/2);
      ctx.closePath();
      ctx.stroke();
    }
    
    // Convert to image
    const image = new Image();
    image.src = canvas.toDataURL('image/png');
    return image;
  }
  
  /**
   * Create effect sprites (explosions, particles, etc.)
   */
  createEffectSprites() {
    // Create sprite sheet with explosion effect frames
    const explosionFrames = [];
    
    // Create 5 frames of explosion animation
    for (let i = 0; i < 5; i++) {
      explosionFrames.push(this.createExplosionFrame(i));
    }
    
    this.spriteSheets.explosion = explosionFrames;
  }
  
  /**
   * Create a single explosion animation frame
   * @param {number} frameIndex - The index of the animation frame (0-4)
   * @returns {HTMLImageElement} The explosion frame image
   */
  createExplosionFrame(frameIndex) {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    
    // Size increases with frame index
    const size = 10 + (frameIndex * 10);
    
    // Color changes with frame
    const opacity = 1 - (frameIndex * 0.2);
    
    // Inner explosion
    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, size);
    gradient.addColorStop(0, `rgba(255, 255, 150, ${opacity})`);
    gradient.addColorStop(0.5, `rgba(255, 100, 50, ${opacity})`);
    gradient.addColorStop(1, `rgba(150, 50, 0, 0)`);
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(32, 32, size, 0, Math.PI * 2);
    ctx.fill();
    
    // Explosion particles
    const particles = 5 + (frameIndex * 3);
    const particleSize = 3 - (frameIndex * 0.4);
    
    ctx.fillStyle = `rgba(255, 220, 50, ${opacity})`;
    
    for (let i = 0; i < particles; i++) {
      const angle = (i / particles) * Math.PI * 2;
      const distance = size * 0.8;
      const x = 32 + Math.cos(angle) * distance;
      const y = 32 + Math.sin(angle) * distance;
      
      ctx.beginPath();
      ctx.arc(x, y, particleSize, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Convert to image
    const image = new Image();
    image.src = canvas.toDataURL('image/png');
    return image;
  }
  
  /**
   * Helper function to draw rounded rectangles for browsers without roundRect
   */
  drawRoundedRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.arcTo(x + width, y, x + width, y + radius, radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius);
    ctx.lineTo(x + radius, y + height);
    ctx.arcTo(x, y + height, x, y + height - radius, radius);
    ctx.lineTo(x, y + radius);
    ctx.arcTo(x, y, x + radius, y, radius);
    ctx.closePath();
  }
  
  /**
   * Get the current animation frame for a sprite
   * @param {string} type - The type of sprite ('player', 'obstacle', etc.)
   * @param {number} variantIndex - Optional variant index for obstacles
   * @param {number} timestamp - Current timestamp for animation
   * @returns {HTMLImageElement} The sprite frame to display
   */
  getAnimationFrame(type, variantIndex = 0, timestamp = 0) {
    // Update animation frame if enough time has passed
    if (timestamp - this.lastFrameTime > ANIMATION_SPEED) {
      this.currentFrame = (this.currentFrame + 1) % 4;
      this.lastFrameTime = timestamp;
    }
    
    // Return the appropriate sprite frame
    switch (type) {
      case 'player':
        return this.spriteSheets.player[this.currentFrame];
      case 'obstacle':
        // For obstacles, use the variant index to determine which obstacle type to show
        return this.spriteSheets.obstacle[variantIndex % this.spriteSheets.obstacle.length];
      case 'explosion':
        // For explosions, frame is directly provided as explosion progresses
        return this.spriteSheets.explosion[Math.min(variantIndex, 4)];
      default:
        console.error('Unknown sprite type:', type);
        return null;
    }
  }
}

// Create a singleton instance
const spriteManagerInstance = new SpriteManager();

/**
 * Get a sprite frame from the sprite manager
 * @param {string} type - The type of sprite ('player', 'obstacle', etc.)
 * @param {number} variantOrTime - Variant index for obstacles or frame index for effects
 * @param {number} timestamp - Current timestamp for animation
 * @returns {HTMLImageElement} The sprite frame to display
 */
export function getSprite(type, variantOrTime = 0, timestamp = 0) {
  return spriteManagerInstance.getAnimationFrame(type, variantOrTime, timestamp);
}
