import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ref, onValue, set, push } from 'firebase/database'
import { db } from '../../firebase/config'
import { storage, STORAGE_READY } from '../../firebase/config'
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'
import {
  ArrowLeft, Mail, Phone, MapPin, Calendar,
  GraduationCap, CreditCard, FileText, Download,
  Eye, User as UserIcon, CheckCircle2, XCircle,
  Paperclip, Upload, DollarSign
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminEmployeeDetailPage() {
  const { uid } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [uploadingOffer, setUploadingOffer] = useState(false)
  const [uploadingPayslip, setUploadingPayslip] = useState(false)

  useEffect(() => {
    if (!uid) return
    const unsub = onValue(ref(db, `Employees/${uid}`), snap => {
      setData(snap.exists() ? snap.val() : {})
      setLoading(false)
    }, (err) => {
      console.error('[AdminEmployeeDetailPage] DB error:', err)
      setLoading(false)
    })
    return () => unsub()
  }, [uid])

  const handleSendOfferLetter = async (file: File) => {
    if (!uid) return
    if (!STORAGE_READY) { toast.error('Storage not configured'); return }
    setUploadingOffer(true)
    try {
      const sRef = storageRef(storage, `OfferLetters/${uid}/${file.name}`)
      await uploadBytes(sRef, file)
      const url = await getDownloadURL(sRef)
      await set(ref(db, `Employees/${uid}/OfferLetter`), { url, sentAt: new Date().toISOString() })
      toast.success('Offer letter sent')
    } catch (e: any) { toast.error('Failed: ' + e.message) }
    setUploadingOffer(false)
  }

  const handleSendPayslip = async (file: File) => {
    if (!uid) return
    if (!STORAGE_READY) { toast.error('Storage not configured'); return }
    setUploadingPayslip(true)
    try {
      const sRef = storageRef(storage, `Payslips/${uid}/${file.name}`)
      await uploadBytes(sRef, file)
      const url = await getDownloadURL(sRef)
      await push(ref(db, `Employees/${uid}/Payslips`), { url, sentAt: new Date().toISOString(), period: new Date().toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) })
      toast.success('Payslip sent')
    } catch (e: any) { toast.error('Failed: ' + e.message) }
    setUploadingPayslip(false)
  }

  const initials = (data?.name || '?').split(' ')
    .filter(Boolean).map((x: string) => x[0]).join('').slice(0,2).toUpperCase()

  const card = {
    backgroundColor: 'white', borderRadius: '14px',
    border: '1px solid #E8EDF2', boxShadow: '0 1px 6px rgba(0,0,0,0.05)',
    padding: '20px',
  }

  const Row = ({ icon: Icon, label, value }: any) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px',
      padding: '10px 0', borderBottom: '1px solid #F1F5F9' }}>
      <Icon size={16} color="#94A3B8" />
      <span style={{ fontSize: '12px', color: '#94A3B8',
        width: '120px', flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: '13px', fontWeight: '600',
        color: '#1A2B4A' }}>{value || '—'}</span>
    </div>
  )

  const DocCard = ({ label, fileUrl }: { label: string, fileUrl?: string }) => (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '14px 16px', borderRadius: '12px',
      backgroundColor: fileUrl ? '#F0FDF4' : '#F8FAFC',
      border: `1px solid ${fileUrl ? '#BBF7D0' : '#E2E8F0'}`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {fileUrl
          ? <CheckCircle2 size={18} color="#16A34A" />
          : <XCircle size={18} color="#CBD5E1" />}
        <div>
          <p style={{ fontSize: '13px', fontWeight: '700',
            color: '#1A2B4A', margin: 0 }}>{label}</p>
          <p style={{ fontSize: '11px', color: '#94A3B8', margin: 0 }}>
            {fileUrl ? 'Uploaded' : 'Not uploaded'}
          </p>
        </div>
      </div>
      {fileUrl && (
        <div style={{ display: 'flex', gap: '6px' }}>
          <a href={fileUrl} target="_blank" rel="noreferrer" style={{
            padding: '6px 10px', borderRadius: '8px',
            backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE',
            color: '#1D4ED8', fontSize: '11px', fontWeight: '700',
            textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px',
          }}><Eye size={12} /> Preview</a>
          <a href={fileUrl} download target="_blank" rel="noreferrer" style={{
            padding: '6px 10px', borderRadius: '8px',
            backgroundColor: '#ECFDF5', border: '1px solid #86EFAC',
            color: '#15803D', fontSize: '11px', fontWeight: '700',
            textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px',
          }}><Download size={12} /> Download</a>
        </div>
      )}
    </div>
  )

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex',
      alignItems: 'center', justifyContent: 'center', backgroundColor: '#F0F4F8' }}>
      <p style={{ color: '#94A3B8' }}>Loading employee...</p>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F0F4F8',
      fontFamily: 'Inter, sans-serif' }}>

      {/* Topbar */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 20, backgroundColor: 'white',
        borderBottom: '1px solid #E8EDF2', padding: '0 28px', height: '60px',
        display: 'flex', alignItems: 'center', gap: '14px',
        boxShadow: '0 1px 8px rgba(0,0,0,0.06)',
      }}>
        <button onClick={() => navigate(-1)} style={{
          width: '36px', height: '36px', borderRadius: '10px',
          border: '1.5px solid #E2E8F0', backgroundColor: '#F8FAFC',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer',
        }}><ArrowLeft size={17} color="#64748B" /></button>
        <div>
          <h1 style={{ fontSize: '17px', fontWeight: '800',
            color: '#0F1C2E', margin: 0 }}>Employee Profile</h1>
          <p style={{ fontSize: '12px', color: '#94A3B8', margin: 0 }}>
            Full details and documents
          </p>
        </div>
      </header>

      <div style={{ padding: '24px 28px', maxWidth: '900px', margin: '0 auto' }}>

        {/* Profile header card */}
        <div style={{ ...card, display: 'flex', alignItems: 'center',
          gap: '18px', marginBottom: '16px' }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '50%',
            backgroundColor: '#DBEAFE', overflow: 'hidden', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '3px solid #BFDBFE',
          }}>
            {data?.profilePhoto
              ? <img src={data.profilePhoto} style={{ width: '100%',
                  height: '100%', objectFit: 'cover' }} />
              : <span style={{ fontSize: '22px', fontWeight: '800',
                  color: '#1D4ED8' }}>{initials}</span>}
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: '20px', fontWeight: '800',
              color: '#0F1C2E', margin: '0 0 4px' }}>{data?.name || 'Unknown'}</h2>
            <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>
              {data?.email || '—'}
            </p>
          </div>
        </div>

        {/* Personal Details */}
        <div style={{ ...card, marginBottom: '16px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '700',
            color: '#0F1C2E', margin: '0 0 8px' }}>Personal Details</h3>
          <Row icon={UserIcon} label="Full Name" value={data?.name} />
          <Row icon={Phone} label="Phone" value={data?.phone} />
          <Row icon={Phone} label="WhatsApp" value={data?.whatsapp} />
          <Row icon={Mail} label="Email" value={data?.email} />
          <Row icon={Calendar} label="Date of Birth" value={data?.dob} />
          <Row icon={UserIcon} label="Gender" value={data?.gender} />
          <Row icon={MapPin} label="Address" value={data?.address} />
        </div>

        {/* Education */}
        <div style={{ ...card, marginBottom: '16px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '700',
            color: '#0F1C2E', margin: '0 0 8px' }}>Education</h3>
          {data?.Education ? (
            <>
              <Row icon={GraduationCap} label="College" value={data.Education.college} />
              <Row icon={GraduationCap} label="Degree" value={data.Education.degree} />
              <Row icon={Calendar} label="Year" value={data.Education.year} />
            </>
          ) : (
            <p style={{ fontSize: '13px', color: '#94A3B8' }}>Not provided</p>
          )}
        </div>

        {/* Bank Details */}
        <div style={{ ...card, marginBottom: '16px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '700',
            color: '#0F1C2E', margin: '0 0 8px' }}>Bank Details</h3>
          {data?.BankDetails ? (
            <>
              <Row icon={CreditCard} label="Bank Name" value={data.BankDetails.bankName} />
              <Row icon={UserIcon} label="Holder Name" value={data.BankDetails.holderName} />
              <Row icon={CreditCard} label="Account No." value={
                data.BankDetails.accountNumber
                  ? `••••${String(data.BankDetails.accountNumber).slice(-4)}` : '—'} />
              <Row icon={CreditCard} label="IFSC Code" value={data.BankDetails.ifsc} />
            </>
          ) : (
            <p style={{ fontSize: '13px', color: '#94A3B8' }}>Not provided</p>
          )}
        </div>

        {/* Documents */}
        <div style={{ ...card, marginBottom: '16px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '700',
            color: '#0F1C2E', margin: '0 0 12px' }}>Documents</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <DocCard label="Aadhaar Card" fileUrl={data?.Documents?.aadhaar} />
            <DocCard label="PAN Card" fileUrl={data?.Documents?.pan} />
            <DocCard label="Resume" fileUrl={data?.Documents?.resume} />
            <DocCard label="Photo" fileUrl={data?.Documents?.photo} />
          </div>
        </div>

        {/* Send to Employee */}
        <div style={{ ...card, marginBottom: '24px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '700',
            color: '#0F1C2E', margin: '0 0 12px' }}>Send to Employee</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '14px 16px', borderRadius: '12px',
              backgroundColor: data?.OfferLetter ? '#F0FDF4' : '#F8FAFC',
              border: `1px solid ${data?.OfferLetter ? '#BBF7D0' : '#E2E8F0'}`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Mail size={18} color={data?.OfferLetter ? '#16A34A' : '#94A3B8'} />
                <div>
                  <p style={{ fontSize: '13px', fontWeight: '700', color: '#1A2B4A', margin: 0 }}>Offer Letter</p>
                  <p style={{ fontSize: '11px', color: '#94A3B8', margin: 0 }}>
                    {data?.OfferLetter ? `Sent: ${new Date(data.OfferLetter.sentAt).toLocaleDateString()}` : 'Not sent yet'}
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                {data?.OfferLetter && (
                  <a href={data.OfferLetter.url} target="_blank" rel="noreferrer" style={{
                    padding: '6px 10px', borderRadius: '8px',
                    backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE',
                    color: '#1D4ED8', fontSize: '11px', fontWeight: '700',
                    textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px',
                  }}><Eye size={12} /> View</a>
                )}
                <label style={{
                  padding: '6px 10px', borderRadius: '8px',
                  backgroundColor: data?.OfferLetter ? '#ECFDF5' : '#EFF6FF',
                  border: `1px solid ${data?.OfferLetter ? '#86EFAC' : '#BFDBFE'}`,
                  color: data?.OfferLetter ? '#15803D' : '#007CC2',
                  fontSize: '11px', fontWeight: '700',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px',
                }}>
                  <Upload size={12} /> {data?.OfferLetter ? 'Replace' : 'Send'}
                  <input type="file" accept="application/pdf" style={{ display: 'none' }}
                    onChange={e => { const f = e.target.files?.[0]; if (f) handleSendOfferLetter(f) }}
                    disabled={uploadingOffer}
                  />
                </label>
              </div>
            </div>

            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '14px 16px', borderRadius: '12px',
              backgroundColor: data?.Payslips && Object.keys(data.Payslips).length > 0 ? '#F0FDF4' : '#F8FAFC',
              border: `1px solid ${data?.Payslips && Object.keys(data.Payslips).length > 0 ? '#BBF7D0' : '#E2E8F0'}`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <DollarSign size={18} color={data?.Payslips && Object.keys(data.Payslips).length > 0 ? '#16A34A' : '#94A3B8'} />
                <div>
                  <p style={{ fontSize: '13px', fontWeight: '700', color: '#1A2B4A', margin: 0 }}>Payslip</p>
                  <p style={{ fontSize: '11px', color: '#94A3B8', margin: 0 }}>
                    {data?.Payslips && Object.keys(data.Payslips).length > 0 
                      ? `${Object.keys(data.Payslips).length} sent` : 'Not sent yet'}
                  </p>
                </div>
              </div>
              <label style={{
                padding: '6px 10px', borderRadius: '8px',
                backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE',
                color: '#007CC2', fontSize: '11px', fontWeight: '700',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px',
              }}>
                <Upload size={12} /> Send New
                <input type="file" accept="application/pdf" style={{ display: 'none' }}
                  onChange={e => { const f = e.target.files?.[0]; if (f) handleSendPayslip(f) }}
                  disabled={uploadingPayslip}
                />
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}