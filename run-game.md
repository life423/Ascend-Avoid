# Running Ascend Avoid

There are several ways to run the Ascend Avoid game:

## Option 1: Using the Batch File (Recommended for Windows)

1. Double-click the `run-game.bat` file in the project root
2. This will automatically:
   - Install dependencies if needed
   - Start both client and server components
   - Open the game in your default browser

## Option 2: Using npm Scripts

You can run the game using npm scripts from the command line:

```bash
# Install dependencies (if not already installed)
npm install
cd server && npm install && cd ..

# Start both client and server (recommended)
npm start
# or
npm run dev:full
```

## Option 3: Running Client and Server Separately

If you want to run the client and server in separate terminals:

```bash
# Terminal 1 - Start the client
npm run dev

# Terminal 2 - Start the server
npm run dev:server
```

## Accessing the Game

Once running, the game should automatically open in your browser at:
- http://localhost:5173/

The multiplayer server will be running at:
- http://localhost:3000/

## Troubleshooting

If you encounter any issues:

1. Make sure Node.js (v16+) is installed
2. Check that all dependencies are installed
3. Look for error messages in the terminal
4. Try running the client and server separately to identify which component is failing