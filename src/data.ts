import { Job, Attributes, PerkData, WorldLocation, EnemyEntity, ShapeType } from './types';
import { Coins, Zap, Droplets, Wind, User, Sword, Heart, Shield, Star, Clock, Activity, Hammer, Book } from 'lucide-react';

export const JOB_DATA: Record<Job, { attributes: Attributes, desc: string, icon: string, color: string }> = {
  Swordsman: { attributes: { vitality: 12, strength: 12, dexterity: 12, intelligence: 8, endurance: 11 }, icon: '⚔️', desc: '攻守のバランスに優れた剣士。初心者におすすめ。', color: '#3b82f6' },
  Warrior:   { attributes: { vitality: 14, strength: 16, dexterity: 9, intelligence: 6, endurance: 15 }, icon: '🪓', desc: '強靭な肉体と破壊力を持つ戦士。最前線で戦う。', color: '#ef4444' },
  Archer:    { attributes: { vitality: 10, strength: 10, dexterity: 16, intelligence: 10, endurance: 10 }, icon: '🏹', desc: '素早い動きで遠距離から攻撃する狩人。', color: '#10b981' },
  Mage:      { attributes: { vitality: 9, strength: 6, dexterity: 12, intelligence: 18, endurance: 8 }, icon: '🪄', desc: '強力な魔法を操る賢者。打たれ弱いが火力は高い。', color: '#a855f7' },
};

export const PERK_DEFINITIONS: Record<string, PerkData> = {
  'thunder_strike': { id: 'thunder_strike', name: 'Thunder Strike', desc: '攻撃時20%の確率で雷撃が発生し、追加ダメージを与える。レベルに応じてダメージ増加。', rarity: 'Rare', icon: Zap, color: '#fbbf24' },
  'vampire': { id: 'vampire', name: 'Vampire', desc: '敵を倒すとHPが回復する。レベルに応じて回復量増加。', rarity: 'Rare', icon: Droplets, color: '#f43f5e' },
  'swift_step': { id: 'swift_step', name: 'Swift Step', desc: '移動速度が上昇する。レベルに応じて効果増大。', rarity: 'Common', icon: Wind, color: '#38bdf8' },
  'stone_skin': { id: 'stone_skin', name: 'Stone Skin', desc: '防御力が増加する。レベルに応じて効果増大。', rarity: 'Common', icon: User, color: '#a8a29e' },
  'berserker': { id: 'berserker', name: 'Berserker', desc: '攻撃力が増加する。レベルに応じて効果増大。', rarity: 'Common', icon: Sword, color: '#ef4444' },
  'vitality_boost': { id: 'vitality_boost', name: 'Vitality Boost', desc: '最大HPが増加する。レベルに応じて効果増大。', rarity: 'Common', icon: Heart, color: '#22c55e' },
  'glass_cannon': { id: 'glass_cannon', name: 'Glass Cannon', desc: '攻撃力が大幅に増加するが、防御力が減少する。レベルに応じて攻撃力さらに増加。', rarity: 'Rare', icon: Sword, color: '#dc2626' },
  'heavy_armor': { id: 'heavy_armor', name: 'Heavy Armor', desc: '防御力が大幅に増加するが、移動速度が低下する。', rarity: 'Rare', icon: Shield, color: '#64748b' },
  'gold_rush': { id: 'gold_rush', name: 'Gold Rush', desc: '敵から得られるゴールドが増加する。', rarity: 'Uncommon', icon: Coins, color: '#fbbf24' },
  'wisdom': { id: 'wisdom', name: 'Wisdom', desc: '獲得経験値が増加する。', rarity: 'Uncommon', icon: Star, color: '#818cf8' },
  'haste': { id: 'haste', name: 'Haste', desc: '攻撃速度が上昇する。', rarity: 'Legendary', icon: Clock, color: '#fcd34d' },
  'endurance': { id: 'endurance', name: 'Endurance', desc: '最大スタミナが増加する。', rarity: 'Common', icon: Activity, color: '#4ade80' },
  'scavenger': { id: 'scavenger', name: 'Scavenger', desc: '素材採取時に得られるアイテム数が増加する。', rarity: 'Rare', icon: Hammer, color: '#a3e635' },
  'mana_well': { id: 'mana_well', name: 'Mana Well', desc: '最大MPと知力が増加する。', rarity: 'Uncommon', icon: Book, color: '#3b82f6' },
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
  { name: 'Dragon',    hp: 500, atk: 30, spd: 3.0, color: '#004d40', icon: '🐲', xp: 500, shape: 'dragon', w: 64, h: 64, vw: 80, vh: 80 },
];

export const WORLD_LOCATIONS: WorldLocation[] = [
  { id: 'town_start', name: '始まりの街', type: 'Town', x: 15, y: 10, icon: '🏠', color: '#4ade80', biome: 'Town', difficulty: 0 },
  { id: 'dungeon_forest', name: '迷いの森', type: 'Dungeon', x: 18, y: 8, icon: '🌲', color: '#166534', biome: 'Forest', difficulty: 1 },
  { id: 'dungeon_cave', name: '暗い洞窟', type: 'Dungeon', x: 10, y: 14, icon: '⛰️', color: '#57534e', biome: 'Wasteland', difficulty: 3 },
  { id: 'dungeon_snow', name: '氷結の塔', type: 'Dungeon', x: 22, y: 5, icon: '❄️', color: '#0ea5e9', biome: 'Snow', difficulty: 5 },
  { id: 'dungeon_desert', name: '灼熱の砂漠', type: 'Dungeon', x: 5, y: 12, icon: '🌵', color: '#fbbf24', biome: 'Desert', difficulty: 7 },
];

export const RARITY_MULTIPLIERS = { Common: 1.0, Uncommon: 1.2, Rare: 1.5, Epic: 2.0, Legendary: 3.0 };
export const ENCHANT_SLOTS = { Common: 0, Uncommon: 1, Rare: 2, Epic: 3, Legendary: 5 };
export const ITEM_BASE_NAMES = { Weapon: { OneHanded: '剣', TwoHanded: '大剣', DualWield: '双剣' }, Helm: '兜', Armor: '板金鎧', Shield: '盾', Boots: '具足', Consumable: '道具', Material: '素材' };
export const ICONS = { 
    Weapon: { OneHanded: '⚔️', TwoHanded: '🗡️', DualWield: '⚔️', Bow: '🏹', Staff: '🪄', Wand: '🥢' }, 
    Helm: '🪖', Armor: 'svg:Item_Armor', Shield: '🛡️', Boots: '👢', Consumable: '🎒', Material: '📦' 
};
