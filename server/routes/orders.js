const express = require('express');
const { authenticate, requireRole } = require('../middleware/auth.js');
const { asyncHandler } = require('../lib/asyncHandler.js');
const { findOrderById, listOpenOrders, closeOrder, listClosedOrders } = require('../db/queries/orders.js');
const { listItemsForOrder, addOrderItem } = require('../db/queries/orderItems.js');
const { findMenuItemById } = require('../db/queries/menuItems.js');

const router = express.Router();

// Full floor visibility: any authenticated staff can see all open orders.
router.get('/', authenticate, asyncHandler(async (req, res) => {
  const orders = await listOpenOrders();
  return res.json({ orders });
}));

// Manager reporting: closed (paid/cancelled) tabs, optionally filtered by closed_at date range.
router.get('/closed', authenticate, requireRole('manager'), asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  const orders = await listClosedOrders({ startDate, endDate });
  return res.json({ orders });
}));

router.get('/:id/items', authenticate, asyncHandler(async (req, res) => {
  const order = await findOrderById(req.params.id);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }
  const items = await listItemsForOrder(order.id);
  return res.json({ items });
}));

router.post('/:id/items', authenticate, requireRole('waiter', 'manager'), asyncHandler(async (req, res) => {
  const order = await findOrderById(req.params.id);
  if (!order || order.status !== 'open') {
    return res.status(404).json({ error: 'Open order not found' });
  }

  const { menuItemId, priceType, quantity, notes, withMixer } = req.body || {};
  if (!menuItemId || !['bottle', 'glass'].includes(priceType)) {
    return res.status(400).json({ error: 'menuItemId and priceType ("bottle" or "glass") are required' });
  }
  if (notes != null && typeof notes !== 'string') {
    return res.status(400).json({ error: 'notes must be a string' });
  }
  const trimmedNotes = notes ? notes.trim().slice(0, 200) : null;

  const menuItem = await findMenuItemById(menuItemId);
  if (!menuItem || !menuItem.active) {
    return res.status(404).json({ error: 'Menu item not found' });
  }
  let unitPrice = priceType === 'bottle' ? menuItem.bottle_price : menuItem.glass_price;
  if (unitPrice == null) {
    return res.status(400).json({ error: `This item has no ${priceType} price` });
  }
  if (withMixer) {
    if (menuItem.mixer_price == null || priceType !== 'glass') {
      return res.status(400).json({ error: 'This item cannot be ordered with a mixer' });
    }
    unitPrice = Number(unitPrice) + Number(menuItem.mixer_price);
  }

  const item = await addOrderItem({
    orderId: order.id,
    menuItemId,
    priceType,
    unitPrice,
    quantity: Number(quantity) > 0 ? Number(quantity) : 1,
    notes: trimmedNotes || null,
    orderedBy: req.user.id,
    mixerLabel: withMixer ? menuItem.mixer_label : null,
  });
  return res.status(201).json({ item });
}));

// Manager marks a table's tab paid (or cancelled) and closes it out.
router.patch('/:id/close', authenticate, requireRole('manager'), asyncHandler(async (req, res) => {
  const { status } = req.body || {};
  if (!['paid', 'cancelled'].includes(status)) {
    return res.status(400).json({ error: 'status must be "paid" or "cancelled"' });
  }
  const order = await closeOrder(req.params.id, { closedBy: req.user.id, status });
  if (!order) {
    return res.status(404).json({ error: 'Open order not found' });
  }
  return res.json({ order });
}));

module.exports = router;
