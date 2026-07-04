// One-time setup script: seeds the menu (transcribed from the old static
// index.html), the fixed table list, and the first manager login.
// Run with: npm run seed
//
// Safe to re-run — each section skips itself if data already exists, so this
// won't duplicate rows or clobber an existing manager account.
require('dotenv/config');
const bcrypt = require('bcryptjs');
const { pool, query } = require('../server/db.js');

// category codes must match the check constraint in server/db/schema.sql
const MENU = [
  {
    category: 'spirits',
    subcategory: 'Whiskey',
    items: [
      ['Jameson', 50, 5],
      ['Red Label', 50, 5],
      ['Black Label', 75, 7],
      ['Chivas 12', 65, 6],
      ['J&B', 45, 5],
      ['Jack Daniel’s', 60, 6],
      ['Jack Fire', 60, 6],
      ['Jim Beam', 45, 5],
      ['Glenfiddich 12', 90, 9],
      ['Double Black', 95, null, false],
      ['Gold Label', 145, null, false],
      ['Green Black', 155, null, false],
      ['Dimple 12', 60, 8, false],
      ['Old Parr', 60, 8, false],
      ['Monkey Shoulder', 40, 6, false],
      ['Fireball', 40, 6, false],
    ],
  },
  {
    category: 'spirits',
    subcategory: 'Gin',
    items: [
      ['Gin Gordon’s', 45, 5],
      ['Bombay', 70, 7],
      ['Hendrick’s', 90, 9],
      ['Tanqueray', 60, 6, false],
    ],
  },
  {
    category: 'spirits',
    subcategory: 'Vodka',
    mixer: ['Red Bull', 1],
    items: [
      ['Stolichnaya', 45, 5],
      ['Russian Standard', 45, 5],
      ['Smirnoff', 45, 5],
      ['Grey Goose', 80, 9],
      ['Absolut', 50, 6],
      ['Ketel One', 70, null],
      ['White Tea', 15, 2, false],
      ['Belvedere', 110, null, false],
      ['Stolichnaya Gold', 30, 6, false],
      ['Russian Standard Gold', 30, 6, false],
    ],
  },
  {
    category: 'spirits',
    subcategory: 'Tequila',
    items: [
      ['Jose Cuervo Silver', 50, 5],
      ['Jose Cuervo Gold', 50, 6],
      ['1800 Añejo', 90, 9],
      ['Don Julio Reposado', 160, 17],
    ],
  },
  {
    category: 'spirits',
    subcategory: 'Jagermeister',
    items: [['Jagermeister', 50, 5]],
  },
  {
    category: 'wine_bubbles',
    subcategory: 'Wine',
    items: [
      ['Ksara Reserve du Couvent', 30, 4],
      ['Ksara Sunset', 30, 4],
      ['Ksara Blanc de Blanc', 30, 4],
      ['Karam Thouraya', 30, 4],
      ['Karam Arc en Ciel', 30, 4],
      ['Karam Cloud Nine', 30, 4],
      ['Ixsir Red', 40, 5, false],
      ['Karam Maison', 30, 4, false],
      ['Ixsir Rose', 40, 5, false],
      ['Ixsir White', 40, 5, false],
    ],
  },
  {
    category: 'wine_bubbles',
    subcategory: 'Prosecco',
    items: [
      ['Martini', 45, 5],
      ['Piccini', 35, 4],
      ['Ponte Villoni', 20, 3, false],
    ],
  },
  {
    category: 'wine_bubbles',
    subcategory: 'Sparkling Wine',
    items: [
      ['Martini Rose', 45, 5],
      ['Martini Brut', 45, 5],
    ],
  },
  {
    category: 'cocktails',
    subcategory: 'International Cocktails',
    singlePrice: true,
    items: [
      ['Margarita', 5, null, true, 'Tequila, lime juice, triple sec'],
      ['Margarita passion fruit', 6, null, true, 'Tequila, lime juice, triple sec, passion fruit'],
      ['Margarita strawberry', 6, null, true, 'Tequila, lime juice, triple sec, strawberry'],
      ['Mojito', 6, null, true, 'Rum, mint, lime juice, sugar, sparkling water'],
      ['Gin Basil Smash', 5, null, true, 'Gin, basil, simple syrup, lime juice'],
      ['Passion Fruit Martini', 6, null, true, 'Vodka, passion fruit, simple syrup, lime juice'],
      ['Jager bomb', 5, null, true, 'jagermeister, energy drink', ['Red Bull', 1]],
      ['BMW', 6, null, true, 'Irish cream, coconut rum, whiskey'],
      ['Pina Colada', 6, null, true, 'Rum, coconut cream, pineapple juice'],
      ['Blue Ice Tea', 6, null, true, 'Vodka, blue curacao, apple juice, XXL energy drink', ['Red Bull', 1]],
      ['Sex on the Beach', 5, null, true, 'Vodka, peach liqueur, orange juice, cranberry juice'],
      ['Long Island', 6, null, true, 'Vodka, tequila, rum, gin, triple sec, lime juice, pepsi'],
      ['Tequila Sunrise', 5, null, true, 'Tequila, orange juice, grenadine'],
      ['Jamaica', 5, null, true, 'Vodka, orange juice, pineapple juice, grenadine'],
      ['Blue Hawaii', 6, null, true, 'Rum, vodka, blue curacao, pineapple juice, lime, sugar'],
      ['Old Fashioned', 6, null, true, 'Bourbon whiskey, sugar, orange bitters, aromatic bitters, orange zest'],
      ['Godfather', 6, null, true, 'Whiskey, amaretto'],
      ['Cuba Libre', 5, null, true, 'Rum, pepsi, lime juice'],
      ['Negroni', 5, null, true, 'Gin, campari, sweet vermouth'],
    ],
  },
  {
    category: 'cocktails',
    subcategory: 'Sours',
    singlePrice: true,
    items: [
      ['Midori sour', 6, null, true, 'Midori, sugar, lime juice'],
      ['Whiskey sour', 6, null, true, 'Bourbon whiskey, lime juice, simple syrup, aromatic bitters'],
      ['Amaretto sour', 6, null, true, 'Amaretto, simple syrup, lime juice, aromatic bitters'],
      ['Gin sour', 5, null, true, 'Gin, simple syrup, lime juice, aromatic bitters'],
    ],
  },
  {
    category: 'vancolic_specialities',
    subcategory: 'Vancolic Special Cocktails',
    singlePrice: true,
    items: [
      ['V1', 5, null, false, 'Gin, Lime Juice, Sour Mix, 7up, Mint, Crushed Ice'],
      ['V2', 5, null, false, 'Vodka, Orange Liqueur, Lime Juice, Sugar'],
      ['V3', 5, null, false, 'Vodka, Rum, Passion Fruit, Lime Juice, Sugar'],
      ['V4', 5, null, false, 'Gin, Tequila, Apple, Lime Juice, Sugar'],
      ['V5', 5, null, false, 'Rum, Tequila, Blue Curacao, Soda'],
      ['V6', 5, null, false, 'Rum, Coconut Syrup, Blue Curacao, Pineapple Juice, 7up'],
      ['V7', 5, null, false, 'Vodka, Blue Curacao, Strawberry, Lime, Sugar'],
      ['V8', 5, null, false, 'Rose Wine, Fresh Fruits (apple, orange, grapes, strawberry, passion, peach) and soda water if ordered'],
      ['V9', 5, null, false, 'Whiskey, Coffee Liqueur, Irish Cream'],
      ['V10', 5, null, false, 'Vodka, Amaretto, Pineapple Juice, Grenadine, Cherry'],
      ['Pink Blue', 5, null, true, 'Gin, simple syrup, lime juice, grenadine, strawberry'],
      ['Blues', 5, null, true, 'Gin, passion fruit, lime juice, simple syrup, pineapple juice, blue curacao'],
      ['Boulevardier', 5, null, true, 'Bourbon whiskey, campari, sweet vermouth'],
      ['Italian Smoker', 5, null, true, 'Amaretto, bourbon whiskey, jagermeister'],
    ],
  },
  {
    category: 'shots',
    subcategory: 'Shots',
    singlePrice: true,
    items: [
      // shot recipes are deliberately not shown on the public menu — the
      // ingredients live in the bartender recipes (src/data/recipes.js)
      ['Brain Damage', 3, null, true],
      ['Alien Brain Damage', 3, null, true],
      ['B52', 3, null, true],
      ['Frog Shot', 3, null, true],
      ['4th of July', 3, null, true],
      ['Liquid Cocaine', 4, null, true],
      ['Hiroshima', 3, null, true],
      ['Doudou', 3, null, true],
      ['Drunk Melon', 3, null, true],
      ['Tequila', 3, null, true],
      ['Jagermeister', 3, null, true],
      ['Goldschlager', 4, null, true],
      // the complimentary "dyafe" (hospitality) shots are intentionally not menu
      // items — they exist only in the bartender recipes (src/data/recipes.js)
    ],
  },
  {
    category: 'vancolic_specialities',
    subcategory: 'Vancolic Special Shots',
    singlePrice: true,
    items: [
      ['Pink Sky', 4, null, false, 'Vodka, baileys, strawberry'],
      ['Peach Party', 4, null, false, 'Rum, peach schnapps, cranberry, pineapple juice'],
      ['Grenadine Light', 4, null, false, 'Rum, vodka, grenadine, lime juice'],
      ['Blue Night', 4, null, false, 'Vodka, blue curacao, lemonade'],
    ],
  },
  {
    category: 'beer',
    subcategory: 'Beer',
    singlePrice: true,
    items: [
      ['Almaza', 3],
      ['Almaza Light', 3],
      ['Almaza Rose', 3],
      ['Almaza Dark', 4],
      ['Almaza Unfiltered', 4],
      ['Corona', 5],
      ['Add Mexican', 1],
    ],
  },
  {
    category: 'non_alcoholic',
    subcategory: 'Non-Alcoholic Cocktails',
    singlePrice: true,
    items: [
      ['Virgin Jamaica', 3],
      ['Minted Lemonade', 3],
    ],
  },
  {
    category: 'non_alcoholic',
    subcategory: 'Soft Drinks and Water',
    singlePrice: true,
    items: [
      ['Soft Drink', 2],
      ['Sparkling Water', 2],
      ['Red bull', 3],
      ['Dark blue', 2],
      ['Water', 1],
    ],
  },
  {
    category: 'shisha',
    subcategory: 'Shisha',
    singlePrice: true,
    items: [
      ['Arguile', 7],
    ],
  },
];

