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

// Seed 10 students per class (Classes 1–10), safe to call multiple times
app.get('/api/seed-students', async (req, res) => {
  try {
    const User    = require('./models/User');
    const Student = require('./models/Student');

    const firstNames = ['Aarav','Priya','Karthik','Divya','Rahul','Anitha','Vijay','Lakshmi','Arjun','Meena',
                        'Surya','Kavitha','Dinesh','Nithya','Praveen','Saranya','Arun','Pooja','Naveen','Revathi'];
    const lastNames  = ['Kumar','Sharma','Patel','Nair','Rajan','Krishnan','Murugan','Subramanian','Pillai','Reddy'];

    const genders    = ['male','female','male','female','male','female','male','female','male','female'];
    const bloodGroups = ['A+','B+','O+','AB+','A-','B-','O-','AB+','A+','B+'];
    const sections   = ['A','B'];
    const academicYear = '2025-2026';
    const classes    = ['1','2','3','4','5','6','7','8','9','10'];

    let created = 0, skipped = 0;
    let counter = 1;

    for (const cls of classes) {
      for (let i = 0; i < 10; i++) {
        const fn   = firstNames[i];
        const ln   = lastNames[i % lastNames.length];
        const name = `${fn} ${ln}`;
        const admNo = `EDU2025${String(counter).padStart(3,'0')}`;
        const email = `student${counter}@school.com`;

        const existingUser = await User.findOne({ email });
        const existingAdm  = await Student.findOne({ admissionNumber: admNo });

        if (existingUser || existingAdm) { skipped++; counter++; continue; }

        const dob = new Date(2012 - parseInt(cls), i % 12, (i % 28) + 1);

        const user = await User.create({
          name, email, password: 'Student@123', role: 'student', status: 'active',
        });

        await Student.create({
          userId: user._id,
          admissionNumber: admNo,
          name,
          fatherName:  `${lastNames[i % lastNames.length]} Rajan`,
          motherName:  `${firstNames[(i + 5) % firstNames.length]} ${lastNames[i % lastNames.length]}`,
          dateOfBirth: dob,
          gender:      genders[i],
          bloodGroup:  bloodGroups[i],
          phone:       `98${String(4000000000 + counter).slice(1)}`,
          email,
          address:     `${counter}, Anna Nagar, Chennai - 600040`,
          class:       cls,
          section:     sections[i % 2],
          rollNumber:  String(i + 1),
          academicYear,
          status: 'active',
        });

        created++;
        counter++;
      }
    }

    res.json({
      success: true,
      message: `Seeding complete`,
      created,
      skipped,
      total: created + skipped,
      note: 'All student passwords are Student@123',
    });
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
