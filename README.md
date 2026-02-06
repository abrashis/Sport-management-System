# Sports Management System

A high-performance tournament management platform built with React, Node.js, and MySQL.

## Features
- **OTP Verification**: Email-based verification using Nodemailer.
- **Role-based Access**: Separate dashboards for Admins and Participants.
- **Automated Tie-Sheet**: Admin can generate match schedules with round-robin pairing and auto-scheduling.
- **Dual Notifications**: Real-time FCM push notifications + persistent in-app history.
- **Security First**: Session-based auth, CSRF protection, rate limiting, and input sanitization.

## Setup Instructions

### 1. Database
- Create a MySQL database named `sports_management_system`.
- Import `database/schema.sql`.
- Import `database/seed.sql` (Initial admin: `admin@sports.local` / `Admin@12345`).

### 2. Backend
```bash
cd backend
npm install
# Configure .env with DB, Session Secret, Gmail SMTP, and Firebase path
npm run dev
```

### 3. Frontend
```bash
cd frontend
npm install
# Configure .env with VITE_API_URL and Firebase Keys
npm run dev
```

## Environment Config Examples

**Backend `.env`**
```env
PORT=5000
DB_HOST=localhost
DB_NAME=sports_management_system
SESSION_SECRET=a_very_long_random_string
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-gmail-app-password
FIREBASE_SERVICE_ACCOUNT_PATH=./config/firebase-service-account.json
```

**Frontend `.env`**
```env
VITE_API_URL=http://localhost:5000/api
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_VAPID_KEY=...
```

## Viva-Ready Technical Points
- **Sessions vs JWT**: We use sessions (HTTP-only cookies) for better security against XSS. JWTs are harder to revoke; sessions are managed server-side.
- **CSRF**: Implemented using `csurf` middleware. The client fetches a token and sends it via the `X-CSRF-Token` header.
- **Draw Algorithm**: Shuffles approved participants, pairs them sequentially, handles BYEs for odd numbers, and auto-calculates match times based on duration.
- **FCM Flow**: Token is requested on login -> sent to backend -> stored per user device -> Cron job sends multicast messages to all tokens.
