const { query } = require('../../db.js');

async function listTableOverview() {
  // sort numerically when the label contains a number ("Table 2" before
  // "Table 10"), alphabetically otherwise — plain `order by label` is lexicographic
  const { rows } = await query(
    `select table_id, label, active, open_order_id, client_name, opened_by,
            running_total, pending_count, preparing_count, persons_count
     from table_overview
     where active
     order by (nullif(regexp_replace(label, '\\D', '', 'g'), ''))::int nulls last, label`
  );
  return rows;
}

async function findTableById(id) {
  const { rows } = await query('select * from restaurant_tables where id = $1', [id]);
  return rows[0] || null;
}

async function updateTableLabel(id, label) {
  const { rows } = await query(
    `update restaurant_tables set label = $2 where id = $1 returning *`,
    [id, label]
  );
  return rows[0] || null;
}

async function findOpenOrderForTable(tableId) {
  const { rows } = await query(
    "select * from orders where table_id = $1 and status = 'open'",
    [tableId]
  );
  return rows[0] || null;
}

module.exports = { listTableOverview, findTableById, findOpenOrderForTable, updateTableLabel };
