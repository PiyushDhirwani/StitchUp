import { Routes, Route, Navigate } from 'react-router-dom'
import Register from '@/pages/Register'
import Login from '@/pages/Login'
import VerifyOtp from '@/pages/VerifyOtp'
import Dashboard from '@/pages/Dashboard'
import TailorDashboard from '@/pages/TailorDashboard'
import AdminKyc from '@/pages/AdminKyc'
import NewOrder from '@/pages/NewOrder'
import SupportGrievance from '@/pages/SupportGrievance'
import SupportFeedback from '@/pages/SupportFeedback'
import OrderDetail from '@/pages/OrderDetail'
import ExpressOrder from '@/pages/ExpressOrder'
import { useInactivityLogout } from '@/hooks/useInactivityLogout'

/** Routes users to the dashboard matching their role */
function DashboardRouter() {
  const role = JSON.parse(localStorage.getItem('user') || '{}').role
  if (role === 'tailor') return <TailorDashboard />
  if (role === 'admin') return <AdminKyc />
  return <Dashboard />
}

function App() {
  useInactivityLogout()

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/register" replace />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/verify-otp" element={<VerifyOtp />} />
      <Route path="/dashboard" element={<DashboardRouter />} />
      <Route path="/admin/kyc" element={<AdminKyc />} />
      <Route path="/new-order" element={<NewOrder />} />
      <Route path="/orders/:orderId" element={<OrderDetail />} />
      <Route path="/express-order" element={<ExpressOrder />} />
      <Route path="/support/grievance" element={<SupportGrievance />} />
      <Route path="/support/feedback" element={<SupportFeedback />} />
    </Routes>
  )
}

export default App
