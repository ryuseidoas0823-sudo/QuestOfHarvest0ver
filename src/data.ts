import { JobType, Stats, Biome } from './types';

/**
 * 初期プレイヤーステータスの定義
 */
export const INITIAL_PLAYER_STATS: Record<JobType, Stats> = {
  Swordsman: { str: 12, dex: 10, int: 8, vit: 12, agi: 10, luk: 8 },
  Warrior: { str: 15, dex: 8, int: 5, vit: 15, agi: 7, luk: 10 },
  Archer: { str: 10, dex: 15, int: 8, vit: 8, agi: 14, luk: 15 },
  Mage: { str: 5, dex: 8, int: 18, vit: 8, agi: 10, luk: 11 },
};

/**
 * バイオームごとの色定義
 */
export const BIOME_COLORS: Record<Biome, string> = {
  Grass: '#10b981',
  Water: '#3b82f6',
  Forest: '#064e3b',
  Mountain: '#4b5563',
};

export const JOB_STATS = INITIAL_PLAYER_STATS;
