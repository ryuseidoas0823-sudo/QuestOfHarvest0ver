import { Item } from '../types';

export const items: Record<string, Item> = {
  'potion': {
    id: 'potion',
    name: 'ポーション',
    description: 'HPを50回復する',
    type: 'consumable',
    effect: { type: 'heal_hp', value: 50 },
    price: 50,
    rarity: 'common'
  },
  'high_potion': {
    id: 'high_potion',
    name: 'ハイポーション',
    description: 'HPを150回復する',
    type: 'consumable',
    effect: { type: 'heal_hp', value: 150 },
    price: 150,
    rarity: 'uncommon'
  },
  'ether': {
    id: 'ether',
    name: 'エーテル',
    description: 'SPを20回復する',
    type: 'consumable',
    effect: { type: 'heal_sp', value: 20 },
    price: 100,
    rarity: 'common'
  },
  'elixir': {
    id: 'elixir',
    name: 'エリクサー',
    description: 'HPとSPを全回復する',
    type: 'consumable',
    effect: { type: 'heal_full', value: 0 },
    price: 1000,
    rarity: 'rare'
  }
};
