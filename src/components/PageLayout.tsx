import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

interface PageLayoutProps {
  title: string
  children: React.ReactNode
  subtitle?: string
}

export default function PageLayout({ title, children, subtitle }: PageLayoutProps) {
  const navigate = useNavigate()

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F0F2F5' }}>
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 40,
        height: '56px', backgroundColor: '#007CC2',
        display: 'flex', alignItems: 'center', padding: '0 16px', gap: '12px',
        boxShadow: '0 2px 8px rgba(0,124,194,0.3)',
      }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            background: 'rgba(255,255,255,0.15)', border: 'none',
            borderRadius: '8px', padding: '6px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', color: 'white', flexShrink: 0,
          }}
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <p style={{ color: 'white', fontWeight: '700', fontSize: '15px', margin: 0, lineHeight: '1.2' }}>
            {title}
          </p>
          {subtitle && (
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '11px', margin: 0 }}>
              {subtitle}
            </p>
          )}
        </div>
      </nav>

      <div style={{
        paddingTop: '72px', paddingBottom: '40px',
        maxWidth: '680px', margin: '0 auto', padding: '72px 20px 40px',
      }}>
        {children}
      </div>
    </div>
  )
}