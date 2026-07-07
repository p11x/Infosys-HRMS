import { useEffect, useState } from 'react'
import { ref, onValue, update, push } from 'firebase/database'
import { db } from '../../firebase/config'
import { useAuth } from '../../hooks/useAuth'
import PageLayout from '../../components/PageLayout'
import { Bell, Calendar, CheckCircle2, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

interface Announcement {
  id: string
  title: string
  message: string
  priority: 'low' | 'medium' | 'high'
  createdAt: string
}

interface LeaveUpdate {
  leaveId: string
  fromDate: string
  toDate: string
  reason: string
  status: 'Pending' | 'Approved' | 'Rejected'
  name?: string
}

interface Message {
  id: string
  from: 'admin' | 'system'
  text: string
  timestamp: string
  read: boolean
}

interface NotificationItem {
  id: string
  type: 'leave' | 'announcement' | 'message'
  title: string
  content: string
  timestamp: string
  read: boolean
  status?: 'Pending' | 'Approved' | 'Rejected'
  priority?: 'low' | 'medium' | 'high'
  url?: string
}

export default function NotificationsPage() {
  const { uid } = useAuth()
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!uid) return
    
    const unsubMessages = onValue(ref(db, `Messages/${uid}`), snap => {
      const messages = snap.exists() ? Object.keys(snap.val()).map(id => ({
        id,
        type: 'message' as const,
        title: 'Message from Admin',
        content: snap.val()[id].text,
        timestamp: snap.val()[id].timestamp,
        read: snap.val()[id].read,
        from: snap.val()[id].from,
      })) : []
      updateNotifications(messages, 'message')
    }, (err) => {
      console.error('[NotificationsPage] Messages DB error:', err)
    })

    const unsubLeaves = onValue(ref(db, 'LeaveRequests'), snap => {
      if (!snap.exists()) return
      const leaves = Object.keys(snap.val())
        .filter(id => snap.val()[id].uid === uid)
        .map(id => ({
          id,
          type: 'leave' as const,
          title: 'Leave Request Update',
          content: `${snap.val()[id].fromDate} → ${snap.val()[id].toDate}: ${snap.val()[id].reason}`,
          timestamp: snap.val()[id].fromDate,
          read: snap.val()[id].status !== 'Pending',
          status: snap.val()[id].status,
        }))
      updateNotifications(leaves, 'leave')
    }, (err) => {
      console.error('[NotificationsPage] LeaveRequests DB error:', err)
    })

    const unsubAnnouncements = onValue(ref(db, 'Announcements'), snap => {
      if (!snap.exists()) return
      const announcements = Object.keys(snap.val()).map(id => ({
        id,
        type: 'announcement' as const,
        title: snap.val()[id].title,
        content: snap.val()[id].message,
        timestamp: snap.val()[id].createdAt,
        read: true,
        priority: snap.val()[id].priority,
      }))
      updateNotifications(announcements, 'announcement')
    }, (err) => {
      console.error('[NotificationsPage] Announcements DB error:', err)
    })

    const updateNotifications = (items: NotificationItem[], type: string) => {
      setNotifications(prev => {
        const filtered = prev.filter(n => n.type !== type)
        const merged = [...filtered, ...items]
        return merged.sort((a, b) => b.timestamp.localeCompare(a.timestamp))
      })
      setLoading(false)
    }

    return () => { unsubMessages(); unsubLeaves(); unsubAnnouncements() }
  }, [uid])

  const markAsRead = async (id: string, type: string) => {
    if (type === 'message') {
      try {
        await update(ref(db, `Messages/${uid}/${id}`), { read: true })
      } catch (err) {
        console.error('Failed to mark read:', err)
      }
    }
  }

  const unreadCount = notifications.filter(n => !n.read).length

  if (loading) return (
    <PageLayout title="Notifications" subtitle="Your alerts and updates">
      <p style={{ color: '#94A3B8', textAlign: 'center', padding: '40px' }}>Loading...</p>
    </PageLayout>
  )

  return (
    <PageLayout title="Notifications" subtitle="Your alerts and updates">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {notifications.length === 0 ? (
          <div style={{
            backgroundColor: 'white', borderRadius: '16px', padding: '40px 20px',
            textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
          }}>
            <Bell size={32} color="#CBD5E1" style={{ margin: '0 auto 12px' }} />
            <p style={{ fontSize: '14px', color: '#94A3B8', margin: 0 }}>No notifications yet</p>
          </div>
        ) : (
          <div style={{ backgroundColor: 'white', borderRadius: '16px',
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'hidden',
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ backgroundColor: '#F8FAFC' }}>
                <tr>
                  <th style={{ padding: '12px 16px', textAlign: 'left',
                    fontSize: '12px', fontWeight: '600', color: '#64748B' }}>Type</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left',
                    fontSize: '12px', fontWeight: '600', color: '#64748B' }}>Details</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left',
                    fontSize: '12px', fontWeight: '600', color: '#64748B' }}>Date</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left',
                    fontSize: '12px', fontWeight: '600', color: '#64748B' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {notifications.map(n => (
                  <tr key={`${n.type}-${n.id}`} style={{ borderTop: '1px solid #F1F5F9' }}
                    onClick={() => markAsRead(n.id, n.type)}>
                    <td style={{ padding: '12px 16px', fontSize: '14px', color: '#1A2B4A' }}>
                      {n.type === 'leave' && <Calendar size={14} color="#007CC2" />}
                      {n.type === 'announcement' && <Bell size={14} color="#7C3AED" />}
                      {n.type === 'message' && <Bell size={14} color="#15803D" />}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '14px', color: '#1A2B4A' }}>
                      <p style={{ fontWeight: '600', margin: '0 0 2px' }}>{n.title}</p>
                      <p style={{ fontSize: '12px', color: '#64748B', margin: 0 }}>{n.content}</p>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '14px', color: '#64748B' }}>
                      {n.timestamp}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '14px' }}>
                      {n.type === 'leave' && (
                        <span style={{
                          fontSize: '11px', fontWeight: '600',
                          padding: '4px 10px', borderRadius: '6px',
                          backgroundColor: n.status === 'Approved' ? '#ECFDF5' : n.status === 'Rejected' ? '#FEF2F2' : '#FFFBEB',
                          color: n.status === 'Approved' ? '#15803D' : n.status === 'Rejected' ? '#DC2626' : '#B45309',
                        }}>
                          {n.status}
                        </span>
                      )}
                      {n.type === 'announcement' && (
                        <span style={{
                          fontSize: '11px', fontWeight: '600',
                          padding: '4px 10px', borderRadius: '6px',
                          backgroundColor: n.priority === 'high' ? '#FEF2F2' : n.priority === 'medium' ? '#FFFBEB' : '#F0FDF4',
                          color: n.priority === 'high' ? '#DC2626' : n.priority === 'medium' ? '#B45309' : '#15803D',
                        }}>
                          {n.priority?.toUpperCase()}
                        </span>
                      )}
                      {n.type === 'message' && (
                        <span style={{
                          fontSize: '11px', fontWeight: '600',
                          padding: '4px 10px', borderRadius: '6px',
                          backgroundColor: n.read ? '#F8FAFC' : '#EFF6FF',
                          color: n.read ? '#94A3B8' : '#007CC2',
                        }}>
                          {n.read ? 'Read' : 'Unread'}
                        </span>
                      )}
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