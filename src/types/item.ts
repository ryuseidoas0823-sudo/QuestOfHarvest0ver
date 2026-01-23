import { Stats } from '../types';

export type ItemType = 'weapon' | 'armor' | 'accessory' | 'consumable' | 'material';
export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

/**
 * アイテムの特殊効果
 */
export interface ItemEffect {
  type: 'heal_hp' | 'boost_stat' | 'special';
  targetStat?: keyof Stats;
  value: number;
  duration?: number; // バフなどの持続時間（ms）
}

/**
 * アイテムの定義データ（マスターデータ）
 */
export interface ItemDefinition {
  id: string;
  name: string;
  description: string;
  type: ItemType;
  
  // 基本性能（装備品の場合）
  baseStats?: Partial<Stats>;
  
  // 使用時の効果（消費アイテムなどの場合）
  effects?: ItemEffect[];
  
  // レア度抽選の重み（高いほど出やすい、または基本レアリティ）
  baseRarity: Rarity;
  
  // アイコンのアセットキー
  assetIcon: string;
  
  // 最大スタック数
  maxStack: number;

  // 販売価格
  price: number;
}

/**
 * インベントリ内のアイテムインスタンス
 * 同じアイテムIDでも、個体ごとに強化値や耐久度が異なる
 */
export interface ItemInstance {
  instanceId: string; // 一意なID (UUIDなど)
  defId: string;      // ItemDefinition.id への参照
  rarity: Rarity;     // 個別のレア度
  
  // 現在の性能（強化値込み）
  currentStats?: Partial<Stats>;
  
  // 耐久度 (企画書3.3「鍛冶の神」要素用)
  durability: number;
  maxDurability: number;
}
