import { useState } from 'react'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { set, ref } from 'firebase/database'
import { auth, db } from '../../firebase/config'
import PageLayout from '../../components/PageLayout'
import toast from 'react-hot-toast'

const DEPARTMENTS = ['Engineering', 'HR', 'Sales', 'Marketing', 'Finance', 'Operations']

export default function CreateEmployeePage() {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '', department: '' })
  const [role, setRole] = useState<'admin' | 'employee'>('employee')

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.password || form.password.length < 6) {
      toast.error('Fill all fields (password min 6 chars)')
      return
    }
    setLoading(true)
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, form.email, form.password)
      const uid = userCredential.user.uid
      await set(ref(db, `Users/${uid}`), { id: uid, name: form.name, email: form.email, role })
      // Only create Employees node for employees
      if (role === 'employee') {
        await set(ref(db, `Employees/${uid}`), { uid, name: form.name, email: form.email, department: form.department })
        await set(ref(db, `LeaveBalance/${uid}`), { total: 18, used: 0, remaining: 18 })
      }
      toast.success(`${role === 'admin' ? 'Admin' : 'Employee'} created!`)
      setForm({ name: '', email: '', password: '', department: '' })
      setRole('employee')
    } catch { toast.error('Failed to create employee') }
    finally { setLoading(false) }
  }

  return (
    <PageLayout title="Create Account" subtitle={`${role === 'admin' ? 'Add admin' : 'Add employee'} to the system`}>
      <form onSubmit={handleSave}>
        <div style={{
          backgroundColor: 'white', borderRadius: '16px',
          padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
          display: 'flex', flexDirection: 'column', gap: '14px',
        }}>
          <div>
            <label style={{
              fontSize: '12px', fontWeight: '600', color: '#64748B',
              textTransform: 'uppercase', letterSpacing: '0.5px',
              display: 'block', marginBottom: '6px',
            }}>
              Name <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <input
              type="text" placeholder="Enter employee name"
              value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              style={{
                width: '100%', padding: '12px 14px', borderRadius: '10px', fontSize: '14px',
                border: '1.5px solid #E2E8F0', outline: 'none', backgroundColor: '#F8FAFC',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div>
            <label style={{
              fontSize: '12px', fontWeight: '600', color: '#64748B',
              textTransform: 'uppercase', letterSpacing: '0.5px',
              display: 'block', marginBottom: '6px',
            }}>
              Email <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <input
              type="email" placeholder="Enter email"
              value={form.email}
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              style={{
                width: '100%', padding: '12px 14px', borderRadius: '10px', fontSize: '14px',
                border: '1.5px solid #E2E8F0', outline: 'none', backgroundColor: '#F8FAFC',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div>
            <label style={{
              fontSize: '12px', fontWeight: '600', color: '#64748B',
              textTransform: 'uppercase', letterSpacing: '0.5px',
              display: 'block', marginBottom: '6px',
            }}>
              Department
            </label>
            <select
              value={form.department}
              onChange={e => setForm(p => ({ ...p, department: e.target.value }))}
              style={{
                width: '100%', padding: '12px 14px', borderRadius: '10px', fontSize: '14px',
                border: '1.5px solid #E2E8F0', outline: 'none', backgroundColor: '#F8FAFC',
                boxSizing: 'border-box', cursor: 'pointer',
              }}>
              <option value="">Select Department</option>
              {DEPARTMENTS.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
</select>
           </div>

           <div style={{ marginBottom: '16px' }}>
             <label style={{ fontSize: '12px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '8px' }}>
               Account Role
             </label>
             <div style={{ display: 'flex', gap: '10px' }}>
               {(['employee', 'admin'] as const).map(r => (
                 <button key={r} type="button"
                   onClick={() => setRole(r)}
                   style={{
                     flex: 1, padding: '10px', borderRadius: '10px',
                     border: `1.5px solid ${role === r ? '#007CC2' : '#E2E8F0'}`,
                     backgroundColor: role === r ? '#EFF6FF' : '#F8FAFC',
                     color: role === r ? '#007CC2' : '#64748B',
                     fontSize: '14px', fontWeight: role === r ? '700' : '400',
                     cursor: 'pointer', textTransform: 'capitalize',
                   }}>
                   {r === 'admin' ? '👔 Admin' : '👤 Employee'}
                 </button>
               ))}
             </div>
           </div>

           <div>
            <label style={{
              fontSize: '12px', fontWeight: '600', color: '#64748B',
              textTransform: 'uppercase', letterSpacing: '0.5px',
              display: 'block', marginBottom: '6px',
            }}>
              Password <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <input
              type="password" placeholder="Enter password (min 6 chars)"
              value={form.password}
              onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
              style={{
                width: '100%', padding: '12px 14px', borderRadius: '10px', fontSize: '14px',
                border: '1.5px solid #E2E8F0', outline: 'none', backgroundColor: '#F8FAFC',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <button
            type="submit" disabled={loading}
            style={{
              width: '100%', padding: '14px', borderRadius: '12px', border: 'none',
              backgroundColor: loading ? '#93C5FD' : '#007CC2', color: 'white',
              fontSize: '15px', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer',
              letterSpacing: '0.5px', marginTop: '4px',
            }}
          >
            {loading ? 'Creating...' : role === 'admin' ? 'Create Admin' : 'Create Employee'}
          </button>
        </div>
      </form>
    </PageLayout>
  )
}