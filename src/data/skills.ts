import { Skill } from '../types/skill';
import { JobId } from '../types/job';

// ティアとマスタリーレベルの対応
// Tier 1: Mastery 1
// Tier 2: Mastery 5
// Tier 3: Mastery 10
// Tier 4: Mastery 15
// ...
// Tier 9: Mastery 50

export const SKILLS: Record<string, Skill> = {
  // --- 戦士 (Soldier) Skills ---
  'power_strike': {
    id: 'power_strike',
    name: 'パワーストライク',
    description: '敵単体に物理大ダメージを与え、確率でスタンさせる。',
    type: 'active',
    maxLevel: 16,
    tier: 1,
    mpCost: 3,
    cooldown: 0,
    icon: '💥',
    baseEffect: { type: 'damage', value: 1.2 }
  },
  'impact': {
    id: 'impact',
    name: 'インパクト',
    description: 'パワーストライクの衝撃波を広げ、範囲攻撃にする。',
    type: 'modifier',
    maxLevel: 12,
    tier: 10, // Tier 3
    parentSkillId: 'power_strike',
    icon: '🌊'
  },
  'round_slash': {
    id: 'round_slash',
    name: 'ラウンドスラッシュ',
    description: '前方扇状の範囲を武器でなぎ払う。',
    type: 'active',
    maxLevel: 12,
    tier: 15, // Tier 4
    mpCost: 8,
    cooldown: 2,
    icon: '🌪️'
  },
  'berserk_mode': {
    id: 'berserk_mode',
    name: 'バーサークモード',
    description: '[排他] 攻撃力と移動速度が大幅に上昇するが、防御力が低下する。',
    type: 'exclusive',
    maxLevel: 12,
    tier: 50, // Tier 9
    mpCost: 0, // トグル式想定
    icon: '😡',
    mutuallyExclusiveWith: ['guardian_stance']
  },
  'guardian_stance': {
    id: 'guardian_stance',
    name: 'ガーディアンスタンス',
    description: '[排他] ダメージカット率とHP自然回復力が大幅に上昇する。',
    type: 'exclusive',
    maxLevel: 12,
    tier: 50, // Tier 9
    mpCost: 0,
    icon: '🛡️',
    mutuallyExclusiveWith: ['berserk_mode']
  },

  // --- 盗賊 (Rogue) Skills ---
  'dual_wield_mastery': {
    id: 'dual_wield_mastery',
    name: '二刀の心得',
    description: '二刀流が可能になり、物理ダメージボーナスを得る。',
    type: 'passive',
    maxLevel: 10,
    tier: 1,
    icon: '⚔️'
  },
  'venom_edge': {
    id: 'venom_edge',
    name: 'ベノムエッジ',
    description: '武器に毒を塗り、攻撃対象を毒状態にする。',
    type: 'active',
    maxLevel: 12,
    tier: 10, // Tier 3
    mpCost: 5,
    icon: '☠️'
  },
  'adrenaline_rush': {
    id: 'adrenaline_rush',
    name: 'アドレナリンラッシュ',
    description: '一時的に回避率と行動速度を上昇させ、HPを回復する。',
    type: 'active',
    maxLevel: 12,
    tier: 25, // Tier 6
    mpCost: 12,
    cooldown: 15,
    icon: '💉'
  },
  'killing_zone': {
    id: 'killing_zone',
    name: 'キリングゾーン',
    description: '[排他] クリティカル発生率とダメージを大幅に強化する。',
    type: 'exclusive',
    maxLevel: 12,
    tier: 50, // Tier 9
    icon: '🎯'
  }
};

// ジョブごとのスキル配置定義
export const JOB_SKILL_TREE: Record<JobId, string[]> = {
  soldier: ['power_strike', 'impact', 'round_slash', 'berserk_mode', 'guardian_stance'],
  rogue: ['dual_wield_mastery', 'venom_edge', 'adrenaline_rush', 'killing_zone'],
  arcanist: [], // TODO: 追加
  ranger: [], // TODO: 追加
  monk: [] // TODO: 追加
};
