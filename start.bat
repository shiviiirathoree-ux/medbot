@echo off
title MedBot Launcher
echo ===================================================================
echo   🏥 MedBot — AI Healthcare Chatbot Platform Launcher
echo ===================================================================
echo.
echo   This script will launch both the backend API server and
echo   the Vite-React frontend in separate terminal windows.
echo.
echo   Requirements:
echo   1. Ensure MongoDB is running locally on port 27017, OR
echo      update MONGO_URI in 'backend/.env' to a MongoDB Atlas URL.
echo.
echo ===================================================================
echo.

echo   [1/2] Launching Backend Server...
start "MedBot Backend Server" cmd /k "cd backend && npm run dev"

echo   [2/2] Launching Frontend Client...
start "MedBot Frontend Client" cmd /k "cd frontend && npm run dev"

echo.
echo ===================================================================
echo   🚀 Services launched!
echo   Waiting 5 seconds for systems to initialize, then
echo   opening http://localhost:5173 in your default browser...
echo ===================================================================
timeout /t 5 >nul

start http://localhost:5173
echo   Browser opened. Have fun exploring MedBot!
echo ===================================================================
pause
