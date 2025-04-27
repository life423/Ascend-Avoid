import { CANVAS } from '../constants/gameConstants';

/**
 * Handles responsive canvas sizing for different screen sizes
 */
export class CanvasResizer {
  private canvas: HTMLCanvasElement;
  private container: HTMLElement;
  private aspectRatio: number;

  constructor(canvas: HTMLCanvasElement, container: HTMLElement | null = null) {
    this.canvas = canvas;
    this.container = container || document.body;
    this.aspectRatio = CANVAS.BASE_HEIGHT / CANVAS.BASE_WIDTH;
    
    // Initial resize
    this.resize();
    
    // Add event listener for window resize
    window.addEventListener('resize', this.resize.bind(this));
  }

  /**
   * Resizes canvas to fit the available space while maintaining aspect ratio
   */
  resize(): void {
    // Get available width (respecting max width constraints)
    const containerWidth = this.container.clientWidth;
    const isDesktop = window.innerWidth >= 1024;
    
    // Calculate target width based on device and constraints
    let targetWidth = Math.min(
      containerWidth * 0.95, // Use 95% of container width
      isDesktop ? CANVAS.MAX_DESKTOP_WIDTH : CANVAS.MAX_MOBILE_WIDTH
    );
    
    // Ensure minimum reasonable size
    targetWidth = Math.max(targetWidth, 300);
    
    // Calculate height based on aspect ratio
    const targetHeight = targetWidth * this.aspectRatio;
    
    // Apply dimensions to canvas
    this.canvas.width = targetWidth;
    this.canvas.height = targetHeight;
    
    // Update CSS dimensions to match
    this.canvas.style.width = `${targetWidth}px`;
    this.canvas.style.height = `${targetHeight}px`;
    
    // Dispatch resize event for other components to react
    const resizeEvent = new CustomEvent('canvasResized', {
      detail: { width: targetWidth, height: targetHeight }
    });
    document.dispatchEvent(resizeEvent);
  }

  /**
   * Gets the current scale factor compared to base dimensions
   */
  getScaleFactor(): number {
    return this.canvas.width / CANVAS.BASE_WIDTH;
  }
  
  /**
   * Clean up resources
   */
  dispose(): void {
    window.removeEventListener('resize', this.resize.bind(this));
  }
}
