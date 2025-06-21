/**
 * Enhanced ProjectileDemo with comprehensive debugging
 * This version includes extensive logging to identify shooting issues
 */
import Player from './entities/Player';
import Projectile from './entities/Projectile';
import ProjectileManager from './managers/ProjectileManager';
import InputManager from './managers/InputManager';
import { KEYS, PROJECTILE } from './constants/gameConstants';
import { resizeCanvas, SCALE_FACTOR } from './utils/utils';

export class DebugProjectileDemo {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private player: Player;
    private projectileManager: ProjectileManager;
    private inputManager: InputManager;
    private animationId: number = 0;
    private lastTime: number = 0;
    private debugInfo: HTMLDivElement;

    constructor() {
        console.log('=== STARTING PROJECTILE DEBUG DEMO ===');
        
        // Create canvas for demo
        this.canvas = document.createElement('canvas');
        this.canvas.width = 800;
        this.canvas.height = 600;
        this.canvas.style.border = '2px solid #00ffff';
        this.canvas.style.background = '#0a192f';
        this.canvas.tabIndex = 0; // Make focusable
        this.ctx = this.canvas.getContext('2d')!;

        // Add click handler for focus
        this.canvas.addEventListener('click', () => {
            this.canvas.focus();
            console.log('Canvas focused');
        });

        // Add to page
        document.body.appendChild(this.canvas);
        
        // Create demo title
        const title = document.createElement('h2');
        title.textContent = 'DEBUG: Projectile Shooting Demo - Press SPACEBAR to shoot!';
        title.style.color = '#00ffff';
        title.style.textAlign = 'center';
        document.body.insertBefore(title, this.canvas);

        // Create debug info panel
        this.debugInfo = document.createElement('div');
        this.debugInfo.style.cssText = `
            position: fixed; top: 10px; right: 10px; 
            background: rgba(0,0,0,0.8); color: #00ffff; 
            padding: 10px; border-radius: 5px; 
            font-family: monospace; font-size: 12px;
            min-width: 250px; z-index: 1000;
        `;
        document.body.appendChild(this.debugInfo);

        // Initialize scaling
        console.log('Before resize - SCALE_FACTOR:', SCALE_FACTOR);
        resizeCanvas(this.canvas);
        console.log('After resize - SCALE_FACTOR:', SCALE_FACTOR);

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
        
        console.log('Shoot keys configured:', mutableKeys.SHOOT);
        this.inputManager = new InputManager({ keyMappings: mutableKeys });

        // Initialize systems
        this.projectileManager.initialize();
        this.player.resetPosition();

        // Add keyboard debug listener
        document.addEventListener('keydown', (e) => {
            console.log('Global keydown detected:', e.key, e.keyCode);
        });

        // Focus canvas initially
        this.canvas.focus();

        // Start demo
        this.start();
    }

    start(): void {
        console.log('Demo started');
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

        // Update debug info
        this.updateDebugInfo();

        // Continue loop
        this.animationId = requestAnimationFrame(this.gameLoop);
    };

