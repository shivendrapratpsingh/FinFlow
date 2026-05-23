# FinFlow — Start Backend
Write-Host "Starting FinFlow Backend..." -ForegroundColor Cyan

# ── Step 1: Start PostgreSQL ─────────────────────────────────
Write-Host "Checking PostgreSQL..." -ForegroundColor Yellow
$pgService = Get-Service -Name "postgresql*" -ErrorAction SilentlyContinue | Select-Object -First 1

if ($pgService) {
    if ($pgService.Status -ne "Running") {
        Write-Host "Starting PostgreSQL service ($($pgService.Name))..." -ForegroundColor Yellow
        try {
            Start-Service -Name $pgService.Name -ErrorAction Stop
            Start-Sleep -Seconds 2
            Write-Host "PostgreSQL started." -ForegroundColor Green
        } catch {
            Write-Host "Could not auto-start PostgreSQL. Please start it manually:" -ForegroundColor Red
            Write-Host "  Win+R → services.msc → find postgresql → right-click → Start" -ForegroundColor Yellow
            Read-Host "Press Enter once PostgreSQL is running"
        }
    } else {
        Write-Host "PostgreSQL is running." -ForegroundColor Green
    }
} else {
    Write-Host "WARNING: PostgreSQL service not found. Make sure it is running." -ForegroundColor Red
}

# ── Step 2: Setup database (first time) ──────────────────────
$psql = "C:\Program Files\PostgreSQL\18\bin\psql.exe"
if (-not (Test-Path $psql)) {
    $psql = Get-ChildItem "C:\Program Files\PostgreSQL" -Recurse -Filter "psql.exe" -ErrorAction SilentlyContinue | Select-Object -First 1 -ExpandProperty FullName
}

if ($psql -and (Test-Path $psql)) {
    $dbExists = & $psql -U postgres -tAc "SELECT 1 FROM pg_database WHERE datname='finflow_db'" 2>$null
    if ($dbExists -ne "1") {
        Write-Host "Creating finflow_db database..." -ForegroundColor Yellow
        Write-Host "(Enter your PostgreSQL 'postgres' password when prompted)" -ForegroundColor Gray
        & $psql -U postgres -c "CREATE DATABASE finflow_db;" 2>$null
        & $psql -U postgres -c "CREATE USER finflow WITH PASSWORD 'finflow_secret';" 2>$null
        & $psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE finflow_db TO finflow;" 2>$null
        & $psql -U postgres -c "ALTER DATABASE finflow_db OWNER TO finflow;" 2>$null
        Write-Host "Database created." -ForegroundColor Green
    }
}

# ── Step 3: Python venv ───────────────────────────────────────
Set-Location "$PSScriptRoot\backend"

if (-not (Test-Path "venv")) {
    Write-Host "Creating Python virtual environment..." -ForegroundColor Yellow
    python -m venv venv
}

Write-Host "Activating virtual environment..." -ForegroundColor Yellow
& "venv\Scripts\Activate.ps1"

# ── Step 4: Install dependencies ─────────────────────────────
Write-Host "Installing dependencies..." -ForegroundColor Yellow
pip install -r requirements.txt -q

# ── Step 5: Copy env ──────────────────────────────────────────
if (-not (Test-Path ".env")) {
    if (Test-Path "..\env") { Copy-Item "..\env" ".env" }
    elseif (Test-Path "..\.env") { Copy-Item "..\.env" ".env" }
}

# ── Step 6: Start server ──────────────────────────────────────
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Backend:  http://localhost:8000" -ForegroundColor Green
Write-Host "  API Docs: http://localhost:8000/docs" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
