const express = require('express');
const { authenticate, requireRole } = require('../middleware/auth.js');
const { asyncHandler } = require('../lib/asyncHandler.js');
const {
  listActiveMenuItems,
  listAllMenuItems,
  findMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
} = require('../db/queries/menuItems.js');

const router = express.Router();

// Public: powers the customer-facing menu, active items only, no auth.
router.get('/', asyncHandler(async (req, res) => {
  const items = await listActiveMenuItems();
  return res.json({ items });
}));

// Manager-only: full list including inactive/retired items, for the editor.
router.get('/all', authenticate, requireRole('manager'), asyncHandler(async (req, res) => {
  const items = await listAllMenuItems();
  return res.json({ items });
}));

router.post('/', authenticate, requireRole('manager'), asyncHandler(async (req, res) => {
  const { category, subcategory, name, description, bottlePrice, glassPrice, sortOrder, active } =
    req.body || {};
  if (!category || !subcategory || !name || (bottlePrice == null && glassPrice == null)) {
    return res.status(400).json({
      error: 'category, subcategory, name, and at least one of bottlePrice/glassPrice are required',
    });
  }
  const item = await createMenuItem({
    category,
    subcategory,
    name,
    description,
    bottlePrice,
    glassPrice,
    sortOrder,
    active,
  });
  return res.status(201).json({ item });
}));

router.patch('/:id', authenticate, requireRole('manager'), asyncHandler(async (req, res) => {
  const existing = await findMenuItemById(req.params.id);
  if (!existing) {
    return res.status(404).json({ error: 'Menu item not found' });
  }
  const body = req.body || {};
  const merged = {
    category: body.category ?? existing.category,
    subcategory: body.subcategory ?? existing.subcategory,
    name: body.name ?? existing.name,
    description: body.description ?? existing.description,
    bottlePrice: 'bottlePrice' in body ? body.bottlePrice : existing.bottle_price,
    glassPrice: 'glassPrice' in body ? body.glassPrice : existing.glass_price,
    sortOrder: body.sortOrder ?? existing.sort_order,
    active: body.active ?? existing.active,
  };
  if (merged.bottlePrice == null && merged.glassPrice == null) {
    return res.status(400).json({ error: 'At least one of bottlePrice/glassPrice must remain set' });
  }
  const item = await updateMenuItem(req.params.id, merged);
  return res.json({ item });
}));

router.delete('/:id', authenticate, requireRole('manager'), asyncHandler(async (req, res) => {
  try {
    await deleteMenuItem(req.params.id);
    return res.status(204).end();
  } catch (err) {
    if (err.code === '23503') {
      return res.status(409).json({
        error: 'This item has existing orders and cannot be deleted — set it to inactive instead.',
      });
    }
    throw err;
  }
}));

module.exports = router;
