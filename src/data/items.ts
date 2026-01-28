import { Item } from '../types/item';

// --- 武器 (Weapons) ---

export const WEAPONS: Item[] = [
  // Daggers (Rogue)
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
  {
    id: 'kukri',
    name: 'ククリ刀',
    type: 'weapon',
    subType: 'dagger',
    rarity: 'uncommon',
    description: '独特な曲線の短剣。急所を狙いやすい。',
    value: 450,
    requirements: { stats: { dex: 12 }, job: ['rogue'] },
    stats: { attack: 12, speed: 3, critRate: 15 },
  },
  // Swords (Soldier)
  {
    id: 'iron_sword',
    name: '鉄の剣',
    type: 'weapon',
    subType: 'sword',
    rarity: 'common',
    description: '一般的な冒険者の剣。扱いやすい。',
    value: 200,
    requirements: { stats: { str: 5 } },
    stats: { attack: 10 },
  },
  {
    id: 'damascus_blade',
    name: 'ダマスカスブレード',
    type: 'weapon',
    subType: 'sword',
    rarity: 'rare',
    description: '希少な鋼で作られた鋭い剣。',
    value: 1200,
    requirements: { stats: { str: 20 } },
    stats: { attack: 28, hitRate: 5 },
  },
  // 2H Swords (Soldier)
  {
    id: 'bastard_sword',
    name: 'バスタードソード',
    type: 'weapon',
    subType: '2h_sword',
    rarity: 'uncommon',
    description: '両手持ちの大剣。威力は高いが盾を持てない。',
    value: 500,
    requirements: { stats: { str: 12 }, job: ['soldier'] },
    stats: { attack: 22, speed: -2 },
  },
  {
    id: 'flamberge',
    name: 'フランベルジュ',
    type: 'weapon',
    subType: '2h_sword',
    rarity: 'epic',
    description: '波打つ刃が特徴的な大剣。傷口を広げる。',
    value: 2500,
    requirements: { stats: { str: 35 }, job: ['soldier'] },
    stats: { attack: 45, speed: -3, critRate: 5 },
  },
  // Axes / Hammers (Soldier, Monk)
  {
    id: 'iron_axe',
    name: '鉄の戦斧',
    type: 'weapon',
    subType: 'axe',
    rarity: 'common',
    description: '重心を活かした破壊力のある斧。',
    value: 250,
    requirements: { stats: { str: 8 } },
    stats: { attack: 14, speed: -2 },
  },
  {
    id: 'war_hammer',
    name: 'ウォーハンマー',
    type: 'weapon',
    subType: 'hammer',
    rarity: 'uncommon',
    description: '鎧の上から衝撃を与える戦鎚。',
    value: 600,
    requirements: { stats: { str: 15 } },
    stats: { attack: 18, speed: -4, critRate: 10 },
  },
  // Bows (Ranger)
  {
    id: 'short_bow',
    name: 'ショートボウ',
    type: 'weapon',
    subType: 'bow',
    rarity: 'common',
    description: '扱いやすい小型の弓。',
    value: 180,
    requirements: { stats: { dex: 5 } },
    stats: { attack: 8, speed: 1 },
  },
  {
    id: 'elf_longbow',
    name: 'エルフの長弓',
    type: 'weapon',
    subType: 'longbow',
    rarity: 'rare',
    description: 'エルフ族の技術で作られた、高命中率の弓。',
    value: 1500,
    requirements: { stats: { dex: 25 }, job: ['ranger'] },
    stats: { attack: 24, hitRate: 20 },
  },
  // Staves / Books (Arcanist)
  {
    id: 'apprentice_staff',
    name: '見習いの杖',
    type: 'weapon',
    subType: 'staff',
    rarity: 'common',
    description: '魔力の込められた木の杖。',
    value: 200,
    requirements: { stats: { int: 5 } },
    stats: { attack: 4, magicAttack: 12, mp: 10 },
  },
  {
    id: 'sages_book',
    name: '賢者の書',
    type: 'weapon',
    subType: 'book',
    rarity: 'uncommon',
    description: '古代の知識が記された書物。',
    value: 800,
    requirements: { stats: { int: 15 } },
    stats: { attack: 2, magicAttack: 18, mp: 30, wis: 5 },
  },
];

// --- 防具 (Armor) ---

export const ARMORS: Item[] = [
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
  {
    id: 'chainmail',
    name: '鎖帷子',
    type: 'armor',
    subType: 'heavy',
    rarity: 'common',
    description: 'バランスの良い金属鎧。',
    value: 300,
    requirements: { stats: { str: 8 } },
    stats: { defense: 10, speed: -1, hp: 10 },
  },
  {
    id: 'silk_robe',
    name: 'シルクローブ',
    type: 'armor',
    subType: 'robe',
    rarity: 'common',
    description: '魔力を通しやすい絹のローブ。',
    value: 250,
    requirements: { stats: { int: 5 } },
    stats: { defense: 3, magicDefense: 8, mp: 15 },
  },
  {
    id: 'plate_armor',
    name: 'プレートアーマー',
    type: 'armor',
    subType: 'heavy',
    rarity: 'uncommon',
    description: '全身を覆う板金鎧。防御力は高いが重い。',
    value: 800,
    requirements: { stats: { str: 15, vit: 10 }, job: ['soldier'] },
    stats: { defense: 18, magicDefense: 2, speed: -5, hp: 30 },
  },
];

