@echo off
echo Starting Ascend Avoid game...
echo.

REM Check if npm is installed
where npm >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo Error: npm is not installed or not in PATH.
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Install dependencies if needed
if not exist "node_modules" (
    echo Installing main dependencies...
    call npm install
)

if not exist "server\node_modules" (
    echo Installing server dependencies...
    cd server
    call npm install
    cd ..
)

REM Start the game using the start-game.js script
echo.
echo Starting the game...
echo.
echo Press Ctrl+C to stop the game when done.
echo.
node start-game.js

pause