/**
 * Type definitions for the game
 */

// Game object interface
export interface GameObject {
    x: number
    y: number
    width: number
    height: number
    update?: (deltaTime: number, ...args: any[]) => void
    render?: (ctx: CanvasRenderingContext2D, timestamp?: number) => void
    reset?: () => void
}

// Input state interface
export interface InputState {
    up: boolean
    down: boolean
    left: boolean
    right: boolean
    [key: string]: boolean
}

// Performance statistics interface
export interface PerformanceStats {
    avgFrameTime: number
    maxFrameTime: number
    minFrameTime: number
    frameCount: number
}

// Scaling information interface
export interface ScalingInfo {
    widthScale: number
    heightScale: number
    pixelRatio: number
    reducedResolution?: boolean
}

// Responsive canvas options
export interface ResponsiveCanvasOptions {
    baseWidth?: number
    baseHeight?: number
    maxWidth?: number
    maxHeight?: number
    debug?: boolean
}

// Responsive canvas controller
export interface ResponsiveCanvasController {
    updateCanvasSize: () => ScalingInfo
    getScalingInfo: () => ScalingInfo
}

// Enhanced device capabilities interface
export interface DeviceCapabilities {
    screen: {
        width: number
        height: number
        availWidth: number
        availHeight: number
        dpr: number
        orientation: 'portrait' | 'landscape'
    }
    performance: {
        tier: 'low' | 'medium' | 'high'
        memory: number
        cores: number
        gpu: string | null
        fps: number
    }
    input: {
        touch: boolean
        mouse: boolean
        keyboard: boolean
        gamepad: boolean
        hover: boolean
    }
    features: {
        webgl: boolean
        webgl2: boolean
        canvas2d: boolean
        vibration: boolean
        fullscreen: boolean
        orientation: boolean
        deviceMemory: boolean
        connection: boolean
    }
    battery?: {
        charging: boolean
        level: number
    }
}

// Game viewport interface
export interface GameViewport {
    internal: {
        width: number
        height: number
        aspectRatio: number
    }
    display: {
        width: number
        height: number
        actualWidth: number
        actualHeight: number
    }
    scale: {
        uniform: number
        x: number
        y: number
    }
    offset: {
        x: number
        y: number
    }
    bounds: {
        left: number
        top: number
        right: number
        bottom: number
    }
}

// Quality settings interface
export interface QualitySettings {
    particleCount: number
    shadowsEnabled: boolean
    effectsEnabled: boolean
    antiAliasing: boolean
    renderScale: number
    targetFPS: number
    backgroundQuality: 'low' | 'medium' | 'high'
    textureQuality: 'low' | 'medium' | 'high'
}

// Touch gesture interface
export interface TouchGesture {
    type: 'tap' | 'swipe' | 'pinch' | 'rotate'
    startPoint: { x: number; y: number }
    endPoint: { x: number; y: number }
    duration: number
    velocity: { x: number; y: number }
    distance: number
    direction?: 'up' | 'down' | 'left' | 'right'
}

// Canvas layer interface
export interface CanvasLayer {
    canvas: HTMLCanvasElement
    ctx: CanvasRenderingContext2D
    zIndex: number
    alpha: number
    visible: boolean
    dirty: boolean
}

// Responsive canvas configuration
export interface ResponsiveCanvasConfig {
    gameWidth: number
    gameHeight: number
    minWidth?: number
    minHeight?: number
    maxWidth?: number
    maxHeight?: number
    maintainAspectRatio: boolean
    allowUpscaling: boolean
    allowDownscaling: boolean
    centerCanvas: boolean
    enableDPR: boolean
    enableAntialiasing: boolean
    quality: 'auto' | 'low' | 'medium' | 'high'
    layers?: number
    debug?: boolean
}

// NetworkPlayer interface for multiplayer functionality
export interface NetworkPlayer {
    id: string
    sessionId: string
    name: string
    x: number
    y: number
    width: number
    height: number
    state: string
    score: number
    playerIndex: number
    index: number
    movementKeys?: {
        up: boolean
        down: boolean
        left: boolean
        right: boolean
    }
    lastUpdateTime?: number
}

// GameConfig interface
export interface GameConfig {
    STATE: {
        READY: string
        WAITING: string
        STARTING: string
        PLAYING: string
        PAUSED: string
        GAME_OVER: string
    }
    getKeys(): Record<string, readonly string[]>
    getWinningLine(canvasHeight: number, baseHeight?: number): number
    isDebugEnabled(): boolean
    setDesktopMode(isDesktop: boolean): void
    getObstacleMinWidthRatio(): number
    getObstacleMaxWidthRatio(): number
    getMaxCars(): number
}

// Extend Window interface to include game-specific properties
declare global {
    interface Window {
        game?: {
            onResize?: (
                widthScale: number,
                heightScale: number,
                isDesktop: boolean
            ) => void
        }
        responsiveCanvas?: ResponsiveCanvasController
        multiplayerUI?: any
        showFloatingMenu?: () => void
        hideFloatingMenu?: () => void
    }

    // Extend HTMLCanvasElement to include scaling info
    interface HTMLCanvasElement {
        scalingInfo?: ScalingInfo
    }
}
