import { useEffect, useState } from 'react'
import { ref, onValue } from 'firebase/database'
import { db } from '../../firebase/config'
import { useAuth } from '../../hooks/useAuth'
import PageLayout from '../../components/PageLayout'
import { Clock } from 'lucide-react'

interface LeaveRequest {
  fromDate: string
  toDate: string
  reason: string
  status: 'Pending' | 'Approved' | 'Rejected'
}

export default function MyLeaveStatusPage() {
  const { uid } = useAuth()
  const [requests, setRequests] = useState<Record<string, LeaveRequest>>({})

  useEffect(() => {
    if (!uid) return
    const unsub = onValue(ref(db, 'LeaveRequests'), snap => {
      const data: Record<string, LeaveRequest> = {}
      snap.forEach(child => {
        if (child.val().uid === uid) {
          data[child.key!] = child.val()
        }
      })
      setRequests(data)
    })
    return () => unsub()
  }, [uid])

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Approved': return { bg: '#F0FDF4', text: '#16A34A' }
      case 'Rejected': return { bg: '#FEF2F2', text: '#DC2626' }
      default: return { bg: '#FFFBEB', text: '#D97706' }
    }
  }

  return (
    <PageLayout title="My Leave Status" subtitle="Track your requests">
      {Object.keys(requests).length === 0 ? (
        <div style={{
          backgroundColor: 'white', borderRadius: '16px', padding: '40px 20px',
          textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        }}>
          <Clock size={32} color="#CBD5E1" style={{ margin: '0 auto 12px' }} />
          <p style={{ fontSize: '14px', color: '#64748B', margin: 0 }}>
            No leave requests found
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {Object.entries(requests).map(([id, req]) => {
            const style = getStatusStyle(req.status)
            return (
              <div key={id} style={{
                backgroundColor: 'white', borderRadius: '16px',
                padding: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>
                    {req.fromDate} - {req.toDate}
                  </p>
                  <span style={{
                    backgroundColor: style.bg, color: style.text,
                    fontSize: '12px', fontWeight: '600', padding: '4px 12px',
                    borderRadius: '20px',
                  }}>
                    {req.status}
                  </span>
                </div>
                <p style={{ fontSize: '14px', color: '#1A2B4A', margin: 0 }}>
                  {req.reason}
                </p>
              </div>
            )
          })}
        </div>
      )}
    </PageLayout>
  )
}