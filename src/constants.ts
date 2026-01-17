export const GAME_CONFIG = {
  TILE_SIZE: 32,
  MAP_WIDTH: 50,
  MAP_HEIGHT: 50,
  PLAYER_SPEED: 4,
  STAMINA_REGEN: 0.5,
};

export const THEME = {
  colors: {
    text: '#ffffff',
    primary: '#ffd700',
    secondary: '#c0c0c0',
    danger: '#ff4444',
    success: '#44ff44',
    wall: '#444444',
    floor: '#222222',
    grass: '#1a331a',
    ground: '#332211',
    rarity: {
      Common: '#ffffff',
      Uncommon: '#1eff00',
      Rare: '#0070dd',
      Epic: '#a335ee',
      Legendary: '#ff8000',
    }
  }
};

export const RARITY_MULTIPLIERS = {
  Common: 1,
  Uncommon: 1.2,
  Rare: 1.5,
  Epic: 2.0,
  Legendary: 3.0,
};

export const ENCHANT_SLOTS = {
  Weapon: 3,
  Helm: 2,
  Armor: 2,
  Boots: 2,
  Consumable: 0,
  Material: 0
};

export const ITEM_BASE_NAMES = {
  Weapon: {
    OneHanded: ['Dagger', 'Shortsword', 'Mace'],
    TwoHanded: ['Greatsword', 'Battleaxe', 'Warhammer'],
    Ranged: ['Shortbow', 'Longbow', 'Crossbow'],
    Magic: ['Wand', 'Staff', 'Orb']
  },
  Helm: ['Cap', 'Helmet', 'Greathelm', 'Hood'],
  Armor: ['Tunic', 'Breastplate', 'Plate Mail', 'Robe'],
  Boots: ['Boots', 'Greaves', 'Shoes', 'Sandals'],
};

export const ICONS = {
  Weapon: {
    OneHanded: '🗡️',
    TwoHanded: '⚔️',
    Ranged: '🏹',
    Magic: '🪄'
  },
  Helm: '🪖',
  Armor: '👕',
  Boots: '👢',
  Consumable: '🧪',
  Material: '🪵'
};

export const ASSETS_SVG = {
  player: `<svg viewBox="0 0 24 24" fill="white"><circle cx="12" cy="8" r="4"/><path d="M4 20v-8h16v8"/></svg>`,
  wall: `<svg viewBox="0 0 24 24" fill="gray"><rect width="24" height="24"/></svg>`,
  floor: `<svg viewBox="0 0 24 24" fill="#222"><rect width="24" height="24"/></svg>`,
};
