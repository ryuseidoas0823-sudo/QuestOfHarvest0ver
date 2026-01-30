import { Position } from './input';

export type EnemyAI = 'chase' | 'ranged' | 'random' | 'boss_minotaur' | 'boss_goliath';

export interface EnemyStats {
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  magicAttack: number;
  magicDefense: number;
  speed: number;
  exp: number;
}

// Master data definition
export interface Enemy {
  id: string;
  name: string;
  symbol: string; // For ASCII art fallback
  color: string;
  stats: EnemyStats;
  aiType: EnemyAI;
  skills?: string[]; // Array of skill IDs
  dropTable?: any[]; // Drop definition
}

// Instance in game
export interface EnemyInstance extends Enemy {
  uniqueId: string;
  position: Position;
  // Instance specific current HP etc.
  stats: EnemyStats; 
  statusEffects: any[]; // Use StatusEffect type if available
  cooldowns: Record<string, number>;
  isAggro: boolean;
}
