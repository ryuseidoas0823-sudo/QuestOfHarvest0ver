import { ItemStats } from '../types/item';

export interface SetBonus {
  requiredCount: number; // 必要装備数
  stats: ItemStats;      // 適用されるボーナスステータス
  description: string;   // UI表示用テキスト
}

export interface SetDef {
  id: string;
  name: string;
  bonuses: SetBonus[];
}

export const SETS: SetDef[] = [
  // 1. 紅蓮の騎士セット (Crimson Knight Set)
  {
    id: 'set_crimson_knight',
    name: '紅蓮の騎士',
    bonuses: [
      {
        requiredCount: 2,
        stats: { fireResist: 50, burnResist: 50 },
        description: '火属性・燃焼耐性 +50%'
      },
      {
        requiredCount: 3,
        stats: { fireDamage: 20 },
        description: '火属性ダメージ +20'
      },
      {
        requiredCount: 4,
        stats: { str: 30, vit: 30, attackPercent: 20 },
        description: 'STR+30, VIT+30, 物理攻撃力+20%'
      }
    ]
  },
  // 2. 森の守護者セット (Forest Guardian Set)
  {
    id: 'set_forest_guardian',
    name: '森の守護者',
    bonuses: [
      {
        requiredCount: 2,
        stats: { evasion: 10, moveSpeed: 10 },
        description: '回避率+10%, 移動速度+10'
      },
      {
        requiredCount: 3,
        stats: { dex: 15, agi: 15, hitRate: 20 },
        description: 'DEX+15, AGI+15, 命中率+20%'
      }
    ]
  },
  // 3. 大賢者の遺産セット (Archmage Legacy Set)
  {
    id: 'set_archmage',
    name: '大賢者の遺産',
    bonuses: [
      {
        requiredCount: 2,
        stats: { mpMaxPercent: 20, mpCostReduction: 10 },
        description: '最大MP+20%, 消費MP-10%'
      },
      {
        requiredCount: 3,
        stats: { int: 30, magicAttackPercent: 25 },
        description: 'INT+30, 魔法攻撃力+25%'
      }
    ]
  }
];

// ヘルパー: IDからセット定義を取得
export const getSetById = (id: string): SetDef | undefined => {
  return SETS.find(s => s.id === id);
};
