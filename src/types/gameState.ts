import { DungeonMap, Position } from '../types';
import { Enemy } from './enemy';

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
  stats: PlayerStats; // statsオブジェクトとしてネストも維持（互換性のため）
  ct?: number; // Charge Time (Active Turn System)
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
