import { useNavigate } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { auth } from '../firebase/config'
import {
  User,
  Book,
  FileText,
  Landmark,
  File,
  Banknote,
  Calendar,
  Clock,
  Bell,
} from 'lucide-react'

export const Sidebar = () => {
  const navigate = useNavigate()

  const menuItems = [
    { icon: User, label: 'Personal Details', path: '/employee/personal-details' },
    { icon: Book, label: 'Education', path: '/employee/education' },
    { icon: FileText, label: 'Documents', path: '/employee/documents' },
    { icon: Landmark, label: 'Bank Details', path: '/employee/bank-details' },
    { icon: File, label: 'Offer Letter', path: '/employee/offer-letter' },
    { icon: Banknote, label: 'Payslip', path: '/employee/payslip' },
    { icon: Calendar, label: 'Apply Leave', path: '/employee/apply-leave' },
    { icon: Clock, label: 'My Leave Status', path: '/employee/leave-status' },
    { icon: Clock, label: 'Attendance', path: '/employee/attendance' },
    { icon: Bell, label: 'Notifications', path: '/employee/notifications' },
  ]

  const handleLogout = async () => {
    await signOut(auth)
    navigate('/login')
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t md:sticky md:top-0 md:h-screen md:w-64 md:border-r">
      <div className="flex justify-around md:flex-col md:justify-start md:p-4">
        {menuItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className="flex flex-col md:flex-row items-center gap-1 md:gap-3 p-2 md:p-3 rounded-lg text-gray-600 hover:bg-gray-100"
          >
            <item.icon size={20} />
            <span className="text-xs md:text-sm font-medium">{item.label}</span>
          </button>
        ))}
        <button
          onClick={handleLogout}
          className="flex flex-col md:flex-row items-center gap-1 md:gap-3 p-2 md:p-3 rounded-lg text-gray-600 hover:bg-gray-100 md:mt-auto"
        >
          <Clock size={20} />
          <span className="text-xs md:text-sm font-medium">Logout</span>
        </button>
      </div>
    </div>
  )
}