import { motion } from 'framer-motion'
import { 
  Activity, Heart, Brain, Pill, Stethoscope, Dna, 
  Microscope, FileText, Zap, Shield, TrendingUp, Users,
  ChevronRight, Sparkles, CheckCircle2, Star
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import FloatingParticles from '../components/FloatingParticles'
import GlowButton from '../components/GlowButton'
import FeatureCard from '../components/FeatureCard'
import StepCard from '../components/StepCard'
import TestimonialCard from '../components/TestimonialCard'
import AnimatedIcon from '../components/AnimatedIcon'

const LandingPage = () => {
  const navigate = useNavigate()

  const features = [
    {
      icon: <Brain className="w-8 h-8" />,
      title: "AI-Powered Analysis",
      description: "Advanced machine learning algorithms analyze your medical reports with 95% accuracy",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: <FileText className="w-8 h-8" />,
      title: "Instant Report Upload",
      description: "Upload PDF reports and get comprehensive analysis within seconds",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: <Stethoscope className="w-8 h-8" />,
      title: "Doctor Verification",
      description: "All AI analyses are reviewed and verified by certified medical professionals",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Secure & Private",
      description: "Bank-level encryption ensures your medical data is always protected",
      color: "from-orange-500 to-red-500"
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Real-time Insights",
      description: "Get instant notifications and insights about your health metrics",
      color: "from-yellow-500 to-orange-500"
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Health Tracking",
      description: "Monitor your health trends over time with interactive visualizations",
      color: "from-teal-500 to-blue-500"
    }
  ]

  const steps = [
    {
      number: "01",
      title: "Upload Report",
      description: "Simply drag & drop your medical report PDF or select from your device",
      icon: <FileText className="w-12 h-12" />
    },
    {
      number: "02",
      title: "AI Analysis",
      description: "Our advanced AI extracts entities, symptoms, and generates insights",
      icon: <Brain className="w-12 h-12" />
    },
    {
      number: "03",
      title: "Doctor Review",
      description: "Certified doctors verify and enhance the AI analysis for accuracy",
      icon: <Stethoscope className="w-12 h-12" />
    },
    {
      number: "04",
      title: "Get Results",
      description: "Receive comprehensive report with insights and recommendations",
      icon: <CheckCircle2 className="w-12 h-12" />
    }
  ]

  const testimonials = [
    {
      name: "Dr. Sarah Johnson",
      role: "Cardiologist",
      image: "👩‍⚕️",
      rating: 5,
      text: "This platform has revolutionized how I review patient reports. The AI accuracy is impressive!"
    },
    {
      name: "Michael Chen",
      role: "Patient",
      image: "👨",
      rating: 5,
      text: "Finally, I can understand my medical reports! The AI chatbot answered all my questions."
    },
    {
      name: "Dr. James Williams",
      role: "General Physician",
      image: "👨‍⚕️",
      rating: 5,
      text: "The combination of AI and human expertise provides the perfect balance for medical analysis."
    }
  ]

  const stats = [
    { label: "Reports Analyzed", value: "50K+", icon: <FileText /> },
    { label: "Doctors", value: "500+", icon: <Users /> },
    { label: "Accuracy Rate", value: "95%", icon: <TrendingUp /> },
    { label: "Avg. Response", value: "< 30s", icon: <Zap /> }
  ]

  return (
    <div className="relative min-h-screen overflow-hidden">
      <FloatingParticles />
      
      {/* Animated Background Gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 -z-10" />
      
      {/* Navbar */}
      <motion.nav 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed top-0 left-0 right-0 z-50 glass-effect border-b border-white/10"
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <motion.div 
            className="flex items-center gap-3"
            whileHover={{ scale: 1.05 }}
          >
            <div className="w-10 h-10 bg-gradient-medical rounded-xl flex items-center justify-center">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gradient">MediAnalyzer</span>
          </motion.div>
          
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-gray-300 hover:text-white transition">Features</a>
            <a href="#how-it-works" className="text-gray-300 hover:text-white transition">How It Works</a>
            <a href="#testimonials" className="text-gray-300 hover:text-white transition">Testimonials</a>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/login')}
              className="text-gray-300 hover:text-white transition px-4 py-2"
            >
              Sign In
            </button>
            <GlowButton onClick={() => navigate('/login')}>
              Get Started <ChevronRight className="w-4 h-4 ml-1" />
            </GlowButton>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-block"
            >
              <span className="px-4 py-2 rounded-full bg-gradient-medical text-white text-sm font-semibold inline-flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                AI-Powered Healthcare Analytics
              </span>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-5xl lg:text-7xl font-bold leading-tight"
            >
              Transform Medical
              <span className="text-gradient block mt-2">
                Reports Into Insights
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xl text-gray-300 leading-relaxed"
            >
              Upload your medical reports and get AI-powered analysis with entity extraction, 
              symptom detection, and personalized recommendations - all verified by certified doctors.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap gap-4"
            >
              <GlowButton size="lg" onClick={() => navigate('/login')}>
                <Zap className="w-5 h-5 mr-2" />
                Start Analysis
              </GlowButton>
              <button className="px-8 py-4 rounded-xl glass-effect border border-white/20 hover:border-white/40 transition flex items-center gap-2 text-lg font-semibold">
                Watch Demo
                <ChevronRight className="w-5 h-5" />
              </button>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="grid grid-cols-4 gap-6 pt-8"
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.1 }}
                  className="text-center"
                >
                  <div className="flex justify-center mb-2 text-accent">
                    {stat.icon}
                  </div>
                  <div className="text-2xl font-bold text-gradient">{stat.value}</div>
                  <div className="text-xs text-gray-400 mt-1">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right - Animated Medical Icons */}
          <motion.div
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="relative h-[600px] hidden lg:block"
          >
            <AnimatedIcon icon={<Heart />} delay={0} position="top-10 left-10" color="text-red-500" />
            <AnimatedIcon icon={<Brain />} delay={0.2} position="top-20 right-20" color="text-purple-500" />
            <AnimatedIcon icon={<Dna />} delay={0.4} position="bottom-32 left-20" color="text-blue-500" />
            <AnimatedIcon icon={<Pill />} delay={0.6} position="bottom-20 right-10" color="text-green-500" />
            <AnimatedIcon icon={<Microscope />} delay={0.8} position="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" color="text-cyan-500" />
            <AnimatedIcon icon={<Activity />} delay={1} position="top-40 right-40" color="text-yellow-500" />
            
            {/* Central Glowing Circle */}
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 360],
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: "linear"
              }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-radial from-accent/30 to-transparent rounded-full blur-3xl"
            />
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl font-bold mb-4">
              Powerful <span className="text-gradient">Features</span>
            </h2>
            <p className="text-xl text-gray-300">
              Everything you need for comprehensive medical report analysis
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <FeatureCard key={index} {...feature} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="relative py-32 px-6 bg-gradient-to-b from-transparent via-purple-900/20 to-transparent">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl font-bold mb-4">
              How It <span className="text-gradient">Works</span>
            </h2>
            <p className="text-xl text-gray-300">
              Get started in 4 simple steps
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <StepCard key={index} {...step} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Dashboard Preview */}
      <section className="relative py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl font-bold mb-4">
              Advanced <span className="text-gradient">AI Dashboard</span>
            </h2>
            <p className="text-xl text-gray-300">
              Visualize your health data like never before
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="glow-card p-8 neon-border">
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="glass-effect p-6 rounded-xl">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                      <Heart className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Heart Rate</div>
                      <div className="text-2xl font-bold">72 BPM</div>
                    </div>
                  </div>
                  <div className="h-20 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-lg flex items-end gap-1 p-2">
                    {[40, 60, 45, 70, 55, 72, 68, 75].map((h, i) => (
                      <div key={i} style={{ height: `${h}%` }} className="flex-1 bg-gradient-to-t from-blue-500 to-cyan-500 rounded-sm" />
                    ))}
                  </div>
                </div>

                <div className="glass-effect p-6 rounded-xl">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                      <Brain className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">AI Confidence</div>
                      <div className="text-2xl font-bold">94.5%</div>
                    </div>
                  </div>
                  <div className="relative h-20">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg" />
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg" style={{ width: '94.5%' }} />
                  </div>
                </div>

                <div className="glass-effect p-6 rounded-xl">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                      <Activity className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Reports</div>
                      <div className="text-2xl font-bold">24</div>
                    </div>
                  </div>
                  <div className="text-sm text-green-400 flex items-center gap-1">
                    <TrendingUp className="w-4 h-4" />
                    +12% this month
                  </div>
                </div>
              </div>

              <div className="glass-effect p-6 rounded-xl">
                <h3 className="text-lg font-semibold mb-4">Recent Analysis</h3>
                <div className="space-y-3">
                  {['Blood Test Report', 'X-Ray Chest', 'ECG Report'].map((report, i) => (
                    <div key={i} className="flex items-center justify-between p-3 glass-effect rounded-lg hover:bg-white/10 transition">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-accent" />
                        <span>{report}</span>
                      </div>
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="relative py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl font-bold mb-4">
              Trusted by <span className="text-gradient">Thousands</span>
            </h2>
            <p className="text-xl text-gray-300">
              See what our users are saying
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <TestimonialCard key={index} {...testimonial} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-32 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="glow-card p-12 neon-border"
          >
            <h2 className="text-5xl font-bold mb-6">
              Ready to <span className="text-gradient">Get Started?</span>
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Join thousands of users who trust MediAnalyzer for their medical report analysis
            </p>
            <GlowButton size="xl" onClick={() => navigate('/login')}>
              <Sparkles className="w-6 h-6 mr-2" />
              Start Free Analysis
              <ChevronRight className="w-6 h-6 ml-2" />
            </GlowButton>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-12 px-6 border-t border-white/10">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-medical rounded-xl flex items-center justify-center">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gradient">MediAnalyzer</span>
            </div>
            <p className="text-gray-400 text-sm">
              AI-powered medical report analysis platform
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Product</h3>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><a href="#" className="hover:text-white transition">Features</a></li>
              <li><a href="#" className="hover:text-white transition">Pricing</a></li>
              <li><a href="#" className="hover:text-white transition">API</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><a href="#" className="hover:text-white transition">About</a></li>
              <li><a href="#" className="hover:text-white transition">Blog</a></li>
              <li><a href="#" className="hover:text-white transition">Careers</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><a href="#" className="hover:text-white transition">Privacy</a></li>
              <li><a href="#" className="hover:text-white transition">Terms</a></li>
              <li><a href="#" className="hover:text-white transition">Security</a></li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-white/10 text-center text-gray-400 text-sm">
          <p>&copy; 2025 MediAnalyzer. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
