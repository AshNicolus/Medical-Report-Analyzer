import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Shield, Users, UserCheck, FileText, TrendingUp, 
  Trash2, LogOut, Activity, AlertCircle, CheckCircle2,
  Search, Filter
} from 'lucide-react'
import api from '../api'

const AdminDashboard = () => {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [stats, setStats] = useState(null)
  const [patients, setPatients] = useState([])
  const [doctors, setDoctors] = useState([])
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('overview') // 'overview', 'patients', 'doctors', 'reports'
  const [searchTerm, setSearchTerm] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    // Check if user is admin
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser)
      if (parsedUser.type !== 'admin') {
        navigate('/login')
        return
      }
      setUser(parsedUser)
      fetchStats()
      fetchAllData()
    } else {
      navigate('/login')
    }
  }, [navigate])

  const fetchStats = async () => {
    try {
      const data = await api.get('/api/admin/stats')
      if (data.success) {
        setStats(data.stats)
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err)
    }
  }

  const fetchAllData = async () => {
    setLoading(true)
    try {
      const [patientsData, doctorsData, reportsData] = await Promise.all([
        api.get('/api/admin/patients'),
        api.get('/api/admin/doctors'),
        api.get('/api/admin/reports')
      ])

      if (patientsData.success) setPatients(patientsData.patients || [])
      if (doctorsData.success) setDoctors(doctorsData.doctors || [])
      if (reportsData.success) setReports(reportsData.reports || [])
    } catch (err) {
      console.error('Failed to fetch data:', err)
      setError('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleDeletePatient = async (patientId) => {
    if (!confirm('Are you sure you want to delete this patient?')) return

    try {
      const data = await api.delete(`/api/admin/patient/${patientId}`)
      if (data.success) {
        setSuccess('Patient deleted successfully')
        fetchAllData()
        fetchStats()
        setTimeout(() => setSuccess(''), 3000)
      }
    } catch (err) {
      setError('Failed to delete patient')
      setTimeout(() => setError(''), 3000)
    }
  }

  const handleDeleteDoctor = async (doctorId) => {
    if (!confirm('Are you sure you want to delete this doctor?')) return

    try {
      const data = await api.delete(`/api/admin/doctor/${doctorId}`)
      if (data.success) {
        setSuccess('Doctor deleted successfully')
        fetchAllData()
        fetchStats()
        setTimeout(() => setSuccess(''), 3000)
      }
    } catch (err) {
      setError('Failed to delete doctor')
      setTimeout(() => setError(''), 3000)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('user')
    navigate('/')
  }

  const filteredPatients = patients.filter(p => 
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredDoctors = doctors.filter(d => 
    d.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gradient">Admin Dashboard</h1>
              <p className="text-gray-400">System Management & Oversight</p>
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

      {/* Messages */}
      {error && (
        <div className="max-w-7xl mx-auto mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}
      
      {success && (
        <div className="max-w-7xl mx-auto mb-4 p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          {success}
        </div>
      )}

      {/* Stats Cards */}
      {stats && (
        <div className="max-w-7xl mx-auto grid md:grid-cols-5 gap-6 mb-8">
          {[
            { 
              label: 'Total Patients', 
              value: stats.total_patients?.toString() || '0', 
              icon: <Users />, 
              color: 'from-blue-500 to-cyan-500' 
            },
            { 
              label: 'Total Doctors', 
              value: stats.total_doctors?.toString() || '0', 
              icon: <UserCheck />, 
              color: 'from-green-500 to-emerald-500' 
            },
            { 
              label: 'Total Reports', 
              value: stats.total_reports?.toString() || '0', 
              icon: <FileText />, 
              color: 'from-purple-500 to-pink-500' 
            },
            { 
              label: 'Reviewed Reports', 
              value: stats.reviewed_reports?.toString() || '0', 
              icon: <CheckCircle2 />, 
              color: 'from-green-500 to-teal-500' 
            },
            { 
              label: 'Pending Reports', 
              value: stats.pending_reports?.toString() || '0', 
              icon: <Activity />, 
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
      )}

      {/* Tabs */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex gap-4 overflow-x-auto pb-2">
          {[
            { id: 'overview', label: 'Overview', icon: <TrendingUp className="w-4 h-4" /> },
            { id: 'patients', label: 'Patients', icon: <Users className="w-4 h-4" /> },
            { id: 'doctors', label: 'Doctors', icon: <UserCheck className="w-4 h-4" /> },
            { id: 'reports', label: 'Reports', icon: <FileText className="w-4 h-4" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-gradient-medical text-white'
                  : 'glass-effect hover:bg-white/10'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto">
        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glow-card"
          >
            <h2 className="text-2xl font-bold mb-4">System Overview</h2>
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="glass-effect p-4 rounded-xl">
                  <h3 className="text-lg font-semibold mb-2">Recent Activity</h3>
                  <p className="text-gray-400 text-sm">Last 24 hours</p>
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>New Patients</span>
                      <span className="text-accent">{patients.length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>New Reports</span>
                      <span className="text-accent">{reports.length}</span>
                    </div>
                  </div>
                </div>
                <div className="glass-effect p-4 rounded-xl">
                  <h3 className="text-lg font-semibold mb-2">System Health</h3>
                  <p className="text-gray-400 text-sm">All systems operational</p>
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <span>Database: Online</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <span>API: Online</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'patients' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glow-card"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Manage Patients</h2>
              <div className="flex items-center gap-2 px-4 py-2 glass-effect rounded-xl">
                <Search className="w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search patients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-transparent outline-none w-64"
                />
              </div>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 mx-auto mb-3 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
                <p>Loading patients...</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredPatients.map((patient) => (
                  <div key={patient.id} className="glass-effect p-4 rounded-xl flex items-center justify-between hover:bg-white/10 transition">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gradient-medical rounded-full flex items-center justify-center font-bold">
                        {patient.name?.charAt(0)?.toUpperCase() || 'P'}
                      </div>
                      <div>
                        <div className="font-semibold">{patient.name || 'Unknown'}</div>
                        <div className="text-sm text-gray-400">{patient.email || 'No email'}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-sm text-gray-400">
                        <span>Age: {patient.age || 'N/A'}</span>
                        <span className="mx-2">•</span>
                        <span>{patient.gender || 'N/A'}</span>
                      </div>
                      <button
                        onClick={() => handleDeletePatient(patient.id)}
                        className="p-2 hover:bg-red-500/20 rounded-lg transition text-red-400"
                        title="Delete patient"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
                {filteredPatients.length === 0 && (
                  <div className="text-center text-gray-400 py-8">
                    <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No patients found</p>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'doctors' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glow-card"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Manage Doctors</h2>
              <div className="flex items-center gap-2 px-4 py-2 glass-effect rounded-xl">
                <Search className="w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search doctors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-transparent outline-none w-64"
                />
              </div>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 mx-auto mb-3 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
                <p>Loading doctors...</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredDoctors.map((doctor) => (
                  <div key={doctor.id} className="glass-effect p-4 rounded-xl flex items-center justify-between hover:bg-white/10 transition">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center font-bold">
                        {doctor.name?.charAt(0)?.toUpperCase() || 'D'}
                      </div>
                      <div>
                        <div className="font-semibold">Dr. {doctor.name || 'Unknown'}</div>
                        <div className="text-sm text-gray-400">{doctor.email || 'No email'}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-sm text-gray-400">
                        <span>{doctor.specialization || 'General'}</span>
                        <span className="mx-2">•</span>
                        <span>{doctor.hospital || 'N/A'}</span>
                      </div>
                      <button
                        onClick={() => handleDeleteDoctor(doctor.id)}
                        className="p-2 hover:bg-red-500/20 rounded-lg transition text-red-400"
                        title="Delete doctor"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
                {filteredDoctors.length === 0 && (
                  <div className="text-center text-gray-400 py-8">
                    <UserCheck className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No doctors found</p>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'reports' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glow-card"
          >
            <h2 className="text-2xl font-bold mb-6">All Reports</h2>
            {loading ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 mx-auto mb-3 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
                <p>Loading reports...</p>
              </div>
            ) : (
              <div className="space-y-3">
                {reports.map((report) => (
                  <div key={report.id} className="glass-effect p-4 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <FileText className="w-8 h-8 text-accent" />
                        <div>
                          <div className="font-semibold">{report.name || 'Report'}</div>
                          <div className="text-sm text-gray-400">{report.date || 'N/A'}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-xs ${
                          report.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                          report.status === 'reviewed' ? 'bg-blue-500/20 text-blue-400' :
                          'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {report.status || 'pending'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                {reports.length === 0 && (
                  <div className="text-center text-gray-400 py-8">
                    <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No reports found</p>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default AdminDashboard
