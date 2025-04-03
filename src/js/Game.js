/**
 * Main game controller class that orchestrates all game systems.
 * Refactored to support responsive design across all devices and screen sizes.
 */
import Player from './Player.js'
import Background from './Background.js'
import TouchControls from './TouchControls.js'

// Fallback constants in case imports fail
const BASE_CANVAS_WIDTH = 560
const BASE_CANVAS_HEIGHT = 550

// No imports from utils module needed

// Import our manager classes
import GameConfig from './GameConfig.js'
import InputManager from './InputManager.js'
import ObstacleManager from './ObstacleManager.js'
import UIManager from './UIManager.js'
import AssetManager from './AssetManager.js'
import ParticleSystem from './ParticleSystem.js'

export default class Game {
    /**
     * Creates a new Game instance
     */
    constructor() {
        // Get DOM elements
        this.canvas = document.getElementById('canvas')
        this.ctx = this.canvas.getContext('2d')
        this.scoreElement = document.getElementById('score')
        this.highScoreElement = document.getElementById('highScore')

        // Game state
        this.score = 0
        this.highScore = 0
        this.lastFrameTime = 0
        this.particleSystem = null

        // Device detection now handled by ResponsiveManager
        // Default to desktop for initial rendering before ResponsiveManager initializes
        this.isDesktop = window.matchMedia('(min-width: 1200px)').matches

        // Create configuration with platform detection
        this.config = new GameConfig({ isDesktop: this.isDesktop })

        // Set initial game state
        this.gameState = this.config.STATE.READY

        // Initialize managers
        this.inputManager = null
        this.obstacleManager = null
        this.uiManager = null
        this.assetManager = null

        // Multiplayer state
        this.isMultiplayerMode = false
        this.remotePlayers = {}

        // Game scaling information
        this.scalingInfo = { widthScale: 1, heightScale: 1 }

        // Initialize game
        this.init()
    }

    /**
     * Initialize the game and all its components
     */
    async init() {
        console.log('Initializing game...')

        // Create UI manager
        this.uiManager = new UIManager({
            scoreElement: this.scoreElement,
            highScoreElement: this.highScoreElement,
            config: this.config,
        })

        // Show loading screen while we set up
        this.uiManager.showLoading('Loading game assets...')

        // Initialize asset manager and preload assets
        this.assetManager = new AssetManager()
        await this.preloadAssets()

        // Canvas initial setup - actual scaling will be handled by ResponsiveManager
        // Just initialize with default values for now
        this.scalingInfo = {
            widthScale: 1,
            heightScale: 1,
            pixelRatio: window.devicePixelRatio || 1,
            reducedResolution: false,
        }

        // Create background
        this.background = new Background(this.canvas)

        // Create player
        this.player = new Player(this.canvas)

        // Initialize particle system
        this.particleSystem = new ParticleSystem({
            canvas: this.canvas,
            poolSize: 200,
            maxParticles: 500,
        })

        // Initialize obstacle manager
        this.obstacleManager = new ObstacleManager({
            canvas: this.canvas,
            config: this.config,
        })
        this.obstacleManager.initialize()

        // Initialize input manager
        this.inputManager = new InputManager({
            keyMappings: this.config.getKeys(),
        })

        // Listen for restart events from input manager
        document.addEventListener(
            'game:restart',
            this.handleRestartEvent.bind(this)
        )

        // Set up touch controls if needed
        this.setupTouchControls()

        // Hide loading screen
        this.uiManager.hideLoading()

        // Set game state to playing
        this.gameState = this.config.STATE.PLAYING

        // Start game loop
        requestAnimationFrame(this.gameLoop.bind(this))

        console.log('Game initialized successfully')
    }

    /**
     * Callback for when ResponsiveManager updates the canvas size
     * Called by ResponsiveManager when screen size or orientation changes
     * @param {number} widthScale - Scale factor for width
     * @param {number} heightScale - Scale factor for height
     */
    onResize(widthScale, heightScale) {
        // Store new scaling information for game calculations
        this.scalingInfo = {
            widthScale: widthScale,
            heightScale: heightScale,
            pixelRatio: window.devicePixelRatio || 1,
            reducedResolution: false
        };

        // Update device detection
        this.isDesktop = window.innerWidth >= 1200;

        // Update game config with new device info
        this.config.setDesktopMode(this.isDesktop);

        // Update game elements with new dimensions
        if (this.player) {
            this.player.resetPosition();
        }

        if (this.background) {
            this.background.resize();
        }

        if (this.obstacleManager) {
            // Update obstacles
            const obstacles = this.obstacleManager.getObstacles();
            for (const obstacle of obstacles) {
                obstacle.calculateHeight();
            }
        }

        console.log(
            `Game resized: isDesktop=${this.isDesktop}, scale=${widthScale.toFixed(2)}`
        );
    }

