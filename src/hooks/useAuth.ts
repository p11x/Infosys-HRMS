import { useAuthContext } from '../context/AuthContext'
import { signOut } from 'firebase/auth'
import { auth } from '../firebase/config'
import { useNavigate } from 'react-router-dom'

export const useAuth = () => {
  const { currentUser, userRole, loading } = useAuthContext()
  const navigate = useNavigate()

  const uid = currentUser?.uid ?? 'dev-uid'

  const logout = async () => {
    if (currentUser) {
      await signOut(auth)
    }
    navigate('/login')
  }

  return { currentUser, userRole, loading, logout, uid }
}