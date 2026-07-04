const express = require('express');
const { authenticate, requireRole } = require('../middleware/auth.js');
const { asyncHandler } = require('../lib/asyncHandler.js');
const { listActiveOrderItems, findOrderItemById, updateOrderItemStatus, decrementOrderItemQuantity } = require('../db/queries/orderItems.js');
const { findOrderById } = require('../db/queries/orders.js');

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

// Remove ONE unit of an item from an open order. Any staff can do this.
// Multi-quantity rows are decremented; the last unit soft-cancels the row,
// which drops it off the bartender board and out of the totals.
router.delete('/:id', authenticate, asyncHandler(async (req, res) => {
  const existing = await findOrderItemById(req.params.id);
  if (!existing || existing.status === 'cancelled') {
    return res.status(404).json({ error: 'Order item not found' });
  }
  const order = await findOrderById(existing.order_id);
  if (!order || order.status !== 'open') {
    return res.status(400).json({ error: 'This order is already closed' });
  }
  let item = null;
  if (existing.quantity > 1) {
    item = await decrementOrderItemQuantity(req.params.id);
  }
  if (!item) {
    item = await updateOrderItemStatus(req.params.id, 'cancelled');
  }
  return res.json({ item });
}));

module.exports = router;
