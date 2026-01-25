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
  type: 'wall' | 'floor' | 'corridor' | 'stairs_down' | 'stairs_up' | 'door';
  visible: boolean;
  x: number;
  y: number;
  roomId?: number;
}

export interface Stats {
  str: number;
  vit: number;
  dex: number;
  agi: number;
  int: number;
  luc: number;
}

export type JobId = 'swordsman' | 'warrior' | 'archer' | 'mage';
export type GodId = 'war' | 'blacksmith' | 'wine';

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
  inventory: any[];
  jobId: JobId;
  godId: GodId;
  skills: string[];
  quests: any[];
  x: number; // 座標を追加
  y: number;
}

export interface DungeonMap {
  floor: number;
  width: number;
  height: number;
  map: Tile[][];
  rooms: any[];
}
