/**
 * Simple demo to test projectile shooting functionality
 * This demonstrates how close we are to having working projectile shooting
 */
import Player from './entities/Player';
import Projectile from './entities/Projectile';
import ProjectileManager from './managers/ProjectileManager';
import InputManager from './managers/InputManager';
import { KEYS } from './constants/gameConstants';

export class ProjectileDemo {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private player: Player;
    private projectileManager: ProjectileManager;
    private inputManager: InputManager;
    private animationId: number = 0;
    private lastTime: number = 0;

    constructor() {
        // Create canvas for demo
        this.canvas = document.createElement('canvas');
        this.canvas.width = 800;
        this.canvas.height = 600;
        this.canvas.style.border = '2px solid #00ffff';
        this.canvas.style.background = '#0a192f';
        this.ctx = this.canvas.getContext('2d')!;

        // Add to page
        document.body.appendChild(this.canvas);
        
        // Create demo title
        const title = document.createElement('h2');
        title.textContent = 'Projectile Shooting Demo - Press SPACEBAR to shoot!';
        title.style.color = '#00ffff';
        title.style.textAlign = 'center';
        document.body.insertBefore(title, this.canvas);

        // Initialize components
        this.player = new Player(this.canvas);
        this.projectileManager = new ProjectileManager({ canvas: this.canvas });
        // Convert readonly KEYS to mutable format for InputManager
        const mutableKeys = {
            UP: [...KEYS.UP],
            DOWN: [...KEYS.DOWN],
            LEFT: [...KEYS.LEFT],
            RIGHT: [...KEYS.RIGHT],
            RESTART: [...KEYS.RESTART],
            SHOOT: [...KEYS.SHOOT]
        };
        this.inputManager = new InputManager({ keyMappings: mutableKeys });

        // Initialize systems
        this.projectileManager.initialize();
        this.player.resetPosition();

        // Start demo
        this.start();
    }

    start(): void {
        this.lastTime = performance.now();
        this.gameLoop();
    }

    private gameLoop = (): void => {
        const currentTime = performance.now();
        const deltaTime = Math.min((currentTime - this.lastTime) / 1000, 0.016); // Cap at 60fps
        this.lastTime = currentTime;

        // Handle input
        this.handleInput();

        // Update
        this.update(deltaTime);

        // Render
        this.render();

        // Continue loop
        this.animationId = requestAnimationFrame(this.gameLoop);
    };

    private handleInput(): void {
        const inputState = this.inputManager.getInputState();
        
        // Update player movement
        this.player.updateFromInputState(inputState);
        this.player.move();

        // Handle shooting
        if (this.inputManager.isShootPressed() && this.projectileManager.canShoot()) {
            // Calculate projectile spawn position (from player center)
            const spawnX = this.player.x + this.player.width / 2;
            const spawnY = this.player.y;
            
            // Create projectile
            const created = this.projectileManager.createProjectile(spawnX, spawnY);
            if (created) {
                console.log('Projectile fired!');
            }
        }
    }

    private update(deltaTime: number): void {
        // Update projectiles
        this.projectileManager.update(deltaTime);

        // Demo collision with screen boundaries (projectiles hit top of screen)
        const projectiles = this.projectileManager.getProjectiles();
        for (const projectile of projectiles) {
            if (projectile.y < 50) { // Hit top area
                projectile.deactivate();
                console.log('Projectile hit target!');
            }
        }
    }

    private render(): void {
        // Clear canvas
        this.ctx.fillStyle = '#0a192f';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw target area at top
        this.ctx.fillStyle = 'rgba(255, 0, 0, 0.2)';
        this.ctx.fillRect(0, 0, this.canvas.width, 50);
        this.ctx.fillStyle = '#ff0000';
        this.ctx.font = '16px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('TARGET AREA', this.canvas.width / 2, 30);

        // Draw player
        this.player.draw();

        // Draw projectiles
        this.projectileManager.draw();

        // Draw instructions
        this.ctx.fillStyle = '#00ffff';
        this.ctx.font = '14px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText('WASD/Arrow Keys: Move', 10, this.canvas.height - 60);
        this.ctx.fillText('SPACEBAR: Shoot', 10, this.canvas.height - 40);
        
        // Draw stats
        const stats = this.projectileManager.getStats();
        this.ctx.fillText(`Active Projectiles: ${stats.active}`, 10, this.canvas.height - 20);
        this.ctx.fillText(`Can Shoot: ${stats.canShoot ? 'Yes' : 'No'}`, 200, this.canvas.height - 20);
    }

    stop(): void {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        this.inputManager.dispose();
    }
}

// Auto-start demo when loaded
if (typeof window !== 'undefined') {
    window.addEventListener('load', () => {
        // Clear body content for demo
        document.body.innerHTML = '';
        document.body.style.margin = '0';
        document.body.style.padding = '20px';
        document.body.style.backgroundColor = '#000';
        document.body.style.fontFamily = 'Arial, sans-serif';
        
        // Start demo
        const demo = new ProjectileDemo();
        
        // Add stop button
        const stopBtn = document.createElement('button');
        stopBtn.textContent = 'Stop Demo';
        stopBtn.style.padding = '10px 20px';
        stopBtn.style.margin = '20px auto';
        stopBtn.style.display = 'block';
        stopBtn.style.fontSize = '16px';
        stopBtn.onclick = () => {
            demo.stop();
            document.body.innerHTML = '<h1 style="color: #00ffff; text-align: center;">Demo Stopped</h1>';
        };
        document.body.appendChild(stopBtn);
    });
}
