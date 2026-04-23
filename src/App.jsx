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
import Logout from './components/Logout'
import { ProtectedRoute } from './components/ProtectedRoute'
import { useAuth } from './context/AuthContext'
import EditProfile from './screen/EditProfile'

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
      <Route path="/dashboard" element={<ProtectedRoute>
        <Dashboard/>
      </ProtectedRoute>} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
      <Route path="/applications" element={<ProtectedRoute><Applications /></ProtectedRoute>} />
      <Route path="/hitamo-ai" element={<ProtectedRoute><HitamoAIPage /></ProtectedRoute>} />
      <Route path='/hire' element={<ProtectedRoute><Hire1 /></ProtectedRoute>} />
      <Route path='/home' element={<ProtectedRoute><DashboardCandidate /></ProtectedRoute>} />
      <Route path='/profile' element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path='/profile/edit' element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
      <Route path='/applications' element={<ProtectedRoute><Applications/></ProtectedRoute>}/>
      <Route path='/logout' element={<ProtectedRoute><Logout /></ProtectedRoute>}/>
    </Routes>
  )
}

export default App
