/**
 * Particle system with object pooling for efficient memory usage and rendering.
 * Uses a pool of pre-allocated particle objects to minimize garbage collection.
 * Moved from root to managers/ directory for better organization.
 */
export default class ParticleSystem {
  /**
   * Create a new particle system
   * @param {Object} options - Configuration options
   * @param {HTMLCanvasElement} options.canvas - The canvas element
   * @param {number} options.poolSize - Initial size of particle pool (default: 200)
   * @param {number} options.maxParticles - Maximum active particles allowed (default: 500)
   */
  constructor(options) {
    this.canvas = options.canvas;
    this.ctx = this.canvas.getContext('2d');
    
    // Pool settings
    this.poolSize = options.poolSize || 200;
    this.maxParticles = options.maxParticles || 500;
    
    // Particle storage
    this.particlePool = [];
    this.activeParticles = [];
    
    // Pre-allocate particle objects
    this.initializePool();
  }
  
  /**
   * Initialize the particle pool
   */
  initializePool() {
    for (let i = 0; i < this.poolSize; i++) {
      this.particlePool.push(this.createParticle());
    }
  }
  
/**
 * Manages particle effects in the game
 * Uses object pooling and device-adaptive settings to optimize performance
 * Automatically adjusts particle count based on device capabilities
 */
  createParticle() {
    return {
      x: 0,
      y: 0,
      size: 0,
      color: '',
      vx: 0,
      vy: 0,
      alpha: 1,
      life: 0,
      active: false
    };
  }
  
  /**
   * Get a particle from the pool or create a new one if needed
   * @returns {Object} A particle object
   */
  getParticle() {
    // Check if we've hit the maximum active particles
    if (this.activeParticles.length >= this.maxParticles) {
      // If we've hit the limit, recycle the oldest particle
      const oldest = this.activeParticles.shift();
      // Reset it before returning
      this.resetParticle(oldest);
      return oldest;
    }
    
    // Get from pool if available
    if (this.particlePool.length > 0) {
      return this.particlePool.pop();
    }
    
    // Create new if pool is empty (should be rare)
    return this.createParticle();
  }
  
  /**
   * Return a particle to the pool
   * @param {Object} particle - The particle to recycle
   */
  recycleParticle(particle) {
    this.resetParticle(particle);
    this.particlePool.push(particle);
  }
  
  /**
   * Reset a particle to its initial state
   * @param {Object} particle - The particle to reset
   */
  resetParticle(particle) {
    particle.x = 0;
    particle.y = 0;
    particle.size = 0;
    particle.color = '';
    particle.vx = 0;
    particle.vy = 0;
    particle.alpha = 1;
    particle.life = 0;
    particle.active = false;
  }
  
  /**
   * Create a burst of particles at a specific location
   * @param {Object} options - Particle burst options
   * @param {number} options.x - X coordinate for burst center
   * @param {number} options.y - Y coordinate for burst center
   * @param {number} options.count - Number of particles to create (default: 20)
   * @param {string} options.color - Particle color or color function
   * @param {number} options.minSize - Minimum particle size (default: 2)
   * @param {number} options.maxSize - Maximum particle size (default: 5)
   * @param {number} options.minLife - Minimum particle lifetime (default: 20)
   * @param {number} options.maxLife - Maximum particle lifetime (default: 50)
   * @param {number} options.minVelocity - Minimum velocity (default: 2)
   * @param {number} options.maxVelocity - Maximum velocity (default: 5)
   * @param {number} options.gravity - Gravity effect (default: 0.2)
   */
  createBurst(options) {
    const count = options.count || 20;
    const minSize = options.minSize || 2;
    const maxSize = options.maxSize || 5;
    const minLife = options.minLife || 20;
    const maxLife = options.maxLife || 50;
    const minVelocity = options.minVelocity || 2;
    const maxVelocity = options.maxVelocity || 5;
    
    for (let i = 0; i < count; i++) {
      // Get particle from pool
      const particle = this.getParticle();
      
      // Set particle properties
      particle.x = options.x;
      particle.y = options.y;
      particle.size = Math.random() * (maxSize - minSize) + minSize;
      
      // Handle color (string or function)
      if (typeof options.color === 'function') {
        particle.color = options.color(i, count);
      } else {
        particle.color = options.color || `hsl(${Math.random() * 360}, 100%, 70%)`;
      }
      
      // Set velocity (radial burst)
      const angle = Math.random() * Math.PI * 2; // Random angle
      const velocity = Math.random() * (maxVelocity - minVelocity) + minVelocity;
      particle.vx = Math.cos(angle) * velocity;
      particle.vy = Math.sin(angle) * velocity;
      
      // Set other properties
      particle.alpha = 1;
      particle.life = Math.random() * (maxLife - minLife) + minLife;
      particle.maxLife = particle.life; // Store for alpha calculation
      particle.gravity = options.gravity !== undefined ? options.gravity : 0.2;
      particle.active = true;
      
      // Add to active particles
      this.activeParticles.push(particle);
    }
  }
  
