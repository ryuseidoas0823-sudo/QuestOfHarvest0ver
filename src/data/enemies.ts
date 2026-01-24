import { Enemy } from '../types/enemy';

export const enemies: Enemy[] = [
  // ==========================================
  // Monsters (Ch1 & Ch2)
  // ==========================================
  {
    id: 'goblin',
    name: 'ゴブリン',
    type: 'melee',
    maxHp: 20,
    attack: 5,
    defense: 0,
    exp: 10,
    dropItems: [{ itemId: 'magic_stone_small', rate: 0.3 }],
    faction: 'monster',
    aiType: 'aggressive'
  },
  {
    id: 'slime',
    name: 'スライム',
    type: 'melee',
    maxHp: 15,
    attack: 3,
    defense: 1,
    exp: 8,
    dropItems: [{ itemId: 'herb', rate: 0.4 }],
    faction: 'monster',
    aiType: 'aggressive'
  },
  {
    id: 'orc',
    name: 'オーク',
    type: 'melee',
    maxHp: 45,
    attack: 10,
    defense: 3,
    exp: 30,
    dropItems: [{ itemId: 'potion', rate: 0.2 }],
    faction: 'monster',
    aiType: 'aggressive'
  },
  {
    id: 'rat',
    name: '大ネズミ',
    type: 'melee',
    maxHp: 12,
    attack: 4,
    defense: 0,
    exp: 5,
    dropItems: [{ itemId: 'magic_stone_small', rate: 0.2 }],
    faction: 'monster',
    aiType: 'aggressive'
  },
  
  // ==========================================
  // Monsters (Ch3 & Ch4 - New!)
  // ==========================================
  {
    id: 'skeleton_soldier',
    name: 'スケルトン兵',
    type: 'melee',
    maxHp: 60,
    attack: 15,
    defense: 5,
    exp: 50,
    dropItems: [{ itemId: 'magic_stone_small', rate: 0.4 }],
    faction: 'monster',
    aiType: 'aggressive'
  },
  {
    id: 'dark_mage',
    name: '闇の魔導士',
    type: 'magic', // 遠距離攻撃（ロジック未実装なら接近戦扱い）
    maxHp: 40,
    attack: 25,
    defense: 2,
    exp: 70,
    dropItems: [{ itemId: 'potion_high', rate: 0.15 }],
    faction: 'monster',
    aiType: 'aggressive'
  },
  {
    id: 'minotaur',
    name: 'ミノタウロス',
    type: 'melee',
    maxHp: 120,
    attack: 30,
    defense: 10,
    exp: 150,
    dropItems: [{ itemId: 'potion_high', rate: 0.3 }],
    faction: 'monster',
    aiType: 'aggressive'
  },

  // ==========================================
  // Bosses
  // ==========================================
  {
    id: 'orc_general',
    name: 'オーク・ジェネラル',
    type: 'boss',
    maxHp: 150,
    attack: 18,
    defense: 8,
    exp: 200,
    dropItems: [{ itemId: 'potion_high', rate: 1.0 }],
    faction: 'monster',
    aiType: 'aggressive'
  },
  {
    id: 'cerberus',
    name: 'ケルベロス',
    type: 'boss',
    maxHp: 300,
    attack: 25,
    defense: 12,
    exp: 500,
    dropItems: [{ itemId: 'elixir', rate: 1.0 }],
    faction: 'monster',
    aiType: 'aggressive'
  },
  {
    id: 'chimera_golem',
    name: 'キメラ・ゴーレム',
    type: 'boss',
    maxHp: 500,
    attack: 35,
    defense: 20,
    exp: 1000,
    dropItems: [{ itemId: 'hero_badge', rate: 1.0 }],
    faction: 'monster',
    aiType: 'aggressive'
  },
  {
    id: 'abyss_commander',
    name: '深淵の指揮官',
    type: 'boss',
    maxHp: 800,
    attack: 45,
    defense: 25,
    exp: 2000,
    dropItems: [{ itemId: 'elixir', rate: 1.0 }],
    faction: 'monster',
    aiType: 'aggressive'
  },

  // ==========================================
  // NPCs / Allies
  // ==========================================
  {
    id: 'injured_adventurer',
    name: '負傷した冒険者',
    type: 'melee',
    maxHp: 50,
    attack: 0,
    defense: 0,
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
    maxHp: 120,
    attack: 15,
    defense: 5,
    exp: 0,
    dropItems: [],
    faction: 'player_ally',
    aiType: 'aggressive',
    assetId: 'npc_ally_warrior'
  }
];
