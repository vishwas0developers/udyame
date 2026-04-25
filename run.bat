@echo off
setlocal enabledelayedexpansion

title udyame AI Launcher
cls

echo ==========================================================
echo           udyame AI - LAUNCHER
echo ==========================================================
echo [INFO] Current Directory: %CD%
echo [INFO] Script Directory: %~dp0
echo.

set "BASE_DIR=%~dp0"
if "%BASE_DIR:~-1%"=="\" set "BASE_DIR=%BASE_DIR:~0,-1%"
cd /d "%BASE_DIR%"

set "BACKEND_DIR=%BASE_DIR%\Back_end"
set "FRONTEND_DIR=%BASE_DIR%\frontend"
set "BACKEND_REQ=%BACKEND_DIR%\requirements.txt"
set "BACKEND_ENTRY=%BACKEND_DIR%\managed_server.py"
set "FRONTEND_PACKAGE=%FRONTEND_DIR%\package.json"
set "BACKEND_VENV=%BACKEND_DIR%\venv"

echo [INFO] Using Project Root: %BASE_DIR%
echo.

REM 0. Cleanup Phase - Kill any lingering processes
echo [STEP 0/4] Cleaning up lingering processes...
echo [WARN] Existing python/node processes may be stopped before fresh startup.
taskkill /F /IM python.exe /T >nul 2>&1
taskkill /F /IM node.exe /T >nul 2>&1
echo [SUCCESS] Cleanup complete.
echo.

REM 0.5. Docker and Database Check
echo [STEP 0.5/4] Checking Docker and Database Readiness...
docker info >nul 2>&1
if %errorlevel% equ 0 goto :docker_ready

echo [INFO] Docker is not running. Attempting to start Docker Desktop...
if not exist "C:\Program Files\Docker\Docker\Docker Desktop.exe" (
    echo [ERROR] Docker Desktop not found at 'C:\Program Files\Docker\Docker\Docker Desktop.exe'.
    echo [HINT] Please ensure Docker is installed and running manually.
    pause
    exit /b 1
)

start "" "C:\Program Files\Docker\Docker\Docker Desktop.exe"
echo [INFO] Waiting for Docker to start (this may take a minute)...
set "waited=0"

:wait_docker
timeout /t 5 >nul
set /a "waited+=5"
docker info >nul 2>&1
if %errorlevel% equ 0 (
    echo [SUCCESS] Docker daemon is now responsive.
    goto :docker_ready
)

if %waited% gtr 60 (
    echo [ERROR] Docker did not start in 60 seconds.
    echo [HINT] Please start Docker Desktop manually and restart this script.
    pause
    exit /b 1
)
echo [INFO] Still waiting for Docker... (%waited%s)
goto :wait_docker

:docker_ready
echo [INFO] Ensuring database container is running...
pushd "%BACKEND_DIR%"
docker-compose up -d || (
    echo [ERROR] Failed to start database container via docker-compose.
    popd
    pause
    exit /b 1
)
popd
echo [SUCCESS] Docker and Database are ready.
echo.

REM 1. Check Dependencies
echo [STEP 1/4] Checking System Dependencies...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] 'python' not found. Please install Python.
    pause
    exit /b 1
)

node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] 'node' not found. Please install Node.js.
    pause
    exit /b 1
)

call npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] 'npm' not found. Please reinstall Node.js with npm.
    pause
    exit /b 1
)

if not exist "%BACKEND_DIR%" (
    echo [ERROR] Backend folder missing: %BACKEND_DIR%
    pause
    exit /b 1
)

if not exist "%FRONTEND_DIR%" (
    echo [ERROR] Frontend folder missing: %FRONTEND_DIR%
    pause
    exit /b 1
)

if not exist "%BACKEND_REQ%" (
    echo [ERROR] Backend requirements file missing: %BACKEND_REQ%
    pause
    exit /b 1
)

if not exist "%BACKEND_ENTRY%" (
    echo [ERROR] Backend startup file missing: %BACKEND_ENTRY%
    pause
    exit /b 1
)

if not exist "%FRONTEND_PACKAGE%" (
    echo [ERROR] Frontend package file missing: %FRONTEND_PACKAGE%
    pause
    exit /b 1
)

echo [SUCCESS] Dependencies found.
echo.

