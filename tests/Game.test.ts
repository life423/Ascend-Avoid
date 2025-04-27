// @ts-nocheck - Disable TypeScript checking for this file
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import Game from '../src/core/Game';

// Mock game's dependencies to avoid real rendering and asset loading
vi.mock('../src/entities/Player', () => {
  return {
    default: class MockPlayer {
      constructor() {
        this.x = 100;
        this.y = 100;
        this.width = 30;
        this.height = 30;
        this.movementKeys = { up: false, down: false, left: false, right: false };
      }
      setMovementKey() {}
      update() {}
      draw() {}
      reset() {}
    }
  };
});

vi.mock('../src/entities/Background', () => {
  return {
    default: class MockBackground {
      update() {}
      draw() {}
      resize() {}
    }
  };
});

vi.mock('../src/managers/ObstacleManager', () => {
  return {
    default: class MockObstacleManager {
      constructor() {
        this.obstacles = [];
      }
      update() {}
      draw() {}
      reset() {}
      checkCollisions() { return false; }
    }
  };
});

vi.mock('../src/managers/AssetManager', () => {
  return {
    default: class MockAssetManager {
      constructor() {}
      loadAssets() { return Promise.resolve(); }
      getImage() { return document.createElement('canvas'); }
      loadAudio() { return Promise.resolve(); }
      playSound() {}
      pauseSound() {}
    }
  };
});

vi.mock('../src/managers/InputManager', () => {
  return {
    default: class MockInputManager {
      constructor() {}
      update() {}
      reset() {}
      getMovementKeys() { return { up: false, down: false, left: false, right: false }; }
      isKeyPressed() { return false; }
    }
  };
});

vi.mock('../src/managers/UIManager', () => {
  return {
    default: class MockUIManager {
      constructor() {}
      update() {}
      draw() {}
      showGameOver() {}
      hideGameOver() {}
      showLoading() {}
      hideLoading() {}
      updateScore() {}
      showStartScreen() {}
      hideStartScreen() {}
    }
  };
});

vi.mock('../src/utils/sprites', () => {
  return {
    default: {
      initializeSprites: vi.fn(),
      getSprite: vi.fn(() => document.createElement('canvas')),
      drawSprite: vi.fn(),
    }
  };
});

describe('Game module', () => {
  let game: Game;

  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();
    
    // Initialize a new game instance
    game = new Game();
  });

  it('should initialize the game with default values', () => {
    expect(game).toBeDefined();
    expect(game.score).toBe(0);
    expect(game.highScore).toBe(0);
    expect(game.gameState).toBeDefined();
  });

  it('should have core components initialized', () => {
    expect(game.player).toBeDefined();
    expect(game.background).toBeDefined();
    expect(game.obstacleManager).toBeDefined();
    expect(game.inputManager).toBeDefined();
    expect(game.assetManager).toBeDefined();
  });

  it('should update score when player crosses the winning line', () => {
    // Set up player position below winning line
    const initialScore = game.score;
    const winningLine = 40; // Approximation based on gameConstants
    
    // Mock player position
    game.player.y = winningLine - 1;
    
    // Trigger win condition check
    game.checkForWinner();
    
    // The score should increment
    expect(game.score).toBe(initialScore + 1);
  });

  it('should reset the game state correctly', () => {
    // Set a non-zero score
    game.score = 10;
    
    // Reset the game
    game.resetGame();
    
    // Score should be reset to 0
    expect(game.score).toBe(0);
  });
});
