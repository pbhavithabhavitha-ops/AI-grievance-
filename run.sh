#!/bin/bash
echo "======================================================================="
echo "         JanSeva AI - Multilingual Public Grievance Platform          "
echo "======================================================================="
echo ""

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# 1. Setup Backend Python Environment
echo "[1/3] Setting up Python backend environment..."
cd backend
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment in backend/venv..."
    python3 -m venv venv 2>/dev/null || python -m venv venv
fi

source venv/bin/activate
echo "Installing backend requirements..."
pip install -r requirements.txt --quiet

echo "Starting FastAPI Backend server on http://localhost:8000..."
uvicorn main:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!
cd ..

# 2. Setup Frontend Node Environment
echo ""
echo "[2/3] Setting up React frontend environment..."
cd frontend
if [ ! -d "node_modules" ]; then
    echo "Installing npm dependencies..."
    npm install
fi

echo "Starting React Vite Frontend server on http://localhost:5173..."
npm run dev &
FRONTEND_PID=$!
cd ..

# 3. Launch Browser
echo ""
echo "[3/3] Launching web browser..."
sleep 3
if command -v open &> /dev/null; then
    open http://localhost:5173
elif command -v xdg-open &> /dev/null; then
    xdg-open http://localhost:5173
fi

echo ""
echo "======================================================================="
echo "JanSeva AI is now running!"
echo "Frontend: http://localhost:5173"
echo "Backend API Docs: http://localhost:8000/docs"
echo "======================================================================="

wait $BACKEND_PID $FRONTEND_PID
