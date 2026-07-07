import { useEffect, useState } from 'react'
import { ref, onValue } from 'firebase/database'
import { db } from '../../firebase/config'
import PageLayout from '../../components/PageLayout'
import { Calendar, Clock, CheckCircle2 } from 'lucide-react'

export default function ViewAttendancePage() {
  const [attendance, setAttendance] = useState<Record<string, any>>({})
  const [employees, setEmployees] = useState<Record<string, any>>({})
  const [search, setSearch] = useState('')

  useEffect(() => {
    const attUnsub = onValue(ref(db, 'Attendance'), snap => setAttendance(snap.val() || {}))
    const empUnsub = onValue(ref(db, 'Users'), snap => {
      const e: Record<string, any> = {}
      snap.forEach(c => { if (c.val().role === 'employee') e[c.key!] = c.val() })
      setEmployees(e)
    })
    return () => { attUnsub(); empUnsub() }
  }, [])

  const records = Object.entries(attendance).flatMap(([uid, dates]) =>
    Object.entries(dates).map(([date, record]: any) => ({ uid, date, ...record }))
  )

  const filtered = records.filter(r =>
    r.date.includes(search) || employees[r.uid]?.name?.toLowerCase().includes(search.toLowerCase())
  )

  const getStatusDisplay = (status?: string) => {
    if (status === 'checked_out') return { label: 'Complete', color: '#15803D', icon: CheckCircle2 }
    if (status === 'checked_in') return { label: 'Checked In', color: '#007CC2', icon: Clock }
    return { label: '-', color: '#94A3B8', icon: Calendar }
  }

  return (
    <PageLayout title="View Attendance" subtitle="Employee attendance records">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <input
          type="text" placeholder="Search by date or employee..."
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
            <p style={{ fontSize: '14px', color: '#94A3B8', margin: 0 }}>No attendance records</p>
          </div>
        ) : (
          <div style={{ backgroundColor: 'white', borderRadius: '16px',
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'hidden',
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ backgroundColor: '#F8FAFC' }}>
                <tr>
                  <th style={{ padding: '12px 16px', textAlign: 'left',
                    fontSize: '12px', fontWeight: '600', color: '#64748B' }}>Employee</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left',
                    fontSize: '12px', fontWeight: '600', color: '#64748B' }}>Date</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left',
                    fontSize: '12px', fontWeight: '600', color: '#64748B' }}>Check In</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left',
                    fontSize: '12px', fontWeight: '600', color: '#64748B' }}>Check Out</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left',
                    fontSize: '12px', fontWeight: '600', color: '#64748B' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, i) => {
                  const { label, color, icon: StatusIcon } = getStatusDisplay(r.status)
                  return (
                    <tr key={i} style={{ borderTop: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '12px 16px', fontSize: '14px', color: '#1A2B4A' }}>
                        {employees[r.uid]?.name || r.uid}
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '14px', color: '#64748B' }}>{r.date}</td>
                      <td style={{ padding: '12px 16px', fontSize: '14px', color: '#64748B' }}>{r.checkInTime || '-'}</td>
                      <td style={{ padding: '12px 16px', fontSize: '14px', color: '#64748B' }}>{r.checkOutTime || '-'}</td>
                      <td style={{ padding: '12px 16px', fontSize: '14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <StatusIcon size={14} color={color} />
                          <span style={{ color, fontWeight: '500' }}>{label}</span>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </PageLayout>
  )
}