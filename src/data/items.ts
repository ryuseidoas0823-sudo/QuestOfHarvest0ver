export type ItemType = 'consumable' | 'weapon' | 'armor' | 'key';
export type ItemEffectType = 'heal_hp' | 'heal_mp' | 'buff_str' | 'buff_vit' | 'buff_dex' | 'buff_agi' | 'cure_status';
export type ItemRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface ItemEffect {
  type: ItemEffectType;
  value: number;
  duration?: number; // ターン数（即時効果の場合はundefined）
}

export interface Item {
  id: string;
  name: string;
  type: ItemType;
  description: string;
  price: number;
  rarity: ItemRarity;
  icon?: string; // アイコンIDや絵文字など
  effects?: ItemEffect[]; // アイテム使用時の効果
  isConsumable: boolean; // 使用後に消費するか
}

export interface InventoryItem {
  item: Item;
  quantity: number;
}
