@echo off
setlocal enabledelayedexpansion
title Udyame AI - Simultaneous Launcher
cls

:: Anchor to script directory
set "ROOT_DIR=%~dp0"
cd /d "%ROOT_DIR%"

echo ==========================================================
echo           Udyame AI - SYSTEM LAUNCHER
echo ==========================================================
echo.

:: Check for Python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python not found. Please install Python to proceed.
    pause
    exit /b 1
)

:: Check for Node
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js not found. Please install Node.js to proceed.
    pause
    exit /b 1
)

REM --- BACKEND SETUP ---
echo [STEP 1/3] Preparing Backend (FastAPI)...
if not exist "Back_end\venv" (
    echo [INFO] Creating Python virtual environment...
    python -m venv "Back_end\venv"
)

echo [INFO] Activating venv and checking requirements...
:: Suppress pip warnings and version checks
"%ROOT_DIR%Back_end\venv\Scripts\python.exe" -m pip install --upgrade pip --quiet
"%ROOT_DIR%Back_end\venv\Scripts\python.exe" -m pip install -r "Back_end\requirements.txt" --quiet --no-cache-dir

REM --- FRONTEND SETUP ---
echo [STEP 2/3] Preparing Frontend (Next.js)...
if not exist "frontend\node_modules" (
    echo [INFO] Installing NPM packages (this may take a moment)...
    cd /d "%ROOT_DIR%frontend"
    call npm install --no-audit --no-fund --loglevel=error
)

REM --- SIMULTANEOUS STARTUP ---
echo [STEP 3/3] Launching Simultaneous Services...
echo.

REM Launch Backend in a separate window
echo [LAUNCH] Backend starting [API]...
:: Use absolute paths in the start command to prevent 'folder not found' errors
start "Udyame Backend [API]" cmd /k "cd /d "%ROOT_DIR%Back_end" && call venv\Scripts\activate && python watchdog.py"

REM Launch Frontend in a separate window
echo [LAUNCH] Frontend starting [UI]...
start "Udyame Frontend [UI]" cmd /k "cd /d "%ROOT_DIR%frontend" && npm run dev"

echo.
echo ==========================================================
echo [SUCCESS] Both services have been launched successfully.
echo ----------------------------------------------------------
echo Admin Panel  : http://localhost:8000
echo Backend API : http://localhost:8000/api/v1
echo Frontend UI : http://localhost:3000
echo ==========================================================
echo.
pause
