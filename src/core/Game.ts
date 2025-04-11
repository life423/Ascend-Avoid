/**
 * Main game controller class that orchestrates all game systems.
 * Refactored to support responsive design across all devices and screen sizes.
 * Now with TypeScript support.
 */
import { GameObject, InputState, PerformanceStats, ScalingInfo } from '../types'

// Import player and background entities
import Background from '../entities/Background'
import Player from '../entities/Player'
import TouchControls from '../ui/TouchControls'

// Fallback constants in case imports fail
const BASE_CANVAS_WIDTH = 560
const BASE_CANVAS_HEIGHT = 550

// Define interfaces for specific components
interface KeyMappings {
    UP: string[]
    DOWN: string[]
    LEFT: string[]
    RIGHT: string[]
    RESTART: string[]
    [key: string]: string[]
}

// Extended GameConfig interface to ensure type safety
interface GameConfigInterface {
    STATE: {
        READY: string
        WAITING: string
        STARTING: string
        PLAYING: string
        PAUSED: string
        GAME_OVER: string
    }
    getKeys(): KeyMappings
    getWinningLine(canvasHeight: number, baseHeight: number): number
    isDebugEnabled(): boolean
    setDesktopMode(isDesktop: boolean): void
    getObstacleMinWidthRatio(): number
    getObstacleMaxWidthRatio(): number
    getMaxCars(): number
}

// Import our manager classes
import ParticleSystem from '../entities/ParticleSystem'
import AssetManager from '../managers/AssetManager'
import InputManager from '../managers/InputManager'
import ObstacleManager from '../managers/ObstacleManager'
import UIManager from '../managers/UIManager'
import GameConfig from './GameConfig'

// Forward references to game mode types
import GameMode from './GameMode'

// Define interfaces for game components
interface GameModeModule {
    default: new (game: Game) => GameMode
}

interface ParticleStats {
    activeParticles: number
    totalAllocated: number
}

interface AssetDefinition {
    key: string
    src: string
}

interface ParticleCelebrationOptions {
    x: number
    y: number
    count: number
    minSize: number
    maxSize: number
    minLife: number
    maxLife: number
}

export default class Game {
    // Canvas and rendering context
    canvas: HTMLCanvasElement
    ctx: CanvasRenderingContext2D

    // UI elements
    scoreElement: HTMLElement | null
    highScoreElement: HTMLElement | null

    // Game state
    score: number
    highScore: number
    gameState: string
    lastFrameTime: number
    isDesktop: boolean
    isMultiplayerMode: boolean

    // Core components
    config: GameConfig & GameConfigInterface
    player: Player
    background: Background
    touchControls: TouchControls
    currentGameMode: GameMode | null

    // Manager components
    inputManager: InputManager | null
    obstacleManager: ObstacleManager | null
    uiManager: UIManager | null
    assetManager: AssetManager | null
    particleSystem: ParticleSystem | null

    // Multiplayer state
    remotePlayers: Record<string, any>

    // Responsive scaling info
    scalingInfo: ScalingInfo

    // Performance monitoring
    frameTimes: number[]
    frameTimeIndex: number
    frameTimeWindow: number
    performanceStats: PerformanceStats
    particles?: any[] // Legacy fallback

    /**
     * Creates a new Game instance
     */
    constructor() {
        console.log('Game constructor called')

        // Get DOM elements
        this.canvas =
            (document.getElementById('canvas') as HTMLCanvasElement) ||
            document.createElement('canvas')
        console.log('Canvas element:', this.canvas)

        if (this.canvas) {
            this.ctx = this.canvas.getContext('2d')!
            console.log('Canvas context:', this.ctx)

            // Check canvas dimensions
            console.log(
                'Canvas dimensions:',
                this.canvas.width,
                this.canvas.height
            )
            if (this.canvas.width === 0 || this.canvas.height === 0) {
                console.warn(
                    'Canvas has zero dimensions - may need explicit sizing'
                )
                // Don't set size here yet - let ResponsiveManager handle it
            }
        } else {
            console.error('Canvas element not found in DOM!')
            // Create a dummy canvas to prevent errors
            this.canvas = document.createElement('canvas')
            this.ctx = this.canvas.getContext('2d')!
        }

        this.scoreElement = document.getElementById('score')
        this.highScoreElement = document.getElementById('highScore')

        // Game state
        this.score = 0
        this.highScore = 0
        this.lastFrameTime = 0
        this.currentGameMode = null

        // Performance monitoring
        this.frameTimes = []
        this.frameTimeIndex = 0
        this.frameTimeWindow = 60 // Store last 60 frames for analysis
        this.performanceStats = {
            avgFrameTime: 0,
            maxFrameTime: 0,
            minFrameTime: Infinity,
            frameCount: 0,
        }

        // Device detection now handled by ResponsiveManager
        // Default to desktop for initial rendering before ResponsiveManager initializes
        this.isDesktop = window.matchMedia('(min-width: 1200px)').matches

        // Create configuration with platform detection
        this.config = new GameConfig({
            isDesktop: this.isDesktop,
        }) as GameConfig & GameConfigInterface

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
        this.scalingInfo = {
            widthScale: 1,
            heightScale: 1,
            pixelRatio: 1,
            reducedResolution: false,
        }

        // These will be initialized in init()
        this.player = null!
        this.background = null!
        this.touchControls = null!
        this.particleSystem = null

        // Initialize game
        this.init()
    }

