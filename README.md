# Infosys HRMS — Employee Onboarding Portal

A full-stack web application for managing employee onboarding,
built with React + TypeScript + Firebase.

![Infosys HRMS](https://img.shields.io/badge/Infosys-HRMS-007CC2?style=for-the-badge)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css)

## Live Demo
🌐 **Production:** https://infosys-hrms-prod-87249.web.app

## Overview
Infosys HRMS is a web portal that mirrors and extends the
Infosys HRMS Android app. Both apps share the same Firebase
backend — data syncs in real time across platforms.

## Features

### Employee Portal
- 🔐 Secure login with Firebase Authentication
- 👤 Personal details management with profile photo upload
- 🎓 Education details
- 📄 Document upload (Aadhaar, PAN, Resume, Photo)
- 🏦 Bank details management
- 📅 Leave application and status tracking
- ✅ Attendance clock-in/clock-out with admin confirmation
- 🔔 Notification center (announcements + leave updates)
- 🗓️ Company holiday calendar
- 📒 Employee directory
- 🎫 Help & support tickets

### Admin Portal
- 📊 Dashboard with real-time KPI stats
- 👥 Employee management with full profile view
- ✅ 2-factor attendance confirmation system
- 📋 Leave request approval/rejection
- 📢 Company announcements
- 🗓️ Holiday calendar management
- 📈 Reports & analytics
- 📁 Document center
- 🎫 Support ticket management
- 📝 Activity audit log
- 👤 Bulk employee actions + CSV export

## Tech Stack
| Layer | Technology |
|---|---|
| Frontend | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS + inline styles |
| Backend | Firebase (Auth + Realtime DB + Storage) |
| Hosting | Firebase Hosting |
| State | React Context + sessionStorage |
| Icons | Lucide React |

## Project Structure
src/
├── components/       # Shared components
│   ├── AuthGuard.tsx
│   ├── AdminGuard.tsx
│   ├── PageLayout.tsx
│   ├── ErrorBoundary.tsx
│   └── DBBanner.tsx
├── context/
│   └── AuthContext.tsx
├── firebase/
│   ├── config.ts
│   └── rules.md
├── hooks/
│   ├── useAuth.ts
│   ├── useFirebase.ts
│   └── useSession.ts
├── pages/
│   ├── admin/        # Admin dashboard pages
│   └── employee/     # Employee portal pages
├── types/
│   └── index.ts
└── App.tsx

## Firebase Database Structure
Users/{uid}           → id, name, email, role
Employees/{uid}       → profile, Education, BankDetails, Documents
Attendance/{uid}/{date} → clockIn/Out time and status
LeaveRequests/{id}    → uid, dates, reason, status
LeaveBalance/{uid}    → total, used, remaining
Announcements/{id}    → title, message, priority
Holidays/{id}         → name, date, type
SupportTickets/{id}   → subject, message, status
AuditLog/{id}         → action, timestamp, details

## Quick Start
```bash
git clone https://github.com/p11x/Infosys-HRMS.git
cd Infosys-HRMS
npm install
cp .env.example .env
# Fill in .env with your Firebase config
npm run dev
```

## Deployment
See [DEPLOYMENT.md](./DEPLOYMENT.md) for full deployment instructions.

## Android Integration
This web app shares the same Firebase project as the Android app.
To connect the Android app:
1. Download `google-services.json` from Firebase Console
   → Project Settings → Your apps → Android app
2. Replace `google-services.json` in the Android Studio project
3. Both apps now share the same database in real time

## Default Accounts
| Role | Email | Password |
|---|---|---|
| Admin | infosys@hrms.com | 123456 |
| Employee | starrail2589@gmail.com | sunny@2589 |

> ⚠️ Change default passwords after first login in production.

## License
Private — Infosys Internal Use Only