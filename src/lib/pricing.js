export const CATEGORIES = [
  { id: 'spirits', label: 'Spirits', icon: 'alcohol.png' },
  { id: 'wine_bubbles', label: 'Wine & Bubbles', icon: 'wine.png' },
  { id: 'cocktails', label: 'Cocktails', icon: 'cocktails.png' },
  { id: 'shots', label: 'Shots', icon: 'shot.png' },
  { id: 'beer', label: 'Beer', icon: 'beer.png' },
  { id: 'non_alcoholic', label: 'Non-Alcoholic', icon: 'non-alcoholic.png' },
];

export function formatPrice(value) {
  if (value == null) return '-';
  const n = Number(value);
  return Number.isInteger(n) ? `$${n}` : `$${n.toFixed(2)}`;
}

// Groups a flat list of menu items (already sorted by category, subcategory,
// sort_order from the backend) into CATEGORIES order -> subcategory -> items.
export function groupMenuItems(items) {
  const byCategory = new Map();
  for (const item of items) {
    if (!byCategory.has(item.category)) byCategory.set(item.category, new Map());
    const bySub = byCategory.get(item.category);
    if (!bySub.has(item.subcategory)) bySub.set(item.subcategory, []);
    bySub.get(item.subcategory).push(item);
  }

  return CATEGORIES.map((cat) => ({
    ...cat,
    subcategories: Array.from(byCategory.get(cat.id) ?? new Map(), ([name, rows]) => ({
      name,
      items: rows,
    })),
  }));
}

export function computeOrderTotal(orderItems) {
  return orderItems
    .filter((i) => i.status !== 'cancelled')
    .reduce((sum, i) => sum + Number(i.unit_price) * i.quantity, 0);
}
