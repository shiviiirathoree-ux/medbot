import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { motion } from 'framer-motion'
import { User, Phone, Calendar, Droplet, Weight, Ruler, Heart, Edit3, Save, X, Shield, Activity } from 'lucide-react'
import api from '../../api/axios'
import toast from 'react-hot-toast'

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

export default function Profile() {
  const { user, updateUser } = useAuth()
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({
    name: '', phone: '', dateOfBirth: '', gender: '',
    healthProfile: { bloodGroup: '', height: '', weight: '', allergies: [], chronicConditions: [] }
  })
  const [loading, setLoading] = useState(false)
  const [appointments, setAppointments] = useState([])
  const [records, setRecords] = useState([])
  const [newAllergy, setNewAllergy] = useState('')
  const [newCondition, setNewCondition] = useState('')

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        phone: user.phone || '',
        dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
        gender: user.gender || '',
        healthProfile: {
          bloodGroup: user.healthProfile?.bloodGroup || '',
          height: user.healthProfile?.height || '',
          weight: user.healthProfile?.weight || '',
          allergies: user.healthProfile?.allergies || [],
          chronicConditions: user.healthProfile?.chronicConditions || [],
        }
      })
    }
    api.get('/appointments', { params: { upcoming: true } }).then(r => setAppointments(r.data.data)).catch(() => {})
    api.get('/health/records', { params: { limit: 5 } }).then(r => setRecords(r.data.data)).catch(() => {})
  }, [user])

  const save = async () => {
    setLoading(true)
    try {
      const res = await api.put('/auth/profile', form)
      updateUser(res.data.user)
      toast.success('Profile updated!')
      setEditing(false)
    } catch { toast.error('Update failed') }
    finally { setLoading(false) }
  }

  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }))
  const setHP = (k) => (e) => setForm(p => ({ ...p, healthProfile: { ...p.healthProfile, [k]: e.target.value } }))

  const addTag = (field, val, setter) => {
    if (!val.trim()) return
    setForm(p => ({ ...p, healthProfile: { ...p.healthProfile, [field]: [...(p.healthProfile[field] || []), val.trim()] } }))
    setter('')
  }
  const removeTag = (field, idx) => setForm(p => ({ ...p, healthProfile: { ...p.healthProfile, [field]: p.healthProfile[field].filter((_, i) => i !== idx) } }))

  const bmi = form.healthProfile.height && form.healthProfile.weight
    ? (form.healthProfile.weight / ((form.healthProfile.height / 100) ** 2)).toFixed(1)
    : null

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="page-title">My Profile</h1>
        {!editing ? (
          <button id="edit-profile" onClick={() => setEditing(true)} className="btn-secondary flex items-center gap-2"><Edit3 className="w-4 h-4" /> Edit Profile</button>
        ) : (
          <div className="flex gap-2">
            <button onClick={() => setEditing(false)} className="btn-secondary px-3 py-2"><X className="w-4 h-4" /></button>
            <button id="save-profile" onClick={save} disabled={loading} className="btn-primary flex items-center gap-2">
              {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />} Save
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Avatar card */}
        <div className="card text-center flex flex-col items-center gap-4">
          <div className="w-24 h-24 rounded-2xl gradient-bg flex items-center justify-center text-4xl font-bold text-white">
            {user?.name?.charAt(0)?.toUpperCase()}
          </div>
          <div>
            <h2 className="font-bold text-white text-xl">{user?.name}</h2>
            <p className="text-primary-400 text-sm capitalize mt-0.5">{user?.role}</p>
            <p className="text-slate-400 text-xs mt-1">{user?.email}</p>
          </div>
          <div className="w-full pt-4 border-t border-white/5 space-y-3">
            {[
              { label: 'Member Since', value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en', { month: 'short', year: 'numeric' }) : '—', icon: Calendar },
              { label: 'Blood Group',  value: user?.healthProfile?.bloodGroup || '—', icon: Droplet },
              { label: 'BMI',          value: bmi || '—', icon: Activity },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="flex items-center justify-between text-sm">
                <span className="text-slate-400 flex items-center gap-2"><Icon className="w-3.5 h-3.5" /> {label}</span>
                <span className="font-medium text-white">{value}</span>
              </div>
            ))}
          </div>
          {user?.role === 'patient' && (
            <div className="w-full p-3 rounded-xl bg-emerald-900/20 border border-emerald-700/20">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-medium">
                <Shield className="w-3.5 h-3.5" /> HIPAA-Inspired Privacy
              </div>
              <p className="text-xs text-slate-500 mt-1">Your health data is encrypted and secure</p>
            </div>
          )}
        </div>

        {/* Edit form */}
        <div className="lg:col-span-2 space-y-4">
          {/* Personal info */}
          <div className="card">
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2"><User className="w-4 h-4 text-primary-400" /> Personal Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: 'Full Name', key: 'name', placeholder: 'John Doe', type: 'text' },
                { label: 'Phone',     key: 'phone', placeholder: '+91 9999999999', type: 'tel' },
              ].map(({ label, key, placeholder, type }) => (
                <div key={key}>
                  <label className="text-xs text-slate-400 mb-1.5 block">{label}</label>
                  {editing ? <input type={type} className="input" placeholder={placeholder} value={form[key]} onChange={set(key)} />
                    : <p className="text-white text-sm py-3 px-4 rounded-xl bg-white/3">{form[key] || '—'}</p>}
                </div>
              ))}
              <div>
                <label className="text-xs text-slate-400 mb-1.5 block">Date of Birth</label>
                {editing ? <input type="date" className="input" value={form.dateOfBirth} onChange={set('dateOfBirth')} />
                  : <p className="text-white text-sm py-3 px-4 rounded-xl bg-white/3">{form.dateOfBirth || '—'}</p>}
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1.5 block">Gender</label>
                {editing ? (
                  <select className="input" value={form.gender} onChange={set('gender')}>
                    <option value="">Select gender</option>
                    {['male', 'female', 'other'].map(g => <option key={g} value={g} className="capitalize">{g}</option>)}
                  </select>
                ) : <p className="text-white text-sm py-3 px-4 rounded-xl bg-white/3 capitalize">{form.gender || '—'}</p>}
              </div>
            </div>
          </div>

          {/* Health profile */}
          <div className="card">
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2"><Heart className="w-4 h-4 text-rose-400" /> Health Profile</h3>
            <div className="grid grid-cols-3 gap-4 mb-4">
              {[
                { label: 'Blood Group', key: 'bloodGroup', type: 'select' },
                { label: 'Height (cm)', key: 'height',     type: 'number', placeholder: '170' },
                { label: 'Weight (kg)', key: 'weight',     type: 'number', placeholder: '70'  },
              ].map(({ label, key, type, placeholder }) => (
                <div key={key}>
                  <label className="text-xs text-slate-400 mb-1.5 block">{label}</label>
                  {editing ? (
                    type === 'select' ? (
                      <select className="input" value={form.healthProfile[key]} onChange={setHP(key)}>
                        <option value="">Select</option>
                        {BLOOD_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
                      </select>
                    ) : <input type={type} className="input" placeholder={placeholder} value={form.healthProfile[key]} onChange={setHP(key)} />
                  ) : <p className="text-white text-sm py-3 px-4 rounded-xl bg-white/3">{form.healthProfile[key] || '—'}</p>}
                </div>
              ))}
            </div>
            {/* Allergies */}
            <div className="mb-4">
              <label className="text-xs text-slate-400 mb-2 block">Allergies</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {form.healthProfile.allergies.map((a, i) => (
                  <span key={i} className="badge-warning flex items-center gap-1">
                    {a}
                    {editing && <button onClick={() => removeTag('allergies', i)} className="ml-1 hover:text-red-400"><X className="w-3 h-3" /></button>}
                  </span>
                ))}
              </div>
              {editing && (
                <div className="flex gap-2">
                  <input className="input flex-1 text-xs py-2" placeholder="Add allergy..." value={newAllergy} onChange={e => setNewAllergy(e.target.value)} onKeyDown={e => e.key === 'Enter' && addTag('allergies', newAllergy, setNewAllergy)} />
                  <button onClick={() => addTag('allergies', newAllergy, setNewAllergy)} className="btn-secondary text-xs px-3 py-2">Add</button>
                </div>
              )}
            </div>
            {/* Conditions */}
            <div>
              <label className="text-xs text-slate-400 mb-2 block">Chronic Conditions</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {form.healthProfile.chronicConditions.map((c, i) => (
                  <span key={i} className="badge-primary flex items-center gap-1">
                    {c}
                    {editing && <button onClick={() => removeTag('chronicConditions', i)} className="ml-1 hover:text-red-400"><X className="w-3 h-3" /></button>}
                  </span>
                ))}
              </div>
              {editing && (
                <div className="flex gap-2">
                  <input className="input flex-1 text-xs py-2" placeholder="Add condition..." value={newCondition} onChange={e => setNewCondition(e.target.value)} onKeyDown={e => e.key === 'Enter' && addTag('chronicConditions', newCondition, setNewCondition)} />
                  <button onClick={() => addTag('chronicConditions', newCondition, setNewCondition)} className="btn-secondary text-xs px-3 py-2">Add</button>
                </div>
              )}
            </div>
          </div>

          {/* Upcoming appointments */}
          {appointments.length > 0 && (
            <div className="card">
              <h3 className="font-semibold text-white mb-4">Upcoming Appointments</h3>
              <div className="space-y-3">
                {appointments.slice(0, 3).map(appt => (
                  <div key={appt._id} className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
                    <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center text-lg font-bold text-white flex-shrink-0">
                      {appt.doctor?.name?.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white text-sm">Dr. {appt.doctor?.name}</p>
                      <p className="text-xs text-slate-400">{appt.doctor?.specialization} · {new Date(appt.appointmentDate).toLocaleDateString()} {appt.timeSlot}</p>
                    </div>
                    <span className={`badge text-xs ${appt.status === 'confirmed' ? 'badge-success' : 'badge-warning'}`}>{appt.status}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