    /**
     * Initialize the game and all its components
     */
    async init(): Promise<void> {
        console.log('Initializing game...')

        // Create UI manager
        this.uiManager = new UIManager({
            scoreElement: this.scoreElement || document.createElement('div'),
            highScoreElement:
                this.highScoreElement || document.createElement('div'),
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
            keyMappings: this.config.getKeys() as KeyMappings,
        })

        // Listen for restart events from input manager
        document.addEventListener(
            'game:restart',
            this.handleRestartEvent.bind(this)
        )

        // Set up touch controls if needed
        this.setupTouchControls()

        // Initialize the default game mode (single player)
        await this.initializeGameMode('singlePlayer')

        // Hide loading screen
        this.uiManager.hideLoading()

        // Set game state to playing
        this.gameState = this.config.STATE.PLAYING

        // Start game loop
        requestAnimationFrame(this.gameLoop.bind(this))

        console.log('Game initialized successfully')
    }

    /**
     * Initialize the specified game mode
     * @param mode - The mode to initialize ('singlePlayer' or 'multiplayer')
     * @returns A promise that resolves when the mode is initialized
     */
    async initializeGameMode(
        mode: 'singlePlayer' | 'multiplayer'
    ): Promise<void> {
        // Clean up any existing game mode
        if (this.currentGameMode) {
            this.currentGameMode.dispose()
            this.currentGameMode = null
        }

        try {
            // Dynamically import the appropriate game mode class
            let GameModeClass: new (game: Game) => GameMode

            switch (mode) {
                case 'multiplayer':
                    // Dynamic import of MultiplayerMode
                    const MultiplayerModeModule = (await import(
                        './MultiplayerMode'
                    )) as GameModeModule
                    GameModeClass = MultiplayerModeModule.default
                    break

                case 'singlePlayer':
                default:
                    // Dynamic import of SinglePlayerMode
                    const SinglePlayerModeModule = (await import(
                        './SinglePlayerMode'
                    )) as GameModeModule
                    GameModeClass = SinglePlayerModeModule.default
                    break
            }

            // Create and initialize the game mode
            this.currentGameMode = new GameModeClass(this)
            await this.currentGameMode.initialize()

            console.log(`Game mode initialized: ${mode}`)
            return Promise.resolve()
        } catch (error) {
            console.error(`Failed to initialize game mode ${mode}:`, error)
            // Fallback to single player mode if multiplayer fails
            if (mode === 'multiplayer') {
                console.log('Falling back to single player mode')
                return this.initializeGameMode('singlePlayer')
            }
            return Promise.reject(error)
        }
    }

    /**
     * Switch to the specified game mode
     * @param mode - The mode to switch to ('singlePlayer' or 'multiplayer')
     * @returns A promise that resolves when the mode switch is complete
     */
    async switchGameMode(mode: 'singlePlayer' | 'multiplayer'): Promise<void> {
        // Show loading indicator during mode switch
        if (this.uiManager) {
            this.uiManager.showLoading(
                `Switching to ${
                    mode === 'multiplayer' ? 'multiplayer' : 'single player'
                } mode...`
            )
        }

        try {
            // Initialize the new game mode
            await this.initializeGameMode(mode)

            // Reset game state
            this.resetGame()

            // Hide loading indicator
            if (this.uiManager) {
                this.uiManager.hideLoading()
            }

            return Promise.resolve()
        } catch (error: any) {
            console.error(`Failed to switch to game mode ${mode}:`, error)

            // Hide loading and show error
            if (this.uiManager) {
                this.uiManager.hideLoading()
                this.uiManager.showError(
                    `Failed to switch game mode: ${error.message}`
                )
            }

            return Promise.reject(error)
        }
    }

