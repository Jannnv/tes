@echo off
title FinTrack Server
color 0A
echo ===================================
echo       Starting FinTrack...
echo ===================================
echo.
echo 1. Navigating to project directory...
cd /d "%~dp0"

echo 2. Opening application in browser...
start http://localhost:5173

echo 3. Starting local server... 
echo    (Keep this window open while using the app)
echo.
npm run dev
pause
