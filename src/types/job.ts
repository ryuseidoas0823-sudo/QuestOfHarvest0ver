import { Stats } from '../types';

export type JobId = 'warrior' | 'mage' | 'rogue' | 'cleric' | 'archer' | 'paladin';

export interface Job {
  id: JobId;
  name: string;
  description: string;
  baseStats: Stats;
  growthRates: Stats;
  skills: string[]; // 追加: 習得スキルIDのリスト
}
