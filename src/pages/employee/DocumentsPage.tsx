import { useEffect, useState } from 'react'
import { ref, get, set } from 'firebase/database'
import { db } from '../../firebase/config'
import { storage, STORAGE_READY } from '../../firebase/config'
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'
import { useAuth } from '../../hooks/useAuth'
import PageLayout from '../../components/PageLayout'
import { FileText, Check } from 'lucide-react'
import toast from 'react-hot-toast'

export default function DocumentsPage() {
  const { uid } = useAuth()
  const [documents, setDocuments] = useState<Record<string, string>>({})
  const [uploading, setUploading] = useState<string | null>(null)

  useEffect(() => {
    if (!uid) return
    get(ref(db, `Employees/${uid}`)).then(snap => {
      if (snap.exists()) {
        const d = snap.val()
        if (d.Documents) setDocuments(d.Documents)
      }
    }).catch(() => toast.error('Failed to load data'))
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
    <PageLayout title="Documents" subtitle="Upload required documents">
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
    </PageLayout>
  )
}