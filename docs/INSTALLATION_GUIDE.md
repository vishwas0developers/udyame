# Antigravity Installation Guide

This document outlines the automated installation and initialization process for the **Udyame AI** platform. The process is managed via the `run.bat` script located in the project root.

## Overview

The installation logic is designed to be self-healing and robust, handling environment creation, dependency management, and service orchestration across Docker, Python, and Node.js environments.

## Installation Architecture

![Installation Flow](./INSTALLATION_FLOW.mmd)

### Key Phases

#### 1. Pre-flight Cleanup (Step 0)
- Kills any orphan `python.exe` or `node.exe` processes to prevent port conflicts or file locks.

#### 2. Infrastructure Readiness (Step 0.5)
- **Docker Detection**: Checks if Docker Desktop is running.
- **Auto-Correction**: Attempts to launch Docker Desktop if it is not active.
- **Database Provisioning**: Executes `docker-compose up -d` to ensure PostgreSQL and other supporting containers are ready.

#### 3. Dependency Validation (Step 1)
- Verifies system-level dependencies:
  - Python
  - Node.js
  - NPM
- Ensures the availability of critical directories (`Back_end`, `frontend`) and configuration files (`requirements.txt`, `package.json`).

#### 4. Backend Environment (Step 2)
- **Virtual Environment**: Creates or repairs the Python `venv`.
- **Pip Bootstrap**: Ensures `pip` is available and up-to-date within the sandbox.
- **Dependency Isolation**: Installs packages listed in `requirements.txt`.

#### 5. Frontend Environment (Step 3)
- Checks for `node_modules`.
- Performs a clean `npm install` if specific modules are missing.

#### 6. Orchestrated Launch & Self-Healing (Step 4)
- **Watchdog Layer**: Instead of launching the backend directly, `run.bat` starts `managed_server.py`.
- **Self-Healing**: The watchdog automatically detects port conflicts (specifically port **5013** for PostgreSQL) and kills conflicting local services to ensure Docker containers can bind correctly.
- **Hot Reload**: Monitors all `.py` and `.env` files in the `Back_end` directory. Any change triggers an automatic restart of the Uvicorn server without stopping the watchdog.
- **Frontend**: Simultaneously launches the Next.js development server.
- **Final Status**: Reports local URLs for access:
  - **Backend**: `http://localhost:5012`
  - **Frontend**: `http://localhost:3000`

## Troubleshooting

- **Docker Errors**: Ensure Docker Desktop is installed in the default location.
- **Venv Creation**: If the backend environment is corrupted, delete the `Back_end/venv` folder and restart `run.bat`.
- **Port Conflicts**: The script attempts to kill existing processes, but manual verification of ports 3000 and 5012 may be required if startup fails.
