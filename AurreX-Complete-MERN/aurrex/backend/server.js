require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const path = require('path');
const app = express();
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(rateLimit({ windowMs: 15*60*1000, max: 500 }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/auth',        require('./routes/auth'));
app.use('/api/projects',    require('./routes/projects'));
app.use('/api/connections', require('./routes/connections'));
app.use('/api/sets',        require('./routes/sets'));
app.get('/api/health', (_, res) => res.json({ status: 'ok', app: 'AurreX' }));
app.use((err, req, res, next) => res.status(500).json({ error: err.message }));
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/aurrex')
  .then(async () => {
    console.log('✅ MongoDB connected');
    await require('./utils/seed').createDemoUser();
    app.listen(process.env.PORT || 5000, () => {
      console.log('🚀 AurreX Server → http://localhost:' + (process.env.PORT || 5000));
      console.log('🔑 Demo: username=demo  password=Demo@1234');
    });
  }).catch(err => { console.error('❌', err.message); process.exit(1); });