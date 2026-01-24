import { ItemDefinition } from '../types/item';

export const items: ItemDefinition[] = [
  // --- 消費アイテム ---
  {
    id: 'potion',
    name: 'ポーション',
    type: 'consumable',
    description: 'HPを50回復する。',
    price: 50,
    effect: { type: 'heal_hp', value: 50 },
    rarityChance: 20,
    assetIcon: '🧪'
  },
  {
    id: 'potion_high',
    name: 'ハイポーション',
    type: 'consumable',
    description: 'HPを150回復する。',
    price: 150,
    effect: { type: 'heal_hp', value: 150 },
    rarityChance: 10,
    assetIcon: '🧪✨'
  },
  {
    id: 'elixir',
    name: 'エリクサー',
    type: 'consumable',
    description: 'HPを全回復する。',
    price: 500,
    effect: { type: 'heal_hp', value: 9999 },
    rarityChance: 1,
    assetIcon: '🍷'
  },

  // --- 武器 ---
  {
    id: 'iron_sword',
    name: '鉄の剣',
    type: 'weapon',
    description: '一般的な冒険者が使う剣。',
    price: 200,
    equipStats: { attack: 5 },
    rarityChance: 15,
    assetIcon: '⚔️'
  },
  {
    id: 'steel_sword',
    name: '鋼の剣',
    type: 'weapon',
    description: '鋭い切れ味を誇る剣。',
    price: 1000,
    equipStats: { attack: 12, str: 2 },
    rarityChance: 10,
    assetIcon: '⚔️✨'
  },
  {
    id: 'hero_sword',
    name: '英雄の剣',
    type: 'weapon',
    description: 'かつて英雄が愛用した伝説の剣。',
    price: 5000,
    equipStats: { attack: 30, str: 5, agi: 5 },
    rarityChance: 1,
    assetIcon: '🗡️'
  },

  // --- 防具 ---
  {
    id: 'leather_armor',
    name: '革の鎧',
    type: 'armor',
    description: '動きやすい軽装の鎧。',
    price: 150,
    equipStats: { defense: 3, agi: 1 },
    rarityChance: 15,
    assetIcon: '🛡️'
  },
  {
    id: 'plate_mail',
    name: 'プレートメイル',
    type: 'armor',
    description: '頑丈な鉄製の鎧。',
    price: 1200,
    equipStats: { defense: 10, vit: 3, agi: -2 },
    rarityChance: 8,
    assetIcon: '🛡️✨'
  },

  // --- アクセサリー / 素材 ---
  {
    id: 'hero_badge',
    name: '英雄の証',
    type: 'accessory',
    description: '全ステータスが少し上昇する。',
    price: 10000,
    equipStats: { str: 3, vit: 3, dex: 3, agi: 3, int: 3, luc: 3 },
    rarityChance: 0,
    assetIcon: '🏅'
  },
  {
    id: 'magic_stone_small',
    name: '魔石（小）',
    type: 'material',
    description: 'モンスターの体内で生成される魔力の結晶。換金用。',
    price: 10, // 売却額ベース
    rarityChance: 100,
    assetIcon: '💎'
  },
  {
    id: 'herb',
    name: '薬草',
    type: 'material',
    description: 'ポーションの材料。そのままでは使えない。',
    price: 5,
    rarityChance: 50,
    assetIcon: '🌿'
  },
  {
    id: 'black_magic_stone',
    name: '黒い魔石',
    type: 'material',
    description: '不吉な力を感じる魔石。',
    price: 500,
    rarityChance: 5,
    assetIcon: '⚫'
  }
];
