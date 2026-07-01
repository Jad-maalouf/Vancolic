const express = require('express');
const bcrypt = require('bcryptjs');
const { authenticate, requireRole } = require('../middleware/auth.js');
const { asyncHandler } = require('../lib/asyncHandler.js');
const { listUsers, createUser, findUserRawById, updateUser } = require('../db/queries/users.js');

const router = express.Router();
const ROLES = ['manager', 'bartender', 'waiter'];

router.get('/', authenticate, requireRole('manager'), asyncHandler(async (req, res) => {
  const users = await listUsers();
  return res.json({ users });
}));

router.post('/', authenticate, requireRole('manager'), asyncHandler(async (req, res) => {
  const { fullName, email, password, role } = req.body || {};
  if (!fullName || !email || !password || !ROLES.includes(role)) {
    return res.status(400).json({ error: 'fullName, email, password, and a valid role are required' });
  }
  const passwordHash = await bcrypt.hash(password, 10);
  try {
    const user = await createUser({ fullName, email, passwordHash, role });
    return res.status(201).json({ user });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'A user with that email already exists' });
    }
    throw err;
  }
}));

router.patch('/:id', authenticate, requireRole('manager'), asyncHandler(async (req, res) => {
  const existing = await findUserRawById(req.params.id);
  if (!existing) {
    return res.status(404).json({ error: 'User not found' });
  }
  const body = req.body || {};
  if (body.role && !ROLES.includes(body.role)) {
    return res.status(400).json({ error: `role must be one of ${ROLES.join(', ')}` });
  }
  const passwordHash = body.password ? await bcrypt.hash(body.password, 10) : existing.password_hash;
  const user = await updateUser(req.params.id, {
    fullName: body.fullName ?? existing.full_name,
    role: body.role ?? existing.role,
    active: body.active ?? existing.active,
    passwordHash,
  });
  return res.json({ user });
}));

module.exports = router;
