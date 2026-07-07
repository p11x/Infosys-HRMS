export interface EmployeeModel {
  uid: string
  name: string
  role: 'admin' | 'employee'
}

export interface UserModel {
  uid: string
  name: string
  phone: string
  whatsapp: string
  email: string
  dob: string
  address: string
  gender: string
  profilePhoto?: string
}

export interface EducationModel {
  college: string
  degree: string
  year: string
  cgpa?: string
  collegeAddress?: string
  specialization?: string
  fromYear?: string
  toYear?: string
  university?: string
}

export interface BankDetailsModel {
  bankName: string
  holderName: string
  accountNumber: string
  ifsc: string
}

export interface DocumentsModel {
  aadhaar: string
  pan: string
  resume: string
  photo: string
}

export interface LeaveModel {
  uid: string
  name: string
  fromDate: string
  toDate: string
  reason: string
  status: 'Pending' | 'Approved' | 'Rejected'
}

export interface AttendanceModel {
  status: "not_started" | "checked_in" | "checked_out"
  checkInTime?: string
  checkOutTime?: string
}

export interface OfferLetter {
  url: string
  sentAt: string
}

export interface Payslip {
  id: string
  url: string
  period: string
  sentAt: string
}

export interface Message {
  id: string
  from: 'admin' | 'system'
  text: string
  timestamp: string
  read: boolean
}