    /**
     * Callback for when ResponsiveManager updates the canvas size
     * Called by ResponsiveManager when screen size or orientation changes
     * @param widthScale - Scale factor for width
     * @param heightScale - Scale factor for height
     */
    onResize(widthScale: number, heightScale: number): void {
        // Store new scaling information for game calculations
        this.scalingInfo = {
            widthScale: widthScale,
            heightScale: heightScale,
            pixelRatio: window.devicePixelRatio || 1,
            reducedResolution: false,
        }

        // Update device detection
        this.isDesktop = window.innerWidth >= 1200

        // Update game config with new device info
        this.config.setDesktopMode(this.isDesktop)

        // Update game elements with new dimensions
        if (this.player) {
            this.player.resetPosition()
        }

        if (this.background) {
            this.background.resize()
        }

        if (this.obstacleManager) {
            // Update obstacles
            const obstacles = this.obstacleManager.getObstacles()
            for (const obstacle of obstacles) {
                obstacle.calculateHeight()
            }
        }

        console.log(
            `Game resized: isDesktop=${
                this.isDesktop
            }, scale=${widthScale.toFixed(2)}`
        )
    }

    /**
     * Set up mobile touch controls
     * Only creates and shows touch controls on actual touch devices,
     * never on desktop layouts
     */
    setupTouchControls(): void {
        // Skip touch controls entirely on desktop layout
        if (document.body.classList.contains('desktop-layout')) {
            console.log('Desktop layout detected - touch controls disabled')
            return
        }

        // Skip touch controls on non-touch devices
        const isTouchDevice =
            window.matchMedia('(pointer: coarse)').matches ||
            'ontouchstart' in window ||
            navigator.maxTouchPoints > 0

        if (!isTouchDevice) {
            console.log('Non-touch device detected - touch controls disabled')
            return
        }

        // Create touch controls overlay only for touch devices
        this.touchControls = new TouchControls(this)
        this.touchControls.show()

        // Register touch buttons with input manager
        if (this.inputManager && this.touchControls.buttonElements) {
            for (const [direction, button] of Object.entries(
                this.touchControls.buttonElements
            )) {
                this.inputManager.registerTouchButton(
                    button as HTMLElement,
                    direction
                )
            }
        }

        // Set up canvas touch events
        if (this.inputManager) {
            this.inputManager.setupTouchControls(this.canvas)
        }
    }

    /**
     * Preload all game assets
     */
    async preloadAssets(): Promise<boolean> {
        // Note: We don't need to preload image assets since sprites are
        // created dynamically by the SpriteManager using Canvas

        // Return immediately as there are no assets to load
        console.log('No external assets to preload - using generated sprites')
        return true
    }

