@echo off
title FinFlow — Local Start

echo.
echo  =============================================
echo    FinFlow — AI Accounting Platform
echo  =============================================
echo.

REM ── Backend ─────────────────────────────────────
echo [1/2] Starting Backend (FastAPI)...
cd /d "%~dp0backend"

REM Create venv if it doesn't exist
if not exist "venv\Scripts\python.exe" (
    echo  Creating Python virtual environment...
    python -m venv venv
    echo  Installing dependencies...
    venv\Scripts\pip install -r requirements.txt --quiet
)

REM Copy .env if it doesn't exist
if not exist ".env" (
    copy ".env.example" ".env" >nul 2>&1
    echo  Created .env from template. Edit it to add your settings.
)

REM Start backend in new window
start "FinFlow Backend" cmd /k "venv\Scripts\python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"

echo  Backend starting on http://localhost:8000
echo  API Docs: http://localhost:8000/docs
echo.

REM ── Frontend ─────────────────────────────────────
echo [2/2] Starting Frontend (Next.js)...
cd /d "%~dp0frontend"

if not exist "node_modules" (
    echo  Installing frontend packages (first run, takes a few minutes)...
    call npm install --legacy-peer-deps
)

if not exist ".env.local" (
    echo NEXT_PUBLIC_API_URL=http://localhost:8000 > .env.local
)

start "FinFlow Frontend" cmd /k "npm run dev"

echo  Frontend starting on http://localhost:3000
echo.
echo  =============================================
echo   Opening FinFlow in your browser...
echo  =============================================
timeout /t 5 /nobreak >nul
start http://localhost:3000

echo.
echo  Both windows are running. Close them to stop FinFlow.
pause
