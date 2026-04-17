@echo off
title BizArchitect AI - Simultaneous Launcher
cls

echo ==========================================================
echo           BIZARCHITECT AI - SYSTEM LAUNCHER
echo ==========================================================
echo.

REM --- BACKEND SETUP ---
echo [STEP 1/3] Preparing Backend (FastAPI)...
cd Back_end
if not exist venv (
    echo [INFO] Creating Python virtual environment...
    python -m venv venv
)
echo [INFO] Activating venv and checking requirements...
call venv\Scripts\activate
pip install -r requirements.txt > nul 2>&1

REM --- FRONTEND SETUP ---
echo [STEP 2/3] Preparing Frontend (Next.js)...
cd ..\frontend
if not exist node_modules (
    echo [INFO] Installing NPM packages (this may take a moment)...
    call npm install > nul 2>&1
)

REM --- SIMULTANEOUS STARTUP ---
echo [STEP 3/3] Launching Simultaneous Services...
echo.

REM Launch Backend in a separate window
echo [LAUNCH] Backend starting with Watchdog at http://localhost:8000
start "BizArchitect Backend [API]" cmd /k "cd ../Back_end && venv\Scripts\activate && python watchdog.py"

REM Launch Frontend in a separate window
echo [LAUNCH] Frontend starting at http://localhost:3000
start "BizArchitect Frontend [UI]" cmd /k "npm run dev"

echo.
echo ==========================================================
echo [SUCCESS] Both services have been launched in new windows.
echo ----------------------------------------------------------
echo Admin Panel  : http://localhost:8000
echo Backend API : http://localhost:8000/api/v1
echo Frontend UI : http://localhost:3000
echo ==========================================================
echo.
pause
