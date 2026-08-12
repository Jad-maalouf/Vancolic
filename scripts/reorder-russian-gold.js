// One-time migration (August 2026): puts "Russian Gold" directly under
// "Russian Standard" in the Vodka section — it had been appended to the end of
// the list by scripts/add-russian-gold.js.
// Run with: node scripts/reorder-russian-gold.js  (safe to re-run)
require('dotenv/config');
const { pool, query } = require('../server/db.js');

const CATEGORY = 'spirits';
const SUBCATEGORY = 'Vodka';
const ANCHOR = 'Russian Standard';
const MOVED = 'Russian Gold';

async function main() {
  const { rows } = await query(
    `select id, name from menu_items
      where category = $1 and subcategory = $2
      order by sort_order, created_at`,
    [CATEGORY, SUBCATEGORY]
  );

  const moved = rows.find((r) => r.name.toLowerCase() === MOVED.toLowerCase());
  const anchorIndex = rows.findIndex((r) => r.name.toLowerCase() === ANCHOR.toLowerCase());

  if (!moved) {
    console.log(`${MOVED} not found in ${SUBCATEGORY} — run scripts/add-russian-gold.js first.`);
    await pool.end();
    return;
  }
  if (anchorIndex === -1) {
    console.log(`${ANCHOR} not found in ${SUBCATEGORY} — nothing to anchor to.`);
    await pool.end();
    return;
  }

  // Rebuild the section order with the moved item slotted in after the anchor,
  // then renumber sort_order from 0 so the result is stable on re-runs.
  const rest = rows.filter((r) => r.id !== moved.id);
  const anchorAt = rest.findIndex((r) => r.name.toLowerCase() === ANCHOR.toLowerCase());
  const ordered = [...rest.slice(0, anchorAt + 1), moved, ...rest.slice(anchorAt + 1)];

  for (let i = 0; i < ordered.length; i += 1) {
    await query('update menu_items set sort_order = $1 where id = $2', [i, ordered[i].id]);
  }

  console.log(`${SUBCATEGORY} order: ${ordered.map((r) => r.name).join(', ')}`);

  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
