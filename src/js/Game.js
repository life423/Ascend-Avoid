import Player from './Player.js'
import Obstacle from './Obstacle.js'
import Background from './Background.js'
import { GAME_SETTINGS, KEYS } from './constants.js'
import { randomIntFromInterval, playSound, resizeCanvas } from './utils.js'

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

        // Initialize game
        this.init()
    }

    init() {
        // Set up canvas
        resizeCanvas(this.canvas)

        // Create background
        this.background = new Background(this.canvas)
        
        // Create player
        this.player = new Player(this.canvas)

        // Initialize obstacles
        this.initObstacles()

        // Set up event listeners
        this.setupEventListeners()

        // Start game loop
        requestAnimationFrame(this.animate.bind(this))
    }

    initObstacles() {
        this.obstacles = [
            new Obstacle(
                100,
                randomIntFromInterval(20, 450),
                randomIntFromInterval(40, 100),
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

        // Window resize
        window.addEventListener('resize', () => {
            resizeCanvas(this.canvas)
            this.player.resetPosition()
            this.background.resize()
        })
    }

    // Keyboard event handlers
    handleKeyDown(e) {
        if (KEYS.RIGHT.includes(e.key) || e.keyCode === 39) {
            this.player.setMovementKey('right', true)
        }
        if (KEYS.LEFT.includes(e.key) || e.keyCode === 37) {
            this.player.setMovementKey('left', true)
        }
        if (KEYS.UP.includes(e.key) || e.keyCode === 38) {
            this.player.setMovementKey('up', true)
        }
        if (KEYS.DOWN.includes(e.key) || e.keyCode === 40) {
            this.player.setMovementKey('down', true)
        }
        // Add restart functionality with 'R' key
        if (KEYS.RESTART.includes(e.key)) {
            this.resetGame()
        }
    }

    handleKeyUp(e) {
        if (KEYS.RIGHT.includes(e.key) || e.keyCode === 39) {
            this.player.setMovementKey('right', false)
        }
        if (KEYS.LEFT.includes(e.key) || e.keyCode === 37) {
            this.player.setMovementKey('left', false)
        }
        if (KEYS.UP.includes(e.key) || e.keyCode === 38) {
            this.player.setMovementKey('up', false)
        }
        if (KEYS.DOWN.includes(e.key) || e.keyCode === 40) {
            this.player.setMovementKey('down', false)
        }
    }

    // Touch controls
    handleTouchStart(e) {
        e.preventDefault()
        const touch = e.touches[0]
        this.touchStartX = touch.clientX
        this.touchStartY = touch.clientY
    }

    handleTouchEnd(e) {
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
        if (this.player.y < GAME_SETTINGS.WINNING_LINE) {
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

        // Add initial obstacles for new game
        if (this.score <= 2) {
            this.obstacles.push(
                new Obstacle(
                    startX,
                    randomIntFromInterval(minY, maxY),
                    randomIntFromInterval(minWidth, maxWidth),
                    this.canvas
                )
            )
        }

        // Add obstacles as score increases (difficulty progression)
        if (this.score % 4 === 0) {
            this.obstacles.push(
                new Obstacle(
                    startX,
                    randomIntFromInterval(minY, maxY),
                    randomIntFromInterval(minWidth, maxWidth),
                    this.canvas
                )
            )
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

        // Draw background (replaces clearRect)
        this.background.update(timestamp)

        // Update and draw player
        this.player.move()
        this.player.draw(timestamp)

        // Update and draw obstacles
        for (const obstacle of this.obstacles) {
            obstacle.update(timestamp, this.score)
        }

        // Update and draw particles
        this.updateParticles()

        // Game logic
        this.detectCollisions()
        this.updateHighScore()
        this.checkForWinner()

        // Draw game boundaries if needed for clarity
        if (this.score > 5) {
            // Show winning line for visibility at higher difficulty
            this.ctx.beginPath()
            this.ctx.moveTo(0, GAME_SETTINGS.WINNING_LINE)
            this.ctx.lineTo(this.canvas.width, GAME_SETTINGS.WINNING_LINE)
            this.ctx.strokeStyle = 'rgba(255,255,255,0.3)'
            this.ctx.stroke()
        }
    }
}
