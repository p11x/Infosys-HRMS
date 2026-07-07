import { Routes, Route, Navigate } from 'react-router-dom'
import SplashPage from './pages/SplashPage'
import LoginPage from './pages/LoginPage'
import SetupPage from './pages/SetupPage'
import DashboardPage from './pages/employee/DashboardPage'
import PersonalDetailsPage from './pages/employee/PersonalDetailsPage'
import EducationPage from './pages/employee/EducationPage'
import DocumentsPage from './pages/employee/DocumentsPage'
import BankDetailsPage from './pages/employee/BankDetailsPage'
import OfferLetterPage from './pages/employee/OfferLetterPage'
import PayslipPage from './pages/employee/PayslipPage'
import ApplyLeavePage from './pages/employee/ApplyLeavePage'
import MyLeaveStatusPage from './pages/employee/MyLeaveStatusPage'
import AttendancePage from './pages/employee/AttendancePage'
import AdminDashboardPage from './pages/admin/AdminDashboardPage'
import AdminEmployeeDetailPage from './pages/admin/AdminEmployeeDetailPage'
import CreateEmployeePage from './pages/admin/CreateEmployeePage'
import ViewEmployeesPage from './pages/admin/ViewEmployeesPage'
import ViewAttendancePage from './pages/admin/ViewAttendancePage'
import ViewLeaveRequestsPage from './pages/admin/ViewLeaveRequestsPage'
import NotFoundPage from './pages/NotFoundPage'
import { useAuthContext } from './context/AuthContext'
import DBBanner from './components/DBBanner'

const AuthGuard = ({ children }: { children: React.ReactElement }) => {
  const { currentUser, loading } = useAuthContext()
  const role = sessionStorage.getItem('hrms_role')
  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center',
      justifyContent: 'center', height: '100vh',
      backgroundColor: '#F0F4F8' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: '40px', height: '40px', borderRadius: '50%',
          border: '3px solid #007CC2', borderTopColor: 'transparent',
          animation: 'spin 0.8s linear infinite', margin: '0 auto 12px',
        }} />
        <p style={{ color: '#94A3B8', fontSize: '13px' }}>Loading...</p>
      </div>
    </div>
  )
  if (!currentUser || !role) return <Navigate to="/login" replace />
  return children
}

const AdminGuard = ({ children }: { children: React.ReactElement }) => {
  const role = sessionStorage.getItem('hrms_role')
  if (role !== 'admin') return <Navigate to="/employee/dashboard" replace />
  return children
}

export default function App() {
  return (
    <>
      <DBBanner />
      <Routes>
        <Route path="/" element={<Navigate to="/splash" replace />} />
      <Route path="/splash" element={<SplashPage />} />
      <Route path="/login" element={<LoginPage />} />

      <Route path="/employee/dashboard" element={
        <AuthGuard><DashboardPage /></AuthGuard>
      } />
      <Route path="/employee/personal-details" element={
        <AuthGuard><PersonalDetailsPage /></AuthGuard>
      } />
      <Route path="/employee/education" element={
        <AuthGuard><EducationPage /></AuthGuard>
      } />
      <Route path="/employee/documents" element={
        <AuthGuard><DocumentsPage /></AuthGuard>
      } />
      <Route path="/employee/bank-details" element={
        <AuthGuard><BankDetailsPage /></AuthGuard>
      } />
      <Route path="/employee/offer-letter" element={
        <AuthGuard><OfferLetterPage /></AuthGuard>
      } />
      <Route path="/employee/payslip" element={
        <AuthGuard><PayslipPage /></AuthGuard>
      } />
      <Route path="/employee/apply-leave" element={
        <AuthGuard><ApplyLeavePage /></AuthGuard>
      } />
      <Route path="/employee/leave-status" element={
        <AuthGuard><MyLeaveStatusPage /></AuthGuard>
      } />
      <Route path="/employee/attendance" element={
        <AuthGuard><AttendancePage /></AuthGuard>
      } />

      <Route path="/admin/dashboard" element={
        <AuthGuard><AdminGuard><AdminDashboardPage /></AdminGuard></AuthGuard>
      } />
      <Route path="/admin/create-employee" element={
        <AuthGuard><AdminGuard><CreateEmployeePage /></AdminGuard></AuthGuard>
      } />
      <Route path="/admin/employees" element={
        <AuthGuard><AdminGuard><ViewEmployeesPage /></AdminGuard></AuthGuard>
      } />
      <Route path="/admin/employees/:uid" element={
        <AuthGuard><AdminGuard><AdminEmployeeDetailPage /></AdminGuard></AuthGuard>
      } />
      <Route path="/admin/attendance" element={
        <AuthGuard><AdminGuard><ViewAttendancePage /></AdminGuard></AuthGuard>
      } />
      <Route path="/admin/leave-requests" element={
        <AuthGuard><AdminGuard><ViewLeaveRequestsPage /></AdminGuard></AuthGuard>
      } />

      <Route path="/setup" element={<SetupPage />} />

      <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  )
}