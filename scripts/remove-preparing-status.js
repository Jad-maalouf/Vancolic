// One-time migration (August 2026): drops the "preparing" order-item status.
// The bartender board now goes straight from pending to served, so:
//   - any item still sitting in 'preparing' is moved back to 'pending'
//   - the order_item_status enum is rebuilt without the value
//   - order_totals / table_overview lose their preparing_count column
// Run with: node scripts/remove-preparing-status.js  (safe to re-run)
require('dotenv/config');
const { pool, query } = require('../server/db.js');

// One statement batch = one implicit transaction, so a failure anywhere rolls
// the whole thing back (important: the views are dropped before the enum is
// rebuilt, since they depend on order_items.status).
const MIGRATION = `
drop view if exists table_overview;
drop view if exists order_totals;

do $mig$
begin
  if exists (
    select 1 from pg_enum e
      join pg_type t on t.oid = e.enumtypid
     where t.typname = 'order_item_status' and e.enumlabel = 'preparing'
  ) then
    execute $sql$update order_items set status = 'pending' where status = 'preparing'$sql$;
    execute $sql$alter table order_items alter column status drop default$sql$;
    execute $sql$alter table order_items alter column status type text using status::text$sql$;
    execute $sql$drop type order_item_status$sql$;
    execute $sql$create type order_item_status as enum ('pending', 'served', 'cancelled')$sql$;
    execute $sql$alter table order_items alter column status type order_item_status using status::order_item_status$sql$;
    execute $sql$alter table order_items alter column status set default 'pending'$sql$;
    raise notice 'order_item_status rebuilt without ''preparing''';
  else
    raise notice 'order_item_status already has no ''preparing'' value';
  end if;
end
$mig$;

create view order_totals as
select
  o.id as order_id,
  o.table_id,
  o.status as order_status,
  coalesce(sum(oi.unit_price * oi.quantity) filter (where oi.status <> 'cancelled'), 0) as total,
  count(oi.id) filter (where oi.status = 'pending') as pending_count,
  max(oi.created_at) as last_item_at
from orders o
left join order_items oi on oi.order_id = o.id
group by o.id, o.table_id, o.status;

create view table_overview as
select
  rt.id as table_id,
  rt.label,
  rt.active,
  o.id as open_order_id,
  o.client_name,
  o.opened_by,
  ot.total as running_total,
  ot.pending_count,
  o.persons_count
from restaurant_tables rt
left join orders o on o.table_id = rt.id and o.status = 'open'
left join order_totals ot on ot.order_id = o.id;
`;

async function main() {
  const { rows: before } = await query(
    `select count(*)::int as n from order_items where status::text = 'preparing'`
  );
  console.log(`items currently in 'preparing': ${before[0].n} (they become 'pending')`);

  await query(MIGRATION);
  console.log("'preparing' removed — enum and views rebuilt.");

  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
