import { motion } from 'framer-motion'

const FeatureCard = ({ icon, title, description, color, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -10 }}
      className="glow-card group cursor-pointer"
    >
      <motion.div
        whileHover={{ rotate: 360, scale: 1.1 }}
        transition={{ duration: 0.5 }}
        className={`w-16 h-16 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-6 group-hover:shadow-2xl`}
      >
        {icon}
      </motion.div>

      <h3 className="text-2xl font-bold mb-3">{title}</h3>
      <p className="text-gray-300 leading-relaxed">{description}</p>

      {/* Animated underline */}
      <motion.div
        className={`h-1 bg-gradient-to-r ${color} rounded-full mt-6`}
        initial={{ width: 0 }}
        whileHover={{ width: '100%' }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  )
}

export default FeatureCard
