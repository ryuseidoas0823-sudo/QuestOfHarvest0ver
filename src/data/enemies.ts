import { Enemy } from '../types/enemy';

export const enemies: Enemy[] = [
  // ==========================================
  // Monsters (Ch1 & Ch2: 浅層〜中層)
  // ==========================================
  {
    id: 'goblin',
    name: 'ゴブリン',
    type: 'melee',
    maxHp: 30, // 20 -> 30
    attack: 8, // 5 -> 8
    defense: 0,
    exp: 15,
    dropItems: [{ itemId: 'magic_stone_small', rate: 0.4 }],
    faction: 'monster',
    aiType: 'aggressive'
  },
  {
    id: 'slime',
    name: 'スライム',
    type: 'melee',
    maxHp: 20,
    attack: 5,
    defense: 2, // 硬いがHP低い
    exp: 10,
    dropItems: [{ itemId: 'herb', rate: 0.5 }, { itemId: 'potion', rate: 0.1 }],
    faction: 'monster',
    aiType: 'aggressive'
  },
  {
    id: 'rat',
    name: '大ネズミ',
    type: 'melee',
    maxHp: 15,
    attack: 6,
    defense: 0,
    exp: 8,
    dropItems: [{ itemId: 'magic_stone_small', rate: 0.3 }],
    faction: 'monster',
    aiType: 'aggressive'
  },
  {
    id: 'orc',
    name: 'オーク',
    type: 'melee',
    maxHp: 60, // 45 -> 60
    attack: 15, // 10 -> 15
    defense: 5,
    exp: 40,
    dropItems: [{ itemId: 'magic_stone_small', rate: 0.5 }, { itemId: 'potion', rate: 0.2 }],
    faction: 'monster',
    aiType: 'aggressive'
  },
  
  // ==========================================
  // Monsters (Ch3 & Ch4: 深層〜決戦)
  // ここから難易度を上げる（装備更新必須）
  // ==========================================
  {
    id: 'skeleton_soldier',
    name: 'スケルトン兵',
    type: 'melee',
    maxHp: 100, // 60 -> 100
    attack: 25, // 15 -> 25
    defense: 10,
    exp: 80,
    dropItems: [{ itemId: 'magic_stone_medium', rate: 0.3 }],
    faction: 'monster',
    aiType: 'aggressive'
  },
  {
    id: 'dark_mage',
    name: '闇の魔導士',
    type: 'magic',
    maxHp: 70, // 40 -> 70
    attack: 40, // 痛い攻撃
    defense: 3,
    exp: 100,
    dropItems: [{ itemId: 'magic_stone_medium', rate: 0.4 }, { itemId: 'potion_high', rate: 0.1 }],
    faction: 'monster',
    aiType: 'aggressive'
  },
  {
    id: 'minotaur',
    name: 'ミノタウロス',
    type: 'melee',
    maxHp: 250, // 120 -> 250 (中ボス級)
    attack: 50, // 30 -> 50
    defense: 15,
    exp: 300,
    dropItems: [{ itemId: 'magic_stone_medium', rate: 0.8 }, { itemId: 'steel_sword', rate: 0.05 }],
    faction: 'monster',
    aiType: 'aggressive'
  },

  // ==========================================
  // Monsters (Ch5: 最深層)
  // ==========================================
  {
    id: 'tower_sentinel',
    name: '塔の歩哨',
    type: 'melee',
    maxHp: 400,
    attack: 70,
    defense: 30,
    exp: 500,
    dropItems: [{ itemId: 'magic_stone_large', rate: 0.4 }],
    faction: 'monster',
    aiType: 'aggressive'
  },
  {
    id: 'ancient_dragon_whelp',
    name: '古竜の幼体',
    type: 'magic',
    maxHp: 350,
    attack: 90, // ブレス攻撃想定
    defense: 20,
    exp: 600,
    dropItems: [{ itemId: 'magic_stone_large', rate: 0.5 }, { itemId: 'elixir', rate: 0.1 }],
    faction: 'monster',
    aiType: 'aggressive'
  },

  // ==========================================
  // Bosses (大幅強化)
  // ==========================================
  {
    id: 'orc_general',
    name: 'オーク・ジェネラル',
    type: 'boss',
    maxHp: 250, // 150 -> 250
    attack: 25, // 18 -> 25
    defense: 8,
    exp: 300,
    dropItems: [{ itemId: 'potion_high', rate: 1.0 }, { itemId: 'iron_sword', rate: 0.5 }],
    faction: 'monster',
    aiType: 'aggressive'
  },
  {
    id: 'cerberus',
    name: 'ケルベロス',
    type: 'boss',
    maxHp: 500, // 300 -> 500
    attack: 35,
    defense: 12,
    exp: 800,
    dropItems: [{ itemId: 'elixir', rate: 1.0 }, { itemId: 'leather_armor', rate: 0.5 }],
    faction: 'monster',
    aiType: 'aggressive'
  },
  {
    id: 'chimera_golem',
    name: 'キメラ・ゴーレム',
    type: 'boss',
    maxHp: 1000, // 500 -> 1000
    attack: 50,
    defense: 30, // 硬い
    exp: 2000,
    dropItems: [{ itemId: 'black_magic_stone', rate: 1.0 }],
    faction: 'monster',
    aiType: 'aggressive'
  },
  {
    id: 'abyss_commander',
    name: '深淵の指揮官',
    type: 'boss',
    maxHp: 1500, // 800 -> 1500
    attack: 70,
    defense: 35,
    exp: 5000,
    dropItems: [{ itemId: 'plate_mail', rate: 0.5 }],
    faction: 'monster',
    aiType: 'aggressive'
  },
  {
    id: 'fallen_hero',
    name: '堕ちた英雄',
    type: 'boss',
    maxHp: 3000, // 1500 -> 3000 (ラスボス)
    attack: 100, // 英雄の剣装備前提の火力
    defense: 50,
    exp: 20000,
    dropItems: [{ itemId: 'hero_badge', rate: 1.0 }],
    faction: 'monster',
    aiType: 'aggressive'
  },

  // ==========================================
  // NPCs / Allies (味方も強くしておかないと即死する)
  // ==========================================
  {
    id: 'injured_adventurer',
    name: '負傷した冒険者',
    type: 'melee',
    maxHp: 100, // 少しタフに
    attack: 0,
    defense: 5,
    exp: 0,
    dropItems: [],
    faction: 'player_ally',
    aiType: 'stationary',
    assetId: 'npc_injured'
  },
  {
    id: 'elias_ally',
    name: 'エリアス',
    type: 'melee',
    maxHp: 300, // 共闘用ステータス
    attack: 30,
    defense: 15,
    exp: 0,
    dropItems: [],
    faction: 'player_ally',
    aiType: 'aggressive',
    assetId: 'npc_ally_warrior'
  }
];
