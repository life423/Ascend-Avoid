/**
 * Obstacle entity class for the game.
 * Handles obstacle movement, collision detection, and rendering.
 * Now with TypeScript support.
 */
import { GameObject } from '../types';
// Updated import path to match the new structure
import { OBSTACLE } from '../constants/gameConstants';
import { randomIntFromInterval, SCALE_FACTOR, BASE_CANVAS_WIDTH, BASE_CANVAS_HEIGHT } from '../utils/utils';
import { getSprite } from '../js/sprites';

export default class Obstacle implements GameObject {
    // Canvas related properties
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    
    // Position and dimensions
    x: number;
    y: number;
    width: number;
    height: number;
    private baseX: number;
    private baseY: number;
    private baseWidth: number;
    
    // Movement properties
    private baseSpeed: number;
    private speed: number;
    private lastUpdateTime: number;
    
    // Visual properties
    private variant: number;
    
    // Collision state
    private isColliding: boolean;
    private explosionFrame: number;
    
    /**
     * Create a new obstacle
     * @param x - Initial x position
     * @param y - Initial y position
     * @param width - Width of the obstacle
     * @param canvas - The game canvas
     */
    constructor(x: number, y: number, width: number, canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d')!;
        
        // Store base dimensions (unscaled)
        this.baseX = x;
        this.baseY = y;
        this.baseWidth = width;
        
        // Apply scaling for actual dimensions
        this.x = x * SCALE_FACTOR;
        this.y = y * SCALE_FACTOR;
        this.width = width * SCALE_FACTOR;

        // Calculate height based on canvas dimensions
        this.height = 0; // Will be set in calculateHeight
        this.calculateHeight();

        // Speed is scaled based on the canvas size
        this.baseSpeed = OBSTACLE.BASE_SPEED;
        this.speed = this.baseSpeed * SCALE_FACTOR;
        this.lastUpdateTime = 0;

        // Random variant for visual diversity (0-2)
        this.variant = randomIntFromInterval(0, 2);

        // Collision state
        this.isColliding = false;
        this.explosionFrame = 0;
    }

    /**
     * Recalculate height based on canvas dimensions
     */
    calculateHeight(): void {
        // Base height calculation
        const baseHeight = Math.max(BASE_CANVAS_HEIGHT * 0.04, 20);
        // Scale the height
        this.height = baseHeight * SCALE_FACTOR;
    }

    /**
     * Draw the obstacle
     * @param timestamp - Current timestamp for animation
     */
    draw(timestamp: number = 0): void {
        if (this.isColliding) {
            // Draw explosion when colliding
            const explosionSprite = getSprite('explosion', this.explosionFrame);
            // Center explosion on obstacle
            const explosionSize = Math.max(this.width, this.height) * 1.5;
            this.ctx.drawImage(
                explosionSprite,
                this.x + this.width / 2 - explosionSize / 2,
                this.y + this.height / 2 - explosionSize / 2,
                explosionSize,
                explosionSize
            );
        } else {
            // Get and draw obstacle sprite with variant
            const obstacleSprite = getSprite(
                'obstacle',
                this.variant,
                timestamp
            );
            this.ctx.drawImage(
                obstacleSprite,
                this.x,
                this.y,
                this.width,
                this.height
            );
        }
    }

    /**
     * Update obstacle position and state
     * @param timestamp - Current timestamp
     * @param score - Current game score (affects speed)
     * @param scalingInfo - Optional scaling information (not used in this implementation)
     */
    update(timestamp: number, score: number, scalingInfo?: any): void {
        // On first update, initialize the time
        if (this.lastUpdateTime === 0) {
            this.lastUpdateTime = timestamp;
            return;
        }

        // Calculate time-based movement for consistent speed across devices
        const deltaTime = (timestamp - this.lastUpdateTime) / 16.67; // Normalize to ~60fps
        this.lastUpdateTime = timestamp;

        // If colliding, advance explosion animation but don't move
        if (this.isColliding) {
            // Advance explosion animation
            if (timestamp % 5 === 0) {
                this.explosionFrame++;
            }

            // Reset obstacle after explosion finishes
            if (this.explosionFrame > 4) {
                this.resetObstacle();
            }
        } else {
            // Update speed based on score (increases difficulty)
            // Scale the speed based on canvas size
            this.speed = (this.baseSpeed + score / 10) * SCALE_FACTOR;

            // Move the obstacle
            if (this.x < this.canvas.width) {
                // Use deltaTime for frame-rate independent movement
                this.x += this.speed * deltaTime;
            } else {
                // Reset position when off screen
                this.resetObstacle();
            }
        }

        this.draw(timestamp);
    }

