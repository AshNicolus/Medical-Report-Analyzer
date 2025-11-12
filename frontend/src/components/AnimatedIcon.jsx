import { motion } from 'framer-motion'

const AnimatedIcon = ({ icon, delay, position, color }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ 
        opacity: 1, 
        scale: 1,
        y: [0, -20, 0],
      }}
      transition={{
        delay,
        duration: 1,
        y: {
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }
      }}
      className={`absolute ${position} ${color}`}
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="relative"
      >
        <div className="w-16 h-16 glass-effect rounded-2xl flex items-center justify-center backdrop-blur-xl">
          {icon}
        </div>
        {/* Glow effect */}
        <motion.div
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className={`absolute inset-0 ${color} rounded-2xl blur-xl -z-10`}
        />
      </motion.div>
    </motion.div>
  )
}

export default AnimatedIcon
