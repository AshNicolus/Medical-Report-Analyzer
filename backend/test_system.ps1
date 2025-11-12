# Medical Report Chatbot - Quick Test Script
# Run this to verify everything is working

Write-Host @"
╔══════════════════════════════════════════════════════════╗
║   🏥 Medical Report Chatbot - System Test              ║
╚══════════════════════════════════════════════════════════╝
"@ -ForegroundColor Cyan

$ErrorActionPreference = "Continue"

# Test 1: Go Backend
Write-Host "`n[1/4] Testing Go Backend (Port 5000)..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/health" -UseBasicParsing -TimeoutSec 3 2>$null
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Go Backend is RUNNING" -ForegroundColor Green
        $goStatus = $true
    }
} catch {
    Write-Host "❌ Go Backend is NOT running" -ForegroundColor Red
    Write-Host "   → Start it: cd f:\minor-child\backend; go run main.go" -ForegroundColor Gray
    $goStatus = $false
}

# Test 2: Python FastAPI
Write-Host "`n[2/4] Testing Python FastAPI (Port 8000)..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8000/health" -TimeoutSec 3 2>$null
    Write-Host "✅ Python API is RUNNING" -ForegroundColor Green
    if ($response.startup_warnings -and $response.startup_warnings.Count -gt 0) {
        Write-Host "   ⚠️  Warnings: $($response.startup_warnings -join ', ')" -ForegroundColor Yellow
    }
    $pythonStatus = $true
} catch {
    Write-Host "❌ Python API is NOT running" -ForegroundColor Red
    Write-Host "   → Start it: python -m uvicorn server.main:app --host 127.0.0.1 --port 8000" -ForegroundColor Gray
    $pythonStatus = $false
}

# Test 3: Chatbot Page
Write-Host "`n[3/4] Testing Chatbot Frontend..." -ForegroundColor Yellow
if ($goStatus) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:5000/chatbot.html" -UseBasicParsing -TimeoutSec 3 2>$null
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ Chatbot page is ACCESSIBLE" -ForegroundColor Green
        }
    } catch {
        Write-Host "❌ Chatbot page not found" -ForegroundColor Red
        Write-Host "   → Check if public/chatbot.html exists" -ForegroundColor Gray
    }
} else {
    Write-Host "⏭️  Skipped (Go backend not running)" -ForegroundColor Gray
}

# Test 4: Environment Configuration
Write-Host "`n[4/4] Checking Configuration..." -ForegroundColor Yellow
$envPath = "f:\minor-child\backend\.env"
if (Test-Path $envPath) {
    Write-Host "✅ .env file exists" -ForegroundColor Green
    $envContent = Get-Content $envPath -Raw
    
    if ($envContent -match "MONGO_URI=") {
        Write-Host "   ✓ MongoDB URI configured" -ForegroundColor Green
    } else {
        Write-Host "   ✗ MongoDB URI missing" -ForegroundColor Red
    }
    
    if ($envContent -match "PYTHON_API_URL=") {
        Write-Host "   ✓ Python API URL configured" -ForegroundColor Green
    } else {
        Write-Host "   ✗ Python API URL missing" -ForegroundColor Red
    }
    
    if ($envContent -match "AZURE_OPENAI_KEY=" -and $envContent -notmatch "AZURE_OPENAI_KEY=$") {
        Write-Host "   ✓ Azure OpenAI configured" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  Azure OpenAI not configured (will use fallback)" -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ .env file not found" -ForegroundColor Red
}

# Summary
Write-Host "`n" + ("═" * 60) -ForegroundColor Cyan
Write-Host "SUMMARY" -ForegroundColor Cyan
Write-Host ("═" * 60) -ForegroundColor Cyan

if ($goStatus -and $pythonStatus) {
    Write-Host "`n🎉 System is READY!" -ForegroundColor Green
    Write-Host "`n📌 Next Steps:" -ForegroundColor Cyan
    Write-Host "   1. Open your browser" -ForegroundColor White
    Write-Host "   2. Go to: http://localhost:5000/chatbot.html" -ForegroundColor Yellow
    Write-Host "   3. Select a medical report" -ForegroundColor White
    Write-Host "   4. Ask questions about the report!" -ForegroundColor White
    
    Write-Host "`n💡 Example Questions:" -ForegroundColor Cyan
    Write-Host "   • What symptoms were found in my report?" -ForegroundColor White
    Write-Host "   • What tests are recommended?" -ForegroundColor White
    Write-Host "   • What do my diagnoses mean?" -ForegroundColor White
    Write-Host "   • Why is an MRI needed?" -ForegroundColor White
    
} else {
    Write-Host "`n⚠️  System is NOT ready" -ForegroundColor Yellow
    Write-Host "`nPlease start the missing services:" -ForegroundColor Yellow
    
    if (-not $goStatus) {
        Write-Host "`n  Go Backend:" -ForegroundColor Red
        Write-Host "    cd f:\minor-child\backend" -ForegroundColor Gray
        Write-Host "    go run main.go" -ForegroundColor Gray
    }
    
    if (-not $pythonStatus) {
        Write-Host "`n  Python API:" -ForegroundColor Red
        Write-Host "    cd f:\minor-child\Medical-Report-Analyzer" -ForegroundColor Gray
        Write-Host "    .\.venv\Scripts\Activate.ps1" -ForegroundColor Gray
        Write-Host "    python -m uvicorn server.main:app --host 127.0.0.1 --port 8000" -ForegroundColor Gray
    }
}

Write-Host "`n" + ("═" * 60) -ForegroundColor Cyan
Write-Host ""
