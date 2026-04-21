import { Routes, Route, Navigate } from 'react-router-dom'
import  LoginPage  from './screen/LoginPage'
import SignupPage  from './screen/SignupPage'
import ForgotPassword from './screen/ForgotPassword'
import './App.css'
import './index.css'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      
      {/* Redirect root to login */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      
      {/* Dashboard and other protected routes will go here */}
      <Route path="/dashboard" element={<div>Dashboard - Coming Soon</div>} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
    </Routes>
  )
}

export default App