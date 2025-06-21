/**
 * Example Integration: Responsive Ascend Avoid Game
 * 
 * Shows how to integrate the new ResponsiveGameSystem with your existing game code.
 * This replaces the need for manual canvas setup and provides universal compatibility.
 */

import ResponsiveGameSystem from '../systems/ResponsiveGameSystem'
import { TouchGesture, GameViewport, QualitySettings } from '../types'

interface Obstacle {
    x: number
    y: number
    width: number
    height: number
    speed: number
    active?: boolean
}

interface GameState {
    player: {
        x: number
        y: number
        width: number
        height: number
        speed: number
    }
    obstacles: Obstacle[]
    score: number
    gameRunning: boolean
}

class ResponsiveAscendAvoidGame {
    private responsiveSystem: ResponsiveGameSystem
    private gameState: GameState
    private lastTime: number = 0
    private animationId: number = 0
    
    // Game timing
    private obstacleSpawnTimer: number = 0
    private obstacleSpawnInterval: number = 2000 // 2 seconds
    
    // Performance tracking
    private frameCount: number = 0
    private fpsTimer: number = 0

    constructor(canvasId: string) {
        const canvas = document.getElementById(canvasId) as HTMLCanvasElement
        if (!canvas) {
            throw new Error(`Canvas with id "${canvasId}" not found`)
        }

        // Initialize responsive system with game-specific configuration
        this.responsiveSystem = new ResponsiveGameSystem(canvas, {
            canvas: {
                gameWidth: 400,    // Virtual game dimensions
                gameHeight: 600,   // (scales to any real screen size)
                enableDPR: true,   // Crisp rendering on high-DPI displays
                enableAntialiasing: true,
                debug: false       // Set to true for development
            },
            performance: {
                enableAdaptiveQuality: true,  // Automatically adjust quality
                targetFPS: 60,
                enableObjectPooling: true,   // Memory optimization
                enableBatchRendering: true
            },
            input: {
                enableGestures: true,    // Touch gesture recognition
                enableHaptics: true,     // Vibration feedback
                swipeThreshold: 30       // Responsive to screen size
            },
            debug: {
                showPerformanceOverlay: false,  // Set to true for debugging
                logDeviceInfo: true,
                enableMetrics: true
            }
        })

        // Initialize game state
        this.gameState = {
            player: {
                x: 200,  // Center of 400px game width
                y: 550,  // Near bottom of 600px game height
                width: 30,
                height: 30,
                speed: 200 // pixels per second
            },
            obstacles: [],
            score: 0,
            gameRunning: false
        }
    }

    /**
     * Initialize the game system
     */
    public async initialize(): Promise<void> {
        console.log('Initializing Responsive Ascend Avoid Game...')
        
        try {
            // Initialize responsive system
            await this.responsiveSystem.initialize()
            
            // Setup event handlers
            this.setupEventHandlers()
            
            console.log('Game initialized successfully!')
            console.log('Device capabilities:', this.responsiveSystem.getCapabilities())
            console.log('Viewport:', this.responsiveSystem.getViewport())
            
        } catch (error) {
            console.error('Failed to initialize game:', error)
            throw error
        }
    }

