import { useEffect, useState } from 'react'
import { ref, onValue } from 'firebase/database'
import { db } from '../../firebase/config'
import PageLayout from '../../components/PageLayout'

export default function ViewEmployeesPage() {
  const [users, setUsers] = useState<Record<string, any>>({})
  const [search, setSearch] = useState('')

  useEffect(() => {
    const unsub = onValue(ref(db, 'Users'), snap => {
      const data: Record<string, any> = {}
      snap.forEach(child => {
        if (child.val().role === 'employee') {
          data[child.key!] = child.val()
        }
      })
      setUsers(data)
    }, (err) => {
      console.error('[ViewEmployeesPage] DB error:', err)
      setUsers({})
    })
    return () => unsub()
  }, [])

  const filteredUsers = Object.entries(users).filter(([_, user]: any) =>
    user.name?.toLowerCase().includes(search.toLowerCase()) ||
    user.email?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <PageLayout title="View Employees" subtitle="Employee directory">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            width: '100%', padding: '12px 14px', borderRadius: '10px',
            fontSize: '14px', border: '1.5px solid #E2E8F0',
            backgroundColor: '#F8FAFC', boxSizing: 'border-box',
          }}
        />

        {filteredUsers.length === 0 ? (
          <div style={{
            backgroundColor: 'white', borderRadius: '16px', padding: '40px 20px',
            textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
          }}>
            <p style={{ fontSize: '14px', color: '#94A3B8', margin: 0 }}>
              No employees found
            </p>
          </div>
        ) : (
          <div style={{ backgroundColor: 'white', borderRadius: '16px',
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'hidden',
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ backgroundColor: '#F8FAFC' }}>
                <tr>
                  <th style={{ padding: '12px 16px', textAlign: 'left',
                    fontSize: '12px', fontWeight: '600', color: '#64748B' }}>
                    Name
                  </th>
                  <th style={{ padding: '12px 16px', textAlign: 'left',
                    fontSize: '12px', fontWeight: '600', color: '#64748B' }}>
                    Email
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(([uid, user]) => (
                  <tr key={uid} style={{ borderTop: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '12px 16px', fontSize: '14px', color: '#1A2B4A' }}>
                      {user.name || '-'}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '14px', color: '#64748B' }}>
                      {user.email || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </PageLayout>
  )
}