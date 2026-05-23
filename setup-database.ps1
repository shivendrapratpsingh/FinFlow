# FinFlow — Database Setup
# Run this ONCE before starting the backend for the first time.
# Requires PostgreSQL to be installed and psql in PATH.

Write-Host "Setting up FinFlow Database..." -ForegroundColor Cyan
Write-Host ""

# Check if psql is available
if (-not (Get-Command psql -ErrorAction SilentlyContinue)) {
    Write-Host "ERROR: psql not found in PATH." -ForegroundColor Red
    Write-Host ""
    Write-Host "Add PostgreSQL's bin folder to your PATH. It is usually:" -ForegroundColor Yellow
    Write-Host "  C:\Program Files\PostgreSQL\16\bin"  -ForegroundColor White
    Write-Host "  C:\Program Files\PostgreSQL\15\bin"  -ForegroundColor White
    Write-Host ""
    Write-Host "Or open pgAdmin and run the SQL below manually." -ForegroundColor Yellow
    exit 1
}

Write-Host "Connecting to PostgreSQL as superuser (postgres)..." -ForegroundColor Yellow
Write-Host "You will be prompted for the postgres password." -ForegroundColor Gray
Write-Host ""

# Run SQL as the postgres superuser
psql -U postgres -c "CREATE DATABASE finflow_db;" 2>$null
psql -U postgres -c "CREATE USER finflow WITH PASSWORD 'finflow_secret';" 2>$null
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE finflow_db TO finflow;" 2>$null
psql -U postgres -c "ALTER DATABASE finflow_db OWNER TO finflow;" 2>$null

Write-Host ""
Write-Host "Database setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Now run: .\start-backend.ps1" -ForegroundColor Cyan
Write-Host "(The backend will auto-create all tables on first run)" -ForegroundColor Gray
