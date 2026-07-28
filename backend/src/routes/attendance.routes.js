const router     = require('express').Router();
const Attendance = require('../models/Attendance');
const Student    = require('../models/Student');
const { authenticate, adminOnly } = require('../middleware/auth');

router.use(authenticate);

// POST /api/attendance/mark — admin marks attendance for a class
router.post('/mark', adminOnly, async (req, res) => {
  try {
    const { date, records } = req.body; // records: [{ studentId, status, remarks }]
    if (!date || !records?.length) {
      return res.status(400).json({ success: false, message: 'date and records required' });
    }
    const d = new Date(date);
    const ops = records.map(r => ({
      updateOne: {
        filter: { studentId: r.studentId, date: d },
        update: { $set: { studentId: r.studentId, date: d, status: r.status, remarks: r.remarks || '', markedBy: req.user._id } },
        upsert: true,
      },
    }));
    await Attendance.bulkWrite(ops);
    res.json({ success: true, message: 'Attendance saved' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/attendance — admin gets by class/date; student gets own
router.get('/', async (req, res) => {
  try {
    const { studentId, class: cls, date, month, year } = req.query;
    const filter = {};

    if (req.user.role === 'student') {
      const s = await Student.findOne({ userId: req.user._id });
      if (!s) return res.json({ success: true, data: [] });
      filter.studentId = s._id;
    } else {
      if (studentId) filter.studentId = studentId;
      if (cls) {
        const students = await Student.find({ class: cls }).select('_id');
        filter.studentId = { $in: students.map(s => s._id) };
      }
    }

    if (date) {
      const d = new Date(date);
      filter.date = { $gte: new Date(d.setHours(0,0,0,0)), $lt: new Date(d.setHours(23,59,59,999)) };
    } else if (month && year) {
      const start = new Date(year, month - 1, 1);
      const end   = new Date(year, month, 1);
      filter.date = { $gte: start, $lt: end };
    }

    const data = await Attendance.find(filter).populate('studentId', 'name class section rollNumber').sort({ date: -1 });
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/attendance/summary/:studentId
router.get('/summary/:studentId', async (req, res) => {
  try {
    const { academicYear } = req.query;
    const filter = { studentId: req.params.studentId };
    if (academicYear) {
      const start = new Date(academicYear.split('-')[0], 5, 1); // June of start year
      const end   = new Date(academicYear.split('-')[1], 3, 30); // April of end year
      filter.date = { $gte: start, $lte: end };
    }
    const records = await Attendance.find(filter);
    const summary = { present: 0, absent: 0, leave: 0, half_day: 0, late: 0, total: records.length };
    records.forEach(r => { summary[r.status] = (summary[r.status] || 0) + 1; });
    res.json({ success: true, data: { summary, records } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
