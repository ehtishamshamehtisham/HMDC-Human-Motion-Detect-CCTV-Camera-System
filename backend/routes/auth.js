const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { generateToken, revokeToken } = require('../middleware/auth');

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: 'Email & password required' });

    const exist = await User.findOne({ email });
    if (exist) return res.status(400).json({ message: 'User exists' });

    const hash = await bcrypt.hash(password, 10);
    const user = new User({ name, email, passwordHash: hash });
    await user.save();

    const token = generateToken(user);
    res.json({ user, token });
  } catch (e) {
    res.status(500).json({ message: 'Error registering' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(400).json({ message: 'Invalid credentials' });

    const token = generateToken(user);
    res.json({ user, token });
  } catch (e) {
    res.status(500).json({ message: 'Error login' });
  }
});

router.post('/logout', (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (token) revokeToken(token);
    res.json({ message: "Logged out" });
  } catch {
    res.status(500).json({ message: "Error logging out" });
  }
});

module.exports = router;
