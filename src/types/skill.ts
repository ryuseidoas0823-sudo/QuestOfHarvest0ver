import { ItemEffect } from './item';

export type SkillType = 'active' | 'passive' | 'modifier' | 'exclusive';

export interface SkillEffect {
  type: string; // 'damage', 'buff', 'debuff', 'heal' etc.
  value?: number;
  duration?: number;
  status?: string; // 'poison', 'stun' etc.
  target?: 'self' | 'enemy' | 'area';
  range?: number;
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  type: SkillType;
  maxLevel: number; // 最大スキルレベル
  tier: number; // 必要マスタリーレベル (Tier 1=1, Tier 2=5, Tier 3=10...)
  mpCost?: number; // レベルごとの変動は簡易化のため固定、または別途計算
  cooldown?: number;
  icon: string;
  parentSkillId?: string; // 派生元のスキルID (Modifier用)
  mutuallyExclusiveWith?: string[]; // 排他スキルのIDリスト
  
  // スキルレベルごとの効果計算用関数はデータ定義が複雑になるため、
  // 今回は簡易的に「ベース値 + Lv補正」のような構造か、固定値を持たせる
  baseEffect?: SkillEffect; 
}

export interface PlayerSkillState {
  [skillId: string]: number; // SkillId -> Current Level
}
