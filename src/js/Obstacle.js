import { GAME_SETTINGS } from './constants.js'
import { randomIntFromInterval, SCALE_FACTOR, BASE_CANVAS_WIDTH, BASE_CANVAS_HEIGHT } from './utils.js'
import { getSprite } from './sprites.js'

export default class Obstacle {
    constructor(x, y, width, canvas) {
        this.canvas = canvas
        this.ctx = canvas.getContext('2d')
        
        // Store base dimensions (unscaled)
        this.baseX = x
        this.baseY = y
        this.baseWidth = width
        
        // Apply scaling for actual dimensions
        this.x = x * SCALE_FACTOR
        this.y = y * SCALE_FACTOR
        this.width = width * SCALE_FACTOR

        // Calculate height based on canvas dimensions
        this.calculateHeight()

        // Speed is scaled based on the canvas size
        this.baseSpeed = GAME_SETTINGS.BASE_SPEED
        this.speed = this.baseSpeed * SCALE_FACTOR
        this.lastUpdateTime = 0

        // Random variant for visual diversity (0-2)
        this.variant = randomIntFromInterval(0, 2)

        // Collision state
        this.isColliding = false
        this.explosionFrame = 0
    }

    // Recalculate height based on canvas dimensions
    calculateHeight() {
        // Base height calculation
        const baseHeight = Math.max(BASE_CANVAS_HEIGHT * 0.04, 20)
        // Scale the height
        this.height = baseHeight * SCALE_FACTOR
    }

    // Method which draws the obstacle
    draw(timestamp = 0) {
        if (this.isColliding) {
            // Draw explosion when colliding
            const explosionSprite = getSprite('explosion', this.explosionFrame)
            // Center explosion on obstacle
            const explosionSize = Math.max(this.width, this.height) * 1.5
            this.ctx.drawImage(
                explosionSprite,
                this.x + this.width / 2 - explosionSize / 2,
                this.y + this.height / 2 - explosionSize / 2,
                explosionSize,
                explosionSize
            )
        } else {
            // Get and draw obstacle sprite with variant
            const obstacleSprite = getSprite(
                'obstacle',
                this.variant,
                timestamp
            )
            this.ctx.drawImage(
                obstacleSprite,
                this.x,
                this.y,
                this.width,
                this.height
            )
        }
    }

    // Method which causes the obstacles to move across the screen consistently
    update(timestamp, score) {
        // On first update, initialize the time
        if (this.lastUpdateTime === 0) {
            this.lastUpdateTime = timestamp
            return
        }

        // Calculate time-based movement for consistent speed across devices
        const deltaTime = (timestamp - this.lastUpdateTime) / 16.67 // Normalize to ~60fps
        this.lastUpdateTime = timestamp

        // If colliding, advance explosion animation but don't move
        if (this.isColliding) {
            // Advance explosion animation
            if (timestamp % 5 === 0) {
                this.explosionFrame++
            }

            // Reset obstacle after explosion finishes
            if (this.explosionFrame > 4) {
                this.resetObstacle()
            }
        } else {
            // Update speed based on score (increases difficulty)
            // Scale the speed based on canvas size
            this.speed = (this.baseSpeed + score / 10) * SCALE_FACTOR

            // Move the obstacle
            if (this.x < this.canvas.width) {
                // Use deltaTime for frame-rate independent movement
                this.x += this.speed * deltaTime
            } else {
                // Reset position when off screen
                this.resetObstacle()
            }
        }

        this.draw(timestamp)
    }

    // Check if this obstacle overlaps with another
    checkOverlap(otherObstacle) {
        // Add a small buffer to prevent obstacles from being too close
        const buffer = 5 * SCALE_FACTOR

        // Check horizontal overlap
        const horizontalOverlap =
            this.x < otherObstacle.x + otherObstacle.width + buffer &&
            this.x + this.width + buffer > otherObstacle.x

        // Check vertical overlap
        const verticalOverlap =
            this.y < otherObstacle.y + otherObstacle.height + buffer &&
            this.y + this.height + buffer > otherObstacle.y

        // Both overlaps must be true for obstacles to overlap
        return horizontalOverlap && verticalOverlap
    }

