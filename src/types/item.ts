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

export interface ItemStats {
  // 基礎ステータス (Flat)
  hp?: number;
  mp?: number;
  attack?: number;
  defense?: number;
  magicAttack?: number;
  magicDefense?: number;
  speed?: number;

  // 基礎ステータス (Percent)
  hpMaxPercent?: number;
  mpMaxPercent?: number;
  attackPercent?: number;
  defensePercent?: number;
  magicAttackPercent?: number;
  magicDefensePercent?: number;
  
  // 能力値
  str?: number;
  vit?: number;
  dex?: number;
  agi?: number;
  int?: number;
  wis?: number;
  allStats?: number;

  // 戦闘パラメータ
  critRate?: number;
  critDamage?: number;
  hitRate?: number;
  evasion?: number;
  blockRate?: number;
  
  // 属性攻撃
  fireDamage?: number;
  iceDamage?: number;
  lightningDamage?: number;
  lightDamage?: number;
  darkDamage?: number;

  // 状態異常付与
  poisonChance?: number;
  bleedChance?: number;
  stunChance?: number;

  // 耐性
  poisonResist?: number;
  burnResist?: number;
  stunResist?: number;
  fireResist?: number;
  iceResist?: number;
  lightningResist?: number;
  
  // 特殊
  damageReflection?: number;
  expRate?: number;
  goldRate?: number;
  dropRate?: number;
  moveSpeed?: number;
  mpCostReduction?: number;
  cooldownReduction?: number;
}

export type EnchantTableType = 'offense' | 'defense' | 'utility';

export interface EnchantDef {
  id: string;
  name: string;
  table: EnchantTableType;
  description: string;
  statsKey: keyof ItemStats;
  minVal: number;
  maxVal: number;
  isPercentage?: boolean;
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

  // 拡張: 装備システム用
  uniqueId?: string;
  tier?: number;
  enchants?: EnchantInstance[];
  
  // 新規追加
  isUnique?: boolean; // ユニーク装備フラグ
  setId?: string;     // セット装備ID
}
