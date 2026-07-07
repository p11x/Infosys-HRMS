import { DB_READY, STORAGE_READY } from '../firebase/config'

export default function DBBanner() {
  if (DB_READY && STORAGE_READY) return null
  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 999,
      backgroundColor: '#FEF3C7', borderTop: '1px solid #FCD34D',
      padding: '8px 20px', display: 'flex',
      alignItems: 'center', justifyContent: 'center', gap: '8px',
    }}>
      <span style={{ fontSize: '14px' }}>⚠️</span>
      <p style={{ fontSize: '12px', fontWeight: '600', color: '#92400E', margin: 0 }}>
        {!DB_READY && 'Database not yet configured. '}
        {!STORAGE_READY && 'Storage not yet configured. '}
        Some features unavailable.
      </p>
    </div>
  )
}