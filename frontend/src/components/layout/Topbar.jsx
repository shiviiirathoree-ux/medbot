import { Menu, Bell, Sun, Moon, Globe, Search } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import { useLanguage } from '../../context/LanguageContext'
import { useDispatch, useSelector } from 'react-redux'
import { markAllRead } from '../../store/slices/notificationSlice'
import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

export default function Topbar({ onToggleSidebar, sidebarOpen }) {
  const { isDark, toggle } = useTheme()
  const { language, changeLanguage, LANGUAGES } = useLanguage()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { list: notifications, unreadCount } = useSelector(s => s.notifications)
  const [showLang, setShowLang] = useState(false)
  const [showNotif, setShowNotif] = useState(false)
  const langRef = useRef(null)
  const notifRef = useRef(null)

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (langRef.current && !langRef.current.contains(e.target)) setShowLang(false)
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotif(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <header className="h-16 glass border-b border-white/5 flex items-center gap-4 px-6 flex-shrink-0">
      {/* Hamburger */}
      <button onClick={onToggleSidebar} className="p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors">
        <Menu className="w-5 h-5" />
      </button>

      {/* Search bar */}
      <div className="flex-1 max-w-md relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          type="text"
          placeholder="Search anything..."
          className="input pl-9 py-2 text-sm h-9"
          onFocus={() => navigate('/chat')}
          readOnly
        />
      </div>

      <div className="ml-auto flex items-center gap-2">
        {/* Theme toggle */}
        <button onClick={toggle} className="p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-amber-400 transition-colors">
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Language selector */}
        <div className="relative" ref={langRef}>
          <button onClick={() => setShowLang(p => !p)} className="p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-primary-400 transition-colors flex items-center gap-1">
            <Globe className="w-4 h-4" />
            <span className="text-xs font-medium uppercase">{language}</span>
          </button>
          <AnimatePresence>
            {showLang && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                className="absolute right-0 top-full mt-2 w-44 glass rounded-xl border border-white/10 overflow-hidden z-50 shadow-2xl"
              >
                {LANGUAGES.map(lang => (
                  <button
                    key={lang.code}
                    onClick={() => { changeLanguage(lang.code); setShowLang(false) }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-white/5 transition-colors ${language === lang.code ? 'text-primary-400' : 'text-slate-300'}`}
                  >
                    <span>{lang.flag}</span> <span>{lang.name}</span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button onClick={() => { setShowNotif(p => !p); if (unreadCount > 0) dispatch(markAllRead()) }}
            className="relative p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors">
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center font-bold">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
          <AnimatePresence>
            {showNotif && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                className="absolute right-0 top-full mt-2 w-80 glass rounded-xl border border-white/10 overflow-hidden z-50 shadow-2xl"
              >
                <div className="p-4 border-b border-white/5">
                  <h3 className="font-semibold text-white text-sm">Notifications</h3>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="text-slate-500 text-sm text-center py-8">No notifications</p>
                  ) : notifications.slice(0, 8).map(n => (
                    <div key={n._id} className="px-4 py-3 hover:bg-white/5 border-b border-white/5 last:border-0">
                      <p className="text-sm font-medium text-white">{n.title}</p>
                      <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{n.message}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  )
}
