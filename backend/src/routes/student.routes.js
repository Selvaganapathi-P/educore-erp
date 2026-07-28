const router  = require('express').Router();
const User    = require('../models/User');
const Student = require('../models/Student');
const { authenticate, adminOnly } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

// GET /api/students — list (admin) or self (student)
router.get('/', async (req, res) => {
  try {
    if (req.user.role === 'student') {
      const s = await Student.findOne({ userId: req.user._id });
      return res.json({ success: true, data: s ? [s] : [] });
    }
    const { search, class: cls, section, status, page = 1, limit = 30 } = req.query;
    const filter = {};
    if (cls)    filter.class   = cls;
    if (section) filter.section = section;
    if (status) filter.status  = status;
    if (search) {
      const re = new RegExp(search, 'i');
      filter.$or = [{ name: re }, { admissionNumber: re }, { email: re }];
    }
    const skip  = (Number(page) - 1) * Number(limit);
    const [data, total] = await Promise.all([
      Student.find(filter).sort({ class: 1, rollNumber: 1 }).skip(skip).limit(Number(limit)),
      Student.countDocuments(filter),
    ]);
    res.json({ success: true, data, meta: { total, page: Number(page), limit: Number(limit) } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/students/stats
router.get('/stats', adminOnly, async (req, res) => {
  try {
    const [total, byClass] = await Promise.all([
      Student.countDocuments({ status: 'active' }),
      Student.aggregate([
        { $match: { status: 'active' } },
        { $group: { _id: '$class', count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
    ]);
    res.json({ success: true, data: { total, byClass } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/students/:id
router.get('/:id', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).populate('userId', '-password');
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
    // Students can only view their own profile
    if (req.user.role === 'student') {
      const own = await Student.findOne({ userId: req.user._id });
      if (!own || own._id.toString() !== student._id.toString()) {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }
    }
    res.json({ success: true, data: student });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/students — admin creates student + user account
router.post('/', adminOnly, async (req, res) => {
  try {
    const {
      name, email, password = 'Student@123', phone, address,
      admissionNumber, fatherName, motherName, dateOfBirth, gender, bloodGroup,
      class: cls, section, rollNumber, academicYear,
    } = req.body;

    if (!name || !email || !cls || !academicYear || !admissionNumber) {
      return res.status(400).json({ success: false, message: 'Required fields missing' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(400).json({ success: false, message: 'Email already in use' });

    const admExisting = await Student.findOne({ admissionNumber });
    if (admExisting) return res.status(400).json({ success: false, message: 'Admission number already exists' });

    const user = await User.create({ name, email, password, role: 'student', phone, address });
    const student = await Student.create({
      userId: user._id, admissionNumber, name, fatherName, motherName,
      dateOfBirth, gender, bloodGroup, phone, email, address,
      class: cls, section, rollNumber, academicYear,
    });

    res.status(201).json({ success: true, data: student });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/students/:id — admin updates all fields; student updates limited fields
router.put('/:id', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ success: false, message: 'Not found' });

    if (req.user.role === 'student') {
      // Students can only update their own allowed fields
      const own = await Student.findOne({ userId: req.user._id });
      if (!own || own._id.toString() !== student._id.toString()) {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }
      const { phone, email, address } = req.body;
      Object.assign(student, { phone, email, address });
      // Update user account too
      await User.findByIdAndUpdate(student.userId, { phone, email });
    } else {
      const { name, fatherName, motherName, dateOfBirth, gender, bloodGroup,
        phone, email, address, class: cls, section, rollNumber, academicYear, status } = req.body;
      Object.assign(student, { name, fatherName, motherName, dateOfBirth, gender, bloodGroup,
        phone, email, address, class: cls, section, rollNumber, academicYear, status });
    }

    await student.save();
    res.json({ success: true, data: student });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/students/:id
router.delete('/:id', adminOnly, async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) return res.status(404).json({ success: false, message: 'Not found' });
    await User.findByIdAndDelete(student.userId);
    res.json({ success: true, message: 'Student deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
