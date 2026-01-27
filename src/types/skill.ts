import { ItemEffect } from './item';

export type SkillType = 'active' | 'passive' | 'modifier' | 'exclusive';
export type TargetType = 'self' | 'enemy' | 'ally' | 'area' | 'direction' | 'none';

export interface SkillEffect {
  type: string; // 'damage', 'buff', 'debuff', 'heal' etc.
  value?: number;
  duration?: number;
  status?: string; // 'poison', 'stun' etc.
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  type: SkillType;
  maxLevel: number; // 最大スキルレベル
  tier: number; // 必要マスタリーレベル
  mpCost?: number; 
  cooldown?: number;
  icon: string;
  parentSkillId?: string; // 派生元のスキルID (Modifier用)
  mutuallyExclusiveWith?: string[]; // 排他スキルのIDリスト
  
  // ターゲット・射程設定
  targetType: TargetType;
  range?: number; // 射程距離 (0は自分、1は隣接)
  areaRadius?: number; // 効果範囲半径 (0は単体、1は周囲1マスなど)
  
  baseEffect?: SkillEffect; 
}

export interface PlayerSkillState {
  [skillId: string]: number; // SkillId -> Current Level
}
