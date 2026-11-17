import { useState, useEffect } from 'react'
import { useLanguage } from '../../context/LanguageContext'
import { motion } from 'framer-motion'
import { Search, AlertTriangle, ChevronRight, Activity, Zap } from 'lucide-react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'
import toast from 'react-hot-toast'

const RISK_COLORS = {
  low: 'badge-success',
  moderate: 'badge-warning',
  high: 'text-orange-400 bg-orange-900/20 border border-orange-700/20',
  critical: 'badge-danger',
}
const RISK_ICONS = { low: '🟢', moderate: '🟡', high: '🟠', critical: '🔴' }

function SymptomChecker() {
  const [symptoms, setSymptoms] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const analyze = async () => {
    if (!symptoms.trim()) { toast.error('Please enter symptoms'); return }
    setLoading(true)
    try {
      const symptomList = symptoms.split(',').map(s => s.trim()).filter(Boolean)
      const res = await api.post('/diseases/predict', { symptoms: symptomList })
      setResult(res.data.data)
    } catch { toast.error('Analysis failed') }
    finally { setLoading(false) }
  }

  return (
    <div className="card">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-primary-900/50 flex items-center justify-center"><Activity className="w-5 h-5 text-primary-400" /></div>
        <div>
          <h3 className="font-semibold text-white">AI Symptom Checker</h3>
          <p className="text-xs text-slate-400">Describe your symptoms for AI analysis</p>
        </div>
      </div>
      <div className="flex gap-3">
        <input className="input flex-1" placeholder="e.g. headache, fever, fatigue (comma separated)"
          value={symptoms} onChange={e => setSymptoms(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && analyze()} />
        <button id="check-symptoms" onClick={analyze} disabled={loading} className="btn-primary px-5 flex items-center gap-2 flex-shrink-0">
          {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Zap className="w-4 h-4" />}
          Analyze
        </button>
      </div>
      {result && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 space-y-3">
          {result.aiPrediction?.topPredictions?.map((p, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/5">
              <div>
                <p className="font-medium text-white">{p.disease}</p>
                <p className="text-xs text-slate-400 mt-0.5">{p.description}</p>
              </div>
              <span className="badge-warning ml-3 flex-shrink-0">{p.probability}</span>
            </div>
          ))}
          {result.aiPrediction?.urgencyLevel && (
            <div className="p-3 rounded-xl bg-amber-900/20 border border-amber-700/20">
              <p className="text-amber-400 text-sm font-medium">⚠️ {result.aiPrediction.urgencyLevel?.toUpperCase()} URGENCY</p>
              {result.aiPrediction.immediateActions?.map((a, i) => <p key={i} className="text-xs text-slate-400 mt-1">• {a}</p>)}
            </div>
          )}
          {result.aiPrediction?.disclaimer && <p className="text-xs text-slate-500 italic">{result.aiPrediction.disclaimer}</p>}
        </motion.div>
      )}
    </div>
  )
}

export default function Diseases() {
  const { t } = useLanguage()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [categories, setCategories] = useState([])
  const [diseases, setDiseases] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    api.get('/diseases/categories').then(r => setCategories(r.data.data)).catch(() => {})
  }, [])

  useEffect(() => {
    setLoading(true)
    api.get('/diseases', { params: { search, category } })
      .then(r => { setDiseases(r.data.data); setTotal(r.data.total) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [search, category])

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="page-title">{t('diseases.title')}</h1>
        <p className="text-slate-400 text-sm mt-1">{total} diseases in database</p>
      </div>

      <SymptomChecker />

      {/* Search */}
      <div className="flex gap-3 flex-wrap">
        <div className="flex-1 relative min-w-60">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input id="disease-search" className="input pl-10" placeholder={t('diseases.search')}
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input w-auto min-w-44" value={category} onChange={e => setCategory(e.target.value)}>
          <option value="">All Categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Disease grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="card h-36 animate-pulse bg-white/5" />)}
        </div>
      ) : diseases.length === 0 ? (
        <div className="card text-center py-16">
          <p className="text-4xl mb-3">🔍</p>
          <p className="text-white font-semibold">No diseases found</p>
          <p className="text-slate-400 text-sm">Try a different search or use the symptom checker above</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {diseases.map((disease, i) => (
            <motion.div key={disease._id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }} className="card hover:border-primary-700/30 group">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{RISK_ICONS[disease.riskLevel]}</span>
                  <h3 className="font-semibold text-white">{disease.name}</h3>
                </div>
                <span className={`badge text-xs ${RISK_COLORS[disease.riskLevel]}`}>{disease.riskLevel}</span>
              </div>
              {disease.category && <p className="text-xs text-primary-400 mb-2">{disease.category}</p>}
              <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed">{disease.overview}</p>
              <div className="mt-3 pt-3 border-t border-white/5">
                <div className="flex flex-wrap gap-1 mb-3">
                  {disease.symptoms?.slice(0, 3).map(s => (
                    <span key={s} className="px-2 py-0.5 rounded-full bg-white/5 text-xs text-slate-400">{s}</span>
                  ))}
                  {disease.symptoms?.length > 3 && <span className="text-xs text-slate-500">+{disease.symptoms.length - 3} more</span>}
                </div>
                <Link to={`/diseases/${disease._id}`} className="flex items-center gap-1 text-primary-400 hover:text-primary-300 text-sm font-medium group-hover:gap-2 transition-all">
                  Learn more <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
