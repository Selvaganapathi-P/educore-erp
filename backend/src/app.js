const express       = require('express');
const cors          = require('cors');
const helmet        = require('helmet');
const morgan        = require('morgan');
const compression   = require('compression');
const cookieParser  = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit     = require('express-rate-limit');

const { env }    = require('./config/env');
const { logger } = require('./utils/logger');
const { notFound, errorHandler } = require('./middleware/error.middleware');
const { aiLimiter, helmetOptions, sanitizeRequest } = require('./middleware/security.middleware');

const authRoutes     = require('./modules/auth/auth.routes');
const userRoutes     = require('./modules/users/user.routes');
const schoolRoutes   = require('./modules/schools/school.routes');
const settingsRoutes = require('./modules/settings/settings.routes');
const platformRoutes = require('./modules/platform/platform.routes');
const roleRoutes      = require('./modules/roles/role.routes');
const admissionRoutes = require('./modules/admissions/admission.routes');
const studentRoutes   = require('./modules/students/student.routes');
const staffRoutes     = require('./modules/staff/staff.routes');
const academicRoutes    = require('./modules/academics/academics.routes');
const attendanceRoutes  = require('./modules/attendance/attendance.routes');
const homeworkRoutes    = require('./modules/homework/homework.routes');
const examRoutes        = require('./modules/exams/exam.routes');
const feesRoutes          = require('./modules/fees/fees.routes');
const communicationRoutes = require('./modules/communication/communication.routes');
const libraryRoutes       = require('./modules/library/library.routes');
const transportRoutes     = require('./modules/transport/transport.routes');
const hostelRoutes        = require('./modules/hostel/hostel.routes');
const inventoryRoutes     = require('./modules/inventory/inventory.routes');
const healthRoutes        = require('./modules/health/health.routes');
const eventsRoutes        = require('./modules/events/events.routes');
const reportsRoutes       = require('./modules/reports/reports.routes');
const aiRoutes            = require('./modules/ai/ai.routes');

const app = express();

// ── Security ────────────────────────────────────────────────────────────────
app.use(helmet(helmetOptions()));

// Allow production origin + Vercel preview URLs (*.vercel.app)
const allowedOrigins = [
  env.CLIENT_URL,
  /https:\/\/.*\.vercel\.app$/,
].filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    // Allow server-to-server (no origin) and matched origins
    if (!origin) return cb(null, true);
    const ok = allowedOrigins.some(o =>
      typeof o === 'string' ? o === origin : o.test(origin)
    );
    cb(ok ? null : new Error(`CORS: origin ${origin} not allowed`), ok);
  },
  credentials:    true,
  methods:        ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
}));
app.set('trust proxy', 1);

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max:      300,
  standardHeaders: true,
  legacyHeaders:   false,
  message: { success: false, message: 'Too many requests — try again later.' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max:      20,
  message: { success: false, message: 'Too many login attempts — wait 15 minutes.' },
});

// ── Body / Cookies ──────────────────────────────────────────────────────────
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(mongoSanitize());
app.use(sanitizeRequest);

// ── Logging ─────────────────────────────────────────────────────────────────
app.use(env.isDev
  ? morgan('dev')
  : morgan('combined', { stream: { write: (m) => logger.http(m.trim()) } })
);

// ── Health ───────────────────────────────────────────────────────────────────
app.get('/health', async (_req, res) => {
  const mongoose = require('mongoose');
  const dbState  = ['disconnected','connected','connecting','disconnecting'];
  res.json({
    status:    'ok',
    timestamp: new Date().toISOString(),
    env:       env.NODE_ENV,
    db:        dbState[mongoose.connection.readyState] ?? 'unknown',
    uptime:    Math.floor(process.uptime()),
    mem:       process.memoryUsage().rss,
  });
});

// ── Routes ───────────────────────────────────────────────────────────────────
app.use('/api', globalLimiter);
app.use('/api/auth',     authLimiter, authRoutes);
app.use('/api/users',    userRoutes);
app.use('/api/schools',  schoolRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/platform', platformRoutes);
app.use('/api/roles',      roleRoutes);
app.use('/api/admissions', admissionRoutes);
app.use('/api/students',  studentRoutes);
app.use('/api/staff',     staffRoutes);
app.use('/api/academics',   academicRoutes);
app.use('/api/attendance',  attendanceRoutes);
app.use('/api/homework',    homeworkRoutes);
app.use('/api/exams',       examRoutes);
app.use('/api/fees',          feesRoutes);
app.use('/api/communication', communicationRoutes);
app.use('/api/library',      libraryRoutes);
app.use('/api/transport',    transportRoutes);
app.use('/api/hostel',       hostelRoutes);
app.use('/api/inventory',    inventoryRoutes);
app.use('/api/health',       healthRoutes);
app.use('/api/events',       eventsRoutes);
app.use('/api/reports',      reportsRoutes);
app.use('/api/ai',           aiLimiter, aiRoutes);

// ── 404 & Error ──────────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

module.exports = app;
