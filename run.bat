@echo off
TITLE JanSeva AI Localhost Startup Launcher
echo =======================================================================
echo          JanSeva AI - Multilingual Public Grievance Platform          
echo =======================================================================
echo.

cd /d "%~dp0"

:: 1. Setup Backend Python Environment
echo [1/3] Setting up Python backend environment...
cd backend
if not exist "venv" (
    echo Creating Python virtual environment in backend\venv...
    python -m venv venv
)

call venv\Scripts\activate.bat
echo Installing backend requirements...
pip install -r requirements.txt --quiet

echo Starting FastAPI Backend server on http://localhost:8000...
start "JanSeva Backend API" cmd /k "cd /d %~dp0backend && call venv\Scripts\activate.bat && uvicorn main:app --host 0.0.0.0 --port 8000 --reload"
cd ..

:: 2. Setup Frontend Node Environment
echo.
echo [2/3] Setting up React frontend environment...
cd frontend
if not exist "node_modules" (
    echo Installing npm dependencies...
    cmd /c "npm install"
)

echo Starting React Vite Frontend server on http://localhost:5173...
start "JanSeva Frontend App" cmd /k "cd /d %~dp0frontend && npm run dev"
cd ..

:: 3. Launch Browser
echo.
echo [3/3] Launching web browser...
timeout /t 3 >nul
start http://localhost:5173

echo.
echo =======================================================================
echo JanSeva AI is now running!
echo Frontend: http://localhost:5173
echo Backend API Docs: http://localhost:8000/docs
echo =======================================================================
pause
