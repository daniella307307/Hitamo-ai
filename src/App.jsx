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
function App() {
  return (
    <Routes>
      
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      
      {/* Redirect root to login */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      
      {/* Dashboard and other protected routes will go here */}
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/analytics" element={<Analytics />} />
      <Route path="/hitamo-ai" element={<HitamoAIPage/>} />
      <Route path='/hire' element={<Hire1/>} />
      <Route path='/home' element={<DashboardCandidate/>} />
      <Route path='/profile' element={<Profile/>} />
    </Routes>
  )
}

export default App