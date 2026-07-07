import { useEffect, useState } from 'react'
import { ref, onValue } from 'firebase/database'
import { db } from '../../firebase/config'
import { useAuth } from '../../hooks/useAuth'
import PageLayout from '../../components/PageLayout'
import { Mail, Download, CheckCircle2, AlertCircle } from 'lucide-react'

export default function OfferLetterPage() {
  const { uid } = useAuth()
  const [offerLetter, setOfferLetter] = useState<{ url: string, sentAt: string } | null>(null)

  useEffect(() => {
    if (!uid) return
    const unsub = onValue(ref(db, `Employees/${uid}/OfferLetter`), snap => {
      setOfferLetter(snap.exists() ? snap.val() : null)
    }, (err) => {
      console.error('[OfferLetterPage] DB error:', err)
    })
    return () => unsub()
  }, [uid])

  return (
    <PageLayout title="Offer Letter" subtitle="Your employment offer">
      <div style={{
        backgroundColor: 'white', borderRadius: '16px',
        padding: '40px 20px', textAlign: 'center',
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
      }}>
        {offerLetter ? (
          <>
            <CheckCircle2 size={48} color="#059669" style={{ margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1A2B4A', margin: '0 0 8px' }}>
              Offer Letter Available
            </h3>
            <p style={{ fontSize: '13px', color: '#94A3B8', margin: '0 0 16px' }}>
              Sent on {new Date(offerLetter.sentAt).toLocaleDateString()}
            </p>
            <button onClick={async () => {
              try {
                const response = await fetch(offerLetter.url)
                const blob = await response.blob()
                const blobUrl = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = blobUrl
                a.download = 'offer-letter.pdf'
                document.body.appendChild(a)
                a.click()
                document.body.removeChild(a)
                URL.revokeObjectURL(blobUrl)
              } catch (err) { console.error('Download failed:', err) }
            }} style={{
              padding: '10px 20px', borderRadius: '8px',
              backgroundColor: '#007CC2', color: 'white',
              border: 'none', fontSize: '13px', fontWeight: '600',
              cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px',
            }}>
              <Download size={16} /> Download Offer Letter
            </button>
          </>
        ) : (
          <>
            <AlertCircle size={48} color="#CBD5E1" style={{ margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1A2B4A', margin: '0 0 8px' }}>
              No offer letter available
            </h3>
            <p style={{ fontSize: '13px', color: '#94A3B8', margin: 0, lineHeight: '1.4' }}>
              Your offer letter will appear here once uploaded by admin
            </p>
          </>
        )}
      </div>
    </PageLayout>
  )
}