# Ascend Avoid

A multiplayer game where players need to ascend and avoid obstacles.

## How to Run the Game

### Windows

Double-click `start.bat` to start both client and server in separate windows.

### Manual Start

1. **Client**: In one terminal
   ```
   npm run dev
   ```

2. **Server**: In another terminal
   ```
   cd server
   node --loader ts-node/esm index.ts
   ```

## Game Controls

- Use arrow keys or WASD to move
- Press 'R' to restart the game
- Click the "Multiplayer" button to switch to multiplayer mode

## Troubleshooting

If you encounter any issues:

1. Make sure Node.js (v16+) is installed
2. Install dependencies:
   ```
   npm install
   cd server && npm install ts-node --legacy-peer-deps
   ```