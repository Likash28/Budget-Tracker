#!/usr/bin/env python3
"""
Start both frontend and backend in development mode
Cross-platform Python script
"""

import subprocess
import sys
import os
import signal
import time
from pathlib import Path

def check_command(command):
    """Check if a command exists"""
    try:
        subprocess.run([command, '--version'], capture_output=True, check=True)
        return True
    except (subprocess.CalledProcessError, FileNotFoundError):
        return False

def setup_backend():
    """Setup and start backend"""
    print("📦 Setting up backend...")
    
    backend_dir = Path("backend")
    venv_dir = backend_dir / "venv"
    
    # Create virtual environment if it doesn't exist
    if not venv_dir.exists():
        print("Creating Python virtual environment...")
        subprocess.run([sys.executable, "-m", "venv", str(venv_dir)], check=True)
    
    # Determine activation script path
    if os.name == 'nt':  # Windows
        activate_script = venv_dir / "Scripts" / "activate.bat"
        pip_cmd = [str(venv_dir / "Scripts" / "pip")]
        python_cmd = [str(venv_dir / "Scripts" / "python")]
    else:  # Unix/Linux/macOS
        activate_script = venv_dir / "bin" / "activate"
        pip_cmd = [str(venv_dir / "bin" / "pip")]
        python_cmd = [str(venv_dir / "bin" / "python")]
    
    # Install dependencies
    print("Installing backend dependencies...")
    subprocess.run(pip_cmd + ["install", "-r", "backend/requirements.txt"], check=True)
    
    # Start backend
    print("🔧 Starting backend server on http://localhost:8000...")
    uvicorn_cmd = python_cmd + ["-m", "uvicorn", "app.main:app", "--reload", "--host", "0.0.0.0", "--port", "8000"]
    return subprocess.Popen(uvicorn_cmd, cwd="backend")

def setup_frontend():
    """Setup and start frontend"""
    print("📦 Setting up frontend...")
    
    # Install dependencies
    print("Installing frontend dependencies...")
    subprocess.run(["npm", "install"], cwd="frontend", check=True)
    
    # Start frontend
    print("🎨 Starting frontend server on http://localhost:5173...")
    return subprocess.Popen(["npm", "run", "dev"], cwd="frontend")

def cleanup(backend_process, frontend_process):
    """Cleanup processes on exit"""
    print("\n🛑 Shutting down servers...")
    backend_process.terminate()
    frontend_process.terminate()
    backend_process.wait()
    frontend_process.wait()

def main():
    """Main function"""
    print("🚀 Starting Budget Tracker Development Environment...")
    print("")
    
    # Check dependencies
    if not check_command("python3") and not check_command("python"):
        print("❌ Python is not installed. Please install Python 3.8 or higher.")
        sys.exit(1)
    
    if not check_command("node"):
        print("❌ Node.js is not installed. Please install Node.js.")
        sys.exit(1)
    
    if not check_command("npm"):
        print("❌ npm is not installed. Please install npm.")
        sys.exit(1)
    
    try:
        # Start backend
        backend_process = setup_backend()
        time.sleep(2)  # Give backend time to start
        
        # Start frontend
        frontend_process = setup_frontend()
        
        print("")
        print("✅ Both servers are starting up...")
        print("")
        print("🌐 Frontend: http://localhost:5173")
        print("🔧 Backend:  http://localhost:8000")
        print("📚 API Docs: http://localhost:8000/docs")
        print("")
        print("Press Ctrl+C to stop both servers")
        print("")
        
        # Wait for processes
        try:
            backend_process.wait()
        except KeyboardInterrupt:
            cleanup(backend_process, frontend_process)
            
    except subprocess.CalledProcessError as e:
        print(f"❌ Error: {e}")
        sys.exit(1)
    except KeyboardInterrupt:
        print("\n👋 Goodbye!")
        sys.exit(0)

if __name__ == "__main__":
    main()
