const router       = require('express').Router();
const Announcement = require('../models/Announcement');
const { authenticate, adminOnly } = require('../middleware/auth');

// GET /api/announcements — public list (limited) or admin full list
router.get('/', async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    const data = await Announcement.find()
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .populate('createdBy', 'name');
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/announcements — admin creates
router.post('/', authenticate, adminOnly, async (req, res) => {
  try {
    const { title, content, category = 'general', important = false } = req.body;
    if (!title || !content) return res.status(400).json({ success: false, message: 'Title and content required' });
    const a = await Announcement.create({ title, content, category, important, createdBy: req.user._id });
    res.status(201).json({ success: true, data: a });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/announcements/:id
router.delete('/:id', authenticate, adminOnly, async (req, res) => {
  try {
    await Announcement.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
