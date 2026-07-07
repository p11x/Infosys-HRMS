import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ref, onValue, update, push, remove } from 'firebase/database'
import { db } from '../../firebase/config'
import { useSession } from '../../hooks/useSession'
import {
  LayoutDashboard, FileText, Users, Calendar,
  CheckSquare, UserPlus, Bell, Search, LogOut,
  TrendingUp, Clock, UserCheck, UserX, Award,
  ChevronRight, Check, X, Shield,
  BarChart3, HelpCircle,
  AlertCircle, ArrowUpRight, Eye,
  FileCheck, Briefcase, Megaphone, Trash2, Cake
} from 'lucide-react'

interface Employee {
  uid: string
  name?: string
  email?: string
  phone?: string
  profilePhoto?: string
  completion: number
  department?: string
  Documents?: Record<string, string>
}
interface LeaveReq {
  leaveId: string; uid: string; name: string
  fromDate: string; toDate: string
  reason: string; status: string
}
interface AttendanceRecord {
  uid: string; date: string
  status?: "not_started" | "checked_in" | "checked_out"
  checkInTime?: string; checkOutTime?: string
  employeeName?: string
}
interface Announcement {
  id: string
  title: string
  message: string
  priority: 'low' | 'medium' | 'high'
  createdAt: string
  createdBy: string
}
interface Holiday {
  id: string
  name: string
  date: string
  type: 'public' | 'optional'
}
interface SupportTicket {
  id: string
  employeeId: string
  employeeName: string
  subject: string
  message: string
  status: 'open' | 'in-progress' | 'resolved' | 'closed'
  priority: 'low' | 'medium' | 'high'
  createdAt: string
}
interface AuditLog {
  id: string
  action: string
  details: string
  timestamp: string
  admin: string
}

const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'employees', label: 'Employees', icon: Users },
  { id: 'leave', label: 'Leave Requests', icon: Calendar },
  { id: 'attendance', label: 'Attendance', icon: CheckSquare },
  { id: 'reports', label: 'Reports', icon: BarChart3 },
  { id: 'documents', label: 'Documents', icon: FileText },
  { id: 'announcements', label: 'Announcements', icon: Megaphone },
  { id: 'holidays', label: 'Holidays', icon: Calendar },
  { id: 'audit', label: 'Audit Log', icon: FileText },
  { id: 'support', label: 'Support Tickets', icon: HelpCircle },
  { id: 'create', label: 'Add Employee', icon: UserPlus },
]

const BOTTOM_NAV: { id: string; label: string; icon: any }[] = []

export default function AdminDashboardPage() {
  const navigate = useNavigate()
  const { clearSession, email, name } = useSession()
  const [activeNav, setActiveNav] = useState('dashboard')
  const [employees, setEmployees] = useState<Employee[]>([])
  const [leaves, setLeaves] = useState<LeaveReq[]>([])
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [notifOpen, setNotifOpen] = useState(false)
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [holidays, setHolidays] = useState<Holiday[]>([])
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [selectedDept, setSelectedDept] = useState<string>('all')
  const [showPastHolidays, setShowPastHolidays] = useState(false)
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([])
  const [annTitle, setAnnTitle] = useState('')
  const [annMessage, setAnnMessage] = useState('')
  const [annPriority, setAnnPriority] = useState<'low' | 'medium' | 'high'>('medium')
  const [holidayName, setHolidayName] = useState('')
  const [holidayDate, setHolidayDate] = useState('')
  const [holidayType, setHolidayType] = useState<'public' | 'optional'>('public')
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [auditPage, setAuditPage] = useState(1)
  const auditPageSize = 10

  const today = new Date().toISOString().split('T')[0]
  const todayLabel = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  })

