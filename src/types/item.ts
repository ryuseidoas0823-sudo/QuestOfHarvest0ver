import { Position } from './input';

export type ItemType = 'weapon' | 'armor' | 'accessory' | 'potion' | 'material';
export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
export type Tier = 1 | 2 | 3;

export interface ItemStats {
  attack?: number;
  defense?: number;
  magicAttack?: number;
  magicDefense?: number;
  speed?: number;
  hp?: number;
  mp?: number;
  str?: number;
  vit?: number;
  dex?: number;
  agi?: number;
  int?: number;
  wis?: number;
  critRate?: number;
  evasion?: number;
  // ...他必要なステータス
}

export interface Enchant {
  id: string;
  name: string;
  description: string;
  stats: ItemStats;
}

export interface Item {
  id: string;
  name: string;
  type: ItemType;
  description: string;
  rarity: Rarity;
  tier: Tier;
  price: number;
  stackable: boolean;
  quantity: number;
  icon?: string;
  
  // 装備品固有
  baseStats?: ItemStats;
  stats?: ItemStats; // エンチャント込みの合計
  enchants?: Enchant[];
  setId?: string;
  
  // 消費アイテム固有
  effectValue?: number; // 回復量など
}

export interface Equipment extends Item {
  type: 'weapon' | 'armor' | 'accessory';
}

// ダンジョンに落ちているアイテム
export interface ItemInstance extends Item {
  position: Position;
}
