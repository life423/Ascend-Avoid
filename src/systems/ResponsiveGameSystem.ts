/**
 * Responsive Game System
 * 
 * Orchestrates the advanced canvas and input systems to provide:
 * - Universal device compatibility (320px phones to 8K displays)
 * - Intelligent performance scaling
 * - Touch-first, gesture-enabled controls
 * - Seamless orientation handling
 * - Memory management and object pooling
 * - Real-time performance monitoring
 */

import AdvancedCanvasManager from '../managers/AdvancedCanvasManager'
import AdvancedInputManager from '../managers/AdvancedInputManager'
import { 
    DeviceCapabilities, 
    GameViewport, 
    QualitySettings, 
    TouchGesture,
    ResponsiveCanvasConfig,
    ScalingInfo
} from '../types'

interface ResponsiveGameConfig {
    canvas: {
        gameWidth: number
        gameHeight: number
        enableDPR: boolean
        enableAntialiasing: boolean
        debug: boolean
    }
    performance: {
        enableAdaptiveQuality: boolean
        targetFPS: number
        enableObjectPooling: boolean
        enableBatchRendering: boolean
    }
    input: {
        enableGestures: boolean
        enableHaptics: boolean
        swipeThreshold?: number
    }
    debug: {
        showPerformanceOverlay: boolean
        logDeviceInfo: boolean
        enableMetrics: boolean
    }
}

interface PerformanceMetrics {
    fps: number
    frameTime: number
    memoryUsage: number
    renderCalls: number
    objectCount: number
    activeParticles: number
}

interface ObjectPool<T> {
    available: T[]
    inUse: Set<T>
    createFn: () => T
    resetFn: (obj: T) => void
    maxSize: number
}

export default class ResponsiveGameSystem {
    private canvas: HTMLCanvasElement
    private canvasManager: AdvancedCanvasManager
    private inputManager: AdvancedInputManager
    private config: ResponsiveGameConfig
    private capabilities: DeviceCapabilities
    private isInitialized: boolean = false
    
    // Performance monitoring
    private performanceMetrics: PerformanceMetrics
    private metricsHistory: PerformanceMetrics[] = []
    private lastMetricsUpdate: number = 0
    private metricsUpdateInterval: number = 1000 // Update every second
    
    // Object pooling
    private objectPools: Map<string, ObjectPool<any>> = new Map()
    
    // Event callbacks
    private onResize?: (viewport: GameViewport) => void
    private onQualityChange?: (quality: QualitySettings) => void
    private onInputChange?: (inputState: any) => void
    private onGesture?: (gesture: TouchGesture) => void
    private onPerformanceChange?: (metrics: PerformanceMetrics) => void
    
    // Debug overlay
    private debugOverlay?: HTMLDivElement

    constructor(canvas: HTMLCanvasElement, config: Partial<ResponsiveGameConfig> = {}) {
        this.canvas = canvas
        
        // Default configuration
        this.config = {
            canvas: {
                gameWidth: 400,
                gameHeight: 600,
                enableDPR: true,
                enableAntialiasing: true,
                debug: false,
                ...config.canvas
            },
            performance: {
                enableAdaptiveQuality: true,
                targetFPS: 60,
                enableObjectPooling: true,
                enableBatchRendering: true,
                ...config.performance
            },
            input: {
                enableGestures: true,
                enableHaptics: true,
                swipeThreshold: 30,
                ...config.input
            },
            debug: {
                showPerformanceOverlay: false,
                logDeviceInfo: true,
                enableMetrics: true,
                ...config.debug
            }
        }
        
        // Initialize performance metrics
        this.performanceMetrics = {
            fps: 60,
            frameTime: 16.67,
            memoryUsage: 0,
            renderCalls: 0,
            objectCount: 0,
            activeParticles: 0
        }
        
        // Will be initialized in init()
        this.canvasManager = null!
        this.inputManager = null!
        this.capabilities = null!
    }

