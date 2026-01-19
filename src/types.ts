export type JobType = 'Swordsman' | 'Warrior' | 'Archer' | 'Mage';
// 既存コードとの互換性のためのエイリアス
export type Job = JobType;
export type Gender = 'male' | 'female';
export type ResolutionMode = 'Low' | 'High';
export type Biome = 'Grass' | 'Water' | 'Forest' | 'Mountain';

export type Rarity = 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary';
export type ItemType = 'Weapon' | 'Shield' | 'Head' | 'Body' | 'Legs' | 'Accessory' | 'Consumable' | 'Material';
// 既存コードとの互換性
export type EquipmentType = ItemType;

export interface Stats {
  str: number;
  dex: number;
  int: number;
  vit: number;
  agi: number;
  luk: number;
}
// 既存コードとの互換性
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
  // レンダラーやユーティリティが必要とするプロパティ
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
}

export interface EnemyEntity extends Entity {
  type: string;
  rarity: 'Normal' | 'Elite' | 'Boss';
  lootTable: string[];
  dead?: boolean;
  race?: string;
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
  worldMap: number[][];
  dayCount: number;
  gameTime: number;
  // レンダラーが必要とする追加プロパティ（オプション）
  droppedItems?: any[];
  particles?: any[];
  floatingTexts?: any[];
  camera?: { x: number, y: number };
}
