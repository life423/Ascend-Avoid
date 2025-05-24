@echo off
echo ===================================
echo    ASCEND AVOID GAME LAUNCHER
echo ===================================
echo.

REM Check if npm is installed
where npm >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] npm is not installed or not in PATH.
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Install dependencies if needed
if not exist "node_modules" (
    echo [INFO] Installing main dependencies...
    call npm install
    if %ERRORLEVEL% neq 0 (
        echo [ERROR] Failed to install dependencies.
        pause
        exit /b 1
    )
)

if not exist "server\node_modules" (
    echo [INFO] Installing server dependencies...
    cd server
    call npm install --legacy-peer-deps
    if %ERRORLEVEL% neq 0 (
        echo [ERROR] Failed to install server dependencies.
        cd ..
        pause
        exit /b 1
    )
    cd ..
)

echo.
echo [INFO] Starting game components...
echo.
echo - Client will open in your browser
echo - Press Ctrl+C in either window to exit
echo.

REM Start the client in a new window
start cmd /k "title Ascend Avoid - Client && color 0B && echo Starting client... && npm run dev"

REM Start the server in a new window
start cmd /k "title Ascend Avoid - Server && color 0A && echo Starting server... && cd server && node --loader ts-node/esm index.js"

echo [SUCCESS] Game components started in separate windows.
echo.
echo Close those windows when you're done playing.
echo.