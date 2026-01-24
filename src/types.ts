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
  critRate?: number;
  dropRate?: number;
}

export interface Projectile {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  direction: Direction;
  speed: number;
  damage: number;
  ownerId: string;
  lifeTime: number;
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
  jobId?: string;
  godId?: string;
  skills?: string[];
  skillCooldowns?: Record<string, number>;
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
  tiles: number[][];
  rooms: any[];
  isDark?: boolean;
}

// 装備スロット
export interface Equipment {
  mainHand: string | null; // 武器ID
  armor: string | null;    // 防具ID
}

export interface GameState {
  player: Entity;
  enemies: Entity[];
  items: Item[];
  projectiles: Projectile[];
  inventory: string[];
  equipment: Equipment; // 追加
  map: MapData;
  gameTime: number;
  floor: number;
  messages: string[];
  camera: Position;
}
