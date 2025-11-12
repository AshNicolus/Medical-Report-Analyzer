import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Activity, LogOut, FileText, Users, Clock, CheckCircle2,
  TrendingUp, AlertCircle, Eye, Edit
} from 'lucide-react'
import GlowButton from '../components/GlowButton'
import ReportReviewModal from '../components/ReportReviewModal'
import api from '../api'

const DoctorDashboard = () => {
  const navigate = useNavigate()
  const [allReports, setAllReports] = useState([])
  const [filteredReports, setFilteredReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('all')
  const [user, setUser] = useState(null)
  const [selectedReport, setSelectedReport] = useState(null)
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false)

  useEffect(() => {
    // Get logged in doctor info
    const userData = localStorage.getItem('user')
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  useEffect(() => {
    fetchAllReports()
  }, [])

  useEffect(() => {
    // Filter reports based on active tab
    if (activeTab === 'all') {
      setFilteredReports(allReports)
    } else if (activeTab === 'pending') {
      setFilteredReports(allReports.filter(r => r.status === 'pending'))
    } else if (activeTab === 'low-confidence') {
      setFilteredReports(allReports.filter(r => (r.ai_analysis?.confidence_score || 0) < 90))
    }
  }, [activeTab, allReports])

  const fetchAllReports = async () => {
    setLoading(true)
    setError(null)

    try {
      // Fetch all reports without status filter
      const data = await api.get('/api/doctor/reports')
      setAllReports(data.reports || [])
    } catch (err) {
      console.error('Failed to fetch reports', err)
      setError(err?.message || 'Failed to fetch reports')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('user')
    navigate('/')
  }

  const handleReview = async (reportId) => {
    const report = allReports.find(r => r.id === reportId)
    if (report) {
      setSelectedReport(report)
      setIsReviewModalOpen(true)
    }
  }

  const handleEdit = async (reportId) => {
    const report = allReports.find(r => r.id === reportId)
    if (report) {
      setSelectedReport(report)
      setIsReviewModalOpen(true)
    }
  }

  const handleSubmitReview = async (reportId, notes) => {
    try {
      if (!user || !user.id) {
        throw new Error('Doctor ID not found. Please login again.')
      }

      await api.post(`/api/doctor/reports/${reportId}/review`, {
        doctor_id: user.id,
        notes: notes
      })

      alert('Review submitted successfully!')
      fetchAllReports() // Refresh the list
    } catch (err) {
      console.error('Failed to submit review', err)
      alert('Failed to submit review: ' + (err?.message || 'Unknown error'))
      throw err
    }
  }

  const handleSubmitEdit = async (reportId, editedFields, notes) => {
    try {
      if (!user || !user.id) {
        throw new Error('Doctor ID not found. Please login again.')
      }

      await api.put(`/api/doctor/reports/${reportId}/edit`, {
        doctor_id: user.id,
        edited_fields: editedFields,
        notes: notes
      })

      alert('Analysis updated successfully!')
      fetchAllReports() // Refresh the list
    } catch (err) {
      console.error('Failed to edit analysis', err)
      alert('Failed to edit analysis: ' + (err?.message || 'Unknown error'))
      throw err
    }
  }

  const handleView = (reportId) => {
    const report = allReports.find(r => r.id === reportId)
    if (report) {
      setSelectedReport(report)
      setIsReviewModalOpen(true)
    }
  }

  // Calculate dynamic stats
  const stats = {
    total: allReports.length,
    pending: allReports.filter(r => r.status === 'pending').length,
    reviewedToday: allReports.filter(r => {
      if (!r.doctor_review?.reviewed_at) return false
      const reviewDate = new Date(r.doctor_review.reviewed_at)
      const today = new Date()
      return reviewDate.toDateString() === today.toDateString()
    }).length,
    // Unique patient count
    patients: new Set(allReports.map(r => r.patient_id).filter(Boolean)).size
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
              <h1 className="text-3xl font-bold text-gradient">Doctor Dashboard</h1>
              <p className="text-gray-400">{user?.name || 'Dr. Sarah Johnson'} - {user?.specialization || 'Cardiologist'}</p>
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
          { label: 'Total Reports', value: stats.total, icon: <FileText />, color: 'from-blue-500 to-cyan-500' },
          { label: 'Pending Review', value: stats.pending, icon: <Clock />, color: 'from-yellow-500 to-orange-500' },
          { label: 'Reviewed Today', value: stats.reviewedToday, icon: <CheckCircle2 />, color: 'from-green-500 to-emerald-500' },
          { label: 'Patients', value: stats.patients, icon: <Users />, color: 'from-purple-500 to-pink-500' },
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
      <div className="max-w-7xl mx-auto">
        <div className="flex gap-4 mb-6">
          <button 
            onClick={() => setActiveTab('all')}
            className={`px-6 py-2 rounded-xl font-semibold transition ${
              activeTab === 'all' ? 'bg-gradient-medical' : 'glass-effect hover:bg-white/10'
            }`}
          >
            All Reports ({allReports.length})
          </button>
          <button 
            onClick={() => setActiveTab('pending')}
            className={`px-6 py-2 rounded-xl font-semibold transition ${
              activeTab === 'pending' ? 'bg-gradient-medical' : 'glass-effect hover:bg-white/10'
            }`}
          >
            Pending Review ({stats.pending})
          </button>
          <button 
            onClick={() => setActiveTab('low-confidence')}
            className={`px-6 py-2 rounded-xl font-semibold transition ${
              activeTab === 'low-confidence' ? 'bg-gradient-medical' : 'glass-effect hover:bg-white/10'
            }`}
          >
            Low Confidence ({allReports.filter(r => (r.ai_analysis?.confidence_score || 0) < 90).length})
          </button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glow-card"
        >
          <h2 className="text-2xl font-bold mb-6">
            {activeTab === 'all' ? 'All Reports' : activeTab === 'pending' ? 'Pending Review' : 'Low Confidence Reports'}
          </h2>

          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
            </div>
          )}

          {error && (
            <div className="mb-4 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400">
              <strong>Error:</strong> {error}
            </div>
          )}

          {!loading && !error && filteredReports.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>No reports found in this category.</p>
            </div>
          )}

          <div className="space-y-4">
            {filteredReports.map((report) => (
              <div
                key={report.id}
                className={`glass-effect p-6 rounded-xl hover:bg-white/10 transition border-l-4 ${
                  (report.ai_analysis?.confidence_score || 0) < 80 ? 'border-red-500' : 
                  (report.ai_analysis?.confidence_score || 0) < 90 ? 'border-yellow-500' : 
                  'border-green-500'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-3">
                      <div className="w-10 h-10 bg-gradient-medical rounded-full flex items-center justify-center text-lg">
                        {report.patient_id ? report.patient_id.substring(0, 2).toUpperCase() : 'PT'}
                      </div>
                      <div>
                        <div className="font-semibold text-lg">Patient ID: {report.patient_id || 'Unknown'}</div>
                        <div className="text-sm text-gray-400">{report.pdf_filename || report.type || 'Medical Report'}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6 text-sm">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-400">{report.uploaded_at ? new Date(report.uploaded_at).toLocaleDateString() : report.date || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-accent" />
                        <span>Confidence: <span className={`font-bold ${
                          report.ai_analysis?.confidence_score < 80 ? 'text-red-400' : report.ai_analysis?.confidence_score < 90 ? 'text-yellow-400' : 'text-green-400'
                        }`}>{report.ai_analysis?.confidence_score/100?.toFixed(0) || 0}%</span></span>
                      </div>
                      <div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          report.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'
                        }`}>
                          {report.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => handleView(report.id)}
                      className="p-3 glass-effect rounded-xl hover:bg-white/10 transition group"
                      title="View Report"
                    >
                      <Eye className="w-5 h-5 text-accent group-hover:scale-110 transition" />
                    </button>
                    {(report.ai_analysis?.confidence_score || 0) < 90 && (
                      <button 
                        onClick={() => handleEdit(report.id)}
                        className="p-3 glass-effect rounded-xl hover:bg-white/10 transition group"
                        title="Edit Analysis"
                      >
                        <Edit className="w-5 h-5 text-yellow-400 group-hover:scale-110 transition" />
                      </button>
                    )}
                    {report.status === 'pending' && (
                      <GlowButton size="sm" onClick={() => handleReview(report.id)}>
                        Review
                      </GlowButton>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Review Modal */}
      <ReportReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => {
          setIsReviewModalOpen(false)
          setSelectedReport(null)
        }}
        report={selectedReport}
        onSubmitReview={handleSubmitReview}
        onSubmitEdit={handleSubmitEdit}
      />
    </div>
  )
}

export default DoctorDashboard
