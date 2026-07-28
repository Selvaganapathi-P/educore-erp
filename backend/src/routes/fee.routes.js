const router  = require('express').Router();
const Fee     = require('../models/Fee');
const Student = require('../models/Student');
const { authenticate, adminOnly } = require('../middleware/auth');

router.use(authenticate);

const genReceipt = () => 'RCP' + Date.now().toString().slice(-8);

// POST /api/fees — admin adds fee
router.post('/', adminOnly, async (req, res) => {
  try {
    const { studentId, feeType, description, amount, dueDate, academicYear } = req.body;
    if (!studentId || !feeType || !amount || !academicYear) {
      return res.status(400).json({ success: false, message: 'Required fields missing' });
    }
    const fee = await Fee.create({ studentId, feeType, description, amount, dueDate, academicYear, addedBy: req.user._id });
    res.status(201).json({ success: true, data: fee });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/fees — list
router.get('/', async (req, res) => {
  try {
    const { studentId, status, academicYear, feeType } = req.query;
    const filter = {};

    if (req.user.role === 'student') {
      const s = await Student.findOne({ userId: req.user._id });
      if (!s) return res.json({ success: true, data: [] });
      filter.studentId = s._id;
    } else {
      if (studentId) filter.studentId = studentId;
    }

    if (status)       filter.status       = status;
    if (academicYear) filter.academicYear = academicYear;
    if (feeType)      filter.feeType      = feeType;

    const data = await Fee.find(filter)
      .populate('studentId', 'name class section admissionNumber')
      .sort({ createdAt: -1 });
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/fees/:id/pay — mark as paid (admin) or initiate online payment (student)
router.put('/:id/pay', async (req, res) => {
  try {
    const fee = await Fee.findById(req.params.id);
    if (!fee) return res.status(404).json({ success: false, message: 'Fee not found' });

    const { amount, paymentMode = 'cash' } = req.body;
    const paid = Number(amount) || fee.amount;

    fee.paidAmount  = paid;
    fee.paymentMode = paymentMode;
    fee.paymentDate = new Date();
    fee.receiptNo   = fee.receiptNo || genReceipt();
    fee.status      = paid >= fee.amount ? 'paid' : 'partial';
    await fee.save();

    res.json({ success: true, data: fee });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/fees/:id
router.delete('/:id', adminOnly, async (req, res) => {
  try {
    await Fee.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Fee deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/fees/stats — admin fee summary
router.get('/stats', adminOnly, async (req, res) => {
  try {
    const { academicYear } = req.query;
    const match = academicYear ? { academicYear } : {};
    const [stats] = await Fee.aggregate([
      { $match: match },
      { $group: {
        _id: null,
        totalAmount:   { $sum: '$amount' },
        collectedAmount: { $sum: '$paidAmount' },
        pendingCount:  { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
        paidCount:     { $sum: { $cond: [{ $eq: ['$status', 'paid'] }, 1, 0] } },
      }},
    ]);
    res.json({ success: true, data: stats || { totalAmount: 0, collectedAmount: 0, pendingCount: 0, paidCount: 0 } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
