import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Star, MapPin, Clock, Video, Award, Phone, Globe, Calendar } from 'lucide-react'
import { motion } from 'framer-motion'
import api from '../../api/axios'
import BookingModal from '../../components/doctor/BookingModal'

export default function DoctorProfile() {
  const { id } = useParams()
  const [doctor, setDoctor] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showBooking, setShowBooking] = useState(false)

  useEffect(() => {
    api.get(`/doctors/${id}`).then(r => setDoctor(r.data.data)).finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>
  if (!doctor) return <div className="text-center py-16"><p className="text-white">Doctor not found</p></div>

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link to="/doctors" className="flex items-center gap-2 text-slate-400 hover:text-primary-400 transition-colors text-sm">
        <ArrowLeft className="w-4 h-4" /> Back to Doctors
      </Link>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="card">
        <div className="flex items-start gap-6">
          <div className="w-24 h-24 rounded-2xl gradient-bg flex items-center justify-center text-4xl font-bold text-white flex-shrink-0">
            {doctor.name?.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-white">Dr. {doctor.name}</h1>
                <p className="text-primary-400 font-medium">{doctor.specialization}</p>
                {doctor.qualifications?.length > 0 && <p className="text-slate-400 text-sm mt-1">{doctor.qualifications.join(', ')}</p>}
              </div>
              {doctor.isVerified && <span className="badge-success flex-shrink-0">✓ Verified</span>}
            </div>
            <div className="flex flex-wrap gap-4 mt-3 text-sm text-slate-300">
              <span className="flex items-center gap-1.5"><Award className="w-4 h-4 text-primary-400" /> {doctor.experience}+ years exp.</span>
              <span className="flex items-center gap-1.5 text-amber-400"><Star className="w-4 h-4 fill-amber-400" /> {doctor.rating?.toFixed(1)} ({doctor.totalReviews} reviews)</span>
              {doctor.hospital?.city && <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-red-400" /> {doctor.hospital.city}</span>}
              {doctor.onlineConsultation && <span className="flex items-center gap-1.5 text-green-400"><Video className="w-4 h-4" /> Online Available</span>}
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card space-y-4">
          <h3 className="font-semibold text-white">Practice Info</h3>
          {doctor.hospital?.name && <div><p className="text-xs text-slate-500">Hospital</p><p className="text-white text-sm">{doctor.hospital.name}</p></div>}
          {doctor.hospital?.address && <div><p className="text-xs text-slate-500">Address</p><p className="text-white text-sm">{doctor.hospital.address}</p></div>}
          {doctor.availability && (
            <div>
              <p className="text-xs text-slate-500">Available</p>
              <p className="text-white text-sm">{doctor.availability.days?.join(', ')}</p>
              <p className="text-slate-400 text-xs">{doctor.availability.startTime} – {doctor.availability.endTime}</p>
            </div>
          )}
          {doctor.languages?.length > 0 && (
            <div>
              <p className="text-xs text-slate-500 mb-1">Languages</p>
              <div className="flex flex-wrap gap-1">{doctor.languages.map(l => <span key={l} className="badge-primary">{l}</span>)}</div>
            </div>
          )}
        </div>

        <div className="card">
          <h3 className="font-semibold text-white mb-4">Consultation Fee</h3>
          <p className="text-4xl font-bold gradient-text">₹{doctor.consultationFee}</p>
          <p className="text-slate-400 text-sm mt-1">Per consultation</p>
          <button id="book-doctor" onClick={() => setShowBooking(true)} className="btn-primary w-full mt-6 flex items-center justify-center gap-2">
            <Calendar className="w-4 h-4" /> Book Appointment
          </button>
          {doctor.phone && (
            <a href={`tel:${doctor.phone}`} className="btn-secondary w-full mt-2 flex items-center justify-center gap-2 text-sm">
              <Phone className="w-4 h-4" /> Call Clinic
            </a>
          )}
        </div>
      </div>

      {doctor.bio && (
        <div className="card">
          <h3 className="font-semibold text-white mb-3">About Dr. {doctor.name}</h3>
          <p className="text-slate-300 text-sm leading-relaxed">{doctor.bio}</p>
        </div>
      )}

      {doctor.reviews?.length > 0 && (
        <div className="card">
          <h3 className="font-semibold text-white mb-4">Patient Reviews</h3>
          <div className="space-y-4">
            {doctor.reviews.slice(0, 5).map((review, i) => (
              <div key={i} className="pb-4 border-b border-white/5 last:border-0">
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex">
                    {[1,2,3,4,5].map(s => <Star key={s} className={`w-3.5 h-3.5 ${s <= review.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-600'}`} />)}
                  </div>
                  <span className="text-xs text-slate-500">{new Date(review.date).toLocaleDateString()}</span>
                </div>
                {review.comment && <p className="text-sm text-slate-300">{review.comment}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {showBooking && <BookingModal doctor={doctor} onClose={() => setShowBooking(false)} />}
    </div>
  )
}
