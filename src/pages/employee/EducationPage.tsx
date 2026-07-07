import { useEffect, useState } from 'react'
import { ref, get, set } from 'firebase/database'
import { db } from '../../firebase/config'
import { useAuth } from '../../hooks/useAuth'
import PageLayout from '../../components/PageLayout'
import toast from 'react-hot-toast'

interface EducationForm {
  college: string
  degree: string
  year: string
  cgpa: string
  collegeAddress: string
  specialization: string
  fromYear: string
  toYear: string
  university: string
}

export default function EducationPage() {
  const { uid } = useAuth()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState<EducationForm>({
    college: '', degree: '', year: '', cgpa: '', collegeAddress: '',
    specialization: '', fromYear: '', toYear: '', university: '',
  })

  useEffect(() => {
    if (!uid) return
    get(ref(db, `Employees/${uid}`)).then(snap => {
      if (snap.exists()) {
        const d = snap.val()
        if (d.Education) setForm(d.Education)
      }
    }).catch(() => toast.error('Failed to load data'))
  }, [uid])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!uid) return
    setLoading(true)
    try {
      await set(ref(db, `Employees/${uid}/Education`), form)
      toast.success('Education details saved!')
    } catch { toast.error('Save failed') }
    finally { setLoading(false) }
  }

  return (
    <PageLayout title="Education" subtitle="Academic qualifications">
      <form onSubmit={handleSave}>
        <div style={{
          backgroundColor: 'white', borderRadius: '16px',
          padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
          display: 'flex', flexDirection: 'column', gap: '16px',
        }}>
          <div>
            <label style={{
              fontSize: '12px', fontWeight: '600', color: '#64748B',
              textTransform: 'uppercase', letterSpacing: '0.5px',
              display: 'block', marginBottom: '6px',
            }}>
              College Name <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <input
              type="text"
              placeholder="Enter college name"
              value={form.college}
              onChange={e => setForm(p => ({ ...p, college: e.target.value }))}
              style={{
                width: '100%', padding: '12px 14px',
                borderRadius: '10px', fontSize: '14px',
                border: '1.5px solid #E2E8F0', outline: 'none',
                backgroundColor: '#F8FAFC', color: '#1A2B4A',
                boxSizing: 'border-box', transition: 'border-color 0.2s',
              }}
              onFocus={e => e.target.style.borderColor = '#007CC2'}
              onBlur={e => e.target.style.borderColor = '#E2E8F0'}
            />
          </div>

          <div>
            <label style={{
              fontSize: '12px', fontWeight: '600', color: '#64748B',
              textTransform: 'uppercase', letterSpacing: '0.5px',
              display: 'block', marginBottom: '6px',
            }}>
              Degree <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <input
              type="text"
              placeholder="Enter degree"
              value={form.degree}
              onChange={e => setForm(p => ({ ...p, degree: e.target.value }))}
              style={{
                width: '100%', padding: '12px 14px',
                borderRadius: '10px', fontSize: '14px',
                border: '1.5px solid #E2E8F0', outline: 'none',
                backgroundColor: '#F8FAFC', color: '#1A2B4A',
                boxSizing: 'border-box', transition: 'border-color 0.2s',
              }}
              onFocus={e => e.target.style.borderColor = '#007CC2'}
              onBlur={e => e.target.style.borderColor = '#E2E8F0'}
            />
          </div>

          <div>
            <label style={{
              fontSize: '12px', fontWeight: '600', color: '#64748B',
              textTransform: 'uppercase', letterSpacing: '0.5px',
              display: 'block', marginBottom: '6px',
            }}>
              Graduation Year <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <input
              type="number"
              placeholder="Enter year (YYYY)"
              value={form.year}
              onChange={e => setForm(p => ({ ...p, year: e.target.value }))}
              style={{
                width: '100%', padding: '12px 14px',
                borderRadius: '10px', fontSize: '14px',
                border: '1.5px solid #E2E8F0', outline: 'none',
                backgroundColor: '#F8FAFC', color: '#1A2B4A',
                boxSizing: 'border-box', transition: 'border-color 0.2s',
              }}
              onFocus={e => e.target.style.borderColor = '#007CC2'}
              onBlur={e => e.target.style.borderColor = '#E2E8F0'}
            />
          </div>

          <div>
            <label style={{
              fontSize: '12px', fontWeight: '600', color: '#64748B',
              textTransform: 'uppercase', letterSpacing: '0.5px',
              display: 'block', marginBottom: '6px',
            }}>
              Overall CGPA/Percentage <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <input
              type="text"
              placeholder="e.g., 8.5 or 85%"
              value={form.cgpa}
              onChange={e => setForm(p => ({ ...p, cgpa: e.target.value }))}
              style={{
                width: '100%', padding: '12px 14px',
                borderRadius: '10px', fontSize: '14px',
                border: '1.5px solid #E2E8F0', outline: 'none',
                backgroundColor: '#F8FAFC', color: '#1A2B4A',
                boxSizing: 'border-box', transition: 'border-color 0.2s',
              }}
              onFocus={e => e.target.style.borderColor = '#007CC2'}
              onBlur={e => e.target.style.borderColor = '#E2E8F0'}
            />
          </div>

          <div>
            <label style={{
              fontSize: '12px', fontWeight: '600', color: '#64748B',
              textTransform: 'uppercase', letterSpacing: '0.5px',
              display: 'block', marginBottom: '6px',
            }}>
              College Address <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <input
              type="text"
              placeholder="Enter college address"
              value={form.collegeAddress}
              onChange={e => setForm(p => ({ ...p, collegeAddress: e.target.value }))}
              style={{
                width: '100%', padding: '12px 14px',
                borderRadius: '10px', fontSize: '14px',
                border: '1.5px solid #E2E8F0', outline: 'none',
                backgroundColor: '#F8FAFC', color: '#1A2B4A',
                boxSizing: 'border-box', transition: 'border-color 0.2s',
              }}
              onFocus={e => e.target.style.borderColor = '#007CC2'}
              onBlur={e => e.target.style.borderColor = '#E2E8F0'}
            />
          </div>

          <div>
            <label style={{
              fontSize: '12px', fontWeight: '600', color: '#64748B',
              textTransform: 'uppercase', letterSpacing: '0.5px',
              display: 'block', marginBottom: '6px',
            }}>
              Specialization/Branch
            </label>
            <input
              type="text"
              placeholder="Enter specialization or branch"
              value={form.specialization}
              onChange={e => setForm(p => ({ ...p, specialization: e.target.value }))}
              style={{
                width: '100%', padding: '12px 14px',
                borderRadius: '10px', fontSize: '14px',
                border: '1.5px solid #E2E8F0', outline: 'none',
                backgroundColor: '#F8FAFC', color: '#1A2B4A',
                boxSizing: 'border-box', transition: 'border-color 0.2s',
              }}
              onFocus={e => e.target.style.borderColor = '#007CC2'}
              onBlur={e => e.target.style.borderColor = '#E2E8F0'}
            />
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ flex: 1 }}>
              <label style={{
                fontSize: '12px', fontWeight: '600', color: '#64748B',
                textTransform: 'uppercase', letterSpacing: '0.5px',
                display: 'block', marginBottom: '6px',
              }}>
                From Year
              </label>
              <input
                type="number"
                placeholder="From (YYYY)"
                value={form.fromYear}
                onChange={e => setForm(p => ({ ...p, fromYear: e.target.value }))}
                style={{
                  width: '100%', padding: '12px 14px',
                  borderRadius: '10px', fontSize: '14px',
                  border: '1.5px solid #E2E8F0', outline: 'none',
                  backgroundColor: '#F8FAFC', color: '#1A2B4A',
                  boxSizing: 'border-box', transition: 'border-color 0.2s',
                }}
                onFocus={e => e.target.style.borderColor = '#007CC2'}
                onBlur={e => e.target.style.borderColor = '#E2E8F0'}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{
                fontSize: '12px', fontWeight: '600', color: '#64748B',
                textTransform: 'uppercase', letterSpacing: '0.5px',
                display: 'block', marginBottom: '6px',
              }}>
                To Year
              </label>
              <input
                type="number"
                placeholder="To (YYYY)"
                value={form.toYear}
                onChange={e => setForm(p => ({ ...p, toYear: e.target.value }))}
                style={{
                  width: '100%', padding: '12px 14px',
                  borderRadius: '10px', fontSize: '14px',
                  border: '1.5px solid #E2E8F0', outline: 'none',
                  backgroundColor: '#F8FAFC', color: '#1A2B4A',
                  boxSizing: 'border-box', transition: 'border-color 0.2s',
                }}
                onFocus={e => e.target.style.borderColor = '#007CC2'}
                onBlur={e => e.target.style.borderColor = '#E2E8F0'}
              />
            </div>
          </div>

          <div>
            <label style={{
              fontSize: '12px', fontWeight: '600', color: '#64748B',
              textTransform: 'uppercase', letterSpacing: '0.5px',
              display: 'block', marginBottom: '6px',
            }}>
              University Name
            </label>
            <input
              type="text"
              placeholder="Enter university name"
              value={form.university}
              onChange={e => setForm(p => ({ ...p, university: e.target.value }))}
              style={{
                width: '100%', padding: '12px 14px',
                borderRadius: '10px', fontSize: '14px',
                border: '1.5px solid #E2E8F0', outline: 'none',
                backgroundColor: '#F8FAFC', color: '#1A2B4A',
                boxSizing: 'border-box', transition: 'border-color 0.2s',
              }}
              onFocus={e => e.target.style.borderColor = '#007CC2'}
              onBlur={e => e.target.style.borderColor = '#E2E8F0'}
            />
          </div>

          <button
            type="submit" disabled={loading}
            style={{
              width: '100%', padding: '14px',
              borderRadius: '12px', border: 'none',
              backgroundColor: loading ? '#93C5FD' : '#007CC2',
              color: 'white', fontSize: '15px', fontWeight: '700',
              cursor: loading ? 'not-allowed' : 'pointer',
              letterSpacing: '0.5px', marginTop: '4px',
              transition: 'background-color 0.2s',
            }}
          >
            {loading ? 'Saving...' : 'Save Education'}
          </button>
        </div>
      </form>
    </PageLayout>
  )
}