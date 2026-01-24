import { ItemDefinition } from '../types/item';

export const ITEMS: Record<string, ItemDefinition> = {
  // ...既存のアイテム...
  rusty_sword: {
    id: 'rusty_sword',
    name: '錆びた剣',
    description: 'ボロボロの剣。ないよりはマシ。',
    type: 'weapon',
    baseStats: { attack: 2 },
    baseRarity: 'common',
    assetIcon: 'icon_sword_rusty',
    maxStack: 1,
    price: 10
  },
  iron_sword: {
    id: 'iron_sword',
    name: '鉄の剣',
    description: '一般的な冒険者が使う剣。',
    type: 'weapon',
    baseStats: { attack: 5 },
    baseRarity: 'common',
    assetIcon: 'icon_sword_iron',
    maxStack: 1,
    price: 50
  },
  magic_staff: {
    id: 'magic_staff',
    name: '見習いの杖',
    description: '微かな魔力を帯びた杖。',
    type: 'weapon',
    baseStats: { attack: 3 },
    baseRarity: 'uncommon',
    assetIcon: 'icon_staff_wood',
    maxStack: 1,
    price: 60
  },
  leather_armor: {
    id: 'leather_armor',
    name: '革の鎧',
    description: '動きやすい軽装鎧。',
    type: 'armor',
    baseStats: { defense: 2 },
    baseRarity: 'common',
    assetIcon: 'icon_armor_leather',
    maxStack: 1,
    price: 40
  },
  potion_small: {
    id: 'potion_small',
    name: '小回復ポーション',
    description: 'HPを少し回復する。',
    type: 'consumable',
    effects: [
      { type: 'heal_hp', value: 30 }
    ],
    baseRarity: 'common',
    assetIcon: 'icon_potion_red',
    maxStack: 10,
    price: 20
  },
  
  // === 新規追加 ===
  dungeon_key: {
    id: 'dungeon_key',
    name: '宝物庫の鍵',
    description: '金色の装飾が施された鍵。宝物庫の扉を開けることができる。',
    type: 'material', // 消費アイテム扱いでも良いが、自動使用のためmaterial分類で実装
    baseRarity: 'rare',
    assetIcon: 'icon_key',
    maxStack: 5,
    price: 100
  }
};
