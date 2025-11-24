# 🚀 Quick Deployment Script

Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  Kimberly Signature Scents - Deployment Setup  " -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Check if Git is installed
try {
    git --version | Out-Null
    Write-Host "✅ Git is installed" -ForegroundColor Green
} catch {
    Write-Host "❌ Git is not installed. Please install Git first:" -ForegroundColor Red
    Write-Host "   Download from: https://git-scm.com/download/win" -ForegroundColor Yellow
    exit 1
}

# Navigate to project directory
$projectPath = "C:\Users\Tatenda\OneDrive\Documents\Kimberly Signature Scents"
Set-Location $projectPath
Write-Host "📁 Project directory: $projectPath" -ForegroundColor Cyan
Write-Host ""

# Initialize Git repository
Write-Host "🔧 Initializing Git repository..." -ForegroundColor Cyan
if (-not (Test-Path ".git")) {
    git init
    Write-Host "✅ Git repository initialized" -ForegroundColor Green
} else {
    Write-Host "✅ Git repository already exists" -ForegroundColor Green
}

# Add all files
Write-Host "📦 Adding files to Git..." -ForegroundColor Cyan
git add .

# Commit
Write-Host "💾 Creating commit..." -ForegroundColor Cyan
$commitMessage = "Deploy: Kimberly Signature Scents with PostgreSQL backend"
git commit -m $commitMessage

Write-Host "✅ Files committed successfully" -ForegroundColor Green
Write-Host ""

# Ask for GitHub username
Write-Host "════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  GitHub Setup  " -ForegroundColor Yellow
Write-Host "════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "Please create a new repository on GitHub:" -ForegroundColor Yellow
Write-Host "1. Go to https://github.com/new" -ForegroundColor White
Write-Host "2. Repository name: kimberly-signature-scents" -ForegroundColor White
Write-Host "3. Keep it Public (for free hosting)" -ForegroundColor White
Write-Host "4. DO NOT initialize with README" -ForegroundColor White
Write-Host "5. Click 'Create repository'" -ForegroundColor White
Write-Host ""

$username = Read-Host "Enter your GitHub username"

# Add remote
Write-Host ""
Write-Host "🔗 Adding GitHub remote..." -ForegroundColor Cyan
$repoUrl = "https://github.com/$username/kimberly-signature-scents.git"

try {
    git remote remove origin 2>$null
} catch {}

git remote add origin $repoUrl
git branch -M main

Write-Host "✅ Remote added: $repoUrl" -ForegroundColor Green
Write-Host ""

# Push to GitHub
Write-Host "🚀 Pushing to GitHub..." -ForegroundColor Cyan
Write-Host "   (You may need to enter your GitHub credentials)" -ForegroundColor Yellow
Write-Host ""

try {
    git push -u origin main
    Write-Host "✅ Code pushed to GitHub successfully!" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to push. You may need to:" -ForegroundColor Red
    Write-Host "   1. Set up GitHub Personal Access Token" -ForegroundColor Yellow
    Write-Host "   2. Run: git push -u origin main" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  Next Steps - Deploy to Render.com  " -ForegroundColor Yellow
Write-Host "════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

Write-Host "1. Backend (API + Database):" -ForegroundColor Cyan
Write-Host "   → Go to https://render.com" -ForegroundColor White
Write-Host "   → Sign up with GitHub account" -ForegroundColor White
Write-Host "   → Click 'New +' → 'PostgreSQL'" -ForegroundColor White
Write-Host "   → Name: kimberly-database" -ForegroundColor White
Write-Host "   → Click 'Create Database'" -ForegroundColor White
Write-Host "   → Copy 'Internal Database URL'" -ForegroundColor White
Write-Host ""
Write-Host "   → Click 'New +' → 'Web Service'" -ForegroundColor White
Write-Host "   → Connect your GitHub repo: $repoUrl" -ForegroundColor White
Write-Host "   → Name: kimberly-backend" -ForegroundColor White
Write-Host "   → Environment: Node" -ForegroundColor White
Write-Host "   → Build Command: cd backend && npm install" -ForegroundColor White
Write-Host "   → Start Command: cd backend && npm start" -ForegroundColor White
Write-Host "   → Add Environment Variables:" -ForegroundColor White
Write-Host "       DATABASE_URL = [paste Internal Database URL]" -ForegroundColor Yellow
Write-Host "       NODE_ENV = production" -ForegroundColor Yellow
Write-Host "       JWT_SECRET = kimberly-secret-2025" -ForegroundColor Yellow
Write-Host "       ADMIN_EMAIL = murerwakimberley@gmail.com" -ForegroundColor Yellow
Write-Host "   → Click 'Create Web Service'" -ForegroundColor White
Write-Host ""

Write-Host "2. Frontend (Website):" -ForegroundColor Cyan
Write-Host "   → Go to https://netlify.com" -ForegroundColor White
Write-Host "   → Sign up with GitHub" -ForegroundColor White
Write-Host "   → Click 'Add new site' → 'Import existing project'" -ForegroundColor White
Write-Host "   → Choose your GitHub repo" -ForegroundColor White
Write-Host "   → Build command: [leave empty]" -ForegroundColor White
Write-Host "   → Publish directory: /" -ForegroundColor White
Write-Host "   → Click 'Deploy site'" -ForegroundColor White
Write-Host ""

Write-Host "3. Update API URL:" -ForegroundColor Cyan
Write-Host "   → After Render backend deploys, copy its URL" -ForegroundColor White
Write-Host "   → Open api.js in your project" -ForegroundColor White
Write-Host "   → Update line 7 with your backend URL" -ForegroundColor White
Write-Host "   → Example: return 'https://kimberly-backend.onrender.com/api';" -ForegroundColor Yellow
Write-Host "   → Commit and push changes" -ForegroundColor White
Write-Host "   → Netlify will auto-redeploy" -ForegroundColor White
Write-Host ""

Write-Host "════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  Deployment Complete!  " -ForegroundColor Green
Write-Host "════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

Write-Host "📧 Support: murerwakimberley@gmail.com" -ForegroundColor White
Write-Host "📱 WhatsApp: +263788171405" -ForegroundColor White
Write-Host ""

# Open deployment guide
$deployGuide = Join-Path $projectPath "DEPLOYMENT_GUIDE.md"
if (Test-Path $deployGuide) {
    Write-Host "📖 Opening deployment guide..." -ForegroundColor Cyan
    Start-Process $deployGuide
}

Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
