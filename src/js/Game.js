import Player from './Player.js'
import Obstacle from './Obstacle.js'
import Background from './Background.js'
import TouchControls from './TouchControls.js'
import { GAME_SETTINGS, DESKTOP_SETTINGS, KEYS } from './constants.js'
import { randomIntFromInterval, playSound, resizeCanvas, SCALE_FACTOR, BASE_CANVAS_WIDTH, BASE_CANVAS_HEIGHT } from './utils.js'

// Enable debug mode with query parameter - e.g. ?debug=true
window.DEBUG = new URLSearchParams(window.location.search).get('debug') === 'true';
window.DEBUG_COLLISIONS = window.DEBUG;

export default class Game {
    constructor() {
        // Get DOM elements
        this.canvas = document.getElementById('canvas')
        this.ctx = this.canvas.getContext('2d')
        this.scoreElement = document.getElementById('score')
        this.highScoreElement = document.getElementById('highScore')

        // Game state
        this.score = 0
        this.highScore = 0
        this.gameRunning = true
        this.lastFrameTime = 0
        this.obstacles = []
        this.particles = []
        
        // Check if we're on desktop and apply desktop-specific settings
        this.isDesktop = window.matchMedia("(min-width: 1200px)").matches;
        
        // Override settings for desktop if needed
        if (this.isDesktop) {
            console.log('Applying desktop-specific game settings');
            Object.assign(GAME_SETTINGS, DESKTOP_SETTINGS);
        }

        // Initialize game
        this.init()
    }

    init() {
        console.log('Initializing game...')

        // Set up responsive canvas
        const { widthScale, heightScale } = resizeCanvas(this.canvas)
        console.log(`Canvas scaled to: ${this.canvas.width}x${this.canvas.height} (scale factor: ${SCALE_FACTOR})`)
        
        // Create background
        this.background = new Background(this.canvas)
        
        // Create player
        this.player = new Player(this.canvas)

        // Initialize obstacles
        this.initObstacles()

        // Initialize touch controls (will display on mobile and touch devices)
        this.touchControls = new TouchControls(this);
        
        // Show touch controls on mobile devices or touch screens
        // Use more comprehensive detection for touch devices
        if (
            window.matchMedia("(max-width: 1024px)").matches || 
            window.matchMedia("(pointer: coarse)").matches ||
            ('ontouchstart' in window) || 
            (navigator.maxTouchPoints > 0)
        ) {
            console.log("Touch device detected, optimizing controls");
            // Force touch controls to be shown
            if (this.touchControls) {
                this.touchControls.show();
            }
        }
        
        // If on desktop, set up sidebar container for better layout
        this.setupDesktopLayout();

        // Set up event listeners
        this.setupEventListeners()

        // Start game loop
        requestAnimationFrame(this.animate.bind(this))
        
        console.log('Game initialized successfully')
    }
    
    setupDesktopLayout() {
        // Only apply this on larger screens
        if (window.matchMedia("(min-width: 1200px)").matches) {
            console.log('Setting up desktop-optimized layout with CSS Grid');
            
            // Instead of manipulating DOM, just add classes that our CSS will target
            document.body.classList.add('desktop-layout');
            
            // Directly set canvas size to ensure it's large
            if (this.canvas) {
                // Force canvas to be properly sized
                this.canvas.style.width = '100%';
                this.canvas.style.minHeight = '550px';
                
                // Debug output
                console.log(`INITIAL Canvas size: ${this.canvas.width}x${this.canvas.height}`);
                
                // Force a resize to ensure game elements scale properly
                const { widthScale, heightScale } = resizeCanvas(this.canvas);
                console.log(`AFTER RESIZE: Canvas size: ${this.canvas.width}x${this.canvas.height}`);
                
                // Update game elements with new scale
                this.player.resetPosition();
                for (const obstacle of this.obstacles) {
                    obstacle.calculateHeight();
                }
            }
            
            // Add desktop visual enhancements
            this.addDesktopVisualEnhancements();
            
            // Add special resize handler for desktop
            window.addEventListener('resize', this.handleDesktopResize.bind(this));
            
            // Force an initial resize
            setTimeout(() => {
                // This timeout ensures the CSS has been applied before we resize
                if (this.canvas) {
                    const { widthScale, heightScale } = resizeCanvas(this.canvas);
                    console.log(`DELAYED RESIZE: Canvas size: ${this.canvas.width}x${this.canvas.height}`);
                }
            }, 100);
        }
    }
    
