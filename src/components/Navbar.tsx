import { useNavigate } from 'react-router-dom'
import { LogOut, ArrowLeft } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

interface NavbarProps {
  title: string
  showBack?: boolean
}

export const Navbar = ({ title, showBack }: NavbarProps) => {
  const navigate = useNavigate()
  const { logout } = useAuth()

  return (
    <div className="flex items-center justify-between bg-primary px-4 h-14 text-white">
      <div className="flex items-center gap-2">
        {showBack && (
          <button onClick={() => navigate(-1)} className="text-white hover:opacity-80">
            <ArrowLeft size={22} />
          </button>
        )}
        <h1 className="text-lg font-semibold">{title}</h1>
      </div>
      <button onClick={logout} className="text-white hover:opacity-80">
        <LogOut size={22} />
      </button>
    </div>
  )
}