@echo off
title AI Startup Platform
color 0A

echo ========================================
echo   AI STARTUP PLATFORM
echo ========================================
echo.

echo [1/4] MongoDB already running as service
echo.

echo [2/4] Starting Backend...
start "Backend" cmd /k "cd /d D:\ai-startup-platform\backend && npm run dev"
timeout /t 3 /nobreak >nul

echo [3/4] Starting ML Service...
start "ML Service" cmd /k "cd /d D:\ai-startup-platform\ml-service && venv\Scripts\activate && python main_gpu.py"
timeout /t 3 /nobreak >nul

echo [4/4] Starting Frontend...
start "Frontend" cmd /k "cd /d D:\ai-startup-platform\frontend && npm run dev"

echo.
echo ========================================
echo   ALL SERVICES STARTED!
echo ========================================
echo   Frontend:  http://localhost:5173
echo   Backend:   http://localhost:5000
echo   ML API:    http://localhost:8000
echo ========================================

timeout /t 3 >nul
start http://localhost:5173

pause
