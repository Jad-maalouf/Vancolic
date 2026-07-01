import express from 'express';
import { authenticate, requireRole } from '../middleware/auth.js';
import { asyncHandler } from '../lib/asyncHandler.js';
import { listTableOverview, findTableById, findOpenOrderForTable } from '../db/queries/tables.js';
import { openOrder } from '../db/queries/orders.js';

const router = express.Router();

router.get('/', authenticate, asyncHandler(async (req, res) => {
  const tables = await listTableOverview();
  return res.json({ tables });
}));

// Open a table for service: creates a new order with a client name if none is
// already open. If the table already has an open order, just returns it.
router.post('/:id/open', authenticate, requireRole('waiter', 'manager'), asyncHandler(async (req, res) => {
  const table = await findTableById(req.params.id);
  if (!table || !table.active) {
    return res.status(404).json({ error: 'Table not found' });
  }

  const existing = await findOpenOrderForTable(table.id);
  if (existing) {
    return res.json({ order: existing });
  }

  const { clientName } = req.body || {};
  const order = await openOrder({ tableId: table.id, clientName, openedBy: req.user.id });
  return res.status(201).json({ order });
}));

export default router;
