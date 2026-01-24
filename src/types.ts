export type TileType = 'wall' | 'floor' | 'stairs';

export interface DungeonMap {
  width: number;
  height: number;
  tiles: TileType[][];
  rooms: { x: number; y: number; w: number; h: number }[];
  playerStart: { x: number; y: number };
  stairs: { x: number; y: number };
  // 追加: 探索済みフラグ (trueならミニマップに表示)
  visited: boolean[][];
}

export interface Stats {
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  attack: number;
  defense: number;
  str: number;
  vit: number;
  dex: number;
  agi: number;
  int: number;
  luc: number;
  level: number;
  exp: number;
}
