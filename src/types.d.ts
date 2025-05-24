/**
 * Type definitions for the game
 */

// Game object interface
export interface GameObject {
  x: number;
  y: number;
  width: number;
  height: number;
  update?: (deltaTime: number, ...args: any[]) => void;
  render?: (ctx: CanvasRenderingContext2D, timestamp?: number) => void;
  reset?: () => void;
}

// Input state interface
export interface InputState {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  [key: string]: boolean;
}

// Performance statistics interface
export interface PerformanceStats {
  avgFrameTime: number;
  maxFrameTime: number;
  minFrameTime: number;
  frameCount: number;
}

// Scaling information interface
export interface ScalingInfo {
  widthScale: number;
  heightScale: number;
  pixelRatio: number;
  reducedResolution?: boolean;
}

// Responsive canvas options
export interface ResponsiveCanvasOptions {
  baseWidth?: number;
  baseHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  debug?: boolean;
}

// Responsive canvas controller
export interface ResponsiveCanvasController {
  updateCanvasSize: () => ScalingInfo;
  getScalingInfo: () => ScalingInfo;
}

// Extend Window interface to include game-specific properties
declare global {
  interface Window {
    game?: any;
    responsiveCanvas?: ResponsiveCanvasController;
    multiplayerUI?: any;
    showFloatingMenu?: () => void;
    hideFloatingMenu?: () => void;
  }
  
  // Extend HTMLCanvasElement to include scaling info
  interface HTMLCanvasElement {
    scalingInfo?: ScalingInfo;
  }
}