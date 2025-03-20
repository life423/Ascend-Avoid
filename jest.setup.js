// Mock canvas-related objects that aren't provided by jsdom
class Image {}
class Audio {}

global.Image = Image;
global.Audio = Audio;

// Set up any other globals needed for testing
global.AudioContext = jest.fn();
global.HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
  drawImage: jest.fn(),
  clearRect: jest.fn(),
  beginPath: jest.fn(),
  arc: jest.fn(),
  fill: jest.fn(),
  moveTo: jest.fn(),
  lineTo: jest.fn(),
  stroke: jest.fn(),
  strokeRect: jest.fn(),
  fillText: jest.fn(),
  globalAlpha: 1
}));

// Other required mocks
jest.mock('http-server', () => jest.fn());

// Silence console logs/errors during tests
console.log = jest.fn();
console.error = jest.fn();
