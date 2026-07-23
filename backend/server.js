'use strict';
require('dotenv').config();
const express      = require('express');
const mongoose     = require('mongoose');
const cors         = require('cors');
const helmet       = require('helmet');
const cookieParser = require('cookie-parser');
const rateLimit    = require('express-rate-limit');
const path         = require('path');

const app = express();

// ── Trust proxy (Railway / Render / Heroku sit behind one) ─────────────────
app.set('trust proxy', 1);

// ── Security headers ────────────────────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false,          // managed by Vercel headers
}));

// ── CORS — only allow the configured frontend origin ────────────────────────
const ALLOWED_ORIGINS = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',').map(o => o.trim()).filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    // allow server-to-server (origin=undefined) and whitelisted origins
    if (!origin || ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
    cb(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
  methods: ['GET','POST','PUT','DELETE','PATCH','OPTIONS'],
  allowedHeaders: ['Content-Type'],
}));

// ── Rate limiting ────────────────────────────────────────────────────────────
const globalLimiter = rateLimit({ windowMs: 15*60*1000, max: 500, standardHeaders: true, legacyHeaders: false });
const authLimiter   = rateLimit({ windowMs: 15*60*1000, max: 20,  standardHeaders: true, legacyHeaders: false,
  message: { error: 'Too many auth attempts, try again in 15 minutes' },
});

app.use(globalLimiter);
app.use(express.json({ limit: '8mb' }));
app.use(express.urlencoded({ extended: true, limit: '8mb' }));
app.use(cookieParser());

// ── Static uploads ───────────────────────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  maxAge: '7d',
  etag: true,
}));

// ── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth',        authLimiter, require('./routes/auth'));
app.use('/api/projects',    require('./routes/projects'));
app.use('/api/connections', require('./routes/connections'));
app.use('/api/sets',        require('./routes/sets'));

// Health check (used by Render / Railway)
app.get('/api/health', (_, res) => res.json({ status: 'ok', app: 'AurreX', env: process.env.NODE_ENV }));

// 404
app.use((req, res) => res.status(404).json({ error: `Route ${req.method} ${req.path} not found` }));

// Global error handler
app.use((err, req, res, _next) => {
  console.error('[Error]', err.message);
  res.status(err.status || 500).json({ error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message });
});

// ── MongoDB ──────────────────────────────────────────────────────────────────
const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) { console.error('❌ MONGO_URI is not set. Check your .env file.'); process.exit(1); }

mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 8000 })
  .then(async () => {
    console.log('✅ MongoDB connected');
    await require('./utils/seed').createDemoUser();
    const PORT = parseInt(process.env.PORT || '5000', 10);
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 AurreX backend → http://localhost:${PORT}`);
      console.log(`🌍 Environment   → ${process.env.NODE_ENV}`);
      console.log(`🔗 Allowed CORS  → ${ALLOWED_ORIGINS.join(', ')}`);
    });
  })
  .catch(err => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });
