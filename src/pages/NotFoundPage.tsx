import { useNavigate } from 'react-router-dom'
export default function NotFoundPage() {
  const navigate = useNavigate()
  return (
    <div style={{ display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      height: '100vh', fontFamily: 'Inter, sans-serif',
      backgroundColor: '#F0F4F8', textAlign: 'center' }}>
      <p style={{ fontSize: '80px', fontWeight: '900',
        color: '#E2E8F0', margin: '0 0 8px' }}>404</p>
      <h2 style={{ color: '#0F1C2E', margin: '0 0 8px' }}>Page not found</h2>
      <p style={{ color: '#94A3B8', marginBottom: '24px' }}>
        The page you're looking for doesn't exist.
      </p>
      <button onClick={() => navigate(-1)} style={{
        padding: '12px 24px', backgroundColor: '#007CC2',
        color: 'white', border: 'none', borderRadius: '10px',
        fontSize: '14px', fontWeight: '700', cursor: 'pointer',
      }}>Go Back</button>
    </div>
  )
}