// @ts-nocheck - Disable TypeScript checking for this file
import { vi, beforeEach } from 'vitest';

// Mock the browser environment
global.requestAnimationFrame = vi.fn((callback) => setTimeout(callback, 0));

// Mock Canvas API
global.HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
  clearRect: vi.fn(),
  fillRect: vi.fn(),
  beginPath: vi.fn(),
  arc: vi.fn(),
  fill: vi.fn(),
  stroke: vi.fn(),
  drawImage: vi.fn(),
  createLinearGradient: vi.fn(() => ({
    addColorStop: vi.fn()
  })),
  createRadialGradient: vi.fn(() => ({
    addColorStop: vi.fn()
  })),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  arcTo: vi.fn(),
  closePath: vi.fn(),
  translate: vi.fn(),
  rotate: vi.fn(),
  restore: vi.fn(),
  save: vi.fn(),
  scale: vi.fn(),
  fillText: vi.fn(),
  setTransform: vi.fn(),
  rect: vi.fn(),
  clip: vi.fn()
}));

// Mock window properties and methods
global.innerWidth = 1024;
global.innerHeight = 768;
global.devicePixelRatio = 1;

// Mock DOM events
window.addEventListener = vi.fn();
window.removeEventListener = vi.fn();
document.addEventListener = vi.fn();
document.removeEventListener = vi.fn();

// Mock localStorage
global.localStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  key: vi.fn(),
  length: 0
};

// Mock console methods to prevent test noise
console.log = vi.fn();
console.error = vi.fn();
console.warn = vi.fn();
console.info = vi.fn();

// Mock matchMedia
window.matchMedia = vi.fn().mockImplementation((query) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn()
}));

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn()
}));

// Clean up between tests
beforeEach(() => {
  vi.clearAllMocks();
});
