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
  stats: PlayerStats;
  ct?: number;
  // 追加: クイックポーション管理
  quickPotion: {
    current: number;
    max: number;
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
