import { useState, useEffect } from 'react'
import { useLanguage } from '../../context/LanguageContext'
import { motion } from 'framer-motion'
import { Siren, Phone, Plus, Trash2, MapPin, Navigation, AlertCircle, Star, X } from 'lucide-react'
import api from '../../api/axios'
import toast from 'react-hot-toast'

const NEARBY_HOSPITALS = [
  { name: 'City General Hospital', distance: '1.2 km', phone: '108', emergency: true },
  { name: 'Apollo Medical Center', distance: '2.5 km', phone: '1860-500-1066', emergency: true },
  { name: 'Fortis Healthcare', distance: '3.8 km', phone: '1800-111-4444', emergency: false },
]

function ContactCard({ contact, onDelete }) {
  return (
    <div className="card flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold text-white flex-shrink-0 ${contact.isPrimary ? 'gradient-bg' : 'bg-white/10'}`}>
        {contact.name?.charAt(0)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-white">{contact.name}</h3>
          {contact.isPrimary && <span className="badge-primary flex items-center gap-1"><Star className="w-3 h-3" /> Primary</span>}
        </div>
        <p className="text-sm text-slate-400">{contact.relation} · {contact.phone}</p>
      </div>
      <div className="flex gap-2 flex-shrink-0">
        <a href={`tel:${contact.phone}`} className="w-9 h-9 rounded-xl bg-emerald-900/30 text-emerald-400 hover:bg-emerald-900/50 flex items-center justify-center">
          <Phone className="w-4 h-4" />
        </a>
        <button onClick={() => onDelete(contact._id)} className="w-9 h-9 rounded-xl bg-red-900/20 text-red-400 hover:bg-red-900/40 flex items-center justify-center">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

function AddContactModal({ onClose, onAdded }) {
  const [form, setForm] = useState({ name: '', phone: '', relation: '', email: '', isPrimary: false })
  const [loading, setLoading] = useState(false)
  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }))

  const submit = async () => {
    if (!form.name || !form.phone || !form.relation) { toast.error('Fill required fields'); return }
    setLoading(true)
    try {
      const res = await api.post('/emergency/contacts', form)
      onAdded(res.data.data); toast.success('Contact added!'); onClose()
    } catch { toast.error('Failed') } finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md card" onClick={e => e.stopPropagation()}>
        <h3 className="font-bold text-white text-lg mb-5">Add Emergency Contact</h3>
        <div className="space-y-3">
          <input className="input" placeholder="Full Name *" value={form.name} onChange={set('name')} />
          <input className="input" placeholder="Phone Number *" type="tel" value={form.phone} onChange={set('phone')} />
          <input className="input" placeholder="Relation * (e.g. Mother, Doctor)" value={form.relation} onChange={set('relation')} />
          <input className="input" placeholder="Email (optional)" type="email" value={form.email} onChange={set('email')} />
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={form.isPrimary} onChange={e => setForm(p => ({ ...p, isPrimary: e.target.checked }))} className="w-4 h-4 accent-primary-500" />
            <span className="text-sm text-slate-300">Set as Primary Contact</span>
          </label>
        </div>
        <div className="flex gap-3 mt-5 pt-4 border-t border-white/5">
          <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button onClick={submit} disabled={loading} className="btn-primary flex-1">
            {loading ? 'Saving...' : 'Add Contact'}
          </button>
        </div>
      </motion.div>
    </div>
  )
}

