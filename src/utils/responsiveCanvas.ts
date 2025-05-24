/**
 * Responsive Canvas Utility
 * Handles canvas sizing and aspect ratio maintenance
 */

// Base game dimensions (design target)
const BASE_WIDTH = 800;
const BASE_HEIGHT = 600;
const BASE_ASPECT_RATIO = BASE_WIDTH / BASE_HEIGHT;

// Canvas container interface
interface CanvasContainer {
  updateCanvasSize(): void;
}

/**
 * Creates a responsive canvas that maintains aspect ratio
 * @param canvasId - The ID of the canvas element
 * @param containerId - The ID of the container element
 * @returns An object with methods to control the canvas
 */
export function setupResponsiveCanvas(canvasId: string, containerId: string): CanvasContainer {
  const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
  const container = document.getElementById(containerId) as HTMLElement;
  
  if (!canvas || !container) {
    console.error('Canvas or container not found');
    return {
      updateCanvasSize: () => {}
    };
  }
  
  /**
   * Updates the canvas size based on container dimensions
   */
  function updateCanvasSize(): void {
    // Get container dimensions
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    const containerAspectRatio = containerWidth / containerHeight;
    
    let canvasWidth, canvasHeight;
    
    if (containerAspectRatio > BASE_ASPECT_RATIO) {
      // Container is wider than our target aspect ratio
      canvasHeight = Math.min(containerHeight, BASE_HEIGHT);
      canvasWidth = canvasHeight * BASE_ASPECT_RATIO;
    } else {
      // Container is taller than our target aspect ratio
      canvasWidth = Math.min(containerWidth, BASE_WIDTH);
      canvasHeight = canvasWidth / BASE_ASPECT_RATIO;
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
    
    // Store scaling information for game objects
    canvas.scalingInfo = {
      widthScale: canvasWidth / BASE_WIDTH,
      heightScale: canvasHeight / BASE_HEIGHT,
      pixelRatio: pixelRatio
    };
    
    // Update game scaling if game is initialized
    if (window.game && window.game.onResize) {
      window.game.onResize(
        canvasWidth / BASE_WIDTH,
        canvasHeight / BASE_HEIGHT
      );
    }
    
    console.log(`Canvas resized: ${Math.round(canvasWidth)}x${Math.round(canvasHeight)}, ratio: ${pixelRatio}`);
  }
  
  // Set up event listeners
  window.addEventListener('resize', updateCanvasSize);
  window.addEventListener('orientationchange', () => {
    setTimeout(updateCanvasSize, 100);
  });
  
  // Initial sizing
  updateCanvasSize();
  
  return {
    updateCanvasSize
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
    } else {
      document.body.classList.remove('portrait');
      document.body.classList.add('landscape');
    }
  });
}

// Add TypeScript interface augmentation for canvas element
declare global {
  interface HTMLCanvasElement {
    scalingInfo?: {
      widthScale: number;
      heightScale: number;
      pixelRatio: number;
    };
  }
  
  interface Window {
    game?: any;
  }
}