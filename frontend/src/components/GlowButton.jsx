import { motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'

const GlowButton = ({ children, onClick, size = 'md', className = '' }) => {
  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
    xl: 'px-10 py-5 text-xl'
  }

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`
        ${sizes[size]}
        bg-gradient-medical 
        rounded-xl 
        font-semibold 
        glow-button 
        flex 
        items-center 
        justify-center
        ${className}
      `}
    >
      {children}
    </motion.button>
  )
}

export default GlowButton