    private handleInput(): void {
        const inputState = this.inputManager.getInputState();
        const isShootPressed = this.inputManager.isShootPressed();
        const canShoot = this.projectileManager.canShoot();
        
        // Update player movement
        this.player.updateFromInputState(inputState);
        this.player.move();

        // Handle shooting with comprehensive debugging
        if (isShootPressed) {
            console.log('🔫 SHOOT KEY DETECTED!');
            console.log('- Can shoot:', canShoot);
            console.log('- Cooldown remaining:', this.projectileManager.getTimeUntilNextShot());
            
            if (canShoot) {
                // Calculate projectile spawn position (from player center)
                const spawnX = this.player.x + this.player.width / 2;
                const spawnY = this.player.y;
                
                console.log('- Spawn position:', { x: spawnX, y: spawnY });
                console.log('- Player position:', { x: this.player.x, y: this.player.y, w: this.player.width, h: this.player.height });
                console.log('- SCALE_FACTOR:', SCALE_FACTOR);
                console.log('- PROJECTILE constants:', PROJECTILE);
                
                // Create projectile
                const created = this.projectileManager.createProjectile(spawnX, spawnY);
                
                if (created) {
                    console.log('✅ Projectile fired successfully!');
                } else {
                    console.log('❌ Failed to create projectile');
                    console.log('- Manager stats:', this.projectileManager.getStats());
                }
            } else {
                console.log('⏱️ Cannot shoot - on cooldown');
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
                console.log('🎯 Projectile hit target!');
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
        this.ctx.fillText('WASD/Arrow Keys: Move', 10, this.canvas.height - 80);
        this.ctx.fillText('SPACEBAR: Shoot', 10, this.canvas.height - 60);
        this.ctx.fillText('Click canvas to focus', 10, this.canvas.height - 40);
        
        // Draw stats
        const stats = this.projectileManager.getStats();
        this.ctx.fillText(`Active Projectiles: ${stats.active}`, 10, this.canvas.height - 20);
    }

    private updateDebugInfo(): void {
        const stats = this.projectileManager.getStats();
        const inputState = this.inputManager.getInputState();
        const isShootPressed = this.inputManager.isShootPressed();
        
        this.debugInfo.innerHTML = `
            <h4>🐛 DEBUG INFO</h4>
            <strong>Input:</strong><br>
            Shoot Pressed: ${isShootPressed}<br>
            Keys: ${JSON.stringify(inputState)}<br><br>
            
            <strong>Projectiles:</strong><br>
            Active: ${stats.active}<br>
            Total: ${stats.total}<br>
            Can Shoot: ${stats.canShoot}<br>
            Cooldown: ${stats.cooldownRemaining}ms<br><br>
            
            <strong>Player:</strong><br>
            Position: (${Math.round(this.player.x)}, ${Math.round(this.player.y)})<br>
            Size: ${Math.round(this.player.width)}x${Math.round(this.player.height)}<br><br>
            
            <strong>System:</strong><br>
            Scale Factor: ${SCALE_FACTOR.toFixed(2)}<br>
            Canvas: ${this.canvas.width}x${this.canvas.height}<br>
            Focused: ${document.activeElement === this.canvas}
        `;
    }

    stop(): void {
        console.log('Demo stopped');
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        this.inputManager.dispose();
        document.body.removeChild(this.debugInfo);
    }
}

// Auto-start debug demo when loaded
if (typeof window !== 'undefined') {
    window.addEventListener('load', () => {
        // Clear body content for demo
        document.body.innerHTML = '';
        document.body.style.margin = '0';
        document.body.style.padding = '20px';
        document.body.style.backgroundColor = '#000';
        document.body.style.fontFamily = 'Arial, sans-serif';
        
        // Start debug demo
        const demo = new DebugProjectileDemo();
        
        // Add stop button
        const stopBtn = document.createElement('button');
        stopBtn.textContent = 'Stop Debug Demo';
        stopBtn.style.cssText = `
            padding: 10px 20px; margin: 20px auto;
            display: block; fontSize: 16px;
            background: #ff0000; color: white; border: none;
            border-radius: 5px; cursor: pointer;
        `;
        stopBtn.onclick = () => {
            demo.stop();
            document.body.innerHTML = '<h1 style="color: #00ffff; text-align: center;">Debug Demo Stopped</h1>';
        };
        document.body.appendChild(stopBtn);
        
        // Add manual test button
        const testBtn = document.createElement('button');
        testBtn.textContent = 'Manual Projectile Test';
        testBtn.style.cssText = `
            padding: 10px 20px; margin: 10px auto;
            display: block; fontSize: 16px;
            background: #00ff00; color: black; border: none;
            border-radius: 5px; cursor: pointer;
        `;
        testBtn.onclick = () => {
            console.log('🧪 Manual test triggered');
            // Trigger shooting manually
            const created = demo['projectileManager'].createProjectile(400, 300);
            console.log('Manual projectile created:', created);
        };
        document.body.appendChild(testBtn);
    });
}