    /**
     * Set up mobile touch controls
     * Touch control visibility is now handled by ResponsiveManager
     */
    setupTouchControls() {
        // Create touch controls overlay
        this.touchControls = new TouchControls(this)
        this.touchControls.show()

        // Register touch buttons with input manager
        if (this.touchControls.buttonElements) {
            for (const [direction, button] of Object.entries(
                this.touchControls.buttonElements
            )) {
                this.inputManager.registerTouchButton(button, direction)
            }
        }

        // Set up canvas touch events
        this.inputManager.setupTouchControls(this.canvas)
    }

    /**
     * Preload all game assets
     */
    async preloadAssets() {
    // Define game assets to preload with correct paths
    const imageAssets = [
      { key: 'player', src: 'src/assets/images/player.png' },
      { key: 'obstacle', src: 'src/assets/images/obstacle.png' },
    ]

        // Preload assets (will expand with more assets as needed)
        try {
            const result = await this.assetManager.loadAssets(imageAssets, [])
            if (!result.success) {
                console.error('Failed to load some game assets')
            }
        } catch (error) {
            console.error('Error loading assets:', error)
        }

        return true
    }

    /**
     * Handle restart event from input manager
     */
    handleRestartEvent() {
        // Only handle restart events in GAME_OVER state
        if (this.gameState === this.config.STATE.GAME_OVER) {
            this.completeReset()
        } else if (this.gameState === this.config.STATE.PLAYING) {
            // In playing state, just reset the current game
            this.resetGame()
        }
    }

    /**
     * Main game loop
     * @param {number} timestamp - Current animation timestamp
     */
    gameLoop(timestamp) {
        // Request next frame first to ensure smooth animation
        requestAnimationFrame(this.gameLoop.bind(this))

        // Calculate delta time (in seconds) with capping to prevent physics issues
        // when tab becomes active again after being inactive
        let deltaTime = 0
        if (this.lastFrameTime !== 0) {
            deltaTime = (timestamp - this.lastFrameTime) / 1000

            // Cap deltaTime to prevent large jumps
            // This prevents objects from "teleporting" if the game is inactive
            deltaTime = Math.min(deltaTime, 0.1)
        }

        this.lastFrameTime = timestamp

        // Skip updates if game is paused or in game over state
        if (this.gameState !== this.config.STATE.PLAYING) {
            // Just render the current state without updating
            this.render(timestamp)
            return
        }

        try {
            // 1. Update phase
            this.update(deltaTime, timestamp)

            // 2. Render phase
            this.render(timestamp)

            // 3. Post-update phase (check win/lose conditions)
            this.postUpdate()
        } catch (error) {
            console.error('Error in game loop:', error)
        }
    }

    /**
     * Update game state
     * @param {number} deltaTime - Time since last frame in seconds
     * @param {number} timestamp - Current animation timestamp
     */
    update(deltaTime, timestamp) {
        // Get current input state
        const inputState = this.inputManager.getInputState()

        // Handle updates differently based on multiplayer mode
        if (this.isMultiplayerMode) {
            // In multiplayer mode, send input to server
            this.updateMultiplayerMode(inputState, deltaTime, timestamp)
        } else {
            // In single player mode, update locally
            this.updateSinglePlayerMode(inputState, deltaTime, timestamp)
        }

        // Update particles
        this.updateParticles(deltaTime)
    }

    /**
     * Update game in singleplayer mode
     */
    updateSinglePlayerMode(inputState, deltaTime, timestamp) {
        // Update player movement based on input
        this.updatePlayerMovement(inputState)

        // Update player
        this.player.move()

        // Update obstacles - use current scaling info for speed adjustments
        this.obstacleManager.update(timestamp, this.score, this.scalingInfo)

        // Check for collisions
        const collision = this.obstacleManager.checkCollisions(this.player)
        if (collision) {
            this.handleCollision(collision)
        }
    }

    /**
     * Update player movement based on input state
     * @param {Object} inputState - Current input state
     */
    updatePlayerMovement(inputState) {
        // Apply input to player movement
        this.player.setMovementKey('up', inputState.up)
        this.player.setMovementKey('down', inputState.down)
        this.player.setMovementKey('left', inputState.left)
        this.player.setMovementKey('right', inputState.right)

        // Special case for up movement - make it more responsive
        // and scale with screen size
        if (inputState.up && this.player.y > 30) {
            // Apply an immediate boost when pressing up, scaled by screen size
            const boostAmount = 30 * this.scalingInfo.heightScale
            this.player.y -= boostAmount * 0.1
        }
    }
    /**
     * Handle collision with obstacle
     * @param {Obstacle} obstacle - The obstacle that was hit
     */
    handleCollision(obstacle) {
        // Play collision sound
        if (this.assetManager) {
            this.assetManager.playSound('collision', 0.3)
        } else {
            // Fallback to legacy sound method
            const playSound = window.playSound || (() => {})
            playSound('collision')
        }

        // Flash screen red
        this.uiManager.flashScreen('#ff0000', 200)

        // Set game state to game over
        this.gameState = this.config.STATE.GAME_OVER

        // Show game over screen
        this.uiManager.showGameOver(
            this.score,
            this.highScore,
            this.completeReset.bind(this)
        )
    }

