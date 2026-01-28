import { EnchantDef } from '../types/item';

// --- Table A: 攻撃・攻撃補助 (Offense) ---
export const ENCHANT_TABLE_A: EnchantDef[] = [
  {
    id: 'off_atk_flat',
    name: 'of Power',
    table: 'offense',
    description: '物理攻撃力 +',
    statsKey: 'attack',
    minVal: 2,
    maxVal: 20,
    isPercentage: false
  },
  {
    id: 'off_atk_pct',
    name: 'Violent',
    table: 'offense',
    description: '物理攻撃力 +%',
    statsKey: 'attack',
    minVal: 5,
    maxVal: 25,
    isPercentage: true
  },
  {
    id: 'off_matk_flat',
    name: 'of Magic',
    table: 'offense',
    description: '魔法攻撃力 +',
    statsKey: 'magicAttack',
    minVal: 2,
    maxVal: 20,
    isPercentage: false
  },
  {
    id: 'off_matk_pct',
    name: 'Sorcerous',
    table: 'offense',
    description: '魔法攻撃力 +%',
    statsKey: 'magicAttack',
    minVal: 5,
    maxVal: 25,
    isPercentage: true
  },
  {
    id: 'off_crit_rate',
    name: 'Deadly',
    table: 'offense',
    description: 'クリティカル率 +%',
    statsKey: 'critRate',
    minVal: 1,
    maxVal: 10,
    isPercentage: false // 率そのものを加算するためfalse扱い（%表記だが実数値加算）
  },
  {
    id: 'off_crit_dmg',
    name: 'Cruel',
    table: 'offense',
    description: 'クリティカルダメージ +%',
    statsKey: 'critDamage',
    minVal: 10,
    maxVal: 50,
    isPercentage: false
  },
  {
    id: 'off_hit_rate',
    name: 'Precise',
    table: 'offense',
    description: '命中率 +%',
    statsKey: 'hitRate',
    minVal: 5,
    maxVal: 20,
    isPercentage: false
  },
  // 属性追加ダメージ
  {
    id: 'off_dmg_fire',
    name: 'Flaming',
    table: 'offense',
    description: '火属性ダメージ追加 +',
    statsKey: 'fireDamage',
    minVal: 3,
    maxVal: 15,
    isPercentage: false
  },
  {
    id: 'off_dmg_ice',
    name: 'Freezing',
    table: 'offense',
    description: '氷属性ダメージ追加 +',
    statsKey: 'iceDamage',
    minVal: 3,
    maxVal: 15,
    isPercentage: false
  },
  {
    id: 'off_dmg_thunder',
    name: 'Shocking',
    table: 'offense',
    description: '雷属性ダメージ追加 +',
    statsKey: 'lightningDamage',
    minVal: 3,
    maxVal: 15,
    isPercentage: false
  },
  // 状態異常付与
  {
    id: 'off_chance_bleed',
    name: 'Bloody',
    table: 'offense',
    description: '攻撃時、確率で出血付与 +%',
    statsKey: 'bleedChance',
    minVal: 5,
    maxVal: 20,
    isPercentage: false
  },
  {
    id: 'off_chance_poison',
    name: 'Venomous',
    table: 'offense',
    description: '攻撃時、確率で毒付与 +%',
    statsKey: 'poisonChance',
    minVal: 5,
    maxVal: 20,
    isPercentage: false
  },
];

