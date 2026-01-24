// 既存の型定義をベースに拡張

export type Direction = 'up' | 'down' | 'left' | 'right';

export interface Position {
  x: number;
  y: number;
}

export interface Stats {
  maxHp: number;
  hp: number;
  attack: number;
  defense: number;
  level: number;
  exp: number;
  nextLevelExp: number;
  speed: number;
  // 拡張ステータス
  critRate?: number;
  dropRate?: number;
}

// 飛び道具（スキルで発射される火の玉や矢）
export interface Projectile {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  direction: Direction;
  speed: number;
  damage: number;
  ownerId: string; // 誰が撃ったか
  lifeTime: number; // 消滅までの時間 (ms)
  assetKey: string;
}

export interface Entity {
  id: string;
  type: 'player' | 'enemy' | 'npc';
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  direction: Direction;
  isMoving: boolean;
  stats: Stats;
  
  // 拡張プロパティ
  jobId?: string;
  godId?: string;
  skills?: string[]; // 習得スキルIDのリスト
  skillCooldowns?: Record<string, number>; // スキルID -> 再使用可能になるタイムスタンプ
}

export interface Item {
  id: string;
  x: number;
  y: number;
  itemId: string; // src/data/items.ts のキー
}

export interface MapData {
  width: number;
  height: number;
  tiles: number[][]; // 0: floor, 1: wall
  rooms: any[];
}

export interface GameState {
  player: Entity;
  enemies: Entity[];
  items: Item[];
  projectiles: Projectile[]; // 追加: 画面上の飛び道具リスト
  inventory: string[];       // 追加: プレイヤーの所持品
  map: MapData;
  gameTime: number;
  floor: number;
  messages: string[];
  camera: Position;
}
