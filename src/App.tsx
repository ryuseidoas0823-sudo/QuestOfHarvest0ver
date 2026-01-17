import { useEffect, useRef, useState, useMemo } from 'react';
import { Save, Play, ShoppingBag, X, User, Compass, Loader, Settings, ArrowLeft, AlertTriangle, Sword, Zap, Heart, Activity, Monitor, Map as MapIcon, Home, Castle } from 'lucide-react';
import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, User as FirebaseUser, signInWithCustomToken, Auth } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, Firestore } from 'firebase/firestore';
import { ASSETS_SVG, svgToUrl } from './assets.ts';

/**
 * ############################################################################
 * SECTION 1: CONFIGURATION & FIREBASE SETUP
 * ############################################################################
 */
const MANUAL_FIREBASE_CONFIG = {
  apiKey: "AIzaSyD2ENlLHumh4O4uzFe_dKAZSaV54ohS8pI",             
  authDomain: "questofharvest0ver.firebaseapp.com",         
  projectId: "questofharvest0ver",          
  storageBucket: "questofharvest0ver.firebasestorage.app",      
  messagingSenderId: "931709039861",  
  appId: "1:931709039861:web:9ec0565ed233338cc341bc"               
};

// @ts-ignore
const rawConfig = typeof __firebase_config !== 'undefined' ? __firebase_config : '{}';
// @ts-ignore
const rawAppId = typeof __app_id !== 'undefined' ? __app_id : 'quest-of-harvest';
const appId = rawAppId.replace(/[\/.]/g, '_');

let firebaseConfig: any = MANUAL_FIREBASE_CONFIG;
if (!firebaseConfig.apiKey) {
  try {
    const parsedConfig = JSON.parse(rawConfig);
    if (parsedConfig && parsedConfig.apiKey) firebaseConfig = parsedConfig;
  } catch (e) { console.error("Config Parse Error", e); }
}

let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;
let isConfigValid = false;

if (firebaseConfig && firebaseConfig.apiKey) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    isConfigValid = true;
  } catch (e) { console.error("Firebase Initialization Error:", e); }
}

/**
 * ############################################################################
 * SECTION 3: TYPE DEFINITIONS
 * ############################################################################
 */
type TileType = 'grass' | 'dirt' | 'wall' | 'water' | 'floor' | 'portal_out' | 'town_entrance' | 'dungeon_entrance' | 'sand' | 'snow' | 'rock';
type EntityType = 'player' | 'enemy' | 'npc' | 'projectile' | 'particle' | 'text' | 'drop';
type Job = 'Swordsman' | 'Warrior' | 'Archer' | 'Mage';
type Gender = 'Male' | 'Female';
type ShapeType = 'humanoid' | 'beast' | 'slime' | 'large' | 'insect' | 'ghost' | 'demon' | 'dragon' | 'flying';
type Biome = 'WorldMap' | 'Town' | 'Dungeon' | 'Plains' | 'Forest' | 'Desert' | 'Snow' | 'Wasteland'; // Modified
type Rarity = 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary';
type EquipmentType = 'Weapon' | 'Helm' | 'Armor' | 'Shield' | 'Boots';
type WeaponStyle = 'OneHanded' | 'TwoHanded' | 'DualWield';
type MenuType = 'none' | 'status' | 'inventory' | 'stats'; 
type ResolutionMode = 'auto' | '800x600' | '1024x768' | '1280x720';

interface Tile { x: number; y: number; type: TileType; solid: boolean; teleportTo?: string; } // Added teleportTo
interface Enchantment { type: 'Attack' | 'Defense' | 'Speed' | 'MaxHp'; value: number; strength: 'Weak' | 'Medium' | 'Strong'; name: string; }
interface Item { id: string; name: string; type: EquipmentType; subType?: WeaponStyle; rarity: Rarity; level: number; stats: { attack: number; defense: number; speed: number; maxHp: number; }; enchantments: Enchantment[]; icon: string; color: string; }
interface Entity { id: string; x: number; y: number; width: number; height: number; visualWidth?: number; visualHeight?: number; color: string; type: EntityType; dead: boolean; vx?: number; vy?: number; }
interface DroppedItem extends Entity { type: 'drop'; item: Item; life: number; bounceOffset: number; }
interface CombatEntity extends Entity { hp: number; maxHp: number; level: number; attack: number; defense: number; speed: number; lastAttackTime: number; attackCooldown: number; isAttacking?: boolean; direction: number; shape?: ShapeType; }
interface Attributes { vitality: number; strength: number; dexterity: number; intelligence: number; endurance: number; }
interface PlayerEntity extends CombatEntity { job: Job; gender: Gender; xp: number; nextLevelXp: number; gold: number; maxMp: number; mp: number; statPoints: number; attributes: Attributes; inventory: Item[]; equipment: { mainHand?: Item; offHand?: Item; helm?: Item; armor?: Item; boots?: Item; }; calculatedStats: { maxHp: number; maxMp: number; attack: number; defense: number; speed: number; }; }
interface EnemyEntity extends CombatEntity { targetId?: string; detectionRange: number; race: string; xpValue: number; rank: 'Normal' | 'Elite' | 'Boss'; }
interface Particle extends Entity { life: number; maxLife: number; size: number; }
interface FloatingText extends Entity { text: string; life: number; color: string; }
interface Projectile extends Entity { damage: number; ownerId: string; life: number; }
interface ChunkData { map: Tile[][]; enemies: EnemyEntity[]; droppedItems: DroppedItem[]; biome: Biome; locationId: string; } // Added locationId
interface GameState { 
  locationId: string; // Current location ID (e.g., 'world', 'town_start', 'dungeon_1')
  savedChunks: Record<string, ChunkData>; 
  map: Tile[][]; 
  player: PlayerEntity; 
  enemies: EnemyEntity[]; 
  droppedItems: DroppedItem[]; 
  projectiles: Projectile[]; 
  particles: Particle[]; 
  floatingTexts: FloatingText[]; 
  camera: { x: number; y: number }; 
  gameTime: number; 
  isPaused: boolean; 
  wave: number;
  lastWorldPos?: { x: number, y: number }; // To return to world map position
}

/**
 * ############################################################################
 * SECTION 4: GAME CONSTANTS & DATA
 * ############################################################################
 */
const GAME_CONFIG = {
  TILE_SIZE: 32, MAP_WIDTH: 50, MAP_HEIGHT: 40, PLAYER_SPEED: 5, ENEMY_SPAWN_RATE: 0.015, BASE_DROP_RATE: 0.2, // Increased map size slightly
};

const THEME = {
  colors: {
    ground: '#1a1a1a', grass: '#1e2b1e', wall: '#424242', water: '#1a237e', townFloor: '#5d4037', player: '#d4af37', enemy: '#8b0000', text: '#c0c0c0', highlight: '#ffd700',
    rarity: { Common: '#ffffff', Uncommon: '#1eff00', Rare: '#0070dd', Epic: '#a335ee', Legendary: '#ff8000', }
  }
};

const RARITY_MULTIPLIERS = { Common: 1.0, Uncommon: 1.2, Rare: 1.5, Epic: 2.0, Legendary: 3.0 };
const ENCHANT_SLOTS = { Common: 0, Uncommon: 1, Rare: 2, Epic: 3, Legendary: 5 };
const ITEM_BASE_NAMES = { Weapon: { OneHanded: '剣', TwoHanded: '大剣', DualWield: '双剣' }, Helm: '兜', Armor: '板金鎧', Shield: '盾', Boots: '具足' };
const ICONS = { Weapon: { OneHanded: '⚔️', TwoHanded: '🗡️', DualWield: '⚔️' }, Helm: '🪖', Armor: '🛡️', Shield: '🛡️', Boots: '👢' };

const JOB_DATA: Record<Job, { attributes: Attributes, desc: string, icon: string, color: string }> = {
  Swordsman: { attributes: { vitality: 12, strength: 12, dexterity: 12, intelligence: 8, endurance: 11 }, icon: '⚔️', desc: '攻守のバランスに優れた剣士。初心者におすすめ。', color: '#3b82f6' },
  Warrior:   { attributes: { vitality: 14, strength: 16, dexterity: 9, intelligence: 6, endurance: 15 }, icon: '🪓', desc: '強靭な肉体と破壊力を持つ戦士。最前線で戦う。', color: '#ef4444' },
  Archer:    { attributes: { vitality: 10, strength: 10, dexterity: 16, intelligence: 10, endurance: 10 }, icon: '🏹', desc: '素早い動きで遠距離から攻撃する狩人。', color: '#10b981' },
  Mage:      { attributes: { vitality: 9, strength: 6, dexterity: 12, intelligence: 18, endurance: 8 }, icon: '🪄', desc: '強力な魔法を操る賢者。打たれ弱いが火力は高い。', color: '#a855f7' },
};

