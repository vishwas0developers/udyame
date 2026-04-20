import sys
import time
import subprocess
import os
import socket
import re
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

class RestartHandler(FileSystemEventHandler):
    def __init__(self, app_module="app.main:app"):
        self.app_module = app_module
        self.root_dir = os.path.dirname(os.path.abspath(__file__))
        self.venv_dir = os.path.join(self.root_dir, "venv")
        self.process = None
        
        # Self-healing: Resolve DB conflicts before first start
        self.resolve_db_conflicts()
        self.start_process()

    def resolve_db_conflicts(self):
        """Detect and resolve port 5432 conflicts (e.g. local Postgres vs Docker)"""
        print("[SELF-HEAL] Checking for database port conflicts (5432)...")
        try:
            # Check if port 5432 is in use
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
                s.settimeout(1)
                if s.connect_ex(('127.0.0.1', 5432)) != 0:
                    print("[SUCCESS] Port 5432 is available for Docker.")
                    return

            # Port is occupied. Identify the process.
            print("[WARN] Port 5432 is occupied. Investigating process...")
            try:
                output = subprocess.check_output('netstat -ano | findstr :5432', shell=True).decode()
                pids = set()
                for line in output.strip().split('\n'):
                    if 'LISTENING' in line:
                        parts = line.strip().split()
                        if len(parts) >= 5:
                            pids.add(parts[-1])
                
                for pid in pids:
                    proc_info = subprocess.check_output(f'tasklist /FI "PID eq {pid}"', shell=True).decode()
                    if 'postgres.exe' in proc_info.lower():
                        print(f"[CONFLICT] Local PostgreSQL detected (PID {pid}). Attempting to resolve...")
                        result = subprocess.run(f'taskkill /F /PID {pid}', shell=True, capture_output=True, text=True)
                        if result.returncode == 0:
                            print(f"[SUCCESS] Terminated local Postgres (PID {pid}).")
                            time.sleep(2)
                        else:
                            print(f"[ERROR] Port is not free. Access is denied for PID {pid}.")
                            print("[HINT] Please stop the local PostgreSQL service manually and restart.")
                            sys.exit(1)
                    else:
                        print(f"[ERROR] Port 5432 is not free (Used by PID {pid}).")
                        sys.exit(1)
            except subprocess.CalledProcessError:
                print("[INFO] No active listener found via netstat.")
        except Exception as e:
            print(f"[ERROR] Port check failed: {e}")
            sys.exit(1)

    def _should_ignore(self, path):
        normalized_path = os.path.normcase(os.path.abspath(path))
        normalized_venv = os.path.normcase(os.path.abspath(self.venv_dir))
        return normalized_path.startswith(normalized_venv + os.sep)

    def start_process(self):
        if self.process:
            print("\n[WATCHDOG] Change detected! Restarting Udyame AI Backend...")
            self.process.terminate()
            try:
                self.process.wait(timeout=5)
            except subprocess.TimeoutExpired:
                self.process.kill()
        else:
            print("\n[WATCHDOG] Initializing Udyame AI Backend...")
        
        # Start uvicorn as a subprocess
        # We use sys.executable to ensure we use the same python interpreter (venv)
        cmd = [
            sys.executable, "-m", "uvicorn", 
            self.app_module, 
            "--host", "0.0.0.0", 
            "--port", "5012"
        ]
        
        try:
            print(f"[WATCHDOG] Executing: {' '.join(cmd)}")
            self.process = subprocess.Popen(cmd, cwd=self.root_dir)
            
            # Check for immediate crash in a loop for 3 seconds
            for i in range(30): # 30 * 0.1s = 3s
                time.sleep(0.1)
                if self.process.poll() is not None:
                    print(f"[ERROR] Backend failed to start with exit code {self.process.returncode}")
                    return
            
            print("[SUCCESS] Backend process launched.")
        except Exception as e:
            print(f"[ERROR] Could not start backend: {e}")

    def on_modified(self, event):
        if event.is_directory:
            return
        if self._should_ignore(event.src_path):
            return
        # Only watch python files or env files
        if event.src_path.endswith('.py') or event.src_path.endswith('.env'):
            self.start_process()

def main():
    path = os.path.dirname(os.path.abspath(__file__))
    app_dir = os.path.join(path, 'app')
    
    event_handler = RestartHandler()
    observer = Observer()
    # Watch the 'app' directory specifically for core logic changes
    observer.schedule(event_handler, app_dir, recursive=True)
    # Also watch the root for config changes (.env, watchdog itself)
    observer.schedule(event_handler, path, recursive=False)
    
    observer.start()
    print(f"[WATCHDOG] Monitoring active: {app_dir}")
    print("[INFO] Press Ctrl+C to stop the system.\n")
    
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n[WATCHDOG] Stopping services...")
        observer.stop()
        if event_handler.process:
            event_handler.process.terminate()
    observer.join()

if __name__ == "__main__":
    main()
