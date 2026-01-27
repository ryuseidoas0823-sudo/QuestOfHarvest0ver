import { DungeonMap, Position } from '../types';
import { Enemy } from './enemy';
import { InventoryItem, EquipmentSlot } from './item';

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

// 装備スロットマップ
export interface PlayerEquipment {
  mainHand?: string; // ItemID
  offHand?: string;
  body?: string;
  accessory?: string;
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
  inventory: InventoryItem[];
  equipment: PlayerEquipment; // 構造を変更
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
