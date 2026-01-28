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

// アイテムのステータス補正
export interface ItemStats {
  hp?: number;
  mp?: number;
  attack?: number;
  defense?: number;
  magicAttack?: number;
  magicDefense?: number;
  speed?: number; // 行動順補正
  
  // 追加ステータス
  str?: number;
  vit?: number;
  dex?: number;
  agi?: number;
  int?: number;
  wis?: number;
  critRate?: number; // %
  hitRate?: number; // %
  evasion?: number; // %
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
  
  stackable?: boolean; // スタック可能か（素材・消費アイテム用）
  maxStack?: number;
  quantity?: number; // 現在の所持数（インベントリ用）
  
  icon?: string; // 画像パスまたはアイコンID（将来用）
}
