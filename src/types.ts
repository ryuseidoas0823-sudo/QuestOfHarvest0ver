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

export type TileType = 'floor' | 'wall' | 'stairs_down' | 'door' | 'carpet_red'; // ボス部屋用に装飾タイル追加

export type FloorType = 'standard' | 'big_room' | 'boss' | 'maze'; // フロアタイプ追加

export interface DungeonMap {
  width: number;
  height: number;
  tiles: TileType[][];
  rooms: { x: number; y: number; w: number; h: number }[];
  playerStart: { x: number; y: number };
  stairs: { x: number; y: number };
  visited: boolean[][];
  floorType: FloorType; // 追加
}
