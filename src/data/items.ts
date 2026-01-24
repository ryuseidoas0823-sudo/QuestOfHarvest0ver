import { ItemDefinition } from '../types/item';

export const items: ItemDefinition[] = [
  // --- 消費アイテム ---
  {
    id: 'potion',
    name: 'ポーション',
    type: 'consumable',
    description: 'HPを50回復する。序盤の必需品。',
    price: 30, // 値下げ (50 -> 30)
    effect: { type: 'heal_hp', value: 50 },
    rarityChance: 30,
    assetIcon: '🧪'
  },
  {
    id: 'potion_high',
    name: 'ハイポーション',
    type: 'consumable',
    description: 'HPを200回復する。中盤以降の回復手段。',
    price: 120, // (150 -> 120)
    effect: { type: 'heal_hp', value: 200 }, // 回復量アップ
    rarityChance: 15,
    assetIcon: '🧪✨'
  },
  {
    id: 'elixir',
    name: 'エリクサー',
    type: 'consumable',
    description: 'HPを完全回復する奇跡の薬。',
    price: 500,
    effect: { type: 'heal_hp', value: 9999 },
    rarityChance: 2,
    assetIcon: '🍷'
  },

  // --- 武器 (攻撃力を見直し) ---
  {
    id: 'iron_sword',
    name: '鉄の剣',
    type: 'weapon',
    description: '冒険者の基本装備。',
    price: 200,
    equipStats: { attack: 10 }, // 5 -> 10
    rarityChance: 20,
    assetIcon: '⚔️'
  },
  {
    id: 'steel_sword',
    name: '鋼の剣',
    type: 'weapon',
    description: '鋭い切れ味。第3章攻略に推奨。',
    price: 1500, // 値上げ
    equipStats: { attack: 25, str: 3 }, // 大幅強化
    rarityChance: 10,
    assetIcon: '⚔️✨'
  },
  {
    id: 'hero_sword',
    name: '英雄の剣',
    type: 'weapon',
    description: '伝説の剣。圧倒的な力を秘めている。',
    price: 8000, // 値上げ
    equipStats: { attack: 60, str: 10, agi: 5 }, // ラスボス向けに超強化
    rarityChance: 1,
    assetIcon: '🗡️'
  },

  // --- 防具 (防御力を見直し) ---
  {
    id: 'leather_armor',
    name: '革の鎧',
    type: 'armor',
    description: '動きやすい軽装。',
    price: 150,
    equipStats: { defense: 5, agi: 2 }, // 3 -> 5
    rarityChance: 20,
    assetIcon: '🛡️'
  },
  {
    id: 'plate_mail',
    name: 'プレートメイル',
    type: 'armor',
    description: '頑丈な鉄の鎧。攻撃を弾く。',
    price: 2000,
    equipStats: { defense: 20, vit: 5, agi: -3 }, // 10 -> 20
    rarityChance: 8,
    assetIcon: '🛡️✨'
  },

  // --- アクセサリー / 素材 ---
  {
    id: 'hero_badge',
    name: '英雄の証',
    type: 'accessory',
    description: '全ステータスが上昇する栄誉の印。',
    price: 20000,
    equipStats: { str: 5, vit: 5, dex: 5, agi: 5, int: 5, luc: 5 },
    rarityChance: 0,
    assetIcon: '🏅'
  },
  
  // 換金アイテム（経済バランス調整用）
  {
    id: 'magic_stone_small',
    name: '魔石（小）',
    type: 'material',
    description: '微弱な魔力を帯びた石。10Gで売れる。',
    price: 10,
    rarityChance: 50,
    assetIcon: '🔹'
  },
  {
    id: 'magic_stone_medium',
    name: '魔石（中）',
    type: 'material',
    description: '良質な魔力を帯びた石。50Gで売れる。',
    price: 50, // 中盤の資金源
    rarityChance: 20,
    assetIcon: '🔷'
  },
  {
    id: 'magic_stone_large',
    name: '魔石（大）',
    type: 'material',
    description: '高純度の魔力結晶。200Gで売れる。',
    price: 200, // 終盤の資金源
    rarityChance: 5,
    assetIcon: '💎'
  },
  {
    id: 'herb',
    name: '薬草',
    type: 'material',
    description: '回復薬の材料。売値は安い。',
    price: 5,
    rarityChance: 40,
    assetIcon: '🌿'
  },
  {
    id: 'black_magic_stone',
    name: '黒い魔石',
    type: 'material',
    description: '不吉な力を感じる魔石。研究価値が高い。',
    price: 1000,
    rarityChance: 2,
    assetIcon: '⚫'
  }
];
