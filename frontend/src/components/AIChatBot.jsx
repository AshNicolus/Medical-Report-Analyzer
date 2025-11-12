import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Send, Bot, User, Loader, MessageSquare, AlertCircle } from 'lucide-react'
import api from '../api'

const AIChatBot = ({ isOpen, onClose, reportId, reportName }) => {
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [sessionId, setSessionId] = useState(null)
  const [error, setError] = useState('')
  const messagesEndRef = useRef(null)

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Load chat history when component opens
  useEffect(() => {
    if (isOpen && reportId) {
      loadChatHistory()
    }
  }, [isOpen, reportId])

  const loadChatHistory = async () => {
    if (!reportId) {
      setError('No report selected for chat')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Get patient ID from localStorage
      const userStr = localStorage.getItem('user')
      const user = userStr ? JSON.parse(userStr) : null
      const patientId = user?.id

      if (!patientId) {
        throw new Error('Patient ID not found. Please login again.')
      }

      const data = await api.get(`/api/chatbot/history/${reportId}?patient_id=${patientId}`)
      setSessionId(data.session_id)
      setMessages(data.messages || [])
    } catch (err) {
      console.error('Failed to load chat history:', err)
      // Initialize empty chat if no history exists
      setMessages([
        {
          role: 'assistant',
          content: `Hello! I'm your AI medical assistant. I can help you understand your ${reportName || 'medical report'}. What would you like to know?`,
          timestamp: new Date().toISOString()
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    
    if (!inputMessage.trim() || loading) return

    if (!reportId) {
      setError('Please select a report to chat about')
      return
    }

    const userMessage = inputMessage.trim()
    setInputMessage('')
    setError('')

    // Add user message to UI immediately
    const newUserMessage = {
      role: 'user',
      content: userMessage,
      timestamp: new Date().toISOString()
    }
    setMessages(prev => [...prev, newUserMessage])

    setLoading(true)

    try {
      // Get patient ID from localStorage
      const userStr = localStorage.getItem('user')
      const user = userStr ? JSON.parse(userStr) : null
      const patientId = user?.id

      if (!patientId) {
        throw new Error('Patient ID not found. Please login again.')
      }

      const data = await api.post('/api/chatbot/message', {
        patient_id: patientId,
        report_id: reportId,
        message: userMessage
      })

      // Add assistant response
      const assistantMessage = {
        role: 'assistant',
        content: data.message,
        timestamp: data.timestamp || new Date().toISOString()
      }
      setMessages(prev => [...prev, assistantMessage])
      
      if (data.session_id && !sessionId) {
        setSessionId(data.session_id)
      }
    } catch (err) {
      console.error('Chat error:', err)
      setError(err.response?.data?.error || 'Failed to send message. Please try again.')
      
      // Add error message to chat
      const errorMessage = {
        role: 'assistant',
        content: '❌ Sorry, I encountered an error processing your message. Please try again.',
        timestamp: new Date().toISOString(),
        isError: true
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  const formatTimestamp = (timestamp) => {
    try {
      const date = new Date(timestamp)
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    } catch {
      return ''
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-3xl h-[600px] glass-effect rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-medical p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg">AI Medical Assistant</h3>
                <p className="text-xs text-white/70">
                  {reportName ? `Discussing: ${reportName}` : 'Ready to help'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="bg-red-500/10 border-b border-red-500/20 p-3 flex items-center gap-2 text-red-400 text-sm">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && !loading ? (
              <div className="text-center text-gray-400 mt-12">
                <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>No messages yet. Start a conversation!</p>
              </div>
            ) : (
              messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  {/* Avatar */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    msg.role === 'user' 
                      ? 'bg-gradient-to-br from-blue-500 to-cyan-500' 
                      : msg.isError
                      ? 'bg-red-500/20'
                      : 'bg-gradient-to-br from-purple-500 to-pink-500'
                  }`}>
                    {msg.role === 'user' ? (
                      <User className="w-4 h-4" />
                    ) : (
                      <Bot className="w-4 h-4" />
                    )}
                  </div>

                  {/* Message Bubble */}
                  <div className={`flex-1 max-w-[75%] ${msg.role === 'user' ? 'text-right' : ''}`}>
                    <div className={`inline-block p-3 rounded-2xl ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-br from-blue-600 to-cyan-600 text-white'
                        : msg.isError
                        ? 'bg-red-500/10 border border-red-500/20 text-red-300'
                        : 'bg-white/5 border border-white/10'
                    }`}>
                      <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 px-2">
                      {formatTimestamp(msg.timestamp)}
                    </p>
                  </div>
                </motion.div>
              ))
            )}

            {/* Loading Indicator */}
            {loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-3"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-white/5 border border-white/10 p-3 rounded-2xl">
                  <div className="flex items-center gap-2">
                    <Loader className="w-4 h-4 animate-spin" />
                    <span className="text-sm text-gray-400">AI is typing...</span>
                  </div>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form onSubmit={handleSendMessage} className="border-t border-white/10 p-4">
            <div className="flex gap-3">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={reportId ? "Ask me anything about your report..." : "Please select a report first..."}
                disabled={loading || !reportId}
                className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-accent transition disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <button
                type="submit"
                disabled={loading || !inputMessage.trim() || !reportId}
                className="px-6 py-3 bg-gradient-medical rounded-xl font-semibold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                Send
              </button>
            </div>
            {!reportId && (
              <p className="text-xs text-yellow-400 mt-2 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Upload a report first to start chatting
              </p>
            )}
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default AIChatBot
