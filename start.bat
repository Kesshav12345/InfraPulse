@echo off
echo ==============================================================================
echo   STARTING PAIMANA INTELLIGENCE SYSTEM
echo ==============================================================================
echo.

echo [1/2] Launching FastAPI Backend on http://127.0.0.1:8000 ...
start "PAIMANA Intelligence Backend (FastAPI)" cmd /k "python -u -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000"

echo [2/2] Launching Vite Frontend on http://localhost:5173 ...
cd frontend
start "PAIMANA Intelligence Frontend (Vite)" cmd /k "npm run dev"

echo.
echo ==============================================================================
echo   ALL SERVICES STARTED SUCCESSFULLY!
echo   - Frontend: http://localhost:5173/
echo   - Backend API: http://127.0.0.1:8000/api
echo   - Interactive API Docs: http://127.0.0.1:8000/docs
echo ==============================================================================
echo.
pause
