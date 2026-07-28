const express      = require('express');
const cors         = require('cors');
const helmet       = require('helmet');
const cookieParser = require('cookie-parser');
const rateLimit    = require('express-rate-limit');

const authRoutes       = require('./routes/auth.routes');
const studentRoutes    = require('./routes/student.routes');
const attendanceRoutes = require('./routes/attendance.routes');
const resultRoutes     = require('./routes/result.routes');
const feeRoutes        = require('./routes/fee.routes');
const publicRoutes        = require('./routes/public.routes');
const announcementRoutes  = require('./routes/announcement.routes');

const app = express();

// Trust proxy (Render / Vercel)
app.set('trust proxy', 1);

// Security
app.use(helmet());

// CORS
app.use(cors({ origin: true, credentials: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  keyGenerator: (req) => req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/auth', limiter);

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use('/api/auth',       authRoutes);
app.use('/api/students',   studentRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/results',    resultRoutes);
app.use('/api/fees',       feeRoutes);
app.use('/api/public',         publicRoutes);
app.use('/api/announcements',  announcementRoutes);

// Health
app.get('/health', (_, res) => res.json({ status: 'ok' }));

// One-time seed — creates admin if none exists, safe to call multiple times
app.get('/api/seed', async (req, res) => {
  try {
    const User = require('./models/User');
    const existing = await User.findOne({ role: 'admin' });
    if (existing) {
      return res.json({ success: true, message: 'Admin already exists', email: existing.email });
    }
    await User.create({ name: 'School Admin', email: 'admin@school.com', password: 'Admin@123', role: 'admin', status: 'active' });
    res.json({ success: true, message: 'Admin created', email: 'admin@school.com', password: 'Admin@123' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 404
app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found' }));

// Error handler
app.use((err, req, res, next) => {
  console.error(err.message);
  res.status(err.status || 500).json({ success: false, message: err.message || 'Server error' });
});

module.exports = app;
