export type JobId = 'swordsman' | 'mage' | 'thief' | 'cleric';

export interface Stats {
  maxHp: number;
  hp: number;
  maxMp: number;
  mp: number;
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

export type TileType = 'floor' | 'wall' | 'stairs_down' | 'door';

export interface DungeonMap {
  width: number;
  height: number;
  tiles: TileType[][];
  rooms: { x: number; y: number; w: number; h: number }[];
  playerStart: { x: number; y: number };
  stairs: { x: number; y: number };
  visited: boolean[][];
}