    /**
     * Render the game
     * @param {number} timestamp - Current animation timestamp
     */
    render(timestamp) {
        // Draw background (replaces clearRect)
        this.background.update(timestamp)

        // Get obstacles
        const obstacles = this.obstacleManager.getObstacles()

        // Draw obstacles
        for (const obstacle of obstacles) {
            obstacle.draw(this.ctx)
        }

        // Draw local player
        this.player.draw(timestamp)

        // Draw particles
        this.drawParticles()

        // Draw touch controls if active and draw method exists
        if (
            this.touchControls &&
            typeof this.touchControls.draw === 'function'
        ) {
            this.touchControls.draw()
        }

        // Draw winning line
        this.drawWinningLine(timestamp)

        // Draw debug information if enabled
        if (this.config.isDebugEnabled()) {
            this.drawDebugInfo(timestamp)
        }
    }

    /**
     * Post-update phase for checking game conditions
     */
    postUpdate() {
        // Only run these checks if the game is in PLAYING state
        if (this.gameState !== this.config.STATE.PLAYING) return

        // Check for winner
        this.checkForWinner()

        // Update high score
        this.updateHighScore()
    }

    /**
     * Reset game after collision
     */
    resetGame() {
        this.score = 0
        this.uiManager.updateScore(0)
        this.obstacleManager.reset()
        this.player.resetPosition()

        // Clear particles
        if (this.particleSystem) {
            this.particleSystem.clear()
        } else {
            this.particles = []
        }
    }

    /**
     * Complete reset after game over
     */
    completeReset() {
        // Hide any game over UI
        this.uiManager.hideGameOver()

        // Reset game elements
        this.resetGame()

        // Set game state back to playing
        this.gameState = this.config.STATE.PLAYING
    }

    /**
     * Add celebration particles when scoring
     */
    addScoreParticles() {
        // Get the winning line position
        const scaledWinningLine = this.config.getWinningLine(
            this.canvas.height,
            BASE_CANVAS_HEIGHT
        )

        // Number of particles based on score (more particles for higher scores)
        const particleCount = Math.min(10 + this.score * 2, 50)

        if (this.particleSystem) {
            // Use particle system if available
            this.particleSystem.createCelebration({
                x: this.player.x + this.player.width / 2,
                y: scaledWinningLine,
                count: particleCount,
                minSize: 2 * this.scalingInfo.widthScale,
                maxSize: 7 * this.scalingInfo.widthScale,
                minLife: 20,
                maxLife: 40,
            })
        }
    }

    /**
     * Update all particles
     * @param {number} deltaTime - Time since last frame in seconds
     */
    updateParticles(deltaTime) {
        // Update particle system if it exists
        if (this.particleSystem) {
            this.particleSystem.update(deltaTime)
        }
    }

    /**
     * Draw all particles
     */
    drawParticles() {
        // Use particle system if it exists
        if (this.particleSystem) {
            this.particleSystem.draw()
        }
    }

    /**
     * Check if player has reached the winning line
     */
    checkForWinner() {
        // Calculate scaled winning line position
        const scaledWinningLine = this.config.getWinningLine(
            this.canvas.height,
            BASE_CANVAS_HEIGHT
        )

        if (this.player.y < scaledWinningLine) {
            // Increment score
            this.score++
            this.uiManager.updateScore(this.score)

            // Add more obstacles as game progresses
            this.addObstaclesBasedOnScore()

            // Add visual effects
            this.addScoreParticles()

            // Play score sound
            if (this.assetManager) {
                this.assetManager.playSound('score', 0.3)
            } else {
                // Fallback to legacy sound method
                const playSound = window.playSound || (() => {})
                playSound('score')
            }

            // Reset player to bottom of screen
            this.player.resetPosition()
        }
    }

    /**
     * Add obstacles based on current score
     */
    addObstaclesBasedOnScore() {
        // Add initial obstacles for new game
        if (this.score <= 2) {
            this.obstacleManager.addObstacle()
        }

        // Add obstacles as score increases (difficulty progression)
        if (this.score % 4 === 0) {
            this.obstacleManager.addObstacle()
        }

        // On small screens, cap the max number of obstacles to avoid overwhelming
        // the player
        if (
            this.scalingInfo.widthScale < 0.7 &&
            this.obstacleManager.getObstacles().length > 7
        ) {
            return
        }
    }

