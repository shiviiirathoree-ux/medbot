import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, AlertTriangle, Shield, Activity, Heart, ChevronRight } from 'lucide-react'
import { motion } from 'framer-motion'
import api from '../../api/axios'

const RISK_COLORS = { low: 'text-emerald-400 bg-emerald-900/30', moderate: 'text-amber-400 bg-amber-900/30', high: 'text-orange-400 bg-orange-900/30', critical: 'text-red-400 bg-red-900/30' }

function Section({ title, icon: Icon, items = [], color = 'text-primary-400' }) {
  if (!items?.length) return null
  return (
    <div className="card">
      <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
        <Icon className={`w-4 h-4 ${color}`} /> {title}
      </h3>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-3 text-sm text-slate-300">
            <span className={`w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0 ${color.replace('text-', 'bg-')}`} />
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function DiseaseDetail() {
  const { id } = useParams()
  const [disease, setDisease] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get(`/diseases/${id}`).then(r => setDisease(r.data.data)).finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>
  if (!disease) return <div className="text-center py-16"><p className="text-white">Disease not found</p></div>

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <Link to="/diseases" className="flex items-center gap-2 text-slate-400 hover:text-primary-400 text-sm">
        <ArrowLeft className="w-4 h-4" /> Back to Diseases
      </Link>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="card">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-bold text-white">{disease.name}</h1>
            {disease.category && <p className="text-primary-400 text-sm mt-1">{disease.category}</p>}
            {disease.icdCode && <p className="text-slate-500 text-xs mt-0.5">ICD-10: {disease.icdCode}</p>}
          </div>
          <span className={`badge px-3 py-1.5 text-sm font-semibold capitalize ${RISK_COLORS[disease.riskLevel]}`}>
            {disease.riskLevel} risk
          </span>
        </div>
        <p className="text-slate-300 text-sm leading-relaxed">{disease.overview}</p>
        {disease.isContagious && (
          <div className="mt-4 flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-900/20 border border-amber-700/20 w-fit">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span className="text-amber-400 text-sm font-medium">This disease is contagious</span>
          </div>
        )}
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Section title="Symptoms" icon={Activity} items={disease.symptoms} color="text-blue-400" />
        <Section title="Causes" icon={AlertTriangle} items={disease.causes} color="text-orange-400" />
        <Section title="Prevention" icon={Shield} items={disease.prevention} color="text-emerald-400" />
        <Section title="Risk Factors" icon={AlertTriangle} items={disease.riskFactors} color="text-amber-400" />
      </div>

      {disease.treatments?.length > 0 && (
        <div className="card">
          <h3 className="font-semibold text-white mb-3 flex items-center gap-2"><Heart className="w-4 h-4 text-rose-400" /> Treatments</h3>
          <div className="space-y-3">
            {disease.treatments.map((t, i) => (
              <div key={i} className="p-3 rounded-xl bg-white/5">
                {t.type && <p className="text-xs text-primary-400 font-medium mb-1">{t.type}</p>}
                <p className="text-sm text-slate-300">{t.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <Section title="Lifestyle Changes" icon={Activity} items={disease.lifestyleChanges} color="text-teal-400" />

      {disease.emergencyWarnings?.length > 0 && (
        <div className="card border border-red-700/30 bg-red-900/10">
          <h3 className="font-semibold text-red-400 mb-3 flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> Emergency Warning Signs</h3>
          <ul className="space-y-2">
            {disease.emergencyWarnings.map((w, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-red-300">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2 flex-shrink-0" /> {w}
              </li>
            ))}
          </ul>
          <p className="text-xs text-red-400/70 mt-4">If you experience any of these, seek emergency medical care immediately.</p>
        </div>
      )}

      <div className="card bg-amber-900/10 border border-amber-700/20">
        <p className="text-amber-400/80 text-xs leading-relaxed"><strong>⚠️ Disclaimer:</strong> {disease.disclaimer}</p>
      </div>
    </div>
  )
}