    // Check if obstacle is too close to player spawn area
    isTooCloseToPlayerSpawn() {
        // Player spawn position is at the horizontal center, near the bottom
        const playerSpawnX = this.canvas.width / 2
        const playerSpawnY = this.canvas.height - 70 * SCALE_FACTOR

        // Safe zone around player spawn (larger than the player)
        const safeZoneWidth = 100 * SCALE_FACTOR
        const safeZoneHeight = 100 * SCALE_FACTOR

        // Calculate boundaries of the safe zone
        const safeLeft = playerSpawnX - safeZoneWidth / 2
        const safeRight = playerSpawnX + safeZoneWidth / 2
        const safeTop = playerSpawnY - safeZoneHeight / 2
        const safeBottom = playerSpawnY + safeZoneHeight / 2

        // Check if obstacle is within the safe zone
        return (
            this.x < safeRight &&
            this.x + this.width > safeLeft &&
            this.y < safeBottom &&
            this.y + this.height > safeTop
        )
    }

    // Reset obstacle position and properties
    resetObstacle(obstacles = []) {
        // Update width based on current scale factor
        this.width = this.baseWidth * SCALE_FACTOR
        
        // Reset position offscreen
        this.x = -this.width

        // Generate a valid non-overlapping position
        let attempts = 0
        let validPosition = false

        while (!validPosition && attempts < 10) {
            // Randomize the y position for variety
            this.y = randomIntFromInterval(20 * SCALE_FACTOR, this.canvas.height - 50 * SCALE_FACTOR)

            // Check for overlap with other obstacles and player spawn area
            validPosition = true

            // Check if obstacle is too close to player spawn area
            if (this.isTooCloseToPlayerSpawn()) {
                validPosition = false
            } else {
                // Check for overlap with other obstacles
                for (const obstacle of obstacles) {
                    // Skip checking against self
                    if (obstacle === this) continue

                    // If there's overlap, try again
                    if (this.checkOverlap(obstacle)) {
                        validPosition = false
                        break
                    }
                }
            }

            attempts++
        }

        // Randomize variant for visual diversity
        this.variant = randomIntFromInterval(0, 2)
        // Recalculate height in case canvas was resized
        this.calculateHeight()
        // Reset collision state
        this.isColliding = false
        this.explosionFrame = 0
    }

    // Collision detection with player
    detectCollision(player) {
        // Use reduced hitbox for better gameplay experience
        const hitboxReduction = 0.2 // 20% reduction

        // Player hitbox
        const pLeft = player.x + player.width * hitboxReduction
        const pRight = player.x + player.width * (1 - hitboxReduction)
        const pTop = player.y + player.height * hitboxReduction
        const pBottom = player.y + player.height * (1 - hitboxReduction)

        // Obstacle hitbox
        const oLeft = this.x + this.width * hitboxReduction
        const oRight = this.x + this.width * (1 - hitboxReduction)
        const oTop = this.y + this.height * hitboxReduction
        const oBottom = this.y + this.height * (1 - hitboxReduction)

        // Check if hitboxes overlap
        const colliding =
            oLeft < pRight && oRight > pLeft && oTop < pBottom && oBottom > pTop

        // Visual feedback for debugging
        if (window.DEBUG_COLLISIONS) {
            // Draw hitboxes for debugging
            const ctx = this.canvas.getContext('2d')
            ctx.strokeStyle = colliding ? 'red' : 'lime'
            ctx.lineWidth = 2

            // Player hitbox
            ctx.strokeRect(
                pLeft,
                pTop,
                player.width * (1 - 2 * hitboxReduction),
                player.height * (1 - 2 * hitboxReduction)
            )

            // Obstacle hitbox
            ctx.strokeRect(
                oLeft,
                oTop,
                this.width * (1 - 2 * hitboxReduction),
                this.height * (1 - 2 * hitboxReduction)
            )
        }

        // Set collision state (for explosion animation)
        if (colliding && !this.isColliding) {
            this.isColliding = true
            this.explosionFrame = 0
        }

        return colliding
    }
}
