import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { 
  X, User, Mail, Phone, Calendar, Edit2, Save, 
  Shield, Key, Camera, AlertCircle, CheckCircle2 
} from 'lucide-react'
import GlowButton from './GlowButton'
import api from '../api'

const Profile = ({ isOpen, onClose, user }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [activeTab, setActiveTab] = useState('personal') // 'personal' or 'security'
  
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    age: '',
    gender: '',
    role: ''
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  useEffect(() => {
    if (user && isOpen) {
      fetchProfile()
    }
  }, [user, isOpen])

  const fetchProfile = async () => {
    if (!user?.id) return

    try {
      const response = await api.get(`/api/auth/profile/${user.id}`)
      
      if (response.success && response.user) {
        setProfileData({
          name: response.user.name || '',
          email: response.user.email || '',
          phone: response.user.phone || '',
          age: response.user.age || '',
          gender: response.user.gender || '',
          role: response.user.role || ''
        })
      }
    } catch (err) {
      console.error('Failed to fetch profile:', err)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handlePasswordChange = (e) => {
    const { name, value } = e.target
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSaveProfile = async () => {
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await api.post('/api/auth/update-profile', {
        user_id: user.id,
        name: profileData.name,
        phone: profileData.phone,
        age: parseInt(profileData.age) || 0,
        gender: profileData.gender
      })

      if (response.success) {
        setSuccess('Profile updated successfully!')
        setIsEditing(false)
        
        // Update localStorage
        const updatedUser = { ...user, ...profileData }
        localStorage.setItem('user', JSON.stringify(updatedUser))
        
        setTimeout(() => setSuccess(''), 3000)
      }
    } catch (err) {
      console.error('Profile update error:', err)
      setError(err.response?.data?.error || 'Failed to update profile')
      setTimeout(() => setError(''), 3000)
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async () => {
    setError('')
    setSuccess('')

    // Validation
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setError('All password fields are required')
      setTimeout(() => setError(''), 3000)
      return
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match')
      setTimeout(() => setError(''), 3000)
      return
    }

    if (passwordData.newPassword.length < 6) {
      setError('Password must be at least 6 characters')
      setTimeout(() => setError(''), 3000)
      return
    }

    setLoading(true)

    try {
      const response = await api.post('/api/auth/change-password', {
        user_id: user.id,
        current_password: passwordData.currentPassword,
        new_password: passwordData.newPassword
      })

      if (response.success) {
        setSuccess('Password changed successfully!')
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        })
        setTimeout(() => setSuccess(''), 3000)
      }
    } catch (err) {
      console.error('Password change error:', err)
      setError(err.response?.data?.error || 'Failed to change password')
      setTimeout(() => setError(''), 3000)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="glow-card max-w-3xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-medical rounded-xl flex items-center justify-center">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gradient">Profile Settings</h2>
              <p className="text-sm text-gray-400">Manage your account information</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('personal')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
              activeTab === 'personal'
                ? 'bg-gradient-medical text-white'
                : 'glass-effect hover:bg-white/10'
            }`}
          >
            <User className="w-4 h-4" />
            Personal Info
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
              activeTab === 'security'
                ? 'bg-gradient-medical text-white'
                : 'glass-effect hover:bg-white/10'
            }`}
          >
            <Shield className="w-4 h-4" />
            Security
          </button>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-4 p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            {success}
          </div>
        )}

        {/* Personal Info Tab */}
        {activeTab === 'personal' && (
          <div className="space-y-6">
            {/* Profile Picture */}
            <div className="flex items-center gap-6 p-4 glass-effect rounded-xl">
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-medical rounded-full flex items-center justify-center text-3xl font-bold">
                  {profileData.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <button className="absolute bottom-0 right-0 p-2 bg-accent rounded-full hover:scale-110 transition">
                  <Camera className="w-4 h-4" />
                </button>
              </div>
              <div>
                <h3 className="text-xl font-bold">{profileData.name || 'User'}</h3>
                <p className="text-gray-400 text-sm capitalize">{profileData.role || 'Patient'}</p>
                <p className="text-gray-500 text-xs">{profileData.email}</p>
              </div>
            </div>

            {/* Edit Button */}
            <div className="flex justify-end">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 glass-effect rounded-lg hover:bg-white/10 transition"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit Profile
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setIsEditing(false)
                      // Reset to original data
                      setProfileData({
                        name: user.name || '',
                        email: user.email || '',
                        phone: user.phone || '',
                        age: user.age || '',
                        gender: user.gender || '',
                        role: user.role || ''
                      })
                    }}
                    className="px-4 py-2 glass-effect rounded-lg hover:bg-white/10 transition"
                  >
                    Cancel
                  </button>
                  <GlowButton
                    onClick={handleSaveProfile}
                    disabled={loading}
                    size="sm"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {loading ? 'Saving...' : 'Save Changes'}
                  </GlowButton>
                </div>
              )}
            </div>

            {/* Form Fields */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">
                  <User className="w-4 h-4 inline mr-2" />
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={profileData.name}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-4 py-2 glass-effect rounded-xl focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">
                  <Mail className="w-4 h-4 inline mr-2" />
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={profileData.email}
                  disabled
                  className="w-full px-4 py-2 glass-effect rounded-xl focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">
                  <Phone className="w-4 h-4 inline mr-2" />
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={profileData.phone}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-4 py-2 glass-effect rounded-xl focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Age
                </label>
                <input
                  type="number"
                  name="age"
                  value={profileData.age}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  min="0"
                  max="150"
                  className="w-full px-4 py-2 glass-effect rounded-xl focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2 text-gray-300">
                  Gender
                </label>
                <select
                  name="gender"
                  value={profileData.gender}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-4 py-2 glass-effect rounded-xl focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            <div className="p-4 glass-effect rounded-xl">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Key className="w-5 h-5 text-accent" />
                Change Password
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">
                    Current Password
                  </label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-4 py-2 glass-effect rounded-xl focus:outline-none focus:ring-2 focus:ring-accent"
                    placeholder="Enter current password"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">
                    New Password
                  </label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-4 py-2 glass-effect rounded-xl focus:outline-none focus:ring-2 focus:ring-accent"
                    placeholder="Enter new password"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-4 py-2 glass-effect rounded-xl focus:outline-none focus:ring-2 focus:ring-accent"
                    placeholder="Confirm new password"
                  />
                </div>

                <GlowButton
                  onClick={handleChangePassword}
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? 'Changing Password...' : 'Change Password'}
                </GlowButton>
              </div>
            </div>

            {/* Account Info */}
            <div className="p-4 glass-effect rounded-xl">
              <h3 className="text-lg font-bold mb-4">Account Information</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Account Status</span>
                  <span className="text-green-400 font-semibold">Active</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Account Type</span>
                  <span className="capitalize">{profileData.role || 'Patient'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Member Since</span>
                  <span>2024</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}

export default Profile
