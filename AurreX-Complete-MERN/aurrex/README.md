# AurreX — Jewellery Management System

Complete MERN app with 3 modes: **Leader**, **Staff**, **Manager**.

## Demo Account
- Username: `demo`
- Password: `Demo@1234`

## Quick Start

### 1. Start MongoDB
```bash
mongod
```
Or use MongoDB Atlas (cloud, free): https://cloud.mongodb.com — then update `MONGO_URI` in `backend/.env`

### 2. Start Backend
```bash
cd backend
npm install
npm run dev
```
Wait for: `✅ MongoDB connected` and `🔑 Demo: username=demo password=Demo@1234`

### 3. Start Frontend (new terminal)
```bash
cd frontend
npm install
npm run dev
```

### 4. Open Browser
```
http://localhost:5173
```
Login with `demo` / `Demo@1234`

## App Modes

| Mode | Routes | Access |
|---|---|---|
| **Leader** | /dashboard, /projects, /connections | Full project & connection management, gold tracking, PDF export, dashboard charts |
| **Staff** | /staff, /staff/connections | Boss connections only — gem work & payment tracking |
| **Manager** | /manager, /manager/sets, /manager/connections | Sets management with gem tables, Staff/Payment connections |

Switch modes via sidebar (desktop) or mode buttons in mobile header.

## Key Features

### Leader Mode — Detailed Projects
- Gold operations (Add/Remove/Waste/Tach) with running Gold-in-Box calculation
- **Pakal Table** with auto-calculated "Gold Used" column (WT Before − WT After)
- **Tachhi Table** with auto Diff
- **Gold Calculations block**: Roughly Gold Used + Total Diff (separate from summary)
- **Project Summary**: Gold Used Without Wastage = Sum(Pakal Gold Used) − Sum(Tachhi Tach)
- **Gem Count modal**: prompts for PAKAI/TACHHI gem counts + custom types when marking complete — feeds dashboard pie chart
- **Bill Print**: PDF export option showing only grand totals (clean client-facing bill)
- Set Summary block combining all Add Data sections
- Negative gold-box warnings

### Leader Mode — Simple Projects
- Gold Used = Added − Removed − Tach Removed − Waste Removed
- Gold Used With Wastage = Gold Used + Wastage%
- Same gem weight / total gems / total payment summary

### Dashboard (Leader)
- Monthly project activity bar chart
- Gem type distribution pie chart (PAKAI, TACHHI, custom types)

### Staff Mode
- Add Boss connections (separate from Leader's connections)
- Gem Entry (auto-calculated amount) + Payment Entry
- Account Summary: Balance = Received − Gem Work
- Dashboard with gem-work-by-boss bar chart

### Manager Mode
- **Sets**: photo, set name, given by, persons table, gem table (gram/carat toggle), auto payment calc
- **Connections**: Staff type (gem + payment) and Payment type (given/received)
- Dashboard with payment-by-set chart

### Universal
- **CalcInput**: every number cell supports math expressions (`5+3`, `10*2.5`) — auto-evaluates on blur, shows hover tooltip with original expression
- **Payment connections**: available in Leader and Manager modes — simple given/received tracking
- Professional PDF export with selectable sections in every detail page
- Dark/light mode, auto-save (800ms debounce), image uploads, JWT auth with refresh tokens

## Tech Stack
- Frontend: React 18, Vite, Tailwind, Zustand, Recharts, jsPDF
- Backend: Node.js, Express, MongoDB, Mongoose, JWT, Nodemailer

## Email OTP (optional)
Leave `EMAIL_USER`/`EMAIL_PASS` blank in `backend/.env` — OTPs print to backend console for dev/testing.
