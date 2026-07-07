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
  status: "checked_in" | "checked_out" | "absent"
  checkInTime?: string
  checkOutTime?: string
}