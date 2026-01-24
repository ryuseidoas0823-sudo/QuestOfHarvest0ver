export type JobId = 'swordsman' | 'mage' | 'thief' | 'cleric';

export interface Stats {
  maxHp: number;
  hp: number;
  attack: number;
  defense: number;
  str: number;
  vit: number;
  dex: number;
  agi: number;
  int: number;
  luc: number;
  level: number;
  exp?: number;
}

export type ResolutionMode = 'low' | 'standard' | 'high';
