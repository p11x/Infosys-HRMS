# Deployment Guide — Infosys HRMS

## Prerequisites
- Node.js 18+ installed (https://nodejs.org)
- Firebase CLI installed: `npm install -g firebase-tools`
- Git installed

## Step 1: Clone the repository
```bash
git clone https://github.com/p11x/Infosys-HRMS.git
cd Infosys-HRMS
```

## Step 2: Install dependencies
```bash
npm install
```

## Step 3: Configure Firebase
1. Go to https://console.firebase.google.com
2. Select your Firebase project
3. Go to Project Settings → General → Your apps → Web app
4. Copy the config values
5. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
6. Open `.env` and fill in your Firebase config values

## Step 4: Enable Firebase Services
In Firebase Console, enable these services:
- **Authentication** → Sign-in method → Email/Password → Enable
- **Realtime Database** → Create Database → Test mode
- **Storage** → Get started → Test mode
- **Hosting** → Get started

## Step 5: Create admin account
Run the app locally first:
```bash
npm run dev
```
Go to http://localhost:5173/setup → Click "Run Setup"
This creates the admin and default employee accounts.
Delete SetupPage after running (see security note below).

## Step 6: Build the app
```bash
npm run build
```

## Step 7: Login to Firebase CLI
```bash
firebase login
```
Login with the Google account that owns the Firebase project.

## Step 8: Initialize Firebase Hosting
```bash
firebase init hosting
```
Answer prompts:
- Which project? → Select your Firebase project
- Public directory? → `dist`
- Single-page app? → `Yes`
- Automatic builds with GitHub? → `No`
- Overwrite dist/index.html? → `No`

## Step 9: Deploy
```bash
firebase deploy --only hosting
```

## Step 10: Authorize your domain
Go to Firebase Console → Authentication → Settings → Authorized domains
Add your hosting URL: `your-project-id.web.app`

## Your app is live at:
- https://your-project-id.web.app
- https://your-project-id.firebaseapp.com

## Future deployments (after code changes)
```bash
npm run build
firebase deploy --only hosting
```

## Security: Lock down Firebase rules
After testing, go to Firebase Console → Realtime Database → Rules
and paste the rules from `src/firebase/rules.md`

## Default credentials
- Admin: infosys@hrms.com / 123456
- Employee: starrail2589@gmail.com / sunny@2589
(Change these after first login)