import { useEffect, useState } from 'react'
import { ref, onValue } from 'firebase/database'
import { db } from '../../firebase/config'
import { useAuth } from '../../hooks/useAuth'
import PageLayout from '../../components/PageLayout'
import { DollarSign, Download, CheckCircle2, AlertCircle } from 'lucide-react'

export default function PayslipPage() {
  const { uid } = useAuth()
  const [payslips, setPayslips] = useState<Record<string, { url: string, period: string, sentAt: string }>>({})

  useEffect(() => {
    if (!uid) return
    const unsub = onValue(ref(db, `Employees/${uid}/Payslips`), snap => {
      setPayslips(snap.exists() ? snap.val() : {})
    }, (err) => {
      console.error('[PayslipPage] DB error:', err)
    })
    return () => unsub()
  }, [uid])

  return (
    <PageLayout title="Payslip" subtitle="Monthly salary statements">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {Object.keys(payslips).length === 0 ? (
          <div style={{
            backgroundColor: 'white', borderRadius: '16px',
            padding: '40px 20px', textAlign: 'center',
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
          }}>
            <AlertCircle size={48} color="#CBD5E1" style={{ margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1A2B4A', margin: '0 0 8px' }}>
              No payslips available
            </h3>
            <p style={{ fontSize: '13px', color: '#94A3B8', margin: 0, lineHeight: '1.4' }}>
              Your payslips will appear here once uploaded by admin
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
                    fontSize: '12px', fontWeight: '600', color: '#64748B' }}>Period</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left',
                    fontSize: '12px', fontWeight: '600', color: '#64748B' }}>Date Sent</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left',
                    fontSize: '12px', fontWeight: '600', color: '#64748B' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(payslips).slice().reverse().map(([id, p]) => (
                  <tr key={id} style={{ borderTop: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '12px 16px', fontSize: '14px', color: '#1A2B4A' }}>
                      {p.period}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '14px', color: '#64748B' }}>
                      {new Date(p.sentAt).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <a href={p.url} download target="_blank" rel="noopener" style={{
                        padding: '6px 12px', borderRadius: '6px',
                        backgroundColor: '#ECFDF5', border: '1px solid #86EFAC',
                        color: '#15803D', fontSize: '12px', fontWeight: '600',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px',
                        textDecoration: 'none',
                      }}>
                        <Download size={12} /> Download
                      </a>
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