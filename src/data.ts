import { Biome, Job, Attributes, EquipmentType, WeaponStyle, Rarity } from './types';
import { THEME } from './config';

export const BIOME_NAMES: Record<Biome, string> = { 
  WorldMap: 'ワールドマップ',
  Town: '街',
  Dungeon: 'ダンジョン',
  Plains: '平原', Forest: '森', Desert: '砂漠', Snow: '雪原', Wasteland: '荒野'
};

export const JOB_DATA: Record<Job, { attributes: Attributes, desc: string, icon: string, color: string }> = {
  Swordsman: { attributes: { vitality: 12, strength: 12, dexterity: 12, intelligence: 8, endurance: 11 }, icon: '⚔️', desc: '攻守のバランスに優れた剣士。初心者におすすめ。', color: '#3b82f6' },
  Warrior:   { attributes: { vitality: 14, strength: 16, dexterity: 9, intelligence: 6, endurance: 15 }, icon: '🪓', desc: '強靭な肉体と破壊力を持つ戦士。最前線で戦う。', color: '#ef4444' },
  Archer:    { attributes: { vitality: 10, strength: 10, dexterity: 16, intelligence: 10, endurance: 10 }, icon: '🏹', desc: '素早い動きで遠距離から攻撃する狩人。', color: '#10b981' },
  Mage:      { attributes: { vitality: 9, strength: 6, dexterity: 12, intelligence: 18, endurance: 8 }, icon: '🪄', desc: '強力な魔法を操る賢者。打たれ弱いが火力は高い。', color: '#a855f7' },
};

export const ENEMY_TYPES = [
  { name: 'Zombie',   hp: 50, atk: 8,  spd: 1.5, color: '#5d4037', icon: '🧟', xp: 15, shape: 'humanoid', w: 24, h: 24, vw: 32, vh: 48 },
  { name: 'Ghoul',    hp: 40, atk: 10, spd: 3.5, color: '#4e342e', icon: '🧟‍♂️', xp: 25, shape: 'humanoid', w: 24, h: 24, vw: 32, vh: 48 },
  { name: 'Giant Ant', hp: 20, atk: 6, spd: 3.0, color: '#3e2723', icon: '🐜', xp: 10, shape: 'insect',   w: 24, h: 20, vw: 32, vh: 24 },
  { name: 'Spider',    hp: 25, atk: 8, spd: 2.5, color: '#263238', icon: '🕷️', xp: 18, shape: 'insect',   w: 28, h: 24, vw: 40, vh: 32 },
  { name: 'Imp',       hp: 25, atk: 9, spd: 3.8, color: '#b71c1c', icon: '😈', xp: 20, shape: 'demon',    w: 20, h: 20, vw: 24, vh: 32 },
  { name: 'Bat',       hp: 15, atk: 5, spd: 4.5, color: '#4a148c', icon: '🦇', xp: 8,  shape: 'flying',   w: 16, h: 16, vw: 32, vh: 24 },
  { name: 'Slime',     hp: 30, atk: 4, spd: 2.0, color: '#76ff03', icon: '💧', xp: 10, shape: 'slime',    w: 24, h: 24, vw: 32, vh: 32 },
  { name: 'Red Jelly', hp: 25, atk: 12,spd: 2.5, color: '#ff1744', icon: '🔥', xp: 18, shape: 'slime',    w: 24, h: 24, vw: 32, vh: 32 },
  { name: 'Bandit',    hp: 40, atk: 8, spd: 3.2, color: '#ff9800', icon: '🗡️', xp: 22, shape: 'humanoid', w: 24, h: 24, vw: 32, vh: 48 },
  { name: 'Dragonewt', hp: 70, atk: 14,spd: 2.8, color: '#00695c', icon: '🦎', xp: 40, shape: 'dragon',   w: 32, h: 32, vw: 40, vh: 56 },
  { name: 'Boar',      hp: 60, atk: 10,spd: 4.0, color: '#795548', icon: '🐗', xp: 30, shape: 'beast',    w: 40, h: 24, vw: 48, vh: 32 },
  { name: 'Grizzly',   hp: 100,atk: 18,spd: 2.0, color: '#3e2723', icon: '🐻', xp: 50, shape: 'beast',    w: 48, h: 48, vw: 64, vh: 64 },
  { name: 'Wolf',      hp: 35, atk: 9, spd: 4.2, color: '#757575', icon: '🐺', xp: 25, shape: 'beast',    w: 32, h: 24, vw: 48, vh: 32 },
  { name: 'Ghost',     hp: 20, atk: 7, spd: 1.0, color: '#cfd8dc', icon: '👻', xp: 28, shape: 'ghost',    w: 24, h: 24, vw: 32, vh: 40 },
];
