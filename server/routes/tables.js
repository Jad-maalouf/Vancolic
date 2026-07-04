const express = require('express');
const { authenticate, requireRole } = require('../middleware/auth.js');
const { asyncHandler } = require('../lib/asyncHandler.js');
const { listTableOverview, findTableById, findOpenOrderForTable, updateTableLabel } = require('../db/queries/tables.js');
const { openOrder } = require('../db/queries/orders.js');

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

  const { clientName, personsCount } = req.body || {};
  const persons = Number(personsCount);
  const order = await openOrder({
    tableId: table.id,
    clientName,
    personsCount: Number.isInteger(persons) && persons > 0 ? persons : null,
    openedBy: req.user.id,
  });
  return res.status(201).json({ order });
}));

// Manager renames a table (e.g. "Table 3" -> "VIP corner").
router.patch('/:id', authenticate, requireRole('manager'), asyncHandler(async (req, res) => {
  const label = typeof req.body?.label === 'string' ? req.body.label.trim().slice(0, 40) : '';
  if (!label) {
    return res.status(400).json({ error: 'label is required' });
  }
  const table = await findTableById(req.params.id);
  if (!table) {
    return res.status(404).json({ error: 'Table not found' });
  }
  try {
    const updated = await updateTableLabel(table.id, label);
    return res.json({ table: updated });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Another table already has that name' });
    }
    throw err;
  }
}));

module.exports = router;
