import { useEffect, useState } from 'react'
import { ref, get, set } from 'firebase/database'
import { db } from '../../firebase/config'
import { useAuth } from '../../hooks/useAuth'
import PageLayout from '../../components/PageLayout'
import toast from 'react-hot-toast'

interface BankDetailsForm {
  bankName: string
  holderName: string
  accountNumber: string
  confirmAccountNumber: string
  ifsc: string
}

export default function BankDetailsPage() {
  const { uid } = useAuth()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState<BankDetailsForm>({
    bankName: '', holderName: '', accountNumber: '', confirmAccountNumber: '', ifsc: '',
  })

  useEffect(() => {
    if (!uid) return
    get(ref(db, `Employees/${uid}`)).then(snap => {
      if (snap.exists()) {
        const d = snap.val()
        if (d.BankDetails) setForm(d.BankDetails)
      }
    }).catch(() => toast.error('Failed to load data'))
  }, [uid])

  const validateIFSC = (value: string) => /^[A-Z]{4}0[A-Z0-9]{6}$/.test(value) || 'Invalid IFSC'

  const validateHolderName = (value: string) => /^[A-Za-z\s.'-]*$/.test(value) || 'Invalid name'

  const validateAccountNumber = (value: string) => /^\d*$/.test(value) || 'Invalid number'

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!uid) return

    if (!validateIFSC(form.ifsc)) {
      toast.error('Invalid IFSC code')
      return
    }

    if (form.holderName && !validateHolderName(form.holderName)) {
      toast.error('Account Holder Name must contain only letters')
      return
    }

    if (form.accountNumber && !validateAccountNumber(form.accountNumber)) {
      toast.error('Account Number must contain only digits')
      return
    }

    if (form.accountNumber !== form.confirmAccountNumber) {
      toast.error('Account numbers do not match')
      return
    }

    setLoading(true)
    try {
      await set(ref(db, `Employees/${uid}/BankDetails`), {
        bankName: form.bankName,
        holderName: form.holderName,
        accountNumber: form.accountNumber,
        ifsc: form.ifsc,
      })
      toast.success('Bank details saved!')
    } catch { toast.error('Save failed') }
    finally { setLoading(false) }
  }

  const handleHolderNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    if (/^[A-Za-z\s.'-]*$/.test(val) || val === '') setForm(p => ({ ...p, holderName: val }))
  }

  const handleAccountNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    if (/^\d*$/.test(val) || val === '') setForm(p => ({ ...p, accountNumber: val }))
  }

  const handleConfirmAccountNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    if (/^\d*$/.test(val) || val === '') setForm(p => ({ ...p, confirmAccountNumber: val }))
  }

  return (
    <PageLayout title="Bank Details" subtitle="Account & IFSC information">
      <form onSubmit={handleSave}>
        <div style={{
          backgroundColor: 'white', borderRadius: '16px',
          padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
          display: 'flex', flexDirection: 'column', gap: '16px',
        }}>
          <div>
            <label style={{
              fontSize: '12px', fontWeight: '600', color: '#64748B',
              textTransform: 'uppercase', letterSpacing: '0.5px',
              display: 'block', marginBottom: '6px',
            }}>
              Bank Name <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <input
              type="text" placeholder="Enter bank name"
              value={form.bankName}
              onChange={e => setForm(p => ({ ...p, bankName: e.target.value }))}
              style={{
                width: '100%', padding: '12px 14px', borderRadius: '10px', fontSize: '14px',
                border: '1.5px solid #E2E8F0', outline: 'none', backgroundColor: '#F8FAFC', color: '#1A2B4A',
                boxSizing: 'border-box', transition: 'border-color 0.2s',
              }}
              onFocus={e => e.target.style.borderColor = '#007CC2'}
              onBlur={e => e.target.style.borderColor = '#E2E8F0'}
            />
          </div>

          <div>
            <label style={{
              fontSize: '12px', fontWeight: '600', color: '#64748B',
              textTransform: 'uppercase', letterSpacing: '0.5px',
              display: 'block', marginBottom: '6px',
            }}>
              Account Holder Name <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <input
              type="text" placeholder="Enter holder name"
              value={form.holderName}
              onChange={handleHolderNameChange}
              style={{
                width: '100%', padding: '12px 14px', borderRadius: '10px', fontSize: '14px',
                border: '1.5px solid #E2E8F0', outline: 'none', backgroundColor: '#F8FAFC', color: '#1A2B4A',
                boxSizing: 'border-box', transition: 'border-color 0.2s',
              }}
              onFocus={e => e.target.style.borderColor = '#007CC2'}
              onBlur={e => e.target.style.borderColor = '#E2E8F0'}
            />
          </div>

          <div>
            <label style={{
              fontSize: '12px', fontWeight: '600', color: '#64748B',
              textTransform: 'uppercase', letterSpacing: '0.5px',
              display: 'block', marginBottom: '6px',
            }}>
              Account Number <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <input
              type="password" placeholder="Enter account number"
              value={form.accountNumber}
              onChange={handleAccountNumberChange}
              style={{
                width: '100%', padding: '12px 14px', borderRadius: '10px', fontSize: '14px',
                border: '1.5px solid #E2E8F0', outline: 'none', backgroundColor: '#F8FAFC', color: '#1A2B4A',
                boxSizing: 'border-box', transition: 'border-color 0.2s',
              }}
              onFocus={e => e.target.style.borderColor = '#007CC2'}
              onBlur={e => e.target.style.borderColor = '#E2E8F0'}
            />
          </div>

          <div>
            <label style={{
              fontSize: '12px', fontWeight: '600', color: '#64748B',
              textTransform: 'uppercase', letterSpacing: '0.5px',
              display: 'block', marginBottom: '6px',
            }}>
              Confirm Account Number <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <input
              type="password" placeholder="Confirm account number"
              value={form.confirmAccountNumber}
              onChange={handleConfirmAccountNumberChange}
              style={{
                width: '100%', padding: '12px 14px', borderRadius: '10px', fontSize: '14px',
                border: '1.5px solid #E2E8F0', outline: 'none', backgroundColor: '#F8FAFC', color: '#1A2B4A',
                boxSizing: 'border-box', transition: 'border-color 0.2s',
              }}
              onFocus={e => e.target.style.borderColor = '#007CC2'}
              onBlur={e => e.target.style.borderColor = '#E2E8F0'}
            />
          </div>

          <div>
            <label style={{
              fontSize: '12px', fontWeight: '600', color: '#64748B',
              textTransform: 'uppercase', letterSpacing: '0.5px',
              display: 'block', marginBottom: '6px',
            }}>
              IFSC Code <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <input
              type="text" placeholder="Enter IFSC code (e.g. HDFC0001234)"
              value={form.ifsc}
              onChange={e => setForm(p => ({ ...p, ifsc: e.target.value.toUpperCase() }))}
              style={{
                width: '100%', padding: '12px 14px', borderRadius: '10px', fontSize: '14px',
                border: '1.5px solid #E2E8F0', outline: 'none', backgroundColor: '#F8FAFC', color: '#1A2B4A',
                boxSizing: 'border-box', transition: 'border-color 0.2s',
              }}
              onFocus={e => e.target.style.borderColor = '#007CC2'}
              onBlur={e => e.target.style.borderColor = '#E2E8F0'}
            />
          </div>

          <button
            type="submit" disabled={loading}
            style={{
              width: '100%', padding: '14px', borderRadius: '12px', border: 'none',
              backgroundColor: loading ? '#93C5FD' : '#007CC2', color: 'white', fontSize: '15px',
              fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer',
              letterSpacing: '0.5px', marginTop: '4px', transition: 'background-color 0.2s',
            }}
          >
            {loading ? 'Saving...' : 'Save Bank Details'}
          </button>
        </div>
      </form>
    </PageLayout>
  )
}