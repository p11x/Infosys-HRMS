import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { onAuthStateChanged } from 'firebase/auth'
import { ref, get } from 'firebase/database'
import { auth, db } from '../firebase/config'

export default function SplashPage() {
  const navigate = useNavigate()

  useEffect(() => {
    const timer = setTimeout(() => {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        unsubscribe()
        if (user) {
          try {
            const snap = await get(ref(db, `Users/${user.uid}/role`))
            const role = snap.exists() ? snap.val() : 'employee'
            if (role === 'admin') navigate('/admin/dashboard', { replace: true })
            else navigate('/employee/dashboard', { replace: true })
          } catch { navigate('/login', { replace: true }) }
        } else { navigate('/login', { replace: true }) }
      })
    }, 2000)
    return () => clearTimeout(timer)
  }, [navigate])

  return (
    <div style={{ display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      height: '100vh', backgroundColor: 'white',
      fontFamily: 'Inter, sans-serif' }}>
      <div style={{ marginBottom: '12px' }}>
        <span style={{ fontFamily: 'Georgia,serif',
          fontSize: '52px', color: '#007CC2' }}>Infosys</span>
        <span style={{ fontFamily: 'Georgia,serif', fontSize: '18px',
          color: '#007CC2', verticalAlign: 'super' }}>®</span>
      </div>
      <p style={{ fontSize: '18px', fontWeight: '800', letterSpacing: '3px',
        color: '#1A2B4A', margin: '0 0 32px' }}>INFOSYS HRMS</p>
      <div style={{ display: 'flex', gap: '6px' }}>
        {[0,150,300].map(delay => (
          <div key={delay} style={{
            width: '8px', height: '8px', borderRadius: '50%',
            backgroundColor: '#007CC2',
            animation: 'bounce 0.8s ease-in-out infinite',
            animationDelay: `${delay}ms`,
          }} />
        ))}
      </div>
    </div>
  )
}