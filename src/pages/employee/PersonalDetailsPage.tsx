import { useEffect, useState } from 'react'
import { ref, get, set } from 'firebase/database'
import { storage, STORAGE_READY } from '../../firebase/config'
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'
import { db } from '../../firebase/config'
import { useAuth } from '../../hooks/useAuth'
import PageLayout from '../../components/PageLayout'
import { Camera, User } from 'lucide-react'
import toast from 'react-hot-toast'

export default function PersonalDetailsPage() {
  const { uid } = useAuth()
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [photoURL, setPhotoURL] = useState<string | null>(null)
  const [form, setForm] = useState({
    name: '', phone: '', whatsapp: '',
    email: '', dob: '', address: '', gender: '',
  })

  useEffect(() => {
    if (!uid) return
    get(ref(db, `Employees/${uid}`)).then(snap => {
      if (snap.exists()) {
        const d = snap.val()
        setForm({
          name: d.name || '', phone: d.phone || '',
          whatsapp: d.whatsapp || '', email: d.email || '',
          dob: d.dob || '', address: d.address || '',
          gender: d.gender || '',
        })
        if (d.profilePhoto) setPhotoURL(d.profilePhoto)
      }
    })
  }, [uid])

  const handlePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !uid) return
    if (!STORAGE_READY) { toast.error('Storage not configured'); return }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB')
      return
    }
    setUploading(true)
    try {
      const sRef = storageRef(storage, `ProfilePhotos/${uid}.jpg`)
      await uploadBytes(sRef, file)
      const url = await getDownloadURL(sRef)
      await set(ref(db, `Employees/${uid}/profilePhoto`), url)
      setPhotoURL(url)
      toast.success('Photo updated!')
    } catch (e: any) { toast.error('Upload failed: ' + e.message) }
    finally { setUploading(false) }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!uid) return
    if (!form.name || !form.phone || !form.email) {
      toast.error('Name, phone and email are required')
      return
    }
    setLoading(true)
    try {
      await set(ref(db, `Employees/${uid}`), { ...form, uid, profilePhoto: photoURL || '' })
      toast.success('Personal details saved!')
    } catch { toast.error('Save failed') }
    finally { setLoading(false) }
  }

  const initials = form.name
    ? form.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'E'

  return (
    <PageLayout title="Personal Details" subtitle="Update your personal information">

      <div style={{
        backgroundColor: 'white', borderRadius: '16px',
        padding: '20px', marginBottom: '16px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px',
      }}>
        <div style={{ position: 'relative' }}>
          <div style={{
            width: '80px', height: '80px', borderRadius: '50%',
            backgroundColor: '#EFF6FF', border: '3px solid #007CC2',
            overflow: 'hidden', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
          }}>
            {photoURL
              ? <img src={photoURL} alt="profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <span style={{ fontSize: '24px', fontWeight: '700', color: '#007CC2' }}>{initials}</span>
            }
          </div>
          <label style={{
            position: 'absolute', bottom: 0, right: 0,
            width: '28px', height: '28px', borderRadius: '50%',
            backgroundColor: '#007CC2', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '2px solid white',
          }}>
            <Camera size={14} color="white" />
            <input type="file" accept="image/*" onChange={handlePhoto} style={{ display: 'none' }} />
          </label>
        </div>
        <p style={{ fontSize: '13px', color: '#94A3B8', margin: 0 }}>
          {uploading ? 'Uploading...' : 'Tap camera to change photo'}
        </p>
      </div>

      <form onSubmit={handleSave}>
        <div style={{
          backgroundColor: 'white', borderRadius: '16px',
          padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
          display: 'flex', flexDirection: 'column', gap: '16px',
        }}>

          {[
            { key: 'name', label: 'Full Name', type: 'text', placeholder: 'Enter your full name', required: true },
            { key: 'phone', label: 'Phone Number', type: 'tel', placeholder: 'Enter phone number', required: true },
            { key: 'whatsapp', label: 'WhatsApp Number', type: 'tel', placeholder: 'Enter WhatsApp number' },
            { key: 'email', label: 'Email Address', type: 'email', placeholder: 'Enter email address', required: true },
            { key: 'dob', label: 'Date of Birth', type: 'date', placeholder: '' },
          ].map(field => (
            <div key={field.key}>
              <label style={{
                fontSize: '12px', fontWeight: '600', color: '#64748B',
                textTransform: 'uppercase', letterSpacing: '0.5px',
                display: 'block', marginBottom: '6px',
              }}>
                {field.label} {field.required && <span style={{ color: '#EF4444' }}>*</span>}
              </label>
              <input
                type={field.type}
                placeholder={field.placeholder}
                value={form[field.key as keyof typeof form]}
                onChange={e => setForm(p => ({ ...p, [field.key]: e.target.value }))}
                style={{
                  width: '100%', padding: '12px 14px',
                  borderRadius: '10px', fontSize: '14px',
                  border: '1.5px solid #E2E8F0', outline: 'none',
                  backgroundColor: '#F8FAFC', color: '#1A2B4A',
                  boxSizing: 'border-box', transition: 'border-color 0.2s',
                }}
                onFocus={e => e.target.style.borderColor = '#007CC2'}
                onBlur={e => e.target.style.borderColor = '#E2E8F0'}
              />
            </div>
          ))}

          <div>
            <label style={{
              fontSize: '12px', fontWeight: '600', color: '#64748B',
              textTransform: 'uppercase', letterSpacing: '0.5px',
              display: 'block', marginBottom: '6px',
            }}>Address</label>
            <textarea
              placeholder="Enter your address"
              value={form.address}
              rows={3}
              onChange={e => setForm(p => ({ ...p, address: e.target.value }))}
              style={{
                width: '100%', padding: '12px 14px',
                borderRadius: '10px', fontSize: '14px',
                border: '1.5px solid #E2E8F0', outline: 'none',
                backgroundColor: '#F8FAFC', color: '#1A2B4A',
                resize: 'none', boxSizing: 'border-box',
                fontFamily: 'inherit',
              }}
              onFocus={e => e.target.style.borderColor = '#007CC2'}
              onBlur={e => e.target.style.borderColor = '#E2E8F0'}
            />
          </div>

          <div>
            <label style={{
              fontSize: '12px', fontWeight: '600', color: '#64748B',
              textTransform: 'uppercase', letterSpacing: '0.5px',
              display: 'block', marginBottom: '8px',
            }}>Gender</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              {['Male', 'Female', 'Other'].map(g => (
                <button
                  key={g} type="button"
                  onClick={() => setForm(p => ({ ...p, gender: g }))}
                  style={{
                    flex: 1, padding: '10px', borderRadius: '10px',
                    border: `1.5px solid ${form.gender === g ? '#007CC2' : '#E2E8F0'}`,
                    backgroundColor: form.gender === g ? '#EFF6FF' : '#F8FAFC',
                    color: form.gender === g ? '#007CC2' : '#64748B',
                    fontSize: '14px', fontWeight: form.gender === g ? '600' : '400',
                    cursor: 'pointer', transition: 'all 0.2s',
                  }}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit" disabled={loading}
            style={{
              width: '100%', padding: '14px',
              borderRadius: '12px', border: 'none',
              backgroundColor: loading ? '#93C5FD' : '#007CC2',
              color: 'white', fontSize: '15px', fontWeight: '700',
              cursor: loading ? 'not-allowed' : 'pointer',
              letterSpacing: '0.5px', marginTop: '4px',
              transition: 'background-color 0.2s',
            }}
          >
            {loading ? 'Saving...' : 'Save Details'}
          </button>
        </div>
      </form>
    </PageLayout>
  )
}