useEffect(() => {
    const u1 = onValue(ref(db, 'Employees'), snap => {
      try {
        if (!snap.exists()) { setLoading(false); return }
        const employeesData = snap.val()
        const list: Employee[] = Object.keys(employeesData).map(uid => {
          const ed = employeesData[uid]
          const docCount = [
            ed?.Documents?.aadhaar, ed?.Documents?.pan, ed?.Documents?.resume, ed?.Documents?.photo
          ].filter(Boolean).length
          const comp = [
            !!(ed?.name && ed?.phone && ed?.email),
            !!ed?.Education, !!ed?.BankDetails, docCount > 0,
          ].filter(Boolean).length * 25
          return {
            uid,
            name: ed?.name || ed?.email || 'Unknown Employee',
            email: ed?.email || '',
            phone: ed?.phone || '',
            profilePhoto: ed?.profilePhoto || null,
            completion: comp,
            department: ed?.department || '',
            Documents: ed?.Documents || {},
          }
        })
        setEmployees(list)
        setLoading(false)
      } catch (err) {
        console.error('[AdminDashboardPage] Employees read error:', err)
        setLoading(false)
      }
    }, (err) => {
      console.error('[AdminDashboardPage] Employees DB error:', err)
      setLoading(false)
    })
    const u2 = onValue(ref(db, 'Users'), snap => {
      if (!snap.exists()) return
      const raw = snap.val()
      setEmployees(prev => prev.map(emp => ({
        ...emp,
        name: raw[emp.uid]?.name || emp.name,
        email: raw[emp.uid]?.email || emp.email,
      })))
    }, (err) => console.error('[AdminDashboardPage] Users DB error:', err))
    const u3 = onValue(ref(db, 'LeaveRequests'), snap => {
      if (!snap.exists()) return
      const d = snap.val()
      setLeaves(Object.keys(d).map(id => ({ ...d[id], leaveId: id })))
    }, (err) => {
      console.error('[AdminDashboardPage] LeaveRequests DB error:', err)
    })
    const u4 = onValue(ref(db, 'Attendance'), snap => {
      if (!snap.exists()) return
      const d = snap.val(); const arr: AttendanceRecord[] = []
      Object.keys(d).forEach(uid =>
        Object.keys(d[uid]).forEach(date =>
          arr.push({ uid, date, ...d[uid][date] })
        )
      )
      setAttendance(arr.sort((a, b) => b.date.localeCompare(a.date)))
    }, (err) => {
      console.error('[AdminDashboardPage] Attendance DB error:', err)
    })
    const u5 = onValue(ref(db, 'Announcements'), snap => {
      if (!snap.exists()) return
      const d = snap.val()
      setAnnouncements(Object.keys(d).map(id => ({ ...d[id], id }) as Announcement))
    }, (err) => {
      console.error('[AdminDashboardPage] Announcements DB error:', err)
    })
    const u6 = onValue(ref(db, 'Holidays'), snap => {
      if (!snap.exists()) return
      const d = snap.val()
      setHolidays(Object.keys(d).map(id => ({ ...d[id], id }) as Holiday))
    }, (err) => {
      console.error('[AdminDashboardPage] Holidays DB error:', err)
    })
    const u7 = onValue(ref(db, 'SupportTickets'), snap => {
      if (!snap.exists()) return
      const d = snap.val()
      setTickets(Object.keys(d).map(id => ({ ...d[id], id }) as SupportTicket))
    }, (err) => {
      console.error('[AdminDashboardPage] SupportTickets DB error:', err)
    })
    const u8 = onValue(ref(db, 'AuditLog'), snap => {
      if (!snap.exists()) return
      const d = snap.val()
      setAuditLogs(Object.keys(d).map(id => ({ ...d[id], id }) as AuditLog))
    }, (err) => {
      console.error('[AdminDashboardPage] AuditLog DB error:', err)
    })
    return () => { u1(); u2(); u3(); u4(); u5(); u6(); u7(); u8() }
  }, [])

  const logAction = async (action: string, details: string) => {
    await push(ref(db, 'AuditLog'), {
      action, details, timestamp: new Date().toISOString(), admin: 'Admin'
    })
  }

  const getBirthdaysThisWeek = (): { uid: string; name: string; date: string }[] => {
    const results: { uid: string; name: string; date: string }[] = []
    const now = new Date()
    const currentMonth = now.getMonth()
    const nextMonth = (currentMonth + 1) % 12
    employees.forEach(emp => {
      // Birthday would be fetched from employee data
    })
    return results
  }

  const pending = leaves.filter(l => l.status === 'Pending')
  const approved = leaves.filter(l => l.status === 'Approved')
  const todayPresent = attendance.filter(a => a.date === today && (a.status === 'checked_in' || a.status === 'checked_out'))
  const complete = employees.filter(e => (e?.completion ?? 0) === 100)
  const incomplete = employees.filter(e => (e?.completion ?? 0) < 100)
  const filtered = employees.filter(e =>
    (e?.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (e?.email || '').toLowerCase().includes(search.toLowerCase())
  )

  const handleLeave = async (id: string, status: string) => {
    await update(ref(db, `LeaveRequests/${id}`), { status })
  }

  const getInitials = (n?: string) => {
    if (!n || typeof n !== 'string' || n.trim() === '') return '??'
    return n.trim().split(' ').filter(Boolean)
      .map(x => x[0]).join('').slice(0, 2).toUpperCase()
  }

  const handleLogout = () => { clearSession(); navigate('/login', { replace: true }) }

  const postAnnouncement = async () => {
    if (!annTitle.trim() || !annMessage.trim()) return
    await push(ref(db, 'Announcements'), {
      title: annTitle,
      message: annMessage,
      priority: annPriority,
      createdAt: new Date().toISOString(),
      createdBy: 'Admin'
    })
    await logAction('Created Announcement', `Title: ${annTitle}`)
    setAnnTitle('')
    setAnnMessage('')
    setAnnPriority('medium')
  }

  const deleteAnnouncement = async (id: string) => {
    await remove(ref(db, `Announcements/${id}`))
    await logAction('Deleted Announcement', `ID: ${id}`)
  }

  const addHoliday = async () => {
    if (!holidayName.trim() || !holidayDate) return
    await push(ref(db, 'Holidays'), {
      name: holidayName,
      date: holidayDate,
      type: holidayType
    })
    await logAction('Added Holiday', `Name: ${holidayName}`)
    setHolidayName('')
    setHolidayDate('')
    setHolidayType('public')
  }

  const deleteHoliday = async (id: string) => {
    await remove(ref(db, `Holidays/${id}`))
    await logAction('Deleted Holiday', `ID: ${id}`)
  }

  const updateTicketStatus = async (id: string, status: SupportTicket['status']) => {
    await update(ref(db, `SupportTickets/${id}`), { status })
    await logAction('Updated Ticket Status', `ID: ${id}, Status: ${status}`)
  }

  const card = {
    backgroundColor: 'white', borderRadius: '14px',
    border: '1px solid #E8EDF2', boxShadow: '0 1px 6px rgba(0,0,0,0.05)',
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F0F4F8', fontFamily: 'Inter, sans-serif' }}>

      <aside style={{ width: '220px', flexShrink: 0, backgroundColor: '#0F1C2E', display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, left: 0, height: '100vh', zIndex: 30, boxShadow: '4px 0 20px rgba(0,0,0,0.2)' }}>
        <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#007CC2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontFamily: 'Georgia,serif', color: 'white', fontSize: '14px', fontWeight: '400' }}>In</span>
            </div>
            <div>
              <p style={{ color: 'white', fontWeight: '800', fontSize: '14px', margin: 0, letterSpacing: '0.5px' }}>Infosys</p>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px', margin: 0, letterSpacing: '1px' }}>HRMS PORTAL</p>
            </div>
          </div>
        </div>

        <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ backgroundColor: 'rgba(0,124,194,0.2)', borderRadius: '10px', padding: '10px 12px', border: '1px solid rgba(0,124,194,0.3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#007CC2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Shield size={15} color="white" />
              </div>
              <div>
                <p style={{ color: 'white', fontSize: '12px', fontWeight: '700', margin: 0 }}>{name || 'Admin'}</p>
                <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '10px', margin: 0 }}>{email}</p>
              </div>
            </div>
          </div>
        </div>

        <nav style={{ flex: 1, padding: '10px 10px', overflowY: 'auto' }}>
          <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '10px', fontWeight: '700', letterSpacing: '1.5px', padding: '8px 10px 4px', margin: 0 }}>MAIN MENU</p>
          {NAV.map(item => {
            const Icon = item.icon
            const active = activeNav === item.id
            const badge = item.id === 'leave' && pending.length > 0 ? pending.length : null
            return (
              <button key={item.id} onClick={() => {
                if (item.id === 'create') navigate('/admin/create-employee')
                else setActiveNav(item.id)
              }} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '10px', border: 'none', cursor: 'pointer', marginBottom: '2px', backgroundColor: active ? 'rgba(0,124,194,0.25)' : 'transparent', borderLeft: active ? '3px solid #007CC2' : '3px solid transparent', transition: 'all 0.15s' }} onMouseEnter={e => { if (!active) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)' }} onMouseLeave={e => { if (!active) e.currentTarget.style.backgroundColor = 'transparent' }}>
                <Icon size={17} color={active ? '#38BDF8' : 'rgba(255,255,255,0.55)'} />
                <span style={{ fontSize: '13px', fontWeight: active ? '700' : '400', color: active ? 'white' : 'rgba(255,255,255,0.55)', flex: 1, textAlign: 'left' }}>{item.label}</span>
                {badge && <span style={{ backgroundColor: '#EF4444', color: 'white', fontSize: '10px', fontWeight: '700', width: '18px', height: '18px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{badge}</span>}
              </button>
            )
          })}
        </nav>

        <div style={{ padding: '10px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          {BOTTOM_NAV.map(item => {
            const Icon = item.icon
            return (
              <button key={item.id} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 12px', borderRadius: '10px', border: 'none', cursor: 'pointer', marginBottom: '2px', backgroundColor: 'transparent' }} onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'none'}>
                <Icon size={16} color="rgba(255,255,255,0.4)" />
                <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>{item.label}</span>
              </button>
            )
          })}
          <button onClick={handleLogout} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 12px', borderRadius: '10px', border: 'none', cursor: 'pointer', backgroundColor: 'rgba(239,68,68,0.1)' }} onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.2)'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.1)'}>
            <LogOut size={16} color="#F87171" />
            <span style={{ fontSize: '12px', color: '#F87171', fontWeight: '600' }}>Logout</span>
          </button>
        </div>
      </aside>

      <div style={{ marginLeft: '220px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <header style={{ position: 'sticky', top: 0, zIndex: 20, backgroundColor: 'white', borderBottom: '1px solid #E8EDF2', padding: '0 28px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}>
          <div>
            <h1 style={{ fontSize: '18px', fontWeight: '800', color: '#0F1C2E', margin: 0 }}>
              {activeNav === 'dashboard' && 'Dashboard Overview'}
              {activeNav === 'employees' && 'Employee Management'}
              {activeNav === 'leave' && 'Leave Requests'}
              {activeNav === 'attendance' && 'Attendance Records'}
              {activeNav === 'reports' && 'Reports & Analytics'}
              {activeNav === 'documents' && 'Document Center'}
              {activeNav === 'announcements' && 'Announcements'}
              {activeNav === 'holidays' && 'Holidays'}
              {activeNav === 'audit' && 'Audit Log'}
              {activeNav === 'support' && 'Support Tickets'}
            </h1>
            <p style={{ fontSize: '12px', color: '#94A3B8', margin: 0 }}>{todayLabel}</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ position: 'relative' }}>
              <Search size={15} color="#94A3B8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
              <input placeholder="Search employees..." value={search} onChange={e => setSearch(e.target.value)} style={{ padding: '8px 12px 8px 32px', borderRadius: '10px', border: '1.5px solid #E2E8F0', fontSize: '13px', outline: 'none', width: '220px', backgroundColor: '#F8FAFC' }} onFocus={e => e.target.style.borderColor = '#007CC2'} onBlur={e => e.target.style.borderColor = '#E2E8F0'} />
            </div>
            <div style={{ position: 'relative' }}>
              <button onClick={() => setNotifOpen(!notifOpen)} style={{ width: '38px', height: '38px', borderRadius: '10px', border: '1.5px solid #E2E8F0', backgroundColor: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative' }}>
                <Bell size={18} color="#64748B" />
                {pending.length > 0 && <span style={{ position: 'absolute', top: '-4px', right: '-4px', backgroundColor: '#EF4444', color: 'white', fontSize: '10px', fontWeight: '700', width: '16px', height: '16px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{pending.length}</span>}
              </button>
              {notifOpen && (
                <div style={{ position: 'absolute', right: 0, top: '44px', width: '280px', backgroundColor: 'white', borderRadius: '14px', border: '1px solid #E8EDF2', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', zIndex: 50, overflow: 'hidden' }}>
                  <div style={{ padding: '12px 16px', borderBottom: '1px solid #F1F5F9' }}>
                    <p style={{ fontWeight: '700', fontSize: '13px', color: '#0F1C2E', margin: 0 }}>Notifications ({pending.length})</p>
                  </div>
                  {pending.length === 0 ? <p style={{ padding: '20px', textAlign: 'center', color: '#94A3B8', fontSize: '13px' }}>No pending requests</p> : pending.slice(0, 4).map(l => (
                    <div key={l.leaveId} style={{ padding: '12px 16px', borderBottom: '1px solid #F8FAFC' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#FBBF24', flexShrink: 0 }} />
                        <div>
                          <p style={{ fontSize: '12px', fontWeight: '600', color: '#1A2B4A', margin: '0 0 2px' }}>{l?.name || 'Unknown'} — Leave Request</p>
                          <p style={{ fontSize: '11px', color: '#94A3B8', margin: 0 }}>{l.fromDate} to {l.toDate}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  <button onClick={() => { setActiveNav('leave'); setNotifOpen(false) }} style={{ width: '100%', padding: '10px', border: 'none', backgroundColor: '#F8FAFC', color: '#007CC2', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}>View all requests</button>
                </div>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#0F1C2E', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #007CC2' }}>
                <Shield size={16} color="#38BDF8" />
              </div>
              <div>
                <p style={{ fontSize: '12px', fontWeight: '700', color: '#0F1C2E', margin: 0 }}>Admin</p>
                <p style={{ fontSize: '10px', color: '#94A3B8', margin: 0 }}>Manager</p>
              </div>
            </div>
          </div>
        </header>

        <main style={{ flex: 1, padding: '24px 28px', overflowY: 'auto' }}>

          {activeNav === 'dashboard' && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
                {[
                  { label: 'Total Employees', value: employees.length, icon: Users, color: '#007CC2', bg: '#EFF6FF', sub: `${complete.length} fully onboarded` },
                  { label: 'Present Today', value: todayPresent.length, icon: CheckSquare, color: '#059669', bg: '#ECFDF5', sub: `of ${employees.length} employees` },
                  { label: 'Pending Leaves', value: pending.length, icon: Clock, color: '#D97706', bg: '#FFFBEB', sub: `${approved.length} approved this month` },
                  { label: 'Incomplete Profiles', value: incomplete.length, icon: AlertCircle, color: '#DC2626', bg: '#FEF2F2', sub: `${complete.length} completed` },
                ].map((s, i) => {
                  const Icon = s.icon
                  return (
                    <div key={i} style={{ ...card, padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Icon size={22} color={s.color} />
                        </div>
                        <ArrowUpRight size={16} color="#CBD5E1" />
                      </div>
                      <div>
                        <p style={{ fontSize: '30px', fontWeight: '800', color: '#0F1C2E', margin: '0 0 2px', lineHeight: 1 }}>{s.value}</p>
                        <p style={{ fontSize: '13px', fontWeight: '600', color: '#64748B', margin: '0 0 4px' }}>{s.label}</p>
                        <p style={{ fontSize: '11px', color: '#94A3B8', margin: 0 }}>{s.sub}</p>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                <div style={{ ...card, padding: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#0F1C2E', margin: 0 }}>Employee Statistics</h3>
                    <button onClick={() => setActiveNav('employees')} style={{ fontSize: '12px', color: '#007CC2', fontWeight: '600', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>View All <ChevronRight size={13} /></button>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    {[
                      { label: 'Active', value: employees.length, color: '#059669', bg: '#ECFDF5', icon: UserCheck },
                      { label: 'Profile Complete', value: complete.length, color: '#007CC2', bg: '#EFF6FF', icon: FileCheck },
                      { label: 'Pending Onboarding', value: incomplete.length, color: '#D97706', bg: '#FFFBEB', icon: UserX },
                      { label: 'Present Today', value: todayPresent.length, color: '#7C3AED', bg: '#F5F3FF', icon: Briefcase },
                    ].map((s, i) => {
                      const Icon = s.icon
                      return (
                        <div key={i} style={{ backgroundColor: s.bg, borderRadius: '12px', padding: '14px', border: `1px solid ${s.color}20` }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                            <Icon size={16} color={s.color} />
                            <span style={{ fontSize: '11px', color: s.color, fontWeight: '600' }}>{s.label}</span>
                          </div>
                          <p style={{ fontSize: '24px', fontWeight: '800', color: s.color, margin: 0 }}>{s.value}</p>
                        </div>
                      )
                    })}
</div>
                </div>

                <div style={{ ...card, padding: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#0F1C2E', margin: 0 }}>Birthdays This Week</h3>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {employees.filter(e => e.department).slice(0, 3).map(emp => (
                      <div key={emp.uid} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '10px', backgroundColor: '#F8FAFC', border: '1px solid #F1F5F9' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#DBEAFE', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <span style={{ fontWeight: '700', fontSize: '11px', color: '#1D4ED8' }}>{getInitials(emp.name)}</span>
                        </div>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: '12px', fontWeight: '600', color: '#1A2B4A', margin: 0 }}>{emp.name}</p>
                          <p style={{ fontSize: '11px', color: '#94A3B8', margin: 0 }}>{emp.department}</p>
                        </div>
                        <Cake size={16} color="#007CC2" />
                      </div>
                    ))}
                    {employees.filter(e => e.department).length === 0 && <p style={{ color: '#94A3B8', fontSize: '12px', textAlign: 'center' }}>No birthdays this week</p>}
                  </div>
                </div>

                <div style={{ ...card, padding: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#0F1C2E', margin: 0 }}>Leave Requests</h3>
                    <span style={{ backgroundColor: '#FEF3C7', color: '#B45309', fontSize: '11px', fontWeight: '700', padding: '3px 10px', borderRadius: '20px' }}>{pending.length} pending</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {leaves.length === 0 ? <p style={{ color: '#94A3B8', fontSize: '13px', textAlign: 'center', padding: '20px' }}>No requests yet</p> : leaves.slice(0, 4).map(l => (
                      <div key={l.leaveId} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '10px', backgroundColor: '#F8FAFC', border: '1px solid #F1F5F9' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#DBEAFE', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <span style={{ fontWeight: '700', fontSize: '11px', color: '#1D4ED8' }}>{getInitials(l?.name)}</span>
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: '12px', fontWeight: '600', color: '#1A2B4A', margin: '0 0 1px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l?.name || 'Unknown'}</p>
                          <p style={{ fontSize: '11px', color: '#94A3B8', margin: 0 }}>{l.fromDate} → {l.toDate}</p>
                        </div>
                        <span style={{ fontSize: '10px', fontWeight: '700', padding: '2px 8px', borderRadius: '20px', backgroundColor: l.status === 'Approved' ? '#DCFCE7' : l.status === 'Rejected' ? '#FEE2E2' : '#FEF3C7', color: l.status === 'Approved' ? '#15803D' : l.status === 'Rejected' ? '#DC2626' : '#B45309', whiteSpace: 'nowrap' }}>{l.status}</span>
                        {l.status === 'Pending' && (
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <button onClick={() => handleLeave(l.leaveId, 'Approved')} style={{ width: '26px', height: '26px', borderRadius: '6px', border: 'none', backgroundColor: '#DCFCE7', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Check size={13} color="#15803D" />
                            </button>
                            <button onClick={() => handleLeave(l.leaveId, 'Rejected')} style={{ width: '26px', height: '26px', borderRadius: '6px', border: 'none', backgroundColor: '#FEE2E2', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <X size={13} color="#DC2626" />
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
                <div style={{ ...card, padding: '20px', overflow: 'hidden' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#0F1C2E', margin: 0 }}>Employee Overview</h3>
                    <button onClick={() => setActiveNav('employees')} style={{ fontSize: '12px', color: '#007CC2', fontWeight: '600', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>View All <ChevronRight size={13} /></button>
                  </div>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#F8FAFC' }}>
                        {['Employee', 'Email', 'Profile', 'Status'].map(h => (
                          <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #E2E8F0' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? <tr><td colSpan={4} style={{ textAlign: 'center', padding: '30px', color: '#94A3B8', fontSize: '13px' }}>Loading...</td></tr> : employees.slice(0, 6).map(emp => (
                        <tr key={emp.uid} onMouseEnter={e => e.currentTarget.style.backgroundColor = '#F8FAFC'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'white'}>
                          <td style={{ padding: '10px 12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <div style={{ width: '30px', height: '30px', borderRadius: '50%', backgroundColor: '#DBEAFE', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                {emp.profilePhoto ? <img src={emp.profilePhoto} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontWeight: '700', fontSize: '10px', color: '#1D4ED8' }}>{getInitials(emp.name)}</span>}
                              </div>
                              <span style={{ fontSize: '13px', fontWeight: '600', color: '#1A2B4A' }}>{emp.name || 'Unknown Employee'}</span>
                            </div>
                          </td>
                          <td style={{ padding: '10px 12px', fontSize: '12px', color: '#64748B' }}>{emp.email}</td>
                          <td style={{ padding: '10px 12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <div style={{ flex: 1, height: '5px', backgroundColor: '#F1F5F9', borderRadius: '99px', overflow: 'hidden', minWidth: '60px' }}>
                                <div style={{ height: '100%', borderRadius: '99px', width: `${emp.completion}%`, backgroundColor: emp.completion === 100 ? '#16A34A' : '#007CC2', transition: 'width 0.5s ease' }} />
                              </div>
                              <span style={{ fontSize: '11px', fontWeight: '600', color: '#64748B', whiteSpace: 'nowrap' }}>{emp.completion}%</span>
                            </div>
                          </td>
                          <td style={{ padding: '10px 12px' }}>
                            <span style={{ fontSize: '10px', fontWeight: '700', padding: '3px 8px', borderRadius: '20px', backgroundColor: emp.completion === 100 ? '#DCFCE7' : '#FEF3C7', color: emp.completion === 100 ? '#15803D' : '#B45309' }}>{emp.completion === 100 ? 'Complete' : 'Pending'}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div style={{ ...card, padding: '20px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#0F1C2E', margin: '0 0 16px' }}>Quick Actions</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {[
                      { label: 'Add New Employee', icon: UserPlus, color: '#007CC2', bg: '#EFF6FF', action: () => navigate('/admin/create-employee') },
                      { label: 'Review Leave Requests', icon: Calendar, color: '#D97706', bg: '#FFFBEB', action: () => setActiveNav('leave') },
                      { label: 'View Attendance', icon: CheckSquare, color: '#059669', bg: '#ECFDF5', action: () => setActiveNav('attendance') },
                      { label: 'All Employees', icon: Users, color: '#7C3AED', bg: '#F5F3FF', action: () => setActiveNav('employees') },
                      { label: 'View Reports', icon: BarChart3, color: '#0F1C2E', bg: '#F1F5F9', action: () => setActiveNav('reports') },
                    ].map((a, i) => {
                      const Icon = a.icon
                      return (
                        <button key={i} onClick={a.action} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px', borderRadius: '10px', border: `1px solid ${a.color}20`, backgroundColor: a.bg, cursor: 'pointer', width: '100%', transition: 'all 0.15s' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateX(3px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateX(0)'}>
                          <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
                            <Icon size={16} color={a.color} />
                          </div>
                          <span style={{ fontSize: '13px', fontWeight: '600', color: '#1A2B4A', flex: 1, textAlign: 'left' }}>{a.label}</span>
                          <ChevronRight size={14} color="#CBD5E1" />
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            </>
          )}

          {activeNav === 'employees' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <select
                  value={selectedDept}
                  onChange={e => setSelectedDept(e.target.value)}
                  style={{ padding: '8px 12px', borderRadius: '8px', border: '1.5px solid #E2E8F0', fontSize: '13px', outline: 'none' }}
                >
                  <option value="all">All Departments</option>
                  {Array.from(new Set(employees.map(e => e.department).filter(Boolean))).map(dept => (
                    <option key={dept} value={dept || ''}>{dept}</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '14px' }}>
                {loading ? <p style={{ color: '#94A3B8', fontSize: '14px' }}>Loading...</p> : filtered.filter(e => selectedDept === 'all' || e.department === selectedDept).length === 0 ? <p style={{ color: '#94A3B8' }}>No employees found</p> : filtered.filter(e => selectedDept === 'all' || e.department === selectedDept).map(emp => (
                  <div key={emp.uid} style={{ ...card, padding: '18px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '14px' }}>
                      <input
                        type="checkbox"
                        checked={selectedEmployees.includes(emp.uid)}
                        onChange={e => {
                          if (e.target.checked) setSelectedEmployees([...selectedEmployees, emp.uid])
                          else setSelectedEmployees(selectedEmployees.filter(id => id !== emp.uid))
                        }}
                        style={{ width: '16px', height: '16px', marginTop: '4px' }}
                      />
                      <div style={{ width: '46px', height: '46px', borderRadius: '50%', backgroundColor: '#DBEAFE', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '2px solid #BFDBFE' }}>
                        {emp.profilePhoto ? <img src={emp.profilePhoto} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontWeight: '700', fontSize: '14px', color: '#1D4ED8' }}>{getInitials(emp.name)}</span>}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontWeight: '700', fontSize: '14px', color: '#1A2B4A', margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{emp.name || 'Unknown Employee'}</p>
                        <p style={{ fontSize: '11px', color: '#94A3B8', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{emp.email}</p>
                        {emp.department && <p style={{ fontSize: '11px', color: '#007CC2', margin: '4px 0 0', fontWeight: '600' }}>{emp.department}</p>}
                      </div>
                      <span style={{ fontSize: '10px', fontWeight: '700', backgroundColor: emp.completion === 100 ? '#DCFCE7' : '#FEF3C7', color: emp.completion === 100 ? '#15803D' : '#B45309', padding: '3px 8px', borderRadius: '20px', whiteSpace: 'nowrap' }}>{emp.completion}%</span>
                    </div>
                    <div style={{ marginBottom: '12px' }}>
                      <div style={{ height: '6px', backgroundColor: '#F1F5F9', borderRadius: '99px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', borderRadius: '99px', width: `${emp.completion}%`, backgroundColor: emp.completion === 100 ? '#059669' : '#007CC2', transition: 'width 0.5s ease' }} />
                      </div>
                      <p style={{ fontSize: '11px', color: '#94A3B8', margin: '4px 0 0', textAlign: 'right' }}>Profile {emp.completion === 100 ? 'complete' : 'incomplete'}</p>
                    </div>
                    <button onClick={() => navigate(`/admin/employees/${emp.uid}`)} style={{ width: '100%', padding: '9px', borderRadius: '8px', backgroundColor: '#EFF6FF', color: '#1D4ED8', border: '1px solid #BFDBFE', fontSize: '12px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                      <Eye size={13} /> View Full Profile
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeNav === 'leave' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {leaves.length === 0 ? (
                <div style={{ ...card, padding: '60px', textAlign: 'center' }}>
                  <Calendar size={40} color="#E2E8F0" style={{ margin: '0 auto 12px', display: 'block' }} />
                  <p style={{ color: '#94A3B8' }}>No leave requests yet</p>
                </div>
              ) : leaves.map(l => (
                <div key={l.leaveId} style={{ ...card, padding: '18px', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#DBEAFE', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontWeight: '700', fontSize: '13px', color: '#1D4ED8' }}>{getInitials(l?.name)}</span>
                  </div>
                  <div style={{ flex: 1, minWidth: '180px' }}>
                    <p style={{ fontWeight: '700', fontSize: '14px', color: '#1A2B4A', margin: '0 0 4px' }}>{l?.name || 'Unknown'}</p>
                    <p style={{ fontSize: '12px', color: '#64748B', margin: '0 0 2px' }}>{l.fromDate} → {l.toDate}</p>
                    <p style={{ fontSize: '12px', color: '#94A3B8', margin: 0 }}>{l.reason}</p>
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: '700', padding: '5px 14px', borderRadius: '20px', backgroundColor: l.status === 'Approved' ? '#DCFCE7' : l.status === 'Rejected' ? '#FEE2E2' : '#FEF3C7', color: l.status === 'Approved' ? '#15803D' : l.status === 'Rejected' ? '#DC2626' : '#B45309' }}>{l.status}</span>
                  {l.status === 'Pending' && (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => handleLeave(l.leaveId, 'Approved')} style={{ padding: '8px 18px', borderRadius: '8px', backgroundColor: '#DCFCE7', color: '#15803D', border: '1px solid #86EFAC', fontSize: '13px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Check size={14} /> Approve
                      </button>
                      <button onClick={() => handleLeave(l.leaveId, 'Rejected')} style={{ padding: '8px 18px', borderRadius: '8px', backgroundColor: '#FEE2E2', color: '#DC2626', border: '1px solid #FCA5A5', fontSize: '13px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <X size={14} /> Reject
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeNav === 'attendance' && (
            <div style={{ padding: '24px 28px', overflowY: 'auto' }}>

              <div style={{ ...card, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#F8FAFC' }}>
                      {['Employee', 'Date', 'Check In', 'Check Out', 'Status'].map(h => (
                        <th key={h} style={{
                          padding: '14px 18px', textAlign: 'left', fontSize: '11px',
                          fontWeight: '700', color: '#64748B', textTransform: 'uppercase',
                          letterSpacing: '0.5px', borderBottom: '2px solid #E2E8F0',
                        }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {attendance.length === 0 ? (
                      <tr><td colSpan={5} style={{ textAlign: 'center', padding: '50px', color: '#94A3B8' }}>No records found</td></tr>
                    ) : attendance.slice(0, 100).map((a, i) => {
                      const empName = employees.find(e => e.uid === a.uid)?.name || a.employeeName || a.uid
                      const statusLabel = a.status === 'checked_out' ? 'Complete' : a.status === 'checked_in' ? 'Checked In' : 'Not Marked'
                      const statusColor = a.status === 'checked_out' ? '#15803D' : a.status === 'checked_in' ? '#007CC2' : '#94A3B8'
                      return (
                        <tr key={i} onMouseEnter={e => e.currentTarget.style.backgroundColor = '#F8FAFC'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'white'}>
                          <td style={{ padding: '13px 18px', fontSize: '13px', fontWeight: '600', color: '#1A2B4A', borderBottom: '1px solid #F1F5F9' }}>{empName}</td>
                          <td style={{ padding: '13px 18px', fontSize: '13px', color: '#64748B', borderBottom: '1px solid #F1F5F9' }}>{a.date}</td>
                          <td style={{ padding: '13px 18px', fontSize: '13px', color: '#64748B', borderBottom: '1px solid #F1F5F9' }}>{a.checkInTime || '—'}</td>
                          <td style={{ padding: '13px 18px', fontSize: '13px', color: '#64748B', borderBottom: '1px solid #F1F5F9' }}>{a.checkOutTime || '—'}</td>
                          <td style={{ padding: '13px 18px', borderBottom: '1px solid #F1F5F9' }}>
                            <span style={{ fontSize: '11px', fontWeight: '600', color: statusColor, backgroundColor: '#F8FAFC', padding: '4px 10px', borderRadius: '6px', textTransform: 'capitalize' }}>{statusLabel}</span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeNav === 'reports' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
              {[
                { title: 'Onboarding Rate', value: `${employees.length > 0 ? Math.round((complete.length / employees.length) * 100) : 0}%`, desc: `${complete.length} of ${employees.length} employees completed`, color: '#007CC2', bg: '#EFF6FF', icon: TrendingUp },
                { title: 'Attendance Rate Today', value: `${employees.length > 0 ? Math.round((todayPresent.length / employees.length) * 100) : 0}%`, desc: `${todayPresent.length} present today`, color: '#059669', bg: '#ECFDF5', icon: CheckSquare },
                { title: 'Leave Approval Rate', value: `${leaves.length > 0 ? Math.round((approved.length / leaves.length) * 100) : 0}%`, desc: `${approved.length} of ${leaves.length} approved`, color: '#7C3AED', bg: '#F5F3FF', icon: Award },
              ].map((r, i) => {
                const Icon = r.icon
                return (
                  <div key={i} style={{ ...card, padding: '24px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '14px', backgroundColor: r.bg, marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon size={24} color={r.color} />
                    </div>
                    <p style={{ fontSize: '36px', fontWeight: '900', color: r.color, margin: '0 0 4px', lineHeight: 1 }}>{r.value}</p>
                    <p style={{ fontSize: '14px', fontWeight: '700', color: '#1A2B4A', margin: '0 0 6px' }}>{r.title}</p>
                    <p style={{ fontSize: '12px', color: '#94A3B8', margin: 0 }}>{r.desc}</p>
                  </div>
                )
              })}
            </div>
          )}

          {activeNav === 'documents' && (
            <div style={{ ...card, padding: '24px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#0F1C2E', margin: '0 0 16px' }}>Employee Document Status</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#F8FAFC' }}>
                    {['Employee', 'Aadhaar', 'PAN', 'Resume', 'Photo', 'Overall'].map(h => (
                      <th key={h} style={{ padding: '12px 14px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #E2E8F0' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {employees.map(emp => (
                    <tr key={emp.uid} onMouseEnter={e => e.currentTarget.style.backgroundColor = '#F8FAFC'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'white'}>
                      <td style={{ padding: '12px 14px', fontSize: '13px', fontWeight: '600', color: '#1A2B4A', borderBottom: '1px solid #F1F5F9' }}>{emp.name}</td>
                      {['aadhaar', 'pan', 'resume', 'photo'].map(doc => (
                        <td key={doc} style={{ padding: '12px 14px', borderBottom: '1px solid #F1F5F9', textAlign: 'center' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '50%', backgroundColor: emp.Documents?.[doc] ? '#DCFCE7' : '#FEF3C7' }}>
                            {emp.Documents?.[doc] ? <Check size={13} color="#15803D" /> : <Clock size={11} color="#B45309" />}
                          </span>
                        </td>
                      ))}
                      <td style={{ padding: '12px 14px', borderBottom: '1px solid #F1F5F9' }}>
                        <span style={{ fontSize: '11px', fontWeight: '700', padding: '3px 10px', borderRadius: '20px', backgroundColor: emp.completion === 100 ? '#DCFCE7' : '#FEF3C7', color: emp.completion === 100 ? '#15803D' : '#B45309' }}>{emp.completion}%</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeNav === 'announcements' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ ...card, padding: '20px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#0F1C2E', margin: '0 0 16px' }}>Post New Announcement</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <input
                    placeholder="Title"
                    value={annTitle}
                    onChange={e => setAnnTitle(e.target.value)}
                    style={{ padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #E2E8F0', fontSize: '13px', outline: 'none' }}
                  />
                  <textarea
                    placeholder="Message"
                    value={annMessage}
                    onChange={e => setAnnMessage(e.target.value)}
                    rows={3}
                    style={{ padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #E2E8F0', fontSize: '13px', outline: 'none', resize: 'vertical' }}
                  />
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <select
                      value={annPriority}
                      onChange={e => setAnnPriority(e.target.value as 'low' | 'medium' | 'high')}
                      style={{ padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #E2E8F0', fontSize: '13px', outline: 'none', flex: 1 }}
                    >
                      <option value="low">Low Priority</option>
                      <option value="medium">Medium Priority</option>
                      <option value="high">High Priority</option>
                    </select>
                    <button onClick={postAnnouncement} style={{ padding: '10px 20px', borderRadius: '8px', backgroundColor: '#007CC2', color: 'white', border: 'none', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>Post</button>
                  </div>
                </div>
              </div>

              <div style={{ ...card, padding: '20px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#0F1C2E', margin: '0 0 16px' }}>Announcements</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {announcements.length === 0 ? (
                    <p style={{ color: '#94A3B8', textAlign: 'center', padding: '20px' }}>No announcements yet</p>
                  ) : announcements.slice().reverse().map(a => (
                    <div key={a.id} style={{ padding: '14px', borderRadius: '10px', backgroundColor: '#F8FAFC', border: '1px solid #F1F5F9' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                        <div>
                          <p style={{ fontSize: '13px', fontWeight: '700', color: '#1A2B4A', margin: 0 }}>{a.title}</p>
                          <span style={{ fontSize: '10px', fontWeight: '600', padding: '2px 8px', borderRadius: '20px', backgroundColor: a.priority === 'high' ? '#FEE2E2' : a.priority === 'medium' ? '#FEF3C7' : '#DCFCE7', color: a.priority === 'high' ? '#DC2626' : a.priority === 'medium' ? '#B45309' : '#15803D', marginTop: '4px' }}>{a.priority.toUpperCase()}</span>
                        </div>
                        <button onClick={() => deleteAnnouncement(a.id)} style={{ padding: '6px', borderRadius: '6px', border: 'none', backgroundColor: '#FEE2E2', cursor: 'pointer' }}>
                          <Trash2 size={14} color="#DC2626" />
                        </button>
                      </div>
                      <p style={{ fontSize: '12px', color: '#64748B', margin: '0 0 8px' }}>{a.message}</p>
                      <p style={{ fontSize: '11px', color: '#94A3B8', margin: 0 }}>{new Date(a.createdAt).toLocaleDateString('en-IN')}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeNav === 'holidays' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ ...card, padding: '20px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#0F1C2E', margin: '0 0 16px' }}>Add Holiday</h3>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <input
                    placeholder="Holiday name"
                    value={holidayName}
                    onChange={e => setHolidayName(e.target.value)}
                    style={{ flex: 2, padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #E2E8F0', fontSize: '13px', outline: 'none' }}
                  />
                  <input
                    type="date"
                    value={holidayDate}
                    onChange={e => setHolidayDate(e.target.value)}
                    style={{ flex: 1, padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #E2E8F0', fontSize: '13px', outline: 'none' }}
                  />
                  <select
                    value={holidayType}
                    onChange={e => setHolidayType(e.target.value as 'public' | 'optional')}
                    style={{ flex: 1, padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #E2E8F0', fontSize: '13px', outline: 'none' }}
                  >
                    <option value="public">Public</option>
                    <option value="optional">Optional</option>
                  </select>
                  <button onClick={addHoliday} style={{ padding: '10px 20px', borderRadius: '8px', backgroundColor: '#007CC2', color: 'white', border: 'none', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>Add</button>
                </div>
              </div>

              <div style={{ ...card, padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#0F1C2E', margin: 0 }}>Holidays</h3>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#64748B' }}>
                    <input type="checkbox" checked={showPastHolidays} onChange={e => setShowPastHolidays(e.target.checked)} />
                    Show past holidays
                  </label>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#F8FAFC' }}>
                      {['Holiday', 'Date', 'Type', 'Action'].map(h => (
                        <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #E2E8F0' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {holidays.filter(h => showPastHolidays || h.date >= today).length === 0 ? (
                      <tr><td colSpan={4} style={{ textAlign: 'center', padding: '20px', color: '#94A3B8' }}>No upcoming holidays</td></tr>
                    ) : holidays.filter(h => showPastHolidays || h.date >= today).map(h => (
                      <tr key={h.id} onMouseEnter={e => e.currentTarget.style.backgroundColor = '#F8FAFC'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'white'}>
                        <td style={{ padding: '10px 12px', fontSize: '13px', fontWeight: '600', color: '#1A2B4A', borderBottom: '1px solid #F1F5F9' }}>{h.name}</td>
                        <td style={{ padding: '10px 12px', fontSize: '12px', color: '#64748B', borderBottom: '1px solid #F1F5F9' }}>{h.date}</td>
                        <td style={{ padding: '10px 12px', borderBottom: '1px solid #F1F5F9' }}>
                          <span style={{ fontSize: '11px', fontWeight: '600', padding: '2px 8px', borderRadius: '20px', backgroundColor: h.type === 'public' ? '#EFF6FF' : '#ECFDF5', color: h.type === 'public' ? '#1D4ED8' : '#15803D' }}>{h.type}</span>
                        </td>
                        <td style={{ padding: '10px 12px', borderBottom: '1px solid #F1F5F9' }}>
                          <button onClick={() => deleteHoliday(h.id)} style={{ padding: '6px', borderRadius: '6px', border: 'none', backgroundColor: '#FEE2E2', cursor: 'pointer' }}>
                            <Trash2 size={14} color="#DC2626" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeNav === 'audit' && (
            <div style={{ ...card, padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#0F1C2E', margin: 0 }}>Audit Log</h3>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button disabled={auditPage === 1} onClick={() => setAuditPage(p => Math.max(1, p - 1))} style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #E2E8F0', backgroundColor: 'white', fontSize: '12px', cursor: 'pointer' }}>Prev</button>
                  <span style={{ fontSize: '12px', color: '#94A3B8', padding: '6px 12px' }}>Page {auditPage}</span>
                  <button disabled={auditPage * auditPageSize >= auditLogs.length} onClick={() => setAuditPage(p => p + 1)} style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #E2E8F0', backgroundColor: 'white', fontSize: '12px', cursor: 'pointer' }}>Next</button>
                </div>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#F8FAFC' }}>
                    {['Action', 'Details', 'Admin', 'Timestamp'].map(h => (
                      <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #E2E8F0' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.slice((auditPage - 1) * auditPageSize, auditPage * auditPageSize).length === 0 ? (
                    <tr><td colSpan={4} style={{ textAlign: 'center', padding: '40px', color: '#94A3B8' }}>No audit logs</td></tr>
                  ) : auditLogs.slice((auditPage - 1) * auditPageSize, auditPage * auditPageSize).map(log => (
                    <tr key={log.id} onMouseEnter={e => e.currentTarget.style.backgroundColor = '#F8FAFC'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'white'}>
                      <td style={{ padding: '10px 12px', fontSize: '12px', fontWeight: '600', color: '#1A2B4A', borderBottom: '1px solid #F1F5F9' }}>{log.action}</td>
                      <td style={{ padding: '10px 12px', fontSize: '12px', color: '#64748B', borderBottom: '1px solid #F1F5F9' }}>{log.details}</td>
                      <td style={{ padding: '10px 12px', fontSize: '12px', color: '#94A3B8', borderBottom: '1px solid #F1F5F9' }}>{log.admin}</td>
                      <td style={{ padding: '10px 12px', fontSize: '12px', color: '#94A3B8', borderBottom: '1px solid #F1F5F9' }}>{new Date(log.timestamp).toLocaleDateString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeNav === 'support' && (
            <div style={{ ...card, padding: '20px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#0F1C2E', margin: '0 0 16px' }}>Support Tickets</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#F8FAFC' }}>
                    {['Employee', 'Subject', 'Priority', 'Status', 'Action'].map(h => (
                      <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #E2E8F0' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tickets.length === 0 ? (
                    <tr><td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: '#94A3B8' }}>No support tickets</td></tr>
                  ) : tickets.map(t => (
                    <tr key={t.id} onMouseEnter={e => e.currentTarget.style.backgroundColor = '#F8FAFC'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'white'}>
                      <td style={{ padding: '10px 12px', fontSize: '12px', fontWeight: '600', color: '#1A2B4A', borderBottom: '1px solid #F1F5F9' }}>{t.employeeName}</td>
                      <td style={{ padding: '10px 12px', fontSize: '12px', color: '#64748B', borderBottom: '1px solid #F1F5F9' }}>{t.subject}</td>
                      <td style={{ padding: '10px 12px', borderBottom: '1px solid #F1F5F9' }}>
                        <span style={{ fontSize: '11px', fontWeight: '600', padding: '2px 8px', borderRadius: '20px', backgroundColor: t.priority === 'high' ? '#FEE2E2' : t.priority === 'medium' ? '#FEF3C7' : '#DCFCE7', color: t.priority === 'high' ? '#DC2626' : t.priority === 'medium' ? '#B45309' : '#15803D' }}>{t.priority}</span>
                      </td>
                      <td style={{ padding: '10px 12px', borderBottom: '1px solid #F1F5F9' }}>
                        <span style={{ fontSize: '11px', fontWeight: '600', padding: '2px 8px', borderRadius: '20px', backgroundColor: t.status === 'open' ? '#FEF3C7' : t.status === 'in-progress' ? '#EFF6FF' : '#DCFCE7', color: t.status === 'open' ? '#B45309' : t.status === 'in-progress' ? '#1D4ED8' : '#15803D' }}>{t.status}</span>
                      </td>
                      <td style={{ padding: '10px 12px', borderBottom: '1px solid #F1F5F9' }}>
                        <select
                          value={t.status}
                          onChange={e => updateTicketStatus(t.id, e.target.value as SupportTicket['status'])}
                          style={{ padding: '6px 8px', borderRadius: '6px', border: '1px solid #E2E8F0', fontSize: '11px', outline: 'none' }}
                        >
                          <option value="open">Open</option>
                          <option value="in-progress">In Progress</option>
                          <option value="resolved">Resolved</option>
                          <option value="closed">Closed</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {selectedEmployees.length > 0 && (
            <div style={{ position: 'fixed', bottom: '20px', left: 'calc(50% + 110px)', transform: 'translateX(-50%)', backgroundColor: '#0F1C2E', borderRadius: '16px', padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.3)', zIndex: 100 }}>
              <span style={{ color: 'white', fontSize: '13px', fontWeight: '600' }}>{selectedEmployees.length} selected</span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button style={{ padding: '6px 12px', borderRadius: '8px', backgroundColor: '#EF4444', color: 'white', border: 'none', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>Delete</button>
                <button style={{ padding: '6px 12px', borderRadius: '8px', backgroundColor: '#007CC2', color: 'white', border: 'none', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>Message</button>
                <button onClick={() => setSelectedEmployees([])} style={{ padding: '6px 12px', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>Cancel</button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}