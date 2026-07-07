import { useEffect, useState } from 'react'
import { ref, onValue, update } from 'firebase/database'
import { db } from '../../firebase/config'
import PageLayout from '../../components/PageLayout'
import { Calendar, Check, X } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ViewLeaveRequestsPage() {
  const [requests, setRequests] = useState<Record<string, any>>({})
  const [search, setSearch] = useState('')

  useEffect(() => {
    const unsub = onValue(ref(db, 'LeaveRequests'), snap => setRequests(snap.val() || {}))
    return () => unsub()
  }, [])

  const handleUpdate = async (id: string, status: 'Approved' | 'Rejected') => {
    try {
      await update(ref(db, `LeaveRequests/${id}`), { status })
      toast.success(`Leave ${status.toLowerCase()}`)
    } catch { toast.error('Failed to update') }
  }

  const filtered = Object.entries(requests).filter(([_, r]) =>
    r.name?.toLowerCase().includes(search.toLowerCase()) || r.fromDate?.includes(search)
  )

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Approved': return { bg: '#F0FDF4', text: '#16A34A' }
      case 'Rejected': return { bg: '#FEF2F2', text: '#DC2626' }
      default: return { bg: '#FFFBEB', text: '#D97706' }
    }
  }

  return (
    <PageLayout title="Leave Requests" subtitle="Manage employee leave">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <input
          type="text" placeholder="Search by name or date..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            width: '100%', padding: '12px 14px', borderRadius: '10px',
            fontSize: '14px', border: '1.5px solid #E2E8F0',
            backgroundColor: '#F8FAFC',
          }}
        />

        {filtered.length === 0 ? (
          <div style={{
            backgroundColor: 'white', borderRadius: '16px', padding: '40px 20px',
            textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
          }}>
            <Calendar size={32} color="#CBD5E1" style={{ margin: '0 auto 12px' }} />
            <p style={{ fontSize: '14px', color: '#94A3B8', margin: 0 }}>No leave requests</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {filtered.map(([id, req]) => {
              const style = getStatusStyle(req.status)
              return (
                <div key={id} style={{
                  backgroundColor: 'white', borderRadius: '16px',
                  padding: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <div>
                      <p style={{ fontSize: '14px', fontWeight: '600', color: '#1A2B4A', margin: '0 0 2px' }}>
                        {req.name}
                      </p>
                      <p style={{ fontSize: '12px', color: '#94A3B8', margin: 0 }}>
                        {req.fromDate} - {req.toDate}
                      </p>
                    </div>
                    <span style={{
                      backgroundColor: style.bg, color: style.text,
                      fontSize: '12px', fontWeight: '600', padding: '4px 12px',
                      borderRadius: '20px',
                    }}>
                      {req.status}
                    </span>
                  </div>
                  <p style={{ fontSize: '14px', color: '#64748B', margin: '0 0 12px' }}>
                    {req.reason}
                  </p>

                  {req.status === 'Pending' && (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => handleUpdate(id, 'Approved')}
                        style={{
                          flex: 1, padding: '10px', borderRadius: '8px',
                          backgroundColor: '#F0FDF4', color: '#16A34A',
                          fontSize: '14px', fontWeight: '600', border: 'none', cursor: 'pointer',
                        }}
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleUpdate(id, 'Rejected')}
                        style={{
                          flex: 1, padding: '10px', borderRadius: '8px',
                          backgroundColor: '#FEF2F2', color: '#DC2626',
                          fontSize: '14px', fontWeight: '600', border: 'none', cursor: 'pointer',
                        }}
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </PageLayout>
  )
}