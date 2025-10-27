const router = require('express').Router();
const { authenticateToken } = require('../middleware/auth');
const Startup = require('../models/Startup');

// Get user's startup data (SINGLE STARTUP PER USER)
router.get('/my-data', authenticateToken, async (req, res) => {
  try {
    const startup = await Startup.findOne({ userId: req.user.id }).sort({ updatedAt: -1 });
    
    if (!startup) {
      return res.json({ startup: null });
    }

    res.json({ startup });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all startups (for admin)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const startups = await Startup.find({ userId: req.user.id });
    res.json(startups);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create or Update startup
router.post('/', authenticateToken, async (req, res) => {
  try {
    let startup = await Startup.findOne({ userId: req.user.id });
    
    if (startup) {
      // Update existing
      startup = await Startup.findOneAndUpdate(
        { userId: req.user.id },
        { ...req.body, userId: req.user.id },
        { new: true }
      );
    } else {
      // Create new
      startup = await Startup.create({
        ...req.body,
        userId: req.user.id
      });
    }
    
    res.status(201).json(startup);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete startup
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    await Startup.findOneAndDelete({ 
      _id: req.params.id, 
      userId: req.user.id 
    });
    res.json({ message: 'Startup deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