    /**
     * Check if this obstacle overlaps with another
     * @param otherObstacle - The obstacle to check against
     * @returns Whether the obstacles overlap
     */
    checkOverlap(otherObstacle: Obstacle): boolean {
        // Add a small buffer to prevent obstacles from being too close
        const buffer = 5 * SCALE_FACTOR;

        // Check horizontal overlap
        const horizontalOverlap =
            this.x < otherObstacle.x + otherObstacle.width + buffer &&
            this.x + this.width + buffer > otherObstacle.x;

        // Check vertical overlap
        const verticalOverlap =
            this.y < otherObstacle.y + otherObstacle.height + buffer &&
            this.y + this.height + buffer > otherObstacle.y;

        // Both overlaps must be true for obstacles to overlap
        return horizontalOverlap && verticalOverlap;
    }

    /**
     * Check if obstacle is too close to player spawn area
     * @returns Whether the obstacle is too close to the player spawn area
     */
    private isTooCloseToPlayerSpawn(): boolean {
        // Player spawn position is at the horizontal center, near the bottom
        const playerSpawnX = this.canvas.width / 2;
        const playerSpawnY = this.canvas.height - 70 * SCALE_FACTOR;

        // Safe zone around player spawn (larger than the player)
        const safeZoneWidth = 100 * SCALE_FACTOR;
        const safeZoneHeight = 100 * SCALE_FACTOR;

        // Calculate boundaries of the safe zone
        const safeLeft = playerSpawnX - safeZoneWidth / 2;
        const safeRight = playerSpawnX + safeZoneWidth / 2;
        const safeTop = playerSpawnY - safeZoneHeight / 2;
        const safeBottom = playerSpawnY + safeZoneHeight / 2;

        // Check if obstacle is within the safe zone
        return (
            this.x < safeRight &&
            this.x + this.width > safeLeft &&
            this.y < safeBottom &&
            this.y + this.height > safeTop
        );
    }

    /**
     * Reset obstacle position and properties
     * @param obstacles - Optional array of other obstacles to check for overlap
     */
    resetObstacle(obstacles: Obstacle[] = []): void {
        // Update width based on current scale factor
        this.width = this.baseWidth * SCALE_FACTOR;
        
        // Reset position offscreen
        this.x = -this.width;

        // Generate a valid non-overlapping position
        let attempts = 0;
        let validPosition = false;

        while (!validPosition && attempts < 10) {
            // Randomize the y position for variety
            this.y = randomIntFromInterval(20 * SCALE_FACTOR, this.canvas.height - 50 * SCALE_FACTOR);

            // Check for overlap with other obstacles and player spawn area
            validPosition = true;

            // Check if obstacle is too close to player spawn area
            if (this.isTooCloseToPlayerSpawn()) {
                validPosition = false;
            } else {
                // Check for overlap with other obstacles
                for (const obstacle of obstacles) {
                    // Skip checking against self
                    if (obstacle === this) continue;

                    // If there's overlap, try again
                    if (this.checkOverlap(obstacle)) {
                        validPosition = false;
                        break;
                    }
                }
            }

            attempts++;
        }

        // Randomize variant for visual diversity
        this.variant = randomIntFromInterval(0, 2);
        // Recalculate height in case canvas was resized
        this.calculateHeight();
        // Reset collision state
        this.isColliding = false;
        this.explosionFrame = 0;
    }