  /**
   * Create a specific pattern of particles (e.g., celebration effect)
   * @param {Object} options - Same as createBurst, with additional pattern settings
   */
  createCelebration(options) {
    this.createBurst({
      ...options,
      // For celebration, override with these settings
      gravity: -0.05, // Particles rise up
      color: (i, total) => `hsl(${Math.random() * 60 + 180}, 100%, 70%)`,
      minVelocity: 1,
      maxVelocity: 3
    });
  }
  
  /**
   * Update particle positions and lifecycle with time-based physics
   * @param {number} deltaTime - Time in seconds since last update
   */
  update(deltaTime) {
    // Scale for consistent simulation regardless of frame rate (target: 60fps)
    const timeScale = deltaTime * 60;
    
    for (let i = this.activeParticles.length - 1; i >= 0; i--) {
      const p = this.activeParticles[i];
      
      // Update position with velocity
      p.x += p.vx * timeScale;
      p.y += p.vy * timeScale;
      
      // Apply gravity
      p.vy += p.gravity * timeScale;
      
      // Calculate alpha based on remaining life
      p.alpha = p.life / p.maxLife;
      
      // Reduce life with time scaling
      p.life -= timeScale;
      
      // Check if particle is dead
      if (p.life <= 0) {
        // Remove from active particles
        const deadParticle = this.activeParticles.splice(i, 1)[0];
        // Return to pool
        this.recycleParticle(deadParticle);
      }
    }
  }
  
  /**
   * Draw all active particles
   */
  draw() {
    // Skip drawing if no active particles
    if (this.activeParticles.length === 0) return;
    
    for (const p of this.activeParticles) {
      // Set transparency
      this.ctx.globalAlpha = p.alpha;
      this.ctx.fillStyle = p.color;
      
      // Draw particle (circle)
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fill();
    }
    
    // Reset global alpha
    this.ctx.globalAlpha = 1;
  }
  
  /**
   * Set the maximum number of particles based on device capability
   * @param {number} maxParticles - New maximum particles limit
   */
  setMaxParticles(maxParticles) {
    // Update the maximum
    this.maxParticles = maxParticles;
    
    // If we have more active particles than the new maximum,
    // we need to recycle the excess particles
    if (this.activeParticles.length > this.maxParticles) {
      const excessCount = this.activeParticles.length - this.maxParticles;
      console.log(`Recycling ${excessCount} excess particles to meet new limit of ${this.maxParticles}`);
      
      // Recycle the oldest particles (from the beginning of the array)
      for (let i = 0; i < excessCount; i++) {
        const oldestParticle = this.activeParticles.shift();
        this.recycleParticle(oldestParticle);
      }
    }
    
    // Adjust pool size to match the new maximum (with some buffer)
    const targetPoolSize = Math.min(this.maxParticles, 200);
    
    // If we have too few particles in the pool, create more
    if (this.particlePool.length < targetPoolSize) {
      const additionalCount = targetPoolSize - this.particlePool.length;
      for (let i = 0; i < additionalCount; i++) {
        this.particlePool.push(this.createParticle());
      }
    } 
    // If we have too many particles in the pool, remove some
    else if (this.particlePool.length > targetPoolSize * 1.5) {
      this.particlePool.length = targetPoolSize;
    }
    
    console.log(`ParticleSystem adjusted to maxParticles=${this.maxParticles}, poolSize=${this.particlePool.length}`);
    
    return this.maxParticles;
  }
  
  /**
   * Get current system stats
   * @returns {Object} Stats about particle count, pool usage, etc.
   */
  getStats() {
    return {
      activeParticles: this.activeParticles.length,
      poolSize: this.particlePool.length,
      totalAllocated: this.activeParticles.length + this.particlePool.length,
      maxParticles: this.maxParticles,
      utilizationPercent: Math.round((this.activeParticles.length / this.maxParticles) * 100)
    };
  }
  
  /**
   * Clear all active particles
   */
  clear() {
    // Recycle all active particles back to the pool
    while (this.activeParticles.length > 0) {
      this.recycleParticle(this.activeParticles.pop());
    }
  }
  
  /**
   * Clean up resources
   */
  dispose() {
    this.clear();
    this.activeParticles = [];
    this.particlePool = [];
  }
}
