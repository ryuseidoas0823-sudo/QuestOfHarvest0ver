import { PlayerStats } from './gameState';

export type JobId = 'soldier' | 'rogue' | 'arcanist' | 'ranger' | 'monk';

export interface MasteryGrowth {
  // マスタリーLv1あたりのステータス上昇量
  hp: number;
  mp: number;
  str: number;
  vit: number;
  dex: number;
  agi: number;
  mag: number;
  luc: number;
}

export interface Job {
  id: JobId;
  name: string;
  description: string;
  icon: string;
  // マスタリーごとの成長率
  growth: MasteryGrowth;
  // 初期ボーナス（ジョブ選択時に即座に得られる補正）
  initialStats: Partial<PlayerStats>;
}

// プレイヤーのジョブ習得状況
export interface PlayerJobState {
  mainJob: JobId | null;
  subJob: JobId | null; // Lv20解禁
  mastery: {
    [key in JobId]?: number; // JobId -> Mastery Level (Max 50想定)
  };
}
