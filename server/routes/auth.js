const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { authenticate } = require('../middleware/auth.js');
const { asyncHandler } = require('../lib/asyncHandler.js');
const { findUserByEmail, findUserById } = require('../db/queries/users.js');

const router = express.Router();
const TOKEN_TTL = '12h';

router.post('/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: 'email and password are required' });
  }

  const user = await findUserByEmail(email);
  if (!user || !user.active) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const matches = await bcrypt.compare(password, user.password_hash);
  if (!matches) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const token = jwt.sign({ sub: user.id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: TOKEN_TTL,
  });

  return res.json({
    token,
    user: { id: user.id, fullName: user.full_name, email: user.email, role: user.role },
  });
}));

router.get('/me', authenticate, asyncHandler(async (req, res) => {
  const user = await findUserById(req.user.id);
  if (!user || !user.active) {
    return res.status(401).json({ error: 'User no longer active' });
  }
  return res.json({
    user: { id: user.id, fullName: user.full_name, email: user.email, role: user.role },
  });
}));

module.exports = router;
