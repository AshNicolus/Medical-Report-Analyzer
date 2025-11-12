# Frontend-Backend Integration Guide

## Overview
The frontend React application is now fully connected to the Go backend API. This guide explains the integration architecture and how to use it.

## Architecture

### API Client (`frontend/src/api.js`)
- Centralized axios-based HTTP client
- Reads base URL from `VITE_API_BASE_URL` environment variable
- Provides `get()`, `post()`, and `put()` methods
- Automatic JSON serialization/deserialization
- 10-second timeout for all requests

### Development Proxy
The Vite dev server (`vite.config.js`) proxies `/api/*` requests to `http://localhost:8080` to avoid CORS issues during development.

## Integrated Pages

### 1. Login Page (`LoginPage.jsx`)
**Features:**
- Patient and Doctor login/signup
- Form validation with error display
- Loading states during API calls
- User data stored in localStorage on successful login

**Backend Endpoints:**
- `POST /api/auth/patient/login` - Patient login
- `POST /api/auth/patient/signup` - Patient registration
- `POST /api/auth/doctor/login` - Doctor login
- `POST /api/auth/doctor/signup` - Doctor registration

**Request/Response:**
```javascript
// Login Request
{
  "email": "user@example.com",
  "password": "password123"
}

// Login Response
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": "...",
    "name": "...",
    "email": "...",
    "type": "patient" | "doctor",
    // ... other fields
  }
}
```

### 2. Patient Dashboard (`PatientDashboard.jsx`)
**Features:**
- Displays logged-in patient name from localStorage
- PDF report upload with progress feedback
- Real-time upload status and error handling
- Automatic user redirect if not logged in

**Backend Endpoints:**
- `POST /api/patient/upload` - Upload medical report PDF

**Request/Response:**
```javascript
// Upload: multipart/form-data
FormData {
  file: <PDF File>,
  patient_id: "..." // optional
}

// Upload Response
{
  "success": true,
  "report_id": "...",
  "analysis": {
    "entities": { ... },
    "recommendations": [ ... ],
    "confidence_score": 94.5
  }
}
```

### 3. Doctor Dashboard (`DoctorDashboard.jsx`)
**Features:**
- Fetches pending reports on page load
- Displays loading spinner during fetch
- Error handling with user-friendly messages
- Real-time report data from backend

**Backend Endpoints:**
- `GET /api/doctor/reports?status=pending` - Fetch reports

**Response:**
```javascript
{
  "success": true,
  "count": 12,
  "reports": [
    {
      "id": "...",
      "patient_id": "...",
      "pdf_filename": "...",
      "uploaded_at": "...",
      "status": "pending",
      "ai_analysis": {
        "confidence_score": 85.2,
        // ... other analysis data
      }
    }
  ]
}
```

## Running the Application

### Prerequisites
1. **Backend** - Go 1.21+ with MongoDB running
2. **Frontend** - Node.js 18+ with npm

### Step 1: Start the Backend
```powershell
cd backend
go run main.go
# Backend starts on http://localhost:8080
```

### Step 2: Start the Frontend
```powershell
cd frontend
npm install  # if not already done
npm run dev
# Frontend starts on http://localhost:3000
```

### Step 3: Access the Application
- Landing page: http://localhost:3000
- Login page: http://localhost:3000/login
- Patient dashboard: http://localhost:3000/patient
- Doctor dashboard: http://localhost:3000/doctor

## Environment Configuration

### Development (default)
The Vite proxy automatically forwards `/api` requests to the backend at `localhost:8080`.

### Production
Create a `.env.local` file in the `frontend` directory:
```env
VITE_API_BASE_URL=https://your-backend-api.com
```

## Authentication Flow

1. User fills login/signup form
2. Frontend sends credentials to backend
3. Backend validates and returns user object
4. Frontend stores user in `localStorage`
5. Protected pages check localStorage for user
6. Logout removes user from localStorage

## Error Handling

### Frontend
- Network errors display user-friendly messages
- Form validation prevents invalid submissions
- Loading states prevent duplicate requests
- Axios interceptors can be added for global error handling

### Backend
- Returns consistent error format: `{ "error": "message" }`
- HTTP status codes indicate error type:
  - 400: Bad request (validation error)
  - 401: Unauthorized
  - 404: Not found
  - 409: Conflict (duplicate email/license)
  - 500: Server error

## Next Steps

### Recommended Enhancements
1. **JWT Authentication** - Add token-based auth instead of localStorage
2. **Report Listing** - Add endpoint to fetch patient's reports list
3. **Report Details** - Add report detail view page
4. **Review Actions** - Implement doctor review/edit functionality
5. **Real-time Updates** - Add WebSocket for live report status
6. **File Download** - Add PDF download functionality
7. **Profile Management** - Add user profile editing
8. **Password Reset** - Implement forgot password flow

### Security Improvements
1. Add authentication middleware to backend routes
2. Implement CSRF protection
3. Add rate limiting on auth endpoints
4. Use secure HTTP-only cookies for sessions
5. Implement refresh tokens for long sessions

## API Reference

### Authentication Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/patient/signup` | Register new patient |
| POST | `/api/auth/patient/login` | Patient login |
| POST | `/api/auth/doctor/signup` | Register new doctor |
| POST | `/api/auth/doctor/login` | Doctor login |
| POST | `/api/auth/logout` | Logout (client-side) |

### Patient Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/patient/upload` | Upload medical report |
| GET | `/api/patient/reports/:id` | Get report by ID |

### Doctor Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/doctor/reports` | List all reports (with filters) |
| GET | `/api/doctor/reports/:id` | Get specific report |
| POST | `/api/doctor/reports/:id/review` | Submit review |
| PUT | `/api/doctor/reports/:id/edit` | Edit AI analysis |
| GET | `/api/doctor/patients` | List all patients |
| GET | `/api/doctor/patients/:id/reports` | Get patient reports |

## Troubleshooting

### CORS Errors
- Ensure backend is running on port 8080
- Check Vite proxy configuration in `vite.config.js`
- Backend already has CORS enabled in `main.go`

### 404 Not Found
- Verify backend routes are registered in `main.go`
- Check frontend API paths match backend routes
- Ensure both servers are running

### Upload Failures
- Check file is PDF format
- Verify backend temp directory is writable
- Check file size limits (if any)
- Review backend logs for analysis errors

### Login Failures
- Verify MongoDB is running and connected
- Check backend logs for database errors
- Ensure user exists in database for login
- Password must be 6+ characters for signup

## File Structure
```
frontend/
├── src/
│   ├── api.js                    # API client
│   ├── pages/
│   │   ├── LoginPage.jsx         # Auth page
│   │   ├── PatientDashboard.jsx  # Patient portal
│   │   └── DoctorDashboard.jsx   # Doctor portal
│   └── ...
├── .env.example                  # Environment template
└── vite.config.js               # Dev proxy config

backend/
├── controllers/
│   ├── auth_controller.go       # Auth logic
│   ├── report_controller.go     # Patient reports
│   └── doctor_controller.go     # Doctor actions
├── routes/
│   ├── auth_routes.go
│   ├── report_routes.go
│   └── doctor_routes.go
└── main.go                      # Server + CORS
```

## Support
For issues or questions, review:
1. Backend logs in terminal
2. Frontend console in browser DevTools
3. Network tab in browser DevTools
4. This integration guide
