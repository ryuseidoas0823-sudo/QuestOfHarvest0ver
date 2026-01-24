export type Direction = 'up' | 'down' | 'left' | 'right';

// 画面遷移の状態 (App.tsxでの画面制御に使用)
// 'town' を追加し、名称を GameScreen に変更して区別します
export type GameScreen = 'title' | 'godSelect' | 'jobSelect' | 'town' | 'playing' | 'gameOver' | 'gameClear';

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

export interface Equipment {
  mainHand: string | null;
  armor: string | null;
}

export interface FloatingText {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  lifeTime: number;
  velocityY: number;
}

// ゲームプレイ中の全データ状態 (セーブデータや状態管理用)
export interface GameState {
  player: Entity;
  enemies: Entity[];
  items: Item[];
  projectiles: Projectile[];
  floatingTexts: FloatingText[];
  inventory: string[];
  equipment: Equipment;
  map: MapData;
  gameTime: number;
  floor: number;
  messages: string[];
  camera: Position;
}
