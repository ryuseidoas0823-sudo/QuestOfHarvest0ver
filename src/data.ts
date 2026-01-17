import { Job, Attributes, EnemyEntity, PerkData } from './types';

export const JOB_DATA: Record<Job, { attributes: Attributes, color: string }> = {
  Warrior: {
    attributes: { strength: 8, dexterity: 4, intelligence: 2, vitality: 8, endurance: 6, luck: 2 },
    color: '#ff4444'
  },
  Mage: {
    attributes: { strength: 2, dexterity: 4, intelligence: 10, vitality: 4, endurance: 4, luck: 6 },
    color: '#4444ff'
  },
  Rogue: {
    attributes: { strength: 4, dexterity: 10, intelligence: 4, vitality: 4, endurance: 4, luck: 4 },
    color: '#44ff44'
  },
  Cleric: {
    attributes: { strength: 4, dexterity: 2, intelligence: 6, vitality: 6, endurance: 8, luck: 4 },
    color: '#ffff44'
  }
};

export const PERK_DEFINITIONS: PerkData[] = [
  { id: 'berserker', name: 'Berserker', description: 'Increases attack damage.', level: 1, maxLevel: 5 },
  { id: 'stone_skin', name: 'Stone Skin', description: 'Increases defense.', level: 1, maxLevel: 5 },
  { id: 'vitality_boost', name: 'Vitality', description: 'Increases Max HP.', level: 1, maxLevel: 10 },
  { id: 'swift_step', name: 'Swift Step', description: 'Increases movement speed.', level: 1, maxLevel: 3 },
];

export const ENEMY_TYPES: Partial<EnemyEntity & { w: number, h: number, atk: number, spd: number, name: string, hp: number, xp: number }>[] = [
  { name: 'Slime', w: 24, h: 24, color: '#00ff00', hp: 20, atk: 5, defense: 0, spd: 2, xp: 10, detectionRange: 150 },
  { name: 'Goblin', w: 24, h: 24, color: '#00aa00', hp: 30, atk: 8, defense: 1, spd: 3, xp: 20, detectionRange: 200 },
  { name: 'Orc', w: 32, h: 32, color: '#007700', hp: 60, atk: 15, defense: 3, spd: 1.5, xp: 50, detectionRange: 200 },
  { name: 'Skeleton', w: 24, h: 24, color: '#cccccc', hp: 40, atk: 12, defense: 2, spd: 2.5, xp: 35, detectionRange: 180 },
];

export const WORLD_LOCATIONS = [
  { id: 'start', name: 'Starting Town' }
];
