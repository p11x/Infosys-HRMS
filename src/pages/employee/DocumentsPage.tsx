import { useEffect, useState } from 'react'
import { ref, set, onValue } from 'firebase/database'
import { db } from '../../firebase/config'
import { storage, STORAGE_READY } from '../../firebase/config'
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'
import { useAuth } from '../../hooks/useAuth'
import PageLayout from '../../components/PageLayout'
import { FileText, Check, Download, DollarSign, Mail, Clock } from 'lucide-react'
import toast from 'react-hot-toast'

export default function DocumentsPage() {
  const { uid } = useAuth()
  const [documents, setDocuments] = useState<Record<string, string>>({})
  const [offerLetter, setOfferLetter] = useState<{ url: string, sentAt: string } | null>(null)
  const [payslips, setPayslips] = useState<Record<string, { url: string, period: string, sentAt: string }>>({})
  const [uploading, setUploading] = useState<string | null>(null)

  useEffect(() => {
    if (!uid) return
    const unsub = onValue(ref(db, `Employees/${uid}`), snap => {
      const data = snap.exists() ? snap.val() : {}
      setDocuments(data.Documents || {})
      setOfferLetter(data.OfferLetter || null)
      setPayslips(data.Payslips || {})
    }, (err) => {
      console.error('[DocumentsPage] Realtime error:', err)
      toast.error('Failed to load document status')
    })
    return () => unsub()
  }, [uid])

  const handleUpload = async (field: string, file: File) => {
    if (!uid) return
    if (!STORAGE_READY) { toast.error('Storage not configured'); return }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File must be under 5MB')
      return
    }
    setUploading(field)
    try {
      const sRef = storageRef(storage, `Documents/${uid}/${field}_${file.name}`)
      await uploadBytes(sRef, file)
      const url = await getDownloadURL(sRef)
      await set(ref(db, `Employees/${uid}/Documents/${field}`), url)
      setDocuments(p => ({ ...p, [field]: url }))
      toast.success(`${field} uploaded`)
    } catch (e: any) { toast.error('Upload failed: ' + e.message) }
    finally { setUploading(null) }
  }

  const documentFields = [
    { key: 'aadhaar', label: 'Aadhaar Card' },
    { key: 'pan', label: 'PAN Card' },
    { key: 'resume', label: 'Resume' },
    { key: 'photo', label: 'Photo' },
  ]

return (
    <PageLayout title="Documents" subtitle="Manage your documents">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#0F1C2E', margin: '0 0 12px' }}>
            Send to Company
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {documentFields.map(field => (
              <div key={field.key} style={{
                backgroundColor: 'white', borderRadius: '16px',
                padding: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '40px', height: '40px', borderRadius: '10px',
                      backgroundColor: '#EFF6FF', display: 'flex',
                      alignItems: 'center', justifyContent: 'center',
                    }}>
                      <FileText size={18} color="#007CC2" />
                    </div>
                    <div>
                      <p style={{ fontWeight: '600', fontSize: '14px', color: '#1A2B4A', margin: 0 }}>
                        {field.label}
                      </p>
                      <p style={{ fontSize: '12px', color: documents[field.key] ? '#16A34A' : '#94A3B8', margin: 0 }}>
                        {documents[field.key] ? <><Check size={14} style={{ display: 'inline', marginRight: '4px' }} /> Uploaded</> : 'Not uploaded'}
                      </p>
                    </div>
                  </div>
                  <label style={{
                    padding: '8px 14px', borderRadius: '8px', cursor: 'pointer',
                    backgroundColor: documents[field.key] ? '#F0FDF4' : '#EFF6FF',
                    color: documents[field.key] ? '#16A34A' : '#007CC2',
                    fontSize: '13px', fontWeight: '600',
                    border: `1px solid ${documents[field.key] ? '#86EFAC' : '#BFDBFE'}`,
                  }}>
                    {documents[field.key] ? 'Replace' : 'Upload'}
                    <input type="file" style={{ display: 'none' }}
                      onChange={e => { const f = e.target.files?.[0]; if (f) handleUpload(field.key, f) }}
                      disabled={uploading === field.key}
                    />
                  </label>
                </div>
                {uploading === field.key && (
                  <p style={{ fontSize: '12px', color: '#94A3B8', marginTop: '8px', marginBottom: 0 }}>Uploading...</p>
                )}
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#0F1C2E', margin: '0 0 12px' }}>
            Received from Company
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{
              backgroundColor: 'white', borderRadius: '16px',
              padding: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '40px', height: '40px', borderRadius: '10px',
                  backgroundColor: offerLetter ? '#F0FDF4' : '#F8FAFC',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Mail size={18} color={offerLetter ? '#059669' : '#94A3B8'} />
                </div>
                <div>
                  <p style={{ fontWeight: '600', fontSize: '14px', color: '#1A2B4A', margin: 0 }}>
                    Offer Letter
                  </p>
                  <p style={{ fontSize: '12px', color: '#94A3B8', margin: 0 }}>
                    {offerLetter ? `Sent: ${new Date(offerLetter.sentAt).toLocaleDateString()}` : 'Not yet received'}
                  </p>
                </div>
              </div>
              {offerLetter && (
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
                  padding: '8px 14px', borderRadius: '8px',
                  backgroundColor: '#ECFDF5', border: '1px solid #86EFAC',
                  color: '#15803D', fontSize: '13px', fontWeight: '600',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px',
                }}>
                  <Download size={14} /> Download
                </button>
              )}
            </div>

            <div style={{
              backgroundColor: 'white', borderRadius: '16px',
              padding: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div style={{
                  width: '40px', height: '40px', borderRadius: '10px',
                  backgroundColor: Object.keys(payslips).length > 0 ? '#F0FDF4' : '#F8FAFC',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <DollarSign size={18} color={Object.keys(payslips).length > 0 ? '#059669' : '#94A3B8'} />
                </div>
                <div>
                  <p style={{ fontWeight: '600', fontSize: '14px', color: '#1A2B4A', margin: 0 }}>
                    Payslips ({Object.keys(payslips).length})
                  </p>
                  <p style={{ fontSize: '12px', color: '#94A3B8', margin: 0 }}>
                    {Object.keys(payslips).length > 0 ? 'Available for download' : 'Not yet received'}
                  </p>
                </div>
              </div>
              {Object.keys(payslips).length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {Object.entries(payslips).map(([id, p]) => (
                    <div key={id} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '8px 12px', borderRadius: '8px',
                      backgroundColor: '#F8FAFC',
                    }}>
                      <span style={{ fontSize: '13px', color: '#1A2B4A' }}>{p.period}</span>
                      <button onClick={async () => {
                        try {
                          const response = await fetch(p.url)
                          const blob = await response.blob()
                          const blobUrl = URL.createObjectURL(blob)
                          const a = document.createElement('a')
                          a.href = blobUrl
                          a.download = `payslip-${p.period}.pdf`
                          document.body.appendChild(a)
                          a.click()
                          document.body.removeChild(a)
                          URL.revokeObjectURL(blobUrl)
                        } catch (err) { console.error('Download failed:', err) }
                      }} style={{
                        padding: '6px 10px', borderRadius: '6px',
                        backgroundColor: '#ECFDF5', border: '1px solid #86EFAC',
                        color: '#15803D', fontSize: '12px', fontWeight: '600',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px',
                      }}>
                        <Download size={12} /> Download
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: '12px', color: '#94A3B8', fontStyle: 'italic' }}>No payslips received yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}