# Kimberly Signature Scents - Quick Start Script
# This script helps you get the backend server running quickly

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "  Kimberly Signature Scents Setup" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
Write-Host "Checking for Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Node.js not found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install Node.js from: https://nodejs.org/" -ForegroundColor Yellow
    Write-Host "Press any key to exit..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit
}

Write-Host ""

# Navigate to backend directory
$backendPath = Join-Path $PSScriptRoot "backend"
if (-not (Test-Path $backendPath)) {
    Write-Host "✗ Backend folder not found!" -ForegroundColor Red
    exit
}

Set-Location $backendPath
Write-Host "✓ Navigated to backend folder" -ForegroundColor Green
Write-Host ""

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    Write-Host "This may take a few minutes..." -ForegroundColor Yellow
    Write-Host ""
    npm install
    Write-Host ""
    Write-Host "✓ Dependencies installed!" -ForegroundColor Green
} else {
    Write-Host "✓ Dependencies already installed" -ForegroundColor Green
}

Write-Host ""

# Check if .env file exists
if (-not (Test-Path ".env")) {
    Write-Host "Creating .env file..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "✓ .env file created" -ForegroundColor Green
    Write-Host ""
    Write-Host "⚠ IMPORTANT: Please edit the .env file and update:" -ForegroundColor Yellow
    Write-Host "  - JWT_SECRET (change to a random secure string)" -ForegroundColor Yellow
    Write-Host "  - ADMIN_EMAIL (your email)" -ForegroundColor Yellow
    Write-Host "  - ADMIN_PASSWORD (your password)" -ForegroundColor Yellow
    Write-Host ""
} else {
    Write-Host "✓ .env file exists" -ForegroundColor Green
}

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "  Starting Backend Server..." -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Server will start at: http://localhost:3000" -ForegroundColor Green
Write-Host ""
Write-Host "To stop the server, press CTRL+C" -ForegroundColor Yellow
Write-Host ""
Write-Host "After server starts, open the website by:" -ForegroundColor Cyan
Write-Host "  - Double-clicking index.html" -ForegroundColor Cyan
Write-Host "  - Or opening it in your browser" -ForegroundColor Cyan
Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Start the server
npm start
