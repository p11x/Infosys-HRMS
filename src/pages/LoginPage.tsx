import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { ref, get, set } from 'firebase/database'
import { auth, db, DB_READY } from '../firebase/config'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) { toast.error('Enter email and password'); return }
    setLoading(true)
    try {
      const result = await signInWithEmailAndPassword(auth, email.trim(), password)
      const uid = result.user.uid
      const userEmail = email.trim().toLowerCase()
      let role: 'admin' | 'employee' = 'employee'
      let userName = userEmail.split('@')[0]

      // Layer 1: Try database role lookup (primary source of truth)
      if (DB_READY) {
        try {
          const roleSnap = await get(ref(db, `Users/${uid}/role`))
          const nameSnap = await get(ref(db, `Users/${uid}/name`))

          if (roleSnap.exists()) {
            role = roleSnap.val() as 'admin' | 'employee'
            console.log('Role from DB:', role)
          } else {
            // Layer 2: User exists in Auth but not in Users node
            // Write them to DB with correct role
            role = userEmail === 'infosys@hrms.com' ? 'admin' : 'employee'
            await set(ref(db, `Users/${uid}`), {
              id: uid,
              name: userName,
              email: userEmail,
              role: role,
            })
            if (role === 'employee') {
              await set(ref(db, `Employees/${uid}`), {
                uid, name: userName, email: userEmail,
              })
              await set(ref(db, `LeaveBalance/${uid}`), {
                total: 18, used: 0, remaining: 18,
              })
            }
            toast('Account initialized', { icon: 'ℹ️' })
          }

          if (nameSnap.exists()) userName = nameSnap.val()

        } catch (dbError) {
          // Layer 3: DB read failed — use email fallback
          console.warn('DB read failed, using email fallback:', dbError)
          role = userEmail === 'infosys@hrms.com' ? 'admin' : 'employee'
        }
      } else {
        // Layer 4: No DB configured — email fallback only
        role = userEmail === 'infosys@hrms.com' ? 'admin' : 'employee'
      }

      // Store session
      sessionStorage.setItem('hrms_role', role)
      sessionStorage.setItem('hrms_uid', uid)
      sessionStorage.setItem('hrms_email', email.trim())
      sessionStorage.setItem('hrms_name', userName)

      toast.success(`Welcome${userName ? ', ' + userName : ''}!`)
      if (role === 'admin') navigate('/admin/dashboard', { replace: true })
      else navigate('/employee/dashboard', { replace: true })

    } catch (error: any) {
      const messages: Record<string, string> = {
        'auth/user-not-found': 'No account found with this email',
        'auth/wrong-password': 'Incorrect password',
        'auth/invalid-email': 'Invalid email format',
        'auth/invalid-credential': 'Invalid email or password',
        'auth/too-many-requests': 'Too many attempts. Try later',
        'auth/network-request-failed': 'Network error. Check connection',
        'auth/user-disabled': 'This account has been disabled',
      }
      toast.error(messages[error.code] || error.message)
    } finally { setLoading(false) }
  }

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh', backgroundColor: '#F8FAFC',
      fontFamily: 'Inter, sans-serif', padding: '20px',
    }}>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <span style={{ fontFamily: 'Georgia,serif', fontSize: '42px', color: '#007CC2' }}>Infosys</span>
        <span style={{ fontFamily: 'Georgia,serif', fontSize: '14px', color: '#007CC2', verticalAlign: 'super' }}>®</span>
        <p style={{ fontSize: '18px', fontWeight: '800', color: '#1A2B4A', letterSpacing: '2px', margin: '8px 0 4px' }}>INFOSYS HRMS</p>
        <p style={{ fontSize: '13px', color: '#94A3B8', margin: 0 }}>Employee Onboarding Portal</p>
      </div>

      <div style={{ width: '100%', maxWidth: '400px', backgroundColor: 'white', borderRadius: '20px', padding: '32px', border: '1px solid #E8EDF2', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#0F1C2E', margin: '0 0 24px' }}>Sign in to your account</h2>

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '12px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '6px' }}>Email Address</label>
            <input type="email" placeholder="Enter your email" value={email} onChange={e => setEmail(e.target.value)}
              style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1.5px solid #E2E8F0', fontSize: '14px', outline: 'none', boxSizing: 'border-box', backgroundColor: '#F8FAFC', color: '#1A2B4A' }}
              onFocus={e => e.target.style.borderColor = '#007CC2'} onBlur={e => e.target.style.borderColor = '#E2E8F0'} />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ fontSize: '12px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '6px' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <input type={showPassword ? 'text' : 'password'} placeholder="Enter your password" value={password} onChange={e => setPassword(e.target.value)}
                style={{ width: '100%', padding: '12px 40px 12px 14px', borderRadius: '10px', border: '1.5px solid #E2E8F0', fontSize: '14px', outline: 'none', boxSizing: 'border-box', backgroundColor: '#F8FAFC', color: '#1A2B4A' }}
                onFocus={e => e.target.style.borderColor = '#007CC2'} onBlur={e => e.target.style.borderColor = '#E2E8F0'} />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}>
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} style={{
            width: '100%', padding: '14px', borderRadius: '12px', border: 'none',
            backgroundColor: loading ? '#93C5FD' : '#007CC2', color: 'white', fontSize: '15px', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer', letterSpacing: '0.5px', transition: 'background-color 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          }}>
            {loading ? (<><svg style={{ animation: 'spin 1s linear infinite', width: '16px', height: '16px' }} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" strokeDasharray="60" strokeDashoffset="20" /></svg>Signing in...</>) : 'Sign In'}
          </button>
        </form>
      </div>

      <p style={{ fontSize: '12px', color: '#CBD5E1', marginTop: '24px' }}>Infosys HRMS · Employee Onboarding Portal</p>
    </div>
  )
}