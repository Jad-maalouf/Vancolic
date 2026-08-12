// One-time migration (August 2026): brings the floor to 24 tables.
// Tables 23-24 are created if missing, or re-activated if they were
// deactivated; tables 1-22 are left as they are.
// Run with: node scripts/add-tables-23-24.js  (safe to re-run)
require('dotenv/config');
const { pool, query } = require('../server/db.js');

const TABLE_COUNT = 24;

async function main() {
  for (let n = 1; n <= TABLE_COUNT; n += 1) {
    const label = `Table ${n}`;
    const { rows } = await query(
      `insert into restaurant_tables (label) values ($1)
       on conflict (label) do update set active = true
       where not restaurant_tables.active
       returning (xmax = 0) as created`,
      [label]
    );
    if (rows[0]?.created) console.log(`created     ${label}`);
    else if (rows[0]) console.log(`reactivated ${label}`);
  }

  const { rows } = await query('select count(*)::int as n from restaurant_tables where active');
  console.log(`floor now: ${rows[0].n} active tables`);

  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
