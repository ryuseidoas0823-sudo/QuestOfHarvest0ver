import { Item } from '../types/item';

// --- 武器 (Weapons) ---

export const WEAPONS: Item[] = [
  // ...既存の武器データ (Common/Uncommonなど) は省略せず維持すべきですが、
  // 長くなるためここでは新規追加分を中心に記述します。
  // 実際のファイルでは既存リストの下に追加してください。
  
  {
    id: 'rusty_knife',
    name: '錆びたナイフ',
    type: 'weapon',
    subType: 'dagger',
    rarity: 'common',
    description: '初期装備のナイフ。切れ味は悪い。',
    value: 10,
    stats: { attack: 4, speed: 2, critRate: 5 },
  },
  // ... (中略: 既存の武器データ) ...

  // --- セット装備: 紅蓮の騎士 ---
  {
    id: 'crimson_blade',
    name: '紅蓮の騎士剣',
    type: 'weapon',
    subType: 'sword',
    rarity: 'epic',
    setId: 'set_crimson_knight',
    description: '赤熱する刃を持つ騎士剣。',
    value: 3500,
    requirements: { stats: { str: 25 } },
    stats: { attack: 35, fireDamage: 10 },
  },

  // --- セット装備: 森の守護者 ---
  {
    id: 'forest_bow',
    name: '守護者の長弓',
    type: 'weapon',
    subType: 'longbow',
    rarity: 'rare',
    setId: 'set_forest_guardian',
    description: '森の精霊の加護を受けた弓。',
    value: 2800,
    requirements: { stats: { dex: 20 } },
    stats: { attack: 28, hitRate: 15 },
  },

  // --- ユニーク武器 (Unique Items) ---
  {
    id: 'unique_berserker_axe',
    name: '狂戦士の斧',
    type: 'weapon',
    subType: '2h_axe',
    rarity: 'legendary',
    isUnique: true,
    description: '血を求める呪われた大斧。HPを犠牲に破壊力を得る。',
    value: 8000,
    requirements: { stats: { str: 45 } },
    stats: { 
      attack: 80, 
      attackPercent: 50, // 固定効果: 攻撃力+50%
      speed: 10,         // 狂戦士化で速度アップ
      maxHp: -100,       // リスク: 最大HP減少
      hpMaxPercent: -20  // リスク: 最大HP-20%
    },
  },
  {
    id: 'unique_infinite_grimoire',
    name: '無限の魔導書',
    type: 'weapon',
    subType: 'book',
    rarity: 'legendary',
    isUnique: true,
    description: '無限の魔力が湧き出る禁忌の書。',
    value: 12000,
    requirements: { stats: { int: 50 } },
    stats: { 
      magicAttack: 60,
      int: 30,
      mpCostReduction: 100, // MP消費ゼロ
      defensePercent: -50,  // リスク: 防御激減
      magicDefensePercent: -50
    },
  },
];

// --- 防具 (Armor) ---

export const ARMORS: Item[] = [
  // ... (中略: 既存の防具データ) ...
  {
    id: 'leather_armor',
    name: '革の鎧',
    type: 'armor',
    subType: 'light',
    rarity: 'common',
    description: '動きやすい軽装鎧。',
    value: 150,
    stats: { defense: 5, magicDefense: 2, evasion: 2 },
  },

  // --- セット装備: 紅蓮の騎士 ---
  {
    id: 'crimson_armor',
    name: '紅蓮の板金鎧',
    type: 'armor',
    subType: 'heavy',
    rarity: 'epic',
    setId: 'set_crimson_knight',
    description: '炎の紋章が刻まれた重厚な鎧。',
    value: 4000,
    requirements: { stats: { str: 30, vit: 20 } },
    stats: { defense: 40, fireResist: 20, hp: 50 },
  },

  // --- セット装備: 森の守護者 ---
  {
    id: 'forest_tunic',
    name: '守護者のチュニック',
    type: 'armor',
    subType: 'light',
    rarity: 'rare',
    setId: 'set_forest_guardian',
    description: '森に溶け込む迷彩の服。',
    value: 2500,
    requirements: { stats: { dex: 15, agi: 15 } },
    stats: { defense: 15, evasion: 10, poisonResist: 30 },
  },

  // --- ユニーク防具 ---
  {
    id: 'unique_fools_gold',
    name: '愚者の黄金鎧',
    type: 'armor',
    subType: 'heavy',
    rarity: 'legendary',
    isUnique: true,
    description: '金貨の力で身を守る輝く鎧。',
    value: 7777,
    requirements: { level: 30 },
    stats: {
      defense: 100,      // 圧倒的防御力
      magicDefense: 100,
      goldRate: 50,      // 金策用
      moveSpeed: -20     // 重い
    },
    // ※特殊効果「ダメージをゴールドで受ける」は被ダメージ計算ロジック側で実装が必要
  }
];

// --- アクセサリー (Accessories) ---

export const ACCESSORIES: Item[] = [
  // ... (中略: 既存のアクセサリ) ...
  {
    id: 'wooden_shield',
    name: '木の盾',
    type: 'accessory',
    subType: 'shield',
    rarity: 'common',
    description: '最低限の防御を提供する盾。',
    value: 100,
    stats: { defense: 4, evasion: 5 },
  },

  // --- セット装備: 紅蓮の騎士 (盾) ---
  {
    id: 'crimson_shield',
    name: '紅蓮の盾',
    type: 'accessory',
    subType: 'shield',
    rarity: 'epic',
    setId: 'set_crimson_knight',
    description: '炎を弾く赤き盾。',
    value: 3000,
    requirements: { stats: { str: 20 } },
    stats: { defense: 25, blockRate: 15, fireResist: 20 },
  },
  
  // --- セット装備: 大賢者 (指輪) ---
  {
    id: 'archmage_ring',
    name: '大賢者の指輪',
    type: 'accessory',
    subType: 'ring',
    rarity: 'epic',
    setId: 'set_archmage',
    description: '魔力を増幅する指輪。',
    value: 3500,
    requirements: { stats: { int: 30 } },
    stats: { magicAttack: 15, int: 10 },
  }
];

// --- 消費アイテム・素材・重要アイテム ---
// (これらのリストは既存の items.ts と同様の内容を保持する必要がありますが、
//  ここでは変更がないため、既存の定義をそのまま使用する想定です。
//  コンパイルエラーを防ぐため、最低限のリスト定義を含めます)

export const CONSUMABLES: Item[] = [
  { id: 'potion_small', name: '回復薬 (小)', type: 'consumable', rarity: 'common', description: 'HPを50回復。', value: 50, effect: { type: 'heal_hp', value: 50 } }
  // ... 他
];
export const MATERIALS: Item[] = [
  { id: 'magic_stone_s', name: '魔石 (小)', type: 'material', rarity: 'common', description: '換金アイテム。', value: 20 }
  // ... 他
];
export const KEY_ITEMS: Item[] = [
  { id: 'guild_card', name: 'ギルドカード', type: 'key', rarity: 'common', description: '身分証。', value: 0 }
  // ... 他
];

// 全アイテムリスト統合
export const ALL_ITEMS: Item[] = [
  ...WEAPONS,
  ...ARMORS,
  ...ACCESSORIES,
  ...CONSUMABLES,
  ...MATERIALS,
  ...KEY_ITEMS
];

export const getItemById = (id: string): Item | undefined => {
  return ALL_ITEMS.find(item => item.id === id);
};
