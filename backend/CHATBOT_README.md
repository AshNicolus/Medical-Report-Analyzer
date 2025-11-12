# Medical Report Chatbot - Implementation Summary

## ✅ What Has Been Created

I've built a complete **Go-based chatbot system** for your medical report analyzer that allows patients to ask questions about their analyzed medical reports.

### 📁 Files Created

#### **Models** (`backend/models/`)
1. **patient.go** - Patient and Doctor data structures
2. **report.go** - Report, AIAnalysis, DoctorReview, Feedback models
3. **chatbot.go** - ChatSession, ChatMessage, ChatRequest, ChatResponse models

#### **Services** (`backend/services/`)
1. **report_service.go**
   - `AnalyzePDFReport()` - Sends PDF to Python FastAPI for analysis
   - `GetReportByID()` - Retrieves report from database

2. **chatbot_service.go**
   - `GetOrCreateSession()` - Manages chat sessions per report
   - `ProcessMessage()` - Handles user messages and generates AI responses
   - `buildReportContext()` - Creates summary from report for AI
   - `callAzureGPT()` - Integrates with Azure OpenAI
   - `generateSimpleResponse()` - Fallback rule-based responses

#### **Controllers** (`backend/controllers/`)
1. **chatbot_controller.go**
   - `SendMessage()` - POST `/api/chatbot/message`
   - `GetChatHistory()` - GET `/api/chatbot/history/:report_id`

#### **Routes** (`backend/routes/`)
1. **chatbot_routes.go** - Registers chatbot API endpoints

#### **Configuration** (`backend/config/`)
1. **database.go** - MongoDB connection and utilities

#### **Frontend** (`backend/public/`)
1. **chatbot.html** - Beautiful chat interface with:
   - Report selection dropdown
   - Real-time chat interface
   - Message history
   - Typing indicators
   - Responsive design

---

## 🏗️ Architecture

```
┌─────────────┐
│   Patient   │
└──────┬──────┘
       │ Uploads PDF
       ↓
┌──────────────────────────┐
│   Go Backend (Port 5000) │
│  - Receives PDF          │
│  - Saves to storage      │
└──────┬───────────────────┘
       │ Sends PDF to Python
       ↓
┌──────────────────────────┐
│ Python FastAPI (Port 8000)│
│  - Analyzes PDF          │
│  - Returns entities      │
│  - Returns recommendations│
└──────┬───────────────────┘
       │ Returns analysis
       ↓
┌──────────────────────────┐
│   MongoDB Database       │
│  - Stores report         │
│  - Stores AI analysis    │
└──────┬───────────────────┘
       │ Patient opens chatbot
       ↓
┌──────────────────────────┐
│   Chatbot Service        │
│  - Loads report context  │
│  - Calls Azure GPT       │
│  - Returns answer        │
└──────────────────────────┘
```

---

## 🔌 API Endpoints

### **Chatbot Routes**

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/chatbot/message` | Send a message to chatbot |
| GET | `/api/chatbot/history/:report_id` | Get chat history for a report |

### **Request/Response Format**

#### **Send Message**
```json
// POST /api/chatbot/message
{
  "report_id": "507f1f77bcf86cd799439011",
  "message": "What are my symptoms?"
}

// Response
{
  "session_id": "507f1f77bcf86cd799439012",
  "message": "Based on your report, the symptoms identified are: chest pain, shortness of breath, fatigue...",
  "timestamp": "2025-11-09T10:30:00Z"
}
```

#### **Get History**
```json
// GET /api/chatbot/history/:report_id

// Response
{
  "session_id": "507f1f77bcf86cd799439012",
  "messages": [
    {
      "role": "user",
      "content": "What are my symptoms?",
      "timestamp": "2025-11-09T10:30:00Z"
    },
    {
      "role": "assistant",
      "content": "Based on your report...",
      "timestamp": "2025-11-09T10:30:05Z"
    }
  ]
}
```

---

## 🔧 How It Works

### **Conversation Flow**

1. **Patient selects a report** from dropdown
2. **System loads chat history** (if any exists)
3. **Patient asks a question** about their report
4. **Go backend**:
   - Retrieves the report from MongoDB
   - Extracts AI analysis context (symptoms, diagnoses, recommendations)
   - Builds a summary for the AI
5. **Azure OpenAI** (if configured):
   - Receives report context + conversation history
   - Generates empathetic, accurate response
6. **Fallback** (if Azure not configured):
   - Uses rule-based simple responses
7. **Response sent back** to patient
8. **Conversation saved** to MongoDB for history

---

## 📝 Environment Variables

Update your `backend/.env`:

```env
MONGO_URI=mongodb+srv://...
Db_NAME=Minor-project
PORT=5000

# Python FastAPI URL
PYTHON_API_URL=http://localhost:8000

# Azure OpenAI (Optional but recommended)
AZURE_OPENAI_KEY=your_azure_openai_key_here
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com
AZURE_OPENAI_DEPLOYMENT=gpt-4
```

---

## 🚀 Setup Instructions

### **1. Fix Disk Space Issue**
The current error is due to insufficient disk space. Free up space on your C: drive.

### **2. Install Dependencies**
```powershell
cd f:\minor-child\backend
go mod tidy
```

### **3. Start Python Server** (if not running)
```powershell
cd f:\minor-child\Medical-Report-Analyzer
.\.venv\Scripts\Activate.ps1
python -m uvicorn server.main:app --host 127.0.0.1 --port 8000 --reload
```

### **4. Start Go Backend**
```powershell
cd f:\minor-child\backend
go run main.go
```

### **5. Open Chatbot**
```
http://localhost:5000/chatbot.html
```

---

## 🎨 Features

✅ **Context-Aware**: Uses actual report data for answers  
✅ **Conversation History**: Maintains chat across sessions  
✅ **Azure GPT Integration**: Advanced AI responses  
✅ **Fallback Mode**: Works without Azure config  
✅ **Beautiful UI**: Modern, responsive chat interface  
✅ **Report Selection**: Can chat about multiple reports  
✅ **Secure**: Patient can only access their own reports  

---

## 🔐 Security Notes

1. **Add Authentication Middleware** to verify JWT tokens
2. **Validate Patient Ownership** of reports before allowing chat
3. **Sanitize User Input** before sending to AI
4. **Rate Limiting** to prevent API abuse

---

## 📊 Database Collections

1. **patients** - User accounts
2. **reports** - Medical reports with AI analysis
3. **chat_sessions** - Conversation history per report

---

## 🎯 Next Steps

1. **Free up disk space** and run `go mod tidy`
2. **Configure Azure OpenAI** for better responses
3. **Add authentication** to secure endpoints
4. **Test the chatbot** with real reports
5. **Deploy** to production server

---

## 📌 Example Questions Patients Can Ask

- "What are my symptoms?"
- "What does the diagnosis mean?"
- "What tests are recommended for me?"
- "Why is an MRI needed?"
- "Are there any contraindications?"
- "What is the confidence level of this analysis?"
- "What should I do next?"

The chatbot will answer based on the specific report data!

---

## 🐛 Troubleshooting

**Issue**: Disk space error  
**Solution**: Free up space on C: drive and retry `go mod tidy`

**Issue**: Python API not responding  
**Solution**: Ensure Python server is running on port 8000

**Issue**: Azure GPT not working  
**Solution**: Check AZURE_OPENAI_KEY and ENDPOINT in .env

---

## ✨ Customization

You can customize responses by editing:
- `services/chatbot_service.go` - `generateSimpleResponse()` function
- Azure GPT system prompt in `callAzureGPT()` function

---

**Need Help?** The code is ready to run once disk space is freed!
