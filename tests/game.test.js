// Import modules for testing
import Game from '../src/js/Game.js';
import Obstacle from '../src/js/Obstacle.js';
import { GAME_SETTINGS } from '../src/js/constants.js';

// Mock the DOM elements
document.getElementById = jest.fn().mockImplementation((id) => {
  if (id === 'canvas') {
    return {
      width: 800,
      height: 600,
      getContext: () => ({
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
      }),
      addEventListener: jest.fn()
    };
  }
  return {
    innerHTML: ''
  };
});

// Mock Player, Background, and TouchControls
jest.mock('../src/js/Player.js', () => {
  return jest.fn().mockImplementation(() => ({
    resetPosition: jest.fn(),
    move: jest.fn(),
    draw: jest.fn(),
    x: 100,
    y: 500,
    width: 50,
    height: 50,
    setMovementKey: jest.fn()
  }));
});

jest.mock('../src/js/Background.js', () => {
  return jest.fn().mockImplementation(() => ({
    update: jest.fn(),
    resize: jest.fn()
  }));
});

jest.mock('../src/js/TouchControls.js', () => {
  return jest.fn().mockImplementation(() => ({
    draw: jest.fn()
  }));
});

// Mock utils functions
jest.mock('../src/js/utils.js', () => ({
  randomIntFromInterval: jest.fn().mockImplementation((min, max) => min + Math.floor(Math.random() * (max - min + 1))),
  playSound: jest.fn(),
  resizeCanvas: jest.fn()
}));

// Mock the Obstacle class
jest.mock('../src/js/Obstacle.js', () => {
  return jest.fn().mockImplementation((x, y, width, canvas) => {
    return {
      x,
      y,
      width,
      height: 30,
      canvas,
      update: jest.fn(),
      draw: jest.fn(),
      resetObstacle: jest.fn(),
      detectCollision: jest.fn().mockReturnValue(false),
      checkOverlap: jest.fn().mockImplementation((otherObstacle) => {
        // Simple overlap check for testing
        const horizontalOverlap = this.x < otherObstacle.x + otherObstacle.width && 
                               this.x + this.width > otherObstacle.x;
        const verticalOverlap = this.y < otherObstacle.y + otherObstacle.height && 
                             this.y + this.height > otherObstacle.y;
        return horizontalOverlap && verticalOverlap;
      })
    };
  });
});

// Mock window object
global.requestAnimationFrame = jest.fn();
global.window = Object.assign(global.window, { 
  DEBUG: false,
  DEBUG_COLLISIONS: false,
  addEventListener: jest.fn()
});

describe('Game Class', () => {
  let game;
  
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Create a new game instance before each test
    game = new Game();
  });
  
  test('should initialize with one obstacle', () => {
    expect(game.obstacles.length).toBe(1);
    expect(Obstacle).toHaveBeenCalledTimes(1);
  });
  
  test('should add non-overlapping obstacles when adding new obstacles', () => {
    // Reset the obstacle mock implementation to track overlaps
    const obstacleInstances = [];
    Obstacle.mockImplementation((x, y, width, canvas) => {
      const instance = {
        x,
        y,
        width,
        height: 30,
        canvas,
        update: jest.fn(),
        draw: jest.fn(),
        resetObstacle: jest.fn(),
        detectCollision: jest.fn().mockReturnValue(false),
        checkOverlap: jest.fn().mockImplementation((otherObstacle) => {
          // Simplified overlap check for testing
          return Math.abs(instance.x - otherObstacle.x) < 50 && Math.abs(instance.y - otherObstacle.y) < 50;
        })
      };
      obstacleInstances.push(instance);
      return instance;
    });
    
    // Create a new game
    game = new Game();
    obstacleInstances.length = 0; // Clear the array created by the first obstacle
    
    // Add multiple obstacles
    for (let i = 0; i < 5; i++) {
      game.addObstacle();
    }
    
    // Check that there is more than one obstacle
    expect(game.obstacles.length).toBeGreaterThan(1);
    
    // Check all obstacles for overlaps
    for (let i = 0; i < game.obstacles.length; i++) {
      for (let j = i + 1; j < game.obstacles.length; j++) {
        // We shouldn't find any overlapping obstacles
        expect(game.obstacles[i].checkOverlap(game.obstacles[j])).toBe(false);
      }
    }
  });
  
  test('should pass obstacles array when resetting an obstacle', () => {
    // Simulate an obstacle going off-screen
    const testObstacle = game.obstacles[0];
    testObstacle.x = game.canvas.width + 10; // Position beyond canvas width
    
    // Trigger the animate function
    const timestamp = 1000;
    const animateMethod = game.animate.bind(game);
    animateMethod(timestamp);
    
    // Check that resetObstacle was called with the obstacles array
    expect(testObstacle.resetObstacle).toHaveBeenCalledWith(game.obstacles);
  });
});
