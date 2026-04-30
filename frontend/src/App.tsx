import { Routes, Route, Navigate } from 'react-router-dom'
import Register from '@/pages/Register'
import Login from '@/pages/Login'
import VerifyOtp from '@/pages/VerifyOtp'
import Dashboard from '@/pages/Dashboard'
import NewOrder from '@/pages/NewOrder'
import SupportGrievance from '@/pages/SupportGrievance'
import SupportFeedback from '@/pages/SupportFeedback'
import { useInactivityLogout } from '@/hooks/useInactivityLogout'

function App() {
  useInactivityLogout()

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/register" replace />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/verify-otp" element={<VerifyOtp />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/new-order" element={<NewOrder />} />
      <Route path="/support/grievance" element={<SupportGrievance />} />
      <Route path="/support/feedback" element={<SupportFeedback />} />
    </Routes>
  )
}

export default App
