export type JobId = 'swordsman' | 'mage' | 'thief' | 'cleric';

export interface Stats {
  maxHp: number;
  hp: number;
  maxMp: number; // 追加
  mp: number;    // 追加
  attack: number;
  defense: number;
  str: number;
  vit: number;
  dex: number;
  agi: number;
  int: number;
  luc: number;
  level: number;
  exp?: number;
}

export type ResolutionMode = 'low' | 'standard' | 'high';

// ゲームロジック・ダンジョン生成で共通して使う型
export type TileType = 'floor' | 'wall' | 'stairs_down' | 'door';
export type DungeonMap = TileType[][];
