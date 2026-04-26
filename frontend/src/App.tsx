import { Routes, Route, Navigate } from 'react-router-dom'
import Register from '@/pages/Register'
import Login from '@/pages/Login'
import VerifyOtp from '@/pages/VerifyOtp'
import Dashboard from '@/pages/Dashboard'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/register" replace />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/verify-otp" element={<VerifyOtp />} />
      <Route path="/dashboard" element={<Dashboard />} />
    </Routes>
  )
}

export default App
