// One-off: adds "Russian Gold" to the Vodka section (bottle $60, glass $7).
// Run with: node scripts/add-russian-gold.js
//
// Safe to re-run — if the item already exists it only brings its prices and
// mixer back in line instead of inserting a duplicate.
require('dotenv/config');
const { pool, query } = require('../server/db.js');

const CATEGORY = 'spirits';
const SUBCATEGORY = 'Vodka';
const NAME = 'Russian Gold';
const BOTTLE_PRICE = 60;
const GLASS_PRICE = 7;
// the whole Vodka section carries the same Red Bull add-on
const MIXER_LABEL = 'Red Bull';
const MIXER_PRICE = 1;

async function main() {
  const { rows: existing } = await query(
    'select 1 from menu_items where category = $1 and lower(name) = lower($2)',
    [CATEGORY, NAME]
  );

  if (existing.length > 0) {
    const { rowCount } = await query(
      `update menu_items
          set bottle_price = $1, glass_price = $2, mixer_label = $3, mixer_price = $4
        where category = $5 and lower(name) = lower($6)
          and (bottle_price is distinct from $1
               or glass_price is distinct from $2
               or mixer_label is distinct from $3
               or mixer_price is distinct from $4)`,
      [BOTTLE_PRICE, GLASS_PRICE, MIXER_LABEL, MIXER_PRICE, CATEGORY, NAME]
    );
    console.log(`exists   ${CATEGORY}: ${NAME} — ${rowCount > 0 ? 'prices updated' : 'already up to date'}`);
  } else {
    await query(
      `insert into menu_items
         (category, subcategory, name, bottle_price, glass_price, active, mixer_label, mixer_price, sort_order)
       values ($1, $2, $3, $4, $5, true, $6, $7,
               (select coalesce(max(sort_order), -1) + 1 from menu_items where category = $1 and subcategory = $2))`,
      [CATEGORY, SUBCATEGORY, NAME, BOTTLE_PRICE, GLASS_PRICE, MIXER_LABEL, MIXER_PRICE]
    );
    console.log(`inserted ${CATEGORY}/${SUBCATEGORY}: ${NAME} — bottle ${BOTTLE_PRICE}, glass ${GLASS_PRICE}`);
  }

  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
