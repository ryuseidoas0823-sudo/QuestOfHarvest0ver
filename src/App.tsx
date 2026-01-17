export const GAME_CONFIG = {
  TILE_SIZE: 32, MAP_WIDTH: 80, MAP_HEIGHT: 60, PLAYER_SPEED: 5, ENEMY_SPAWN_RATE: 0.02, BASE_DROP_RATE: 0.2,
  STAMINA_ATTACK_COST: 15, STAMINA_DASH_COST: 1, STAMINA_REGEN: 0.5, PROJECTILE_SPEED: 8, 
  WORLD_TILE_SIZE: 32, WORLD_WIDTH: 30, WORLD_HEIGHT: 20, TOWN_WIDTH: 30, TOWN_HEIGHT: 20
};

export const THEME = {
  colors: {
    ground: '#1a1a1a', grass: '#1e2b1e', wall: '#424242', water: '#1a237e', townFloor: '#5d4037', player: '#d4af37', enemy: '#8b0000', text: '#c0c0c0', highlight: '#ffd700',
    rarity: { Common: '#ffffff', Uncommon: '#1eff00', Rare: '#0070dd', Epic: '#a335ee', Legendary: '#ff8000', }
  }
};

export const RARITY_MULTIPLIERS = { Common: 1, Uncommon: 1.5, Rare: 2, Epic: 3, Legendary: 5 };
export const ENCHANT_SLOTS = { Common: 0, Uncommon: 1, Rare: 2, Epic: 3, Legendary: 4 };

export const ITEM_BASE_NAMES: Record<string, string[]> = {
    Weapon: ['Sword', 'Axe', 'Spear', 'Dagger'],
    Helm: ['Helmet', 'Cap', 'Coif'],
    Armor: ['Plate', 'Tunic', 'Robe'],
    Shield: ['Buckler', 'Shield', 'Greatshield'],
    Boots: ['Boots', 'Greaves', 'Sandals'],
    Material: ['Ore', 'Wood', 'Herb'],
    Consumable: ['Potion', 'Food']
};

export const ICONS: Record<string, string> = {
    Weapon: '⚔️', Helm: '🪖', Armor: '👕', Shield: '🛡️', Boots: '👢', Material: '📦', Consumable: '🧪'
};

export const ASSETS_SVG: Record<string, string> = {
  Slime: `<svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path d="M4 14h8v1H4z" fill="rgba(0,0,0,0.3)" /><path d="M6 14h4v-1h3v-2h1v-5h-1v-1h-1v-1h-2v-1h-4v1h-2v1h-1v1h-1v5h1v2h3z" fill="#4caf50" /><path d="M7 8h1v2h-1zM11 8h-1v2h1z" fill="#000" /></svg>`,
  Ghost: `<svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path d="M5 2h6v1h2v2h1v8l-2-1-2 1-2 1-2 1-2 1-1-8h1v-2h1z" fill="#e0e0e0" /><path d="M6 5h1v2h-1zM9 5h1v2h-1z" fill="#000" /></svg>`,
  Demon: `<svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path d="M3 4l2-2v2h6v-2l2 2v2h1v6h-2v2h-8v-2h-2v-6h1z" fill="#d32f2f" /><path d="M5 7h2v1h2v-1h2v2h-6z" fill="#000" /><path d="M4 2l1 2h-2zM12 2l-1 2h2z" fill="#fff" /></svg>`,
  Dragon: `<svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path d="M2 8l4-4h4l4 4v4l-2 2h-8l-2-2z" fill="#4a148c" /><path d="M5 9h2v1h-2zM9 9h2v1h-2z" fill="#ffeb3b" /></svg>`
};
