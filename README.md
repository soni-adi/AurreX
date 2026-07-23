# ◆ AurreX — Jewellery Management System

Full-stack MERN app with **Leader**, **Staff**, and **Manager** modes.

---

## 🔑 Demo Account
| Field    | Value           |
|----------|-----------------|
| Username | `demo`          |
| Password | `Demo@1234`     |
| Email    | `demo@aurrex.com` |

---

## 📁 Project Structure
```
aurrex/
├── backend/          Express API
│   ├── .env          ← EDIT THIS (never commit to git)
│   ├── .env.example  ← Template — copy and fill
│   └── ...
├── frontend/         Vite + React
│   ├── .env.local    ← EDIT THIS for local dev
│   ├── .env.example  ← Template
│   ├── vercel.json   ← Vercel SPA routing
│   └── ...
├── render.yaml       ← Render.com deployment
├── .gitignore
└── README.md
```

---

## 🔧 What To Change Before Deploying

### 1. MongoDB URI
**File:** `backend/.env`
```
MONGO_URI=mongodb+srv://YOUR_USER:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/aurrex
```
- Get from: [MongoDB Atlas](https://cloud.mongodb.com) → **Connect → Drivers → Copy string**
- Replace `YOUR_USER`, `YOUR_PASSWORD`, and cluster domain
- Make sure your Atlas cluster's **Network Access** allows `0.0.0.0/0` (or your server IP)

### 2. JWT Secrets
**File:** `backend/.env`
```
JWT_SECRET=REPLACE_WITH_64_RANDOM_CHARS
JWT_REFRESH_SECRET=REPLACE_WITH_DIFFERENT_64_RANDOM_CHARS
```
- Generate: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`
- Run it twice to get two different secrets
- ⚠️ Never reuse or share these

### 3. Client URL (CORS)
**File:** `backend/.env`
```
CLIENT_URL=https://your-aurrex.vercel.app
```
- Set to your **Vercel frontend URL** after deploying
- Multiple origins: `CLIENT_URL=https://app.vercel.app,https://custom-domain.com`

### 4. Email OTP (optional)
**File:** `backend/.env`
```
EMAIL_USER=your@gmail.com
EMAIL_PASS=xxxx xxxx xxxx xxxx
```
- Use a **Gmail App Password** (not your real password)
- Guide: https://myaccount.google.com/apppasswords → Select app: Mail
- **Leave blank** to print OTPs to the terminal in dev

### 5. Frontend API URL
**File:** `frontend/.env.local` (dev) or Vercel env var (production)
```
VITE_API_URL=https://your-aurrex-backend.up.railway.app
```

---

## 🚀 Local Development

### Prerequisites
- Node.js 18+
- MongoDB running locally (`mongod`) **OR** MongoDB Atlas URI

### Start Backend
```bash
cd backend
cp .env.example .env   # then edit .env with your values
npm install
npm run dev
```
✅ Should print:
```
✅ MongoDB connected
🚀 AurreX backend → http://localhost:5000
🔑 Demo user → username: demo  password: Demo@1234
```

### Start Frontend
```bash
cd frontend
cp .env.example .env.local   # or just use the existing .env.local
npm install
npm run dev
```
Open → **http://localhost:5173**

---

## ☁️ Deploying to Vercel + Railway (Recommended — Free)

### Step 1: Deploy Backend to Railway
1. Push code to GitHub
2. Go to [railway.app](https://railway.app) → **New Project → Deploy from GitHub**
3. Select the `backend` folder (or set Root Directory to `backend`)
4. Add these **environment variables** in Railway dashboard:
   ```
   NODE_ENV=production
   PORT=5000
   MONGO_URI=<your Atlas URI>
   JWT_SECRET=<64 random chars>
   JWT_REFRESH_SECRET=<different 64 random chars>
   CLIENT_URL=https://your-app.vercel.app
   EMAIL_USER=<gmail> (optional)
   EMAIL_PASS=<app password> (optional)
   ```
5. Railway gives you a URL like: `https://aurrex-backend.up.railway.app`

### Step 2: Deploy Frontend to Vercel
1. Go to [vercel.com](https://vercel.com) → **New Project → Import from GitHub**
2. Set **Root Directory** to `frontend`
3. Framework: **Vite** (auto-detected)
4. Add environment variable:
   ```
   VITE_API_URL=https://aurrex-backend.up.railway.app
   ```
5. Deploy → get URL like `https://aurrex.vercel.app`

### Step 3: Update CORS in Backend
Go back to Railway → update `CLIENT_URL` to your Vercel URL → redeploy.

---

## ☁️ Deploy to Render.com (Alternative — Free)

This repo has a `render.yaml` at the root — Render auto-detects it.
1. Go to [render.com](https://render.com) → **New → Blueprint**
2. Connect your repo
3. Fill in the 3 `sync: false` env vars (MONGO_URI, CLIENT_URL, VITE_API_URL)
4. Deploy both services

---

## ☁️ Deploy to Heroku (Alternative)

```bash
# Backend
cd backend
heroku create aurrex-backend
heroku config:set NODE_ENV=production MONGO_URI="..." JWT_SECRET="..." JWT_REFRESH_SECRET="..." CLIENT_URL="..."
git subtree push --prefix backend heroku main

# Frontend — build and deploy to Vercel separately
```

---

## 🔒 Security Features
- JWT stored only in **httpOnly cookies** (inaccessible to JavaScript — XSS-safe)
- `sameSite: strict` in production cookies
- Authorization header intentionally rejected (prevents token theft via XSS)
- Rate limiting on all routes (20 req/15 min on auth, 500 on rest)
- Helmet security headers
- CORS restricted to `CLIENT_URL` only
- `trust proxy: 1` for correct IP detection behind reverse proxies
- Access tokens expire in 15 minutes; refresh tokens in 30 days (max 5 per user)
- Password hashed with bcrypt (12 rounds)
- OTP expires in 10 minutes

---

## 🛠️ Features

### Leader Mode (amber)
- **Detailed Projects** — Pakal + Tachhi tables, gem packing/setting, full gold tracking
- **Gold Used (auto)** = WT After − WT Before per Pakal row
- **Gold in Box** = Added + Gold Received − Removed − Gold Given
- **Gold Used Without Wastage** = Sum Pakal Gold Used − Sum Tachhi Tach
- **Gold Used With Wastage** = Gold Used Without Wastage + (Wastage% × Gold Given)
- Gem Count modal on completion (powers dashboard pie chart)
- Bill Print PDF export with selectable sections
- Add Data sections for multi-set projects

### Staff Mode (blue)
- Boss connections — gem entry + payment entry
- Balance = Gem Work − Received (negative = overpaid, shown in red)
- Monthly gem count chart with average reference line

### Manager Mode (violet)
- Sets with gem table (gram/carat toggle), persons table, auto-payment calc
- Staff + Payment connections

### Universal
- **CalcInput** — all number fields support math expressions (`5+3`, `10*2.5`)
- Dark / Light mode
- PDF export from every detail page
- Auto-save (1s debounce)
- Image uploads (set/connection photos)
- OTP email verification + forgot password

---

## 📦 Tech Stack
| Layer     | Tech                              |
|-----------|-----------------------------------|
| Frontend  | React 18, Vite, Tailwind CSS      |
| State     | Zustand (persisted)               |
| Router    | React Router v6 (lazy-loaded)     |
| Charts    | Recharts                          |
| PDF       | jsPDF + jspdf-autotable           |
| Backend   | Node.js, Express                  |
| Database  | MongoDB + Mongoose                |
| Auth      | JWT (httpOnly cookies)            |
| Email     | Nodemailer (Gmail SMTP)           |
| Deploy    | Vercel (frontend) + Railway (backend) |
