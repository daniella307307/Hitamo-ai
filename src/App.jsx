import { Routes, Route, Navigate } from 'react-router-dom'
import  LoginPage  from './screen/LoginPage'
import SignupPage  from './screen/SignupPage'
import ForgotPassword from './screen/ForgotPassword'
import Analytics from './screen/Analytics'
import './App.css'
import './index.css'
import Dashboard from './screen/Dashboard'
import HitamoAIPage from './screen/Hitamo'
import Hire1 from './screen/Hire1'
import DashboardCandidate from './screen/DashboardCandidate'
import Profile from './screen/Profile'
import Applications from './screen/Applications'
import ApplicationsCandidate from './screen/ApplicationsCandidate'
import AdminPage from './screen/AdminPage'
import SubscriptionsPage from './screen/SubscriptionsPage'
import Logout from './components/Logout'
import { ProtectedRoute } from './components/ProtectedRoute'
import { useAuth } from './context/AuthContext'
import EditProfile from './screen/EditProfile'
import JobsPage from './screen/JobsPage'
import ApplyPage from './screen/ApplyPage'

function ApplicationsRoute() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (user.role === 'ADMIN') return <Navigate to="/admin" replace />
  return user.role === 'CANDIDATE' ? <ApplicationsCandidate /> : <Applications />
}

function DashboardRoute() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  return user.role === 'CANDIDATE' ? <Navigate to="/home" replace /> : <Dashboard />
}

function HomeRoute() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  return user.role === 'CANDIDATE' ? <DashboardCandidate /> : <Navigate to="/dashboard" replace />
}

function HireRoute() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  return user.role === 'CANDIDATE' ? <Navigate to="/home" replace /> : <Hire1 />
}

function ApplyRoute() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  return user.role === 'CANDIDATE' ? <ApplyPage /> : <Navigate to="/dashboard" replace />
}

function SubscriptionsRoute() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  return user.role === 'ORG_OWNER' || user.role === 'RECRUITER'
    ? <SubscriptionsPage />
    : <Navigate to={user.role === 'ADMIN' ? '/admin' : '/home'} replace />
}

function App() {
  const { user } = useAuth()
  const homeRoute = user?.role === 'CANDIDATE' ? '/home' : '/dashboard'

  return (
    <Routes>
      
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      
      {/* Redirect root to login */}
      <Route path="/" element={<Navigate to={user ? homeRoute : "/login"} replace />} />
      
      {/* Dashboard and other protected routes will go here */}
      <Route path="/dashboard" element={<ProtectedRoute><DashboardRoute/></ProtectedRoute>} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
      <Route path="/applications" element={<ProtectedRoute><ApplicationsRoute /></ProtectedRoute>} />
      <Route path="/admin" element={<ProtectedRoute requiredRole="ADMIN"><AdminPage /></ProtectedRoute>} />
      <Route path="/subscriptions" element={<ProtectedRoute><SubscriptionsRoute /></ProtectedRoute>} />
      <Route path="/hitamo-ai" element={<ProtectedRoute><HitamoAIPage /></ProtectedRoute>} />
      <Route path='/hire' element={<ProtectedRoute><HireRoute /></ProtectedRoute>} />
      <Route path='/home' element={<ProtectedRoute><HomeRoute /></ProtectedRoute>} />
      <Route path='/profile' element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path='/profile/edit' element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
      <Route path='/logout' element={<ProtectedRoute><Logout /></ProtectedRoute>}/>
      <Route path="/jobs" element={<ProtectedRoute><JobsPage/></ProtectedRoute>}/>
      <Route path="/jobs/:jobId/apply" element={<ProtectedRoute><ApplyRoute/></ProtectedRoute>} />
    </Routes>
  )
}

export default App
