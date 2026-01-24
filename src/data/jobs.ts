import { Job } from '../types/job';

export const jobs: Job[] = [
  {
    id: 'warrior',
    name: '戦士',
    description: '高い攻撃力と耐久力を誇る前衛職。',
    baseStats: {
      hp: 20, maxHp: 20, mp: 0, maxMp: 0,
      attack: 5, defense: 2,
      str: 8, vit: 8, dex: 4, agi: 4, int: 2, luc: 3,
      level: 1, exp: 0
    },
    growthRates: {
      hp: 5, maxHp: 5, mp: 0, maxMp: 0,
      attack: 2, defense: 1,
      str: 1.5, vit: 1.5, dex: 0.8, agi: 0.8, int: 0.5, luc: 0.8,
      level: 0, exp: 0
    },
    skills: ['heavy_slash', 'round_slash']
  },
  {
    id: 'mage',
    name: '魔導士',
    description: '強力な攻撃魔法を操る後衛職。',
    baseStats: {
      hp: 12, maxHp: 12, mp: 20, maxMp: 20,
      attack: 2, defense: 1,
      str: 3, vit: 4, dex: 5, agi: 5, int: 10, luc: 4,
      level: 1, exp: 0
    },
    growthRates: {
      hp: 3, maxHp: 3, mp: 5, maxMp: 5,
      attack: 0.5, defense: 0.5,
      str: 0.5, vit: 0.8, dex: 1.0, agi: 1.0, int: 2.0, luc: 1.0,
      level: 0, exp: 0
    },
    skills: ['fireball', 'heal']
  },
  {
    id: 'archer',
    name: '狩人',
    description: '遠距離からの精密射撃を得意とする。',
    baseStats: {
      hp: 15, maxHp: 15, mp: 5, maxMp: 5,
      attack: 4, defense: 1,
      str: 5, vit: 5, dex: 9, agi: 7, int: 3, luc: 5,
      level: 1, exp: 0
    },
    growthRates: {
      hp: 4, maxHp: 4, mp: 1, maxMp: 1,
      attack: 1.5, defense: 0.8,
      str: 1.0, vit: 1.0, dex: 1.8, agi: 1.4, int: 0.6, luc: 1.2,
      level: 0, exp: 0
    },
    skills: ['snipe', 'round_slash']
  }
];
