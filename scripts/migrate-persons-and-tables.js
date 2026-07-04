// One-time migration (July 2026): adds orders.persons_count, exposes it in the
// table_overview view, and trims the floor to 15 tables (the bar only has 15).
// Tables 16-20 are deleted when they were never used, deactivated otherwise.
// Run with: node scripts/migrate-persons-and-tables.js  (safe to re-run)
require('dotenv/config');
const { pool, query } = require('../server/db.js');

async function main() {
  await query(
    `alter table orders add column if not exists persons_count integer check (persons_count > 0)`
  );
  console.log('orders.persons_count column in place.');

  await query(`
    create or replace view table_overview as
    select
      rt.id as table_id,
      rt.label,
      rt.active,
      o.id as open_order_id,
      o.client_name,
      o.opened_by,
      ot.total as running_total,
      ot.pending_count,
      ot.preparing_count,
      o.persons_count
    from restaurant_tables rt
    left join orders o on o.table_id = rt.id and o.status = 'open'
    left join order_totals ot on ot.order_id = o.id
  `);
  console.log('table_overview view updated.');

  const extraLabels = ['Table 16', 'Table 17', 'Table 18', 'Table 19', 'Table 20'];

  const { rows: deleted } = await query(
    `delete from restaurant_tables rt
      where rt.label = any($1)
        and not exists (select 1 from orders o where o.table_id = rt.id)
      returning rt.label`,
    [extraLabels]
  );
  for (const row of deleted) console.log(`deleted ${row.label}`);

  const { rows: deactivated } = await query(
    `update restaurant_tables set active = false
      where label = any($1) and active
      returning label`,
    [extraLabels]
  );
  for (const row of deactivated) console.log(`deactivated ${row.label} (has order history)`);

  const { rows } = await query(`select label, active from restaurant_tables order by label`);
  console.log(`floor now: ${rows.filter((r) => r.active).length} active tables`);

  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
