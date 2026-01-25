import { JobDefinition, JobId } from '../types';

export const JOBS: Record<JobId, JobDefinition> = {
  swordsman: {
    id: 'swordsman',
    name: '剣士',
    description: '攻守のバランスに優れた前衛職',
    baseStats: { str: 10, vit: 12, dex: 10, agi: 10, int: 8, luc: 10 },
    growthRates: { str: 1.5, vit: 1.2, dex: 1.0, agi: 1.0, int: 0.8, luc: 1.0 },
    skills: ['slash', 'shield_bash'],
    assetKey: 'hero_swordsman',
    allowedWeapons: ['sword', 'shield']
  },
  warrior: {
    id: 'warrior',
    name: '戦士',
    description: '圧倒的な火力を誇る重戦士',
    baseStats: { str: 15, vit: 14, dex: 8, agi: 7, int: 5, luc: 8 },
    growthRates: { str: 2.0, vit: 1.5, dex: 0.8, agi: 0.7, int: 0.5, luc: 0.8 },
    skills: ['power_strike', 'warcry'],
    assetKey: 'hero_warrior',
    allowedWeapons: ['axe', 'greatsword']
  },
  archer: {
    id: 'archer',
    name: '狩人',
    description: '遠距離攻撃と罠解除が得意',
    baseStats: { str: 9, vit: 8, dex: 15, agi: 14, int: 10, luc: 12 },
    growthRates: { str: 1.0, vit: 0.8, dex: 2.0, agi: 1.5, int: 1.0, luc: 1.2 },
    skills: ['double_shot', 'evade'],
    assetKey: 'hero_archer',
    allowedWeapons: ['bow', 'dagger']
  },
  mage: {
    id: 'mage',
    name: '魔術師',
    description: '強力な範囲魔法を操る',
    baseStats: { str: 6, vit: 6, dex: 10, agi: 9, int: 16, luc: 10 },
    growthRates: { str: 0.5, vit: 0.6, dex: 1.0, agi: 0.9, int: 2.0, luc: 1.0 },
    skills: ['fireball', 'heal'],
    assetKey: 'hero_mage',
    allowedWeapons: ['staff', 'wand']
  }
};
