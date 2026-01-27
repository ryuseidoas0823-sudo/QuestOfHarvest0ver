import { Item, ItemType, ItemRarity } from '../types/item';

// ショップに常設されるアイテムリスト
export const SHOP_ITEMS: Item[] = [
  // --- 消費アイテム ---
  {
    id: 'potion_small',
    name: '回復薬 (小)',
    type: 'consumable',
    rarity: 'common',
    description: 'HPを50回復する。',
    value: 50,
    stats: { hp: 0, mp: 0, attack: 0, defense: 0, magicAttack: 0, magicDefense: 0, speed: 0 },
    effect: { type: 'heal_hp', value: 50 }
  },
  {
    id: 'potion_medium',
    name: '回復薬 (中)',
    type: 'consumable',
    rarity: 'uncommon',
    description: 'HPを150回復する。',
    value: 150,
    stats: { hp: 0, mp: 0, attack: 0, defense: 0, magicAttack: 0, magicDefense: 0, speed: 0 },
    effect: { type: 'heal_hp', value: 150 }
  },
  {
    id: 'mana_potion_small',
    name: 'マナポーション (小)',
    type: 'consumable',
    rarity: 'common',
    description: 'MPを30回復する。',
    value: 80,
    stats: { hp: 0, mp: 0, attack: 0, defense: 0, magicAttack: 0, magicDefense: 0, speed: 0 },
    effect: { type: 'heal_mp', value: 30 }
  },
  
  // --- 武器 (Tier 1) ---
  {
    id: 'iron_sword',
    name: '鉄の剣',
    type: 'weapon',
    rarity: 'common',
    description: '一般的な兵士が使う剣。',
    value: 200,
    stats: { hp: 0, mp: 0, attack: 10, defense: 0, magicAttack: 0, magicDefense: 0, speed: 0 },
  },
  {
    id: 'iron_axe',
    name: '鉄の斧',
    type: 'weapon',
    rarity: 'common',
    description: '重いが威力のある斧。',
    value: 250,
    stats: { hp: 0, mp: 0, attack: 14, defense: 0, magicAttack: 0, magicDefense: 0, speed: -2 },
  },
  {
    id: 'apprentice_staff',
    name: '見習いの杖',
    type: 'weapon',
    rarity: 'common',
    description: '魔法の力が込められた杖。',
    value: 200,
    stats: { hp: 0, mp: 10, attack: 4, defense: 0, magicAttack: 12, magicDefense: 0, speed: 0 },
  },

  // --- 防具 (Tier 1) ---
  {
    id: 'leather_armor',
    name: '革の鎧',
    type: 'armor',
    rarity: 'common',
    description: '動きやすい軽装鎧。',
    value: 150,
    stats: { hp: 10, mp: 0, attack: 0, defense: 5, magicAttack: 0, magicDefense: 2, speed: 0 },
  },
  {
    id: 'chainmail',
    name: '鎖帷子',
    type: 'armor',
    rarity: 'common',
    description: 'バランスの良い金属鎧。',
    value: 300,
    stats: { hp: 20, mp: 0, attack: 0, defense: 10, magicAttack: 0, magicDefense: 0, speed: -1 },
  },
  {
    id: 'wooden_shield',
    name: '木の盾',
    type: 'accessory', // 盾はOff-handだが簡易的にAccessory扱いまたはItemType拡張が必要。ここではAccessoryとして定義
    rarity: 'common',
    description: '最低限の防御を提供する盾。',
    value: 100,
    stats: { hp: 5, mp: 0, attack: 0, defense: 4, magicAttack: 0, magicDefense: 0, speed: 0 },
  },
];
