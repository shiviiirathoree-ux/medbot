import { NavLink } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext'
import { useAuth } from '../../context/AuthContext'
import { motion } from 'framer-motion'
import {
  LayoutDashboard, MessageCircleHeart, Stethoscope, Pill,
  BookOpen, Siren, Brain, FileSearch, User, ShieldCheck,
  Heart, LogOut
} from 'lucide-react'

const navItems = [
  { path: '/dashboard', icon: LayoutDashboard,   key: 'dashboard' },
  { path: '/chat',      icon: MessageCircleHeart, key: 'chat' },
  { path: '/doctors',   icon: Stethoscope,        key: 'doctors' },
  { path: '/medicines', icon: Pill,               key: 'medicines' },
  { path: '/diseases',  icon: BookOpen,           key: 'diseases' },
  { path: '/emergency', icon: Siren,              key: 'emergency' },
  { path: '/mood',      icon: Brain,              key: 'mood' },
  { path: '/reports',   icon: FileSearch,         key: 'reports' },
  { path: '/profile',   icon: User,               key: 'profile' },
]

export default function Sidebar() {
  const { t } = useLanguage()
  const { user, logout } = useAuth()

  return (
    <div className="h-full glass border-r border-white/5 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center">
            <Heart className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-display font-bold text-white text-lg leading-none">MedBot</h1>
            <p className="text-xs text-primary-400 mt-0.5">AI Healthcare</p>
          </div>
        </div>
      </div>

      {/* User info */}
      <div className="p-4 mx-3 mt-3 rounded-xl bg-white/5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full gradient-bg flex items-center justify-center text-white font-bold text-sm">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
            <p className="text-xs text-slate-400 truncate capitalize">{user?.role}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ path, icon: Icon, key }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `sidebar-item ${isActive ? 'active' : ''}`
            }
          >
            {({ isActive }) => (
              <>
                <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-primary-400' : ''}`} />
                <span>{t(`nav.${key}`)}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-400"
                  />
                )}
              </>
            )}
          </NavLink>
        ))}

        {user?.role === 'admin' && (
          <NavLink
            to="/admin"
            className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
          >
            <ShieldCheck className="w-4 h-4 flex-shrink-0" />
            <span>{t('nav.admin')}</span>
          </NavLink>
        )}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-white/5">
        <button
          onClick={logout}
          className="sidebar-item w-full text-red-400 hover:bg-red-900/20 hover:text-red-300"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          <span>{t('nav.logout')}</span>
        </button>
      </div>
    </div>
  )
}