const TABLE_COUNT = 20;

async function seedMenu() {
  const { rows } = await query('select count(*) from menu_items');
  if (Number(rows[0].count) > 0) {
    console.log('menu_items already has data — skipping menu seed.');
    return;
  }

  let inserted = 0;
  for (const block of MENU) {
    let sortOrder = 0;
    for (const row of block.items) {
      const [name, price1, price2, active = true, description = null, itemMixer = null] = row;
      const [mixerLabel = null, mixerPrice = null] = itemMixer ?? block.mixer ?? [];
      const bottlePrice = block.singlePrice ? null : price1;
      const glassPrice = block.singlePrice ? price1 : price2;
      await query(
        `insert into menu_items
           (category, subcategory, name, description, bottle_price, glass_price, sort_order, active, mixer_label, mixer_price)
         values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [block.category, block.subcategory, name, description, bottlePrice, glassPrice, sortOrder, active, mixerLabel, mixerPrice]
      );
      sortOrder += 1;
      inserted += 1;
    }
  }
  console.log(`Seeded ${inserted} menu items.`);
}

async function seedTables() {
  const { rows } = await query('select count(*) from restaurant_tables');
  if (Number(rows[0].count) > 0) {
    console.log('restaurant_tables already has data — skipping table seed.');
    return;
  }

  for (let n = 1; n <= TABLE_COUNT; n += 1) {
    await query('insert into restaurant_tables (label) values ($1)', [`Table ${n}`]);
  }
  console.log(`Seeded ${TABLE_COUNT} tables.`);
}

async function seedManager() {
  const email = process.env.SEED_MANAGER_EMAIL;
  const password = process.env.SEED_MANAGER_PASSWORD;
  const fullName = process.env.SEED_MANAGER_NAME || 'Manager';

  if (!email || !password) {
    console.log('SEED_MANAGER_EMAIL/SEED_MANAGER_PASSWORD not set — skipping manager seed.');
    return;
  }

  const { rows } = await query('select id from users where email = $1', [email]);
  if (rows[0]) {
    console.log(`A user with email ${email} already exists — skipping manager seed.`);
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await query(
    `insert into users (full_name, email, password_hash, role) values ($1, $2, $3, 'manager')`,
    [fullName, email, passwordHash]
  );
  console.log(`Created manager account for ${email}. Change this password after first login.`);
}

async function main() {
  await seedMenu();
  await seedTables();
  await seedManager();
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
