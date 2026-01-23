import { JobDefinition } from '../types/job';

export const JOBS: Record<string, JobDefinition> = {
  swordsman: {
    id: 'swordsman',
    name: '剣士',
    description: '攻守のバランスに優れた前衛職。初心者におすすめ。',
    baseStats: { maxHp: 100, attack: 10, defense: 5 },
    growthRates: { maxHp: 10, attack: 2, defense: 1 },
    learnableSkills: ['heavy_slash', 'guard_stance'],
    assetKey: 'hero_swordsman',
    allowedWeapons: ['sword']
  },
  warrior: {
    id: 'warrior',
    name: '重戦士',
    description: '高い防御力とHPを誇るタンク役。動きは遅いが頑丈。',
    baseStats: { maxHp: 150, attack: 12, defense: 8 },
    growthRates: { maxHp: 15, attack: 2, defense: 2 },
    learnableSkills: ['shield_bash', 'warcry'],
    assetKey: 'hero_warrior',
    allowedWeapons: ['axe', 'mace']
  },
  mage: {
    id: 'mage',
    name: '魔導士',
    description: '強力な範囲魔法を操るが、打たれ弱い。',
    baseStats: { maxHp: 60, attack: 15, defense: 2 },
    growthRates: { maxHp: 5, attack: 4, defense: 0.5 },
    learnableSkills: ['fireball', 'ice_wall'],
    assetKey: 'hero_mage',
    allowedWeapons: ['staff']
  },
  archer: {
    id: 'archer',
    name: '狩人',
    description: '遠距離からの攻撃が得意。接近戦は苦手。',
    baseStats: { maxHp: 80, attack: 12, defense: 3 },
    growthRates: { maxHp: 8, attack: 3, defense: 1 },
    learnableSkills: ['double_shot', 'snare_trap'],
    assetKey: 'hero_archer',
    allowedWeapons: ['bow']
  },
  // 以下、拡張用
  /*
  rogue: { ... },
  cleric: { ... }
  */
};
