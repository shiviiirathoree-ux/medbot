import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Calendar, Clock, Stethoscope, Video, Building } from 'lucide-react'
import api from '../../api/axios'
import toast from 'react-hot-toast'

export default function BookingModal({ doctor, onClose }) {
  const [step, setStep] = useState(1) // 1=select slot, 2=confirm
  const [form, setForm] = useState({ date: '', timeSlot: '', type: 'in-person', symptoms: '', notes: '' })
  const [slots, setSlots] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchSlots = async (date) => {
    if (!date) return
    setForm(p => ({ ...p, date }))
    try {
      const res = await api.get(`/appointments/slots/${doctor._id}`, { params: { date } })
      setSlots(res.data.data)
    } catch { setSlots([]) }
  }

  const book = async () => {
    if (!form.date || !form.timeSlot) { toast.error('Please select date and time'); return }
    setLoading(true)
    try {
      await api.post('/appointments', { doctorId: doctor._id, ...form, appointmentDate: form.date })
      toast.success('Appointment booked successfully! 🎉')
      onClose()
    } catch (err) {
      toast.error(err.message || 'Booking failed')
    } finally { setLoading(false) }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="w-full max-w-md card relative"
          onClick={e => e.stopPropagation()}
        >
          <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400">
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center text-xl font-bold text-white">
              {doctor.name?.charAt(0)}
            </div>
            <div>
              <h3 className="font-bold text-white">Dr. {doctor.name}</h3>
              <p className="text-primary-400 text-sm">{doctor.specialization}</p>
            </div>
          </div>

          {/* Consultation type */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            {[
              { val: 'in-person', icon: Building, label: 'In-Person' },
              { val: 'online',    icon: Video,    label: 'Online', disabled: !doctor.onlineConsultation },
            ].map(({ val, icon: Icon, label, disabled }) => (
              <button key={val} disabled={disabled} onClick={() => setForm(p => ({ ...p, type: val }))}
                className={`flex items-center gap-2 p-3 rounded-xl border text-sm transition-all ${form.type === val ? 'border-primary-500 bg-primary-900/40 text-primary-300' : 'border-white/10 text-slate-400 hover:border-white/20'} ${disabled ? 'opacity-30 cursor-not-allowed' : ''}`}>
                <Icon className="w-4 h-4" /> {label}
              </button>
            ))}
          </div>

          {/* Date */}
          <div className="mb-4">
            <label className="text-xs text-slate-400 mb-1.5 block">Select Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input id="appt-date" type="date" className="input pl-10"
                min={new Date().toISOString().split('T')[0]}
                value={form.date} onChange={e => fetchSlots(e.target.value)} />
            </div>
          </div>

          {/* Time slots */}
          {slots.length > 0 && (
            <div className="mb-4">
              <label className="text-xs text-slate-400 mb-2 block">Available Slots</label>
              <div className="grid grid-cols-3 gap-2 max-h-32 overflow-y-auto">
                {slots.map(slot => (
                  <button key={slot} onClick={() => setForm(p => ({ ...p, timeSlot: slot }))}
                    className={`py-2 rounded-xl text-xs font-medium border transition-all ${form.timeSlot === slot ? 'border-primary-500 bg-primary-900/40 text-primary-300' : 'border-white/10 text-slate-400 hover:border-white/20 hover:text-white'}`}>
                    {slot}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Symptoms */}
          <div className="mb-4">
            <label className="text-xs text-slate-400 mb-1.5 block">Symptoms / Reason (optional)</label>
            <textarea className="input resize-none" rows={2} placeholder="Describe your symptoms..."
              value={form.symptoms} onChange={e => setForm(p => ({ ...p, symptoms: e.target.value }))} />
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-white/5">
            <div>
              <p className="text-xs text-slate-500">Consultation Fee</p>
              <p className="text-white font-bold text-lg">₹{doctor.consultationFee}</p>
            </div>
            <button id="confirm-booking" onClick={book} disabled={loading || !form.date || !form.timeSlot} className="btn-primary flex items-center gap-2 disabled:opacity-40">
              {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Stethoscope className="w-4 h-4" />}
              Confirm Booking
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
