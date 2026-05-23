# FinFlow — Start Everything
# Double-click this file or run: .\RUN.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   FinFlow — Starting Everything..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$root = $PSScriptRoot

# ── Start MySQL if not running ────────────────────────────────
$mysql = Get-Service -Name "MySQL80" -ErrorAction SilentlyContinue
if ($mysql -and $mysql.Status -ne "Running") {
    Write-Host "Starting MySQL..." -ForegroundColor Yellow
    Start-Service MySQL80
    Start-Sleep 3
}
Write-Host "MySQL: Running" -ForegroundColor Green

# ── Create DB and admin user via MySQL ────────────────────────
$mysqlExe = "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"
if (Test-Path $mysqlExe) {
    # Create DB and finflow user (ignore errors if already exists)
    & $mysqlExe -u root -e "CREATE DATABASE IF NOT EXISTS finflow_db; CREATE USER IF NOT EXISTS 'finflow'@'127.0.0.1' IDENTIFIED BY 'finflow_secret'; GRANT ALL PRIVILEGES ON finflow_db.* TO 'finflow'@'127.0.0.1'; FLUSH PRIVILEGES;" 2>$null
    Write-Host "Database: Ready" -ForegroundColor Green
} else {
    Write-Host "MySQL client not found at default path - skipping DB setup" -ForegroundColor Yellow
}

# ── Backend in new window ─────────────────────────────────────
Write-Host "Starting Backend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", @"
cd '$root\backend'
.\venv\Scripts\Activate.ps1
Copy-Item '..\\.env' '.env' -Force -ErrorAction SilentlyContinue
uvicorn app.main:app --reload --host 127.0.0.1 --port 8080
"@

# Wait for backend to start
Write-Host "Waiting for backend to start..." -ForegroundColor Yellow
$tries = 0
do {
    Start-Sleep 2
    $tries++
    try {
        $r = Invoke-WebRequest -Uri "http://127.0.0.1:8080/health" -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop
        $ok = $true
    } catch { $ok = $false }
} while (-not $ok -and $tries -lt 15)

if ($ok) {
    Write-Host "Backend: Running at http://127.0.0.1:8080" -ForegroundColor Green

    # ── Seed admin account ────────────────────────────────────
    Write-Host "Creating admin account..." -ForegroundColor Yellow
    Set-Location "$root\backend"
    & ".\venv\Scripts\python.exe" seed_admin.py
    Set-Location $root
} else {
    Write-Host "Backend did not start in time - check the backend window for errors" -ForegroundColor Red
}

# ── Frontend in new window ────────────────────────────────────
Write-Host "Starting Frontend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", @"
cd '$root\frontend'
npm run dev
"@

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  App:      http://localhost:3000" -ForegroundColor Green
Write-Host "  API Docs: http://127.0.0.1:8080/docs" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Login with:" -ForegroundColor Cyan
Write-Host "  Email:    pratapsinghshivendra21@gmail.com" -ForegroundColor White
Write-Host "  Password: FinFlow@123" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to open the app in browser..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
Start-Process "http://localhost:3000/login"
