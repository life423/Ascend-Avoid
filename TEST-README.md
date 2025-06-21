# Game Engine Test

This is a simple test of the new game engine architecture. It demonstrates the core functionality of the new architecture, including:

- Entity-based game objects
- System-based game logic
- Service Locator for dependency injection
- Event Bus for decoupled communication

## Running the Test

You can run the test in one of the following ways:

### Option 1: Using npm

```bash
npm run dev:test
```

### Option 2: Using the test script

```bash
npm run test:engine
```

### Option 3: Using the batch file (Windows only)

```bash
run-test.bat
```

## Controls

- Use arrow keys or WASD to move the player
- Avoid the red obstacles

## What to Expect

You should see a cyan square (the player) at the bottom of the screen. You can move it using the arrow keys or WASD. Red rectangles (obstacles) will move from right to left. If the player collides with an obstacle, it will flash red briefly.

## Architecture Overview

The test demonstrates the following components of the new architecture:

1. **GameEngine**: Coordinates systems and manages the game loop
2. **Entity**: Base class for all game objects
3. **System**: Base class for all game systems
4. **ServiceLocator**: Provides dependency injection
5. **EventBus**: Enables decoupled communication between components

This is just a simple test to verify that the core architecture works. The full implementation will include more features and functionality.