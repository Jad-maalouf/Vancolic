const { query } = require('../../db.js');

async function listTableOverview() {
  const { rows } = await query(
    `select table_id, label, active, open_order_id, client_name, opened_by,
            running_total, pending_count, preparing_count
     from table_overview
     order by label`
  );
  return rows;
}

async function findTableById(id) {
  const { rows } = await query('select * from restaurant_tables where id = $1', [id]);
  return rows[0] || null;
}

async function findOpenOrderForTable(tableId) {
  const { rows } = await query(
    "select * from orders where table_id = $1 and status = 'open'",
    [tableId]
  );
  return rows[0] || null;
}

module.exports = { listTableOverview, findTableById, findOpenOrderForTable };
