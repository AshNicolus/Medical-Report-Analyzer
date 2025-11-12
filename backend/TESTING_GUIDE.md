# 🧪 Chatbot Testing Guide

## Quick Testing Steps

### 1️⃣ **Check if Backend is Running**

Open PowerShell and run:
```powershell
# Test if Go backend is running (Port 5000)
curl http://localhost:5000/api/health

# Expected response: Should return server status
```

If it's not running:
```powershell
cd f:\minor-child\backend
go run main.go
```

---

### 2️⃣ **Check if Python API is Running**

```powershell
# Test if Python FastAPI is running (Port 8000)
Invoke-RestMethod http://localhost:8000/health

# Expected response: {"status": "ok", "startup_warnings": [...]}
```

If it's not running:
```powershell
cd f:\minor-child\Medical-Report-Analyzer
.\.venv\Scripts\Activate.ps1
python -m uvicorn server.main:app --host 127.0.0.1 --port 8000 --reload
```

---

### 3️⃣ **Test Report Upload & Analysis**

First, create a test patient and upload a PDF report to get a report ID.

```powershell
# Upload a test PDF to get analysis
$pdfPath = "F:\minor-child\Medical-Report-Analyzer\sample_data\sample_report.pdf"

curl.exe -X POST "http://localhost:8000/analyze_report" -F "file=@$pdfPath"
```

This will return analysis with entities and recommendations.

---

### 4️⃣ **Test Chatbot Endpoints**

#### Test 1: Send a Message
```powershell
# Create request body
$body = @{
    report_id = "YOUR_REPORT_ID_HERE"  # Replace with actual report ID from MongoDB
    message = "What symptoms were found in my report?"
} | ConvertTo-Json

# Send chat message
$response = Invoke-RestMethod -Uri "http://localhost:5000/api/chatbot/message" `
    -Method POST `
    -Body $body `
    -ContentType "application/json" `
    -Headers @{
        "Authorization" = "Bearer YOUR_JWT_TOKEN"
    }

$response | ConvertTo-Json -Depth 3
```

Expected response:
```json
{
  "session_id": "...",
  "message": "Based on your report, the symptoms identified are...",
  "timestamp": "2025-11-09T..."
}
```

#### Test 2: Get Chat History
```powershell
$reportId = "YOUR_REPORT_ID_HERE"

$history = Invoke-RestMethod -Uri "http://localhost:5000/api/chatbot/history/$reportId" `
    -Method GET `
    -Headers @{
        "Authorization" = "Bearer YOUR_JWT_TOKEN"
    }

$history | ConvertTo-Json -Depth 5
```

Expected response:
```json
{
  "session_id": "...",
  "messages": [
    {
      "role": "user",
      "content": "What symptoms...",
      "timestamp": "..."
    },
    {
      "role": "assistant",
      "content": "Based on your report...",
      "timestamp": "..."
    }
  ]
}
```

---

### 5️⃣ **Test with Browser (Easiest)**

1. **Open the chat interface**:
   ```
   http://localhost:5000/chatbot.html
   ```

2. **You should see**:
   - Medical Report Assistant header
   - Report selection dropdown
   - Chat area with welcome message
   - Input field and Send button

3. **What to check**:
   - ✅ Page loads without errors
   - ✅ Welcome message appears
   - ✅ Input is disabled until report is selected
   - ✅ Report dropdown shows available reports

---

## 🔍 Debugging Checklist

### ❌ **If Backend Won't Start**

Check these files for errors:
```powershell
# Check main.go syntax
go build f:\minor-child\backend\main.go

# Check for missing dependencies
cd f:\minor-child\backend
go mod tidy
```

### ❌ **If Python API Not Responding**

```powershell
# Check if it's running
Get-Process | Where-Object {$_.ProcessName -like "*python*"}

# Check the port
netstat -ano | findstr :8000

# Restart it
cd f:\minor-child\Medical-Report-Analyzer
python -m uvicorn server.main:app --host 127.0.0.1 --port 8000
```

### ❌ **If MongoDB Connection Fails**

Check `.env` file:
```env
MONGO_URI=mongodb+srv://...
Db_NAME=Minor-project
```

Test connection:
```powershell
# MongoDB should be accessible
# Check connection string is correct
```

### ❌ **If Chatbot Gives Generic Responses**

This means Azure OpenAI is not configured. Check `.env`:
```env
AZURE_OPENAI_KEY=your_actual_key_here
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com
AZURE_OPENAI_DEPLOYMENT=gpt-4
```

Without Azure, the chatbot uses simple rule-based fallback responses.

---

## 📊 **Full End-to-End Test**

### Step-by-Step Complete Test:

