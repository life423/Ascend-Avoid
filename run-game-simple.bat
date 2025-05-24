@echo off
echo Starting Ascend Avoid game...
echo.
echo This will start both the client and server in separate windows.
echo.

REM Start the client in a new window
start cmd /k "cd %~dp0 && npm run dev"

REM Start the server in a new window
start cmd /k "cd %~dp0\server && node --loader ts-node/esm index.ts"

echo Game components started in separate windows.
echo Close those windows when you're done playing.
echo.