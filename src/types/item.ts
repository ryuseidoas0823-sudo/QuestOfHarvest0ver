import { Stats } from '../types';

export type ItemType = 'weapon' | 'armor' | 'accessory' | 'consumable' | 'material';

export interface ItemEffect {
  type: 'heal_hp' | 'heal_mp' | 'buff_atk';
  value: number;
  duration?: number;
}

export interface Item {
  id: string;
  name: string;
  type: ItemType;
  price: number;
  description: string;
  effect?: ItemEffect;
  equipStats?: Partial<Stats>;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
}

// エラー修正: ItemDefinition を Item のエイリアスとしてエクスポート
export type ItemDefinition = Item;
