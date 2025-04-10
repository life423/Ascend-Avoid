/**
 * Background effects for the game (stars, particles, etc.)
 * Moved from root to objects/ directory for better organization.
 */
export default class Background {
    /**
     * Creates a new Background instance
     * @param {HTMLCanvasElement} canvas - The game canvas
     */
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        
        // Stars for background
        this.stars = [];
        this.initStars();
    }
    
    /**
     * Initialize star field
     */
    initStars() {
        // Create stars based on canvas size
        const starCount = Math.floor(this.canvas.width * this.canvas.height / 2000);
        
        for (let i = 0; i < starCount; i++) {
            this.stars.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * 2 + 0.5,
                brightness: Math.random() * 0.5 + 0.5,
                color: this.getStarColor(),
                speed: Math.random() * 0.3 + 0.1
            });
        }
    }
    
    /**
     * Get a random star color
     * @returns {string} A random star color
     */
    getStarColor() {
        const colors = [
            'rgba(255, 255, 255, 0.8)',  // White
            'rgba(173, 216, 230, 0.8)',  // Light blue
            'rgba(255, 223, 186, 0.8)',  // Light orange
            'rgba(186, 218, 255, 0.8)'   // Light blue-white
        ];
        
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    /**
     * Update and draw background
     * @param {number} timestamp - Current animation timestamp
     */
    update(timestamp) {
        // Draw dark background gradient
        const gradient = this.ctx.createLinearGradient(
            0, 0, 
            0, this.canvas.height
        );
        
        gradient.addColorStop(0, '#000000');
        gradient.addColorStop(1, '#0a192f');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw and update stars
        this.updateStars(timestamp);
    }
    
    /**
     * Update and draw star field
     * @param {number} timestamp - Current animation timestamp
     */
    updateStars(timestamp) {
        // Twinkle effect timing
        const twinkleFactor = Math.sin(timestamp / 1000) * 0.2 + 0.8;
        
        for (const star of this.stars) {
            // Move star down slightly (parallax scrolling effect)
            star.y += star.speed;
            
            // Reset position if out of view
            if (star.y > this.canvas.height) {
                star.y = 0;
                star.x = Math.random() * this.canvas.width;
            }
            
            // Draw star with twinkle effect
            const brightness = star.brightness * twinkleFactor;
            this.ctx.fillStyle = star.color;
            this.ctx.globalAlpha = brightness;
            
            // Draw with slight blur for glow effect
            this.ctx.shadowBlur = star.size * 2;
            this.ctx.shadowColor = star.color;
            
            this.ctx.beginPath();
            this.ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        // Reset shadow and alpha
        this.ctx.shadowBlur = 0;
        this.ctx.globalAlpha = 1;
    }
    
    /**
     * Resize handler - recreate stars when canvas size changes
     */
    resize() {
        this.stars = [];
        this.initStars();
    }
}