    /**
     * Initialize the responsive game system
     */
    public async initialize(): Promise<void> {
        console.log('ResponsiveGameSystem: Initializing...')
        
        try {
            // Initialize canvas manager
            const canvasConfig: Partial<ResponsiveCanvasConfig> = {
                gameWidth: this.config.canvas.gameWidth,
                gameHeight: this.config.canvas.gameHeight,
                enableDPR: this.config.canvas.enableDPR,
                enableAntialiasing: this.config.canvas.enableAntialiasing,
                debug: this.config.canvas.debug,
                maintainAspectRatio: true,
                allowUpscaling: true,
                allowDownscaling: true,
                centerCanvas: true,
                quality: 'auto'
            }
            
            this.canvasManager = new AdvancedCanvasManager(this.canvas, canvasConfig)
            
            // Wait for canvas manager to initialize and get capabilities
            await new Promise(resolve => setTimeout(resolve, 100)) // Allow initialization to complete
            this.capabilities = this.canvasManager.getCapabilities()
            
            // Initialize input manager with coordinate transformation
            const coordinateTransform = this.canvasManager.getCoordinateTransform()
            this.inputManager = new AdvancedInputManager(
                this.canvas,
                this.capabilities,
                coordinateTransform.screenToGame
            )
            
            // Setup callbacks
            this.setupCallbacks()
            
            // Initialize object pools if enabled
            if (this.config.performance.enableObjectPooling) {
                this.initializeObjectPools()
            }
            
            // Setup debug overlay if enabled
            if (this.config.debug.showPerformanceOverlay) {
                this.createDebugOverlay()
            }
            
            // Start performance monitoring
            if (this.config.debug.enableMetrics) {
                this.startPerformanceMonitoring()
            }
            
            // Log device information
            if (this.config.debug.logDeviceInfo) {
                this.logDeviceInformation()
            }
            
            this.isInitialized = true
            console.log('ResponsiveGameSystem: Initialization complete')
            
        } catch (error) {
            console.error('ResponsiveGameSystem: Initialization failed:', error)
            throw error
        }
    }

    /**
     * Setup event callbacks and bindings
     */
    private setupCallbacks(): void {
        // Input change callback
        this.inputManager.setInputChangeCallback((inputState) => {
            if (this.onInputChange) {
                this.onInputChange(inputState)
            }
        })
        
        // Gesture callback
        this.inputManager.setGestureCallback((gesture) => {
            if (this.onGesture) {
                this.onGesture(gesture)
            }
            
            // Log gestures in debug mode
            if (this.config.debug.logDeviceInfo) {
                console.log('Gesture detected:', gesture.type, gesture.direction || '')
            }
        })
    }

    /**
     * Initialize object pools for common game objects
     */
    private initializeObjectPools(): void {
        // Particle pool
        this.createObjectPool('particles', 
            () => ({ x: 0, y: 0, vx: 0, vy: 0, life: 0, maxLife: 0, size: 0, color: '#fff', active: false }),
            (particle) => { particle.active = false; particle.life = 0 },
            200
        )
        
        // Bullet/projectile pool
        this.createObjectPool('projectiles',
            () => ({ x: 0, y: 0, vx: 0, vy: 0, width: 0, height: 0, active: false }),
            (projectile) => { projectile.active = false },
            50
        )
        
        // Effect pool
        this.createObjectPool('effects',
            () => ({ x: 0, y: 0, scale: 1, alpha: 1, rotation: 0, active: false }),
            (effect) => { effect.active = false; effect.alpha = 1; effect.scale = 1; effect.rotation = 0 },
            30
        )
        
        console.log('ResponsiveGameSystem: Object pools initialized')
    }

    /**
     * Create an object pool
     */
    public createObjectPool<T>(
        name: string, 
        createFn: () => T, 
        resetFn: (obj: T) => void, 
        maxSize: number = 100
    ): void {
        const pool: ObjectPool<T> = {
            available: [],
            inUse: new Set(),
            createFn,
            resetFn,
            maxSize
        }
        
        // Pre-populate with some objects
        const initialSize = Math.min(10, maxSize)
        for (let i = 0; i < initialSize; i++) {
            pool.available.push(createFn())
        }
        
        this.objectPools.set(name, pool)
    }

    /**
     * Get object from pool
     */
    public getFromPool<T>(poolName: string): T | null {
        const pool = this.objectPools.get(poolName) as ObjectPool<T>
        if (!pool) return null
        
        let obj = pool.available.pop()
        if (!obj && pool.inUse.size < pool.maxSize) {
            obj = pool.createFn()
        }
        
        if (obj) {
            pool.inUse.add(obj)
        }
        
        return obj || null
    }

    /**
     * Return object to pool
     */
    public returnToPool<T>(poolName: string, obj: T): void {
        const pool = this.objectPools.get(poolName) as ObjectPool<T>
        if (!pool || !pool.inUse.has(obj)) return
        
        pool.resetFn(obj)
        pool.inUse.delete(obj)
        
        if (pool.available.length < pool.maxSize) {
            pool.available.push(obj)
        }
    }

    /**
     * Start performance monitoring
     */
    private startPerformanceMonitoring(): void {
        const updateMetrics = () => {
            const now = performance.now()
            if (now - this.lastMetricsUpdate > this.metricsUpdateInterval) {
                this.updatePerformanceMetrics()
                this.lastMetricsUpdate = now
            }
            
            if (this.isInitialized) {
                requestAnimationFrame(updateMetrics)
            }
        }
        
        updateMetrics()
    }