export default function Emergency() {
  const { t } = useLanguage()
  const [contacts, setContacts] = useState([])
  const [showAdd, setShowAdd] = useState(false)
  const [sosLoading, setSosLoading] = useState(false)
  const [sosSent, setSosSent] = useState(false)
  const [location, setLocation] = useState(null)

  useEffect(() => {
    api.get('/emergency/contacts').then(r => setContacts(r.data.data)).catch(() => {})
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {}
      )
    }
  }, [])

  const triggerSOS = async () => {
    if (sosLoading || sosSent) return
    setSosLoading(true)
    try {
      await api.post('/emergency/sos', {
        lat: location?.lat, lng: location?.lng,
        address: location ? `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}` : 'Location unavailable'
      })
      setSosSent(true)
      toast.success(`🚨 SOS sent to ${contacts.length} contact(s)!`)
      setTimeout(() => setSosSent(false), 30000)
    } catch { toast.error('SOS failed. Call emergency services directly.') }
    finally { setSosLoading(false) }
  }

  const deleteContact = async (id) => {
    try { await api.delete(`/emergency/contacts/${id}`); setContacts(prev => prev.filter(c => c._id !== id)); toast.success('Deleted') } catch {}
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="page-title">{t('emergency.title')}</h1>

      {/* SOS Button */}
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="card text-center py-12 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 bg-gradient-to-b from-red-900/5 to-transparent" />
        <p className="text-slate-400 mb-8 text-sm">Press and hold the SOS button in an emergency — it will notify all your emergency contacts with your live location.</p>
        <div className="relative flex justify-center">
          {/* Pulse rings */}
          {!sosSent && (
            <>
              <div className="absolute w-48 h-48 rounded-full border-2 border-red-500/20 animate-ping" style={{ animationDuration: '2s' }} />
              <div className="absolute w-40 h-40 rounded-full border-2 border-red-500/30 animate-ping" style={{ animationDuration: '1.5s' }} />
            </>
          )}
          <motion.button
            id="sos-button"
            onClick={triggerSOS}
            disabled={sosLoading}
            whileTap={{ scale: 0.95 }}
            className={`relative w-36 h-36 rounded-full font-display font-black text-4xl text-white shadow-2xl transition-all duration-300 sos-pulse ${sosSent ? 'bg-emerald-600 sos-pulse-off' : 'bg-gradient-to-b from-red-500 to-red-700'}`}
          >
            {sosLoading ? <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
              : sosSent ? '✓ SENT' : t('emergency.sos')}
          </motion.button>
        </div>
        {sosSent && <p className="mt-6 text-emerald-400 font-semibold text-lg animate-fade-in">{t('emergency.sosAlert')}</p>}
        <div className="flex items-center justify-center gap-2 mt-6 text-xs text-slate-500">
          <Navigation className="w-3 h-3" />
          {location ? `Location: ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}` : 'Enable location for accurate SOS'}
        </div>
      </motion.div>

      {/* Quick call buttons */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Ambulance', number: '108', emoji: '🚑', color: 'border-red-700/30 bg-red-900/10 hover:bg-red-900/20 text-red-400' },
          { label: 'Police',    number: '100', emoji: '🚔', color: 'border-blue-700/30 bg-blue-900/10 hover:bg-blue-900/20 text-blue-400' },
          { label: 'Fire',      number: '101', emoji: '🔥', color: 'border-orange-700/30 bg-orange-900/10 hover:bg-orange-900/20 text-orange-400' },
        ].map(s => (
          <a key={s.label} href={`tel:${s.number}`} className={`card text-center py-4 border transition-colors cursor-pointer ${s.color}`}>
            <span className="text-3xl">{s.emoji}</span>
            <p className="font-bold mt-2 text-sm">{s.label}</p>
            <p className="text-2xl font-black mt-1">{s.number}</p>
          </a>
        ))}
      </div>

      {/* Nearby hospitals */}
      <div className="card">
        <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-primary-400" /> {t('emergency.nearbyHospitals')}
        </h3>
        <div className="space-y-3">
          {NEARBY_HOSPITALS.map(h => (
            <div key={h.name} className="flex items-center justify-between p-3 rounded-xl bg-white/5">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium text-white text-sm">{h.name}</p>
                  {h.emergency && <span className="badge-danger">24/7</span>}
                </div>
                <p className="text-xs text-slate-400 mt-0.5">{h.distance} away</p>
              </div>
              <a href={`tel:${h.phone}`} className="btn-danger text-xs px-3 py-2 flex items-center gap-1"><Phone className="w-3 h-3" /> Call</a>
            </div>
          ))}
        </div>
      </div>

      {/* Emergency contacts */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-white">{t('emergency.contacts')}</h3>
          <button id="add-emergency-contact" onClick={() => setShowAdd(true)} className="btn-primary text-xs flex items-center gap-1">
            <Plus className="w-3 h-3" /> {t('emergency.addContact')}
          </button>
        </div>
        <div className="space-y-3">
          {contacts.length === 0 ? (
            <div className="card text-center py-8">
              <AlertCircle className="w-10 h-10 text-amber-400 mx-auto mb-2" />
              <p className="text-white font-semibold">No emergency contacts added</p>
              <p className="text-slate-400 text-sm mt-1">Add contacts to enable SOS notifications</p>
            </div>
          ) : contacts.map(c => <ContactCard key={c._id} contact={c} onDelete={deleteContact} />)}
        </div>
      </div>

      {showAdd && <AddContactModal onClose={() => setShowAdd(false)} onAdded={c => setContacts(p => [...p, c])} />}
    </div>
  )
}
