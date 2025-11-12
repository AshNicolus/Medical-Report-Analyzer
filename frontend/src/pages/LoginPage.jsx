import { motion } from 'framer-motion'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Activity, User, Stethoscope, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import GlowButton from '../components/GlowButton'
import FloatingParticles from '../components/FloatingParticles'
import api from '../api'

const LoginPage = () => {
  const navigate = useNavigate()
  const [userType, setUserType] = useState('patient') // 'patient' or 'doctor'
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    age: '',
    gender: '',
    specialization: '',
    license: '',
    phone: '',
    hospital: ''
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      if (isLogin) {
        // Login flow
        const data = await api.post(`/api/auth/${userType}/login`, {
          email: formData.email,
          password: formData.password
        })
        
        if (data.success) {
          // Store user data in localStorage
          localStorage.setItem('user', JSON.stringify(data.user))
          
          // Navigate to appropriate dashboard
          if (userType === 'patient') {
            navigate('/patient')
          } else {
            navigate('/doctor')
          }
        } else {
          setError(data.error || 'Login failed')
        }
      } else {
        // Signup flow
        const payload = {
          name: formData.name,
          email: formData.email,
          password: formData.password
        }
        
        if (userType === 'patient') {
          payload.age = formData.age ? parseInt(formData.age) : undefined
          payload.gender = formData.gender
          payload.phone = formData.phone
        } else {
          payload.specialization = formData.specialization
          payload.license_number = formData.license
          payload.hospital = formData.hospital
        }
        
        const data = await api.post(`/api/auth/${userType}/signup`, payload)
        
        if (data.success) {
          // Auto-login after signup by storing user data
          // Note: Backend doesn't return full user on signup, so we'll switch to login mode
          alert(data.message || 'Account created successfully! Please login.')
          setIsLogin(true)
          // Clear password but keep email
          setFormData({ ...formData, password: '', name: '', age: '', gender: '', specialization: '', license: '', phone: '', hospital: '' })
        } else {
          setError(data.error || 'Signup failed')
        }
      }
    } catch (err) {
      console.error('Auth error:', err)
      setError(err.response?.data?.error || err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      <FloatingParticles />
      
      {/* Back to Home */}
      <motion.button
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        onClick={() => navigate('/')}
        className="absolute top-6 left-6 flex items-center gap-2 text-gray-300 hover:text-white transition"
      >
        <Activity className="w-6 h-6" />
        <span className="font-bold">MediAnalyzer</span>
      </motion.button>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-5xl grid md:grid-cols-2 gap-8 relative z-10"
      >
        {/* Left Side - Info */}
        <motion.div
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="hidden md:flex flex-col justify-center glass-effect rounded-3xl p-12"
        >
          <h1 className="text-4xl font-bold mb-6">
            Welcome to
            <span className="text-gradient block mt-2">MediAnalyzer</span>
          </h1>
          <p className="text-gray-300 mb-8 leading-relaxed">
            Advanced AI-powered medical report analysis platform trusted by thousands of patients and healthcare professionals.
          </p>
          
          <div className="space-y-4">
            {[
              '🤖 AI-Powered Analysis',
              '👨‍⚕️ Doctor Verification',
              '🔒 Secure & Private',
              '⚡ Instant Results'
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                className="flex items-center gap-3 text-lg"
              >
                {feature}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Right Side - Form */}
        <motion.div
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="glass-effect rounded-3xl p-8"
        >
          {/* User Type Selector */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <button
              onClick={() => setUserType('patient')}
              className={`p-4 rounded-xl flex items-center justify-center gap-2 font-semibold transition ${
                userType === 'patient'
                  ? 'bg-gradient-medical text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              <User className="w-5 h-5" />
              Patient
            </button>
            <button
              onClick={() => setUserType('doctor')}
              className={`p-4 rounded-xl flex items-center justify-center gap-2 font-semibold transition ${
                userType === 'doctor'
                  ? 'bg-gradient-medical text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              <Stethoscope className="w-5 h-5" />
              Doctor
            </button>
          </div>

          {/* Login/Signup Toggle */}
          <div className="flex gap-6 mb-8 border-b border-white/10">
            <button
              onClick={() => setIsLogin(true)}
              className={`pb-3 font-semibold transition ${
                isLogin ? 'text-white border-b-2 border-accent' : 'text-gray-400'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`pb-3 font-semibold transition ${
                !isLogin ? 'text-white border-b-2 border-accent' : 'text-gray-400'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}

            {!isLogin && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-accent focus:outline-none transition"
                    placeholder="Enter your name"
                    required={!isLogin}
                  />
                </div>

                {userType === 'patient' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Age</label>
                      <input
                        type="number"
                        name="age"
                        value={formData.age}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-accent focus:outline-none transition"
                        placeholder="Age"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Gender</label>
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-accent focus:outline-none transition"
                      >
                        <option value="">Select</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                )}

                {userType === 'patient' && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Phone (Optional)</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-accent focus:outline-none transition"
                      placeholder="Phone number"
                    />
                  </div>
                )}

                {userType === 'doctor' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-2">Specialization</label>
                      <input
                        type="text"
                        name="specialization"
                        value={formData.specialization}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-accent focus:outline-none transition"
                        placeholder="e.g., Cardiologist"
                        required={!isLogin}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">License Number</label>
                      <input
                        type="text"
                        name="license"
                        value={formData.license}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-accent focus:outline-none transition"
                        placeholder="Medical license number"
                        required={!isLogin}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Hospital/Clinic (Optional)</label>
                      <input
                        type="text"
                        name="hospital"
                        value={formData.hospital}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-accent focus:outline-none transition"
                        placeholder="Hospital or clinic name"
                      />
                    </div>
                  </>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-accent focus:outline-none transition"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-12 pr-12 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-accent focus:outline-none transition"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {isLogin && (
              <div className="text-right">
                <a href="#" className="text-sm text-accent hover:underline">
                  Forgot password?
                </a>
              </div>
            )}

            <GlowButton size="lg" className="w-full mt-6" disabled={loading}>
              {loading ? 'Please wait...' : (isLogin ? 'Login' : 'Create Account')}
            </GlowButton>
          </form>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default LoginPage
