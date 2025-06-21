/**
 * Advanced Input Manager with Gesture Recognition
 * 
 * Features:
 * - Unified input system for touch, mouse, and keyboard
 * - Gesture recognition (swipe, tap, pinch, etc.)
 * - Touch-first design with progressive enhancement
 * - Coordinate transformation support
 * - Haptic feedback integration
 * - Mobile-optimized touch handling
 */

import { TouchGesture, DeviceCapabilities } from '../types'

interface InputState {
    up: boolean
    down: boolean
    left: boolean
    right: boolean
    action: boolean // Primary action (tap, click, spacebar)
    [key: string]: boolean
}

interface TouchPoint {
    id: number
    x: number
    y: number
    startX: number
    startY: number
    startTime: number
    lastMoveTime: number
    velocity: { x: number; y: number }
}

interface GestureConfig {
    swipeThreshold: number
    tapThreshold: number
    tapTimeout: number
    velocityThreshold: number
    pinchThreshold: number
}

export default class AdvancedInputManager {
    private canvas: HTMLCanvasElement
    private capabilities: DeviceCapabilities
    private inputState: InputState
    private touchPoints: Map<number, TouchPoint> = new Map()
    private gestureConfig: GestureConfig
    private coordinateTransform?: (x: number, y: number) => { x: number; y: number }
    
    // Event listeners
    private keydownListener: (e: KeyboardEvent) => void
    private keyupListener: (e: KeyboardEvent) => void
    private mousedownListener: (e: MouseEvent) => void
    private mouseupListener: (e: MouseEvent) => void
    private mousemoveListener: (e: MouseEvent) => void
    private touchstartListener: (e: TouchEvent) => void
    private touchmoveListener: (e: TouchEvent) => void
    private touchendListener: (e: TouchEvent) => void
    private touchcancelListener: (e: TouchEvent) => void
    
    // Gesture callbacks
    private onGesture?: (gesture: TouchGesture) => void
    private onInputChange?: (state: InputState) => void
    
    // Key mappings
    private keyMappings = {
        up: ['ArrowUp', 'KeyW', 'Space'],
        down: ['ArrowDown', 'KeyS'],
        left: ['ArrowLeft', 'KeyA'],
        right: ['ArrowRight', 'KeyD'],
        action: ['Space', 'Enter']
    }

    constructor(
        canvas: HTMLCanvasElement, 
        capabilities: DeviceCapabilities,
        coordinateTransform?: (x: number, y: number) => { x: number; y: number }
    ) {
        this.canvas = canvas
        this.capabilities = capabilities
        this.coordinateTransform = coordinateTransform
        
        // Initialize input state
        this.inputState = {
            up: false,
            down: false,
            left: false,
            right: false,
            action: false
        }
        
        // Configure gesture recognition
        this.gestureConfig = {
            swipeThreshold: this.getResponsiveValue(30), // Scale with screen size
            tapThreshold: this.getResponsiveValue(10),
            tapTimeout: 300,
            velocityThreshold: 0.3,
            pinchThreshold: 10
        }
        
        this.setupEventListeners()
        this.optimizeForDevice()
        
        console.log('AdvancedInputManager: Initialized with capabilities:', capabilities.input)
    }

    /**
     * Get responsive value based on screen size
     */
    private getResponsiveValue(baseValue: number): number {
        const screenWidth = window.innerWidth
        const scale = Math.min(screenWidth / 375, 2) // Scale based on iPhone 6 as baseline
        return baseValue * scale
    }

    /**
     * Optimize input handling for specific device capabilities
     */
    private optimizeForDevice(): void {
        // Disable context menu on canvas for better touch experience
        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault())
        
        // Optimize touch handling for mobile
        if (this.capabilities.input.touch) {
            this.canvas.style.touchAction = 'none'
            this.canvas.style.userSelect = 'none'
            
            // Reduce gesture thresholds for small screens
            if (window.innerWidth < 480) {
                this.gestureConfig.swipeThreshold *= 0.7
                this.gestureConfig.tapThreshold *= 0.8
            }
        }
        
