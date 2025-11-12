# AI ChatBot Component Documentation

## Overview
The `AIChatBot` component provides an interactive chat interface for patients to ask questions about their medical reports. It connects to the backend chatbot API and maintains conversation history.

## Component Location
`frontend/src/components/AIChatBot.jsx`

## Features

### ✨ Core Features
- **Real-time Chat**: Send and receive messages with AI assistant
- **Chat History**: Automatically loads previous conversations
- **Report Context**: AI responds based on specific medical report
- **Beautiful UI**: Modern glass-morphism design with animations
- **Auto-scroll**: Messages auto-scroll to latest
- **Loading States**: Visual feedback during AI processing
- **Error Handling**: User-friendly error messages

### 🎨 UI/UX Features
- Modal overlay with backdrop blur
- Animated message transitions
- User/AI avatar indicators
- Timestamp for each message
- Typing indicator when AI is processing
- Smooth scroll to new messages
- Click outside to close
- Disabled state when no report selected

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `isOpen` | boolean | Yes | Controls modal visibility |
| `onClose` | function | Yes | Callback when modal closes |
| `reportId` | string | No | ID of the report to discuss |
| `reportName` | string | No | Display name of the report |

## Usage

### Basic Usage
```jsx
import AIChatBot from '../components/AIChatBot'

function MyComponent() {
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [selectedReport, setSelectedReport] = useState(null)

  return (
    <>
      <button onClick={() => setIsChatOpen(true)}>
        Open Chat
      </button>

      <AIChatBot
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        reportId={selectedReport?.id}
        reportName={selectedReport?.name}
      />
    </>
  )
}
```

### In Patient Dashboard
The component is integrated into the Patient Dashboard with:
- Quick Action button to open chat with latest report
- Chat icon on each report card to start report-specific conversation
- Automatic report selection after upload

```jsx
// Quick Actions button
<button onClick={() => handleOpenChat()}>
  Chat with AI
</button>

// Report card chat button
<button onClick={() => handleOpenChat(report)}>
  <MessageSquare />
</button>
```

## Backend API Integration

### Endpoints Used

#### 1. Get Chat History
```
GET /api/chatbot/history/:report_id
```
**Response:**
```json
{
  "session_id": "...",
  "messages": [
    {
      "role": "user|assistant",
      "content": "...",
      "timestamp": "2025-11-09T10:30:00Z"
    }
  ]
}
```

#### 2. Send Message
```
POST /api/chatbot/message
```
**Request:**
```json
{
  "report_id": "...",
  "message": "What does my blood test show?"
}
```
**Response:**
```json
{
  "session_id": "...",
  "message": "Based on your blood test...",
  "timestamp": "2025-11-09T10:30:00Z"
}
```

## Component State

### State Variables
- `messages`: Array of chat messages
- `inputMessage`: Current user input text
- `loading`: Boolean for AI processing state
- `sessionId`: Chat session identifier
- `error`: Error message display

### Message Object Structure
```javascript
{
  role: 'user' | 'assistant',
  content: 'Message text',
  timestamp: ISO8601 timestamp,
  isError: boolean (optional)
}
```

## Styling

### Colors & Themes
- User messages: Blue to cyan gradient
- AI messages: Purple to pink gradient
- Error messages: Red tint
- Glass-morphism effects throughout

### Responsive Design
- Full-screen on mobile
- Max-width container on desktop
- Adaptive message bubble widths

## Key Functions

### `loadChatHistory()`
Fetches existing chat messages for the selected report. Initializes with welcome message if no history exists.

### `handleSendMessage(e)`
Sends user message to backend, updates UI optimistically, handles errors gracefully.

### `scrollToBottom()`
Auto-scrolls chat to latest message.

### `formatTimestamp(timestamp)`
Converts ISO timestamp to readable time format.

## Error Handling

### Scenarios Handled
1. **No Report Selected**: Displays warning, disables input
2. **Network Errors**: Shows error message in chat
3. **Invalid Report ID**: Fallback to welcome message
4. **API Failures**: User-friendly error display

### User Feedback
- Red error banner at top
- Error messages in chat with ❌ icon
- Disabled state for inputs when appropriate

## Animations

### Framer Motion Effects
- Modal fade in/out
- Message slide up on appear
- Smooth opacity transitions
- Loading spinner rotation

## Accessibility

### Features
- Keyboard navigation (Enter to send)
- Focus management
- Clear visual states (loading, error, disabled)
- ARIA-appropriate semantic HTML

## Performance Optimizations

1. **Auto-scroll optimization**: Uses `scrollIntoView` with smooth behavior
2. **Message refs**: Efficient DOM targeting for scroll
3. **Optimistic UI**: User messages appear immediately
4. **Conditional rendering**: Only loads when open

## Future Enhancements

### Potential Improvements
- [ ] Voice input/output
- [ ] File attachment support
- [ ] Export chat transcript
- [ ] Markdown formatting in messages
- [ ] Code syntax highlighting for medical terms
- [ ] Emoji reactions
- [ ] Multi-language support
- [ ] Dark/light theme toggle
- [ ] Chat search functionality
- [ ] Pin important messages

## Troubleshooting

### Common Issues

**Chat not loading history:**
- Check reportId is valid
- Verify backend chatbot service is running
- Check network tab for API errors

**Messages not sending:**
- Ensure reportId is provided
- Verify user is authenticated (future enhancement)
- Check backend logs for processing errors

**UI rendering issues:**
- Ensure framer-motion is installed
- Check Tailwind classes are compiled
- Verify lucide-react icons are available

## Dependencies

```json
{
  "framer-motion": "^10.16.16",
  "lucide-react": "^0.294.0",
  "axios": "^1.6.2"
}
```

## Testing

### Manual Testing Checklist
- [ ] Open chat modal
- [ ] Load existing chat history
- [ ] Send a message
- [ ] Receive AI response
- [ ] Error handling (invalid report)
- [ ] Close modal (X button, click outside)
- [ ] Mobile responsiveness
- [ ] Auto-scroll functionality
- [ ] Timestamp formatting

### Test Scenarios
1. **New Chat**: No history, shows welcome message
2. **Existing Chat**: Loads previous conversation
3. **No Report**: Shows warning, disables input
4. **Network Error**: Displays error gracefully
5. **Long Messages**: Text wraps properly
6. **Many Messages**: Scroll works correctly

## Integration Example

Complete example from Patient Dashboard:

```jsx
const PatientDashboard = () => {
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [selectedReport, setSelectedReport] = useState(null)

  const handleOpenChat = (report = null) => {
    if (report) {
      setSelectedReport(report)
    } else if (reports.length > 0) {
      setSelectedReport(reports[0])
    }
    setIsChatOpen(true)
  }

  return (
    <div>
      {/* Quick Action Button */}
      <button onClick={() => handleOpenChat()}>
        Chat with AI
      </button>

      {/* Report Cards with Chat */}
      {reports.map(report => (
        <div key={report.id}>
          <span>{report.name}</span>
          <button onClick={() => handleOpenChat(report)}>
            <MessageSquare />
          </button>
        </div>
      ))}

      {/* Chat Modal */}
      <AIChatBot
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        reportId={selectedReport?.id}
        reportName={selectedReport?.name}
      />
    </div>
  )
}
```

## Support
For issues or questions:
1. Check browser console for errors
2. Verify backend chatbot service is running
3. Review network requests in DevTools
4. Check this documentation
