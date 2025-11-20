const express = require('express');
const User = require('../models/User');
const Recording = require('../models/Recording');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.get('/', authMiddleware, async (req, res) => {
  const user = await User.findById(req.user.id).select('-passwordHash');
  const count = await Recording.countDocuments({ user: req.user.id });

  res.json({
    message: `Welcome ${user.name}`,
    stats: { recordingsCount: count },
    user
  });
});

module.exports = router;
