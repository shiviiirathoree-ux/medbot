import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Layout from './components/layout/Layout'
import Login from './pages/Auth/Login'
import Register from './pages/Auth/Register'
import Dashboard from './pages/Dashboard/Dashboard'
import Chat from './pages/Chat/Chat'
import Doctors from './pages/Doctors/Doctors'
import DoctorProfile from './pages/Doctors/DoctorProfile'
import Medicines from './pages/Medicines/Medicines'
import Diseases from './pages/Diseases/Diseases'
import DiseaseDetail from './pages/Diseases/DiseaseDetail'
import Emergency from './pages/Emergency/Emergency'
import MoodTracker from './pages/MoodTracker/MoodTracker'
import ReportScanner from './pages/ReportScanner/ReportScanner'
import Profile from './pages/Profile/Profile'
import Admin from './pages/Admin/Admin'
import LoadingScreen from './components/ui/LoadingScreen'

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth()
  if (loading) return <LoadingScreen />
  return user ? children : <Navigate to="/login" replace />
}

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth()
  if (loading) return <LoadingScreen />
  return user?.role === 'admin' ? children : <Navigate to="/dashboard" replace />
}

const PublicRoute = ({ children }) => {
  const { user } = useAuth()
  return user ? <Navigate to="/dashboard" replace /> : children
}

export default function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login"    element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

      {/* Protected Routes */}
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard"         element={<Dashboard />} />
        <Route path="chat"              element={<Chat />} />
        <Route path="doctors"           element={<Doctors />} />
        <Route path="doctors/:id"       element={<DoctorProfile />} />
        <Route path="medicines"         element={<Medicines />} />
        <Route path="diseases"          element={<Diseases />} />
        <Route path="diseases/:id"      element={<DiseaseDetail />} />
        <Route path="emergency"         element={<Emergency />} />
        <Route path="mood"              element={<MoodTracker />} />
        <Route path="reports"           element={<ReportScanner />} />
        <Route path="profile"           element={<Profile />} />
        <Route path="admin"             element={<AdminRoute><Admin /></AdminRoute>} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
