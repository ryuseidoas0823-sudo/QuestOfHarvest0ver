export type GameScreen = 'title' | 'game';

export type Job = 'Swordsman' | 'Warrior' | 'Archer' | 'Mage';
export type Gender = 'Male' | 'Female';
export type Biome = 'WorldMap' | 'Town' | 'Dungeon' | 'Plains' | 'Forest' | 'Desert' | 'Snow' | 'Wasteland';

export interface Attributes {
  vitality: number;
  strength: number;
  dexterity: number;
  intelligence: number;
  endurance: number;
}

export type EquipmentType = 'Weapon' | 'Helm' | 'Armor' | 'Shield' | 'Boots';
export type WeaponStyle = 'OneHanded' | 'TwoHanded' | 'DualWield';
export type Rarity = 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary';

export interface ItemStats {
  attack: number;
  defense: number;
  speed: number;
  maxHp: number;
}

export interface Enchantment {
  type: 'Attack' | 'Defense' | 'Speed' | 'MaxHp';
  value: number;
  strength: 'Weak' | 'Medium' | 'Strong';
  name: string;
}

export interface Item {
  id: string;
  name: string;
  type: EquipmentType;
  subType?: WeaponStyle;
  rarity: Rarity;
  level: number;
  stats: ItemStats;
  enchantments: Enchantment[];
  icon: string;
  color: string;
}

export interface Entity {
  id: string;
  type: 'player' | 'enemy' | 'npc';
  x: number;
  y: number;
  width: number;
  height: number;
  visualWidth?: number;
  visualHeight?: number;
  color: string;
  direction: number; // 0: right, 1: down, 2: left, 3: up
  dead: false; // 常にfalse (dead check用)
}

export interface PlayerEntity extends Entity {
  type: 'player';
  job: Job;
  gender: Gender;
  shape: 'humanoid';
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  attack: number;
  defense: number;
  speed: number;
  level: number;
  xp: number;
  nextLevelXp: number;
  gold: number;
  statPoints: number;
  attributes: Attributes;
  lastAttackTime: number;
  attackCooldown: number;
  inventory: Item[];
  equipment: {
    mainHand?: Item;
    offHand?: Item;
    helm?: Item;
    armor?: Item;
    boots?: Item;
  };
  vx?: number;
  vy?: number;
  isAttacking?: boolean;
  calculatedStats: {
    maxHp: number;
    maxMp: number;
    attack: number;
    defense: number;
    speed: number;
  };
}

export interface EnemyEntity extends Entity {
  type: 'enemy';
  race: string;
  rank: 'Normal' | 'Elite' | 'Boss';
  shape: 'humanoid' | 'insect' | 'demon' | 'flying' | 'slime' | 'dragon' | 'beast' | 'ghost';
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  speed: number;
  level: number;
  lastAttackTime: number;
  attackCooldown: number;
  detectionRange: number;
  vx?: number;
  vy?: number;
  xpValue: number;
}

export type TileType = 'grass' | 'dirt' | 'rock' | 'water' | 'sand' | 'snow' | 'floor' | 'wall' | 'portal_in' | 'portal_out' | 'tree' | 'town_entrance' | 'dungeon_entrance';

export interface Tile {
  x: number;
  y: number;
  type: TileType;
  solid: boolean;
  teleportTo?: string;
}

export interface DroppedItem {
  id: string;
  type: 'drop';
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  item: Item;
  life: number;
  dead: boolean;
  vx?: number;
  vy?: number;
  bounceOffset?: number;
}

export interface Projectile {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
  damage: number;
  ownerId: string;
}

export interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
  size: number;
}

export interface FloatingText {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
  type: 'text';
  width: 0;
  height: 0;
  dead: boolean;
}

export interface ChunkData {
  map: Tile[][];
  enemies: EnemyEntity[];
  droppedItems: DroppedItem[];
  biome: Biome;
  locationId: string;
}

export interface GameState {
  worldX: number;
  worldY: number;
  currentBiome: Biome;
  savedChunks: Record<string, ChunkData>;
  map: Tile[][];
  player: PlayerEntity;
  enemies: EnemyEntity[];
  droppedItems: DroppedItem[];
  projectiles: Projectile[];
  particles: Particle[];
  floatingTexts: FloatingText[];
  camera: { x: number; y: number };
  gameTime: number;
  isPaused: boolean;
  wave: number;
  locationId: string;
  lastWorldPos?: { x: number; y: number };
}

export type MenuType = 'none' | 'inventory' | 'stats' | 'status';
export type ResolutionMode = 'auto' | '800x600' | '1024x768' | '1280x720';
