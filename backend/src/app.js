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

// Seed 10 students per class (Classes 1–10) — bulk insert for speed
app.get('/api/seed-students', async (req, res) => {
  try {
    const bcrypt  = require('bcryptjs');
    const mongoose = require('mongoose');
    const User    = require('./models/User');
    const Student = require('./models/Student');

    const firstNames  = ['Aarav','Priya','Karthik','Divya','Rahul','Anitha','Vijay','Lakshmi','Arjun','Meena'];
    const lastNames   = ['Kumar','Sharma','Patel','Nair','Rajan','Krishnan','Murugan','Subramanian','Pillai','Reddy'];
    const genders     = ['male','female','male','female','male','female','male','female','male','female'];
    const bloodGroups = ['A+','B+','O+','AB+','A-','B-','O-','AB+','A+','B+'];
    const sections    = ['A','B','A','B','A','B','A','B','A','B'];
    const academicYear = '2025-2026';
    const classes     = ['1','2','3','4','5','6','7','8','9','10'];

    // Hash password once — reuse for all students
    const hashedPwd = await bcrypt.hash('Student@123', 10);

    // Build all user + student docs
    const userDocs    = [];
    const studentMeta = []; // {admNo, cls, i, counter}

    let counter = 1;
    for (const cls of classes) {
      for (let i = 0; i < 10; i++) {
        const name  = `${firstNames[i]} ${lastNames[i]}`;
        const email = `student${counter}@school.com`;
        const admNo = `EDU2025${String(counter).padStart(3,'0')}`;
        userDocs.push({
          _id: new mongoose.Types.ObjectId(),
          name, email, password: hashedPwd, role: 'student', status: 'active',
        });
        studentMeta.push({ name, email, admNo, cls, i, counter });
        counter++;
      }
    }

    // Skip emails that already exist
    const existingEmails = new Set(
      (await User.find({ email: { $in: userDocs.map(u => u.email) } }).select('email')).map(u => u.email)
    );
    const existingAdmNos = new Set(
      (await Student.find({ admissionNumber: { $in: studentMeta.map(s => s.admNo) } }).select('admissionNumber')).map(s => s.admissionNumber)
    );

    const newUsers    = userDocs.filter(u => !existingEmails.has(u.email));
    const newStudents = studentMeta.filter(s => !existingEmails.has(s.email) && !existingAdmNos.has(s.admNo));

    if (newUsers.length === 0) {
      return res.json({ success: true, message: 'All students already seeded', created: 0, skipped: userDocs.length });
    }

    // Bulk insert users (password already hashed — bypass pre-save hook)
    await User.insertMany(newUsers, { ordered: false });

    // Map email → _id
    const userMap = {};
    newUsers.forEach(u => { userMap[u.email] = u._id; });

    // Build student docs
    const studentDocs = newStudents.map(({ name, email, admNo, cls, i, counter: c }) => ({
      userId:          userMap[email],
      admissionNumber: admNo,
      name,
      fatherName:      `${lastNames[i]} Rajan`,
      motherName:      `${firstNames[(i + 5) % firstNames.length]} ${lastNames[i]}`,
      dateOfBirth:     new Date(2013 - parseInt(cls), i % 12, (i % 28) + 1),
      gender:          genders[i],
      bloodGroup:      bloodGroups[i],
      phone:           `98${String(4000000000 + c).slice(1)}`,
      email,
      address:         `${c}, Anna Nagar, Chennai - 600040`,
      class:           cls,
      section:         sections[i],
      rollNumber:      String(i + 1),
      academicYear,
      status:          'active',
    }));

    await Student.insertMany(studentDocs, { ordered: false });

    res.json({
      success: true,
      message:  'Seeding complete',
      created:  newStudents.length,
      skipped:  userDocs.length - newUsers.length,
      total:    userDocs.length,
      note:     'All student passwords: Student@123',
      sample:   { email: 'student1@school.com', password: 'Student@123' },
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
