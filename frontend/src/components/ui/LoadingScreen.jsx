import { motion } from 'framer-motion'
import { Heart } from 'lucide-react'

export default function LoadingScreen() {
  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center">
      <motion.div
        className="flex flex-col items-center gap-4"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <motion.div
          className="w-16 h-16 rounded-2xl gradient-bg flex items-center justify-center"
          animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 0.9, 1] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
        >
          <Heart className="w-8 h-8 text-white" />
        </motion.div>
        <div className="space-y-1 text-center">
          <h2 className="font-display font-bold text-xl gradient-text">MedBot</h2>
          <p className="text-slate-500 text-sm">Loading your health dashboard...</p>
        </div>
        <div className="flex gap-1.5">
          {[0, 1, 2].map(i => (
            <motion.div key={i} className="w-2 h-2 rounded-full bg-primary-500"
              animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
              transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.2 }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  )
}
