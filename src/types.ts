export type JobType = 'Swordsman' | 'Warrior' | 'Archer' | 'Mage';
export type Job = JobType;
export type Gender = 'male' | 'female';
export type ResolutionMode = 'auto' | '800x600' | 'Low' | 'High';
export type Biome = 'Grass' | 'Water' | 'Forest' | 'Mountain';

export type Rarity = 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary';
export type ItemType = 'Weapon' | 'Shield' | 'Head' | 'Body' | 'Legs' | 'Accessory' | 'Consumable' | 'Material';
export type EquipmentType = ItemType;

export interface Stats {
  str: number;
  dex: number;
  int: number;
  vit: number;
  agi: number;
  luk: number;
}
export type Attributes = Stats;

export interface Entity {
  id: string;
  name: string;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  level: number;
  stats: Stats;
  x: number;
  y: number;
  width: number;
  height: number;
  visualWidth: number;
  visualHeight: number;
  isMoving: boolean;
  animFrame: number;
  direction: 'left' | 'right';
  color?: string;
}

export interface PlayerEntity extends Entity {
  job: JobType;
  gender: Gender;
  exp: number;
  maxExp: number;
  statPoints: number;
  inventory: Item[];
  equipment: {
    weapon: Item | null;
    shield: Item | null;
    head: Item | null;
    body: Item | null;
    legs: Item | null;
    accessory: Item | null;
  };
  hunger: number;
  thirst: number;
  energy: number;
  lastAttackTime: number;
  invincibleUntil: number;
}

export interface EnemyEntity extends Entity {
  type: string;
  rarity: 'Normal' | 'Elite' | 'Boss';
  lootTable: string[];
  dead?: boolean;
  race?: string;
  behavior: 'idle' | 'chase' | 'attack';
  visionRange: number;
  attackRange: number;
  attackCooldown: number;
  lastAttackTime: number;
}

export interface Item {
  id: string;
  name: string;
  type: ItemType;
  rarity: Rarity;
  stats?: Partial<Stats>;
  description: string;
  value: number;
  icon?: string;
  color?: string;
  restore?: {
    hp?: number;
    mp?: number;
    hunger?: number;
    thirst?: number;
    energy?: number;
  };
}

export interface GameState {
  player: PlayerEntity;
  enemies: EnemyEntity[];
  worldMap: number[][]; // renderer.ts で map ではなくこちらを使用
  dayCount: number;
  gameTime: number;
  droppedItems?: any[];
  particles?: any[];
  floatingTexts?: any[];
  camera?: { x: number, y: number };
}

export type TileType = number;
export interface Tile { 
  type: TileType; 
  x: number; 
  y: number; 
  solid?: boolean; 
}

// アセット用。各アセットファイルで使用されるヘルパー
export type JobAssets = Record<JobType, { male: any; female: any }>;
export const svgToUrl = (svg: string) => `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
