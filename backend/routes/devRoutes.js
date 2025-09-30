const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { success, error } = require('../utils/response');

// DEV ONLY: promote user by email (works with in-memory DB)
router.post('/promote', async (req, res) => {
  try {
    const { email, role = 'admin' } = req.body;
    if (!email) return res.status(400).json(error('Email required'));
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json(error('User not found'));
    user.role = role;
    await user.save();
    return res.json(success('User role updated', { email: user.email, role: user.role }));
  } catch (err) {
    console.error(err);
    return res.status(500).json(error('Failed to update role', err.message));
  }
});

module.exports = router;