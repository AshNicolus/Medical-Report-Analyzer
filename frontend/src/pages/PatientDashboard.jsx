import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Activity, Upload, FileText, MessageSquare, LogOut, User,
  TrendingUp, Clock, CheckCircle2, AlertCircle, Download, ChevronDown, ChevronUp
} from 'lucide-react'
import GlowButton from '../components/GlowButton'
import AIChatBot from '../components/AIChatBot'
import ReportSummary from '../components/ReportSummary'
import Profile from '../components/Profile'
import { generateReportPDF } from '../utils/pdfGenerator'
import api from '../api'

const PatientDashboard = () => {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [uploadSuccess, setUploadSuccess] = useState('')
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [selectedReport, setSelectedReport] = useState(null)
  const [isSummaryOpen, setIsSummaryOpen] = useState(false)
  const [currentAnalysis, setCurrentAnalysis] = useState(null)
  const [expandedReviews, setExpandedReviews] = useState({}) // Track which reviews are expanded
  const [isProfileOpen, setIsProfileOpen] = useState(false)

  useEffect(() => {
    // Get user from localStorage
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser)
      setUser(parsedUser)
      // Fetch reports for this user
      fetchAllReports(parsedUser.id)
    } else {
      // If no user, redirect to login
      navigate('/login')
    }
  }, [navigate])

  const fetchAllReports = async (patientId) => {
    if (!patientId) return

    setLoading(true)
    setError('')

    try {
      const data = await api.post('/api/patient/reports', {
        patient_id: patientId
      })

      if (data.success && data.reports) {
        // Transform backend response to match frontend format
        const formattedReports = data.reports.map(report => ({
          id: report.id,
          name: report.name.replace('.pdf', ''),
          date: report.date,
          status: report.status,
          confidence: report.confidence,
          analysis: report.analysis,
          doctorReview: report.doctor_review // Include doctor review data
        }))
        setReports(formattedReports)
      }
    } catch (err) {
      console.error('Failed to fetch reports:', err)
      // Don't show error if it's just empty reports
      if (err.response?.status !== 404) {
        setError('Failed to load reports')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try{
  
      await api.post('/api/auth/logout')
      console.log("Logged out");
    }catch(e){
      console.error('Logout error:', e)
    }
    
    localStorage.removeItem('user')
    navigate('/')
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.type !== 'application/pdf') {
      setError('Please upload a PDF file')
      return
    }

    setUploading(true)
    setError('')
    setUploadSuccess('')

    try {
      const formData = new FormData()
      formData.append('file', file)
      if (user?.id) {
        formData.append('patient_id', user.id)
      }

      // Use axios directly for file upload
      const response = await api.client.post('/api/patient/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      const data = response.data
      if (data.success) {
        setUploadSuccess(`Report uploaded successfully! Report ID: ${data.report_id}`)
        
        // Re-fetch all reports from backend to ensure persistence
        if (user?.id) {
          await fetchAllReports(user.id)
        }
        
        // Find the newly uploaded report for showing summary
        const newReport = {
          id: data.report_id,
          name: file.name.replace('.pdf', ''),
          analysis: data.analysis
        }
        
        // Auto-select this report for chat
        setSelectedReport({
          id: data.report_id,
          name: file.name
        })

        // Show the analysis summary
        setCurrentAnalysis(data.analysis)
        setIsSummaryOpen(true)
      } else {
        setError(data.error || 'Upload failed')
      }
    } catch (err) {
      console.error('Upload error:', err)
      setError(err.response?.data?.error || err.message || 'Failed to upload report')
    } finally {
      setUploading(false)
      // Reset file input
      e.target.value = ''
    }
  }

  const handleOpenChat = (report = null) => {
    if (report) {
      setSelectedReport(report)
    } else if (reports.length > 0) {
      // Select the most recent report if none specified
      setSelectedReport(reports[0])
    }
    setIsChatOpen(true)
  }

  const handleViewSummary = (report) => {
    if (report.analysis) {
      setCurrentAnalysis(report.analysis)
      setSelectedReport(report)
      setIsSummaryOpen(true)
    }
  }

  const toggleReviewExpansion = (reportId) => {
    setExpandedReviews(prev => ({
      ...prev,
      [reportId]: !prev[reportId]
    }))
  }

  const handleDownloadPDF = async (report) => {
    try {
      await generateReportPDF(report)
    } catch (err) {
      console.error('PDF generation error:', err)
      setError('Failed to generate PDF summary')
      setTimeout(() => setError(''), 3000)
    }
  }

  return (
    <div className="min-h-screen p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-medical rounded-xl flex items-center justify-center">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gradient">Patient Dashboard</h1>
              <p className="text-gray-400">Welcome back, {user?.name || 'Patient'}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 glass-effect rounded-xl hover:bg-white/10 transition"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-6 mb-8">
        {[
          { 
            label: 'Total Reports', 
            value: reports.length.toString(), 
            icon: <FileText />, 
            color: 'from-blue-500 to-cyan-500' 
          },
          { 
            label: 'Pending Review', 
            value: reports.filter(r => r.status === 'pending').length.toString(), 
            icon: <Clock />, 
            color: 'from-purple-500 to-pink-500' 
          },
          { 
            label: 'Completed', 
            value: reports.filter(r => r.status === 'completed').length.toString(), 
            icon: <CheckCircle2 />, 
            color: 'from-green-500 to-emerald-500' 
          },
          { 
            label: 'Avg Confidence', 
            value: reports.length > 0 
              ? `${((reports.reduce((acc, r) => acc + (r.confidence || 0), 0) / reports.length) / 100).toFixed(0)}%`
              : '0%', 
            icon: <TrendingUp />, 
            color: 'from-orange-500 to-red-500' 
          },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glow-card"
          >
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-4`}>
              {stat.icon}
            </div>
            <div className="text-3xl font-bold mb-1">{stat.value}</div>
            <div className="text-sm text-gray-400">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto grid lg:grid-cols-3 gap-8">
        {/* Upload Section */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glow-card mb-8"
          >
            <h2 className="text-2xl font-bold mb-4">Upload New Report</h2>
            
            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}
            
            {uploadSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm">
                {uploadSuccess}
              </div>
            )}
            
            <label className="block border-2 border-dashed border-white/20 rounded-xl p-12 text-center hover:border-accent transition cursor-pointer">
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileUpload}
                disabled={uploading}
                className="hidden"
              />
              <Upload className="w-12 h-12 mx-auto mb-4 text-accent" />
              <p className="text-lg mb-2">
                {uploading ? 'Uploading and analyzing...' : 'Drag & drop your medical report'}
              </p>
              <p className="text-sm text-gray-400 mb-4">or click to browse (PDF only)</p>
              <GlowButton size="sm" disabled={uploading} type="button">
                {uploading ? 'Processing...' : 'Select File'}
              </GlowButton>
            </label>
          </motion.div>

          {/* Reports List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glow-card"
          >
            <h2 className="text-2xl font-bold mb-6">Recent Reports</h2>
            
            {loading && (
              <div className="text-center text-gray-400 py-8">
                <div className="w-12 h-12 mx-auto mb-3 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
                <p>Loading reports...</p>
              </div>
            )}
            
            {!loading && reports.length === 0 ? (
              <div className="text-center text-gray-400 py-8">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No reports yet. Upload your first report above!</p>
              </div>
            ) : !loading && (
              <div className="space-y-4">
                {reports.map((report) => (
                  <div key={report.id} className="glass-effect p-4 rounded-xl hover:bg-white/10 transition group">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-medical rounded-xl flex items-center justify-center">
                          <FileText className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="font-semibold">{report.name}</div>
                          <div className="text-sm text-gray-400">{report.date}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {report.status === 'completed' && report.confidence && (
                          <div className="text-sm text-right">
                            <div className="text-gray-400">Confidence</div>
                            <div className="font-bold text-green-400">{(report.confidence/100).toFixed(1)}%</div>
                          </div>
                        )}
                        {report.analysis && (
                          <button
                            onClick={() => handleViewSummary(report)}
                            className="p-2 glass-effect rounded-lg hover:bg-white/10 transition opacity-0 group-hover:opacity-100"
                            title="View detailed summary"
                          >
                            <FileText className="w-5 h-5 text-purple-400" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDownloadPDF(report)}
                          className="p-2 glass-effect rounded-lg hover:bg-white/10 transition opacity-0 group-hover:opacity-100"
                          title="Download PDF"
                        >
                          <Download className="w-5 h-5 text-green-400" />
                        </button>
                        <button
                          onClick={() => handleOpenChat(report)}
                          className="p-2 glass-effect rounded-lg hover:bg-white/10 transition opacity-0 group-hover:opacity-100"
                          title="Chat about this report"
                        >
                          <MessageSquare className="w-5 h-5 text-accent" />
                        </button>
                        {report.status === 'completed' ? (
                          <CheckCircle2 className="w-6 h-6 text-green-400" />
                        ) : report.status === 'reviewed' || report.status === 'edited' ? (
                          <CheckCircle2 className="w-6 h-6 text-blue-400" />
                        ) : (
                          <Clock className="w-6 h-6 text-yellow-400" />
                        )}
                      </div>
                    </div>

                    {/* Doctor Review Toggle Button */}
                    {(report.status === 'reviewed' || report.status === 'edited') && report.doctorReview && (
                      <>
                        <button
                          onClick={() => toggleReviewExpansion(report.id)}
                          className="w-full flex items-center justify-between px-3 py-2 mt-2 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 transition"
                        >
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-blue-400" />
                            <span className="text-sm font-semibold text-blue-400">
                              {report.status === 'edited' ? 'Reviewed & Edited' : 'Reviewed'} by Doctor
                            </span>
                            {report.doctorReview.doctor_info && (
                              <span className="text-xs text-gray-400">
                                • Dr. {report.doctorReview.doctor_info.name}
                              </span>
                            )}
                          </div>
                          {expandedReviews[report.id] ? (
                            <ChevronUp className="w-4 h-4 text-blue-400" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-blue-400" />
                          )}
                        </button>

                        {/* Doctor Review Section (Collapsible) */}
                        <motion.div
                          initial={false}
                          animate={{
                            height: expandedReviews[report.id] ? 'auto' : 0,
                            opacity: expandedReviews[report.id] ? 1 : 0
                          }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-3 pt-3 border-t border-white/10">
                            <div className="flex items-start gap-3 bg-blue-500/10 rounded-lg p-3 border border-blue-500/20">
                              <CheckCircle2 className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-2">
                                  <div>
                                    {report.doctorReview.doctor_info && (
                                      <div className="text-sm text-gray-300">
                                        Dr. {report.doctorReview.doctor_info.name}
                                        {report.doctorReview.doctor_info.specialization && 
                                          ` - ${report.doctorReview.doctor_info.specialization}`
                                        }
                                      </div>
                                    )}
                                  </div>
                                  <div className="text-xs text-gray-400">
                                    {new Date(report.doctorReview.reviewed_at).toLocaleDateString('en-US', {
                                      month: 'short',
                                      day: 'numeric',
                                      year: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </div>
                                </div>
                                
                                {report.doctorReview.notes && (
                                  <div className="text-sm text-gray-300 bg-white/5 rounded-lg p-3 mt-2">
                                    <div className="font-semibold text-gray-400 mb-1">Doctor's Notes:</div>
                                    <p className="whitespace-pre-wrap">{report.doctorReview.notes}</p>
                                  </div>
                                )}

                                {report.status === 'edited' && report.doctorReview.edited_fields && (
                                  <div className="mt-2 text-xs text-yellow-400 flex items-center gap-1">
                                    <AlertCircle className="w-4 h-4" />
                                    <span>This report's AI analysis has been modified by the doctor for improved accuracy</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glow-card"
          >
            <h3 className="text-xl font-bold mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button 
                onClick={() => handleOpenChat()}
                className="w-full p-3 glass-effect rounded-xl flex items-center gap-3 hover:bg-white/10 transition group"
              >
                <MessageSquare className="w-5 h-5 text-accent group-hover:scale-110 transition" />
                <span>Chat with AI</span>
              </button>
              <button className="w-full p-3 glass-effect rounded-xl flex items-center gap-3 hover:bg-white/10 transition group" onClick={() => setIsProfileOpen(true)}>
                <User className="w-5 h-5 text-accent group-hover:scale-110 transition" />
                <span>My Profile</span>
              </button>
            </div>
          </motion.div>

          {/* Health Tips */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="glow-card"
          >
            <h3 className="text-xl font-bold mb-4">Health Tips</h3>
            <div className="space-y-3 text-sm text-gray-300">
              <p>💧 Drink at least 8 glasses of water daily</p>
              <p>🏃 Exercise for 30 minutes every day</p>
              <p>😴 Get 7-8 hours of quality sleep</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* AI Chat Bot Modal */}
      <AIChatBot 
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        reportId={selectedReport?.id}
        reportName={selectedReport?.name}
      />

      {/* Report Summary Modal */}
      <ReportSummary
        isOpen={isSummaryOpen}
        onClose={() => setIsSummaryOpen(false)}
        analysisData={currentAnalysis}
        reportName={selectedReport?.name}
      />

      {/* Profile Modal */}
      <Profile
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        user={user}
      />
    </div>
  )
}

export default PatientDashboard
