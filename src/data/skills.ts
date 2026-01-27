import { Skill } from '../types/skill';
import { JobId } from '../types/job';

// ティアとマスタリーレベルの対応
// Tier 1: Mastery 1, Tier 2: Mastery 5, Tier 3: Mastery 10...

export const SKILLS: Record<string, Skill> = {
  // --- 戦士 (Soldier) Skills ---
  'power_strike': {
    id: 'power_strike',
    name: 'パワーストライク',
    description: '敵単体に強力な物理攻撃を行い、確率でスタンさせる。',
    type: 'active',
    maxLevel: 16,
    tier: 1,
    mpCost: 3,
    cooldown: 0,
    icon: '💥',
    targetType: 'enemy',
    range: 1,
    baseEffect: { type: 'damage', value: 1.5, status: 'stun' }
  },
  'impact': {
    id: 'impact',
    name: 'インパクト',
    description: 'パワーストライクの衝撃波を広げ、範囲攻撃にする。',
    type: 'modifier',
    maxLevel: 12,
    tier: 10, // Tier 3
    parentSkillId: 'power_strike',
    icon: '🌊',
    targetType: 'none', 
  },
  'round_slash': {
    id: 'round_slash',
    name: 'ラウンドスラッシュ',
    description: '周囲の敵を同時になぎ払う範囲攻撃。',
    type: 'active',
    maxLevel: 12,
    tier: 15, // Tier 4
    mpCost: 8,
    cooldown: 2,
    icon: '🌪️',
    targetType: 'area', 
    range: 0,
    areaRadius: 1,
    baseEffect: { type: 'damage', value: 0.8 }
  },
  'berserk_mode': {
    id: 'berserk_mode',
    name: 'バーサークモード',
    description: '[排他] 攻撃力と移動速度が大幅に上昇するが、防御力が低下する。',
    type: 'exclusive',
    maxLevel: 12,
    tier: 50, // Tier 9
    mpCost: 0, 
    icon: '😡',
    targetType: 'self',
    mutuallyExclusiveWith: ['guardian_stance'],
    baseEffect: { type: 'buff', status: 'berserk' }
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
    targetType: 'self',
    mutuallyExclusiveWith: ['berserk_mode'],
    baseEffect: { type: 'buff', status: 'guardian' }
  },

  // --- 盗賊 (Rogue) Skills ---
  'dual_wield_mastery': {
    id: 'dual_wield_mastery',
    name: '二刀の心得',
    description: '二刀流が可能になり、物理ダメージボーナスを得る。',
    type: 'passive',
    maxLevel: 10,
    tier: 1,
    icon: '⚔️',
    targetType: 'none',
  },
  'venom_edge': {
    id: 'venom_edge',
    name: 'ベノムエッジ',
    description: '毒を塗った刃で攻撃し、敵を毒状態にする。',
    type: 'active',
    maxLevel: 12,
    tier: 10, // Tier 3
    mpCost: 5,
    icon: '☠️',
    targetType: 'enemy',
    range: 1,
    baseEffect: { type: 'damage', value: 1.0, status: 'poison' }
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
    icon: '💉',
    targetType: 'self',
    baseEffect: { type: 'heal_hp', value: 50 }
  },
  'killing_zone': {
    id: 'killing_zone',
    name: 'キリングゾーン',
    description: '[排他] クリティカル発生率とダメージを大幅に強化する。',
    type: 'exclusive',
    maxLevel: 12,
    tier: 50, // Tier 9
    icon: '🎯',
    targetType: 'self',
    mutuallyExclusiveWith: [],
    baseEffect: { type: 'buff', status: 'killing_zone' }
  },

  // --- 狩人 (Ranger) Skills ---
  'power_shot': {
    id: 'power_shot',
    name: 'パワーショット',
    description: '遠くの敵を射抜く強力な一撃。',
    type: 'active',
    maxLevel: 12,
    tier: 1,
    mpCost: 5,
    icon: '🏹',
    targetType: 'enemy', 
    range: 5,
    baseEffect: { type: 'damage', value: 1.3 }
  },
  'arrow_rain': {
    id: 'arrow_rain',
    name: 'アローレイン',
    description: '指定した地点に矢の雨を降らせる範囲攻撃。',
    type: 'active',
    maxLevel: 12,
    tier: 15,
    mpCost: 15,
    icon: '🌧️',
    targetType: 'area', 
    range: 4,
    areaRadius: 1, 
    baseEffect: { type: 'damage', value: 0.8 }
  },

  // --- 魔導士 (Arcanist) Skills ---
  'fireball': {
    id: 'fireball',
    name: 'ファイアボール',
    description: '火の玉を放ち、着弾点と周囲を焼き払う。',
    type: 'active',
    maxLevel: 16,
    tier: 1,
    mpCost: 8,
    icon: '🔥',
    targetType: 'area',
    range: 4,
    areaRadius: 1,
    baseEffect: { type: 'damage', value: 1.2 }
  },
  'ignite': {
    id: 'ignite',
    name: 'イグナイト',
    description: 'ファイアボールの爆発範囲を拡大し、さらに敵を燃焼させる。',
    type: 'modifier',
    maxLevel: 10,
    tier: 10, // Tier 3
    parentSkillId: 'fireball',
    icon: '🎇',
    targetType: 'none'
  },
  'magic_barrier': {
    id: 'magic_barrier',
    name: 'マジックバリア',
    description: 'マナを消費してダメージを軽減する障壁を展開。',
    type: 'active',
    maxLevel: 12,
    tier: 15,
    mpCost: 20,
    icon: '🔮',
    targetType: 'self',
    baseEffect: { type: 'buff', status: 'barrier' }
  }
};

export const JOB_SKILL_TREE: Record<JobId, string[]> = {
  soldier: ['power_strike', 'impact', 'round_slash', 'berserk_mode', 'guardian_stance'],
  rogue: ['dual_wield_mastery', 'venom_edge', 'adrenaline_rush', 'killing_zone'],
  arcanist: ['fireball', 'ignite', 'magic_barrier'],
  ranger: ['power_shot', 'arrow_rain'],
  monk: []
};
