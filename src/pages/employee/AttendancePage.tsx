import { useEffect, useState } from 'react'
import { ref, set, onValue } from 'firebase/database'
import { db } from '../../firebase/config'
import { useSession } from '../../hooks/useSession'
import PageLayout from '../../components/PageLayout'
import { Clock, CheckCircle2, AlertCircle, LogIn, LogOut } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AttendancePage() {
  const { uid, name } = useSession()
  const [record, setRecord] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const today = new Date().toISOString().split('T')[0]

  useEffect(() => {
    if (!uid) return
    console.log('[AttendancePage] Fetching attendance for uid:', uid, 'date:', today)
    const unsub = onValue(ref(db, `Attendance/${uid}/${today}`), snap => {
      const data = snap.exists() ? snap.val() : null
      console.log('[AttendancePage] Fetched record:', data, 'Condition check: (!record || record?.status === "not_started") =', !data || data?.status === 'not_started')
      setRecord(data)
    }, (err) => {
      console.error('[AttendancePage] DB error:', err)
      setRecord(null)
    })
    return () => unsub()
  }, [uid, today])

  const timeNow = () => new Date().toLocaleTimeString('en-IN',
    { hour: '2-digit', minute: '2-digit', hour12: true })

  const handleClockIn = async () => {
    setLoading(true)
    try {
      await set(ref(db, `Attendance/${uid}/${today}`), {
        status: 'checked_in',
        checkInTime: timeNow(),
        checkOutTime: null,
        employeeName: name,
        date: today,
      })
      toast.success('Clocked in successfully!')
    } catch { toast.error('Failed to clock in') }
    finally { setLoading(false) }
  }

  const handleClockOut = async () => {
    setLoading(true)
    try {
      await set(ref(db, `Attendance/${uid}/${today}`), {
        ...record,
        status: 'checked_out',
        checkOutTime: timeNow(),
      })
      toast.success('Clocked out successfully!')
    } catch { toast.error('Failed to clock out') }
    finally { setLoading(false) }
  }

  const getStatusBadge = () => {
    if (record?.status === 'checked_out') return { bg: '#DCFCE7', color: '#15803D', label: 'Checked Out', icon: CheckCircle2 }
    if (record?.status === 'checked_in') return { bg: '#EFF6FF', color: '#007CC2', label: 'Checked In', icon: Clock }
    return { bg: '#F1F5F9', color: '#94A3B8', label: 'Not Started', icon: AlertCircle }
  }

  const badge = getStatusBadge()
  const BadgeIcon = badge.icon

  return (
    <PageLayout title="Attendance" subtitle="Clock in and out for today">
      <div style={{ backgroundColor: 'white', borderRadius: '16px',
        padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        textAlign: 'center' }}>
        <p style={{ fontSize: '14px', color: '#64748B', margin: '0 0 4px' }}>
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
        <p style={{ fontSize: '28px', fontWeight: '800', color: '#1A2B4A', margin: '0 0 24px' }}>
          {timeNow()}
        </p>

        <div style={{
          backgroundColor: badge.bg, borderRadius: '14px', padding: '16px',
          marginBottom: '16px', display: 'flex', alignItems: 'center',
          gap: '12px', textAlign: 'left',
        }}>
          <BadgeIcon size={24} color={badge.color} />
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: '13px', fontWeight: '700', color: badge.color, margin: '0 0 2px' }}>
              Attendance — {badge.label}
            </p>
            <p style={{ fontSize: '12px', color: badge.color, opacity: 0.8, margin: 0 }}>
              {record?.checkInTime ? `Check-in: ${record.checkInTime}` : 'Not clocked in yet'}
              {record?.checkOutTime ? ` → Check-out: ${record.checkOutTime}` : ''}
            </p>
          </div>
        </div>

        {(!record || record?.status === 'not_started') && (
          <button onClick={handleClockIn} disabled={loading} style={{
            width: '100%', padding: '14px', borderRadius: '12px', border: 'none',
            backgroundColor: '#007CC2', color: 'white', fontSize: '15px',
            fontWeight: '700', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          }}>
            <LogIn size={18} /> {loading ? 'Processing...' : 'Clock In'}
          </button>
        )}

        {record?.status === 'checked_in' && (
          <button onClick={handleClockOut} disabled={loading} style={{
            width: '100%', padding: '14px', borderRadius: '12px', border: 'none',
            backgroundColor: '#DC2626', color: 'white', fontSize: '15px',
            fontWeight: '700', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          }}>
            <LogOut size={18} /> {loading ? 'Processing...' : 'Clock Out'}
          </button>
        )}

        {record?.status === 'checked_out' && (
          <p style={{ fontSize: '13px', color: '#15803D', fontWeight: '700' }}>
            ✓ Attendance complete for today
          </p>
        )}
      </div>
    </PageLayout>
  )
}