import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { User } from 'firebase/auth'
import { onAuthStateChanged } from 'firebase/auth'
import { auth, db, DB_READY } from '../firebase/config'
import { get, ref } from 'firebase/database'

interface AuthContextType {
  currentUser: User | null
  userRole: 'admin' | 'employee' | null
  loading: boolean
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  userRole: null,
  loading: true,
})

export const useAuthContext = () => useContext(AuthContext)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [userRole, setUserRole] = useState<'admin' | 'employee' | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user)
      if (user) {
        if (DB_READY) {
          try {
            const roleSnap = await get(ref(db, `Users/${user.uid}/role`))
            const nameSnap = await get(ref(db, `Users/${user.uid}/name`))
            const role = roleSnap.exists()
              ? roleSnap.val() as 'admin' | 'employee'
              : user.email?.toLowerCase() === 'infosys@hrms.com'
                ? 'admin' : 'employee'
            const name = nameSnap.exists()
              ? nameSnap.val()
              : user.email?.split('@')[0] || 'User'
            setUserRole(role)
            sessionStorage.setItem('hrms_role', role)
            sessionStorage.setItem('hrms_uid', user.uid)
            sessionStorage.setItem('hrms_email', user.email || '')
            sessionStorage.setItem('hrms_name', name)
          } catch {
            const cached = sessionStorage.getItem('hrms_role')
            const emailRole = user.email?.toLowerCase() === 'infosys@hrms.com'
              ? 'admin' : 'employee'
            const role = (cached as 'admin' | 'employee') || emailRole
            setUserRole(role)
            sessionStorage.setItem('hrms_role', role)
          }
        } else {
          const cached = sessionStorage.getItem('hrms_role')
          const emailRole = user.email?.toLowerCase() === 'infosys@hrms.com'
            ? 'admin' : 'employee'
          const role = (cached as 'admin' | 'employee') || emailRole
          setUserRole(role)
        }
      } else {
        setUserRole(null)
        sessionStorage.clear()
      }
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  return (
    <AuthContext.Provider value={{ currentUser, userRole, loading }}>
      {children}
    </AuthContext.Provider>
  )
}