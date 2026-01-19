export type JobType = 'Swordsman' | 'Warrior' | 'Archer' | 'Mage';
export type Rarity = 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary';
export type ItemType = 'Weapon' | 'Shield' | 'Head' | 'Body' | 'Legs' | 'Accessory' | 'Consumable' | 'Material';

export interface Stats {
  str: number;
  dex: number;
  int: number;
  vit: number;
  agi: number;
  luk: number;
}

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
}

export interface PlayerEntity extends Entity {
  job: JobType;
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
  // サバイバルステータス (0-100)
  hunger: number;
  thirst: number;
  energy: number;
  gender: 'male' | 'female';
}

export interface EnemyEntity extends Entity {
  type: string;
  rarity: 'Normal' | 'Elite' | 'Boss';
  lootTable: string[];
}

export interface Item {
  id: string;
  name: string;
  type: ItemType;
  rarity: Rarity;
  stats?: Partial<Stats>;
  description: string;
  value: number;
  // 消費アイテム用：回復量
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
  worldMap: number[][]; // 0: Grass, 1: Water, 2: Forest, etc.
  dayCount: number;
  gameTime: number; // 0-2400 (分単位)
}
