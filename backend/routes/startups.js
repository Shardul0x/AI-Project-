const router = require('express').Router();
const { authenticateToken } = require('../middleware/auth');
const Startup = require('../models/Startup');

// Get user's startups
router.get('/', authenticateToken, async (req, res) => {
  try {
    const startups = await Startup.find({ userId: req.user.id });
    res.json(startups);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create startup
router.post('/', authenticateToken, async (req, res) => {
  try {
    const startup = await Startup.create({
      ...req.body,
      userId: req.user.id
    });
    res.status(201).json(startup);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
