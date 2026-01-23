import { ItemDefinition } from '../types/item';

export const ITEMS: Record<string, ItemDefinition> = {
  // 武器
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
    baseStats: { attack: 3 }, // 魔法攻撃力として扱う等のロジックが必要
    baseRarity: 'uncommon',
    assetIcon: 'icon_staff_wood',
    maxStack: 1,
    price: 60
  },

  // 防具
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

  // 消費アイテム
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
  }
};
