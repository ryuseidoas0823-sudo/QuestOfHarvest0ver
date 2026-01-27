import { StatusEffect, CooldownState } from './combat';

export type EnemyType = 'normal' | 'elite' | 'boss';
export type EnemyRace = 'beast' | 'humanoid' | 'undead' | 'construct' | 'plant' | 'demon' | 'dragon';
export type EnemyAI = 'chase' | 'ranged' | 'stationary' | 'random' | 'boss_minotaur' | 'boss_goliath';

export interface EnemyStats {
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  attack: number;
  defense: number;
  magicAttack: number;
  magicDefense: number;
  speed: number;
  exp: number;
  gold: number;
}

export interface EnemyDefinition {
  id: string;
  name: string;
  type: EnemyType;
  race: EnemyRace;
  symbol: string; // ASCII symbol or sprite ID
  color: string;
  stats: EnemyStats;
  ai: EnemyAI;
  skills: string[]; // Skill IDs
  dropTable: {
    itemId: string;
    rate: number; // 0.0 - 1.0
  }[];
  resistances?: {
    [key: string]: number; // damage multiplier (e.g. 0.5 for 50% resistance)
  };
  weaknesses?: {
    [key: string]: number; // damage multiplier (e.g. 1.5 for 50% weakness)
  };
}

export interface EnemyInstance extends EnemyDefinition {
  uniqueId: string;
  x: number;
  y: number;
  ct: number; // Charge Time
  statusEffects: StatusEffect[]; // 更新: 新しい型定義を使用
  cooldowns: CooldownState;
  isAggro: boolean; // Has noticed player
}
