/**
 * Advanced Responsive Canvas Manager
 * 
 * Combines the best canvas practices with responsive-first design:
 * - Dynamic calculations for any screen size (no hardcoded values)
 * - Device pixel ratio support for crisp rendering
 * - Fixed game coordinate system that scales universally
 * - Touch coordinate transformation
 * - Performance monitoring and adaptive quality
 * - Mobile-first, desktop-enhanced approach
 */

import { 
    DeviceCapabilities, 
    GameViewport, 
    QualitySettings, 
    TouchGesture, 
    CanvasLayer,
    ResponsiveCanvasConfig,
    ScalingInfo
} from '../types'

interface CoordinateTransformation {
    screenToGame(screenX: number, screenY: number): { x: number; y: number }
    gameToScreen(gameX: number, gameY: number): { x: number; y: number }
}

export default class AdvancedCanvasManager {
    private canvas: HTMLCanvasElement
    private ctx: CanvasRenderingContext2D
    private config: ResponsiveCanvasConfig
    private viewport: GameViewport
    private capabilities: DeviceCapabilities
    private quality: QualitySettings
    private layers: Map<string, CanvasLayer> = new Map()
    private frameTimeHistory: number[] = []
    private lastResizeTime: number = 0
    private resizeDebounceTime: number = 100
    private animationFrameId: number = 0

    // Performance monitoring
    private performanceMonitor = {
        frameCount: 0,
        lastFPSUpdate: 0,
        currentFPS: 60,
        frameTimeBuffer: new Array(60).fill(16.67), // 60fps baseline
        frameTimeIndex: 0
    }

    // Event listeners
    private resizeListener: () => void
    private orientationListener: () => void
    private visibilityListener: () => void

    constructor(canvas: HTMLCanvasElement, config: Partial<ResponsiveCanvasConfig> = {}) {
        this.canvas = canvas
        this.ctx = canvas.getContext('2d')!
        
        // Default responsive-first configuration
        this.config = {
            gameWidth: 400,
            gameHeight: 600,
            maintainAspectRatio: true,
            allowUpscaling: true,
            allowDownscaling: true,
            centerCanvas: true,
            enableDPR: true,
            enableAntialiasing: true,
            quality: 'auto',
            layers: 1,
            debug: false,
            ...config
        }

        // Initialize viewport
        this.viewport = this.createEmptyViewport()
        
        // Initialize capabilities (will be populated by detectCapabilities)
        this.capabilities = this.createEmptyCapabilities()
        
        // Initialize quality settings
        this.quality = this.createDefaultQuality()

        // Set up event listeners
        this.setupEventListeners()

        // Initial setup
        this.initialize()
    }

    /**
     * Initialize the canvas manager
     */
    private async initialize(): Promise<void> {
        console.log('AdvancedCanvasManager: Initializing responsive canvas system...')

        // Detect device capabilities
        this.capabilities = await this.detectDeviceCapabilities()
        console.log('Device capabilities detected:', this.capabilities)

        // Adjust quality based on capabilities
        this.adjustQualityForDevice()

        // Setup canvas with proper scaling
        this.updateViewport()

        // Initialize layers if needed
        if (this.config.layers && this.config.layers > 1) {
            this.initializeLayers()
        }

        console.log('AdvancedCanvasManager: Initialization complete')
    }

