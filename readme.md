# Ascend & Avoid Game

A multiplayer arcade game where players need to ascend to the top of the screen while avoiding obstacles.

## Project Overview

This is a multiplayer HTML5 canvas game with both single-player and multiplayer modes. The game features:

- Responsive design for both desktop and mobile
- Canvas-based rendering
- Multiplayer support via [Colyseus](https://colyseus.io/)
- Real-time multiplayer with up to 30 players
- Competitive "last player standing" mode

## Project Structure

The codebase follows a modular architecture to separate concerns:

```
ascend-avoid/
├── shared/                  # Shared code between client and server
│   └── constants/           # Game constants used by both client and server
├── server/                  # Multiplayer server
│   ├── constants/           # Server-specific constants
│   ├── rooms/               # Colyseus game rooms
│   └── schema/              # Network schemas for state synchronization
└── src/                     # Client-side code
    ├── assets/              # Game assets (images, sounds)
    ├── js/                  # Game logic
    └── styles/              # CSS styles
```

## Design Patterns

The game implements several design patterns for maintainability:

1. **Module Pattern**: Code is organized into modules with specific responsibilities
2. **Manager Pattern**: Specialized classes manage specific game subsystems
3. **State Pattern**: Game flows through distinct states (waiting, playing, game over)
4. **Observer Pattern**: Events are used for communication between components
5. **Factory Pattern**: Objects like obstacles are created through factory methods

## Key Technologies

- **HTML5 Canvas** for rendering
- **JavaScript (ES6+)** for game logic
- **Colyseus** for multiplayer networking
- **Express.js** for the server

## Running the Game

### Single-Player Mode

```
npm run dev
```

This will start a local server and open the game in single-player mode.

### Multiplayer Mode

```
# Start the multiplayer server
cd server
npm start

# In another terminal, start the client
npm run dev
```

Then use the multiplayer toggle in the game UI to connect to the server.

## Code Cleanup Notes

The codebase has been streamlined and improved:

1. **Consolidated Constants**: All game constants are now in a single source of truth at `shared/constants/gameConstants.js`
2. **Consistent Module System**: Standardized on ESM imports/exports
3. **Removed Duplicate Files**: Eliminated redundant code and merged functionality
4. **Improved Server Architecture**: Server now follows best practices for Colyseus implementation

## Future Development

Planned improvements:

1. Enhanced visual effects and animations
2. More diverse obstacles and power-ups
3. User accounts and persistent high scores
4. Additional multiplayer game modes
