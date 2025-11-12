import { motion } from 'framer-motion'

const StepCard = ({ number, title, description, icon, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.2 }}
      className="relative"
    >
      {/* Connection Line */}
      {index < 3 && (
        <div className="hidden lg:block absolute top-16 left-full w-full h-0.5 bg-gradient-to-r from-accent to-transparent" />
      )}

      <div className="glow-card text-center relative z-10">
        {/* Step Number */}
        <motion.div
          initial={{ scale: 0 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.2 + 0.3, type: 'spring' }}
          className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 bg-gradient-medical rounded-full flex items-center justify-center text-xl font-bold shadow-lg"
        >
          {number}
        </motion.div>

        {/* Icon */}
        <motion.div
          whileHover={{ scale: 1.1, rotate: 5 }}
          className="w-20 h-20 mx-auto mb-6 mt-8 bg-gradient-to-br from-accent/20 to-transparent rounded-2xl flex items-center justify-center text-accent"
        >
          {icon}
        </motion.div>

        <h3 className="text-xl font-bold mb-3">{title}</h3>
        <p className="text-gray-300 text-sm leading-relaxed">{description}</p>
      </div>
    </motion.div>
  )
}

export default StepCard
