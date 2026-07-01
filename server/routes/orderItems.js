import express from 'express';
import { authenticate, requireRole } from '../middleware/auth.js';
import { asyncHandler } from '../lib/asyncHandler.js';
import { listActiveOrderItems, findOrderItemById, updateOrderItemStatus } from '../db/queries/orderItems.js';

const router = express.Router();

// Bartender board: every pending/preparing item across all tables.
router.get('/', authenticate, asyncHandler(async (req, res) => {
  const items = await listActiveOrderItems();
  return res.json({ items });
}));

const ALLOWED_STATUSES = ['pending', 'preparing', 'served', 'cancelled'];

router.patch('/:id/status', authenticate, requireRole('bartender', 'manager'), asyncHandler(async (req, res) => {
  const { status } = req.body || {};
  if (!ALLOWED_STATUSES.includes(status)) {
    return res.status(400).json({ error: `status must be one of ${ALLOWED_STATUSES.join(', ')}` });
  }
  const existing = await findOrderItemById(req.params.id);
  if (!existing) {
    return res.status(404).json({ error: 'Order item not found' });
  }
  const item = await updateOrderItemStatus(req.params.id, status);
  return res.json({ item });
}));

export default router;
