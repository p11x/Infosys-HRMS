import { DollarSign } from 'lucide-react'
import PageLayout from '../../components/PageLayout'

export default function PayslipPage() {
  return (
    <PageLayout title="Payslip" subtitle="Monthly salary statements">
      <div style={{
        backgroundColor: 'white', borderRadius: '16px',
        padding: '40px 20px', textAlign: 'center',
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
      }}>
        <DollarSign size={48} color="#CBD5E1" style={{ margin: '0 auto 16px' }} />
        <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1A2B4A', margin: '0 0 8px' }}>
          No payslips available
        </h3>
        <p style={{ fontSize: '13px', color: '#94A3B8', margin: 0, lineHeight: '1.4' }}>
          Your payslips will appear here once uploaded by admin
        </p>
      </div>
    </PageLayout>
  )
}