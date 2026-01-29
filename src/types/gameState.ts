import { DungeonState } from './dungeon';
import { EnemyInstance } from './enemy';

export interface Position {
  x: number;
  y: number;
}

export interface Stats {
  str: number; // Strength: 物理攻撃力
  dex: number; // Dexterity: 命中率、クリティカル、短剣攻撃力
  agi: number; // Agility: 回避率、行動順
  vit: number; // Vitality: 最大HP、物理防御
  int: number; // Intelligence: 最大MP、魔法攻撃/防御
  luk?: number; // Luck: クリティカル、ドロップ率（任意）
  
  // 計算済みまたは固定値（敵など）
  atk?: number;
  def?: number;
}

export interface Player {
  position: Position;
  stats: Stats;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  level: number;
  exp: number;
  statPoints: number; // ステータス割り振りポイント
  name: string;
  gold: number;
  jobId: string; // 職業ID
}

export interface GameState {
  dungeon: DungeonState;
  player: Player;
  enemies: EnemyInstance[];
  turn: number;
  isGameOver: boolean;
  floorLevel: number; // 現在の階層
}
