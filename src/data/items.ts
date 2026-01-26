import { ItemDefinition } from '../types/item';

// src/types/item.ts の定義に合わせてデータを修正
export const items: Record<string, ItemDefinition> = { // 配列ではなくRecord形式に変更（検索しやすくするため）
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
  },
  // 装備品なども必要なら追加
  'sword_iron': {
    id: 'sword_iron',
    name: '鉄の剣',
    type: 'weapon',
    price: 200,
    description: '一般的な冒険者が使う鉄製の剣',
    equipStats: { attack: 5 },
    rarity: 'common'
  }
};
