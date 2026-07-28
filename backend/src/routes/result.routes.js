const router  = require('express').Router();
const Result  = require('../models/Result');
const Student = require('../models/Student');
const { authenticate, adminOnly } = require('../middleware/auth');

router.use(authenticate);

// POST /api/results — admin publishes result
router.post('/', adminOnly, async (req, res) => {
  try {
    const { studentId, examType, academicYear, subjects } = req.body;
    if (!studentId || !examType || !academicYear || !subjects?.length) {
      return res.status(400).json({ success: false, message: 'All fields required' });
    }
    // Replace existing result for same student+exam+year
    await Result.findOneAndDelete({ studentId, examType, academicYear });
    const result = await Result.create({ studentId, examType, academicYear, subjects, publishedBy: req.user._id });
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/results — admin lists all; student gets own
router.get('/', async (req, res) => {
  try {
    const { studentId, examType, academicYear } = req.query;
    const filter = {};

    if (req.user.role === 'student') {
      const s = await Student.findOne({ userId: req.user._id });
      if (!s) return res.json({ success: true, data: [] });
      filter.studentId = s._id;
    } else {
      if (studentId) filter.studentId = studentId;
    }

    if (examType)     filter.examType     = examType;
    if (academicYear) filter.academicYear = academicYear;

    const data = await Result.find(filter)
      .populate('studentId', 'name class section admissionNumber')
      .sort({ createdAt: -1 });
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/results/:id
router.delete('/:id', adminOnly, async (req, res) => {
  try {
    await Result.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Result deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