        // Optimize for low-performance devices
        if (this.capabilities.performance.tier === 'low') {
            this.gestureConfig.tapTimeout = 400 // Longer tap timeout for slower devices
        }
    }

    /**
     * Setup unified event listeners for all input types
     */
    private setupEventListeners(): void {
        // Keyboard events (always available)
        this.keydownListener = this.handleKeyDown.bind(this)
        this.keyupListener = this.handleKeyUp.bind(this)
        document.addEventListener('keydown', this.keydownListener)
        document.addEventListener('keyup', this.keyupListener)
        
        // Mouse events (if available)
        if (this.capabilities.input.mouse) {
            this.mousedownListener = this.handleMouseDown.bind(this)
            this.mouseupListener = this.handleMouseUp.bind(this)
            this.mousemoveListener = this.handleMouseMove.bind(this)
            
            this.canvas.addEventListener('mousedown', this.mousedownListener)
            this.canvas.addEventListener('mouseup', this.mouseupListener)
            this.canvas.addEventListener('mousemove', this.mousemoveListener)
        }
        
        // Touch events (if available)
        if (this.capabilities.input.touch) {
            this.touchstartListener = this.handleTouchStart.bind(this)
            this.touchmoveListener = this.handleTouchMove.bind(this)
            this.touchendListener = this.handleTouchEnd.bind(this)
            this.touchcancelListener = this.handleTouchCancel.bind(this)
            
            this.canvas.addEventListener('touchstart', this.touchstartListener, { passive: false })
            this.canvas.addEventListener('touchmove', this.touchmoveListener, { passive: false })
            this.canvas.addEventListener('touchend', this.touchendListener, { passive: false })
            this.canvas.addEventListener('touchcancel', this.touchcancelListener, { passive: false })
        }
    }

    /**
     * Handle keyboard input
     */
    private handleKeyDown(event: KeyboardEvent): void {
        const action = this.getActionFromKey(event.code)
        if (action) {
            event.preventDefault()
            this.setInputState(action, true)
        }
    }

    private handleKeyUp(event: KeyboardEvent): void {
        const action = this.getActionFromKey(event.code)
        if (action) {
            event.preventDefault()
            this.setInputState(action, false)
        }
    }

    /**
     * Handle mouse input
     */
    private handleMouseDown(event: MouseEvent): void {
        event.preventDefault()
        const coords = this.getGameCoordinates(event.clientX, event.clientY)
        this.handlePointerAction(coords.x, coords.y, 'down')
    }

    private handleMouseUp(event: MouseEvent): void {
        event.preventDefault()
        const coords = this.getGameCoordinates(event.clientX, event.clientY)
        this.handlePointerAction(coords.x, coords.y, 'up')
    }

    private handleMouseMove(event: MouseEvent): void {
        const coords = this.getGameCoordinates(event.clientX, event.clientY)
        this.handlePointerMove(coords.x, coords.y)
    }

    /**
     * Handle touch input with gesture recognition
     */
    private handleTouchStart(event: TouchEvent): void {
        event.preventDefault()
        
        for (let i = 0; i < event.changedTouches.length; i++) {
            const touch = event.changedTouches[i]
            const coords = this.getGameCoordinates(touch.clientX, touch.clientY)
            
            const touchPoint: TouchPoint = {
                id: touch.identifier,
                x: coords.x,
                y: coords.y,
                startX: coords.x,
                startY: coords.y,
                startTime: performance.now(),
                lastMoveTime: performance.now(),
                velocity: { x: 0, y: 0 }
            }
            
            this.touchPoints.set(touch.identifier, touchPoint)
        }
        
        // Handle single touch as primary action
        if (this.touchPoints.size === 1) {
            const touch = Array.from(this.touchPoints.values())[0]
            this.handlePointerAction(touch.x, touch.y, 'down')
        }
    }

    private handleTouchMove(event: TouchEvent): void {
        event.preventDefault()
        
        for (let i = 0; i < event.changedTouches.length; i++) {
            const touch = event.changedTouches[i]
            const touchPoint = this.touchPoints.get(touch.identifier)
            
            if (touchPoint) {
                const coords = this.getGameCoordinates(touch.clientX, touch.clientY)
                const now = performance.now()
                const deltaTime = now - touchPoint.lastMoveTime
                
                // Calculate velocity
                if (deltaTime > 0) {
                    touchPoint.velocity.x = (coords.x - touchPoint.x) / deltaTime
                    touchPoint.velocity.y = (coords.y - touchPoint.y) / deltaTime
                }
                
                touchPoint.x = coords.x
                touchPoint.y = coords.y
                touchPoint.lastMoveTime = now
            }
        }
        
        // Handle movement-based input
        if (this.touchPoints.size === 1) {
            const touch = Array.from(this.touchPoints.values())[0]
            this.handlePointerMove(touch.x, touch.y)
            this.handleSwipeInput(touch)
        }
    }

    private handleTouchEnd(event: TouchEvent): void {
        event.preventDefault()
        
        for (let i = 0; i < event.changedTouches.length; i++) {
            const touch = event.changedTouches[i]
            const touchPoint = this.touchPoints.get(touch.identifier)
            
            if (touchPoint) {
                const coords = this.getGameCoordinates(touch.clientX, touch.clientY)
                const endTime = performance.now()
                
                // Detect gestures
                this.detectGesture(touchPoint, coords.x, coords.y, endTime)
                
                this.touchPoints.delete(touch.identifier)
            }
        }
        
        // Clear movement input when no touches
        if (this.touchPoints.size === 0) {
            this.clearMovementInput()
        }
    }

    private handleTouchCancel(event: TouchEvent): void {
        event.preventDefault()
        
        for (let i = 0; i < event.changedTouches.length; i++) {
            const touch = event.changedTouches[i]
            this.touchPoints.delete(touch.identifier)
        }
        
        if (this.touchPoints.size === 0) {
            this.clearMovementInput()
        }
    }

    /**
     * Detect gestures from touch input
     */
    private detectGesture(touchPoint: TouchPoint, endX: number, endY: number, endTime: number): void {
        const deltaX = endX - touchPoint.startX
        const deltaY = endY - touchPoint.startY
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
        const duration = endTime - touchPoint.startTime
        
        let gesture: TouchGesture | null = null
        
        // Detect tap
        if (distance < this.gestureConfig.tapThreshold && duration < this.gestureConfig.tapTimeout) {
            gesture = {
                type: 'tap',
                startPoint: { x: touchPoint.startX, y: touchPoint.startY },
                endPoint: { x: endX, y: endY },
                duration,
                velocity: touchPoint.velocity,
                distance
            }
            
            // Tap triggers action
            this.setInputState('action', true)
            setTimeout(() => this.setInputState('action', false), 100)
            
            // Haptic feedback for tap
            this.triggerHapticFeedback('light')
        }
        // Detect swipe
        else if (distance > this.gestureConfig.swipeThreshold) {
            const absX = Math.abs(deltaX)
            const absY = Math.abs(deltaY)
            let direction: 'up' | 'down' | 'left' | 'right'
            
            if (absX > absY) {
                direction = deltaX > 0 ? 'right' : 'left'
            } else {
                direction = deltaY > 0 ? 'down' : 'up'
            }
            
            gesture = {
                type: 'swipe',
                startPoint: { x: touchPoint.startX, y: touchPoint.startY },
                endPoint: { x: endX, y: endY },
                duration,
                velocity: touchPoint.velocity,
                distance,
                direction
            }
            
            // Swipe triggers directional movement
            this.handleSwipeGesture(direction)
            
            // Haptic feedback for swipe
            this.triggerHapticFeedback('medium')
        }
        
        if (gesture && this.onGesture) {
            this.onGesture(gesture)
        }
    }

    /**
     * Handle swipe gestures for movement
     */
    private handleSwipeGesture(direction: 'up' | 'down' | 'left' | 'right'): void {
        // Clear previous input
        this.clearMovementInput()
        
        // Set direction based on swipe
        this.setInputState(direction, true)
        
        // Hold input for a short duration
        setTimeout(() => {
            this.setInputState(direction, false)
        }, 200)
    }

    /**
     * Handle continuous swipe input during touch move
     */
    private handleSwipeInput(touchPoint: TouchPoint): void {
        const deltaX = touchPoint.x - touchPoint.startX
        const deltaY = touchPoint.y - touchPoint.startY
        const absX = Math.abs(deltaX)
        const absY = Math.abs(deltaY)
        
        // Only trigger if movement is significant
        if (absX > this.gestureConfig.swipeThreshold / 2 || absY > this.gestureConfig.swipeThreshold / 2) {
            this.clearMovementInput()
            
            if (absX > absY) {
                // Horizontal movement
                if (deltaX > 0) {
                    this.setInputState('right', true)
                } else {
                    this.setInputState('left', true)
                }
            } else {
                // Vertical movement
                if (deltaY > 0) {
                    this.setInputState('down', true)
                } else {
                    this.setInputState('up', true)
                }
            }
        }
    }

    /**
     * Handle pointer actions (mouse or single touch)
     */
    private handlePointerAction(x: number, y: number, action: 'down' | 'up'): void {
        if (action === 'down') {
            this.setInputState('action', true)
        } else {
            this.setInputState('action', false)
        }
    }

    /**
     * Handle pointer movement
     */
    private handlePointerMove(x: number, y: number): void {
        // Could be used for mouse-look or other movement mechanics
        // Currently not implemented to keep focus on discrete input
    }

    /**
     * Get game coordinates from screen coordinates
     */
    private getGameCoordinates(screenX: number, screenY: number): { x: number; y: number } {
        if (this.coordinateTransform) {
            return this.coordinateTransform(screenX, screenY)
        }
        
        // Fallback: direct canvas coordinates
        const rect = this.canvas.getBoundingClientRect()
        return {
            x: screenX - rect.left,
            y: screenY - rect.top
        }
    }

    /**
     * Get action from keyboard code
     */
    private getActionFromKey(keyCode: string): string | null {
        for (const [action, keys] of Object.entries(this.keyMappings)) {
            if (keys.includes(keyCode)) {
                return action
            }
        }
        return null
    }

    /**
     * Set input state and notify listeners
     */
    private setInputState(action: string, value: boolean): void {
        if (this.inputState[action] !== value) {
            this.inputState[action] = value
            
            if (this.onInputChange) {
                this.onInputChange({ ...this.inputState })
            }
        }
    }

    /**
     * Clear all movement input
     */
    private clearMovementInput(): void {
        this.setInputState('up', false)
        this.setInputState('down', false)
        this.setInputState('left', false)
        this.setInputState('right', false)
    }

    /**
     * Trigger haptic feedback if available
     */
    private triggerHapticFeedback(intensity: 'light' | 'medium' | 'heavy'): void {
        if (this.capabilities.features.vibration && navigator.vibrate) {
            let pattern: number[]
            
            switch (intensity) {
                case 'light':
                    pattern = [10]
                    break
                case 'medium':
                    pattern = [20]
                    break
                case 'heavy':
                    pattern = [30, 10, 30]
                    break
            }
            
            navigator.vibrate(pattern)
        }
    }

    /**
     * Set coordinate transformation function
     */
    public setCoordinateTransform(transform: (x: number, y: number) => { x: number; y: number }): void {
        this.coordinateTransform = transform
    }

    /**
     * Set gesture callback
     */
    public setGestureCallback(callback: (gesture: TouchGesture) => void): void {
        this.onGesture = callback
    }

    /**
     * Set input change callback
     */
    public setInputChangeCallback(callback: (state: InputState) => void): void {
        this.onInputChange = callback
    }

    /**
     * Get current input state
     */
    public getInputState(): InputState {
        return { ...this.inputState }
    }

    /**
     * Update key mappings
     */
    public setKeyMappings(mappings: Record<string, string[]>): void {
        this.keyMappings = { ...this.keyMappings, ...mappings }
    }

    /**
     * Check if a specific input is active
     */
    public isInputActive(action: string): boolean {
        return this.inputState[action] || false
    }

    /**
     * Get number of active touch points
     */
    public getTouchCount(): number {
        return this.touchPoints.size
    }

    /**
     * Force clear all input
     */
    public clearAllInput(): void {
        for (const key in this.inputState) {
            this.inputState[key] = false
        }
        
        if (this.onInputChange) {
            this.onInputChange({ ...this.inputState })
        }
    }

    /**
     * Cleanup event listeners
     */
    public dispose(): void {
        // Remove keyboard listeners
        document.removeEventListener('keydown', this.keydownListener)
        document.removeEventListener('keyup', this.keyupListener)
        
        // Remove mouse listeners
        if (this.capabilities.input.mouse) {
            this.canvas.removeEventListener('mousedown', this.mousedownListener)
            this.canvas.removeEventListener('mouseup', this.mouseupListener)
            this.canvas.removeEventListener('mousemove', this.mousemoveListener)
        }
        
        // Remove touch listeners
        if (this.capabilities.input.touch) {
            this.canvas.removeEventListener('touchstart', this.touchstartListener)
            this.canvas.removeEventListener('touchmove', this.touchmoveListener)
            this.canvas.removeEventListener('touchend', this.touchendListener)
            this.canvas.removeEventListener('touchcancel', this.touchcancelListener)
        }
        
        this.touchPoints.clear()
        
        console.log('AdvancedInputManager: Disposed')
    }
}
