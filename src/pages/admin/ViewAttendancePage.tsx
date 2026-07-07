import { useEffect, useState } from 'react'
import { ref, onValue } from 'firebase/database'
import { db } from '../../firebase/config'
import PageLayout from '../../components/PageLayout'
import { Calendar } from 'lucide-react'

export default function ViewAttendancePage() {
  const [attendance, setAttendance] = useState<Record<string, any>>({})
  const [employees, setEmployees] = useState<Record<string, any>>({})
  const [search, setSearch] = useState('')
  const [filterMode, setFilterMode] = useState<'day' | 'month'>('day')
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

  const years = [selectedYear - 2, selectedYear - 1, selectedYear, selectedYear + 1, selectedYear + 2]

  useEffect(() => {
    const attUnsub = onValue(ref(db, 'Attendance'), snap => setAttendance(snap.val() || {}), (err) => {
      console.error('[ViewAttendancePage] Attendance DB error:', err)
      setAttendance({})
    })
    const empUnsub = onValue(ref(db, 'Employees'), snap => setEmployees(snap.val() || {}), (err) => {
      console.error('[ViewAttendancePage] Employees DB error:', err)
      setEmployees({})
    })
    return () => { attUnsub(); empUnsub() }
  }, [])

  const getStatusDisplay = (status?: string) => {
    if (status === 'checked_out') return { label: 'Complete', color: '#15803D' }
    if (status === 'checked_in') return { label: 'Checked In', color: '#007CC2' }
    return { label: 'Not Marked', color: '#94A3B8' }
  }

  const monthRecords = Object.entries(attendance)
    .flatMap(([uid, dates]) =>
      Object.entries(dates)
        .filter(([date]) => {
          const [year, month] = date.split('-').map(Number)
          return year === selectedYear && month === selectedMonth
        })
        .map(([date, record]: any) => ({ uid, date, ...record }))
    )

  const monthFilteredRecords = monthRecords.filter(r =>
    r.uid && (employees[r.uid]?.name?.toLowerCase().includes(search.toLowerCase()))
  )

  const dayFilteredRecords = Object.entries(attendance)
    .flatMap(([uid, dates]) =>
      Object.entries(dates)
        .filter(([date]) => date === selectedDate)
        .map(([date, record]: any) => ({ uid, date, ...record }))
    )

  const dayEmployeeRecords = Object.keys(employees).map(uid => {
    const empData = employees[uid]
    const record = dayFilteredRecords.find(r => r.uid === uid)
    return {
      uid,
      name: empData?.name || empData?.email || 'Unknown',
      status: record?.status || 'not_marked',
      checkInTime: record?.checkInTime,
      checkOutTime: record?.checkOutTime,
    }
  })

  const filteredEmployees = dayEmployeeRecords.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <PageLayout title="View Attendance" subtitle="Employee attendance records">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button onClick={() => setFilterMode('day')} style={{
            padding: '6px 12px', borderRadius: '8px', border: '1.5px solid #E2E8F0',
            fontSize: '12px', fontWeight: '600', cursor: 'pointer',
            backgroundColor: filterMode === 'day' ? '#007CC2' : '#F8FAFC',
            color: filterMode === 'day' ? 'white' : '#64748B',
          }}>Day</button>
          <button onClick={() => setFilterMode('month')} style={{
            padding: '6px 12px', borderRadius: '8px', border: '1.5px solid #E2E8F0',
            fontSize: '12px', fontWeight: '600', cursor: 'pointer',
            backgroundColor: filterMode === 'month' ? '#007CC2' : '#F8FAFC',
            color: filterMode === 'month' ? 'white' : '#64748B',
          }}>Month</button>
        </div>

        {filterMode === 'day' ? (
          <input
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            style={{
              maxWidth: '200px', padding: '8px 10px', borderRadius: '8px',
              fontSize: '13px', border: '1.5px solid #E2E8F0',
              backgroundColor: '#F8FAFC', color: '#1A2B4A',
            }}
          />
        ) : (
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <select
              value={selectedMonth}
              onChange={e => setSelectedMonth(Number(e.target.value))}
              style={{
                padding: '6px 10px', borderRadius: '8px',
                fontSize: '12px', border: '1.5px solid #E2E8F0',
                backgroundColor: '#F8FAFC', color: '#1A2B4A',
              }}
            >
              {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m, i) => (
                <option key={i + 1} value={i + 1}>{m}</option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={e => setSelectedYear(Number(e.target.value))}
              style={{
                padding: '6px 10px', borderRadius: '8px',
                fontSize: '12px', border: '1.5px solid #E2E8F0',
                backgroundColor: '#F8FAFC', color: '#1A2B4A',
              }}
            >
              {years.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        )}

        <input
          type="text" placeholder="Search employees..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            padding: '8px 12px', borderRadius: '8px',
            fontSize: '13px', border: '1.5px solid #E2E8F0',
            backgroundColor: '#F8FAFC', color: '#1A2B4A',
            maxWidth: '240px',
          }}
        />

        {filterMode === 'day' ? (
          filteredEmployees.length === 0 ? (
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
          )
        ) : (
          monthFilteredRecords.length === 0 ? (
            <div style={{
              backgroundColor: 'white', borderRadius: '16px', padding: '40px 20px',
              textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
            }}>
              <Calendar size={32} color="#CBD5E1" style={{ margin: '0 auto 12px' }} />
              <p style={{ fontSize: '14px', color: '#94A3B8', margin: 0 }}>No records found for this period</p>
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
                  {monthFilteredRecords.map((r, i) => {
                    const status = getStatusDisplay(r.status)
                    const empName = employees[r.uid]?.name || r.uid
                    return (
                      <tr key={i} style={{ borderTop: '1px solid #F1F5F9' }}>
                        <td style={{ padding: '12px 16px', fontSize: '14px', color: '#1A2B4A' }}>
                          {empName}
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: '14px', color: '#64748B' }}>
                          {r.date}
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
          )
        )}
      </div>
    </PageLayout>
  )
}