    /**
     * Setup event handlers for the responsive system
     */
    private setupEventHandlers(): void {
        // Handle input changes (touch, mouse, keyboard)
        this.responsiveSystem.setInputChangeCallback((inputState) => {
            if (!this.gameState.gameRunning) return
            
            const player = this.gameState.player
            const viewport = this.responsiveSystem.getViewport()
            
            // Movement with boundary checking
            if (inputState.left && player.x > player.width / 2) {
                player.x -= player.speed * (1/60) // Assume 60fps for now
            }
            if (inputState.right && player.x < viewport.internal.width - player.width / 2) {
                player.x += player.speed * (1/60)
            }
            if (inputState.up && player.y > player.height / 2) {
                player.y -= player.speed * (1/60)
            }
            if (inputState.down && player.y < viewport.internal.height - player.height / 2) {
                player.y += player.speed * (1/60)
            }
        })

        // Handle touch gestures
        this.responsiveSystem.setGestureCallback((gesture: TouchGesture) => {
            if (!this.gameState.gameRunning) return
            
            const player = this.gameState.player
            const viewport = this.responsiveSystem.getViewport()
            const moveDistance = 50 // Pixels to move per swipe
            
            switch (gesture.type) {
                case 'swipe':
                    switch (gesture.direction) {
                        case 'left':
                            player.x = Math.max(player.width / 2, player.x - moveDistance)
                            break
                        case 'right':
                            player.x = Math.min(viewport.internal.width - player.width / 2, player.x + moveDistance)
                            break
                        case 'up':
                            player.y = Math.max(player.height / 2, player.y - moveDistance)
                            break
                        case 'down':
                            player.y = Math.min(viewport.internal.height - player.height / 2, player.y + moveDistance)
                            break
                    }
                    break
                    
                case 'tap':
                    // Tap to start/restart game
                    if (!this.gameState.gameRunning) {
                        this.startGame()
                    }
                    break
            }
        })

        // Handle viewport changes (screen rotation, resize)
        this.responsiveSystem.setResizeCallback((viewport: GameViewport) => {
            console.log('Viewport changed:', viewport)
            // Game coordinates remain the same, rendering scales automatically
        })

        // Handle quality changes (performance adaptation)
        this.responsiveSystem.setQualityChangeCallback((quality: QualitySettings) => {
            console.log('Quality adjusted:', quality)
            // You could adjust game logic based on quality
            // e.g., reduce particle effects, simplify rendering
        })

        // Handle performance monitoring
        this.responsiveSystem.setPerformanceChangeCallback((metrics) => {
            // Update FPS in the responsive system
            this.responsiveSystem.updateFPS(this.calculateFPS())
            
            // Optional: Adjust game complexity based on performance
            if (metrics.fps < 30) {
                console.warn('Low FPS detected, consider reducing game complexity')
            }
        })
    }

    /**
     * Start the game
     */
    public startGame(): void {
        this.gameState.gameRunning = true
        this.gameState.score = 0
        this.gameState.obstacles = []
        this.gameState.player.x = 200
        this.gameState.player.y = 550
        
        this.lastTime = performance.now()
        this.gameLoop()
        
        console.log('Game started!')
    }

    /**
     * Stop the game
     */
    public stopGame(): void {
        this.gameState.gameRunning = false
        if (this.animationId) {
            cancelAnimationFrame(this.animationId)
        }
        console.log('Game stopped!')
    }

    /**
     * Main game loop
     */
    private gameLoop(): void {
        if (!this.gameState.gameRunning) return
        
        const currentTime = performance.now()
        const deltaTime = currentTime - this.lastTime
        this.lastTime = currentTime
        
        // Update game logic
        this.update(deltaTime)
        
        // Render game
        this.render()
        
        // Update performance metrics
        this.updatePerformanceMetrics()
        
        // Continue loop
        this.animationId = requestAnimationFrame(() => this.gameLoop())
    }

    /**
     * Update game logic
     */
    private update(deltaTime: number): void {
        const deltaSeconds = deltaTime / 1000
        const viewport = this.responsiveSystem.getViewport()
        
        // Spawn obstacles
        this.obstacleSpawnTimer += deltaTime
        if (this.obstacleSpawnTimer >= this.obstacleSpawnInterval) {
            this.spawnObstacle()
            this.obstacleSpawnTimer = 0
        }
        
        // Update obstacles
        for (let i = this.gameState.obstacles.length - 1; i >= 0; i--) {
            const obstacle = this.gameState.obstacles[i]
            obstacle.y += obstacle.speed * deltaSeconds
            
            // Remove obstacles that are off-screen
            if (obstacle.y > viewport.internal.height + obstacle.height) {
                this.gameState.obstacles.splice(i, 1)
                this.gameState.score += 10
            }
        }
        
        // Check collisions
        this.checkCollisions()
    }

    /**
     * Spawn a new obstacle
     */
    private spawnObstacle(): void {
        const viewport = this.responsiveSystem.getViewport()
        const quality = this.responsiveSystem.getQuality()
        
        // Use object pooling for better performance or create new obstacle
        const pooledObstacle = this.responsiveSystem.getFromPool('projectiles') as Obstacle | null
        const obstacle: Obstacle = pooledObstacle || {
            x: 0,
            y: 0,
            width: 0,
            height: 0,
            speed: 0,
            active: true
        }
        
        obstacle.width = 40 + Math.random() * 60
        obstacle.height = 20 + Math.random() * 30
        obstacle.x = Math.random() * (viewport.internal.width - obstacle.width)
        obstacle.y = -obstacle.height
        obstacle.speed = 100 + Math.random() * 100 // Adjust speed based on quality
        obstacle.active = true
        
        this.gameState.obstacles.push(obstacle)
    }