// --- アクセサリー (Accessories) ---

export const ACCESSORIES: Item[] = [
  {
    id: 'wooden_shield',
    name: '木の盾',
    type: 'accessory', // Off-hand扱い
    subType: 'shield',
    rarity: 'common',
    description: '最低限の防御を提供する盾。',
    value: 100,
    stats: { defense: 4, evasion: 5 },
  },
  {
    id: 'ring_of_strength',
    name: '力の指輪',
    type: 'accessory',
    subType: 'ring',
    rarity: 'uncommon',
    description: '力が湧いてくる指輪。',
    value: 500,
    stats: { str: 3, attack: 2 },
  },
  {
    id: 'amulet_of_protection',
    name: '守りのアミュレット',
    type: 'accessory',
    subType: 'amulet',
    rarity: 'uncommon',
    description: '身を守る加護のある首飾り。',
    value: 500,
    stats: { vit: 3, defense: 2 },
  },
  {
    id: 'boots_of_haste',
    name: '疾風のブーツ',
    type: 'accessory',
    subType: 'boots',
    rarity: 'rare',
    description: '風のように速く動ける靴。',
    value: 1200,
    stats: { agi: 5, speed: 5, evasion: 5 },
  },
];

// --- 消費アイテム (Consumables) ---

export const CONSUMABLES: Item[] = [
  {
    id: 'potion_small',
    name: '回復薬 (小)',
    type: 'consumable',
    rarity: 'common',
    description: 'HPを50回復する。',
    value: 50,
    stackable: true,
    maxStack: 99,
    effect: { type: 'heal_hp', value: 50 }
  },
  {
    id: 'potion_medium',
    name: '回復薬 (中)',
    type: 'consumable',
    rarity: 'uncommon',
    description: 'HPを150回復する。',
    value: 150,
    stackable: true,
    maxStack: 99,
    effect: { type: 'heal_hp', value: 150 }
  },
  {
    id: 'mana_potion_small',
    name: 'マナポーション (小)',
    type: 'consumable',
    rarity: 'common',
    description: 'MPを30回復する。',
    value: 80,
    stackable: true,
    maxStack: 99,
    effect: { type: 'heal_mp', value: 30 }
  },
  {
    id: 'antidote',
    name: '解毒薬',
    type: 'consumable',
    rarity: 'common',
    description: '体内の毒を中和する。',
    value: 30,
    stackable: true,
    maxStack: 99,
    effect: { type: 'cure_poison', value: 1 }
  },
  {
    id: 'return_stone',
    name: '帰還の石',
    type: 'consumable',
    rarity: 'uncommon',
    description: 'ダンジョンから瞬時に街へ帰還する。使い捨て。',
    value: 100,
    stackable: true,
    maxStack: 10,
    effect: { type: 'return_town', value: 1 }
  },
  {
    id: 'minotaur_steak',
    name: 'ミノタウロスのステーキ',
    type: 'consumable',
    rarity: 'rare',
    description: '野性味あふれる肉料理。力がみなぎる。',
    value: 300,
    stackable: true,
    maxStack: 10,
    effect: { type: 'buff_str', value: 5, duration: 50 }
  },
];

// --- 素材・換金 (Materials) ---

export const MATERIALS: Item[] = [
  {
    id: 'magic_stone_s',
    name: '魔石 (小)',
    type: 'material',
    rarity: 'common',
    description: 'モンスターの核。換金アイテム。',
    value: 20,
    stackable: true,
    maxStack: 999,
  },
  {
    id: 'magic_stone_m',
    name: '魔石 (中)',
    type: 'material',
    rarity: 'uncommon',
    description: '少し大きな魔石。良い値段で売れる。',
    value: 100,
    stackable: true,
    maxStack: 999,
  },
  {
    id: 'kobold_claw',
    name: 'コボルトの爪',
    type: 'material',
    rarity: 'common',
    description: '武器の強化に使えそうな鋭い爪。',
    value: 15,
    stackable: true,
    maxStack: 99,
  },
  {
    id: 'mithril_ore',
    name: 'ミスリル銀',
    type: 'material',
    rarity: 'rare',
    description: '軽量で魔力を通しやすい希少な金属。',
    value: 500,
    stackable: true,
    maxStack: 99,
  },
];

// 全アイテムリスト
export const ALL_ITEMS: Item[] = [
  ...WEAPONS,
  ...ARMORS,
  ...ACCESSORIES,
  ...CONSUMABLES,
  ...MATERIALS
];

// ID検索用ヘルパー
export const getItemById = (id: string): Item | undefined => {
  return ALL_ITEMS.find(item => item.id === id);
};
