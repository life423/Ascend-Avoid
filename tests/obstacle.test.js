// Import modules for testing
import Obstacle from '../src/js/Obstacle.js';
import { GAME_SETTINGS } from '../src/js/constants.js';
import { randomIntFromInterval } from '../src/js/utils.js';

// Mock the canvas and context
const mockCanvas = {
  width: 800,
  height: 600,
  getContext: () => ({
    drawImage: jest.fn(),
    strokeRect: jest.fn(),
    strokeStyle: '',
    lineWidth: 0
  })
};

// Mock the utils module functions
jest.mock('../src/js/utils.js', () => ({
  randomIntFromInterval: jest.fn().mockImplementation((min, max) => min + Math.floor(Math.random() * (max - min + 1))),
  playSound: jest.fn()
}));

// Mock the sprites module
jest.mock('../src/js/sprites.js', () => ({
  getSprite: jest.fn().mockReturnValue(new Image())
}));

describe('Obstacle Class', () => {
  let obstacle;
  
  beforeEach(() => {
    // Create a new obstacle instance before each test
    obstacle = new Obstacle(100, 100, 50, mockCanvas);
  });
  
  test('should create an obstacle with correct properties', () => {
    expect(obstacle.x).toBe(100);
    expect(obstacle.y).toBe(100);
    expect(obstacle.width).toBe(50);
    expect(obstacle.canvas).toBe(mockCanvas);
    expect(obstacle.isColliding).toBe(false);
  });
  
  test('should detect overlap with another obstacle', () => {
    // Create a second obstacle overlapping with the first
    const obstacle2 = new Obstacle(120, 120, 50, mockCanvas);
    
    // Check for overlap
    expect(obstacle.checkOverlap(obstacle2)).toBe(true);
    expect(obstacle2.checkOverlap(obstacle)).toBe(true);
    
    // Create a third obstacle not overlapping
    const obstacle3 = new Obstacle(300, 300, 50, mockCanvas);
    
    // Check for no overlap
    expect(obstacle.checkOverlap(obstacle3)).toBe(false);
    expect(obstacle3.checkOverlap(obstacle)).toBe(false);
  });
  
  test('should reset obstacle with non-overlapping position', () => {
    // Create an array of obstacles
    const obstacles = [
      new Obstacle(50, 50, 50, mockCanvas),
      new Obstacle(150, 150, 50, mockCanvas),
      new Obstacle(250, 250, 50, mockCanvas)
    ];
    
    // Reset the obstacle position
    obstacle.resetObstacle(obstacles);
    
    // Check that the obstacle was reset
    expect(obstacle.x).toBe(-obstacle.width);
    expect(obstacle.isColliding).toBe(false);
    expect(obstacle.explosionFrame).toBe(0);
    
    // Check that the new position doesn't overlap with existing obstacles
    for (const existingObstacle of obstacles) {
      if (existingObstacle === obstacle) continue;
      expect(obstacle.checkOverlap(existingObstacle)).toBe(false);
    }
  });

  test('should prevent overlap when creating multiple obstacles', () => {
    // Create 10 obstacles
    const obstacles = [];
    for (let i = 0; i < 10; i++) {
      const newObstacle = new Obstacle(-100, 100, 50, mockCanvas);
      newObstacle.resetObstacle(obstacles);
      obstacles.push(newObstacle);
    }
    
    // Check that none of the obstacles overlap
    for (let i = 0; i < obstacles.length; i++) {
      for (let j = i + 1; j < obstacles.length; j++) {
        expect(obstacles[i].checkOverlap(obstacles[j])).toBe(false);
      }
    }
  });
});
