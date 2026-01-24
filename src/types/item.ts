import { Stats } from '../types';

export type ItemType = 'weapon' | 'armor' | 'accessory' | 'consumable' | 'material';

export interface ItemDefinition {
  id: string;
  name: string;
  type: ItemType;
  description?: string; // 説明文追加
  price: number;        // 価格追加
  
  // 装備品用ステータス
  equipStats?: {
    attack?: number;
    defense?: number;
    str?: number;
    vit?: number;
    dex?: number;
    agi?: number;
    int?: number;
    luc?: number;
  };

  // 消費アイテム用効果
  effect?: {
    type: 'heal_hp' | 'heal_mp' | 'buff_attack';
    value: number;
  };

  rarityChance: number;
  assetIcon: string;
}
