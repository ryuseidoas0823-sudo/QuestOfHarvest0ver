import { EnemyDefinition } from '../types/enemy';

export const ENEMIES: Record<string, EnemyDefinition> = {
  slime: {
    id: 'slime',
    name: 'スライム',
    baseStats: { maxHp: 30, attack: 3, defense: 0 },
    expReward: 5,
    dropTable: [
      { itemId: 'potion_small', chance: 0.1 }
    ],
    behavior: 'passive',
    aggroRange: 3,
    attackRange: 1,
    assetKey: 'monster_slime' // src/assets/monsters.ts等で定義されているキー
  },
  goblin: {
    id: 'goblin',
    name: 'ゴブリン',
    baseStats: { maxHp: 45, attack: 6, defense: 1 },
    expReward: 10,
    dropTable: [
      { itemId: 'rusty_sword', chance: 0.05 },
      { itemId: 'potion_small', chance: 0.15 }
    ],
    behavior: 'aggressive',
    aggroRange: 5,
    attackRange: 1,
    assetKey: 'monster_goblin'
  },
  orc: {
    id: 'orc',
    name: 'オーク',
    baseStats: { maxHp: 80, attack: 10, defense: 3 },
    expReward: 25,
    dropTable: [
      { itemId: 'iron_sword', chance: 0.02 },
      { itemId: 'leather_armor', chance: 0.05 }
    ],
    behavior: 'aggressive',
    aggroRange: 6,
    attackRange: 1,
    assetKey: 'monster_orc'
  }
};
