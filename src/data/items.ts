import { ItemDefinition } from '../types/item';

export const items: ItemDefinition[] = [
  // ... existing items ...
  {
    id: 'magic_stone_small',
    name: '魔石（小）',
    type: 'material',
    baseStats: {},
    rarityChance: 100,
    assetIcon: '💎'
  },
  {
    id: 'herb',
    name: '薬草',
    type: 'material',
    baseStats: {},
    rarityChance: 50,
    assetIcon: '🌿'
  },
  {
    id: 'potion',
    name: 'ポーション',
    type: 'material', // 消費アイテムだが便宜上
    baseStats: {},
    rarityChance: 20,
    assetIcon: '🧪'
  },
  {
    id: 'potion_high',
    name: 'ハイポーション',
    type: 'material',
    baseStats: {},
    rarityChance: 10,
    assetIcon: '🧪✨'
  },
  {
    id: 'elixir',
    name: 'エリクサー',
    type: 'material',
    baseStats: {},
    rarityChance: 1,
    assetIcon: '🍷'
  },
  // --- 第3章追加アイテム ---
  {
    id: 'black_magic_stone',
    name: '黒い魔石',
    type: 'material',
    baseStats: {},
    rarityChance: 5,
    assetIcon: '⚫'
  },
  {
    id: 'hero_badge',
    name: '英雄の証',
    type: 'accessory',
    baseStats: { str: 5, vit: 5, luc: 5 },
    rarityChance: 0, // クエスト報酬専用
    assetIcon: '🏅'
  }
];
