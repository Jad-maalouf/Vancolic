// Syncs the cocktails / shots / Vancolic specialties sections with the recipe
// document (Cocktails.docx): fixes ingredient descriptions on existing items
// and inserts the items that are missing. Prices and active flags of existing
// rows are left untouched (the manager controls those in the app).
// Run with: node scripts/sync-cocktails.js
//
// Safe to re-run — updates only apply when the description differs, and
// inserts are skipped when an item with the same name already exists in the
// category (regardless of subcategory, so e.g. "Whiskey sour" living under the
// manager-created "Sours" subcategory is not duplicated).
require('dotenv/config');
const { pool, query } = require('../server/db.js');

// ingredient corrections for items that already exist (matched by name within
// the category, case-insensitively)
const UPDATES = [
  ['cocktails', 'Passion Fruit Martini', 'Vodka, passion fruit, simple syrup, lime juice'],
  ['cocktails', 'Mojito', 'Rum, mint, lime juice, sugar, sparkling water'],
  ['cocktails', 'Gin Basil Smash', 'Gin, basil, simple syrup, lime juice'],
  ['cocktails', 'Old Fashioned', 'Bourbon whiskey, sugar'],
  ['cocktails', 'Long Island', 'Vodka, tequila, rum, gin, triple sec, lime juice, pepsi'],
  ['cocktails', 'Godfather', 'Whiskey, amaretto'],
  ['cocktails', 'BMW', 'Irish cream, coconut rum, whiskey'],
  ['cocktails', 'Negroni', 'Gin, campari, sweet vermouth'],
  // aqua faba is deliberately left out of customer-facing descriptions; it
  // only appears in the bartender recipes (src/data/recipes.js)
  // public descriptions never mention bitters or zest — bartender-only details
  ['cocktails', 'Whiskey Sour', 'Bourbon whiskey, lime juice, simple syrup'],
  ['cocktails', 'Amaretto Sour', 'Amaretto, simple syrup, lime juice'],
  ['cocktails', 'Gin Sour', 'Gin, simple syrup, lime juice'],
];

// items from the document that may be missing:
// [category, subcategory, name, glassPrice, active, description, mixerLabel, mixerPrice]
const INSERTS = [
  ['cocktails', 'International Cocktails', 'Blue Ice Tea', 6, true, 'Vodka, blue curacao, apple juice, XXL energy drink', 'Red Bull', 1],
  ['cocktails', 'International Cocktails', 'Jamaica', 5, true, 'Vodka, orange juice, pineapple juice, grenadine'],
  // shots carry no public description — their recipes are bartender-only (src/data/recipes.js)
  ['shots', 'Shots', 'Alien Brain Damage', 3, true, null],
  ['shots', 'Shots', 'Frog Shot', 3, true, null],
  ['shots', 'Shots', '4th of July', 3, true, null],
  ['shots', 'Shots', 'Liquid Cocaine', 4, true, null],
  ['shots', 'Shots', 'Hiroshima', 3, true, null],
  ['shots', 'Shots', 'Doudou', 3, true, null],
  // public descriptions are simplified on purpose (no brand names, bitters, or
  // garnish) — the full builds are bartender-only in src/data/recipes.js
  ['vancolic_specialities', 'Vancolic Special Cocktails', 'Pink Blue', 5, true, 'Gin, simple syrup, lime juice, grenadine, strawberry'],
  ['vancolic_specialities', 'Vancolic Special Cocktails', 'Blues', 5, true, 'Gin, passion fruit, lime juice, simple syrup, pineapple juice, blue curacao'],
  ['vancolic_specialities', 'Vancolic Special Cocktails', 'Boulevardier', 5, true, 'Bourbon whiskey, campari, sweet vermouth'],
  ['vancolic_specialities', 'Vancolic Special Cocktails', 'Italian Smoker', 5, true, 'Amaretto, bourbon whiskey, jagermeister'],
];

async function main() {
  for (const [category, name, description] of UPDATES) {
    const { rows } = await query(
      `update menu_items
          set description = $1
        where category = $2 and lower(name) = lower($3)
          and description is distinct from $1
        returning subcategory, name`,
      [description, category, name]
    );
    for (const row of rows) {
      console.log(`updated  ${category}/${row.subcategory}: ${row.name}`);
    }
  }

  // the "dyafe" hospitality shots are bartender-only knowledge, not menu items;
  // remove them if a previous sync created them (guarded so an item that was
  // ever ordered is never deleted)
  const { rows: removed } = await query(
    `delete from menu_items m
      where m.category = 'shots'
        and m.name in ('Shot Dyafe (Blue)', 'Shot Dyafe (Grenadine)')
        and not exists (select 1 from order_items oi where oi.menu_item_id = m.id)
      returning m.name`
  );
  for (const row of removed) {
    console.log(`removed  shots: ${row.name}`);
  }

  // shot recipes are bartender-only: blank out any public description on shots
  const { rows: cleared } = await query(
    `update menu_items set description = null
      where category = 'shots' and description is not null
      returning name`
  );
  for (const row of cleared) {
    console.log(`cleared  shots: ${row.name} — description removed`);
  }

  for (const [category, subcategory, name, glassPrice, active, description, mixerLabel = null, mixerPrice = null] of INSERTS) {
    const { rows: existing } = await query(
      'select 1 from menu_items where category = $1 and lower(name) = lower($2)',
      [category, name]
    );
    if (existing.length > 0) {
      // already present — still keep its description and mixer in sync
      const { rowCount } = await query(
        `update menu_items
            set description = $1, mixer_label = $4, mixer_price = $5
          where category = $2 and lower(name) = lower($3)
            and (description is distinct from $1
                 or mixer_label is distinct from $4
                 or mixer_price is distinct from $5)`,
        [description, category, name, mixerLabel, mixerPrice]
      );
      console.log(`exists   ${category}: ${name} — ${rowCount > 0 ? 'updated' : 'skipped'}`);
      continue;
    }
    await query(
      `insert into menu_items (category, subcategory, name, description, glass_price, active, mixer_label, mixer_price, sort_order)
       values ($1, $2, $3, $4, $5, $6, $7, $8,
               (select coalesce(max(sort_order), -1) + 1 from menu_items where category = $1 and subcategory = $2))`,
      [category, subcategory, name, description, glassPrice, active, mixerLabel, mixerPrice]
    );
    console.log(`inserted ${category}/${subcategory}: ${name}`);
  }

  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