    /**
     * Detect comprehensive device capabilities
     */
    private async detectDeviceCapabilities(): Promise<DeviceCapabilities> {
        const screen = window.screen
        const nav = navigator
        
        // Screen information
        const screenInfo = {
            width: screen.width,
            height: screen.height,
            availWidth: screen.availWidth,
            availHeight: screen.availHeight,
            dpr: window.devicePixelRatio || 1,
            orientation: screen.width > screen.height ? 'landscape' as const : 'portrait' as const
        }

        // Performance detection
        const memory = (nav as any).deviceMemory || 4
        const cores = nav.hardwareConcurrency || 4
        const gpu = await this.detectGPU()
        const fps = await this.measurePerformance()

        let performanceTier: 'low' | 'medium' | 'high' = 'medium'
        
        // Mobile device detection
        const isMobile = /Android|iPhone|iPad|iPod|IEMobile|Opera Mini/i.test(nav.userAgent)
        const isLowEndMobile = /Android 4|Android 5|iPhone 6|iPhone 7|iPhone 8/i.test(nav.userAgent)
        
        // Determine performance tier
        if (isLowEndMobile || memory < 2 || cores < 4 || fps < 20) {
            performanceTier = 'low'
        } else if (isMobile || memory < 6 || cores < 8 || fps < 45) {
            performanceTier = 'medium'
        } else {
            performanceTier = 'high'
        }

        // Input capabilities
        const input = {
            touch: 'ontouchstart' in window,
            mouse: window.matchMedia('(pointer: fine)').matches,
            keyboard: true, // Assume keyboard availability
            gamepad: 'getGamepads' in nav,
            hover: window.matchMedia('(hover: hover)').matches
        }

        // Feature detection
        const features = {
            webgl: this.hasWebGL(),
            webgl2: this.hasWebGL2(),
            canvas2d: true,
            vibration: 'vibrate' in nav,
            fullscreen: 'requestFullscreen' in document.documentElement,
            orientation: 'orientation' in window,
            deviceMemory: 'deviceMemory' in nav,
            connection: 'connection' in nav
        }

        // Battery information (if available)
        let battery = undefined
        try {
            const batteryAPI = await (nav as any).getBattery?.()
            if (batteryAPI) {
                battery = {
                    charging: batteryAPI.charging,
                    level: batteryAPI.level
                }
            }
        } catch (e) {
            // Battery API not available
        }

        return {
            screen: screenInfo,
            performance: {
                tier: performanceTier,
                memory,
                cores,
                gpu,
                fps
            },
            input,
            features,
            battery
        }
    }

