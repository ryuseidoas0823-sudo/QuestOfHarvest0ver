import { DungeonMap, Position } from '../types';
import { Enemy } from './enemy';
import { InventoryItem } from './item'; // 追加

export interface PlayerStats {
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  str: number;
  vit: number;
  dex: number;
  agi: number;
  mag: number;
  luc: number;
}

export interface PlayerState extends PlayerStats {
  name: string;
  level: number;
  exp: number;
  nextExp: number;
  gold: number;
  position: Position;
  direction: 'up' | 'down' | 'left' | 'right';
  stats: PlayerStats;
  ct?: number;
  quickPotion: {
    current: number;
    max: number;
  };
  inventory: InventoryItem[]; // 追加: 所持品リスト
  equipment: { // 将来的な拡張用
    weapon?: string;
    armor?: string;
    accessory?: string;
  };
}

export interface LogMessage {
  id: string;
  text: string;
  type: 'info' | 'success' | 'warning' | 'danger';
}

export interface GameState {
  player: PlayerState;
  dungeon: DungeonMap;
  enemies: Enemy[];
  turn: number;
  logs: LogMessage[];
  floor: number;
  isGameOver: boolean;
  isGameClear: boolean;
}
