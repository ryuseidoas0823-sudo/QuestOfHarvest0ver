import { JobId } from './job';

export type ItemType = 'weapon' | 'armor' | 'accessory' | 'consumable' | 'material' | 'key';

export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'godly';

// 武器・防具のサブタイプ詳細
export type WeaponType = 'dagger' | 'sword' | '2h_sword' | 'axe' | 'mace' | 'hammer' | '2h_axe' | 'bow' | 'longbow' | 'crossbow' | 'staff' | 'book';
export type ArmorType = 'light' | 'heavy' | 'robe' | 'shield';
export type AccessoryType = 'ring' | 'amulet' | 'boots' | 'other';
export type ItemSubType = WeaponType | ArmorType | AccessoryType | 'none';

// アイテムの効果定義
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
  value: number; // 回復量やバフの上昇量
  duration?: number; // バフの持続ターン（0なら即時）
}

// 装備要件
export interface ItemRequirements {
  level?: number;
  job?: JobId[]; // 装備可能なジョブ（未指定なら全職可能）
  stats?: {
    str?: number;
    vit?: number;
    dex?: number;
    agi?: number;
    int?: number;
    wis?: number;
  };
}

// アイテムのステータス補正 (拡張版)
export interface ItemStats {
  // 基礎ステータス
  hp?: number;
  mp?: number;
  attack?: number;
  defense?: number;
  magicAttack?: number;
  magicDefense?: number;
  speed?: number; // 行動速度 (CT)
  
  // 能力値
  str?: number;
  vit?: number;
  dex?: number;
  agi?: number;
  int?: number;
  wis?: number;
  allStats?: number; // 全能力値

  // 戦闘パラメータ
  critRate?: number; // %
  critDamage?: number; // % (新規)
  hitRate?: number; // %
  evasion?: number; // %
  blockRate?: number; // % (新規)
  
  // 属性攻撃 (新規)
  fireDamage?: number;
  iceDamage?: number;
  lightningDamage?: number;
  lightDamage?: number;
  darkDamage?: number;

  // 状態異常付与 (新規)
  poisonChance?: number; // %
  bleedChance?: number; // %
  stunChance?: number; // %

  // 耐性 (新規)
  poisonResist?: number; // %
  burnResist?: number; // %
  stunResist?: number; // %
  fireResist?: number; // %
  iceResist?: number; // %
  lightningResist?: number; // %
  
  // 特殊 (新規)
  damageReflection?: number; // % (反射)
  expRate?: number; // %
  goldRate?: number; // %
  dropRate?: number; // %
  moveSpeed?: number; // ダンジョン移動速度
  mpCostReduction?: number; // %
  cooldownReduction?: number; // %
}

// エンチャントの定義 (新規)
export type EnchantTableType = 'offense' | 'defense' | 'utility';

export interface EnchantDef {
  id: string;
  name: string; // 表示名 ("of Power" など)
  table: EnchantTableType;
  description: string; // 説明文 ("物理攻撃力 +{min}-{max}")
  statsKey: keyof ItemStats; // 適用するステータス
  minVal: number; // Roll 1 の時の値
  maxVal: number; // Roll 100 の時の値
  isPercentage?: boolean; // %加算かどうか
}

// 付与されたエンチャントの実体
export interface EnchantInstance {
  defId: string; // EnchantDefのID
  roll: number; // 1-100
  value: number; // 計算後の値
}

export interface Item {
  id: string;
  name: string;
  type: ItemType;
  subType?: ItemSubType;
  rarity: ItemRarity;
  description: string;
  value: number; // 売買価格
  
  stats?: ItemStats;
  requirements?: ItemRequirements;
  effect?: ItemEffect; // 使用時の効果
  
  stackable?: boolean;
  maxStack?: number;
  quantity?: number;
  
  icon?: string;

  // 拡張: 装備システム用
  uniqueId?: string; // 個体識別ID (入手時に生成)
  tier?: number; // 1, 2, 3
  enchants?: EnchantInstance[]; // 付与されたエンチャント
  isUnique?: boolean; // ユニーク装備フラグ
}
