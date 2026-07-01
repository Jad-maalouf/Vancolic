import { query } from '../../db.js';

export async function listActiveMenuItems() {
  const { rows } = await query(
    `select id, category, subcategory, name, description, bottle_price, glass_price, sort_order
     from menu_items
     where active = true
     order by category, subcategory, sort_order`
  );
  return rows;
}

export async function listAllMenuItems() {
  const { rows } = await query(
    `select * from menu_items order by category, subcategory, sort_order`
  );
  return rows;
}

export async function findMenuItemById(id) {
  const { rows } = await query('select * from menu_items where id = $1', [id]);
  return rows[0] || null;
}

export async function createMenuItem(item) {
  const { rows } = await query(
    `insert into menu_items
       (category, subcategory, name, description, bottle_price, glass_price, sort_order, active)
     values ($1, $2, $3, $4, $5, $6, $7, $8)
     returning *`,
    [
      item.category,
      item.subcategory,
      item.name,
      item.description ?? null,
      item.bottlePrice ?? null,
      item.glassPrice ?? null,
      item.sortOrder ?? 0,
      item.active ?? true,
    ]
  );
  return rows[0];
}

// Full-row update. Callers (route handlers) are responsible for merging
// partial edits onto the existing row first, so that e.g. clearing a price
// to null is possible and distinguishable from "field not provided".
export async function updateMenuItem(id, item) {
  const { rows } = await query(
    `update menu_items set
       category = $2,
       subcategory = $3,
       name = $4,
       description = $5,
       bottle_price = $6,
       glass_price = $7,
       sort_order = $8,
       active = $9
     where id = $1
     returning *`,
    [
      id,
      item.category,
      item.subcategory,
      item.name,
      item.description ?? null,
      item.bottlePrice ?? null,
      item.glassPrice ?? null,
      item.sortOrder ?? 0,
      item.active ?? true,
    ]
  );
  return rows[0] || null;
}

export async function deleteMenuItem(id) {
  await query('delete from menu_items where id = $1', [id]);
}
