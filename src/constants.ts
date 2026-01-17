export const GAME_CONFIG = {
  TILE_SIZE: 32,
  MAP_WIDTH: 50,
  MAP_HEIGHT: 50,
  PLAYER_SPEED: 5,
  ENEMY_SPAWN_RATE: 0.02,
  BASE_DROP_RATE: 0.2,
  STAMINA_REGEN: 0.5,
};

export const THEME = {
  colors: {
    ground: '#1a1a1a', grass: '#1e2b1e', wall: '#424242', water: '#1a237e', townFloor: '#5d4037', player: '#d4af37', enemy: '#8b0000', text: '#c0c0c0', highlight: '#ffd700',
    rarity: { Common: '#ffffff', Uncommon: '#1eff00', Rare: '#0070dd', Epic: '#a335ee', Legendary: '#ff8000', }
  }
};

export const RARITY_MULTIPLIERS = { Common: 1.0, Uncommon: 1.2, Rare: 1.5, Epic: 2.0, Legendary: 3.0 };
export const ENCHANT_SLOTS = { Common: 0, Uncommon: 1, Rare: 2, Epic: 3, Legendary: 5 };

export const ITEM_BASE_NAMES = {
  Weapon: { OneHanded: '剣', TwoHanded: '大剣', DualWield: '双剣', Ranged: '弓', Magic: '杖' },
  Helm: '兜', Armor: '板金鎧', Shield: '盾', Boots: '具足', Consumable: '薬', Material: '素材'
};

export const ICONS = {
  Weapon: { OneHanded: '⚔️', TwoHanded: '🗡️', DualWield: '⚔️', Ranged: '🏹', Magic: '🪄' },
  Helm: '🪖', Armor: '🛡️', Shield: '🛡️', Boots: '👢', Consumable: '🧪', Material: '🪵'
};
