import sys
import time
import subprocess
import os
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

class RestartHandler(FileSystemEventHandler):
    def __init__(self, app_module="app.main:app"):
        self.app_module = app_module
        self.root_dir = os.path.dirname(os.path.abspath(__file__))
        self.venv_dir = os.path.join(self.root_dir, "venv")
        self.process = None
        self.start_process()

    def _should_ignore(self, path):
        normalized_path = os.path.normcase(os.path.abspath(path))
        normalized_venv = os.path.normcase(os.path.abspath(self.venv_dir))
        return normalized_path.startswith(normalized_venv + os.sep)

    def start_process(self):
        if self.process:
            print("\n[WATCHDOG] Change detected! Restarting BizArchitect AI Backend...")
            self.process.terminate()
            try:
                self.process.wait(timeout=5)
            except subprocess.TimeoutExpired:
                self.process.kill()
        else:
            print("\n[WATCHDOG] Initializing BizArchitect AI Backend...")
        
        # Start uvicorn as a subprocess
        # We use sys.executable to ensure we use the same python interpreter (venv)
        cmd = [
            sys.executable, "-m", "uvicorn", 
            self.app_module, 
            "--host", "0.0.0.0", 
            "--port", "8000"
        ]
        
        self.process = subprocess.Popen(cmd)

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
