@echo off
REM Start both frontend and backend in development mode (Windows)

echo 🚀 Starting Budget Tracker Development Environment...
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is not installed. Please install Python 3.8 or higher.
    pause
    exit /b 1
)

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed. Please install Node.js.
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ npm is not installed. Please install npm.
    pause
    exit /b 1
)

echo 📦 Setting up backend...

REM Create virtual environment if it doesn't exist
if not exist "backend\venv" (
    echo Creating Python virtual environment...
    python -m venv backend\venv
)

REM Activate virtual environment
call backend\venv\Scripts\activate.bat

REM Install backend dependencies
echo Installing backend dependencies...
pip install -r backend\requirements.txt

REM Start backend server
echo 🔧 Starting backend server on http://localhost:8000...
start "Backend Server" cmd /k "cd backend && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"

echo 📦 Setting up frontend...

REM Install frontend dependencies
echo Installing frontend dependencies...
cd frontend
npm install

REM Start frontend server
echo 🎨 Starting frontend server on http://localhost:5173...
start "Frontend Server" cmd /k "npm run dev"

cd ..

echo.
echo ✅ Both servers are starting up...
echo.
echo 🌐 Frontend: http://localhost:5173
echo 🔧 Backend:  http://localhost:8000
echo 📚 API Docs: http://localhost:8000/docs
echo.
echo Press any key to exit...
pause >nul
