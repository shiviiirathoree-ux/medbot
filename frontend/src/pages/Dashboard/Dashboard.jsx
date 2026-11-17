import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchDashboard, updateMetrics } from '../../store/slices/healthSlice'
import { fetchTodaySchedule } from '../../store/slices/medicineSlice'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'
import { motion } from 'framer-motion'
import { Droplets, Moon, Footprints, Heart, TrendingUp, Plus, Minus, Activity, Sparkles, ChevronRight, Calendar } from 'lucide-react'
import { Link } from 'react-router-dom'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import { useState } from 'react'

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.4 } })
}

function MetricCard({ icon: Icon, label, value, unit, color, onAdd, onMinus, id }) {
  return (
    <motion.div custom={0} variants={cardVariants} initial="hidden" animate="visible" className="stat-card">
      <div className="flex items-center justify-between">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div className="flex gap-1">
          {onMinus && <button id={`${id}-minus`} onClick={onMinus} className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"><Minus className="w-3 h-3" /></button>}
          {onAdd   && <button id={`${id}-add`}   onClick={onAdd}   className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"><Plus  className="w-3 h-3" /></button>}
        </div>
      </div>
      <div className="mt-3">
        <p className="text-2xl font-bold text-white">{value ?? '—'}<span className="text-sm font-normal text-slate-400 ml-1">{unit}</span></p>
        <p className="text-xs text-slate-400 mt-0.5">{label}</p>
      </div>
    </motion.div>
  )
}

function HealthScoreRing({ score = 0 }) {
  const r = 54, c = 2 * Math.PI * r
  const offset = c - (score / 100) * c
  const color = score >= 80 ? '#14b8a6' : score >= 60 ? '#f59e0b' : '#ef4444'
  return (
    <div className="relative w-36 h-36 flex-shrink-0">
      <svg className="w-full h-full -rotate-90 health-ring" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
        <circle cx="60" cy="60" r={r} fill="none" stroke={color} strokeWidth="10"
          strokeDasharray={c} strokeDashoffset={offset}
          strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1.5s ease' }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-white">{score}</span>
        <span className="text-xs text-slate-400">/ 100</span>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const dispatch = useDispatch()
  const { user } = useAuth()
  const { t } = useLanguage()
  const { dashboard, loading } = useSelector(s => s.health)
  const { todaySchedule } = useSelector(s => s.medicines)
  const [metrics, setMetrics] = useState({ waterIntake: 0, sleepHours: 0, steps: 0 })

  useEffect(() => {
    dispatch(fetchDashboard())
    dispatch(fetchTodaySchedule())
  }, [dispatch])

  useEffect(() => {
    if (dashboard?.todayMetrics) setMetrics(dashboard.todayMetrics)
  }, [dashboard])

  const handleMetricUpdate = async (key, delta) => {
    const updated = { ...metrics, [key]: Math.max(0, (metrics[key] || 0) + delta) }
    setMetrics(updated)
    try {
      await api.put('/health/metrics', updated)
      toast.success('Updated!')
    } catch { toast.error('Failed to update') }
  }

  const chartData = dashboard?.last7DaysTrend?.map(r => ({
    date: new Date(r.date).toLocaleDateString('en', { weekday: 'short' }),
    score: r.healthScore || 0,
    water: r.lifestyle?.waterIntake || 0,
    sleep: r.lifestyle?.sleepHours || 0,
  })) || []

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening'

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">{t('dashboard.title')}</h1>
          <p className="text-slate-400 mt-1 text-sm">{greeting}, <span className="text-white font-medium">{user?.name}</span> 👋</p>
        </div>
        <Link to="/chat" className="btn-primary flex items-center gap-2">
          <Sparkles className="w-4 h-4" /> Ask AI
        </Link>
      </div>

      {/* Health Score + AI Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="card lg:col-span-1">
          <p className="text-sm font-semibold text-slate-300 mb-4">{t('dashboard.healthScore')}</p>
          <div className="flex items-center gap-6">
            <HealthScoreRing score={dashboard?.healthScore || 72} />
            <div className="space-y-2">
              {['Vitals', 'Lifestyle', 'Activity'].map((label, i) => (
                <div key={label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400">{label}</span>
                    <span className="text-white">{[78, 65, 74][i]}%</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full" style={{ width: `${[78, 65, 74][i]}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.1 } }} className="card lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-slate-300">{t('dashboard.aiInsights')}</p>
            <Sparkles className="w-4 h-4 text-primary-400" />
          </div>
          <div className="space-y-2">
            {(dashboard?.aiInsights?.length ? dashboard.aiInsights : [
              '💧 Drink at least 8 glasses of water today to stay hydrated.',
              '🚶 A 30-minute walk can significantly improve cardiovascular health.',
              '😴 Aim for 7–8 hours of quality sleep for optimal recovery.',
            ]).slice(0, 3).map((tip, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/8 transition-colors">
                <div className="w-1.5 h-1.5 rounded-full bg-primary-400 mt-2 flex-shrink-0" />
                <p className="text-sm text-slate-300 leading-relaxed">{tip}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard id="water" icon={Droplets}  label={t('dashboard.water')}    value={metrics.waterIntake} unit={t('dashboard.glasses')} color="bg-blue-500"    onAdd={() => handleMetricUpdate('waterIntake', 1)} onMinus={() => handleMetricUpdate('waterIntake', -1)} />
        <MetricCard id="sleep" icon={Moon}       label={t('dashboard.sleep')}    value={metrics.sleepHours}  unit={t('dashboard.hours')}   color="bg-indigo-500"  onAdd={() => handleMetricUpdate('sleepHours', 0.5)} onMinus={() => handleMetricUpdate('sleepHours', -0.5)} />
        <MetricCard id="steps" icon={Footprints} label={t('dashboard.steps')}    value={(metrics.steps || 0).toLocaleString()} unit=""     color="bg-emerald-500" onAdd={() => handleMetricUpdate('steps', 500)} onMinus={() => handleMetricUpdate('steps', -500)} />
        <MetricCard id="heart" icon={Heart}      label={t('dashboard.heartRate')} value={metrics.heartRate || 72} unit={t('dashboard.bpm')} color="bg-rose-500" />
      </div>

      {/* Charts + Today Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Health trend chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.2 } }} className="card lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-slate-300">7-Day Health Trend</p>
            <Activity className="w-4 h-4 text-primary-400" />
          </div>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#14b8a6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#f1f5f9', fontSize: '12px' }} />
                <Area type="monotone" dataKey="score" stroke="#14b8a6" strokeWidth={2} fill="url(#scoreGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-40 flex items-center justify-center text-slate-500 text-sm">Log health records to see your trend</div>
          )}
        </motion.div>

        {/* Today's medicines */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0, transition: { delay: 0.25 } }} className="card">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-slate-300">{t('dashboard.todayMeds')}</p>
            <Link to="/medicines" className="text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1">
              {t('common.viewAll')} <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-2">
            {todaySchedule.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-slate-500 text-sm">No medicines scheduled</p>
                <Link to="/medicines" className="btn-primary text-xs mt-3 inline-block">Add Medicine</Link>
              </div>
            ) : todaySchedule.slice(0, 4).map(med => (
              <div key={med._id} className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-lg flex-shrink-0" style={{ backgroundColor: `${med.color}22` }}>💊</div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-white truncate">{med.name}</p>
                  <p className="text-xs text-slate-500">{med.dosage} · {med.reminderTimes?.join(', ')}</p>
                </div>
                {med.takenToday > 0 ? <span className="badge-success text-xs">✓</span> : <span className="badge-warning text-xs">Due</span>}
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.3 } }} className="card">
        <p className="text-sm font-semibold text-slate-300 mb-4">Quick Actions</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { to: '/chat',      emoji: '🤖', label: 'Ask AI',         desc: 'Health questions' },
            { to: '/doctors',   emoji: '👨‍⚕️', label: 'Find Doctor',    desc: 'Book appointment' },
            { to: '/diseases',  emoji: '🔍', label: 'Check Symptoms',  desc: 'Symptom checker' },
            { to: '/emergency', emoji: '🆘', label: 'Emergency SOS',   desc: 'Quick access', danger: true },
          ].map(item => (
            <Link key={item.to} to={item.to} className={`p-4 rounded-xl border transition-all duration-200 hover:scale-[1.02] ${item.danger ? 'border-red-800/30 bg-red-900/10 hover:bg-red-900/20' : 'border-white/5 bg-white/3 hover:bg-white/8'}`}>
              <span className="text-2xl">{item.emoji}</span>
              <p className={`text-sm font-semibold mt-2 ${item.danger ? 'text-red-400' : 'text-white'}`}>{item.label}</p>
              <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
            </Link>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