    /**
     * Check for collisions
     */
    private checkCollisions(): void {
        const player = this.gameState.player
        
        for (const obstacle of this.gameState.obstacles) {
            if (this.isColliding(player, obstacle)) {
                this.gameOver()
                break
            }
        }
    }

    /**
     * Simple collision detection
     */
    private isColliding(rect1: any, rect2: any): boolean {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y
    }

    /**
     * Handle game over
     */
    private gameOver(): void {
        this.gameState.gameRunning = false
        console.log(`Game Over! Final Score: ${this.gameState.score}`)
        
        // Return all obstacles to pools
        for (const obstacle of this.gameState.obstacles) {
            this.responsiveSystem.returnToPool('projectiles', obstacle)
        }
        this.gameState.obstacles = []
    }

    /**
     * Render the game
     */
    private render(): void {
        const ctx = this.responsiveSystem.getContext()
        const viewport = this.responsiveSystem.getViewport()
        
        // Clear canvas (accounting for scaling)
        ctx.clearRect(0, 0, viewport.internal.width, viewport.internal.height)
        
        // Draw background
        ctx.fillStyle = '#1a1a2e'
        ctx.fillRect(0, 0, viewport.internal.width, viewport.internal.height)
        
        // Draw game border
        ctx.strokeStyle = '#00ffff'
        ctx.lineWidth = 2
        ctx.strokeRect(0, 0, viewport.internal.width, viewport.internal.height)
        
        if (this.gameState.gameRunning) {
            // Draw player
            ctx.fillStyle = '#00ff00'
            ctx.fillRect(
                this.gameState.player.x - this.gameState.player.width / 2,
                this.gameState.player.y - this.gameState.player.height / 2,
                this.gameState.player.width,
                this.gameState.player.height
            )
            
            // Draw obstacles
            ctx.fillStyle = '#ff0000'
            for (const obstacle of this.gameState.obstacles) {
                ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height)
            }
            
            // Draw score
            ctx.fillStyle = '#ffffff'
            ctx.font = '20px Arial'
            ctx.fillText(`Score: ${this.gameState.score}`, 10, 30)
        } else {
            // Draw start screen
            ctx.fillStyle = '#ffffff'
            ctx.font = '24px Arial'
            ctx.textAlign = 'center'
            ctx.fillText('Ascend Avoid', viewport.internal.width / 2, viewport.internal.height / 2 - 40)
            ctx.font = '16px Arial'
            ctx.fillText('Tap to start or use arrow keys', viewport.internal.width / 2, viewport.internal.height / 2)
            ctx.fillText('Swipe or use WASD to move', viewport.internal.width / 2, viewport.internal.height / 2 + 30)
            ctx.textAlign = 'left'
        }
        
        // Update render call count for performance monitoring
        this.responsiveSystem.updateRenderCalls(1 + this.gameState.obstacles.length)
    }

    /**
     * Update performance metrics
     */
    private updatePerformanceMetrics(): void {
        this.frameCount++
        const now = performance.now()
        
        if (now - this.fpsTimer >= 1000) {
            const fps = this.frameCount
            this.responsiveSystem.updateFPS(fps)
            this.frameCount = 0
            this.fpsTimer = now
        }
    }

    /**
     * Calculate current FPS
     */
    private calculateFPS(): number {
        return this.frameCount
    }

    /**
     * Toggle debug overlay (useful for development)
     */
    public toggleDebug(): void {
        this.responsiveSystem.toggleDebugOverlay()
    }

    /**
     * Get current game state (for external access)
     */
    public getGameState(): GameState {
        return { ...this.gameState }
    }

    /**
     * Get responsive system (for advanced access)
     */
    public getResponsiveSystem(): ResponsiveGameSystem {
        return this.responsiveSystem
    }

    /**
     * Cleanup and dispose resources
     */
    public dispose(): void {
        this.stopGame()
        this.responsiveSystem.dispose()
        console.log('Game disposed')
    }
}

// Example usage:
/*
// In your main game file or index.ts:

const game = new ResponsiveAscendAvoidGame('gameCanvas')

game.initialize().then(() => {
    console.log('Game ready!')
    
    // Optional: Show debug overlay during development
    // game.toggleDebug()
    
    // The game will start when user taps/clicks
    // Or you can start it programmatically:
    // game.startGame()
    
}).catch(error => {
    console.error('Failed to initialize game:', error)
})

// Cleanup when done
// window.addEventListener('beforeunload', () => {
//     game.dispose()
// })
*/

export default ResponsiveAscendAvoidGame
