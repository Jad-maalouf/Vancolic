import { query } from '../../db.js';

export async function addOrderItem({ orderId, menuItemId, priceType, unitPrice, quantity, orderedBy }) {
  const { rows } = await query(
    `insert into order_items (order_id, menu_item_id, price_type, unit_price, quantity, ordered_by)
     values ($1, $2, $3, $4, $5, $6)
     returning *`,
    [orderId, menuItemId, priceType, unitPrice, quantity, orderedBy]
  );
  return rows[0];
}

export async function listItemsForOrder(orderId) {
  const { rows } = await query(
    `select oi.*, mi.name as item_name, mi.category, mi.subcategory
     from order_items oi
     join menu_items mi on mi.id = oi.menu_item_id
     where oi.order_id = $1
     order by oi.created_at`,
    [orderId]
  );
  return rows;
}

// Bartender board: every pending/preparing item across all open orders/tables.
export async function listActiveOrderItems() {
  const { rows } = await query(
    `select oi.*, mi.name as item_name, mi.category, mi.subcategory,
            o.table_id, o.client_name, rt.label as table_label
     from order_items oi
     join menu_items mi on mi.id = oi.menu_item_id
     join orders o on o.id = oi.order_id
     join restaurant_tables rt on rt.id = o.table_id
     where oi.status in ('pending', 'preparing')
     order by oi.created_at`
  );
  return rows;
}

export async function findOrderItemById(id) {
  const { rows } = await query('select * from order_items where id = $1', [id]);
  return rows[0] || null;
}

export async function updateOrderItemStatus(id, status) {
  const { rows } = await query(
    `update order_items set status = $2 where id = $1 returning *`,
    [id, status]
  );
  return rows[0] || null;
}
