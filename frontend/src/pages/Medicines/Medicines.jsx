import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchMedicines, deleteMedicine, logDose, fetchTodaySchedule } from '../../store/slices/medicineSlice'
import { useLanguage } from '../../context/LanguageContext'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Pill, Trash2, CheckCircle2, XCircle, Clock, Calendar, AlertTriangle } from 'lucide-react'
import api from '../../api/axios'
import toast from 'react-hot-toast'

const FREQUENCIES = ['once', 'twice', 'thrice', 'four_times']
const FORMS = ['tablet', 'capsule', 'syrup', 'injection', 'drops', 'other']

function AddMedicineModal({ onClose, onAdded }) {
  const [form, setForm] = useState({
    name: '', dosage: '', form: 'tablet', frequency: 'once',
    reminderTimes: ['08:00'], startDate: new Date().toISOString().split('T')[0],
    endDate: '', instructions: '', totalQuantity: 0, familyMember: 'self',
    color: '#14b8a6'
  })
  const [loading, setLoading] = useState(false)
  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }))

  const addReminderTime = () => setForm(p => ({ ...p, reminderTimes: [...p.reminderTimes, '12:00'] }))
  const updateTime = (i, v) => setForm(p => ({ ...p, reminderTimes: p.reminderTimes.map((t, j) => j === i ? v : t) }))
  const removeTime = (i) => setForm(p => ({ ...p, reminderTimes: p.reminderTimes.filter((_, j) => j !== i) }))

  const submit = async () => {
    if (!form.name || !form.dosage || !form.startDate) { toast.error('Fill required fields'); return }
    setLoading(true)
    try {
      const res = await api.post('/medicines', form)
      onAdded(res.data.data)
      toast.success('Medicine added!')
      onClose()
    } catch (err) { toast.error(err.message || 'Failed') }
    finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg card relative max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <h3 className="font-bold text-white text-lg mb-5">Add Medicine</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Medicine Name *</label>
              <input id="med-name" className="input" placeholder="e.g. Paracetamol" value={form.name} onChange={set('name')} />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Dosage *</label>
              <input id="med-dosage" className="input" placeholder="e.g. 500mg" value={form.dosage} onChange={set('dosage')} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Form</label>
              <select className="input" value={form.form} onChange={set('form')}>
                {FORMS.map(f => <option key={f} value={f} className="capitalize">{f}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Frequency</label>
              <select className="input" value={form.frequency} onChange={set('frequency')}>
                {FREQUENCIES.map(f => <option key={f} value={f}>{f.replace('_', ' ')}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-2 block">Reminder Times</label>
            <div className="space-y-2">
              {form.reminderTimes.map((t, i) => (
                <div key={i} className="flex gap-2">
                  <input type="time" className="input flex-1" value={t} onChange={e => updateTime(i, e.target.value)} />
                  {form.reminderTimes.length > 1 && <button onClick={() => removeTime(i)} className="w-9 h-9 rounded-lg bg-red-900/30 text-red-400 hover:bg-red-900/50 flex items-center justify-center"><XCircle className="w-4 h-4" /></button>}
                </div>
              ))}
              <button onClick={addReminderTime} className="btn-secondary text-xs flex items-center gap-1 py-2"><Plus className="w-3 h-3" /> Add Time</button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Start Date *</label>
              <input type="date" className="input" value={form.startDate} onChange={set('startDate')} />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">End Date</label>
              <input type="date" className="input" value={form.endDate} onChange={set('endDate')} />
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Instructions</label>
            <input className="input" placeholder="e.g. Take after meals" value={form.instructions} onChange={set('instructions')} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Total Quantity</label>
              <input type="number" className="input" placeholder="30" value={form.totalQuantity || ''} onChange={set('totalQuantity')} />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">For</label>
              <input className="input" placeholder="self / family member name" value={form.familyMember} onChange={set('familyMember')} />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <label className="text-xs text-slate-400">Color Tag</label>
            <input type="color" value={form.color} onChange={set('color')} className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0" />
          </div>
        </div>
        <div className="flex gap-3 mt-6 pt-4 border-t border-white/5">
          <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button id="add-medicine-confirm" onClick={submit} disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2">
            {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Plus className="w-4 h-4" />}
            Add Medicine
          </button>
        </div>
      </motion.div>
    </div>
  )
}

export default function Medicines() {
  const dispatch = useDispatch()
  const { t } = useLanguage()
  const { list: medicines, todaySchedule, loading } = useSelector(s => s.medicines)
  const [showAdd, setShowAdd] = useState(false)
  const [activeTab, setActiveTab] = useState('schedule')

  useEffect(() => {
    dispatch(fetchMedicines())
    dispatch(fetchTodaySchedule())
  }, [dispatch])

  const handleDelete = async (id) => {
    if (!confirm('Delete this medicine?')) return
    try { dispatch(deleteMedicine(id)); toast.success('Medicine deleted') } catch { toast.error('Failed') }
  }

  const handleLog = async (id, status) => {
    try {
      await api.post(`/medicines/${id}/log`, { status, scheduledTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) })
      dispatch(fetchTodaySchedule())
      toast.success(status === 'taken' ? '✅ Marked as taken!' : '⚠️ Marked as missed')
    } catch { toast.error('Failed to log dose') }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="page-title">{t('medicines.title')}</h1>
        <button id="open-add-medicine" onClick={() => setShowAdd(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> {t('medicines.add')}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl bg-white/5 w-fit">
        {['schedule', 'all'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-xl text-sm font-medium transition-all capitalize ${activeTab === tab ? 'bg-primary-700 text-white' : 'text-slate-400 hover:text-white'}`}>
            {tab === 'schedule' ? "Today's Schedule" : 'All Medicines'}
          </button>
        ))}
      </div>

      {activeTab === 'schedule' && (
        <div className="space-y-3">
          {todaySchedule.length === 0 ? (
            <div className="card text-center py-16">
              <Pill className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-white font-semibold">No medicines scheduled today</p>
              <p className="text-slate-400 text-sm mt-1">Add medicines to see your daily schedule</p>
            </div>
          ) : todaySchedule.map((med, i) => (
            <motion.div key={med._id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }} className="card flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ backgroundColor: `${med.color}22` }}>💊</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-white">{med.name}</h3>
                  {med.takenToday > 0 && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                </div>
                <p className="text-sm text-slate-400">{med.dosage} · {med.form}</p>
                <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {med.reminderTimes?.join(', ')}</span>
                  {med.instructions && <span>{med.instructions}</span>}
                  {med.familyMember !== 'self' && <span className="badge-primary">{med.familyMember}</span>}
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button onClick={() => handleLog(med._id, 'taken')} className="w-9 h-9 rounded-xl bg-emerald-900/30 text-emerald-400 hover:bg-emerald-900/50 flex items-center justify-center transition-colors" title="Mark taken">
                  <CheckCircle2 className="w-4 h-4" />
                </button>
                <button onClick={() => handleLog(med._id, 'missed')} className="w-9 h-9 rounded-xl bg-red-900/30 text-red-400 hover:bg-red-900/50 flex items-center justify-center transition-colors" title="Mark missed">
                  <XCircle className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {activeTab === 'all' && (
        <div className="space-y-3">
          {loading ? (
            <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="card h-24 animate-pulse bg-white/5" />)}</div>
          ) : medicines.length === 0 ? (
            <div className="card text-center py-16">
              <Pill className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-white font-semibold">No medicines added yet</p>
            </div>
          ) : medicines.map((med, i) => (
            <motion.div key={med._id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }} className="card flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ backgroundColor: `${med.color}22` }}>💊</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-white">{med.name}</h3>
                  <span className={`badge ${med.isActive ? 'badge-success' : 'badge-warning'}`}>{med.isActive ? 'Active' : 'Inactive'}</span>
                </div>
                <p className="text-sm text-slate-400">{med.dosage} · {med.form} · {med.frequency?.replace('_', ' ')}</p>
                <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(med.startDate).toLocaleDateString()}</span>
                  {med.remainingQuantity > 0 && med.remainingQuantity <= med.refillThreshold && (
                    <span className="flex items-center gap-1 text-amber-400"><AlertTriangle className="w-3 h-3" /> Refill soon ({med.remainingQuantity} left)</span>
                  )}
                </div>
              </div>
              <button onClick={() => handleDelete(med._id)} className="w-9 h-9 rounded-xl bg-red-900/20 text-red-400 hover:bg-red-900/40 flex items-center justify-center">
                <Trash2 className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {showAdd && <AddMedicineModal onClose={() => setShowAdd(false)} onAdded={() => { dispatch(fetchMedicines()); dispatch(fetchTodaySchedule()) }} />}
    </div>
  )
}
