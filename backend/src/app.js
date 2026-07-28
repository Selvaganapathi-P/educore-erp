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
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173').split(',').map(o => o.trim());
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

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

// 404
app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found' }));

// Error handler
app.use((err, req, res, next) => {
  console.error(err.message);
  res.status(err.status || 500).json({ success: false, message: err.message || 'Server error' });
});

module.exports = app;