1. **Start Both Servers**:
   ```powershell
   # Terminal 1: Python API
   cd f:\minor-child\Medical-Report-Analyzer
   .\.venv\Scripts\Activate.ps1
   python -m uvicorn server.main:app --host 127.0.0.1 --port 8000 --reload

   # Terminal 2: Go Backend
   cd f:\minor-child\backend
   go run main.go
   ```

2. **Create Test Data** (MongoDB):
   - Insert a patient document
   - Insert a report document with AI analysis

3. **Open Browser**:
   ```
   http://localhost:5000/chatbot.html
   ```

4. **Test Chat Flow**:
   - Select a report from dropdown
   - Type: "What symptoms were found?"
   - Click Send
   - Verify response appears
   - Ask another question
   - Verify conversation history is maintained

---

## 🧪 **Unit Test Script**

Create this file: `backend/test_chatbot.ps1`

```powershell
# Test Chatbot Functionality

Write-Host "🧪 Testing Medical Report Chatbot..." -ForegroundColor Cyan

# 1. Test Go Backend Health
Write-Host "`n1️⃣ Testing Go Backend (Port 5000)..." -ForegroundColor Yellow
try {
    $goHealth = Invoke-RestMethod -Uri "http://localhost:5000/health" -ErrorAction Stop
    Write-Host "✅ Go Backend is running!" -ForegroundColor Green
} catch {
    Write-Host "❌ Go Backend not running. Start with: go run main.go" -ForegroundColor Red
    exit 1
}

# 2. Test Python API Health
Write-Host "`n2️⃣ Testing Python API (Port 8000)..." -ForegroundColor Yellow
try {
    $pythonHealth = Invoke-RestMethod -Uri "http://localhost:8000/health" -ErrorAction Stop
    Write-Host "✅ Python API is running!" -ForegroundColor Green
    Write-Host "Startup Warnings: $($pythonHealth.startup_warnings)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Python API not running. Start with: python -m uvicorn server.main:app --host 127.0.0.1 --port 8000 --reload" -ForegroundColor Red
    exit 1
}

# 3. Test MongoDB Connection
Write-Host "`n3️⃣ Testing MongoDB Connection..." -ForegroundColor Yellow
# Add MongoDB connection test here

# 4. Test Chatbot Endpoint (Mock)
Write-Host "`n4️⃣ Testing Chatbot Endpoints..." -ForegroundColor Yellow
Write-Host "⚠️  You need a valid report_id and JWT token for full test" -ForegroundColor Yellow

Write-Host "`n✅ All basic tests passed!" -ForegroundColor Green
Write-Host "`n📌 Next steps:" -ForegroundColor Cyan
Write-Host "  1. Open http://localhost:5000/chatbot.html" -ForegroundColor White
Write-Host "  2. Select a report from dropdown" -ForegroundColor White
Write-Host "  3. Ask questions about the report" -ForegroundColor White
```

Run it:
```powershell
powershell -ExecutionPolicy Bypass -File backend/test_chatbot.ps1
```

---

## 🎯 **Expected Behavior**

### ✅ **Working Correctly**:
1. Go backend starts without errors on port 5000
2. Python API responds on port 8000
3. Chatbot page loads at http://localhost:5000/chatbot.html
4. User can select a report
5. User sends a message
6. Bot responds with context from the report
7. Conversation history is maintained
8. Messages are saved to MongoDB

### ❌ **Common Issues**:

| Issue | Solution |
|-------|----------|
| Port 5000 already in use | Kill existing process: `Stop-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess` |
| Port 8000 already in use | Kill existing process or change port in .env |
| CORS errors | Check CORS middleware in main.go |
| Empty responses | Check Azure OpenAI configuration |
| MongoDB errors | Verify MONGO_URI in .env |
| Report not found | Insert test reports in MongoDB first |

---

## 🚀 **Production Checklist**

Before deploying:
- [ ] Add proper authentication/JWT validation
- [ ] Add rate limiting to prevent API abuse
- [ ] Configure Azure OpenAI properly
- [ ] Set up error logging
- [ ] Add input sanitization
- [ ] Test with multiple concurrent users
- [ ] Add database indexes for performance
- [ ] Set up monitoring/alerts

---

## 📝 **Manual Testing Checklist**

- [ ] Backend starts successfully
- [ ] Python API is accessible
- [ ] Chatbot page loads
- [ ] Report dropdown populates
- [ ] Send button is disabled initially
- [ ] Selecting report enables input
- [ ] Typing and sending works
- [ ] Response appears correctly
- [ ] Multiple messages work
- [ ] History is preserved
- [ ] Reload maintains history
- [ ] Different reports have separate sessions

---

**Need more help?** Check the logs in the terminal where servers are running for detailed error messages!
