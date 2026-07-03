export const CATEGORIES = [
  { id: 'spirits', label: 'Spirits', icon: 'alcohol.png' },
  { id: 'wine_bubbles', label: 'Wine & Bubbles', icon: 'wine.png' },
  { id: 'cocktails', label: 'Cocktails', icon: 'cocktails.png' },
  { id: 'shots', label: 'Shots', icon: 'shot.png' },
  { id: 'beer', label: 'Beer', icon: 'beer.png' },
  { id: 'non_alcoholic', label: 'Non-Alcoholic', icon: 'non-alcoholic.png' },
  { id: 'vancolic_specialities', label: 'Vancolic Specialities', icon: 'logo.png' },
  { id: 'shisha', label: 'Shisha', icon: 'shisha.png' },
];

export function formatPrice(value) {
  if (value == null) return '-';
  const n = Number(value);
  return Number.isInteger(n) ? `$${n}` : `$${n.toFixed(2)}`;
}

// Same formatting as formatPrice but without the "$" — for menu tables where
// the column header (e.g. "Bottle ($)") already carries the currency symbol.
export function formatPriceValue(value) {
  if (value == null) return '-';
  const n = Number(value);
  return Number.isInteger(n) ? `${n}` : n.toFixed(2);
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

// Merge order lines that are exactly the same drink — same menu item, price
// type, mixer, note, unit price AND status — into one line with a summed
// quantity. `ids` collects the merged rows' ids so actions can hit all of them.
export function groupIdenticalItems(items) {
  const groups = new Map();
  for (const item of items) {
    const key = [item.menu_item_id, item.price_type, item.mixer_label ?? '', item.notes ?? '', item.unit_price, item.status].join('|');
    const existing = groups.get(key);
    if (existing) {
      existing.quantity += item.quantity;
      existing.ids.push(item.id);
    } else {
      groups.set(key, { ...item, ids: [item.id] });
    }
  }
  return [...groups.values()];
}

export function computeOrderTotal(orderItems) {
  return orderItems
    .filter((i) => i.status !== 'cancelled')
    .reduce((sum, i) => sum + Number(i.unit_price) * i.quantity, 0);
}
