import { useState } from 'react'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { ref, set } from 'firebase/database'
import { auth, db } from '../firebase/config'
import toast from 'react-hot-toast'

const SEED = [
  { email: 'infosys@hrms.com', password: '123456',
    name: 'Admin', role: 'admin' },
  { email: 'starrail2589@gmail.com', password: 'sunny@2589',
    name: 'Sunny', role: 'employee' },
]

export default function SetupPage() {
  const [log, setLog] = useState<string[]>([])
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(false)

  const run = async () => {
    setLoading(true)
    const out: string[] = []
    for (const u of SEED) {
      try {
        const r = await createUserWithEmailAndPassword(auth, u.email, u.password)
        const uid = r.user.uid
        await set(ref(db, `Users/${uid}`), { id: uid, name: u.name, email: u.email, role: u.role })
        if (u.role === 'employee') {
          await set(ref(db, `Employees/${uid}`), { uid, name: u.name, email: u.email })
          await set(ref(db, `LeaveBalance/${uid}`), { total: 18, used: 0, remaining: 18 })
        }
        out.push(`✓ ${u.email} created (${uid})`)
        toast.success(`${u.email} created`)
      } catch (e: any) {
        out.push(e.code === 'auth/email-already-in-use'
          ? `⚠ ${u.email} already exists`
          : `✗ ${u.email}: ${e.message}`)
        toast.error(e.message)
      }
    }
    setLog(out)
    setDone(true)
    setLoading(false)
  }

  return (
    <div style={{ padding: '40px', fontFamily: 'Inter, sans-serif' }}>
      <h2>One-time Setup — DELETE AFTER USE</h2>
      <p style={{ color: '#94A3B8' }}>Creates admin and employee accounts in Firebase</p>
      <button onClick={run} disabled={loading || done} style={{
        padding: '12px 24px', backgroundColor: '#007CC2', color: 'white',
        border: 'none', borderRadius: '10px', fontWeight: '700',
        cursor: 'pointer', fontSize: '14px',
      }}>
        {loading ? 'Creating...' : done ? 'Done' : 'Run Setup'}
      </button>
      <div style={{ marginTop: '20px' }}>
        {log.map((l, i) => (
          <div key={i} style={{
            padding: '10px 14px', borderRadius: '8px', marginBottom: '8px',
            fontSize: '13px', fontWeight: '600',
            backgroundColor: l.startsWith('✓') ? '#DCFCE7' : l.startsWith('⚠') ? '#FEF3C7' : '#FEE2E2',
            color: l.startsWith('✓') ? '#15803D' : l.startsWith('⚠') ? '#B45309' : '#DC2626',
          }}>{l}</div>
        ))}
        {done && (
          <p style={{ color: '#15803D', fontSize: '12px', marginTop: '12px', fontWeight: '700' }}>
            ✓ Setup complete. Delete SetupPage.tsx and remove /setup route now.
          </p>
        )}
      </div>
    </div>
  )
}