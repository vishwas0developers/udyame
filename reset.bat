@echo off
setlocal enabledelayedexpansion

echo ==========================================================
echo           UDYAME DATABASE RESET UTILITY
echo ==========================================================
echo.
echo [WARNING] This will PERMANENTLY DELETE all users, 
echo credits, and transaction data.
echo.
set /p confirm="Are you sure you want to proceed? (Y/N): "

if /i "%confirm%" neq "Y" (
    echo [INFO] Reset cancelled.
    pause
    exit /b 0
)

echo.
echo [PROCESS] Locating Backend...
set "BACKEND_DIR=%~dp0Back_end"
set "VENV_PY=%BACKEND_DIR%\venv\Scripts\python.exe"

if not exist "%VENV_PY%" (
    echo [ERROR] Virtual environment not found at %VENV_PY%
    echo Please run run.bat first to set up the project.
    pause
    exit /b 1
)

echo [PROCESS] Running reset script...
cd /d "%BACKEND_DIR%"
"%VENV_PY%" scripts\factory_reset.py

if %ERRORLEVEL% neq 0 (
    echo.
    echo [ERROR] Database reset failed. Check the error message above.
    pause
    exit /b 1
)

echo.
echo ==========================================================
echo [DONE] System has been reset to factory settings.
echo You can now run run.bat to start fresh.
echo ==========================================================
echo.
pause
exit /b 0
