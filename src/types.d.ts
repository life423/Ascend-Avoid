/**
 * Core type definitions for the game
 */

// Basic geometry types
export interface Point {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface Rectangle extends Point, Size {
  // A rectangle combines position and size
}

// Game objects
export interface GameObject {
  x: number;
  y: number;
  width: number;
  height: number;
  active?: boolean;
  
  // Optional velocity properties for collision detection
  vx?: number;
  vy?: number;
  
  // Optional common methods
  update?: (deltaTime: number, timestamp?: number) => void;
  render?: (ctx: CanvasRenderingContext2D, timestamp?: number) => void;
  reset?: () => void;
}

// Input related types
export interface InputState {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  action?: boolean;
}

// Configuration types
export interface GameConfig {
  STATE: {
    WAITING: string;
    STARTING: string;
    PLAYING: string;
    PAUSED: string;
    GAME_OVER: string;
  };
  getMaxCars: () => number;
  getMinObstacles: () => number;
  getWinningLine: (canvasHeight: number, baseHeight: number) => number;
  getKeys: () => Record<string, readonly string[]>;
  getObstacleMinWidthRatio: () => number;
  getObstacleMaxWidthRatio: () => number;
  isDebugEnabled: () => boolean;
  deviceTier?: string;
  targetFPS?: number;
  setDesktopMode: (isDesktop: boolean) => void;
}

// Network related types
export interface NetworkPlayer {
  id: string;
  name: string;
  x: number;
  y: number;
  index: number;
  state: string;
  score: number;
}

// Performance related
export interface PerformanceStats {
  avgFrameTime: number;
  maxFrameTime: number;
  minFrameTime: number;
  frameCount: number;
}

// Canvas/rendering related
export interface ScalingInfo {
  widthScale: number;
  heightScale: number;
  pixelRatio: number;
  reducedResolution: boolean;
}
