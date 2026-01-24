import { Enemy } from '../types/enemy';

export const enemies: Enemy[] = [
  // ... existing enemies ...
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
  
  // --- 第1章イベント用NPC ---
  {
    id: 'injured_adventurer',
    name: '負傷した冒険者',
    type: 'melee', // 便宜上melee
    maxHp: 50, // ボスの攻撃を数発耐えられる程度
    attack: 0,
    defense: 0,
    exp: 0,
    dropItems: [],
    faction: 'player_ally', // プレイヤーの味方扱い
    aiType: 'stationary',   // 動かない
    assetId: 'npc_injured'  // 専用アセットがあれば指定
  }
];
