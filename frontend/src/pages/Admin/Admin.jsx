import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Users, Stethoscope, MessageSquare, Pill, BarChart3, TrendingUp, UserCheck, UserX, Shield } from 'lucide-react'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const COLORS = ['#14b8a6', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444']

function StatCard({ icon: Icon, label, value, color, change }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="stat-card">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div className="mt-4">
        <p className="text-3xl font-bold text-white">{value?.toLocaleString() ?? '—'}</p>
        <p className="text-sm text-slate-400 mt-1">{label}</p>
      </div>
    </motion.div>
  )
}

export default function Admin() {
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [chatAnalytics, setChatAnalytics] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(true)
  const [userPage, setUserPage] = useState(1)
  const [userSearch, setUserSearch] = useState('')

  useEffect(() => {
    Promise.all([
      api.get('/admin/stats'),
      api.get('/admin/chat-analytics'),
    ]).then(([statsRes, chatRes]) => {
      setStats(statsRes.data.data)
      setChatAnalytics(chatRes.data.data)
    }).catch(() => toast.error('Failed to load admin data'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (activeTab === 'users') {
      api.get('/admin/users', { params: { page: userPage, search: userSearch } })
        .then(r => setUsers(r.data.data)).catch(() => {})
    }
  }, [activeTab, userPage, userSearch])

  const toggleUser = async (id) => {
    try {
      const res = await api.put(`/admin/users/${id}/toggle`)
      setUsers(prev => prev.map(u => u._id === id ? { ...u, isActive: res.data.data.isActive } : u))
      toast.success('User status updated')
    } catch { toast.error('Failed') }
  }

  const apptStatusData = stats?.appointmentsByStatus?.map(s => ({ name: s._id, value: s.count })) || []
  const langData = chatAnalytics?.languageStats?.map(l => ({ name: l._id?.toUpperCase() || 'EN', sessions: l.count })) || []

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary-900/50 border border-primary-700/30 flex items-center justify-center">
          <Shield className="w-5 h-5 text-primary-400" />
        </div>
        <div>
          <h1 className="page-title">Admin Panel</h1>
          <p className="text-slate-400 text-sm">Platform management & analytics</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl bg-white/5 w-fit">
        {['overview', 'users', 'analytics'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-xl text-sm font-medium transition-all capitalize ${activeTab === tab ? 'bg-primary-700 text-white' : 'text-slate-400 hover:text-white'}`}>
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Stats grid */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <StatCard icon={Users}          label="Total Patients"     value={stats?.totalUsers}        color="bg-primary-600" />
            <StatCard icon={Stethoscope}    label="Doctors"            value={stats?.totalDoctors}      color="bg-blue-600"    />
            <StatCard icon={MessageSquare}  label="Chat Sessions"      value={stats?.totalChats}        color="bg-purple-600"  />
            <StatCard icon={Pill}           label="Medicine Schedules" value={stats?.totalMedicines}    color="bg-emerald-600" />
            <StatCard icon={BarChart3}      label="Appointments"       value={stats?.totalAppointments} color="bg-amber-600"   />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Appointment status pie */}
            {apptStatusData.length > 0 && (
              <div className="card">
                <h3 className="font-semibold text-white mb-4">Appointment Status Distribution</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={apptStatusData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={11}>
                      {apptStatusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', fontSize: '12px', color: '#f1f5f9' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Recent users */}
            <div className="card">
              <h3 className="font-semibold text-white mb-4">Recent Registrations</h3>
              <div className="space-y-3">
                {stats?.recentUsers?.map(u => (
                  <div key={u._id} className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                      {u.name?.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{u.name}</p>
                      <p className="text-xs text-slate-400 truncate">{u.email}</p>
                    </div>
                    <p className="text-xs text-slate-500 flex-shrink-0">{new Date(u.createdAt).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="space-y-4">
          <input className="input max-w-sm" placeholder="Search users..." value={userSearch} onChange={e => setUserSearch(e.target.value)} />
          <div className="card overflow-hidden p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  {['User', 'Email', 'Role', 'Joined', 'Status', 'Action'].map(h => (
                    <th key={h} className="text-left text-xs text-slate-400 font-medium px-5 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => (
                  <motion.tr key={u._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                    className="border-b border-white/5 last:border-0 hover:bg-white/3 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center text-xs font-bold text-white flex-shrink-0">{u.name?.charAt(0)}</div>
                        <span className="text-white font-medium truncate max-w-28">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-slate-400 truncate max-w-40">{u.email}</td>
                    <td className="px-5 py-3"><span className="badge-primary capitalize">{u.role}</span></td>
                    <td className="px-5 py-3 text-slate-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td className="px-5 py-3">
                      <span className={`badge ${u.isActive ? 'badge-success' : 'badge-danger'}`}>{u.isActive ? 'Active' : 'Inactive'}</span>
                    </td>
                    <td className="px-5 py-3">
                      <button onClick={() => toggleUser(u._id)} className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${u.isActive ? 'bg-red-900/30 text-red-400 hover:bg-red-900/50' : 'bg-emerald-900/30 text-emerald-400 hover:bg-emerald-900/50'}`}>
                        {u.isActive ? <><UserX className="w-3 h-3 inline mr-1" />Deactivate</> : <><UserCheck className="w-3 h-3 inline mr-1" />Activate</>}
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'analytics' && chatAnalytics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="font-semibold text-white mb-2">Chat Sessions by Language</h3>
            <p className="text-3xl font-bold gradient-text">{chatAnalytics.totalSessions?.toLocaleString()}</p>
            <p className="text-slate-400 text-sm mb-4">Total sessions · Avg {chatAnalytics.avgMessagesPerSession?.toFixed(1)} msg/session</p>
            {langData.length > 0 && (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={langData}>
                  <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', fontSize: '12px', color: '#f1f5f9' }} />
                  <Bar dataKey="sessions" fill="#14b8a6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="card">
            <h3 className="font-semibold text-white mb-4">Platform Health</h3>
            <div className="space-y-4">
              {[
                { label: 'API Response Time', value: '< 200ms', status: 'excellent' },
                { label: 'Uptime',            value: '99.9%',   status: 'excellent' },
                { label: 'Active Reminders',  value: `${stats?.totalMedicines || 0} schedules`, status: 'good' },
                { label: 'AI Model',          value: 'Gemini 1.5 Flash', status: 'good' },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">{item.label}</span>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${item.status === 'excellent' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                    <span className="text-sm text-white font-medium">{item.value}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
