import { JobId } from './job';

export type ItemType = 'weapon' | 'armor' | 'accessory' | 'consumable' | 'material' | 'key';

export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'godly';

export type WeaponType = 'dagger' | 'sword' | '2h_sword' | 'axe' | 'mace' | 'hammer' | '2h_axe' | 'bow' | 'longbow' | 'crossbow' | 'staff' | 'book';
export type ArmorType = 'light' | 'heavy' | 'robe' | 'shield';
export type AccessoryType = 'ring' | 'amulet' | 'boots' | 'other';
export type ItemSubType = WeaponType | ArmorType | AccessoryType | 'none';

export type EffectType = 
  | 'heal_hp' 
  | 'heal_mp' 
  | 'cure_poison' 
  | 'cure_stun' 
  | 'buff_str' 
  | 'buff_vit' 
  | 'buff_dex' 
  | 'buff_agi' 
  | 'buff_int' 
  | 'return_town';

export interface ItemEffect {
  type: EffectType;
  value: number;
  duration?: number;
}

export interface ItemRequirements {
  level?: number;
  job?: JobId[];
  stats?: {
    str?: number;
    vit?: number;
    dex?: number;
    agi?: number;
    int?: number;
    wis?: number;
  };
}

// 拡張されたステータス定義
export interface ItemStats {
  // 基礎ステータス (Flat: 固定値加算)
  hp?: number;
  mp?: number;
  attack?: number;
  defense?: number;
  magicAttack?: number;
  magicDefense?: number;
  speed?: number; // CT速度

  // 基礎ステータス (Percent: 割合加算)
  // 計算式: (Base + Flat) * (1 + Percent/100)
  hpMaxPercent?: number;
  mpMaxPercent?: number;
  attackPercent?: number;
  defensePercent?: number;
  magicAttackPercent?: number;
  magicDefensePercent?: number;
  
  // 能力値 (Attributes)
  str?: number;
  vit?: number;
  dex?: number;
  agi?: number;
  int?: number;
  wis?: number;
  allStats?: number;

  // 戦闘パラメータ
  critRate?: number; // %
  critDamage?: number; // % (Base 150% + this)
  hitRate?: number; // %
  evasion?: number; // %
  blockRate?: number; // %
  
  // 属性攻撃
  fireDamage?: number;
  iceDamage?: number;
  lightningDamage?: number;
  lightDamage?: number;
  darkDamage?: number;

  // 状態異常付与
  poisonChance?: number; // %
  bleedChance?: number; // %
  stunChance?: number; // %

  // 耐性
  poisonResist?: number; // %
  burnResist?: number; // %
  stunResist?: number; // %
  fireResist?: number; // %
  iceResist?: number; // %
  lightningResist?: number; // %
  
  // 特殊
  damageReflection?: number; // %
  expRate?: number; // %
  goldRate?: number; // %
  dropRate?: number; // %
  moveSpeed?: number;
  mpCostReduction?: number; // %
  cooldownReduction?: number; // %
}

// エンチャントの定義
export type EnchantTableType = 'offense' | 'defense' | 'utility';

export interface EnchantDef {
  id: string;
  name: string;
  table: EnchantTableType;
  description: string;
  statsKey: keyof ItemStats; // 適用するステータス
  minVal: number;
  maxVal: number;
  isPercentage?: boolean; // 表示用フラグ（実際の計算はstatsKeyのプロパティで行う）
}

export interface EnchantInstance {
  defId: string;
  roll: number;
  value: number;
}

export interface Item {
  id: string;
  name: string;
  type: ItemType;
  subType?: ItemSubType;
  rarity: ItemRarity;
  description: string;
  value: number;
  
  stats?: ItemStats;
  requirements?: ItemRequirements;
  effect?: ItemEffect;
  
  stackable?: boolean;
  maxStack?: number;
  quantity?: number;
  
  icon?: string;

  uniqueId?: string;
  tier?: number;
  enchants?: EnchantInstance[];
  isUnique?: boolean;
}