    /**
     * Detect GPU capabilities
     */
    private async detectGPU(): Promise<string | null> {
        try {
            const canvas = document.createElement('canvas')
            const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
            
            if (!gl || !(gl instanceof WebGLRenderingContext)) return null

            const debugInfo = gl.getExtension('WEBGL_debug_renderer_info')
            if (debugInfo) {
                return gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) as string
            }
            
            return 'WebGL supported'
        } catch (e) {
            return null
        }
    }

    /**
     * Measure device performance
     */
    private async measurePerformance(): Promise<number> {
        return new Promise((resolve) => {
            let frames = 0
            const startTime = performance.now()
            const duration = 1000 // 1 second test

            const testFrame = () => {
                frames++
                const elapsed = performance.now() - startTime
                
                if (elapsed < duration) {
                    requestAnimationFrame(testFrame)
                } else {
                    const fps = (frames / elapsed) * 1000
                    resolve(Math.round(fps))
                }
            }

            requestAnimationFrame(testFrame)
        })
    }

    /**
     * Check WebGL support
     */
    private hasWebGL(): boolean {
        try {
            const canvas = document.createElement('canvas')
            return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
        } catch (e) {
            return false
        }
    }

    /**
     * Check WebGL2 support
     */
    private hasWebGL2(): boolean {
        try {
            const canvas = document.createElement('canvas')
            return !!canvas.getContext('webgl2')
        } catch (e) {
            return false
        }
    }

    /**
     * Adjust quality settings based on device capabilities
     */
    private adjustQualityForDevice(): void {
        const { performance, features } = this.capabilities

        switch (performance.tier) {
            case 'low':
                this.quality = {
                    particleCount: 20,
                    shadowsEnabled: false,
                    effectsEnabled: false,
                    antiAliasing: false,
                    renderScale: 0.75,
                    targetFPS: 30,
                    backgroundQuality: 'low',
                    textureQuality: 'low'
                }
                break

            case 'medium':
                this.quality = {
                    particleCount: 100,
                    shadowsEnabled: false,
                    effectsEnabled: true,
                    antiAliasing: this.config.enableAntialiasing,
                    renderScale: 1.0,
                    targetFPS: 45,
                    backgroundQuality: 'medium',
                    textureQuality: 'medium'
                }
                break

            case 'high':
                this.quality = {
                    particleCount: 300,
                    shadowsEnabled: true,
                    effectsEnabled: true,
                    antiAliasing: this.config.enableAntialiasing,
                    renderScale: 1.0,
                    targetFPS: 60,
                    backgroundQuality: 'high',
                    textureQuality: 'high'
                }
                break
        }

        console.log(`Quality adjusted for ${performance.tier} tier device:`, this.quality)
    }

    /**
     * Update viewport and canvas dimensions
     * Uses dynamic calculations for any screen size
     */
    public updateViewport(): void {
        const container = this.canvas.parentElement
        if (!container) {
            console.warn('Canvas container not found')
            return
        }

        // Get container dimensions
        const containerRect = container.getBoundingClientRect()
        const containerWidth = containerRect.width || window.innerWidth
        const containerHeight = containerRect.height || window.innerHeight

        // Calculate optimal scale that maintains aspect ratio
        const gameAspectRatio = this.config.gameWidth / this.config.gameHeight
        const containerAspectRatio = containerWidth / containerHeight

        let scale: number
        let displayWidth: number
        let displayHeight: number

        if (this.config.maintainAspectRatio) {
            // Calculate scale to fit game within container while maintaining aspect ratio
            scale = Math.min(
                containerWidth / this.config.gameWidth,
                containerHeight / this.config.gameHeight
            )

            // Respect scaling constraints
            if (!this.config.allowUpscaling && scale > 1) {
                scale = 1
            }
            if (!this.config.allowDownscaling && scale < 1) {
                scale = 1
            }

            displayWidth = this.config.gameWidth * scale
            displayHeight = this.config.gameHeight * scale
        } else {
            // Fill container exactly (may distort aspect ratio)
            displayWidth = containerWidth
            displayHeight = containerHeight
            scale = Math.min(
                displayWidth / this.config.gameWidth,
                displayHeight / this.config.gameHeight
            )
        }

        // Apply device pixel ratio for crisp rendering
        const dpr = this.config.enableDPR ? (window.devicePixelRatio || 1) : 1
        const actualWidth = Math.round(displayWidth * dpr * this.quality.renderScale)
        const actualHeight = Math.round(displayHeight * dpr * this.quality.renderScale)

        // Calculate offset for centering
        const offsetX = this.config.centerCanvas ? (containerWidth - displayWidth) / 2 : 0
        const offsetY = this.config.centerCanvas ? (containerHeight - displayHeight) / 2 : 0

        // Update viewport
        this.viewport = {
            internal: {
                width: this.config.gameWidth,
                height: this.config.gameHeight,
                aspectRatio: gameAspectRatio
            },
            display: {
                width: displayWidth,
                height: displayHeight,
                actualWidth,
                actualHeight
            },
            scale: {
                uniform: scale,
                x: displayWidth / this.config.gameWidth,
                y: displayHeight / this.config.gameHeight
            },
            offset: {
                x: offsetX,
                y: offsetY
            },
            bounds: {
                left: offsetX,
                top: offsetY,
                right: offsetX + displayWidth,
                bottom: offsetY + displayHeight
            }
        }

        // Apply canvas styling
        this.canvas.style.width = `${displayWidth}px`
        this.canvas.style.height = `${displayHeight}px`
        this.canvas.style.position = 'absolute'
        this.canvas.style.left = `${offsetX}px`
        this.canvas.style.top = `${offsetY}px`

        // Set canvas internal resolution
        this.canvas.width = actualWidth
        this.canvas.height = actualHeight

        // Scale context to account for DPR and render scale
        this.ctx.setTransform(1, 0, 0, 1, 0, 0) // Reset transform
        this.ctx.scale(
            dpr * this.quality.renderScale * scale,
            dpr * this.quality.renderScale * scale
        )

        // Configure canvas rendering
        this.ctx.imageSmoothingEnabled = this.quality.antiAliasing

        // Log viewport information
        if (this.config.debug) {
            console.log('Viewport updated:', {
                container: { width: containerWidth, height: containerHeight },
                game: { width: this.config.gameWidth, height: this.config.gameHeight },
                display: { width: displayWidth, height: displayHeight },
                actual: { width: actualWidth, height: actualHeight },
                scale: scale,
                dpr: dpr,
                renderScale: this.quality.renderScale
            })
        }
    }

    /**
     * Get coordinate transformation utilities
     */
    public getCoordinateTransform(): CoordinateTransformation {
        return {
            screenToGame: (screenX: number, screenY: number) => {
                const rect = this.canvas.getBoundingClientRect()
                const x = ((screenX - rect.left - this.viewport.offset.x) / this.viewport.scale.uniform)
                const y = ((screenY - rect.top - this.viewport.offset.y) / this.viewport.scale.uniform)
                return { x, y }
            },
            gameToScreen: (gameX: number, gameY: number) => {
                const x = (gameX * this.viewport.scale.uniform) + this.viewport.offset.x
                const y = (gameY * this.viewport.scale.uniform) + this.viewport.offset.y
                return { x, y }
            }
        }
    }

    /**
     * Get current scaling information for backward compatibility
     */
    public getScalingInfo(): ScalingInfo {
        return {
            widthScale: this.viewport.scale.x,
            heightScale: this.viewport.scale.y,
            pixelRatio: window.devicePixelRatio || 1,
            reducedResolution: this.quality.renderScale < 1
        }
    }

    /**
     * Setup event listeners for responsive behavior
     */
    private setupEventListeners(): void {
        // Debounced resize handler
        this.resizeListener = () => {
            const now = performance.now()
            if (now - this.lastResizeTime < this.resizeDebounceTime) {
                return
            }
            this.lastResizeTime = now
            this.updateViewport()
        }

        // Orientation change handler
        this.orientationListener = () => {
            // Delay to allow for screen rotation
            setTimeout(() => {
                this.updateViewport()
            }, 100)
        }

        // Visibility change handler
        this.visibilityListener = () => {
            if (!document.hidden) {
                // Force viewport update when tab becomes visible
                this.updateViewport()
            }
        }

        // Add event listeners
        window.addEventListener('resize', this.resizeListener)
        window.addEventListener('orientationchange', this.orientationListener)
        document.addEventListener('visibilitychange', this.visibilityListener)
    }

    /**
     * Initialize layered canvas system
     */
    private initializeLayers(): void {
        const container = this.canvas.parentElement
        if (!container) return

        // Create additional layers
        for (let i = 1; i < this.config.layers!; i++) {
            const layerCanvas = document.createElement('canvas')
            const layerCtx = layerCanvas.getContext('2d')!
            
            layerCanvas.style.position = 'absolute'
            layerCanvas.style.pointerEvents = 'none'
            layerCanvas.style.zIndex = `${i}`
            
            container.appendChild(layerCanvas)
            
            this.layers.set(`layer${i}`, {
                canvas: layerCanvas,
                ctx: layerCtx,
                zIndex: i,
                alpha: 1,
                visible: true,
                dirty: true
            })
        }
    }

    /**
     * Get a specific canvas layer
     */
    public getLayer(name: string): CanvasLayer | undefined {
        return this.layers.get(name)
    }

    /**
     * Get the main canvas context
     */
    public getContext(): CanvasRenderingContext2D {
        return this.ctx
    }

    /**
     * Get the main canvas element
     */
    public getCanvas(): HTMLCanvasElement {
        return this.canvas
    }

    /**
     * Get current viewport information
     */
    public getViewport(): GameViewport {
        return this.viewport
    }

    /**
     * Get device capabilities
     */
    public getCapabilities(): DeviceCapabilities {
        return this.capabilities
    }

    /**
     * Get quality settings
     */
    public getQuality(): QualitySettings {
        return this.quality
    }

    /**
     * Update quality settings and apply them
     */
    public setQuality(quality: Partial<QualitySettings>): void {
        this.quality = { ...this.quality, ...quality }
        this.updateViewport() // Re-apply canvas settings
    }

    /**
     * Create empty viewport for initialization
     */
    private createEmptyViewport(): GameViewport {
        return {
            internal: { width: 400, height: 600, aspectRatio: 400/600 },
            display: { width: 400, height: 600, actualWidth: 400, actualHeight: 600 },
            scale: { uniform: 1, x: 1, y: 1 },
            offset: { x: 0, y: 0 },
            bounds: { left: 0, top: 0, right: 400, bottom: 600 }
        }
    }

    /**
     * Create empty capabilities for initialization
     */
    private createEmptyCapabilities(): DeviceCapabilities {
        return {
            screen: { width: 1920, height: 1080, availWidth: 1920, availHeight: 1080, dpr: 1, orientation: 'landscape' },
            performance: { tier: 'medium', memory: 4, cores: 4, gpu: null, fps: 60 },
            input: { touch: false, mouse: true, keyboard: true, gamepad: false, hover: true },
            features: { webgl: false, webgl2: false, canvas2d: true, vibration: false, fullscreen: false, orientation: false, deviceMemory: false, connection: false }
        }
    }

    /**
     * Create default quality settings
     */
    private createDefaultQuality(): QualitySettings {
        return {
            particleCount: 100,
            shadowsEnabled: true,
            effectsEnabled: true,
            antiAliasing: true,
            renderScale: 1.0,
            targetFPS: 60,
            backgroundQuality: 'high',
            textureQuality: 'high'
        }
    }

    /**
     * Cleanup resources
     */
    public dispose(): void {
        // Remove event listeners
        window.removeEventListener('resize', this.resizeListener)
        window.removeEventListener('orientationchange', this.orientationListener)
        document.removeEventListener('visibilitychange', this.visibilityListener)

        // Cancel any pending animation frames
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId)
        }

        // Clean up layers
        this.layers.forEach(layer => {
            layer.canvas.remove()
        })
        this.layers.clear()

        console.log('AdvancedCanvasManager: Disposed')
    }
}
