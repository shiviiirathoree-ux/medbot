import { useState, useEffect } from 'react'
import { useLanguage } from '../../context/LanguageContext'
import { motion, AnimatePresence } from 'framer-motion'
import { Brain, TrendingUp, Wind, Smile, Frown, Meh, Zap, Heart, Sun } from 'lucide-react'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

const MOODS = [
  { id: 'happy',    emoji: '😊', label: 'Happy',    color: 'text-yellow-400', bg: 'bg-yellow-900/30 border-yellow-700/30' },
  { id: 'calm',     emoji: '😌', label: 'Calm',     color: 'text-green-400',  bg: 'bg-green-900/30  border-green-700/30'  },
  { id: 'neutral',  emoji: '😐', label: 'Neutral',  color: 'text-slate-400',  bg: 'bg-white/10      border-white/10'       },
  { id: 'anxious',  emoji: '😰', label: 'Anxious',  color: 'text-orange-400', bg: 'bg-orange-900/30 border-orange-700/30' },
  { id: 'sad',      emoji: '😢', label: 'Sad',      color: 'text-blue-400',   bg: 'bg-blue-900/30   border-blue-700/30'   },
  { id: 'stressed', emoji: '😤', label: 'Stressed', color: 'text-red-400',    bg: 'bg-red-900/30    border-red-700/30'    },
]

const MEDITATIONS = [
  { title: '4-7-8 Breathing', desc: 'Inhale 4s, hold 7s, exhale 8s', duration: '5 min', emoji: '🌬️' },
  { title: 'Body Scan',       desc: 'Progressive muscle relaxation',   duration: '10 min', emoji: '🧘' },
  { title: 'Box Breathing',   desc: 'Inhale, hold, exhale, hold 4s each', duration: '4 min', emoji: '📦' },
  { title: 'Mindful Walking', desc: 'Focus on each step and breath',   duration: '15 min', emoji: '🚶' },
]

const WELLNESS_TIPS = [
  'Take a 10-minute break every hour to stretch and breathe deeply.',
  'Limit caffeine after 2 PM to improve sleep quality.',
  'Write down 3 things you\'re grateful for each morning.',
  'Spend 20 minutes in nature to reduce cortisol levels.',
  'Connect with a friend or loved one — social bonds reduce stress.',
]

function StressSlider({ value, onChange }) {
  const level = value <= 3 ? { label: 'Low', color: 'text-green-400' } : value <= 6 ? { label: 'Moderate', color: 'text-amber-400' } : { label: 'High', color: 'text-red-400' }
  return (
    <div>
      <div className="flex justify-between text-xs mb-2">
        <span className="text-slate-400">Stress Level</span>
        <span className={`font-semibold ${level.color}`}>{value}/10 — {level.label}</span>
      </div>
      <input type="range" min={1} max={10} value={value} onChange={e => onChange(Number(e.target.value))}
        className="w-full h-2 rounded-full appearance-none cursor-pointer accent-primary-500"
        style={{ background: `linear-gradient(to right, #14b8a6 0%, #14b8a6 ${(value - 1) * 11.11}%, rgba(255,255,255,0.1) ${(value - 1) * 11.11}%)` }} />
      <div className="flex justify-between text-xs text-slate-600 mt-1"><span>Relaxed</span><span>Overwhelmed</span></div>
    </div>
  )
}

