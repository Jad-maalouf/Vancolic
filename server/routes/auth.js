import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler } from '../lib/asyncHandler.js';
import { findUserByEmail, findUserById } from '../db/queries/users.js';

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

export default router;
