import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchDoctors, fetchSpecializations } from '../../store/slices/doctorSlice'
import { useLanguage } from '../../context/LanguageContext'
import { motion } from 'framer-motion'
import { Search, Filter, Star, MapPin, Clock, Video, Award, ChevronLeft, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import BookingModal from '../../components/doctor/BookingModal'

function DoctorCard({ doctor, index }) {
  const [showModal, setShowModal] = useState(false)
  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        className="card hover:border-primary-700/30 group cursor-pointer"
      >
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="w-16 h-16 rounded-2xl gradient-bg flex items-center justify-center text-2xl font-bold text-white flex-shrink-0">
            {doctor.name?.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold text-white text-base">Dr. {doctor.name}</h3>
                <p className="text-primary-400 text-sm font-medium">{doctor.specialization}</p>
              </div>
              {doctor.onlineConsultation && (
                <span className="badge-success flex items-center gap-1 flex-shrink-0">
                  <Video className="w-3 h-3" /> Online
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-400">
              <span className="flex items-center gap-1"><Award className="w-3 h-3" /> {doctor.experience}+ yrs</span>
              {doctor.hospital?.city && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {doctor.hospital.city}</span>}
              <span className="flex items-center gap-1 text-amber-400"><Star className="w-3 h-3 fill-amber-400" /> {doctor.rating?.toFixed(1) || '—'} ({doctor.totalReviews})</span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              {doctor.languages?.slice(0, 2).map(l => <span key={l} className="badge-primary">{l}</span>)}
            </div>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500">Consultation Fee</p>
            <p className="text-white font-bold text-lg">₹{doctor.consultationFee || '—'}</p>
          </div>
          <div className="flex gap-2">
            <Link to={`/doctors/${doctor._id}`} className="btn-secondary text-xs px-3 py-2">Profile</Link>
            <button onClick={() => setShowModal(true)} className="btn-primary text-xs px-4 py-2">Book Now</button>
          </div>
        </div>
      </motion.div>
      {showModal && <BookingModal doctor={doctor} onClose={() => setShowModal(false)} />}
    </>
  )
}

export default function Doctors() {
  const dispatch = useDispatch()
  const { t } = useLanguage()
  const { list: doctors, specializations, total, pages, loading } = useSelector(s => s.doctors)
  const [filters, setFilters] = useState({ search: '', specialization: '', city: '', minRating: '', onlineOnly: false, page: 1 })
  const [showFilter, setShowFilter] = useState(false)

  useEffect(() => { dispatch(fetchSpecializations()) }, [dispatch])
  useEffect(() => {
    const params = { ...filters, onlineOnly: filters.onlineOnly || undefined }
    dispatch(fetchDoctors(params))
  }, [dispatch, filters])

  const setFilter = (key, val) => setFilters(p => ({ ...p, [key]: val, page: 1 }))

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">{t('doctors.title')}</h1>
          <p className="text-slate-400 text-sm mt-1">{total} doctors available</p>
        </div>
      </div>

      {/* Search + Filter */}
      <div className="card">
        <div className="flex gap-3 flex-wrap">
          <div className="flex-1 relative min-w-60">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input id="doctor-search" type="text" placeholder={t('doctors.search')} className="input pl-10"
              value={filters.search} onChange={e => setFilter('search', e.target.value)} />
          </div>
          <select className="input w-auto min-w-44" value={filters.specialization} onChange={e => setFilter('specialization', e.target.value)}>
            <option value="">All Specializations</option>
            {specializations.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <input type="text" placeholder="City..." className="input w-36" value={filters.city} onChange={e => setFilter('city', e.target.value)} />
          <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
            <input type="checkbox" checked={filters.onlineOnly} onChange={e => setFilter('onlineOnly', e.target.checked)} className="w-4 h-4 accent-primary-500 rounded" />
            Online Only
          </label>
          <select className="input w-auto" value={filters.minRating} onChange={e => setFilter('minRating', e.target.value)}>
            <option value="">Any Rating</option>
            {['4', '3', '2'].map(r => <option key={r} value={r}>{r}+ Stars</option>)}
          </select>
        </div>
      </div>

      {/* Doctor Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="flex gap-4"><div className="w-16 h-16 bg-white/5 rounded-2xl" /><div className="flex-1 space-y-2"><div className="h-4 bg-white/5 rounded" /><div className="h-3 bg-white/5 rounded w-2/3" /></div></div>
            </div>
          ))}
        </div>
      ) : doctors.length === 0 ? (
        <div className="card text-center py-16">
          <p className="text-4xl mb-3">🔍</p>
          <p className="text-white font-semibold">{t('doctors.noResults')}</p>
          <p className="text-slate-400 text-sm mt-1">Try adjusting your search filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {doctors.map((doc, i) => <DoctorCard key={doc._id} doctor={doc} index={i} />)}
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button disabled={filters.page === 1} onClick={() => setFilters(p => ({ ...p, page: p.page - 1 }))}
            className="btn-secondary px-3 py-2 disabled:opacity-40"><ChevronLeft className="w-4 h-4" /></button>
          <span className="text-sm text-slate-400">Page {filters.page} of {pages}</span>
          <button disabled={filters.page === pages} onClick={() => setFilters(p => ({ ...p, page: p.page + 1 }))}
            className="btn-secondary px-3 py-2 disabled:opacity-40"><ChevronRight className="w-4 h-4" /></button>
        </div>
      )}
    </div>
  )
}
