const { query } = require('../../db.js');

async function openOrder({ tableId, clientName, openedBy }) {
  const { rows } = await query(
    `insert into orders (table_id, client_name, opened_by)
     values ($1, $2, $3)
     returning *`,
    [tableId, clientName ?? null, openedBy]
  );
  return rows[0];
}

async function findOrderById(id) {
  const { rows } = await query('select * from orders where id = $1', [id]);
  return rows[0] || null;
}

async function listOpenOrders() {
  const { rows } = await query(
    `select o.*, rt.label as table_label
     from orders o
     join restaurant_tables rt on rt.id = o.table_id
     where o.status = 'open'
     order by o.created_at`
  );
  return rows;
}

async function closeOrder(id, { closedBy, status }) {
  const { rows } = await query(
    `update orders set status = $2, closed_by = $3
     where id = $1 and status = 'open'
     returning *`,
    [id, status, closedBy]
  );
  return rows[0] || null;
}

async function listClosedOrders({ startDate, endDate } = {}) {
  const { rows } = await query(
    `select o.*, rt.label as table_label, ot.total
     from orders o
     join restaurant_tables rt on rt.id = o.table_id
     left join order_totals ot on ot.order_id = o.id
     where o.status in ('paid', 'cancelled')
       and ($1::date is null or o.closed_at >= $1::date)
       and ($2::date is null or o.closed_at < $2::date + interval '1 day')
     order by o.closed_at desc`,
    [startDate ?? null, endDate ?? null]
  );
  return rows;
}

module.exports = { openOrder, findOrderById, listOpenOrders, closeOrder, listClosedOrders };
