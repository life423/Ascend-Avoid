/**
 * Responsive Canvas Utility
 * Handles canvas sizing and aspect ratio maintenance
 */

// Define interfaces for type safety
interface ScalingInfo {
  widthScale: number;
  heightScale: number;
  pixelRatio: number;
}

interface ResponsiveCanvasOptions {
  baseWidth?: number;
  baseHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  debug?: boolean;
}

/**
 * Creates a responsive canvas that maintains aspect ratio
 * @param canvasId - The ID of the canvas element
 * @param containerId - The ID of the container element
 * @param options - Configuration options
 * @returns An object with methods to control the canvas
 */
export function setupResponsiveCanvas(
  canvasId: string,
  containerId: string,
  options: ResponsiveCanvasOptions = {}
) {
  const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
  const container = document.getElementById(containerId) as HTMLElement;
  
  if (!canvas || !container) {
    console.error('Canvas or container not found');
    return {
      updateCanvasSize: () => {}
    };
  }
  
  // Default options with fallbacks
  const baseWidth = options.baseWidth || 800;
  const baseHeight = options.baseHeight || 600;
  const baseAspectRatio = baseWidth / baseHeight;
  const debug = options.debug || false;
  
  /**
   * Updates the canvas size based on container dimensions
   */
  function updateCanvasSize(): ScalingInfo {
    // Get container dimensions
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    const containerAspectRatio = containerWidth / containerHeight;
    
    let canvasWidth, canvasHeight;
    
    if (containerAspectRatio > baseAspectRatio) {
      // Container is wider than our target aspect ratio
      canvasHeight = Math.min(containerHeight, options.maxHeight || containerHeight);
      canvasWidth = canvasHeight * baseAspectRatio;
    } else {
      // Container is taller than our target aspect ratio
      canvasWidth = Math.min(containerWidth, options.maxWidth || containerWidth);
      canvasHeight = canvasWidth / baseAspectRatio;
    }
    
    // Set canvas display size
    canvas.style.width = `${canvasWidth}px`;
    canvas.style.height = `${canvasHeight}px`;
    
    // Set canvas internal resolution with device pixel ratio
    const pixelRatio = window.devicePixelRatio || 1;
    canvas.width = canvasWidth * pixelRatio;
    canvas.height = canvasHeight * pixelRatio;
    
    // Scale the context to account for the pixel ratio
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(pixelRatio, pixelRatio);
    }
    
    // Calculate scaling information
    const scalingInfo: ScalingInfo = {
      widthScale: canvasWidth / baseWidth,
      heightScale: canvasHeight / baseHeight,
      pixelRatio: pixelRatio
    };
    
    // Store scaling information on canvas for easy access
    (canvas as any).scalingInfo = scalingInfo;
    
    // Update game scaling if game is initialized
    if (window.game && typeof window.game.onResize === 'function') {
      window.game.onResize(
        scalingInfo.widthScale,
        scalingInfo.heightScale,
        window.innerWidth >= 1024
      );
    }
    
    if (debug) {
      console.log(`Canvas resized: ${Math.round(canvasWidth)}x${Math.round(canvasHeight)}, ratio: ${pixelRatio}`);
    }
    
    return scalingInfo;
  }
  
  // Set up event listeners
  window.addEventListener('resize', updateCanvasSize);
  window.addEventListener('orientationchange', () => {
    setTimeout(updateCanvasSize, 100);
  });
  
  // Initial sizing
  const initialScaling = updateCanvasSize();
  
  return {
    updateCanvasSize,
    getScalingInfo: () => (canvas as any).scalingInfo || initialScaling
  };
}

/**
 * Add orientation change handling
 */
export function setupOrientationHandling(): void {
  // Check if device is in portrait mode
  const isPortrait = window.matchMedia("(orientation: portrait)").matches;
  
  // Add orientation class to body
  document.body.classList.add(isPortrait ? 'portrait' : 'landscape');
  
  // Listen for orientation changes
  window.matchMedia("(orientation: portrait)").addEventListener('change', (e) => {
    if (e.matches) {
      document.body.classList.remove('landscape');
      document.body.classList.add('portrait');
      
      // Show orientation message on mobile devices
      if (window.innerWidth < 768) {
        document.body.classList.add('show-orientation-message');
      }
    } else {
      document.body.classList.remove('portrait');
      document.body.classList.add('landscape');
      document.body.classList.remove('show-orientation-message');
    }
  });
  
  // Initial setup for orientation message
  if (isPortrait && window.innerWidth < 768) {
    document.body.classList.add('show-orientation-message');
  }
}

// Add TypeScript interface augmentation for global objects
declare global {
  interface Window {
    game?: {
      onResize?: (widthScale: number, heightScale: number, isDesktop: boolean) => void;
    };
  }
}