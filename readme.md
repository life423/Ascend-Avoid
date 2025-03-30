<<<<<<< Updated upstream
# Ascend Avoid
=======
# Cross the Box Game - Multiplayer Edition
>>>>>>> Stashed changes

## Overview

This repository contains a browser-based game called "Cross the Box" which has been enhanced with multiplayer functionality. The game allows up to 30 simultaneous players to compete in a "Last Player Standing" mode.

## Features

- **Single Player Mode**: Cross the screen as many times as possible without colliding with obstacles
- **Last Player Standing Multiplayer Mode**: Compete with up to 30 players to be the last survivor
- **Shrinking Arena**: The play area shrinks over time, forcing players closer together
- **Real-time Synchronization**: Fast WebSocket-based updates for smooth gameplay
- **Player Identity**: Each player is assigned a unique color for easy identification
- **Spectator Mode**: Continue watching after elimination

## Implementation Architecture

### Server-Side Components

The multiplayer functionality is built on a server-authoritative model using the following technologies:

- **Colyseus**: WebSocket-based game server framework for Node.js
- **Schema-based State Synchronization**: Efficient delta updates for minimal network traffic
- **Express**: Web server for serving static assets and API endpoints
- **Room-based Matchmaking**: Players are grouped into game rooms with up to 30 players

### Client-Side Components

The client implementation takes advantage of:

- **Client-side Prediction**: Immediate local response to player input
- **State Reconciliation**: Corrections applied when server state differs
- **Interpolation**: Smooth movement of remote players
- **Responsive UI**: Adaptive interface for both desktop and mobile devices

### Network Communication

- **WebSockets**: Bi-directional, low-latency communication
- **Binary State Serialization**: Minimizes bandwidth requirements
- **Delta Encoding**: Only transmits state changes, not the full state

## Project Structure

```
.
├── server/                 # Server-side code
│   ├── index.js            # Main server entry point
│   ├── rooms/              # Colyseus room implementations
│   │   └── GameRoom.js     # Game room with Last Player Standing logic
│   └── schema/             # Colyseus schema definitions
│       ├── GameState.js    # Main game state schema
│       ├── PlayerSchema.js # Player data schema
│       └── ObstacleSchema.js # Obstacle data schema
├── shared/                 # Code shared between client and server
│   └── utils/
│       └── gameConstants.js # Game constants shared by client and server
├── src/                     # Client-side code
│   ├── index.html           # Main HTML
│   ├── styles/              # CSS styles
│   ├── assets/              # Game assets
│   └── js/                  # Game logic
│       ├── Game.js          # Main game controller
│       ├── Player.js        # Player entity
│       ├── MultiplayerManager.js # Client-side multiplayer handling
│       ├── MultiplayerUI.js # Multiplayer user interface
│       └── ... (other game files)
└── package.json            # Project dependencies
```

## How to Run

### Running the Server

To start the multiplayer server:

```bash
# Navigate to the server directory
cd server

# Install dependencies (first time only)
npm install

# Start the server
npm start
```

The server will run on port 3000 by default. You can access the Colyseus monitor dashboard at `http://localhost:3000/colyseus`.

### Running the Client

To run the client:

```bash
# From the project root
npm run dev
```

This will start a local development server and open the game in your browser.

## How to Play Multiplayer

1. Start the multiplayer server as described above
2. Open the game in your browser
3. Click the "Multiplayer" button in the top-right corner
4. Enter your player name and the server address (default: `ws://localhost:3000`)
5. Click "Connect" to join a game
6. Wait for other players to join (minimum 2 players needed to start)
7. Game will automatically start with a countdown once enough players join
8. Use arrow keys or WASD to move your player
9. Avoid obstacles and stay within the arena boundary
10. The last player surviving wins!

## Development Notes

- The server is built to handle up to 30 concurrent players per room
- The arena shrinks at regular intervals, making the game more challenging over time
- Player movement uses client-side prediction with server authority for conflict resolution
- When a player collides with an obstacle or leaves the arena boundary, they are eliminated

## Future Enhancements

- Power-ups and special abilities
- Multiple arena types with different obstacle patterns
- Improved matchmaking with skill-based pairing
- Chat functionality for player communication
- Customizable player appearance