    /**
     * Collision detection with player
     * @param player - The player object to check against
     * @param deltaTime - Optional time since last frame for continuous detection
     * @returns Whether the player is colliding with this obstacle
     */
    detectCollision(player: GameObject, deltaTime?: number): boolean {
        // Reduced hitbox for better gameplay experience but not too small
        // Reduced from 20% to 10% for more accurate collisions
        const hitboxReduction = 0.1; // 10% reduction

        // Player hitbox
        const pLeft = player.x + player.width * hitboxReduction;
        const pRight = player.x + player.width * (1 - hitboxReduction);
        const pTop = player.y + player.height * hitboxReduction;
        const pBottom = player.y + player.height * (1 - hitboxReduction);

        // Obstacle hitbox
        const oLeft = this.x + this.width * hitboxReduction;
        const oRight = this.x + this.width * (1 - hitboxReduction);
        const oTop = this.y + this.height * hitboxReduction;
        const oBottom = this.y + this.height * (1 - hitboxReduction);

        // Check if hitboxes overlap
        const colliding =
            oLeft < pRight && oRight > pLeft && oTop < pBottom && oBottom > pTop;
            
        // Additional check for near misses to improve collision detection for fast movements
        let nearMiss = false;
        const proximityThreshold = 5; // pixels
        
        // Consider it a near miss if objects are within proximityThreshold pixels
        if (!colliding && deltaTime) {
            nearMiss = 
                oLeft - proximityThreshold < pRight && 
                oRight + proximityThreshold > pLeft && 
                oTop - proximityThreshold < pBottom && 
                oBottom + proximityThreshold > pTop;
                
            // If moving quickly, do continuous collision check (avoid tunneling)
            if (nearMiss && this.speed * deltaTime > proximityThreshold) {
                // Approximate previous positions
                const prevPlayerX = player.x - ((player as any).vx || 0) * deltaTime;
                const prevPlayerY = player.y - ((player as any).vy || 0) * deltaTime;
                const prevObstacleX = this.x - this.speed * deltaTime;
                
                // Check if paths crossed
                const pathsCrossed = 
                    (prevPlayerX + player.width > prevObstacleX) && 
                    (prevPlayerX < prevObstacleX + this.width) &&
                    (prevPlayerY + player.height > this.y) && 
                    (prevPlayerY < this.y + this.height);
                    
                if (pathsCrossed) {
                    console.log('Continuous collision detected (prevented tunneling)');
                    return true;
                }
            }
        }

        // Visual feedback for debugging - always show for now to help diagnose issues
        const debugCollisions = true; // Set to true for easier debugging or (window as any).DEBUG_COLLISIONS;
        if (debugCollisions) {
            // Draw hitboxes for debugging
            const ctx = this.canvas.getContext('2d')!;
            
            // Determine color based on collision state
            if (colliding) {
                ctx.strokeStyle = 'red';  // Collision
            } else if (nearMiss) {
                ctx.strokeStyle = 'yellow';  // Near miss
            } else {
                ctx.strokeStyle = 'lime';  // No collision
            }
            
            ctx.lineWidth = 2;

            // Player hitbox
            ctx.strokeRect(
                pLeft,
                pTop,
                player.width * (1 - 2 * hitboxReduction),
                player.height * (1 - 2 * hitboxReduction)
            );

            // Obstacle hitbox
            ctx.strokeRect(
                oLeft,
                oTop,
                this.width * (1 - 2 * hitboxReduction),
                this.height * (1 - 2 * hitboxReduction)
            );
            
            // Draw connecting line for near misses
            if (nearMiss) {
                ctx.beginPath();
                ctx.moveTo(pLeft + player.width/2, pTop + player.height/2);
                ctx.lineTo(oLeft + this.width/2, oTop + this.height/2);
                ctx.strokeStyle = 'rgba(255, 255, 0, 0.5)';
                ctx.stroke();
            }
        }

        // Set collision state (for explosion animation)
        if (colliding && !this.isColliding) {
            this.isColliding = true;
            this.explosionFrame = 0;
        }

        return colliding;
    }
    
    /**
     * Render the obstacle - alias for draw to fit GameObject interface
     * @param ctx - Canvas rendering context
     * @param timestamp - Current animation timestamp
     */
    render(ctx: CanvasRenderingContext2D, timestamp?: number): void {
        this.draw(timestamp);
    }
    
    /**
     * Reset method to satisfy the GameObject interface
     */
    reset(): void {
        this.resetObstacle();
    }
}
