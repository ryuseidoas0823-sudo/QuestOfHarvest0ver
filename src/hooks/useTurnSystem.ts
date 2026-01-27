import { Position } from '../types';

export interface EnemyStats {
  hp: number;
  maxHp: number;
  str: number;
  vit: number;
  dex: number;
  agi: number;
  mag: number;
  luc: number;
  level: number;
}

export interface Enemy extends EnemyStats {
  id: string;
  name: string;
  type: string;
  symbol: string;
  color: string;
  position: Position;
  stats: EnemyStats;
  ct?: number; // Charge Time (Active Turn System)
}