    /**
     * Handle restart event from input manager
     */
    handleRestartEvent(): void {
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
     * @param timestamp - Current animation timestamp
     */
    gameLoop(timestamp: number): void {
        // Performance measurement - start time
        const frameStartTime = performance.now()

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

        try {
            // Skip updates if game is paused or in game over state
            if (this.gameState !== this.config.STATE.PLAYING) {
                // Just render the current state without updating
                this.render(timestamp)
                // Performance tracking - measure render-only time
                this.trackFrameTime(performance.now() - frameStartTime)
                return
            }

            // Get current input state
            const inputState = this.inputManager
                ? this.inputManager.getInputState()
                : { up: false, down: false, left: false, right: false }

            // 1. Update phase - delegate to current game mode
            if (this.currentGameMode) {
                this.currentGameMode.update(inputState, deltaTime, timestamp)
            }

            // 2. Update common systems (particles, etc)
            this.updateCommonSystems(deltaTime, timestamp)

            // 3. Render phase
            this.render(timestamp)

            // 4. Post-update phase (check win/lose conditions)
            if (this.currentGameMode) {
                this.currentGameMode.postUpdate()
            } else {
                // Fallback to the game's postUpdate if no game mode is active
                this.postUpdate()
            }

            // Performance tracking - measure full frame time
            this.trackFrameTime(performance.now() - frameStartTime)
        } catch (error) {
            console.error('Error in game loop:', error)
        }
    }

    /**
     * Track frame time for performance monitoring
     * @param frameTime - Time taken to process this frame in ms
     */
    trackFrameTime(frameTime: number): void {
        // Store frame time in circular buffer
        this.frameTimes[this.frameTimeIndex] = frameTime
        this.frameTimeIndex = (this.frameTimeIndex + 1) % this.frameTimeWindow

        // Update performance stats every 60 frames
        this.performanceStats.frameCount++
        if (this.performanceStats.frameCount % 60 === 0) {
            // Calculate stats from the frame time buffer
            let sum = 0
            let max = 0
            let min = Infinity

            for (let i = 0; i < this.frameTimes.length; i++) {
                const time = this.frameTimes[i] || 0
                sum += time
                max = Math.max(max, time)
                if (time > 0) {
                    // Only consider valid times for minimum
                    min = Math.min(min, time)
                }
            }

            // Update stats
            const validTimes = this.frameTimes.filter(t => t > 0)
            this.performanceStats.avgFrameTime = sum / (validTimes.length || 1)
            this.performanceStats.maxFrameTime = max
            this.performanceStats.minFrameTime = min === Infinity ? 0 : min

            // Log stats if debug mode is enabled
            if (this.config.isDebugEnabled()) {
                console.log(
                    `Performance: avg=${this.performanceStats.avgFrameTime.toFixed(
                        2
                    )}ms, ` +
                        `min=${this.performanceStats.minFrameTime.toFixed(
                            2
                        )}ms, ` +
                        `max=${this.performanceStats.maxFrameTime.toFixed(2)}ms`
                )
            }
        }
    }

    /**
     * Update common game systems that work the same regardless of game mode
     * @param deltaTime - Time since last frame in seconds
     * @param timestamp - Current timestamp for animation
     */
    updateCommonSystems(deltaTime: number, timestamp: number): void {
        // Update particles
        this.updateParticles(deltaTime)
    }

    /**
     * Update all particles
     * @param deltaTime - Time since last frame in seconds
     */
    updateParticles(deltaTime: number): void {
        // Update particle system if it exists
        if (this.particleSystem) {
            this.particleSystem.update(deltaTime)
        }
    }

    /**
     * Update player movement based on input state
     * @param inputState - Current input state
     */
    updatePlayerMovement(inputState: InputState): void {
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
     * @param obstacle - The obstacle that was hit
     */
    handleCollision(obstacle: GameObject): void {
        // Play collision sound
        if (this.assetManager) {
            this.assetManager.playSound('collision', 0.3)
        } else {
            // Fallback to legacy sound method
            const playSound = (window as any).playSound || (() => {})
            playSound('collision')
        }

        // Flash screen red
        if (this.uiManager) {
            this.uiManager.flashScreen('#ff0000', 200)
        }

        // Set game state to game over
        this.gameState = this.config.STATE.GAME_OVER

        // Show game over screen
        if (this.uiManager) {
            this.uiManager.showGameOver(
                this.score,
                this.highScore,
                this.completeReset.bind(this)
            )
        }
    }

    /**
     * Render the game
     * @param timestamp - Current animation timestamp
     */
    render(timestamp: number): void {
        // Draw background (replaces clearRect)
        if (this.background) {
            try {
                this.background.update(timestamp)
            } catch (e) {
                console.error('Error updating background:', e)
                // Fallback: Clear the canvas manually
                if (this.ctx && this.canvas) {
                    this.ctx.clearRect(
                        0,
                        0,
                        this.canvas.width,
                        this.canvas.height
                    )
                    this.ctx.fillStyle = '#0a192f' // Dark blue background
                    this.ctx.fillRect(
                        0,
                        0,
                        this.canvas.width,
                        this.canvas.height
                    )
                }
            }
        } else {
            console.warn('No background object available')
            // Fallback: Clear the canvas manually
            if (this.ctx && this.canvas) {
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
                this.ctx.fillStyle = '#0a192f' // Dark blue background
                this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
            }
        }

        // Get obstacles - with error handling
        let obstacles: GameObject[] = []
        try {
            if (this.obstacleManager) {
                obstacles = this.obstacleManager.getObstacles()
            } else {
                console.error('Obstacle manager not available')
            }
        } catch (e) {
            console.error('Error getting obstacles:', e)
        }

        // Draw obstacles
        for (const obstacle of obstacles) {
            if (typeof (obstacle as any).draw === 'function') {
                ;(obstacle as any).draw(this.ctx)
            } else if (typeof obstacle.render === 'function') {
                obstacle.render(this.ctx, timestamp)
            }
        }

        // Draw local player - with error handling
        try {
            if (this.player) {
                this.player.draw(timestamp)
            } else {
                console.error('Player object not available for drawing')
            }
        } catch (e) {
            console.error('Error drawing player:', e)
        }

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
     * Draw all particles
     */
    drawParticles(): void {
        // Use particle system if it exists
        if (this.particleSystem) {
            this.particleSystem.draw()
        }
    }

    /**
     * Post-update phase for checking game conditions
     */
    postUpdate(): void {
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
    resetGame(): void {
        this.score = 0
        if (this.uiManager) {
            this.uiManager.updateScore(0)
        }

        if (this.obstacleManager) {
            this.obstacleManager.reset()
        }

        if (this.player) {
            this.player.resetPosition()
        }

        // Clear particles
        if (this.particleSystem) {
            this.particleSystem.clear()
        } else if (this.particles) {
            this.particles = []
        }
    }

    /**
     * Complete reset after game over
     */
    completeReset(): void {
        // Hide any game over UI
        if (this.uiManager) {
            this.uiManager.hideGameOver()
        }

        // Reset game elements
        this.resetGame()

        // Set game state back to playing
        this.gameState = this.config.STATE.PLAYING
    }

    /**
     * Add celebration particles when scoring
     */
    addScoreParticles(): void {
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
     * Check if player has reached the winning line
     */
    checkForWinner(): void {
        // Calculate scaled winning line position
        const scaledWinningLine = this.config.getWinningLine(
            this.canvas.height,
            BASE_CANVAS_HEIGHT
        )

        if (this.player.y < scaledWinningLine) {
            // Increment score
            this.score++
            if (this.uiManager) {
                this.uiManager.updateScore(this.score)
            }

            // Add more obstacles as game progresses
            this.addObstaclesBasedOnScore()

            // Add visual effects
            this.addScoreParticles()

            // Play score sound
            if (this.assetManager) {
                this.assetManager.playSound('score', 0.3)
            } else {
                // Fallback to legacy sound method
                const playSound = (window as any).playSound || (() => {})
                playSound('score')
            }

            // Reset player to bottom of screen
            this.player.resetPosition()
        }
    }

    /**
     * Add obstacles based on current score
     */
    addObstaclesBasedOnScore(): void {
        if (!this.obstacleManager) return

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
    updateHighScore(): void {
        if (this.score > this.highScore) {
            this.highScore = this.score
            if (this.uiManager) {
                this.uiManager.updateHighScore(this.highScore)
            }
        }
    }

    /**
     * Draw the winning line
     * @param timestamp - Current animation timestamp
     */
    drawWinningLine(timestamp: number): void {
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
    drawGridPattern(): void {
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
     * @param timestamp - Current animation timestamp
     */
    drawDebugInfo(timestamp: number): void {
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

        // Display performance stats
        this.ctx.fillText(
            `Frame Time: ${this.performanceStats.avgFrameTime.toFixed(1)}ms`,
            10,
            25
        )
        this.ctx.fillText(
            `Min/Max: ${this.performanceStats.minFrameTime.toFixed(
                1
            )}/${this.performanceStats.maxFrameTime.toFixed(1)}ms`,
            10,
            40
        )

        // Display player position
        this.ctx.fillText(
            `Player: (${Math.round(this.player.x)}, ${Math.round(
                this.player.y
            )})`,
            10,
            55
        )

        // Display obstacle count
        this.ctx.fillText(
            `Obstacles: ${this.obstacleManager?.getObstacles().length || 0}`,
            10,
            70
        )

        // Display particle count
        if (this.particleSystem) {
            const stats = this.particleSystem.getStats()
            this.ctx.fillText(
                `Particles: ${stats.activeParticles}/${stats.totalAllocated}`,
                10,
                85
            )
        } else {
            this.ctx.fillText(
                `Particles: ${this.particles ? this.particles.length : 0}`,
                10,
                85
            )
        }

        // Display scaling info
        this.ctx.fillText(
            `Scale: ${this.scalingInfo.widthScale.toFixed(2)}x`,
            10,
            100
        )

        // Display game state
        this.ctx.fillText(`State: ${this.gameState}`, 10, 115)

        // Display object counts for memory tracking
        let totalObjects =
            1 + // Game instance
            (this.obstacleManager
                ? this.obstacleManager.getObstacles().length
                : 0) +
            (this.particleSystem
                ? this.particleSystem.getStats().activeParticles
                : 0) +
            Object.keys(this.remotePlayers).length
        this.ctx.fillText(`Total Objects: ~${totalObjects}`, 10, 130)

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
    draw(): void {
        if (this.ctx && this.canvas) {
            this.render(performance.now())
        }
    }

    /**
     * Clean up resources (important for memory management)
     */
    dispose(): void {
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