const ENEMY_TYPES = [
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
const BIOME_NAMES: Record<Biome, string> = { 
  WorldMap: 'ワールドマップ',
  Town: '街',
  Dungeon: 'ダンジョン',
  Plains: '平原', Forest: '森', Desert: '砂漠', Snow: '雪原', Wasteland: '荒野'
};

/**
 * ############################################################################
 * SECTION 5: GAME LOGIC HELPERS (PURE FUNCTIONS)
 * ############################################################################
 */
const generateRandomItem = (level: number, rankBonus: number = 0): Item | null => {
  let roll = Math.random() * 100 - rankBonus * 5;
  let rarity: Rarity = roll < 1 ? 'Legendary' : roll < 5 ? 'Epic' : roll < 15 ? 'Rare' : roll < 40 ? 'Uncommon' : 'Common';
  const types: EquipmentType[] = ['Weapon', 'Helm', 'Armor', 'Shield', 'Boots'];
  const type = types[Math.floor(Math.random() * types.length)];
  let subType: WeaponStyle | undefined;
  if (type === 'Weapon') subType = (['OneHanded', 'TwoHanded', 'DualWield'] as WeaponStyle[])[Math.floor(Math.random() * 3)];

  const mult = RARITY_MULTIPLIERS[rarity];
  const baseVal = level * 2;
  const stats = { attack: 0, defense: 0, speed: 0, maxHp: 0 };

  if (type === 'Weapon') {
    stats.attack = Math.floor(baseVal * 3 * mult);
    if (subType === 'TwoHanded') stats.attack = Math.floor(stats.attack * 1.5);
    if (subType === 'DualWield') { stats.attack = Math.floor(stats.attack * 0.8); stats.speed = 1; }
  } else if (type === 'Armor') { stats.defense = Math.floor(baseVal * 2 * mult); stats.maxHp = Math.floor(baseVal * 5 * mult);
  } else if (type === 'Helm') { stats.defense = Math.floor(baseVal * 1 * mult); stats.maxHp = Math.floor(baseVal * 2 * mult);
  } else if (type === 'Shield') { stats.defense = Math.floor(baseVal * 2.5 * mult);
  } else if (type === 'Boots') { stats.defense = Math.floor(baseVal * 0.5 * mult); stats.speed = Number((0.2 * mult).toFixed(1)); }

  const enchantments: Enchantment[] = [];
  const enchantCount = Math.floor(Math.random() * (ENCHANT_SLOTS[rarity] + 1));
  for (let i = 0; i < enchantCount; i++) {
    const eType = (['Attack', 'Defense', 'Speed', 'MaxHp'] as const)[Math.floor(Math.random() * 4)];
    const strIdx = Math.floor(Math.random() * 3);
    const strength = (['Weak', 'Medium', 'Strong'] as const)[strIdx];
    let val = 0;
    if (eType === 'Attack' || eType === 'Defense') val = Math.floor(level * (strIdx + 1));
    else if (eType === 'MaxHp') val = Math.floor(level * 5 * (strIdx + 1));
    else if (eType === 'Speed') val = Number((0.1 * (strIdx + 1)).toFixed(1));
    const name = `${{Weak:'微かな',Medium:'普通の',Strong:'強力な'}[strength]}${{Attack:'攻撃',Defense:'防御',Speed:'敏捷',MaxHp:'体力'}[eType]}`;
    enchantments.push({ type: eType, value: val, strength, name });
    if (eType === 'Attack') stats.attack += val; else if (eType === 'Defense') stats.defense += val; else if (eType === 'MaxHp') stats.maxHp += val; else if (eType === 'Speed') stats.speed += val;
  }
  let name = rarity === 'Common' ? '' : `${rarity} `;
  // @ts-ignore
  if (type === 'Weapon') name += ITEM_BASE_NAMES[type][subType!]; else name += ITEM_BASE_NAMES[type];
  return { id: crypto.randomUUID(), name, type, subType, rarity, level, stats, enchantments, icon: type === 'Weapon' ? ICONS.Weapon[subType!] : ICONS[type], color: THEME.colors.rarity[rarity] };
};

const createPlayer = (job: Job, gender: Gender): PlayerEntity => {
  const baseAttrs = JOB_DATA[job].attributes;
  return {
    id: 'player', type: 'player', x: 0, y: 0, width: 20, height: 20, visualWidth: 32, visualHeight: 56, color: THEME.colors.player, job, gender, shape: 'humanoid',
    hp: 100, maxHp: 100, mp: 50, maxMp: 50, attack: 10, defense: 0, speed: 4, level: 1, xp: 0, nextLevelXp: 100, gold: 0, statPoints: 0, attributes: { ...baseAttrs },
    dead: false, lastAttackTime: 0, attackCooldown: 500, direction: 1, inventory: [], equipment: {}, calculatedStats: { maxHp: 100, maxMp: 50, attack: 10, defense: 0, speed: 4 }
  };
};

const generateEnemy = (x: number, y: number, level: number): EnemyEntity => {
  const type = ENEMY_TYPES[Math.floor(Math.random() * ENEMY_TYPES.length)];
  const rankRoll = Math.random();
  let rank: 'Normal' | 'Elite' | 'Boss' = 'Normal';
  let scale = 1 + (level * 0.1);
  let color = type.color;
  if (rankRoll < 0.05) { rank = 'Boss'; scale *= 3; color = '#ff0000'; } else if (rankRoll < 0.2) { rank = 'Elite'; scale *= 1.5; color = '#ffeb3b'; }
  return {
    id: `enemy_${crypto.randomUUID()}`, type: 'enemy', race: type.name, rank, x, y, width: type.w * (rank === 'Boss' ? 1.5 : 1), height: type.h * (rank === 'Boss' ? 1.5 : 1),
    visualWidth: type.vw! * (rank === 'Boss' ? 1.5 : 1), visualHeight: type.vh! * (rank === 'Boss' ? 1.5 : 1), color, shape: type.shape as ShapeType,
    hp: Math.floor(type.hp * scale), maxHp: Math.floor(type.hp * scale), attack: Math.floor(type.atk * scale), defense: Math.floor(level * 2), speed: type.spd,
    level, direction: 1, dead: false, lastAttackTime: 0, attackCooldown: 1000 + Math.random() * 500, detectionRange: 350, xpValue: Math.floor(type.xp * scale * (rank === 'Boss' ? 5 : rank === 'Elite' ? 2 : 1))
  };
};

// --- Map Generation Logic ---

const generateWorldMap = (): ChunkData => {
  const width = GAME_CONFIG.MAP_WIDTH * 2; // World is bigger
  const height = GAME_CONFIG.MAP_HEIGHT * 2;
  const map: Tile[][] = Array(height).fill(null).map((_, y) => Array(width).fill(null).map((_, x) => {
    // Simple Perlin-like noise simulation for biomes
    const noise = Math.sin(x/15) + Math.sin(y/10) + Math.random() * 0.2;
    let type: TileType = 'grass';
    if (noise > 1.2) type = 'rock';
    else if (noise > 0.8) type = 'dirt';
    else if (noise < -1.0) type = 'water';
    else if (noise < -0.5) type = 'sand';
    
    // Borders
    if (x===0 || x===width-1 || y===0 || y===height-1) { type = 'wall'; }
    
    return { x: x * GAME_CONFIG.TILE_SIZE, y: y * GAME_CONFIG.TILE_SIZE, type, solid: type === 'wall' || type === 'water' || type === 'rock' };
  }));

  // Place Locations
  // 1. Starter Town (Center-ish)
  const townX = Math.floor(width / 2);
  const townY = Math.floor(height / 2);
  // Clear area around town
  for(let dy=-2; dy<=2; dy++) for(let dx=-2; dx<=2; dx++) {
     if(map[townY+dy]?.[townX+dx]) { map[townY+dy][townX+dx].type='grass'; map[townY+dy][townX+dx].solid=false; }
  }
  map[townY][townX] = { x: townX * GAME_CONFIG.TILE_SIZE, y: townY * GAME_CONFIG.TILE_SIZE, type: 'town_entrance', solid: false, teleportTo: 'town_start' };

  // 2. Dungeon (Randomly placed away from center)
  let dungeonX, dungeonY, dist;
  do {
    dungeonX = Math.floor(Math.random() * (width - 4)) + 2;
    dungeonY = Math.floor(Math.random() * (height - 4)) + 2;
    dist = Math.sqrt((dungeonX - townX)**2 + (dungeonY - townY)**2);
  } while (dist < 20 || map[dungeonY][dungeonX].solid);
  map[dungeonY][dungeonX] = { x: dungeonX * GAME_CONFIG.TILE_SIZE, y: dungeonY * GAME_CONFIG.TILE_SIZE, type: 'dungeon_entrance', solid: false, teleportTo: 'dungeon_1' };

  return { map, enemies: [], droppedItems: [], biome: 'WorldMap', locationId: 'world' };
};

const generateTownMap = (id: string): ChunkData => {
  const width = 30; const height = 20;
  const map: Tile[][] = Array(height).fill(null).map((_, y) => Array(width).fill(null).map((_, x) => {
    let type: TileType = 'floor';
    let solid = false;
    // Walls around town
    if (x===0 || x===width-1 || y===0 || y===height-1) { type='wall'; solid=true; }
    // Exit (South)
    if (y===height-1 && Math.abs(x - width/2) < 2) { type='portal_out'; solid=false; }
    return { x: x * 32, y: y * 32, type, solid, teleportTo: type === 'portal_out' ? 'world' : undefined };
  }));

  // Add some buildings/decorations (simplified)
  map[5][5].type = 'wall'; map[5][5].solid = true; 
  map[5][6].type = 'wall'; map[5][6].solid = true;

  return { map, enemies: [], droppedItems: [], biome: 'Town', locationId: id };
};

const generateDungeonMap = (id: string, level: number): ChunkData => {
  const width = 40; const height = 30;
  const map: Tile[][] = Array(height).fill(null).map((_, y) => Array(width).fill(null).map((_, x) => {
     let type: TileType = 'dirt';
     if (Math.random() < 0.2) type = 'rock';
     if (x===0 || x===width-1 || y===0 || y===height-1) type='wall';
     return { x: x*32, y: y*32, type, solid: type === 'wall' || type === 'rock', teleportTo: undefined };
  }));

  // Exit (North)
  const midX = Math.floor(width/2);
  map[0][midX].type='portal_out'; map[0][midX].solid=false; map[0][midX].teleportTo='world'; // Back to world for now

  // Enemies
  const enemies: EnemyEntity[] = [];
  for(let i=0; i<10; i++) {
     let ex, ey;
     do { ex = Math.floor(Math.random()*width); ey = Math.floor(Math.random()*height); } while(map[ey][ex].solid || (ex===midX && ey<5));
     enemies.push(generateEnemy(ex*32, ey*32, level));
  }

  return { map, enemies, droppedItems: [], biome: 'Dungeon', locationId: id };
};

const getMapData = (locationId: string): ChunkData => {
  if (locationId === 'world') return generateWorldMap();
  if (locationId === 'town_start') return generateTownMap('town_start');
  if (locationId.startsWith('dungeon_')) return generateDungeonMap(locationId, 1);
  return generateWorldMap();
};


const checkCollision = (rect1: Entity, rect2: Entity) => rect1.x < rect2.x + rect2.width && rect1.x + rect1.width > rect2.x && rect1.y < rect2.y + rect2.height && rect1.y + rect1.height > rect2.y;

const resolveMapCollision = (entity: Entity, dx: number, dy: number, map: Tile[][]): {x: number, y: number} => {
  const T = GAME_CONFIG.TILE_SIZE;
  const nextX = entity.x + dx, nextY = entity.y + dy;
  const startX = Math.floor(nextX / T), endX = Math.floor((nextX + entity.width) / T), startY = Math.floor(nextY / T), endY = Math.floor((nextY + entity.height) / T);
  // Boundary check
  if (startX < 0 || endX >= map[0].length || startY < 0 || endY >= map.length) return { x: entity.x, y: entity.y };
  
  for (let y = startY; y <= endY; y++) for (let x = startX; x <= endX; x++) if (map[y]?.[x]?.solid) return { x: entity.x, y: entity.y };
  return { x: nextX, y: nextY };
};

const updatePlayerStats = (player: PlayerEntity) => {
  const attr = player.attributes;
  let maxHp = attr.vitality * 10, maxMp = attr.intelligence * 5, baseAtk = Math.floor(attr.strength * 1.5 + attr.dexterity * 0.5), baseDef = Math.floor(attr.endurance * 1.2), baseSpd = 3 + (attr.dexterity * 0.05);
  let equipAtk = 0, equipDef = 0, equipSpd = 0, equipHp = 0;
  Object.values(player.equipment).forEach(item => { if (item) { equipAtk += item.stats.attack; equipDef += item.stats.defense; equipSpd += item.stats.speed; equipHp += item.stats.maxHp; } });
  player.calculatedStats = { maxHp: maxHp + equipHp, maxMp: maxMp, attack: baseAtk + equipAtk, defense: baseDef + equipDef, speed: baseSpd + equipSpd };
  Object.assign(player, player.calculatedStats);
  if (player.hp > player.maxHp) player.hp = player.maxHp; if (player.mp > player.maxMp) player.mp = player.maxMp;
};

/**
 * ############################################################################
 * SECTION 6: RENDERER
 * ############################################################################
 */
const renderGame = (ctx: CanvasRenderingContext2D, state: GameState, images: Record<string, HTMLImageElement>) => {
  const { width, height } = ctx.canvas;
  const T = GAME_CONFIG.TILE_SIZE;
  ctx.fillStyle = '#111'; ctx.fillRect(0, 0, width, height);
  ctx.save();
  
  // Center camera on player
  const camX = Math.floor(state.player.x + state.player.width/2 - width/2);
  const camY = Math.floor(state.player.y + state.player.height/2 - height/2);
  ctx.translate(-camX, -camY);
  state.camera = { x: camX, y: camY };

  const startCol = Math.max(0, Math.floor(camX / T));
  const endCol = startCol + (width / T) + 1; // Allow slightly out of bounds for smooth scrolling
  const startRow = Math.max(0, Math.floor(camY / T));
  const endRow = startRow + (height / T) + 1;

  // Render Map
  for (let y = startRow; y <= endRow; y++) {
    if (!state.map[y]) continue;
    for (let x = startCol; x <= endCol; x++) {
      const tile = state.map[y][x];
      if (!tile) continue;
      
      // Basic colors
      // @ts-ignore
      let color = {
        grass:'#1b2e1b', dirt:'#3e2723', sand:'#fbc02d', snow:'#e3f2fd', 
        rock:'#616161', wall:'#424242', water:'#1a237e', floor:'#5d4037',
        portal_out: '#5e35b1', town_entrance: '#795548', dungeon_entrance: '#212121'
      }[tile.type] || '#000';

      ctx.fillStyle = color;
      ctx.fillRect(tile.x, tile.y, T, T);
      ctx.strokeStyle = 'rgba(0,0,0,0.05)'; ctx.strokeRect(tile.x, tile.y, T, T);
      
      // Tile details
      if (tile.type === 'wall' || tile.type === 'rock') { 
        ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fillRect(tile.x, tile.y+T-4, T, 4); 
      }
      if (tile.type === 'town_entrance') {
        ctx.fillStyle = '#fff'; ctx.font = '20px Arial'; ctx.textAlign='center'; ctx.fillText('🏠', tile.x+T/2, tile.y+T/1.5);
      }
      if (tile.type === 'dungeon_entrance') {
        ctx.fillStyle = '#fff'; ctx.font = '20px Arial'; ctx.textAlign='center'; ctx.fillText('💀', tile.x+T/2, tile.y+T/1.5);
      }
      if (tile.type === 'portal_out') {
        ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.beginPath(); ctx.arc(tile.x+T/2, tile.y+T/2, T/3, 0, Math.PI*2); ctx.fill();
      }
    }
  }

  // Render Dropped Items
  state.droppedItems.forEach(drop => {
    const bob = Math.sin(state.gameTime / 10) * 5 + drop.bounceOffset;
    ctx.shadowColor = drop.item.color; ctx.shadowBlur = 10;
    ctx.fillStyle = '#8d6e63'; ctx.fillRect(drop.x + 8, drop.y + 8 + bob, 16, 16);
    ctx.fillStyle = drop.item.color; ctx.fillRect(drop.x + 8, drop.y + 12 + bob, 16, 4);
    ctx.font = '16px Arial'; ctx.textAlign = 'center'; ctx.fillText(drop.item.icon, drop.x + 16, drop.y + 4 + bob); ctx.shadowBlur = 0;
  });

  // Render Characters function
  const renderCharacter = (e: CombatEntity, icon?: string) => {
    const vw = e.visualWidth || e.width, vh = e.visualHeight || e.height;
    const centerX = e.x + e.width / 2, bottomY = e.y + e.height;
    let imgKey: string | null = null;
    
    if (e.type === 'player') imgKey = `${(e as PlayerEntity).job}_${(e as PlayerEntity).gender}`;
    else if (e.type === 'enemy') {
       const race = (e as EnemyEntity).race;
       if (race.includes('Slime')) imgKey = 'Slime';
       else if (race.includes('Bandit')) imgKey = 'Bandit';
       else if (race.includes('Zombie') || race.includes('Ghoul')) imgKey = 'Zombie';
       else if (race.includes('Ant') || race.includes('Spider')) imgKey = 'Insect';
       else if (race.includes('Imp') || race.includes('Demon')) imgKey = 'Demon';
       else if (race.includes('Bat')) imgKey = 'Bat';
       else if (race.includes('Dragon')) imgKey = 'Dragon';
       else if (race.includes('Boar') || race.includes('Wolf')) imgKey = race.includes('Wolf') ? 'Wolf' : 'Beast';
       else if (race.includes('Ghost')) imgKey = 'Ghost';
    }

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.beginPath();
    ctx.ellipse(centerX, bottomY - 2, e.width/2 * (['flying','ghost'].includes(e.shape || '') ? 0.8 : 1.2), 4, 0, 0, Math.PI*2); ctx.fill();

    // Body
    if (imgKey && images[imgKey]) {
      const isMoving = Math.abs(e.vx || 0) > 0.1 || Math.abs(e.vy || 0) > 0.1;
      const bounce = isMoving ? Math.sin(state.gameTime / 2) : 0;
      const scaleX = (isMoving ? 1 + bounce * 0.1 : 1) * (e.isAttacking ? 1.2 : 1) * (e.direction === 2 ? -1 : 1);
      const scaleY = (isMoving ? 1 - bounce * 0.1 : 1) * (e.isAttacking ? 0.8 : 1);
      ctx.save(); ctx.translate(centerX, bottomY + (bounce > 0 ? -bounce * 5 : 0));
      ctx.scale(scaleX, scaleY); ctx.drawImage(images[imgKey], -vw / 2, -vh, vw, vh); ctx.restore();
    } else {
      // Fallback box
      const bob = Math.sin(state.gameTime / 3) * ((Math.abs(e.vx||0)>0.1 || Math.abs(e.vy||0)>0.1) ? 2 : 0);
      ctx.fillStyle = e.color; if (e.shape === 'ghost') ctx.globalAlpha = 0.6;
      ctx.fillRect(e.x + (e.width-vw)/2, e.y + e.height - vh + bob, vw, vh); ctx.globalAlpha = 1.0;
      if (icon) { ctx.font = `${Math.min(vw, vh) * 0.6}px Arial`; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillStyle='#fff'; ctx.fillText(icon, e.x+e.width/2, e.y+e.height-vh/2+bob); }
    }
    
    // HP Bar
    if (e.type === 'enemy' && e.hp < e.maxHp) {
      const barX = centerX - vw/2, barY = bottomY - vh - 12;
      ctx.fillStyle='#000'; ctx.fillRect(barX, barY, vw, 4); ctx.fillStyle='#f44336'; ctx.fillRect(barX, barY, vw * (e.hp/e.maxHp), 4);
    }
  };

  // Render all entities sorted by Y
  [...state.enemies, state.player].sort((a,b)=>(a.y+a.height)-(b.y+b.height)).forEach(e => {
    if (e.dead) return;
    const icon = e.type==='player' ? JOB_DATA[(e as PlayerEntity).job]?.icon : ENEMY_TYPES.find(t=>t.name===(e as EnemyEntity).race)?.icon;
    renderCharacter(e as CombatEntity, icon);
  });

  // Attack Effect
  if (state.player.isAttacking) {
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.beginPath();
    const radius = Math.max(0, 60 * Math.min(Math.max((Date.now() - state.player.lastAttackTime) / 200, 0), 1));
    ctx.arc(state.player.x + state.player.width/2, state.player.y + state.player.height/2, radius, 0, Math.PI*2); ctx.stroke();
  }

  // Floating Texts
  state.floatingTexts.forEach(t => {
    ctx.font = 'bold 16px monospace'; ctx.fillStyle = 'black'; ctx.strokeStyle = 'white'; ctx.lineWidth = 2; ctx.textAlign = 'center';
    ctx.strokeText(t.text, t.x, t.y); ctx.fillStyle = t.color; ctx.fillText(t.text, t.x, t.y);
  });
  ctx.restore();
};

/**
 * ############################################################################
 * SECTION 7: SUB-COMPONENTS (SCREENS & UI)
 * ############################################################################
 */

// Title Screen Component
interface TitleScreenProps {
  onStart: () => void;
  onContinue: () => void;
  canContinue: boolean;
  resolution: ResolutionMode;
  setResolution: (mode: ResolutionMode) => void;
}

const TitleScreen = ({ onStart, onContinue, canContinue, resolution, setResolution }: TitleScreenProps) => {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className="w-full h-screen bg-slate-900 flex flex-col items-center justify-center text-white relative overflow-hidden font-sans bg-mist">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-30"></div>
      <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl animate-float" style={{animationDelay: '1s'}}></div>
      
      {/* Safe Area Container (Letterboxing)
        w-full h-full on parent ensures it fills the viewport.
        Inside, we use aspect-video and max-width/max-height logic to constrain to 16:9.
        m-auto centers it.
      */}
      <div className="relative z-10 w-full h-full max-w-[177.78vh] max-h-[56.25vw] aspect-video m-auto flex flex-col items-center justify-center p-8">
        
        {/* Main Title Content */}
        <div className={`text-center space-y-10 animate-fade-in transition-all duration-300 w-full ${showSettings ? 'blur-sm scale-95 opacity-50' : ''}`}>
          <div className="relative">
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 via-yellow-500 to-yellow-800 drop-shadow-2xl mb-4 text-shadow-strong tracking-tighter" 
                style={{ filter: 'drop-shadow(0 0 30px rgba(234,179,8,0.6))'}}>
              QUEST OF HARVEST
            </h1>
            <p className="text-slate-400 tracking-[1.2em] text-sm md:text-lg uppercase font-serif mt-6 border-t border-b border-slate-700 py-3 inline-block bg-black/20 backdrop-blur-sm px-8 rounded-full">
              Reborn Edition
            </p>
          </div>

          <div className="flex flex-col gap-4 w-80 md:w-96 mx-auto">
            <button onClick={onStart} className="group relative flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-slate-800/90 to-slate-900/90 border-2 border-yellow-700/50 hover:border-yellow-400 hover:from-slate-800 hover:to-slate-800 transition-all duration-300 text-yellow-100 font-black tracking-widest uppercase text-lg shadow-lg hover:shadow-yellow-500/20 transform hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-400/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              <Play size={24} className="group-hover:text-yellow-400 transition-colors" />
              <span>New Game</span>
            </button>
            
            <button onClick={onContinue} disabled={!canContinue} className={`flex items-center justify-center gap-3 px-8 py-3 border-2 font-bold tracking-widest uppercase transition-all text-base backdrop-blur-sm ${canContinue ? 'bg-slate-800/50 border-slate-600 hover:border-blue-400 hover:bg-slate-700/80 text-slate-200 hover:shadow-blue-500/20' : 'bg-slate-900/50 border-slate-800 text-slate-600 cursor-not-allowed'}`}>
              <Save size={20} />
              <span>Continue</span>
            </button>

            <button onClick={() => setShowSettings(true)} className="flex items-center justify-center gap-3 px-8 py-3 border-2 border-slate-700 bg-slate-800/30 hover:bg-slate-800/60 hover:border-slate-500 font-bold tracking-widest uppercase transition-all text-slate-300 hover:text-white backdrop-blur-sm text-base">
              <Settings size={20} />
              <span>Settings</span>
            </button>
          </div>
        </div>

        {/* Settings Modal Overlay - Placed absolutely within the safe container so it scales with it */}
        {showSettings && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md animate-fade-in">
            <div className="bg-slate-900 p-8 rounded-xl border-2 border-slate-600 w-[400px] shadow-2xl transform scale-100 transition-all">
              <div className="flex justify-between items-center mb-8 border-b border-slate-700 pb-4">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Settings className="text-slate-400" /> SETTINGS
                </h2>
                <button onClick={() => setShowSettings(false)} className="text-slate-400 hover:text-white transition-colors p-1 hover:bg-slate-800 rounded-full">
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-3 flex items-center gap-2">
                    <Monitor size={16} /> Screen Resolution (Game)
                  </label>
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      { label: 'AUTO (Fit Window)', val: 'auto', desc: 'Automatically adjusts to window size' }, 
                      { label: 'SVGA (800x600)', val: '800x600', desc: 'Classic 4:3 Aspect Ratio' },
                      { label: 'HD (1280x720)', val: '1280x720', desc: 'Widescreen 16:9' }
                    ].map(opt => (
                      <button 
                        key={opt.val}
                        onClick={() => setResolution(opt.val as ResolutionMode)}
                        className={`flex flex-col items-start p-3 rounded border transition-all ${
                          resolution === opt.val 
                            ? 'bg-yellow-600/20 border-yellow-500 text-yellow-100 shadow-[0_0_10px_rgba(234,179,8,0.2)]' 
                            : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700 hover:border-slate-500'
                        }`}
                      >
                        <span className="font-bold text-sm">{opt.label}</span>
                        <span className="text-[10px] opacity-70">{opt.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button onClick={() => setShowSettings(false)} className="w-full mt-8 py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded transition-colors uppercase tracking-wider text-sm">
                Close
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="absolute bottom-8 text-xs text-slate-500 font-mono tracking-wider opacity-60">
        WASD: MOVE • SPACE: ATTACK • MOUSE: INTERACT
      </div>
    </div>
  );
};

// Job Select Screen Component
const JobSelectScreen = ({ onBack, onSelect, loadedAssets }: { onBack: () => void, onSelect: (job: Job, gender: Gender) => void, loadedAssets: Record<string, HTMLImageElement> }) => {
  const [selectedGender, setSelectedGender] = useState<Gender>('Male');
  const [selectedJob, setSelectedJob] = useState<Job>('Swordsman');
  const jobInfo = JOB_DATA[selectedJob];
  const previewImg = loadedAssets[`${selectedJob}_${selectedGender}`];

  return (
    <div className="w-full h-screen bg-slate-950 text-white flex overflow-hidden">
      <div className="w-1/3 bg-slate-900 border-r border-slate-800 relative flex flex-col p-8 shadow-2xl z-10">
        <button onClick={onBack} className="absolute top-6 left-6 text-slate-500 hover:text-white flex items-center gap-2 transition-colors"><ArrowLeft size={20} /> <span className="text-sm font-bold uppercase">Back</span></button>
        <div className="mt-12 flex-1 flex flex-col items-center justify-center relative">
          <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none"><div className="text-[200px]">{jobInfo.icon}</div></div>
          <div className="relative mb-8 transform scale-150 animate-float">
             <div className="absolute -inset-4 bg-gradient-to-t from-black/50 to-transparent blur-lg rounded-full"></div>
             {previewImg ? <img src={previewImg.src} className="w-32 h-32 pixel-art drop-shadow-2xl" /> : <div className="text-9xl">{jobInfo.icon}</div>}
          </div>
          <h2 className="text-4xl font-black uppercase tracking-wider mb-2" style={{ color: jobInfo.color }}>{selectedJob}</h2>
          <div className="flex items-center gap-2 mb-6"><span className={`px-3 py-1 rounded text-xs font-bold bg-slate-800 border ${selectedGender === 'Male' ? 'border-blue-500 text-blue-400' : 'border-pink-500 text-pink-400'}`}>{selectedGender === 'Male' ? 'MALE' : 'FEMALE'}</span></div>
          <p className="text-center text-slate-400 text-sm leading-relaxed max-w-xs mb-8">{jobInfo.desc}</p>
          <div className="w-full space-y-3 max-w-xs">
            {[{ label: 'STR', icon: Sword, val: jobInfo.attributes.strength, max: 20, col: 'bg-red-500' }, { label: 'VIT', icon: Heart, val: jobInfo.attributes.vitality, max: 20, col: 'bg-green-500' }, { label: 'INT', icon: Zap, val: jobInfo.attributes.intelligence, max: 20, col: 'bg-purple-500' }, { label: 'DEX', icon: Activity, val: jobInfo.attributes.dexterity, max: 20, col: 'bg-yellow-500' }].map(s => (
              <div key={s.label} className="flex items-center gap-3 text-xs font-bold"><div className="w-8 text-slate-500 flex justify-end">{s.label}</div><div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden"><div className={`h-full ${s.col}`} style={{ width: `${(s.val / s.max) * 100}%` }}></div></div><div className="w-4 text-right text-slate-300">{s.val}</div></div>
            ))}
          </div>
        </div>
        <button onClick={() => onSelect(selectedJob, selectedGender)} className="w-full py-4 mt-8 bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-black font-black uppercase tracking-widest text-lg shadow-[0_0_20px_rgba(234,179,8,0.3)] hover:shadow-[0_0_30px_rgba(234,179,8,0.6)] transition-all transform hover:-translate-y-1 rounded">Start Adventure</button>
      </div>
      <div className="w-2/3 bg-slate-950 p-12 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-xl font-bold text-slate-500 mb-6 uppercase tracking-widest">Select Gender</h3>
          <div className="flex gap-4 mb-12">
             {['Male', 'Female'].map((g) => (<button key={g} onClick={() => setSelectedGender(g as Gender)} className={`flex-1 py-4 border-2 rounded-lg transition-all flex items-center justify-center gap-3 ${selectedGender === g ? 'border-yellow-500 bg-yellow-500/10 text-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.2)]' : 'border-slate-800 bg-slate-900 text-slate-500 hover:border-slate-600 hover:text-slate-300'}`}><span className="text-lg font-bold uppercase">{g}</span></button>))}
          </div>
          <h3 className="text-xl font-bold text-slate-500 mb-6 uppercase tracking-widest">Select Class</h3>
          <div className="grid grid-cols-2 gap-4">
            {(Object.keys(JOB_DATA) as Job[]).map(job => (
              <button key={job} onClick={() => setSelectedJob(job)} className={`relative p-6 rounded-lg border-2 text-left transition-all group overflow-hidden ${selectedJob === job ? 'border-white bg-slate-800 shadow-xl scale-[1.02]' : 'border-slate-800 bg-slate-900/50 hover:border-slate-600 hover:bg-slate-900'}`}>
                <div className={`absolute top-0 right-0 p-4 opacity-20 text-6xl transition-transform group-hover:scale-110 group-hover:rotate-12 duration-500 ${selectedJob === job ? 'opacity-40' : ''}`}>{JOB_DATA[job].icon}</div>
                <div className="relative z-10">
                  <h4 className={`text-xl font-black uppercase mb-1 ${selectedJob === job ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`}>{job}</h4>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-slate-500 mt-4">
                    <div className="flex justify-between"><span>ATK</span> <span className={selectedJob===job ? 'text-white' : ''}>{'★'.repeat(Math.min(5, Math.ceil(JOB_DATA[job].attributes.strength / 4)))}</span></div>
                    <div className="flex justify-between"><span>DEF</span> <span className={selectedJob===job ? 'text-white' : ''}>{'★'.repeat(Math.min(5, Math.ceil(JOB_DATA[job].attributes.endurance / 4)))}</span></div>
                    <div className="flex justify-between"><span>SPD</span> <span className={selectedJob===job ? 'text-white' : ''}>{'★'.repeat(Math.min(5, Math.ceil(JOB_DATA[job].attributes.dexterity / 4)))}</span></div>
                    <div className="flex justify-between"><span>MAG</span> <span className={selectedJob===job ? 'text-white' : ''}>{'★'.repeat(Math.min(5, Math.ceil(JOB_DATA[job].attributes.intelligence / 4)))}</span></div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Game HUD Component
const GameHUD = ({ uiState, worldInfo, toggleMenu }: { uiState: PlayerEntity, worldInfo: {x:number, y:number, biome:Biome}, toggleMenu: (m: MenuType) => void }) => (
  <>
    <div className="absolute top-4 right-20 flex gap-4 text-white pointer-events-none">
       <div className="bg-slate-900/80 px-4 py-2 rounded border border-slate-700 flex items-center gap-2">
          <Compass size={16} className="text-yellow-500" />
          <span className="font-mono">{BIOME_NAMES[worldInfo.biome] || worldInfo.biome} ({worldInfo.x}, {worldInfo.y})</span>
       </div>
    </div>

    <div className="absolute top-4 left-4 flex gap-4 pointer-events-none">
      <div className="bg-slate-900/90 border border-slate-700 p-3 rounded text-white w-64 shadow-lg pointer-events-auto">
        <div className="flex justify-between items-center mb-2"><span className="font-bold text-yellow-500">{uiState.job} Lv.{uiState.level}</span><span className="text-xs text-slate-400">GOLD: {uiState.gold}</span></div>
        <div className="mb-2 space-y-1 text-xs text-slate-300">
           <div className="flex justify-between"><span>攻撃: {uiState.attack}</span><span>防御: {uiState.defense}</span></div>
           <div className="flex justify-between"><span>速度: {uiState.speed.toFixed(1)}</span></div>
        </div>
        <div className="mb-1">
          <div className="flex justify-between text-xs mb-0.5"><span>HP</span><span>{uiState.hp}/{uiState.maxHp}</span></div>
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden"><div className="h-full bg-red-600 transition-all duration-300" style={{ width: `${(uiState.hp/uiState.maxHp)*100}%` }}></div></div>
        </div>
         <div>
          <div className="flex justify-between text-xs mb-0.5"><span>XP</span><span>{uiState.xp}/{uiState.nextLevelXp}</span></div>
          <div className="h-1 bg-slate-700 rounded-full overflow-hidden"><div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${(uiState.xp/uiState.nextLevelXp)*100}%` }}></div></div>
        </div>
      </div>
    </div>

    <div className="absolute top-4 right-4 flex gap-2 pointer-events-auto">
      <button onClick={() => toggleMenu('inventory')} className="p-2 bg-slate-800 text-white rounded hover:bg-slate-700 border border-slate-600 relative"><ShoppingBag size={20} />{uiState?.inventory.length ? <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span> : null}</button>
      <button onClick={() => toggleMenu('stats')} className="p-2 bg-slate-800 text-white rounded hover:bg-slate-700 border border-slate-600 relative"><User size={20} />{uiState && uiState.statPoints > 0 ? <span className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></span> : null}</button>
      <button onClick={() => toggleMenu('status')} className="p-2 bg-slate-800 text-white rounded hover:bg-slate-700 border border-slate-600"><Settings size={20} /></button>
    </div>
  </>
);

// Inventory Menu Component
const InventoryMenu = ({ uiState, onEquip, onUnequip, onClose }: any) => (
  <div className="bg-slate-900 border border-slate-600 rounded-lg w-full max-w-4xl h-[600px] flex text-white overflow-hidden shadow-2xl">
    <div className="w-1/3 bg-slate-800/50 p-6 border-r border-slate-700 flex flex-col gap-4">
      <h3 className="text-xl font-bold text-yellow-500 mb-2 border-b border-slate-700 pb-2">装備</h3>
      {[{ slot: 'mainHand', label: '右手', icon: '⚔️' }, { slot: 'offHand', label: '左手', icon: '🛡️' }, { slot: 'helm', label: '頭', icon: '🪖' }, { slot: 'armor', label: '体', icon: '🛡️' }, { slot: 'boots', label: '足', icon: '👢' }].map((s) => {
        const item = uiState.equipment[s.slot];
        return (
          <div key={s.slot} className="flex items-center gap-3 p-2 bg-slate-800 rounded border border-slate-700 relative group">
            <div className="w-10 h-10 bg-slate-900 flex items-center justify-center text-2xl border border-slate-600 rounded">{item ? item.icon : s.icon}</div>
            <div className="flex-1"><div className="text-xs text-slate-400 uppercase">{s.label}</div><div className={`font-bold text-sm ${item ? '' : 'text-slate-600'}`} style={{ color: item?.color }}>{item ? item.name : 'なし'}</div></div>
            {item && (<button onClick={() => onUnequip(s.slot)} className="absolute right-2 top-2 p-1 hover:bg-red-900 rounded text-slate-400 hover:text-red-200"><X size={14} /></button>)}
          </div>
        );
      })}
    </div>
    <div className="flex-1 p-6 overflow-y-auto bg-slate-900">
      <div className="flex justify-between items-center mb-4"><h3 className="text-xl font-bold text-white">持ち物 ({uiState.inventory.length})</h3><button onClick={onClose} className="p-1 hover:bg-slate-700 rounded"><X /></button></div>
      <div className="grid grid-cols-2 gap-3">
        {uiState.inventory.map((item: any) => (
          <div key={item.id} onClick={() => onEquip(item)} className="flex gap-3 p-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-yellow-500 rounded cursor-pointer transition-colors group">
            <div className="w-12 h-12 bg-slate-900 flex items-center justify-center text-2xl border border-slate-600 rounded shrink-0">{item.icon}</div>
            <div className="flex-1 min-w-0">
              <div className="font-bold truncate" style={{ color: item.color }}>{item.name}</div>
              <div className="text-xs text-slate-400">{item.type} {item.subType ? `(${item.subType})` : ''}</div>
              <div className="text-xs mt-1 grid grid-cols-2 gap-x-2 text-slate-300">
                {item.stats.attack > 0 && <span>攻撃 +{item.stats.attack}</span>} {item.stats.defense > 0 && <span>防御 +{item.stats.defense}</span>}
              </div>
            </div>
          </div>
        ))}
        {uiState.inventory.length === 0 && (<div className="col-span-2 text-center text-slate-500 py-10">アイテムがありません。</div>)}
      </div>
    </div>
  </div>
);

/**
 * ############################################################################
 * SECTION 8: MAIN APP COMPONENT
 * ############################################################################
 */
export default function App() {
  const [screen, setScreen] = useState<'auth' | 'title' | 'game' | 'job_select'>('auth');
  const [saveData, setSaveData] = useState<any>(null);
  const [loadingMessage, setLoadingMessage] = useState('クラウドに接続中...');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameState = useRef<GameState | null>(null);
  const reqRef = useRef<number>();
  const input = useRef({ keys: {} as Record<string, boolean>, mouse: {x:0, y:0, down: false} });
  const [uiState, setUiState] = useState<PlayerEntity | null>(null);
  const [worldInfo, setWorldInfo] = useState<{x:number, y:number, biome:Biome}>({x:0, y:0, biome:'WorldMap'});
  const [activeMenu, setActiveMenu] = useState<MenuType>('none');
  const [message, setMessage] = useState<string | null>(null);
  const [viewportSize, setViewportSize] = useState({ width: 800, height: 600 });
  const [resolution, setResolution] = useState<ResolutionMode>('auto'); // Added resolution state
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // --- Assets Loading ---
  const loadedAssets = useMemo(() => {
    const images: Record<string, HTMLImageElement> = {};
    Object.entries(ASSETS_SVG).forEach(([key, svg]) => { const img = new Image(); img.src = svgToUrl(svg); images[key] = img; });
    return images;
  }, []);

  // --- Styles Injection ---
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
      @keyframes glow { 0%, 100% { box-shadow: 0 0 5px rgba(234, 179, 8, 0.5); } 50% { box-shadow: 0 0 20px rgba(234, 179, 8, 0.8); } }
      @keyframes mist { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
      .animate-float { animation: float 3s ease-in-out infinite; }
      .animate-glow { animation: glow 2s ease-in-out infinite; }
      .bg-mist { background: linear-gradient(-45deg, #0f172a, #1e293b, #0f172a, #312e81); background-size: 400% 400%; animation: mist 15s ease infinite; }
      .pixel-art { image-rendering: pixelated; }
      .text-shadow-strong { text-shadow: 2px 2px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000; }
    `;
    document.head.appendChild(style); return () => { document.head.removeChild(style); };
  }, []);

  // --- Auth & Initial Load ---
  useEffect(() => {
    if (!auth) {
      console.warn("Auth not initialized. Starting in offline mode.");
      setLoadingMessage("オフラインモードで起動中...");
      setTimeout(() => setScreen('title'), 1000);
      return;
    }
    const initAuth = async () => {
      try {
        // @ts-ignore
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) await signInWithCustomToken(auth, __initial_auth_token); else await signInAnonymously(auth);
      } catch (e: any) {
        console.warn("Firebase Auth Failed:", e.message);
        if (e.code === 'auth/configuration-not-found') {
            console.info("NOTE: Firebase Authenticationで「匿名」プロバイダが有効になっていない可能性があります。");
        }
        setLoadingMessage("オフラインモードで起動します...");
        setTimeout(() => setScreen('title'), 1500);
      }
    };
    initAuth();
    return onAuthStateChanged(auth, (u) => { setUser(u); if (u) checkSaveData(u.uid); });
  }, []);

  // --- Event Listeners & Resize Logic ---
  useEffect(() => {
    const handleResize = () => {
      if (resolution === 'auto') {
        setViewportSize({ width: window.innerWidth, height: window.innerHeight });
      } else {
        const [w, h] = resolution.split('x').map(Number);
        setViewportSize({ width: w, height: h });
      }
    };
    handleResize(); 
    window.addEventListener('resize', handleResize);

    const handleKeyDown = (e: KeyboardEvent) => {
      input.current.keys[e.key.toLowerCase()] = true;
      if (e.key.toLowerCase() === 'i') setActiveMenu(prev => prev === 'inventory' ? 'none' : 'inventory');
      if (e.key.toLowerCase() === 'c') setActiveMenu(prev => prev === 'stats' ? 'none' : 'stats');
      if (e.key === 'Escape') setActiveMenu('none');
    };
    const handleKeyUp = (e: KeyboardEvent) => input.current.keys[e.key.toLowerCase()] = false;
    const handleMouseInput = (e: any) => {
        if (!canvasRef.current) return;
        const r = canvasRef.current.getBoundingClientRect();
        input.current.mouse.x = e.clientX - r.left; input.current.mouse.y = e.clientY - r.top;
        if(e.type==='mousedown') input.current.mouse.down=true; if(e.type==='mouseup') input.current.mouse.down=false;
    };
    window.addEventListener('keydown', handleKeyDown); window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousedown', handleMouseInput); window.addEventListener('mouseup', handleMouseInput); window.addEventListener('mousemove', handleMouseInput);
    return () => {
      window.removeEventListener('resize', handleResize); window.removeEventListener('keydown', handleKeyDown); window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousedown', handleMouseInput); window.removeEventListener('mouseup', handleMouseInput); window.removeEventListener('mousemove', handleMouseInput);
      if (reqRef.current) cancelAnimationFrame(reqRef.current);
    };
  }, [resolution]); // Added resolution dependency

  // --- Game Functions ---
  const checkSaveData = async (uid: string) => {
    if (!db) { setScreen('title'); return; }
    try {
      const snap = await getDoc(doc(db, 'artifacts', appId, 'users', uid, 'saves', 'slot1'));
      if (snap.exists()) setSaveData(snap.data());
      setScreen('title');
    } catch (e) { setScreen('title'); }
  };

  const startGame = (job: Job, gender: Gender = 'Male', load = false) => {
    let player: PlayerEntity, worldX = 0, worldY = 0, savedChunks = {}, locationId = 'world', map;
    if (load && saveData) {
      player = { ...saveData.player }; worldX = saveData.worldX; worldY = saveData.worldY; savedChunks = saveData.savedChunks || {}; updatePlayerStats(player);
      // Fallback if loading old save
      if (!saveData.locationId) {
        locationId = 'world';
        const chunk = generateWorldMap();
        map = chunk.map;
      } else {
        // Load Location Logic would go here, for now just reset to world if complex
         const chunk = generateWorldMap();
         map = chunk.map;
         locationId = 'world';
      }
    } else {
      player = createPlayer(job, gender); updatePlayerStats(player);
      const chunk = generateWorldMap();
      map = chunk.map;
      // Start in middle of world map
      player.x = (chunk.map[0].length * 32) / 2;
      player.y = (chunk.map.length * 32) / 2;
      
      const starterSword = generateRandomItem(1); 
      if(starterSword) { starterSword.name = "錆びた剣"; starterSword.type = 'Weapon'; starterSword.subType = 'OneHanded'; player.inventory.push(starterSword); }
    }
    
    // Initial Map Generation
    const chunk = getMapData(locationId);

    gameState.current = {
      worldX, worldY, currentBiome: chunk.biome, savedChunks, map: chunk.map, player, enemies: chunk.enemies, droppedItems: chunk.droppedItems, locationId,
      projectiles: [], particles: [], floatingTexts: [], camera: { x: 0, y: 0 }, gameTime: 0, isPaused: false, wave: 1
    };
    setScreen('game');
  };

  const switchChunk = (dx: number, dy: number) => {
    if (!gameState.current) return;
    const state = gameState.current;
    state.savedChunks[`${state.worldX},${state.worldY}`] = { map: state.map, enemies: state.enemies, droppedItems: state.droppedItems, biome: state.currentBiome };
    state.worldX += dx; state.worldY += dy;
    const nextChunk = state.savedChunks[`${state.worldX},${state.worldY}`] || generateChunk(state.worldX, state.worldY);
    state.map = nextChunk.map; state.enemies = nextChunk.enemies; state.droppedItems = nextChunk.droppedItems; state.currentBiome = nextChunk.biome; state.projectiles = [];
    setWorldInfo({x: state.worldX, y: state.worldY, biome: state.currentBiome});
    setMessage(`エリア移動：${BIOME_NAMES[state.currentBiome] || state.currentBiome}`); setTimeout(() => setMessage(null), 2000);
  };

  // --- Game Loop ---
  const gameLoop = () => {
    if (!gameState.current || !canvasRef.current) { reqRef.current = requestAnimationFrame(gameLoop); return; }
    const state = gameState.current; const ctx = canvasRef.current.getContext('2d'); if (!ctx) return;
    if (!state.isPaused && activeMenu === 'none') {
      state.gameTime++;
      const p = state.player;
      let dx = 0, dy = 0, spd = p.speed;
      if (input.current.keys['w'] || input.current.keys['arrowup']) dy = -spd;
      if (input.current.keys['s'] || input.current.keys['arrowdown']) dy = spd;
      if (input.current.keys['a'] || input.current.keys['arrowleft']) dx = -spd;
      if (input.current.keys['d'] || input.current.keys['arrowright']) dx = spd;
      if (dx > 0) p.direction = 0; if (dx < 0) p.direction = 2; if (dy > 0) p.direction = 1; if (dy < 0) p.direction = 3;
      if (dx !== 0 && dy !== 0) { dx *= 0.707; dy *= 0.707; } // Normalize diagonal
      p.vx = dx; p.vy = dy;

      if (dx !== 0 || dy !== 0) {
        const nextPos = resolveMapCollision(p, dx, dy, state.map);
        
        // Check for Teleport Tiles
        const tileX = Math.floor((nextPos.x + p.width/2) / 32);
        const tileY = Math.floor((nextPos.y + p.height/2) / 32);
        const tile = state.map[tileY]?.[tileX];
        
        if (tile && tile.teleportTo) {
           switchLocation(tile.teleportTo);
           return; // Skip rest of movement frame
        }

        p.x = nextPos.x; p.y = nextPos.y;
        
        // World Map Edge Wrapping (Simplified: Block for now on World Map edges)
        /*
        const maxX = state.map[0].length * 32;
        const maxY = state.map.length * 32;
        if (p.x < 0) p.x = 0;
        if (p.y < 0) p.y = 0;
        if (p.x > maxX - p.width) p.x = maxX - p.width;
        if (p.y > maxY - p.height) p.y = maxY - p.height;
        */
      }

      // Collisions & Interaction
      state.droppedItems.forEach(drop => {
        if (checkCollision(p, drop)) {
          drop.dead = true; p.inventory.push(drop.item);
          state.floatingTexts.push({ id: crypto.randomUUID(), x: p.x, y: p.y - 20, width:0, height:0, color: drop.item.color, type: 'text', dead: false, text: drop.item.name, life: 60 });
          setMessage(`拾った：${drop.item.name}`); setTimeout(() => setMessage(null), 2000);
        }
      });

      // Attack Logic
      const now = Date.now();
      if ((input.current.keys[' '] || input.current.mouse.down) && now - p.lastAttackTime > p.attackCooldown) {
        p.lastAttackTime = now; p.isAttacking = true; setTimeout(() => { if(gameState.current) gameState.current.player.isAttacking = false; }, 200);
        const attackRect = { x: p.x + p.width/2 - 30, y: p.y + p.height/2 - 30, width: 60, height: 60 } as Entity;
        state.enemies.forEach(e => {
          if (checkCollision(attackRect, e)) {
            const dmg = Math.max(1, Math.floor((p.attack - e.defense/2) * (0.9 + Math.random() * 0.2))); e.hp -= dmg;
            state.floatingTexts.push({ id: crypto.randomUUID(), x: e.x + e.width/2, y: e.y, width:0, height:0, color: '#fff', type: 'text', dead: false, text: `-${dmg}`, life: 30 });
            const angle = Math.atan2(e.y - p.y, e.x - p.x); e.x += Math.cos(angle) * 10; e.y += Math.sin(angle) * 10;
            if (e.hp <= 0) {
              e.dead = true; p.xp += e.xpValue; p.gold += Math.floor(Math.random() * 5) + 1;
              state.floatingTexts.push({ id: crypto.randomUUID(), x: e.x + e.width/2, y: e.y, width:0, height:0, color: '#ffd700', type: 'text', dead: false, text: `+${e.xpValue} XP`, life: 45 });
              if (p.xp >= p.nextLevelXp) {
                p.level++; p.xp -= p.nextLevelXp; p.nextLevelXp = Math.floor(p.nextLevelXp * 1.5); p.statPoints += 3; updatePlayerStats(p); p.hp = p.maxHp;
                state.floatingTexts.push({ id: crypto.randomUUID(), x: p.x, y: p.y - 40, width:0, height:0, color: '#00ff00', type: 'text', dead: false, text: "LEVEL UP!", life: 90 });
                setMessage("レベルアップ！Cキーで能力値を割り振れます。");
              }
              const dropChance = GAME_CONFIG.BASE_DROP_RATE * (e.rank === 'Boss' ? 5 : e.rank === 'Elite' ? 2 : 1);
              if (Math.random() < dropChance) {
                const item = generateRandomItem(e.level, e.rank === 'Boss' ? 5 : e.rank === 'Elite' ? 2 : 0);
                if (item) state.droppedItems.push({ id: crypto.randomUUID(), type: 'drop', x: e.x, y: e.y, width: 32, height: 32, color: item.color, item, life: 3000, bounceOffset: Math.random() * 10, dead: false });
              }
            }
          }
        });
      }

      // Enemy AI
      state.enemies.forEach(e => {
        if (e.dead) return;
        const dist = Math.sqrt((p.x - e.x)**2 + (p.y - e.y)**2);
        if (dist < e.detectionRange) {
          const angle = Math.atan2(p.y - e.y, p.x - e.x);
          e.direction = Math.abs(Math.cos(angle)) > Math.abs(Math.sin(angle)) ? (Math.cos(angle) > 0 ? 0 : 2) : (Math.sin(angle) > 0 ? 1 : 3);
          const nextX = e.x + Math.cos(angle) * e.speed, nextY = e.y + Math.sin(angle) * e.speed;
          if (!state.map[Math.floor(nextY/32)]?.[Math.floor(nextX/32)]?.solid && dist > 30) { e.x = nextX; e.y = nextY; e.vx = Math.cos(angle) * e.speed; e.vy = Math.sin(angle) * e.speed; } else { e.vx=0; e.vy=0; }
          if (dist < 40 && now - e.lastAttackTime > e.attackCooldown) {
            e.lastAttackTime = now; const dmg = Math.max(1, Math.floor(e.attack - p.defense/2)); p.hp -= dmg;
            state.floatingTexts.push({ id: crypto.randomUUID(), x: p.x + p.width/2, y: p.y, width:0, height:0, color: '#ff0000', type: 'text', dead: false, text: `-${dmg}`, life: 30 });
            if (p.hp <= 0) { 
               // Respawn logic or Game Over
               p.hp = p.maxHp; 
               switchLocation('world');
               p.x=(GAME_CONFIG.MAP_WIDTH*32)/2; p.y=(GAME_CONFIG.MAP_HEIGHT*32)/2; 
               setMessage("死んでしまった！ワールドマップに戻ります。"); 
               setTimeout(() => setMessage(null), 3000); 
            }
          }
        }
      });

      // Spawning (Only in World Map or Dungeon, not Town)
      if (state.currentBiome !== 'Town' && state.enemies.length < 15 && Math.random() < GAME_CONFIG.ENEMY_SPAWN_RATE) {
        let sx, sy, dist; do { sx = Math.random() * (state.map[0].length * 32); sy = Math.random() * (state.map.length * 32); dist = Math.sqrt((sx - p.x)**2 + (sy - p.y)**2); } while (dist < 500);
        state.enemies.push(generateEnemy(sx, sy, state.wave + Math.abs(state.worldX) + Math.abs(state.worldY)));
      }
      state.enemies = state.enemies.filter(e => !e.dead); state.droppedItems = state.droppedItems.filter(d => !d.dead);
      state.floatingTexts.forEach(t => { t.y -= 0.5; t.life--; }); state.floatingTexts = state.floatingTexts.filter(t => t.life > 0);
    }
    renderGame(ctx, state, loadedAssets);
    if (state.gameTime % 10 === 0) setUiState({...state.player});
    reqRef.current = requestAnimationFrame(gameLoop);
  };
  useEffect(() => { if (screen === 'game') gameLoop(); return () => { if (reqRef.current) cancelAnimationFrame(reqRef.current); } }, [screen]);

  // --- UI Handlers ---
  const saveGame = async () => {
    if (!gameState.current || !user || !db) return;
    setIsSaving(true);
    const data = { player: gameState.current.player, worldX: gameState.current.worldX, worldY: gameState.current.worldY, savedChunks: gameState.current.savedChunks, wave: gameState.current.wave, locationId: gameState.current.locationId };
    try { await setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'saves', 'slot1'), data); setSaveData(data); setMessage("クラウドに保存しました！"); } catch(e) { console.error("Save failed", e); setMessage("保存に失敗しました！"); } finally { setIsSaving(false); setTimeout(() => setMessage(null), 2000); }
  };

  const handleEquip = (item: Item) => {
    if (!gameState.current) return;
    const p = gameState.current.player;
    let slot: keyof PlayerEntity['equipment'] = 'mainHand';
    if (item.type === 'Helm') slot = 'helm'; if (item.type === 'Armor') slot = 'armor'; if (item.type === 'Boots') slot = 'boots'; if (item.type === 'Shield') slot = 'offHand';
    if (item.type === 'Weapon') {
      const current = p.equipment.mainHand; if (current) p.inventory.push(current); p.equipment.mainHand = item;
      if (item.subType === 'TwoHanded' || item.subType === 'DualWield') { const off = p.equipment.offHand; if (off) { p.inventory.push(off); p.equipment.offHand = undefined; } }
    } else if (item.type === 'Shield') {
      const mh = p.equipment.mainHand; if (mh && (mh.subType === 'TwoHanded' || mh.subType === 'DualWield')) { setMessage("両手武器と盾は同時に装備できません！"); setTimeout(() => setMessage(null), 2000); return; }
      const current = p.equipment.offHand; if (current) p.inventory.push(current); p.equipment.offHand = item;
    } else { const current = p.equipment[slot]; if (current) p.inventory.push(current); p.equipment[slot] = item; }
    p.inventory = p.inventory.filter(i => i.id !== item.id); updatePlayerStats(p); setUiState({...p});
  };

  const handleUnequip = (slot: keyof PlayerEntity['equipment']) => {
    if (!gameState.current) return;
    const p = gameState.current.player;
    const item = p.equipment[slot];
    if (item) { p.inventory.push(item); p.equipment[slot] = undefined; updatePlayerStats(p); setUiState({...p}); }
  };

  const increaseStat = (attr: keyof Attributes) => {
    if (!gameState.current) return;
    const p = gameState.current.player;
    if (p.statPoints > 0) { p.attributes[attr]++; p.statPoints--; updatePlayerStats(p); setUiState({...p}); }
  };

  // --- Render ---
  if (!isConfigValid) return <div className="w-full h-screen bg-slate-900 flex flex-col items-center justify-center text-white p-8"><AlertTriangle size={64} className="text-red-500 mb-4" /><h2 className="text-2xl font-bold mb-2">設定エラー</h2></div>;
  if (screen === 'auth') return <div className="w-full h-screen bg-slate-900 flex flex-col items-center justify-center text-white"><Loader className="animate-spin text-yellow-500 mb-4" size={48} /><h2 className="text-xl">{loadingMessage}</h2></div>;
  
  if (screen === 'title') return (
    <TitleScreen 
      onStart={() => setScreen('job_select')} 
      onContinue={() => startGame('Swordsman', 'Male', true)} 
      canContinue={!!saveData} 
      resolution={resolution}
      setResolution={setResolution}
    />
  );
  
  if (screen === 'job_select') return <JobSelectScreen onBack={() => setScreen('title')} onSelect={(j, g) => startGame(j, g)} loadedAssets={loadedAssets} />;

  return (
    <div className="w-full h-screen bg-black flex items-center justify-center overflow-hidden relative" onContextMenu={e => e.preventDefault()}>
      <canvas ref={canvasRef} width={viewportSize.width} height={viewportSize.height} className="bg-black shadow-2xl cursor-crosshair" />
      {uiState && <GameHUD uiState={uiState} worldInfo={worldInfo} toggleMenu={(m) => setActiveMenu(activeMenu === m ? 'none' : m)} />}
      {message && <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-black/80 text-white px-6 py-2 rounded-full border border-yellow-500/50 animate-bounce">{message}</div>}
      
      {activeMenu !== 'none' && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50 p-8">
          {activeMenu === 'status' && (
            <div className="bg-slate-800 p-8 rounded-lg border border-slate-600 min-w-[300px] text-white">
              <h2 className="text-2xl font-bold mb-6 text-center border-b border-slate-600 pb-2">メニュー</h2>
              
              <div className="mb-6">
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2 flex items-center gap-2">
                  <Monitor size={14} /> Screen Size
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'AUTO', val: 'auto' }, 
                    { label: 'SVGA (800x600)', val: '800x600' },
                    { label: 'XGA (1024x768)', val: '1024x768' },
                    { label: 'HD (1280x720)', val: '1280x720' }
                  ].map(opt => (
                    <button 
                      key={opt.val}
                      onClick={() => setResolution(opt.val as ResolutionMode)}
                      className={`px-3 py-2 text-xs rounded border transition-colors ${
                        resolution === opt.val 
                          ? 'bg-yellow-600 border-yellow-500 text-white' 
                          : 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <button onClick={saveGame} disabled={isSaving} className="w-full py-3 bg-blue-700 hover:bg-blue-600 rounded font-bold flex items-center justify-center gap-2">{isSaving ? <Loader className="animate-spin" size={18} /> : <Save size={18} />}{isSaving ? '保存中...' : 'ゲームを保存'}</button>
                <button onClick={() => { setScreen('title'); setActiveMenu('none'); }} className="w-full py-3 bg-red-900/50 hover:bg-red-900 rounded border border-red-800 text-red-100 mt-8">タイトルに戻る</button>
                <button onClick={() => setActiveMenu('none')} className="w-full py-2 text-slate-400 hover:text-white mt-2">閉じる</button>
              </div>
            </div>
          )}
          {activeMenu === 'stats' && uiState && (
            <div className="bg-slate-900 border border-slate-600 rounded-lg w-[500px] p-6 text-white shadow-2xl relative">
              <button onClick={() => setActiveMenu('none')} className="absolute top-4 right-4 p-1 hover:bg-slate-700 rounded"><X /></button>
              <h2 className="text-2xl font-bold mb-4 text-yellow-500 flex items-center gap-2"><User /> ステータス</h2>
              <div className="flex justify-between items-end mb-6 border-b border-slate-700 pb-4"><div><div className="text-3xl font-bold">{uiState.job}</div><div className="text-slate-400">レベル {uiState.level}</div></div><div className="text-right"><div className="text-sm text-slate-400">残りポイント</div><div className="text-3xl font-bold text-yellow-400">{uiState.statPoints}</div></div></div>
              <div className="space-y-4 mb-6">
                {[ { key: 'vitality', label: '体力', desc: '最大HPが増加' }, { key: 'strength', label: '筋力', desc: '物理攻撃力が増加' }, { key: 'dexterity', label: '器用さ', desc: '攻撃速度が増加' }, { key: 'intelligence', label: '知力', desc: '最大MPと魔法攻撃力が増加' }, { key: 'endurance', label: '耐久', desc: '防御力が増加' }, ].map((stat) => (
                  <div key={stat.key} className="flex items-center justify-between bg-slate-800 p-3 rounded">
                    <div><div className="font-bold text-lg">{stat.label}</div><div className="text-xs text-slate-500">{stat.desc}</div></div>
                    <div className="flex items-center gap-4"><span className="text-2xl font-mono">{uiState.attributes[stat.key as keyof Attributes]}</span><button onClick={() => increaseStat(stat.key as keyof Attributes)} disabled={uiState.statPoints <= 0} className={`w-8 h-8 rounded flex items-center justify-center font-bold text-xl ${uiState.statPoints > 0 ? 'bg-yellow-600 hover:bg-yellow-500 text-white' : 'bg-slate-700 text-slate-500 cursor-not-allowed'}`}>+</button></div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {activeMenu === 'inventory' && uiState && <InventoryMenu uiState={uiState} onEquip={handleEquip} onUnequip={handleUnequip} onClose={() => setActiveMenu('none')} />}
        </div>
      )}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/30 text-xs pointer-events-none">Quest of Harvest v1.8.0</div>
    </div>
  );
}
