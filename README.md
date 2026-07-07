# Infosys HRMS — Employee Onboarding Portal

A full-stack web application for managing employee onboarding, built with React + TypeScript + Firebase.

[![Infosys HRMS](https://img.shields.io/badge/Infosys-HRMS-007CC2?style=for-the-badge)](https://infosys-hrms-prod-87249.web.app)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)](https://typescriptlang.org)
[![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com)
[![Tailwind](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com)

**Live Demo:** https://infosys-hrms-prod-87249.web.app

## Quick Links

- [Deployment Guide](./DEPLOYMENT.md) - Full setup and deployment instructions
- [Firebase Rules](./src/firebase/rules.md) - Security rules documentation
- [Android Integration](#android-integration) - Connect the Android app

## Overview

Infosys HRMS is a web portal that mirrors and extends the Infosys HRMS Android app. Both apps share the same Firebase backend — data syncs in real time across platforms.

## Features

### Employee Portal
| Feature | Description |
|---------|-------------|
| 🔐 **Authentication** | Firebase email/password login with session-only persistence |
| 👤 **Personal Details** | Name, phone, WhatsApp, email, DOB, address, gender, profile photo upload |
| 🎓 **Education** | College, degree, graduation year |
| 🏦 **Bank Details** | Bank name, holder name, account number, IFSC code |
| 📄 **Documents** | Aadhaar, PAN, resume, photo upload to Firebase Storage |
| 📅 **Apply Leave** | Date range selection, reason, pending approval |
| ✅ **Attendance** | Direct clock in/out (no admin approval needed) |
| 🔔 **Notifications** | Announcements and leave status updates |
| 🗓️ **Holiday Calendar** | Company holidays view |
| 📒 **Employee Directory** | Browse all employees |
| 🎫 **Support Tickets** | Submit help requests |
| 💰 **Payslips** | View salary slips |
| 📝 **Offer Letter** | Digital offer letter access |

### Admin Portal
| Feature | Description |
|---------|-------------|
| 📊 **Dashboard** | Real-time KPI stats (employee count, attendance, leave) |
| 👥 **Employee Management** | Create, view, edit employees |
| 📋 **Leave Management** | Approve/reject leave requests |
| 📢 **Announcements** | Create/delete company announcements |
| 🗓️ **Holiday Management** | Add/edit company holidays |
| 📁 **Document Center** | Preview and download employee documents |
| 🎫 **Support Tickets** | Manage employee support requests |
| 📈 **Reports** | Analytics and export (CSV) |
| 📝 **Audit Log** | Activity tracking |

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS + inline styles |
| Backend | Firebase (Auth + Realtime DB + Storage) |
| Hosting | Firebase Hosting |
| State | React Context + sessionStorage |
| Forms | React Hook Form |
| Notifications | React Hot Toast |
| Icons | Lucide React |

## Project Structure

```
src/
├── components/           # Shared UI components
│   ├── AuthGuard.tsx     # Protects employee routes
│   ├── AdminGuard.tsx    # Protects admin routes
│   ├── PageLayout.tsx    # Page wrapper with header
│   ├── ErrorBoundary.tsx # Catches React errors
│   ├── DBBanner.tsx      # Shows DB/Storage config warnings
│   ├── Sidebar.tsx       # Employee navigation
│   ├── Navbar.tsx        # Top navigation bar
│   ├── SectionCard.tsx   # Card component
│   └── ProfileCompletion.tsx # Progress indicator
├── context/
│   └── AuthContext.tsx   # Auth state management
├── firebase/
│   ├── config.ts         # Firebase initialization
│   └── rules.md          # Security rules
├── hooks/
│   ├── useAuth.ts        # Auth utilities
│   ├── useFirebase.ts    # Firebase helpers
│   └── useSession.ts     # Session storage helpers
├── pages/
│   ├── SplashPage.tsx    # Initial loading screen
│   ├── LoginPage.tsx     # Login form
│   ├── SetupPage.tsx     # Initial account seeding
│   ├── NotFoundPage.tsx  # 404 page
│   ├── admin/
│   │   ├── AdminDashboardPage.tsx     # Admin overview
│   │   ├── AdminEmployeeDetailPage.tsx  # Full employee profile view
│   │   ├── CreateEmployeePage.tsx       # Create admin/employee accounts
│   │   ├── ViewEmployeesPage.tsx        # Employee list
│   │   ├── ViewAttendancePage.tsx       # Attendance management
│   │   └── ViewLeaveRequestsPage.tsx    # Leave approval
│   └── employee/
│       ├── DashboardPage.tsx            # Employee overview
│       ├── PersonalDetailsPage.tsx      # Profile + photo upload
│       ├── EducationPage.tsx            # Education form
│       ├── DocumentsPage.tsx            # Document upload
│       ├── BankDetailsPage.tsx          # Bank info form
│       ├── ApplyLeavePage.tsx           # Leave request form
│       ├── MyLeaveStatusPage.tsx        # Leave history
│       ├── AttendancePage.tsx           # Clock in/out
│       ├── PayslipPage.tsx              # Salary slip view
│       └── OfferLetterPage.tsx            # Offer letter
├── types/
│   └── index.ts          # TypeScript interfaces
└── main.tsx              # App entry with ErrorBoundary
```

## Firebase Configuration

### Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://your_project_id-default-rtdb.asia-southeast1.firebasedatabase.app
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### Database Structure

| Path | Fields | Description |
|------|--------|-------------|
| `Users/{uid}` | id, name, email, role | Auth users with roles |
| `Employees/{uid}` | uid, name, phone, whatsapp, email, dob, address, gender, profilePhoto, Education, BankDetails, Documents | Employee profiles |
| `Attendance/{uid}/{date}` | status, checkInTime, checkOutTime | Daily attendance records |
| `LeaveRequests/{pushId}` | uid, name, fromDate, toDate, reason, status | Leave requests |
| `LeaveBalance/{uid}` | total, used, remaining | Leave allocation |
| `Announcements/{id}` | title, message, priority, timestamp | Company announcements |
| `Holidays/{id}` | name, date, type, description | Holiday calendar |
| `SupportTickets/{id}` | uid, subject, message, status, timestamp | Support requests |
| `AuditLog/{id}` | action, timestamp, details | Activity log |

### Key Functions

**Auth Context** - `src/context/AuthContext.tsx`:
- Listens to Firebase `onAuthStateChanged`
- Reads role from `Users/{uid}/role` node
- Falls back to `infosys@hrms.com` → admin email detection
- Stores session in `sessionStorage`
- Session-only persistence (logs out on tab close)

**Firebase Config** - `src/firebase/config.ts`:
- Initializes Firebase app with env vars
- Exports `auth`, `db`, `storage` clients
- Exports `DB_READY` and `STORAGE_READY` flags

**Setup Page** - `src/pages/SetupPage.tsx`:
- Seeds default admin account: `infosys@hrms.com` / `123456`
- Seeds default employee account: `starrail2589@gmail.com` / `sunny@2589`
- Run once at `/setup` before production

**Employee Attendance** - `src/pages/employee/AttendancePage.tsx`:
- Clock in writes: `status: "checked_in"`, `checkInTime` immediately
- Clock out writes: `status: "checked_out"`, `checkOutTime` immediately
- No admin approval required - instant status update
- Shows current time on dashboard

**Admin Attendance** - `src/pages/admin/ViewAttendancePage.tsx`:
- View all employee attendance records
- Filter/search by date or employee name
- Shows: check-in time, check-out time, status (Checked In/Complete)

## Authentication Flow

```
1. User visits /
   └─> Redirected to /splash (loading auth state)
   
2. SplashPage checks Firebase auth state
   └─> If authenticated → determine role from Users/{uid}/role
   └─> If no role → check email for admin fallback
   
3. LoginPage handles sign-in
   └─> Firebase Auth → signInWithEmailAndPassword
   └─> On success → read/write role to database
   └─> Session storage sync
   └─> Navigate to role dashboard
   
4. Session Persistence
   └─> Uses browserSessionPersistence (tab-close logout)
   └─> Role cached in sessionStorage for quick access
```

## Role-Based Access

| Route Pattern | Access |
|---------------|--------|
| `/employee/*` | Any authenticated user |
| `/admin/*` | Only users with `role: 'admin'` |
| `/login`, `/splash` | Unauthenticated users |
| `/setup` | Always accessible (delete after setup) |

## Quick Start

```bash
git clone https://github.com/p11x/Infosys-HRMS.git
cd Infosys-HRMS
npm install
cp .env.example .env
# Edit .env with Firebase config
npm run dev
```

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete deployment instructions.

Build and deploy to Firebase:
```bash
npm run build
firebase deploy --only hosting
```

## Android Integration

This web app shares the same Firebase project as the Android app.

To connect the Android app:
1. Download `google-services.json` from Firebase Console → Project Settings → Your apps → Android app
2. Replace `google-services.json` in the Android Studio project
3. Both apps now share the same database in real time

## Default Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | infosys@hrms.com | 123456 |
| Employee | starrail2589@gmail.com | sunny@2589 |

> ⚠️ Change default passwords after first login in production.

## Security Notes

- All routes use `AuthGuard` for authentication
- Admin routes require `AdminGuard`
- Session-only auth (logs out on browser close)
- Storage rules: auth required for uploads
- Database rules: auth required for reads/writes (lock down after testing)

## License

Private — Infosys Internal Use Only

---

## For AI Assistants

This file serves as the primary context for understanding the HRMS application.

**Key Technical Details:**
- Firebase project: `infosys-hrms-prod-87249`
- DB region: `asia-southeast1` (Singapore)
- Auth: Email/password, session-only persistence
- Storage paths: `ProfilePhotos/{uid}.jpg`, `Documents/{uid}/{field}_{filename}`
- All file uploads use `uploadBytes` + `getDownloadURL` pattern
- Document URLs stored under `Employees/{uid}/Documents/{field}`
- Profile photo stored under `Employees/{uid}/profilePhoto`

**Common Tasks:**
- Add new admin: Use Create Employee page → select Admin role
- Reset password: Firebase Console → Authentication → Users
- Add holiday: Admin Dashboard → Holiday Management
- Approve leave: Admin → Leave Requests → Approve/Reject buttons
- Check attendance: Admin → Attendance → view records