// --- Table B: 防御・生存 (Defense) ---
export const ENCHANT_TABLE_B: EnchantDef[] = [
  {
    id: 'def_hp_flat',
    name: 'of Health',
    table: 'defense',
    description: '最大HP +',
    statsKey: 'hp',
    minVal: 10,
    maxVal: 100,
    isPercentage: false
  },
  {
    id: 'def_hp_pct',
    name: 'Vital',
    table: 'defense',
    description: '最大HP +%',
    statsKey: 'hp',
    minVal: 5,
    maxVal: 20,
    isPercentage: true
  },
  {
    id: 'def_def_flat',
    name: 'Sturdy',
    table: 'defense',
    description: '物理防御 +',
    statsKey: 'defense',
    minVal: 2,
    maxVal: 15,
    isPercentage: false
  },
  {
    id: 'def_def_pct',
    name: 'Fortified',
    table: 'defense',
    description: '物理防御 +%',
    statsKey: 'defense',
    minVal: 5,
    maxVal: 25,
    isPercentage: true
  },
  {
    id: 'def_mdef_flat',
    name: 'Warded',
    table: 'defense',
    description: '魔法防御 +',
    statsKey: 'magicDefense',
    minVal: 2,
    maxVal: 15,
    isPercentage: false
  },
  {
    id: 'def_eva',
    name: 'Elusive',
    table: 'defense',
    description: '回避率 +%',
    statsKey: 'evasion',
    minVal: 2,
    maxVal: 10,
    isPercentage: false
  },
  // 耐性
  {
    id: 'def_res_poison',
    name: 'Antidote',
    table: 'defense',
    description: '毒耐性 +%',
    statsKey: 'poisonResist',
    minVal: 10,
    maxVal: 50,
    isPercentage: false
  },
  {
    id: 'def_res_stun',
    name: 'Unwavering',
    table: 'defense',
    description: 'スタン耐性 +%',
    statsKey: 'stunResist',
    minVal: 10,
    maxVal: 50,
    isPercentage: false
  },
  {
    id: 'def_reflect',
    name: 'Spiked',
    table: 'defense',
    description: 'ダメージ反射 +%',
    statsKey: 'damageReflection',
    minVal: 5,
    maxVal: 20,
    isPercentage: false
  },
];

// --- Table C: 特殊・ユーティリティ (Utility & Special) ---
export const ENCHANT_TABLE_C: EnchantDef[] = [
  {
    id: 'util_str',
    name: 'of Bear',
    table: 'utility',
    description: 'STR +',
    statsKey: 'str',
    minVal: 1,
    maxVal: 10,
    isPercentage: false
  },
  {
    id: 'util_dex',
    name: 'of Falcon',
    table: 'utility',
    description: 'DEX +',
    statsKey: 'dex',
    minVal: 1,
    maxVal: 10,
    isPercentage: false
  },
  {
    id: 'util_int',
    name: 'of Owl',
    table: 'utility',
    description: 'INT +',
    statsKey: 'int',
    minVal: 1,
    maxVal: 10,
    isPercentage: false
  },
  {
    id: 'util_all_stats',
    name: 'Celestial',
    table: 'utility',
    description: '全ステータス +',
    statsKey: 'allStats',
    minVal: 1,
    maxVal: 5,
    isPercentage: false
  },
  {
    id: 'util_exp',
    name: 'Learned',
    table: 'utility',
    description: '経験値取得量 +%',
    statsKey: 'expRate',
    minVal: 5,
    maxVal: 20,
    isPercentage: false
  },
  {
    id: 'util_gold',
    name: 'Greedy',
    table: 'utility',
    description: 'ゴールド取得量 +%',
    statsKey: 'goldRate',
    minVal: 10,
    maxVal: 30,
    isPercentage: false
  },
  {
    id: 'util_drop',
    name: 'Lucky',
    table: 'utility',
    description: 'ドロップ率 +%',
    statsKey: 'dropRate',
    minVal: 5,
    maxVal: 15,
    isPercentage: false
  },
  {
    id: 'util_speed',
    name: 'Quick',
    table: 'utility',
    description: '行動速度アップ',
    statsKey: 'speed', // CT速度
    minVal: 2,
    maxVal: 10,
    isPercentage: false
  },
  {
    id: 'util_mp_cost',
    name: 'Efficient',
    table: 'utility',
    description: '消費MP軽減 -%',
    statsKey: 'mpCostReduction',
    minVal: 5,
    maxVal: 20,
    isPercentage: false
  },
];

export const ALL_ENCHANTS = [
  ...ENCHANT_TABLE_A,
  ...ENCHANT_TABLE_B,
  ...ENCHANT_TABLE_C
];

// テーブルごとの取得ヘルパー
export const getEnchantsByTable = (table: EnchantDef['table']) => {
  switch (table) {
    case 'offense': return ENCHANT_TABLE_A;
    case 'defense': return ENCHANT_TABLE_B;
    case 'utility': return ENCHANT_TABLE_C;
  }
};
