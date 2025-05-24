@echo off
echo Starting Ascend Avoid server...
echo.

cd %~dp0\server
node --loader ts-node/esm index.ts