    /**
     * Update performance metrics
     */
    private updatePerformanceMetrics(): void {
        // Get memory usage if available
        let memoryUsage = 0
        if ('memory' in performance) {
            const memory = (performance as any).memory
            memoryUsage = memory.usedJSHeapSize / (1024 * 1024) // MB
        }
        
        // Calculate object counts
        let totalPooledObjects = 0
        for (const pool of this.objectPools.values()) {
            totalPooledObjects += pool.inUse.size
        }
        
        this.performanceMetrics = {
            fps: this.calculateFPS(),
            frameTime: this.calculateFrameTime(),
            memoryUsage,
            renderCalls: this.performanceMetrics.renderCalls, // Updated externally
            objectCount: totalPooledObjects,
            activeParticles: this.getActiveParticleCount()
        }
        
        // Store in history
        this.metricsHistory.push({ ...this.performanceMetrics })
        if (this.metricsHistory.length > 60) { // Keep last 60 seconds
            this.metricsHistory.shift()
        }
        
        // Update debug overlay
        if (this.debugOverlay) {
            this.updateDebugOverlay()
        }
        
        // Notify performance change callback
        if (this.onPerformanceChange) {
            this.onPerformanceChange(this.performanceMetrics)
        }
        
        // Adaptive quality adjustment
        if (this.config.performance.enableAdaptiveQuality) {
            this.adjustQualityBasedOnPerformance()
        }
    }

    /**
     * Calculate current FPS
     */
    private calculateFPS(): number {
        // This would be updated by the game loop
        return this.performanceMetrics.fps
    }

    /**
     * Calculate current frame time
     */
    private calculateFrameTime(): number {
        return 1000 / this.performanceMetrics.fps
    }

    /**
     * Get active particle count
     */
    private getActiveParticleCount(): number {
        const particlePool = this.objectPools.get('particles')
        return particlePool ? particlePool.inUse.size : 0
    }

    /**
     * Adjust quality based on performance
     */
    private adjustQualityBasedOnPerformance(): void {
        const { fps, memoryUsage } = this.performanceMetrics
        const targetFPS = this.config.performance.targetFPS
        const currentQuality = this.canvasManager.getQuality()
        
        let newQuality = { ...currentQuality }
        let changed = false
        
        // Reduce quality if FPS is too low
        if (fps < targetFPS * 0.8) {
            if (newQuality.particleCount > 20) {
                newQuality.particleCount = Math.max(20, newQuality.particleCount - 10)
                changed = true
            }
            
            if (newQuality.renderScale > 0.75) {
                newQuality.renderScale = Math.max(0.75, newQuality.renderScale - 0.1)
                changed = true
            }
            
            if (newQuality.effectsEnabled) {
                newQuality.effectsEnabled = false
                changed = true
            }
        }
        // Increase quality if performance is good
        else if (fps > targetFPS * 1.1 && memoryUsage < 100) {
            if (newQuality.particleCount < 200) {
                newQuality.particleCount = Math.min(200, newQuality.particleCount + 10)
                changed = true
            }
            
            if (newQuality.renderScale < 1.0) {
                newQuality.renderScale = Math.min(1.0, newQuality.renderScale + 0.1)
                changed = true
            }
            
            if (!newQuality.effectsEnabled && this.capabilities.performance.tier !== 'low') {
                newQuality.effectsEnabled = true
                changed = true
            }
        }
        
        if (changed) {
            this.canvasManager.setQuality(newQuality)
            if (this.onQualityChange) {
                this.onQualityChange(newQuality)
            }
            console.log('ResponsiveGameSystem: Quality adjusted for performance:', newQuality)
        }
    }