    /**
     * Special resize handler for desktop to ensure canvas stays large
     */
    handleDesktopResize() {
        if (!window.matchMedia("(min-width: 1200px)").matches) return;
        
        console.log('Desktop resize event');
        
        if (this.canvas) {
            // Force canvas to maintain large size
            this.canvas.style.width = '100%';
            this.canvas.style.minHeight = '550px';
            
            // Perform resize with updated dimensions
            const { widthScale, heightScale } = resizeCanvas(this.canvas);
            
            // Update game elements
            this.player.resetPosition();
            for (const obstacle of this.obstacles) {
                obstacle.calculateHeight();
            }
            
            console.log(`After resize: ${this.canvas.width}x${this.canvas.height}`);
        }
    }
    
    addDesktopVisualEnhancements() {
        // Add keyboard controls visual indicator for desktop
        const keyboardHelperElement = document.createElement('div');
        keyboardHelperElement.id = 'keyboard-helper';
        keyboardHelperElement.className = 'keyboard-helper';
        keyboardHelperElement.innerHTML = `
            <div class="key-container">
                <div class="key-row">
                    <div class="key wasd">W</div>
                </div>
                <div class="key-row">
                    <div class="key wasd">A</div>
                    <div class="key wasd">S</div>
                    <div class="key wasd">D</div>
                </div>
                <div class="key-label">WASD to move</div>
            </div>
            <div class="key-container">
                <div class="key-row">
                    <div class="key arrows">↑</div>
                </div>
                <div class="key-row">
                    <div class="key arrows">←</div>
                    <div class="key arrows">↓</div>
                    <div class="key arrows">→</div>
                </div>
                <div class="key-label">Arrows to move</div>
            </div>
            <div class="key-container">
                <div class="key restart">R</div>
                <div class="key-label">Restart</div>
            </div>
        `;
        
        // Add the keyboard helper to the game container
        const gameUIContainer = document.getElementById('game-ui-container');
        if (gameUIContainer) {
            gameUIContainer.appendChild(keyboardHelperElement);
            
            // Add styles for the keyboard helper
            const style = document.createElement('style');
            style.textContent = `
                .keyboard-helper {
                    display: flex;
                    justify-content: center;
                    gap: 30px;
                    margin: 20px auto;
                    max-width: 800px;
                }
                
                .key-container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    margin: 0 10px;
                }
                
                .key-row {
                    display: flex;
                    gap: 5px;
                    margin: 5px 0;
                }
                
                .key {
                    width: 40px;
                    height: 40px;
                    background: rgba(0, 0, 0, 0.4);
                    border: 2px solid var(--primary-color);
                    border-radius: 6px;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    font-size: 18px;
                    color: white;
                    box-shadow: 0 0 10px var(--primary-glow);
                }
                
                .key.arrows {
                    font-size: 22px;
                }
                
                .key.restart {
                    background: rgba(255, 60, 60, 0.2);
                    border-color: rgba(255, 60, 60, 0.8);
                }
                
                .key-label {
                    margin-top: 8px;
                    font-size: 14px;
                    color: var(--highlight-color);
                }
                
                /* Hide on mobile/touch devices */
                @media (max-width: 1199px), (pointer: coarse) {
                    .keyboard-helper {
                        display: none;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }

    initObstacles() {
        // Create initial obstacle with scaled dimensions
        this.obstacles = [
            new Obstacle(
                100, // base X position
                randomIntFromInterval(20, BASE_CANVAS_HEIGHT - 100), // base Y position
                randomIntFromInterval(40, 100), // base width
                this.canvas
            ),
        ]
    }

    setupEventListeners() {
        // Keyboard events
        document.addEventListener('keydown', this.handleKeyDown.bind(this))
        document.addEventListener('keyup', this.handleKeyUp.bind(this))

        // Touch events for mobile
        this.canvas.addEventListener(
            'touchstart',
            this.handleTouchStart.bind(this)
        )
        this.canvas.addEventListener('touchend', this.handleTouchEnd.bind(this))

        // Window resize with debouncing
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                console.log('Window resized, updating game elements');
                // Resize canvas and get the new scale factors
                const { widthScale, heightScale } = resizeCanvas(this.canvas);
                
                // Update game elements with new scale
                this.player.resetPosition();
                this.background.resize();
                
                // Resize obstacles
                for (const obstacle of this.obstacles) {
                    obstacle.calculateHeight();
                }
                
                // Update touch controls if they exist
                if (this.touchControls) {
                    this.touchControls.resize();
                }
            }, 250); // debounce resize events
        });
    }

    // Keyboard event handlers
    handleKeyDown(e) {
        // Log the key press for debugging
        console.log('Key down:', e.key, e.keyCode)
        
        // Right movement - Arrow Right or D
        if (KEYS.RIGHT.includes(e.key) || e.keyCode === 39) {
            this.player.setMovementKey('right', true)
        }
        
        // Left movement - Arrow Left or A
        if (KEYS.LEFT.includes(e.key) || e.keyCode === 37) {
            this.player.setMovementKey('left', true)
        }
        
        // Up movement - Arrow Up or W
        if (KEYS.UP.includes(e.key) || e.keyCode === 38) {
            this.player.setMovementKey('up', true)
        }
        
        // Down movement - Arrow Down or S
        if (KEYS.DOWN.includes(e.key) || e.keyCode === 40) {
            this.player.setMovementKey('down', true)
        }
        
        // Add restart functionality with 'R' key
        if (KEYS.RESTART.includes(e.key)) {
            this.resetGame()
        }
    }

    handleKeyUp(e) {
        // Log the key release for debugging
        console.log('Key up:', e.key, e.keyCode)
        
        // Right movement - Arrow Right or D
        if (KEYS.RIGHT.includes(e.key) || e.keyCode === 39) {
            this.player.setMovementKey('right', false)
        }
        
        // Left movement - Arrow Left or A
        if (KEYS.LEFT.includes(e.key) || e.keyCode === 37) {
            this.player.setMovementKey('left', false)
        }
        
        // Up movement - Arrow Up or W
        if (KEYS.UP.includes(e.key) || e.keyCode === 38) {
            this.player.setMovementKey('up', false)
        }
        
        // Down movement - Arrow Down or S
        if (KEYS.DOWN.includes(e.key) || e.keyCode === 40) {
            this.player.setMovementKey('down', false)
        }
    }

    // Legacy swipe controls for backward compatibility
    handleTouchStart(e) {
        // Let the TouchControls class handle this
        // Only use these if we need fallback behavior
        if (!this.touchControls || !this.touchControls.isTouchDevice) {
            e.preventDefault()
            const touch = e.touches[0]
            this.touchStartX = touch.clientX
            this.touchStartY = touch.clientY
        }
    }

    handleTouchEnd(e) {
        // Let the TouchControls class handle this
        // Only use these if we need fallback behavior
        if (!this.touchControls || !this.touchControls.isTouchDevice) {
            e.preventDefault()
            const touch = e.changedTouches[0]
            const touchEndX = touch.clientX
            const touchEndY = touch.clientY

            const deltaX = touchEndX - this.touchStartX
            const deltaY = touchEndY - this.touchStartY

            // Determine swipe direction based on the larger delta
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                // Horizontal swipe
                if (deltaX > 20) {
                    this.player.setMovementKey('right', true)
                    setTimeout(() => {
                        this.player.setMovementKey('right', false)
                    }, 100)
                } else if (deltaX < -20) {
                    this.player.setMovementKey('left', true)
                    setTimeout(() => {
                        this.player.setMovementKey('left', false)
                    }, 100)
                }
            } else {
                // Vertical swipe
                if (deltaY > 20) {
                    this.player.setMovementKey('down', true)
                    setTimeout(() => {
                        this.player.setMovementKey('down', false)
                    }, 100)
                } else if (deltaY < -20) {
                    this.player.setMovementKey('up', true)
                    setTimeout(() => {
                        this.player.setMovementKey('up', false)
                    }, 100)
                }
            }
        }
    }

    // Game logic
    resetGame() {
        this.score = 0
        this.scoreElement.innerHTML = this.score
        this.obstacles.length = 1
        this.player.resetPosition()
        this.particles = []
    }

    // Add visual celebration particles when scoring
    addScoreParticles() {
        // Number of particles based on score (more particles for higher scores)
        const particleCount = Math.min(10 + (this.score * 2), 50)
        
        for (let i = 0; i < particleCount; i++) {
            this.particles.push({
                x: this.player.x + this.player.width / 2,
                y: GAME_SETTINGS.WINNING_LINE,
                size: Math.random() * 5 + 2,
                color: `hsl(${Math.random() * 60 + 180}, 100%, 70%)`,
                vx: Math.random() * 6 - 3,
                vy: Math.random() * -5 - 2,
                alpha: 1,
                life: Math.random() * 30 + 20
            })
        }
    }
    
    // Update and draw particles
    updateParticles() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i]
            
            // Update position
            p.x += p.vx
            p.y += p.vy
            
            // Apply gravity
            p.vy += 0.2
            
            // Fade out
            p.alpha = p.life / 50
            
            // Reduce life
            p.life--
            
            // Remove dead particles
            if (p.life <= 0) {
                this.particles.splice(i, 1)
                continue
            }
            
            // Draw particle
            this.ctx.globalAlpha = p.alpha
            this.ctx.fillStyle = p.color
            this.ctx.beginPath()
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
            this.ctx.fill()
        }
        
        // Reset global alpha
        this.ctx.globalAlpha = 1
    }

    checkForWinner() {
        // Calculate scaled winning line position
        const scaledWinningLine = GAME_SETTINGS.WINNING_LINE * (this.canvas.height / BASE_CANVAS_HEIGHT);
        
        if (this.player.y < scaledWinningLine) {
            this.score++
            this.addObstacle()
            this.addScoreParticles()

            this.scoreElement.innerHTML = this.score
            playSound('score')

            // Reset player to bottom of screen
            this.player.resetPosition()
        }
    }

    addObstacle() {
        // Calculate sizes based on canvas dimensions
        const minWidth = Math.max(
            this.canvas.width * GAME_SETTINGS.OBSTACLE_MIN_WIDTH_RATIO,
            30
        )
        const maxWidth = Math.max(
            this.canvas.width * GAME_SETTINGS.OBSTACLE_MAX_WIDTH_RATIO,
            80
        )

        // Starting position offscreen to the left
        const startX = -100

        // Height boundaries adjusted for canvas size
        const minY = 20
        const maxY = this.canvas.height - 50

        // Helper function to create a new obstacle with no overlaps
        const createNonOverlappingObstacle = () => {
            // Create the new obstacle with random initial position
            const newObstacle = new Obstacle(
                startX,
                randomIntFromInterval(minY, maxY),
                randomIntFromInterval(minWidth, maxWidth),
                this.canvas
            );
            
            // Make sure it doesn't overlap with existing obstacles
            newObstacle.resetObstacle(this.obstacles);
            
            return newObstacle;
        };

        // Add initial obstacles for new game
        if (this.score <= 2) {
            this.obstacles.push(createNonOverlappingObstacle());
        }

        // Add obstacles as score increases (difficulty progression)
        if (this.score % 4 === 0) {
            this.obstacles.push(createNonOverlappingObstacle());
        }

        // Limit maximum number of obstacles
        if (this.obstacles.length > GAME_SETTINGS.MAX_CARS) {
            this.obstacles.length = GAME_SETTINGS.MAX_CARS
        }
    }

    detectCollisions() {
        for (const obstacle of this.obstacles) {
            if (obstacle.detectCollision(this.player)) {
                playSound('collision')
                this.resetGame()
                break
            }
        }
    }

    updateHighScore() {
        if (this.score > this.highScore) {
            this.highScore = this.score
            this.highScoreElement.innerHTML = this.highScore
        }
    }

    // Game animation loop
    animate(timestamp) {
        // Request next frame first
        requestAnimationFrame(this.animate.bind(this))

        // Skip frames if needed for performance on slower devices
        if (timestamp - this.lastFrameTime < 16) {
            // Aim for 60fps max
            return
        }

        // Update the last frame time
        this.lastFrameTime = timestamp

        try {
            // Draw background (replaces clearRect)
            this.background.update(timestamp)
    
            // Update and draw player
            this.player.move()
            this.player.draw(timestamp)
    
            // Update and draw obstacles
            for (const obstacle of this.obstacles) {
                obstacle.update(timestamp, this.score)
                
                // If obstacle is moving off-screen, pass all obstacles when resetting
                if (obstacle.x >= this.canvas.width) {
                    obstacle.resetObstacle(this.obstacles);
                }
            }
    
            // Update and draw particles
            this.updateParticles()
            
            // Draw on-screen touch controls (mobile only)
            if (this.touchControls) {
                this.touchControls.draw()
            }
            
            // Draw debug info when in debug mode
            if (window.DEBUG) {
                this.drawDebugInfo(timestamp)
            }
        } catch (e) {
            console.error('Error in animate loop:', e)
        }

        // Game logic
        this.detectCollisions()
        this.updateHighScore()
        this.checkForWinner()

        // Draw game boundaries if needed for clarity
        if (this.score > 5 || this.isDesktop) {
            // Show winning line for visibility at higher difficulty
            const scaledWinningLine = GAME_SETTINGS.WINNING_LINE * (this.canvas.height / BASE_CANVAS_HEIGHT);
            
            // Enhanced visual feedback for desktop
            if (this.isDesktop) {
                // Draw animated winning line with glow effect
                this.ctx.beginPath();
                this.ctx.moveTo(0, scaledWinningLine);
                this.ctx.lineTo(this.canvas.width, scaledWinningLine);
                const glowIntensity = 0.3 + 0.2 * Math.sin(timestamp / 500); // Pulsing effect
                this.ctx.strokeStyle = `rgba(0, 255, 255, ${glowIntensity})`;
                this.ctx.lineWidth = 2;
                this.ctx.stroke();
                
                // Draw subtle grid pattern on desktop
                if (window.DEBUG || this.score > 5) {
                    this.drawGridPattern();
                }
            } else {
                // Standard line for mobile
                this.ctx.beginPath()
                this.ctx.moveTo(0, scaledWinningLine)
                this.ctx.lineTo(this.canvas.width, scaledWinningLine)
                this.ctx.strokeStyle = 'rgba(255,255,255,0.3)'
                this.ctx.stroke()
            }
        }
    }
    
    /**
     * Draw a subtle grid pattern for desktop view to enhance visual depth
     */
    drawGridPattern() {
        // Draw a subtle grid pattern visible only on desktop
        this.ctx.beginPath();
        this.ctx.strokeStyle = "rgba(0, 255, 255, 0.05)";
        this.ctx.lineWidth = 0.5;
        
        const gridSize = 30;
        
        // Vertical lines
        for (let x = 0; x < this.canvas.width; x += gridSize) {
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
        }
        
        // Horizontal lines
        for (let y = 0; y < this.canvas.height; y += gridSize) {
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
        }
        
        this.ctx.stroke();
    }
    
    /**
     * Draw debug information when debug mode is enabled
     */
    drawDebugInfo(timestamp) {
        // Set debug text styles
        this.ctx.font = '12px monospace';
        this.ctx.fillStyle = 'yellow';
        this.ctx.textAlign = 'left';
        this.ctx.textBaseline = 'top';
        
        // Display fps
        const fps = Math.round(1000 / Math.max(1, timestamp - this.lastFrameTime));
        this.ctx.fillText(`FPS: ${fps}`, 10, 10);
        
        // Display player position
        this.ctx.fillText(`Player: (${Math.round(this.player.x)}, ${Math.round(this.player.y)})`, 10, 25);
        
        // Display obstacle count
        this.ctx.fillText(`Obstacles: ${this.obstacles.length}`, 10, 40);
        
        // Display particle count
        this.ctx.fillText(`Particles: ${this.particles.length}`, 10, 55);
        
        // Draw player hitbox
        this.ctx.strokeStyle = 'yellow';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(
            this.player.x, this.player.y, 
            this.player.width, this.player.height
        );
    }
}
