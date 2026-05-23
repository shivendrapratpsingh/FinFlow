# FinFlow — Start Frontend
Write-Host "Starting FinFlow Frontend..." -ForegroundColor Cyan

Set-Location "$PSScriptRoot\frontend"

# Always do a clean install to avoid stale/broken node_modules
if (Test-Path "node_modules\.package-lock.json") {
    Write-Host "Dependencies already installed." -ForegroundColor Green
} else {
    Write-Host "Installing Node.js dependencies (first time takes 2-3 mins)..." -ForegroundColor Yellow
    if (Test-Path "node_modules") {
        Remove-Item -Recurse -Force "node_modules" -ErrorAction SilentlyContinue
    }
    npm install --legacy-peer-deps
    if ($LASTEXITCODE -ne 0) {
        Write-Host "npm install failed. Trying again..." -ForegroundColor Red
        npm install --legacy-peer-deps --force
    }
}

# Create .env.local if missing
if (-not (Test-Path ".env.local")) {
    @"
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_NAME=FinFlow
"@ | Out-File -FilePath ".env.local" -Encoding utf8
    Write-Host "Created .env.local" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Frontend: http://localhost:3000" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
npm run dev