REM 2. Backend Prep
echo [STEP 2/4] Preparing Backend...
pushd "%BACKEND_DIR%"
    REM Check if venv is missing OR broken (missing pyvenv.cfg)
    set "RECREATE_VENV=0"
    if not exist "venv" set "RECREATE_VENV=1"
    if exist "venv" if not exist "venv\pyvenv.cfg" set "RECREATE_VENV=1"

    if "!RECREATE_VENV!"=="1" (
        echo [INFO] Virtual environment missing or broken. Recreating...
        if exist "venv" (
            echo [INFO] Cleaning up broken venv...
            REM Try multiple times to delete in case of lingering locks
            rmdir /s /q "venv" >nul 2>&1
            if exist "venv" (
                timeout /t 2 /nobreak >nul
                rmdir /s /q "venv" >nul 2>&1
            )
            if exist "venv" (
                echo [ERROR] Could not delete 'venv' directory.
                echo [HINT] Please manually delete 'Back_end\venv' and restart.
                popd
                pause
                exit /b 1
            )
        )
        python -m venv venv || ( echo [ERROR] venv creation failed & popd & pause & exit /b 1 )
        echo [SUCCESS] Virtual environment created.
    ) else (
        echo [INFO] Existing virtual environment detected.
    )

    set "VENV_PY=venv\Scripts\python.exe"
    if not exist "!VENV_PY!" (
        echo [ERROR] Virtual environment is incomplete (python.exe missing^).
        popd
        pause
        exit /b 1
    )

    REM Ensure pip exists inside venv (some Python installs create venv without pip)
    "!VENV_PY!" -m pip --version >nul 2>&1
    if !errorlevel! neq 0 (
        echo [WARN] pip not found in venv. Attempting repair with ensurepip...
        "!VENV_PY!" -m ensurepip --upgrade >nul 2>&1
        "!VENV_PY!" -m pip --version >nul 2>&1
        if !errorlevel! neq 0 (
            echo [WARN] pip repair failed. Recreating venv from scratch...
            if exist "venv" rmdir /s /q "venv" >nul 2>&1
            python -m venv venv || ( echo [ERROR] venv recreation failed & popd & pause & exit /b 1 )
            set "VENV_PY=venv\Scripts\python.exe"
            "!VENV_PY!" -m ensurepip --upgrade >nul 2>&1
            "!VENV_PY!" -m pip --version >nul 2>&1
            if !errorlevel! neq 0 (
                echo [ERROR] pip bootstrap failed in virtual environment.
                echo [HINT] Reinstall Python with ensurepip support.
                popd
                pause
                exit /b 1
            )
        )
    )

    echo [INFO] Installing/Updating backend requirements...
    "!VENV_PY!" -m pip install --upgrade pip || ( echo [ERROR] pip upgrade failed & popd & pause & exit /b 1 )
    "!VENV_PY!" -m pip install -r requirements.txt || ( echo [ERROR] pip install failed & popd & pause & exit /b 1 )
    
    echo [INFO] Running database migrations...
    venv\Scripts\alembic.exe upgrade head || ( echo [ERROR] Database migration failed & popd & pause & exit /b 1 )
popd
echo [SUCCESS] Backend prepped.
echo.

REM 3. Frontend Prep
echo [STEP 3/4] Preparing Frontend...
pushd "%FRONTEND_DIR%"
    if not exist "node_modules" (
        echo [INFO] Installing frontend dependencies (this may take a while^)...
        call npm install || ( echo [ERROR] npm install failed & popd & pause & exit /b 1 )
    ) else (
        echo [INFO] Existing frontend dependencies detected.
    )
popd
echo [SUCCESS] Frontend prepped.
echo.

REM 4. Launching
echo [STEP 4/4] Launching Services...
echo [LAUNCH] Starting Backend in new window...
start "udyame Backend" /D "%BACKEND_DIR%" cmd /k "echo Starting Backend Server... && venv\Scripts\python.exe managed_server.py || pause"

echo [LAUNCH] Starting Frontend in new window...
start "udyame Frontend" /D "%FRONTEND_DIR%" powershell -NoExit -Command "$env:WATCHPACK_POLLING='true'; if (-not (Test-Path logs)) { New-Item -ItemType Directory logs }; Write-Host 'Starting Frontend Dev Server...'; npm run dev | Tee-Object -FilePath 'logs/frontend.log'"

echo.
echo ==========================================================
echo [DONE] Startup commands sent to separate windows.
echo Backend Admin should be on http://localhost:5012/dashboard
echo Backend API should be on http://localhost:5014/api/v1
echo Frontend should be on http://localhost:3000
echo [INFO] Review any error shown above before closing this launcher window.
echo ==========================================================
echo.
timeout /t 3 >nul
exit /b 0