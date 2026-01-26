// 型定義の集約ファイル

export * from './types/gameState';
export * from './types/input';
export * from './types/item';
export * from './types/job';
export * from './types/skill';
export * from './types/quest';
export * from './types/enemy';
export * from './types/event';
export * from './types/dialogue';

// 共通型定義

export type Direction = 'up' | 'down' | 'left' | 'right';

export interface Tile {
  // 'chest' を明示的に追加
  type: 'wall' | 'floor' | 'corridor' | 'stairs_down' | 'stairs_up' | 'door' | 'chest' | 'stairs';
  visible: boolean;
  explored?: boolean;
  x: number;
  y: number;
  roomId?: number;
  // 宝箱の中身などを保持する場合に使用
  meta?: {
      itemId?: string;
      opened?: boolean;
  };
}

export type TileType = Tile['type'];

// Stats定義の拡張
export interface Stats {
  str: number;
  vit: number;
  dex: number;
  agi: number;
  int: number;
  luc: number;
  
  // 派生・ボーナス
  hp?: number;
  maxHp?: number;
  sp?: number;
  maxSp?: number;
  attack?: number;
  defense?: number;
  speed?: number;
  
  [key: string]: number | undefined;
}

export type JobId = 'swordsman' | 'warrior' | 'archer' | 'mage';
export type GodId = 'war' | 'blacksmith' | 'wine';

export interface JobDefinition {
  id: JobId;
  name: string;
  description: string;
  baseStats: Stats;
  growthRates: Stats;
  skills: string[];
  assetKey: string;
  allowedWeapons: string[];
}

export interface GodDefinition {
  id: GodId;
  name: string;
  description: string;
  bonuses: {
    attack?: number;
    defense?: number;
    maxHp?: number;
    dropRate?: number;
    expRate?: number;
    critRate?: number;
  };
}

// PlayerStateの定義 (usePlayerなどで使用)
export interface PlayerState {
  name: string;
  hp: number;
  maxHp: number;
  sp: number;
  maxSp: number;
  stats: Stats;
  level: number;
  exp: number;
  nextExp: number;
  gold: number;
  equipment: {
    weapon: any | null;
    armor: any | null;
    accessory: any | null;
  };
  inventory: string[]; // itemIdの配列
  jobId: JobId;
  godId: GodId;
  skills: string[];
  quests: any[];
  x: number;
  y: number;
}

export interface DungeonMap {
  floor: number;
  width: number;
  height: number;
  map: Tile[][];
  rooms: any[];
  startPosition?: { x: number; y: number };
  spawnPoints?: { x: number; y: number }[];
}