    /**
     * Create debug overlay
     */
    private createDebugOverlay(): void {
        this.debugOverlay = document.createElement('div')
        this.debugOverlay.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            background: rgba(0, 0, 0, 0.8);
            color: #00ff00;
            font-family: monospace;
            font-size: 12px;
            padding: 10px;
            border-radius: 5px;
            z-index: 10000;
            max-width: 250px;
            white-space: pre-line;
        `
        document.body.appendChild(this.debugOverlay)
    }

    /**
     * Update debug overlay content
     */
    private updateDebugOverlay(): void {
        if (!this.debugOverlay) return
        
        const { fps, frameTime, memoryUsage, objectCount, activeParticles } = this.performanceMetrics
        const quality = this.canvasManager.getQuality()
        const viewport = this.canvasManager.getViewport()
        
        this.debugOverlay.textContent = `
FPS: ${fps.toFixed(1)}
Frame: ${frameTime.toFixed(1)}ms
Memory: ${memoryUsage.toFixed(1)}MB
Objects: ${objectCount}
Particles: ${activeParticles}

Quality: ${quality.renderScale.toFixed(2)}x
Effects: ${quality.effectsEnabled ? 'ON' : 'OFF'}
Scale: ${viewport.scale.uniform.toFixed(2)}x
DPR: ${window.devicePixelRatio || 1}

Device: ${this.capabilities.performance.tier.toUpperCase()}
Input: ${Object.keys(this.capabilities.input).filter(k => this.capabilities.input[k as keyof typeof this.capabilities.input]).join(', ')}
        `.trim()
    }

    /**
     * Log comprehensive device information
     */
    private logDeviceInformation(): void {
        const info = {
            Screen: `${this.capabilities.screen.width}x${this.capabilities.screen.height} (${this.capabilities.screen.orientation})`,
            DPR: this.capabilities.screen.dpr,
            Performance: `${this.capabilities.performance.tier} (${this.capabilities.performance.cores} cores, ${this.capabilities.performance.memory}GB)`,
            GPU: this.capabilities.performance.gpu || 'Unknown',
            Input: Object.keys(this.capabilities.input).filter(k => this.capabilities.input[k as keyof typeof this.capabilities.input]),
            Features: Object.keys(this.capabilities.features).filter(k => this.capabilities.features[k as keyof typeof this.capabilities.features]),
            Battery: this.capabilities.battery ? `${(this.capabilities.battery.level * 100).toFixed(0)}% ${this.capabilities.battery.charging ? '(charging)' : ''}` : 'Unknown'
        }
        
        console.group('ResponsiveGameSystem: Device Information')
        Object.entries(info).forEach(([key, value]) => {
            console.log(`${key}:`, value)
        })
        console.groupEnd()
    }

    // Public API methods

    /**
     * Get current device capabilities
     */
    public getCapabilities(): DeviceCapabilities {
        return this.capabilities
    }

    /**
     * Get current viewport information
     */
    public getViewport(): GameViewport {
        return this.canvasManager.getViewport()
    }

    /**
     * Get current quality settings
     */
    public getQuality(): QualitySettings {
        return this.canvasManager.getQuality()
    }

    /**
     * Get current input state
     */
    public getInputState(): any {
        return this.inputManager.getInputState()
    }

    /**
     * Get canvas context
     */
    public getContext(): CanvasRenderingContext2D {
        return this.canvasManager.getContext()
    }

    /**
     * Get canvas element
     */
    public getCanvas(): HTMLCanvasElement {
        return this.canvas
    }

    /**
     * Get scaling information for backward compatibility
     */
    public getScalingInfo(): ScalingInfo {
        return this.canvasManager.getScalingInfo()
    }

    /**
     * Get coordinate transformation utilities
     */
    public getCoordinateTransform() {
        return this.canvasManager.getCoordinateTransform()
    }

    /**
     * Update FPS for performance monitoring
     */
    public updateFPS(fps: number): void {
        this.performanceMetrics.fps = fps
    }

    /**
     * Update render call count
     */
    public updateRenderCalls(count: number): void {
        this.performanceMetrics.renderCalls = count
    }

    /**
     * Force viewport update
     */
    public updateViewport(): void {
        this.canvasManager.updateViewport()
        if (this.onResize) {
            this.onResize(this.getViewport())
        }
    }

    /**
     * Set event callbacks
     */
    public setResizeCallback(callback: (viewport: GameViewport) => void): void {
        this.onResize = callback
    }

    public setQualityChangeCallback(callback: (quality: QualitySettings) => void): void {
        this.onQualityChange = callback
    }

    public setInputChangeCallback(callback: (inputState: any) => void): void {
        this.onInputChange = callback
    }

    public setGestureCallback(callback: (gesture: TouchGesture) => void): void {
        this.onGesture = callback
    }

    public setPerformanceChangeCallback(callback: (metrics: PerformanceMetrics) => void): void {
        this.onPerformanceChange = callback
    }

    /**
     * Get performance metrics
     */
    public getPerformanceMetrics(): PerformanceMetrics {
        return { ...this.performanceMetrics }
    }

    /**
     * Get performance history
     */
    public getPerformanceHistory(): PerformanceMetrics[] {
        return [...this.metricsHistory]
    }

    /**
     * Toggle debug overlay
     */
    public toggleDebugOverlay(): void {
        if (this.debugOverlay) {
            this.debugOverlay.remove()
            this.debugOverlay = undefined
        } else {
            this.createDebugOverlay()
        }
    }

    /**
     * Cleanup and dispose resources
     */
    public dispose(): void {
        this.isInitialized = false
        
        // Dispose managers
        if (this.canvasManager) {
            this.canvasManager.dispose()
        }
        
        if (this.inputManager) {
            this.inputManager.dispose()
        }
        
        // Clear object pools
        this.objectPools.clear()
        
        // Remove debug overlay
        if (this.debugOverlay) {
            this.debugOverlay.remove()
        }
        
        console.log('ResponsiveGameSystem: Disposed')
    }
}
