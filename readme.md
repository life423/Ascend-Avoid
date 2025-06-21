# Ascend Avoid

A modern multiplayer game where players need to ascend and avoid obstacles.

## Quick Start

### Modern Development (Recommended)

Simply run this command to start both client and server:

```bash
npm run dev
```

This will:

-   Start the client development server with hot reload
-   Start the server with auto-restart on changes
-   Automatically open the game in your browser
-   Show colored logs for both CLIENT and SERVER

### Windows Quick Start

Double-click `start.bat` in the project root directory. This will:

-   Install dependencies if needed
-   Start the client in one window
-   Start the server in another window
-   Open the game in your default browser

### Manual Development

If you prefer to start components separately:

1. **Client**: In one terminal

    ```bash
    npm run dev:client
    ```

2. **Server**: In another terminal
    ```bash
    npm run dev:server
    ```

## Production Build

To build for production:

```bash
npm run build
```

This builds both client and server components.

## Game Controls

-   Use arrow keys or WASD to move
-   Press 'R' to restart the game
-   Click the "Multiplayer" button to switch to multiplayer mode

## Development

### Scripts Available

-   `npm run dev` - Start both client and server (recommended)
-   `npm run dev:client` - Start only client development server
-   `npm run dev:server` - Start only server with auto-restart
-   `npm run build` - Build both client and server for production
-   `npm run test` - Run tests
-   `npm run lint` - Check code quality
-   `npm run type-check` - TypeScript type checking

### Project Structure

```
├── src/           # Client source code (TypeScript)
├── server/        # Server source code (TypeScript)
├── public/        # Static assets
└── tests/         # Test files
```

## Troubleshooting

If you encounter any issues:

1. Make sure Node.js (v16+) is installed
2. Install dependencies:
    ```bash
    npm run install:all
    ```
3. Try cleaning and rebuilding:
    ```bash
    npm run clean
    npm run install:all
    ```