    /**
     * Update the high score if needed
     */
    updateHighScore() {
        if (this.score > this.highScore) {
            this.highScore = this.score
            this.uiManager.updateHighScore(this.highScore)
        }
    }

    /**
     * Draw the winning line
     * @param {number} timestamp - Current animation timestamp
     */
    drawWinningLine(timestamp) {
        // Only draw winning line if score is high enough or on desktop
        if (this.score <= 5 && !this.isDesktop) return

        // Get the winning line position
        const scaledWinningLine = this.config.getWinningLine(
            this.canvas.height,
            BASE_CANVAS_HEIGHT
        )

        // Draw winning line
        if (this.isDesktop) {
            // Enhanced visual feedback for desktop
            this.ctx.beginPath()
            this.ctx.moveTo(0, scaledWinningLine)
            this.ctx.lineTo(this.canvas.width, scaledWinningLine)

            // Pulsing effect
            const glowIntensity = 0.3 + 0.2 * Math.sin(timestamp / 500)
            this.ctx.strokeStyle = `rgba(0, 255, 255, ${glowIntensity})`
            this.ctx.lineWidth = 2
            this.ctx.stroke()

            // Draw subtle grid pattern on desktop
            if (this.config.isDebugEnabled() || this.score > 5) {
                this.drawGridPattern()
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

    /**
     * Draw a subtle grid pattern for desktop view
     */
    drawGridPattern() {
        // Draw a subtle grid pattern visible only on desktop
        this.ctx.beginPath()
        this.ctx.strokeStyle = 'rgba(0, 255, 255, 0.05)'
        this.ctx.lineWidth = 0.5

        // Scale grid size with the canvas
        const gridSize = 30 * this.scalingInfo.widthScale

        // Vertical lines
        for (let x = 0; x < this.canvas.width; x += gridSize) {
            this.ctx.moveTo(x, 0)
            this.ctx.lineTo(x, this.canvas.height)
        }

        // Horizontal lines
        for (let y = 0; y < this.canvas.height; y += gridSize) {
            this.ctx.moveTo(0, y)
            this.ctx.lineTo(this.canvas.width, y)
        }

        this.ctx.stroke()
    }

    /**
     * Draw debug information
     * @param {number} timestamp - Current animation timestamp
     */
    drawDebugInfo(timestamp) {
        // Set debug text styles
        this.ctx.font = '12px monospace'
        this.ctx.fillStyle = 'yellow'
        this.ctx.textAlign = 'left'
        this.ctx.textBaseline = 'top'

        // Display fps
        const fps = Math.round(
            1000 / Math.max(1, timestamp - this.lastFrameTime)
        )
        this.ctx.fillText(`FPS: ${fps}`, 10, 10)

        // Display player position
        this.ctx.fillText(
            `Player: (${Math.round(this.player.x)}, ${Math.round(
                this.player.y
            )})`,
            10,
            25
        )

        // Display obstacle count
        this.ctx.fillText(
            `Obstacles: ${this.obstacleManager.getObstacles().length}`,
            10,
            40
        )

        // Display particle count
        if (this.particleSystem) {
            const stats = this.particleSystem.getStats()
            this.ctx.fillText(
                `Particles: ${stats.activeParticles}/${stats.totalAllocated}`,
                10,
                55
            )
        } else {
            this.ctx.fillText(
                `Particles: ${this.particles ? this.particles.length : 0}`,
                10,
                55
            )
        }

        // Display scaling info
        this.ctx.fillText(
            `Scale: ${this.scalingInfo.widthScale.toFixed(2)}x`,
            10,
            70
        )

        // Display game state
        this.ctx.fillText(`State: ${this.gameState}`, 10, 85)

        // Draw player hitbox
        this.ctx.strokeStyle = 'yellow'
        this.ctx.lineWidth = 1
        this.ctx.strokeRect(
            this.player.x,
            this.player.y,
            this.player.width,
            this.player.height
        )
    }

    /**
     * Draw method (primary drawing function)
     * Used by ResponsiveManager to force redraw
     */
    draw() {
        if (this.ctx && this.canvas) {
            this.render(performance.now())
        }
    }

    /**
     * Clean up resources (important for memory management)
     */
    dispose() {
        // Remove event listeners
        document.removeEventListener('game:restart', this.handleRestartEvent)

        // Dispose managers
        if (this.inputManager) {
            this.inputManager.dispose()
        }

        if (this.uiManager) {
            this.uiManager.dispose()
        }

        if (this.assetManager) {
            this.assetManager.dispose()
        }

        // Clean up particle system
        if (this.particleSystem) {
            this.particleSystem.dispose()
            this.particleSystem = null
        }

        // Stop animation frame
        this.gameState = this.config.STATE.PAUSED
    }
}