export default function MoodTracker() {
  const { t } = useLanguage()
  const [selectedMood, setSelectedMood] = useState('')
  const [stressLevel, setStressLevel] = useState(5)
  const [note, setNote] = useState('')
  const [history, setHistory] = useState([])
  const [aiTips, setAiTips] = useState([])
  const [loading, setLoading] = useState(false)
  const [meditating, setMeditating] = useState(null)
  const [breathCount, setBreathCount] = useState(0)
  const [breathPhase, setBreathPhase] = useState('ready')

  useEffect(() => {
    api.get('/health/records', { params: { days: 14 } })
      .then(r => {
        const records = r.data.data.filter(rec => rec.lifestyle?.mood)
        setHistory(records.map(r => ({
          date: new Date(r.date).toLocaleDateString('en', { weekday: 'short' }),
          stress: r.lifestyle?.stressLevel || 5,
          mood: r.lifestyle?.mood,
        })))
      }).catch(() => {})
  }, [])

  const logMood = async () => {
    if (!selectedMood) { toast.error('Please select your mood'); return }
    setLoading(true)
    try {
      await api.post('/health/records', {
        lifestyle: { moodScore: 10 - stressLevel, stressLevel, mood: selectedMood },
        notes: note,
      })
      toast.success('Mood logged! 🎉')
      setNote('')
      // Get AI wellness tips
      const res = await api.post('/chat/message', {
        message: `I'm feeling ${selectedMood} with stress level ${stressLevel}/10. Give me 3 personalized wellness tips. Keep it brief and actionable.`,
        language: 'en'
      })
      const tipText = res.data.data.message
      setAiTips(tipText.split('\n').filter(l => l.trim().length > 10).slice(0, 4))
    } catch { toast.error('Failed to log mood') }
    finally { setLoading(false) }
  }

  // Breathing exercise
  const startBreathing = (med) => {
    setMeditating(med)
    setBreathCount(0)
    setBreathPhase('inhale')
    let count = 0
    const cycle = () => {
      const phases = ['inhale', 'hold', 'exhale', 'rest']
      const p = phases[count % 4]
      setBreathPhase(p)
      count++
      setBreathCount(Math.floor(count / 4) + 1)
    }
    const interval = setInterval(cycle, 4000)
    setTimeout(() => { clearInterval(interval); setMeditating(null); setBreathPhase('done'); toast.success('Great meditation session! 🧘') }, 60000)
    return () => clearInterval(interval)
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="page-title">{t('mood.title')}</h1>
        <p className="text-slate-400 text-sm mt-1">Track your emotional wellbeing and get personalized support</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mood selector */}
        <div className="card space-y-5">
          <h3 className="font-semibold text-white">{t('mood.howFeeling')}</h3>
          <div className="grid grid-cols-3 gap-3">
            {MOODS.map(mood => (
              <motion.button key={mood.id} whileTap={{ scale: 0.95 }} onClick={() => setSelectedMood(mood.id)}
                className={`p-3 rounded-xl border-2 text-center transition-all duration-200 ${selectedMood === mood.id ? `${mood.bg} scale-105` : 'border-white/5 bg-white/3 hover:bg-white/8'}`}>
                <span className="text-3xl">{mood.emoji}</span>
                <p className={`text-xs font-medium mt-1.5 ${selectedMood === mood.id ? mood.color : 'text-slate-400'}`}>{mood.label}</p>
              </motion.button>
            ))}
          </div>

          <StressSlider value={stressLevel} onChange={setStressLevel} />

          <div>
            <label className="text-xs text-slate-400 mb-1.5 block">Notes (optional)</label>
            <textarea className="input resize-none" rows={2} placeholder="How's your day going? What's on your mind?"
              value={note} onChange={e => setNote(e.target.value)} />
          </div>

          <motion.button id="log-mood" onClick={logMood} disabled={loading || !selectedMood}
            className="btn-primary w-full flex items-center justify-center gap-2 py-3 disabled:opacity-40"
            whileTap={{ scale: 0.98 }}>
            {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Heart className="w-4 h-4" /> Log My Mood</>}
          </motion.button>
        </div>

        {/* AI Tips + Trend */}
        <div className="space-y-4">
          {/* AI Wellness Tips */}
          <div className="card">
            <div className="flex items-center gap-2 mb-3">
              <Brain className="w-5 h-5 text-primary-400" />
              <h3 className="font-semibold text-white">AI Wellness Insights</h3>
            </div>
            <AnimatePresence>
              {aiTips.length > 0 ? (
                <div className="space-y-2">
                  {aiTips.map((tip, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex gap-3 p-3 rounded-xl bg-white/5">
                      <span className="text-primary-400 mt-0.5 flex-shrink-0">✦</span>
                      <p className="text-sm text-slate-300">{tip}</p>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {WELLNESS_TIPS.slice(0, 3).map((tip, i) => (
                    <div key={i} className="flex gap-3 p-3 rounded-xl bg-white/5">
                      <span className="text-primary-400 mt-0.5 flex-shrink-0">✦</span>
                      <p className="text-sm text-slate-300">{tip}</p>
                    </div>
                  ))}
                </div>
              )}
            </AnimatePresence>
          </div>

          {/* Mood trend chart */}
          {history.length > 0 && (
            <div className="card">
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-primary-400" /> 14-Day Stress Trend</h3>
              <ResponsiveContainer width="100%" height={120}>
                <LineChart data={history}>
                  <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[1, 10]} tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', fontSize: '11px', color: '#f1f5f9' }} />
                  <Line type="monotone" dataKey="stress" stroke="#f59e0b" strokeWidth={2} dot={{ fill: '#f59e0b', r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Meditation cards */}
      <div>
        <h3 className="font-semibold text-white mb-4">{t('mood.meditation')}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {MEDITATIONS.map(med => (
            <motion.div key={med.title} whileHover={{ y: -3 }} className="card cursor-pointer group" onClick={() => startBreathing(med)}>
              <span className="text-3xl">{med.emoji}</span>
              <h4 className="font-semibold text-white mt-3 text-sm">{med.title}</h4>
              <p className="text-xs text-slate-400 mt-1">{med.desc}</p>
              <div className="flex items-center gap-1 mt-3">
                <Wind className="w-3 h-3 text-primary-400" />
                <span className="text-xs text-primary-400">{med.duration}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Breathing exercise overlay */}
      <AnimatePresence>
        {meditating && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="text-center">
              <motion.div
                className="w-48 h-48 rounded-full border-4 border-primary-500 flex items-center justify-center mx-auto"
                animate={{
                  scale: breathPhase === 'inhale' ? 1.4 : breathPhase === 'hold' ? 1.4 : breathPhase === 'exhale' ? 0.8 : 1,
                  boxShadow: breathPhase === 'inhale' ? '0 0 60px rgba(20,184,166,0.4)' : '0 0 20px rgba(20,184,166,0.2)',
                }}
                transition={{ duration: 4, ease: 'easeInOut' }}
              >
                <div className="text-center">
                  <span className="text-5xl">{meditating.emoji}</span>
                  <p className="text-primary-400 font-semibold mt-2 capitalize">{breathPhase}</p>
                </div>
              </motion.div>
              <p className="text-white font-semibold text-xl mt-6">{meditating.title}</p>
              <p className="text-slate-400 mt-2">Cycle {breathCount}</p>
              <button onClick={() => setMeditating(null)} className="btn-secondary mt-6">End Session</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
