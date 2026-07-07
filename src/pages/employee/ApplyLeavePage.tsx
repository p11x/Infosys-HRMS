import { useState } from 'react'
import { push, ref } from 'firebase/database'
import { db } from '../../firebase/config'
import { useAuth } from '../../hooks/useAuth'
import PageLayout from '../../components/PageLayout'
import toast from 'react-hot-toast'

interface LeaveForm {
  fromDate: string
  toDate: string
  reason: string
}

export default function ApplyLeavePage() {
  const { uid, currentUser } = useAuth()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState<LeaveForm>({
    fromDate: '', toDate: '', reason: '',
  })

  const days = form.fromDate && form.toDate
    ? new Date(form.toDate).getTime() - new Date(form.fromDate).getTime()
    : 0
  const dayCount = Math.max(0, Math.ceil(days / (1000 * 60 * 60 * 24)) + 1)

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!uid) return

    if (form.toDate < form.fromDate) {
      toast.error('To date must be after from date')
      return
    }
    if (form.reason.length < 10) {
      toast.error('Reason must be at least 10 characters')
      return
    }

    setLoading(true)
    try {
      const name = currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Employee'
      await push(ref(db, 'LeaveRequests'), {
        uid, name, fromDate: form.fromDate, toDate: form.toDate,
        reason: form.reason, status: 'Pending',
      })
      toast.success('Leave request submitted!')
      setForm({ fromDate: '', toDate: '', reason: '' })
    } catch { toast.error('Failed to submit') }
    finally { setLoading(false) }
  }

  return (
    <PageLayout title="Apply Leave" subtitle="Submit a leave request">
      <form onSubmit={handleSave}>
        <div style={{
          backgroundColor: 'white', borderRadius: '16px',
          padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
          display: 'flex', flexDirection: 'column', gap: '16px',
        }}>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{
                fontSize: '12px', fontWeight: '600', color: '#64748B',
                textTransform: 'uppercase', letterSpacing: '0.5px',
                display: 'block', marginBottom: '6px',
              }}>From Date <span style={{ color: '#EF4444' }}>*</span></label>
              <input
                type="date"
                value={form.fromDate}
                onChange={e => setForm(p => ({ ...p, fromDate: e.target.value }))}
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
              }}>To Date <span style={{ color: '#EF4444' }}>*</span></label>
              <input
                type="date"
                value={form.toDate}
                onChange={e => setForm(p => ({ ...p, toDate: e.target.value }))}
                style={{
                  width: '100%', padding: '12px 14px', borderRadius: '10px', fontSize: '14px',
                  border: '1.5px solid #E2E8F0', outline: 'none', backgroundColor: '#F8FAFC',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          {dayCount > 0 && (
            <div style={{
              backgroundColor: '#EFF6FF', borderRadius: '10px',
              padding: '10px 14px', fontSize: '13px', color: '#007CC2',
              fontWeight: '600',
            }}>
              Duration: {dayCount} day{dayCount !== 1 ? 's' : ''}
            </div>
          )}

          <div>
            <label style={{
              fontSize: '12px', fontWeight: '600', color: '#64748B',
              textTransform: 'uppercase', letterSpacing: '0.5px',
              display: 'block', marginBottom: '6px',
            }}>Reason <span style={{ color: '#EF4444' }}>*</span></label>
            <textarea
              placeholder="Enter reason for leave"
              value={form.reason}
              rows={4}
              onChange={e => setForm(p => ({ ...p, reason: e.target.value }))}
              style={{
                width: '100%', padding: '12px 14px', borderRadius: '10px', fontSize: '14px',
                border: '1.5px solid #E2E8F0', outline: 'none', backgroundColor: '#F8FAFC',
                resize: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
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
            {loading ? 'Submitting...' : 'Submit Leave'}
          </button>
        </div>
      </form>
    </PageLayout>
  )
}