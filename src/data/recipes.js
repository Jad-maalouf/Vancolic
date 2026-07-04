// Bartender recipes, transcribed from the Cocktails.docx recipe document.
// Quantities are in ml unless stated otherwise. This is staff-facing only —
// the customer menu shows the portion-free descriptions stored in menu_items.

export const RECIPE_SECTIONS = [
  {
    id: 'international',
    label: 'International Cocktails',
    recipes: [
      {
        name: 'Passion Fruit Martini',
        method: 'Shaker',
        ingredients: ['45 ml vodka', '30 ml passion fruit purée', '10 ml sugar syrup', '20 ml lime juice'],
      },
      {
        name: 'Margarita',
        method: 'Shaker',
        ingredients: ['60 ml tequila', '30 ml lime juice', '30 ml triple sec'],
      },
      {
        name: 'Margarita Passion Fruit',
        method: 'Shaker',
        ingredients: ['60 ml tequila', '30 ml lime juice', '30 ml triple sec', '30 ml passion fruit'],
      },
      {
        name: 'Margarita Strawberry',
        method: 'Shaker',
        ingredients: ['60 ml tequila', '30 ml lime juice', '30 ml triple sec', '30 ml strawberry'],
      },
      {
        name: 'Mojito',
        method: 'Build',
        ingredients: [
          '1 tablespoon sugar',
          '3 slices of lime (+ 4 crushed)',
          '4 mint leaves',
          '50 ml rum',
          'Top with sparkling water',
        ],
        notes: 'Garnish the glass (design — fill the glass).',
      },
      {
        name: 'Gin Basil',
        method: 'Shaker',
        ingredients: ['60 ml gin', '30 ml sugar syrup', '30 ml lime juice', '4 basil leaves'],
      },
      {
        name: 'Gin Basil (dispenser batch)',
        method: 'Dispenser',
        ingredients: [
          '400 ml gin',
          '300 ml lime juice',
          '280 ml sugar syrup',
          '3 drops colorant',
          '10 basil leaves',
        ],
      },
      {
        name: 'BMW',
        method: 'Build',
        ingredients: ['30 ml Baileys', '40 ml Malibu', '40 ml Jim Beam'],
      },
      {
        name: 'Pina Colada',
        method: 'Blender',
        ingredients: ['Rum', 'Coconut cream', 'Pineapple juice'],
      },
      {
        name: 'Blue Ice Tea',
        method: 'Build',
        ingredients: ['50 ml vodka', '15 ml blue curacao', '30 ml apple juice', 'Top with XXL energy drink'],
      },
      {
        name: 'Old Fashioned',
        method: 'Build',
        ingredients: [
          '½ spoon of sugar',
          '½ shot of water (to dissolve the sugar)',
          '4 drops orange aromatic bitters',
          '4 drops aromatic bitters on top',
          '30 ml Jim Beam',
        ],
        notes: 'Orange zest on the glass + alba.',
      },
      {
        name: 'Jamaica',
        method: 'Build',
        ingredients: ['40 ml vodka', 'Top with orange juice + pineapple juice + grenadine'],
      },
      {
        name: 'Blue Hawaii',
        method: 'Shaker',
        ingredients: [
          '20 ml rum',
          '20 ml vodka',
          '15 ml blue curacao',
          '90 ml pineapple juice',
          '10 ml sugar syrup',
          '15 ml lime juice',
        ],
      },
      {
        name: 'Sex on the Beach',
        method: 'Build',
        ingredients: ['40 ml vodka', '20 ml Archers', 'Top with orange juice + cranberry juice'],
      },
      {
        name: 'Long Island',
        method: 'Build',
        ingredients: [
          '15 ml vodka',
          '15 ml tequila',
          '15 ml rum',
          '15 ml gin',
          '15 ml triple sec',
          '15 ml lime juice',
          'Top with Pepsi',
        ],
      },
      {
        name: 'Godfather',
        method: 'Build',
        ingredients: ['30 ml Red Label', '30 ml Disaronno'],
        notes: 'Garnish with rosemary.',
      },
      {
        name: 'Cuba Libre',
        method: 'Build',
        ingredients: ['60 ml rum', '15 ml lime juice', 'Top with Pepsi'],
      },
      {
        name: 'Tequila Sunrise',
        method: 'Build',
        ingredients: ['50 ml tequila', 'Top with orange juice + grenadine'],
      },
      {
        name: 'Whiskey Sour',
        method: 'Shaker',
        ingredients: [
          '60 ml Jim Beam',
          '30 ml lime juice',
          '30 ml sugar syrup',
          '10 ml aqua faba',
          '4–5 drops aromatic bitters',
        ],
      },
      {
        name: 'Negroni',
        method: 'Build',
        ingredients: ['30 ml gin', '30 ml Campari', '30 ml Martini Rosso'],
        notes: 'Garnish with lemon peel.',
      },
      {
        name: 'Amaretto Sour',
        method: 'Shaker',
        ingredients: [
          '60 ml Disaronno',
          '30 ml sugar syrup',
          '30 ml lime juice',
          '10 ml aqua faba',
          'Drops of aromatic bitters',
        ],
      },
      {
        name: 'Gin Sour',
        method: 'Shaker',
        ingredients: [
          '60 ml gin',
          '30 ml sugar syrup',
          '30 ml lime juice',
          '10 ml aqua faba',
          'Drops of aromatic bitters',
        ],
      },
    ],
  },
  {
    id: 'shots',
    label: 'Shots',
    recipes: [
      {
        name: 'Brain Damage',
        ingredients: ['70 ml Archers', 'Top with Baileys', 'Drops of grenadine'],
      },
      {
        name: 'Alien Brain Damage',
        ingredients: ['70 ml Archers', 'Top with Baileys', 'Drops of grenadine', 'Curacao'],
      },
      {
        name: 'B52',
        method: 'Layered',
        ingredients: ['Coffee liqueur', 'Baileys', 'Grand Marnier'],
      },
      {
        name: 'Frog Shot',
        ingredients: ['70 ml Midori', 'Baileys', 'Drops of blue curacao + grenadine'],
      },
      {
        name: '4th of July',
        method: 'Layered',
        ingredients: ['Grenadine', 'Archers', 'Blue curacao + vodka (premixed in a glass beforehand)'],
      },
      {
        name: 'Liquid Cocaine',
        ingredients: ['Jagermeister', 'Goldschlager'],
      },
      {
        name: 'Hiroshima',
        method: 'Layered',
        ingredients: ['White sambuca', 'Baileys', 'Midori'],
      },
      {
        name: 'Doudou',
        ingredients: ['Vodka', 'Lime juice', 'Small pinch of salt', 'Drops of tabasco'],
        notes: 'Serve with an olive.',
      },
      {
        name: 'Shot Dyafe (Blue)',
        ingredients: ['Vodka', 'Pineapple juice', 'Blue curacao'],
      },
      {
        name: 'Shot Dyafe (Grenadine)',
        ingredients: ['Vodka', 'Pineapple juice', 'Grenadine'],
      },
    ],
  },
  {
    id: 'specialties',
    label: 'Vancolic Specialties',
    recipes: [
      {
        name: 'Pink Blue',
        method: 'Shaker',
        ingredients: [
          '60 ml pink gin',
          '30 ml sugar syrup',
          '30 ml lime juice',
          '15 ml grenadine',
          '15 ml strawberry',
          'Aquafaba',
          'Aromatic bitters',
        ],
      },
      {
        name: 'Blues',
        method: 'Shaker',
        ingredients: [
          '50 ml gin',
          '20 ml passion fruit',
          '15 ml lime juice',
          '10 ml sugar syrup',
          '40 ml pineapple juice',
          '10 ml curacao',
          'Aquafaba',
        ],
      },
      {
        name: 'Boulevardier',
        method: 'Build',
        ingredients: [
          '45 ml Jim Beam',
          '30 ml Campari',
          '30 ml Martini Rosso',
          '4 drops orange bitters',
          '4 drops aromatic bitters',
        ],
        notes: 'Garnish with orange zest.',
      },
      {
        name: 'Italian Smoker',
        method: 'Build',
        ingredients: [
          '20 ml amaretto',
          '30 ml Jim Beam',
          '15 ml Jagermeister',
          '3 drops orange bitters',
          '3 drops aromatic bitters',
        ],
      },
    ],
  },
];
