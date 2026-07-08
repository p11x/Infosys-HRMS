# Infosys Onboarding Portal

A full-stack web application for employee onboarding, built with React + TypeScript + Firebase.

[![Infosys](https://img.shields.io/badge/Infosys-Onboarding_Portal-007CC2?style=for-the-badge)](https://infosysonboardingportal.web.app)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)](https://typescriptlang.org)
[![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com)
[![Tailwind](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)

**Live Demo:** https://infosysonboardingportal.web.app  
**Alternate URL:** https://infosys-hrms-prod-87249.web.app

## Quick Links

- [Deployment Guide](./DEPLOYMENT.md) - Full setup and deployment instructions
- [Firebase Rules](./src/firebase/rules.md) - Security rules documentation
- [Android Integration](#android-integration) - Connect the Android app

## Overview

Infosys Onboarding Portal is a web application for employee onboarding and HR management. Both the web and Android apps share the same Firebase backend — data syncs in real time across platforms.

## Features

### Employee Portal
| Feature | Description |
|---------|-------------|
| 🔐 **Authentication** | Firebase email/password login with session-only persistence |
| 👤 **Personal Details** | Name, phone, WhatsApp, email, DOB, address, gender, profile photo upload |
| 🎓 **Education** | College, degree, CGPA/Percentage, college address, specialization/branch, from/to year |
| 🏦 **Bank Details** | Bank name, account holder name (alphabetic input), account number (numeric input), IFSC code, confirm account match |
| 📄 **Send to Company** | Upload Aadhaar, PAN, resume, photo to Firebase Storage |
| 📥 **Received from Company** | View/download offer letter, payslips (admin-sent documents) |
| 📅 **Apply Leave** | Date range selection (today/future dates only), reason submission |
| ✅ **Attendance** | Direct self-service clock in/out (instant status, no approval) |
| 🔔 **Notifications** | Unread message badge on bell icon, announcements and leave status updates |
| 🗓️ **Holiday Calendar** | Company holidays view |
| 📒 **Employee Directory** | Browse all employees |
| 🎫 **Support Tickets** | Submit help requests |

### Admin Portal
| Feature | Description |
|---------|-------------|
| 📊 **Dashboard** | Real-time KPI stats via Firebase listeners |
| 👥 **Employee Management** | Create, view, edit, bulk delete employees; message employees |
| 📋 **Leave Management** | Approve/reject leave requests |
| 📢 **Announcements** | Create/delete company announcements |
| 🗓️ **Holiday Management** | Add/edit company holidays |
| 📁 **Document Center** | View/download employee documents with per-document actions |
| 🎫 **Support Tickets** | Manage employee support requests |
| 📈 **Reports** | Analytics and CSV export |
| 📝 **Audit Log** | Activity tracking |
| 📋 **View Attendance** | Day/month date filter, live realtime updates, employee status display |

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS + inline styles |
| Backend | Firebase (Auth + Realtime DB + Storage) |
| Hosting | Firebase Hosting (multi-site setup) |
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
│   │   ├── ViewEmployeesPage.tsx        # Employee list with bulk actions
│   │   ├── ViewAttendancePage.tsx       # Attendance management with date filter
│   │   └── ViewLeaveRequestsPage.tsx    # Leave approval
│   └── employee/
│       ├── DashboardPage.tsx            # Employee overview
│       ├── PersonalDetailsPage.tsx      # Profile + photo upload
│       ├── EducationPage.tsx            # Education form
│       ├── DocumentsPage.tsx            # Document upload (send to company)
│       ├── BankDetailsPage.tsx          # Bank info form
│       ├── ApplyLeavePage.tsx           # Leave request form (future dates only)
│       ├── MyLeaveStatusPage.tsx        # Leave history
│       ├── AttendancePage.tsx           # Clock in/out self-service
│       ├── PayslipPage.tsx              # Salary slip view
│       └── OfferLetterPage.tsx            # Offer letter view
├── types/
│   └── index.ts          # TypeScript interfaces
└── main.tsx              # App entry with ErrorBoundary
```

## Firebase Configuration

### Hosting / URLs

The app is deployed to Firebase Hosting using a multi-site setup:

- **Primary URL:** https://infosysonboardingportal.web.app
- **Alternate URL:** https://infosys-hrms-prod-87249.web.app

**Deploy commands:**
```bash
# Apply hosting target (first time setup)
firebase target:apply hosting main infosysonboardingportal

# Build and deploy
npm run build
firebase deploy --only hosting:main
```

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
| `OfferLetters/{uid}` | {pushId}: url, timestamp | Admin-uploaded offer letters |
| `Payslips/{uid}/{pushId}` | url, timestamp | Admin-uploaded payslips |
| `Messages/{uid}/{pushId}` | title, body, timestamp, read | Employee notifications |

### Security Rules

**Realtime Database Rules:**
- Employees have read/write access to their own `Employees/{uid}` node
- Employees have read/write access to their own `Messages/{uid}` node for notifications
- All authenticated users can read `Users/{uid}` for role detection
- Admin access verified via email check (`infosys@hrms.com`)

**Storage Rules:**
- Admin (email-verified) has write access to `OfferLetters/{uid}/*` and `Payslips/{uid}/*`
- Employees have read access to their own offer letters and payslips in Storage
- Employee uploads to `Documents/{uid}/*` require auth
- Profile photo uploads require auth

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

```bash
npm run build
firebase deploy --only hosting:main
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
- Storage rules use email-based admin check (`request.auth.token.email`)
- Database rules grant employees access to their own nodes
- Admin role verified via hardcoded email match (`infosys@hrms.com`)

## Known Limitations / Future Considerations

- Storage downloads use direct link navigation (not fetch+blob) due to CORS constraints on the Firebase Storage bucket
- Admin role currently verified via hardcoded email match rather than Custom Claims (recommended hardening step)
- Settings and Help pages removed from navigation (planned for future implementation)

## License

Private — Infosys Internal Use Only

---

## For AI Assistants

This file serves as the primary context for understanding the onboarding portal application.

**Key Technical Details:**
- Firebase project: `infosys-hrms-prod-87249`
- DB region: `asia-southeast1` (Singapore)
- Auth: Email/password, session-only persistence
- Storage paths: `ProfilePhotos/{uid}.jpg`, `Documents/{uid}/{field}_{filename}`, `OfferLetters/{uid}`, `Payslips/{uid}`
- All file uploads use `uploadBytes` + `getDownloadURL` pattern
- Document URLs stored under `Employees/{uid}/Documents/{field}` or in dedicated `OfferLetters`/`Payslips` nodes
- Profile photo stored under `Employees/{uid}/profilePhoto`
- Hosting target: `main` → `infosysonboardingportal`

**Common Tasks:**
- Add new admin: Use Create Employee page → select Admin role
- Reset password: Firebase Console → Authentication → Users
- Add holiday: Admin Dashboard → Holiday Management
- Approve leave: Admin → Leave Requests → Approve/Reject buttons
- View attendance: Admin → Attendance → date picker + employee list with status
- Send payslip/offer letter: Admin → Document Center → Upload for employee
- Message employees: Admin → Document Center → Message modal with employee selection