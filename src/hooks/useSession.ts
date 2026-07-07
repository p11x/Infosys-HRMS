export const useSession = () => {
  const role = sessionStorage.getItem('hrms_role') as 'admin' | 'employee' | null
  const email = sessionStorage.getItem('hrms_email') || ''
  const uid = sessionStorage.getItem('hrms_uid') || ''
  const name = sessionStorage.getItem('hrms_name') || email.split('@')[0] || 'Employee'
  const isAdmin = role === 'admin'
  const isEmployee = role === 'employee'

  const clearSession = () => {
    sessionStorage.removeItem('hrms_role')
    sessionStorage.removeItem('hrms_email')
    sessionStorage.removeItem('hrms_uid')
    sessionStorage.removeItem('hrms_name')
  }

  return { role, email, uid, name, isAdmin, isEmployee, clearSession }
}