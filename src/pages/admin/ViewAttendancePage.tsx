import { useEffect, useState } from 'react'
import { ref, onValue } from 'firebase/database'
import { db } from '../../firebase/config'
import PageLayout from '../../components/PageLayout'
import { Calendar, Clock, CheckCircle2 } from 'lucide-react'

export default function ViewAttendancePage() {
  const [attendance, setAttendance] = useState<Record<string, any>>({})
  const [employees, setEmployees] = useState<Record<string, any>>({})
  const [search, setSearch] = useState('')
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])

  useEffect(() => {
    const attUnsub = onValue(ref(db, 'Attendance'), snap => setAttendance(snap.val() || {}))
    const empUnsub = onValue(ref(db, 'Employees'), snap => setEmployees(snap.val() || {}))
    return () => { attUnsub(); empUnsub() }
  }, [])

  const records = Object.entries(attendance)
    .flatMap(([uid, dates]) =>
      Object.entries(dates).filter(([date]) => date === selectedDate).map(([date, record]: any) => ({ uid, date, ...record }))
    )

  const filtered = records.filter(r =>
    r.uid && (employees[r.uid]?.name?.toLowerCase().includes(search.toLowerCase()))
  )

  const getStatusDisplay = (status?: string) => {
    if (status === 'checked_out') return { label: 'Complete', color: '#15803D' }
    if (status === 'checked_in') return { label: 'Checked In', color: '#007CC2' }
    return { label: 'Not Marked', color: '#94A3B8' }
  }

  const allEmployeeRecords = Object.keys(employees).map(uid => {
    const empData = employees[uid]
    const todayRecord = attendance[uid]?.[selectedDate]
    return {
      uid,
      name: empData?.name || empData?.email || 'Unknown',
      status: todayRecord?.status || 'not_marked',
      checkInTime: todayRecord?.checkInTime,
      checkOutTime: todayRecord?.checkOutTime,
    }
  })

  const filteredEmployees = allEmployeeRecords.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <PageLayout title="View Attendance" subtitle="Employee attendance records">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <input
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            style={{
              padding: '10px 12px', borderRadius: '10px',
              fontSize: '14px', border: '1.5px solid #E2E8F0',
              backgroundColor: '#F8FAFC', color: '#1A2B4A',
            }}
          />
          <input
            type="text" placeholder="Search employees..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              flex: 1, padding: '12px 14px', borderRadius: '10px',
              fontSize: '14px', border: '1.5px solid #E2E8F0',
              backgroundColor: '#F8FAFC',
            }}
          />
        </div>

        {filteredEmployees.length === 0 ? (
          <div style={{
            backgroundColor: 'white', borderRadius: '16px', padding: '40px 20px',
            textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
          }}>
            <Calendar size={32} color="#CBD5E1" style={{ margin: '0 auto 12px' }} />
            <p style={{ fontSize: '14px', color: '#94A3B8', margin: 0 }}>No employees found</p>
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
                    fontSize: '12px', fontWeight: '600', color: '#64748B' }}>Check In</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left',
                    fontSize: '12px', fontWeight: '600', color: '#64748B' }}>Check Out</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left',
                    fontSize: '12px', fontWeight: '600', color: '#64748B' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((r, i) => {
                  const status = getStatusDisplay(r.status)
                  return (
                    <tr key={i} style={{ borderTop: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '12px 16px', fontSize: '14px', color: '#1A2B4A' }}>
                        {r.name}
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '14px', color: '#64748B' }}>
                        {r.checkInTime || '—'}
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '14px', color: '#64748B' }}>
                        {r.checkOutTime || '—'}
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '14px' }}>
                        <span style={{
                          fontSize: '11px', fontWeight: '600',
                          padding: '4px 10px', borderRadius: '6px',
                          backgroundColor: r.status === 'checked_out' ? '#ECFDF5' : r.status === 'checked_in' ? '#EFF6FF' : '#F8FAFC',
                          color: status.color,
                          textTransform: 'capitalize',
                        }}>
                          {status.label}
                        </span>
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