import { Item } from '../types/item';

export const ITEMS: Record<string, Item> = {
  'potion_low': {
    id: 'potion_low',
    name: 'ポーション',
    type: 'consumable',
    description: 'HPを50回復する基本的な回復薬。',
    price: 50,
    rarity: 'common',
    icon: '🧪',
    isConsumable: true,
    effects: [{ type: 'heal_hp', value: 50 }]
  },
  'potion_high': {
    id: 'potion_high',
    name: 'ハイポーション',
    type: 'consumable',
    description: 'HPを200回復する高品質な回復薬。',
    price: 200,
    rarity: 'rare',
    icon: '⚗️',
    isConsumable: true,
    effects: [{ type: 'heal_hp', value: 200 }]
  },
  'ether_low': {
    id: 'ether_low',
    name: 'エーテル',
    type: 'consumable',
    description: 'MPを30回復する精神感応液。',
    price: 150,
    rarity: 'common',
    icon: '💧',
    isConsumable: true,
    effects: [{ type: 'heal_mp', value: 30 }]
  },
  'power_drug': {
    id: 'power_drug',
    name: '力の水薬',
    type: 'consumable',
    description: '一時的にSTR(力)を上昇させる。',
    price: 500,
    rarity: 'rare',
    icon: '💪',
    isConsumable: true,
    effects: [{ type: 'buff_str', value: 5, duration: 20 }]
  }
};

export const getItem = (id: string): Item | undefined => {
  return ITEMS[id];
};
