# Ascend Avoid

A multiplayer game where players need to ascend and avoid obstacles.

## How to Run the Game

### Windows

Simply double-click `start.bat` in the project root directory. This will:
- Install dependencies if needed
- Start the client in one window
- Start the server in another window
- Open the game in your default browser

### Manual Start

If you prefer to start the components manually:

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
   cd server && npm install --legacy-peer-deps
   ```