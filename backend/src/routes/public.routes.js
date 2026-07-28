const router       = require('express').Router();
const Announcement = require('../models/Announcement');

// GET /api/public/announcements — for homepage, no auth required
router.get('/announcements', async (req, res) => {
  try {
    const { limit = 5 } = req.query;
    const data = await Announcement.find({ important: true })
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .select('title content category createdAt');
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
