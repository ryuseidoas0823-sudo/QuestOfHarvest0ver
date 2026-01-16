import { useEffect, useRef, useState, useMemo } from 'react';
import { Save, Play, ShoppingBag, X, User, Compass, Loader, Settings, ArrowLeft, AlertTriangle } from 'lucide-react';
import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, User as FirebaseUser, signInWithCustomToken, Auth } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, Firestore } from 'firebase/firestore';

/**
 * ==========================================
 * FIREBASE 設定エリア
 * ==========================================
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
    if (parsedConfig && parsedConfig.apiKey) {
      firebaseConfig = parsedConfig;
    }
  } catch (e) {
    console.error("Config Parse Error", e);
  }
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
  } catch (e) {
    console.error("Firebase Initialization Error:", e);
  }
}

/**
 * ==========================================
 * アセット (SVG ドット絵)
 * ==========================================
 */
const ASSETS_SVG = {
  Slime: `
  <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 14h8v1H4z" fill="rgba(0,0,0,0.3)" />
    <path d="M6 14h4v-1h3v-2h1v-5h-1v-1h-1v-1h-1v-1H5v1H4v1H3v1H2v5h1v2h3v1z" fill="#76ff03" />
    <path d="M5 8h2v2H5zm0 0h1v1h-1z" fill="#000" /><path d="M6 8h1v1H6z" fill="#fff" />
    <path d="M9 8h2v2H9zm0 0h1v1h-1z" fill="#000" /><path d="M10 8h1v1h-1z" fill="#fff" />
    <path d="M6 5h2v1H6zm-1 1h1v2H5z" fill="#ccff90" opacity="0.5" />
  </svg>`,
  
  Bandit: `
  <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 14h8v1H4z" fill="rgba(0,0,0,0.3)" />
    <path d="M5 2h6v4H5z" fill="#5d4037" />
    <path d="M6 5h4v1H6z" fill="#000" opacity="0.8" />
    <path d="M6 6h4v1H6z" fill="#ffccaa" />
    <path d="M5 7h6v5H5z" fill="#8d6e63" />
    <path d="M5 12h2v4H5zm4 0h2v4H9z" fill="#3e2723" />
    <path d="M11 9h3v1h-3z" fill="#cfd8dc" />
    <path d="M11 9h1v3h-1z" fill="#5d4037" />
  </svg>`,

  Zombie: `
  <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 14h8v1H4z" fill="rgba(0,0,0,0.3)" />
    <path d="M5 2h6v3H5z" fill="#6d4c41" />
    <path d="M5 5h6v3H5z" fill="#81c784" />
    <path d="M6 6h1v1H6zm4 0h1v1h-1z" fill="#000" />
    <path d="M4 8h8v5H4z" fill="#5d4037" />
    <path d="M4 8h2v2H4zm6 0h2v2h-2z" fill="#4e342e" />
    <path d="M5 13h2v3H5zm4 0h2v3H9z" fill="#3e2723" />
    <path d="M2 8h3v2H2zm9 0h3v2h-3z" fill="#81c784" />
  </svg>`,

  Insect: `
  <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 14h12v1H2z" fill="rgba(0,0,0,0.3)" />
    <path d="M3 8h4v4H3z" fill="#3e2723" />
    <path d="M7 9h2v2H7z" fill="#5d4037" />
    <path d="M9 7h4v4H9z" fill="#3e2723" />
    <path d="M12 8h1v1h-1z" fill="#ffeb3b" />
    <path d="M4 12h1v2H4zm3 0h1v2H7zm4 0h1v2h-1z" fill="#000" />
    <path d="M13 7h2v-2h-2z" fill="#000" opacity="0.5" />
  </svg>`,

  Demon: `
  <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 14h8v1H4z" fill="rgba(0,0,0,0.3)" />
    <path d="M5 3h1v2H5zm5 0h1v2h-1z" fill="#ffd700" />
    <path d="M5 5h6v3H5z" fill="#e57373" />
    <path d="M6 6h1v1H6zm4 0h1v1h-1z" fill="#000" />
    <path d="M4 8h8v5H4z" fill="#b71c1c" />
    <path d="M2 7h3v2H2zm9 0h3v4h-1v-2h-2z" fill="#b71c1c" />
    <path d="M13 7h1v5h-1z" fill="#000" />
    <path d="M5 13h2v3H5zm4 0h2v3H9z" fill="#3e2723" />
  </svg>`,

  Bat: `
  <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 14h4v1H6z" fill="rgba(0,0,0,0.3)" />
    <path d="M7 6h2v2H7z" fill="#4a148c" />
    <path d="M2 5h5v4H6V8H5V7H4V6H2z" fill="#7b1fa2" />
    <path d="M9 5h5v1h-2v1h-1v1h-1v1H9z" fill="#7b1fa2" />
    <path d="M7 7h1v1H7zm1 0h1v1H8z" fill="#fff" />
  </svg>`,

  Dragon: `
  <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 14h10v1H3z" fill="rgba(0,0,0,0.3)" />
    <path d="M6 3h4v4H6z" fill="#00695c" />
    <path d="M7 4h1v1H7zm2 0h1v1H9z" fill="#ffeb3b" />
    <path d="M5 7h6v6H5z" fill="#004d40" />
    <path d="M2 6h3v4H4V9H3V8H2z" fill="#4db6ac" />
    <path d="M11 6h3v1h-1v1h-1v2h-1z" fill="#4db6ac" />
    <path d="M5 13h2v3H5zm4 0h2v3H9z" fill="#004d40" />
    <path d="M4 10h-2v2h2z" fill="#004d40" />
  </svg>`,

  Beast: `
  <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 14h10v1H3z" fill="rgba(0,0,0,0.3)" />
    <path d="M3 6h10v6H3z" fill="#5d4037" />
    <path d="M2 5h4v4H2z" fill="#4e342e" />
    <path d="M3 6h1v1H3z" fill="#fff" />
    <path d="M2 8h1v1H2z" fill="#fff" />
    <path d="M4 12h2v4H4zm6 0h2v4h-2z" fill="#3e2723" />
  </svg>`,

  Wolf: `
  <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 14h10v1H3z" fill="rgba(0,0,0,0.3)" />
    <path d="M4 7h8v5H4z" fill="#757575" />
    <path d="M2 6h4v3H2z" fill="#616161" />
    <path d="M3 5h1v1H3z" fill="#616161" />
    <path d="M3 7h1v1H3z" fill="#fff" />
    <path d="M12 8h2v2h-2z" fill="#757575" />
    <path d="M4 12h2v4H4zm6 0h2v4h-2z" fill="#424242" />
  </svg>`,

  Ghost: `
  <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
    <path d="M5 14h6v1H5z" fill="rgba(0,0,0,0.1)" />
    <path d="M5 4h6v8H5z" fill="#eceff1" opacity="0.8" />
    <path d="M4 6h1v6H4zm7 0h1v6h-1z" fill="#eceff1" opacity="0.6" />
    <path d="M6 6h1v1H6zm3 0h1v1H9z" fill="#000" />
    <path d="M5 12h1v2H5zm2-1h2v2H7zm3 1h1v2h-1z" fill="#eceff1" opacity="0.8" />
  </svg>`,

  Swordsman_Male: `
  <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 14h8v1H4z" fill="rgba(0,0,0,0.3)" />
    <path d="M5 2h6v3H5z" fill="#ffd700" />
    <path d="M5 5h6v3H5z" fill="#ffccaa" />
    <path d="M6 6h1v1H6zm4 0h1v1h-1z" fill="#000" />
    <path d="M4 8h8v5H4z" fill="#1565c0" />
    <path d="M6 9h4v4H6z" fill="#64b5f6" opacity="0.3" />
    <path d="M5 13h2v3H5zm4 0h2v3H9z" fill="#424242" />
    <path d="M12 5h1v3h-1z" fill="#bdbdbd" />
    <path d="M11 8h3v1h-3z" fill="#5d4037" />
    <path d="M12 9h1v2h-1z" fill="#5d4037" />
  </svg>`,

  Swordsman_Female: `
  <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 14h8v1H4z" fill="rgba(0,0,0,0.3)" />
    <path d="M4 2h8v6H4z" fill="#ffab00" />
    <path d="M5 5h6v3H5z" fill="#ffccaa" />
    <path d="M6 6h1v1H6zm4 0h1v1h-1z" fill="#000" />
    <path d="M5 8h6v4H5z" fill="#1565c0" />
    <path d="M4 12h8v2H4z" fill="#0d47a1" />
    <path d="M5 14h2v2H5zm4 0h2v2H9z" fill="#424242" />
    <path d="M12 5h1v3h-1z" fill="#bdbdbd" />
    <path d="M11 8h3v1h-3z" fill="#5d4037" />
    <path d="M12 9h1v2h-1z" fill="#5d4037" />
  </svg>`,

  Warrior_Male: `
  <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 14h10v1H3z" fill="rgba(0,0,0,0.3)" />
    <path d="M5 2h6v3H5z" fill="#5d4037" />
    <path d="M4 3h1v2H4zm7 0h1v2h-1z" fill="#bcaaa4" />
    <path d="M5 5h6v3H5z" fill="#d7ccc8" />
    <path d="M6 6h1v1H6zm4 0h1v1h-1z" fill="#000" />
    <path d="M3 8h10v5H3z" fill="#3e2723" />
    <path d="M5 9h6v3H5z" fill="#5d4037" />
    <path d="M4 13h3v3H4zm5 0h3v3H9z" fill="#212121" />
    <path d="M13 4h2v4h-2z" fill="#757575" />
    <path d="M14 8h1v5h-1z" fill="#5d4037" />
  </svg>`,

  Warrior_Female: `
  <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 14h10v1H3z" fill="rgba(0,0,0,0.3)" />
    <path d="M5 2h6v2H5z" fill="#cfd8dc" />
    <path d="M3 3h2v2H3zm6 0h2v2H9z" fill="#fff" />
    <path d="M5 4h6v7H5z" fill="#fdd835" />
    <path d="M5 5h6v3H5z" fill="#ffccaa" />
    <path d="M6 6h1v1H6zm4 0h1v1h-1z" fill="#000" />
    <path d="M5 8h6v4H5z" fill="#b71c1c" />
    <path d="M5 12h2v4H5zm4 0h2v4H9z" fill="#4a148c" />
    <path d="M13 5h2v3h-2z" fill="#90a4ae" />
    <path d="M14 8h1v5h-1z" fill="#5d4037" />
  </svg>`,

  Archer_Male: `
  <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 14h8v1H4z" fill="rgba(0,0,0,0.3)" />
    <path d="M5 2h6v4H5z" fill="#33691e" />
    <path d="M5 5h6v3H5z" fill="#ffccaa" />
    <path d="M6 6h1v1H6zm4 0h1v1h-1z" fill="#000" />
    <path d="M5 8h6v5H5z" fill="#558b2f" />
    <path d="M6 9h4v3H6z" fill="#7cb342" />
    <path d="M5 13h2v3H5zm4 0h2v3H9z" fill="#3e2723" />
    <path d="M12 6h1v6h-1z" fill="#8d6e63" />
    <path d="M12 6h-1v1h1zm-1 5h1v1h-1z" fill="#8d6e63" />
  </svg>`,

  Archer_Female: `
  <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 14h8v1H4z" fill="rgba(0,0,0,0.3)" />
    <path d="M5 2h6v3H5z" fill="#a1887f" />
    <path d="M11 3h2v3h-2z" fill="#a1887f" />
    <path d="M5 5h6v3H5z" fill="#ffccaa" />
    <path d="M6 6h1v1H6zm4 0h1v1h-1z" fill="#000" />
    <path d="M5 8h6v4H5z" fill="#33691e" />
    <path d="M5 12h2v4H5zm4 0h2v4H9z" fill="#5d4037" />
    <path d="M12 6h1v6h-1z" fill="#8d6e63" />
    <path d="M12 6h-1v1h1zm-1 5h1v1h-1z" fill="#8d6e63" />
  </svg>`,

  Mage_Male: `
  <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 14h8v1H4z" fill="rgba(0,0,0,0.3)" />
    <path d="M4 4h8v1H4z" fill="#311b92" />
    <path d="M5 1h6v3H5z" fill="#311b92" />
    <path d="M5 5h6v3H5z" fill="#ffccaa" />
    <path d="M6 6h1v1H6zm4 0h1v1h-1z" fill="#000" />
    <path d="M4 8h8v6H4z" fill="#4527a0" />
    <path d="M6 8h4v6H6z" fill="#673ab7" />
    <path d="M13 5h1v8h-1z" fill="#8d6e63" />
    <path d="M12 4h3v1h-3z" fill="#ffeb3b" />
  </svg>`,

  Mage_Female: `
  <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 14h8v1H4z" fill="rgba(0,0,0,0.3)" />
    <path d="M3 4h10v1H3z" fill="#ad1457" />
    <path d="M5 1h6v3H5z" fill="#ad1457" />
    <path d="M4 5h8v4H4z" fill="#f48fb1" />
    <path d="M5 5h6v3H5z" fill="#ffccaa" />
    <path d="M6 6h1v1H6zm4 0h1v1h-1z" fill="#000" />
    <path d="M5 8h6v6H5z" fill="#880e4f" />
    <path d="M13 5h1v8h-1z" fill="#8d6e63" />
    <path d="M12 4h3v1h-3z" fill="#00e676" />
  </svg>`
};

const svgToUrl = (svgString: string) => 
  "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svgString.trim());

/**
 * ==========================================
 * 定数 & 設定
 * ==========================================
 */
const GAME_CONFIG = {
  TILE_SIZE: 32,
  MAP_WIDTH: 40,
  MAP_HEIGHT: 30,
  PLAYER_SPEED: 5,
  ENEMY_SPAWN_RATE: 0.02,
  BASE_DROP_RATE: 0.2,
};

const THEME = {
  colors: {
    ground: '#1a1a1a',
    grass: '#1e2b1e',
    wall: '#424242',
    water: '#1a237e',
    townFloor: '#5d4037',
    player: '#d4af37',
    enemy: '#8b0000',
    text: '#c0c0c0',
    highlight: '#ffd700',
    rarity: {
      Common: '#ffffff',
      Uncommon: '#1eff00',
      Rare: '#0070dd',
      Epic: '#a335ee',
      Legendary: '#ff8000',
    }
  }
};

/**
 * ==========================================
 * 型定義
 * ==========================================
 */
type TileType = 'grass' | 'dirt' | 'wall' | 'water' | 'floor' | 'portal_out' | 'town_entrance' | 'sand' | 'snow' | 'rock';
interface Tile { x: number; y: number; type: TileType; solid: boolean; }
type EntityType = 'player' | 'enemy' | 'npc' | 'projectile' | 'particle' | 'text' | 'drop';
type Job = 'Swordsman' | 'Warrior' | 'Archer' | 'Mage';
type Gender = 'Male' | 'Female';
type ShapeType = 'humanoid' | 'beast' | 'slime' | 'large' | 'insect' | 'ghost' | 'demon' | 'dragon' | 'flying';
type Biome = 'Plains' | 'Forest' | 'Desert' | 'Snow' | 'Wasteland' | 'Town';

type Rarity = 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary';
type EquipmentType = 'Weapon' | 'Helm' | 'Armor' | 'Shield' | 'Boots';
type WeaponStyle = 'OneHanded' | 'TwoHanded' | 'DualWield';

interface Enchantment {
  type: 'Attack' | 'Defense' | 'Speed' | 'MaxHp';
  value: number;
  strength: 'Weak' | 'Medium' | 'Strong';
  name: string;
}

interface Item {
  id: string;
  name: string;
  type: EquipmentType;
  subType?: WeaponStyle;
  rarity: Rarity;
  level: number;
  stats: {
    attack: number;
    defense: number;
    speed: number;
    maxHp: number;
  };
  enchantments: Enchantment[];
  icon: string;
  color: string;
}

interface Entity {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  visualWidth?: number;
  visualHeight?: number;
  color: string;
  type: EntityType;
  dead: boolean;
  vx?: number;
  vy?: number;
}

interface DroppedItem extends Entity {
  type: 'drop';
  item: Item;
  life: number;
  bounceOffset: number;
}

interface CombatEntity extends Entity {
  hp: number;
  maxHp: number;
  level: number;
  attack: number;
  defense: number;
  speed: number;
  lastAttackTime: number;
  attackCooldown: number;
  isAttacking?: boolean;
  direction: number;
  shape?: ShapeType;
}

interface Attributes {
  vitality: number;
  strength: number;
  dexterity: number;
  intelligence: number;
  endurance: number;
}

interface PlayerEntity extends CombatEntity {
  job: Job;
  gender: Gender;
  xp: number;
  nextLevelXp: number;
  gold: number;
  maxMp: number;
  mp: number;
  statPoints: number;
  attributes: Attributes;
  
  inventory: Item[];
  equipment: {
    mainHand?: Item;
    offHand?: Item;
    helm?: Item;
    armor?: Item;
    boots?: Item;
  };
  calculatedStats: {
    maxHp: number;
    maxMp: number;
    attack: number;
    defense: number;
    speed: number;
  };
}

interface EnemyEntity extends CombatEntity {
  targetId?: string;
  detectionRange: number;
  race: string;
  xpValue: number;
  rank: 'Normal' | 'Elite' | 'Boss';
}

interface Particle extends Entity {
  life: number;
  maxLife: number;
  size: number;
}

interface FloatingText extends Entity {
  text: string;
  life: number;
  color: string;
}

interface Projectile extends Entity {
  damage: number;
  ownerId: string;
  life: number;
}

interface ChunkData {
  map: Tile[][];
  enemies: EnemyEntity[];
  droppedItems: DroppedItem[];
  biome: Biome;
}

interface GameState {
  worldX: number;
  worldY: number;
  currentBiome: Biome;
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
}

/**
 * ==========================================
 * アイテム生成
 * ==========================================
 */
const RARITY_MULTIPLIERS = { Common: 1.0, Uncommon: 1.2, Rare: 1.5, Epic: 2.0, Legendary: 3.0 };
const ENCHANT_SLOTS = { Common: 0, Uncommon: 1, Rare: 2, Epic: 3, Legendary: 5 };

const ITEM_BASE_NAMES = {
  Weapon: { OneHanded: '剣', TwoHanded: '大剣', DualWield: '双剣' },
  Helm: '兜',
  Armor: '板金鎧',
  Shield: '盾',
  Boots: '具足'
};

const ICONS = {
  Weapon: { OneHanded: '⚔️', TwoHanded: '🗡️', DualWield: '⚔️' },
  Helm: '🪖',
  Armor: '🛡️',
  Shield: '🛡️',
  Boots: '👢'
};

const generateRandomItem = (level: number, rankBonus: number = 0): Item | null => {
  let roll = Math.random() * 100 - rankBonus * 5;
  let rarity: Rarity = 'Common';
  if (roll < 1) rarity = 'Legendary';
  else if (roll < 5) rarity = 'Epic';
  else if (roll < 15) rarity = 'Rare';
  else if (roll < 40) rarity = 'Uncommon';

  const types: EquipmentType[] = ['Weapon', 'Helm', 'Armor', 'Shield', 'Boots'];
  const type = types[Math.floor(Math.random() * types.length)];
  let subType: WeaponStyle | undefined;
  
  if (type === 'Weapon') {
    const styles: WeaponStyle[] = ['OneHanded', 'TwoHanded', 'DualWield'];
    subType = styles[Math.floor(Math.random() * styles.length)];
  }

  const mult = RARITY_MULTIPLIERS[rarity];
  const baseVal = level * 2;
  
  const stats = { attack: 0, defense: 0, speed: 0, maxHp: 0 };

  if (type === 'Weapon') {
    stats.attack = Math.floor(baseVal * 3 * mult);
    if (subType === 'TwoHanded') stats.attack = Math.floor(stats.attack * 1.5);
    if (subType === 'DualWield') { stats.attack = Math.floor(stats.attack * 0.8); stats.speed = 1; }
  } else if (type === 'Armor') {
    stats.defense = Math.floor(baseVal * 2 * mult);
    stats.maxHp = Math.floor(baseVal * 5 * mult);
  } else if (type === 'Helm') {
    stats.defense = Math.floor(baseVal * 1 * mult);
    stats.maxHp = Math.floor(baseVal * 2 * mult);
  } else if (type === 'Shield') {
    stats.defense = Math.floor(baseVal * 2.5 * mult);
  } else if (type === 'Boots') {
    stats.defense = Math.floor(baseVal * 0.5 * mult);
    stats.speed = Number((0.2 * mult).toFixed(1));
  }

  const enchantCount = Math.floor(Math.random() * (ENCHANT_SLOTS[rarity] + 1));
  const enchantments: Enchantment[] = [];
  const enchantTypes = ['Attack', 'Defense', 'Speed', 'MaxHp'] as const;
  const strengths = ['Weak', 'Medium', 'Strong'] as const;

  for (let i = 0; i < enchantCount; i++) {
    const eType = enchantTypes[Math.floor(Math.random() * enchantTypes.length)];
    const strIdx = Math.floor(Math.random() * strengths.length);
    const strength = strengths[strIdx];
    
    let val = 0;
    if (eType === 'Attack') val = Math.floor(level * (strIdx + 1));
    else if (eType === 'Defense') val = Math.floor(level * (strIdx + 1));
    else if (eType === 'MaxHp') val = Math.floor(level * 5 * (strIdx + 1));
    else if (eType === 'Speed') val = Number((0.1 * (strIdx + 1)).toFixed(1));

    const jNames = { Weak: '微かな', Medium: '普通の', Strong: '強力な' };
    const jTypes = { Attack: '攻撃', Defense: '防御', Speed: '敏捷', MaxHp: '体力' };
    
    enchantments.push({ 
      type: eType, value: val, strength, 
      name: `${jNames[strength]}${jTypes[eType]}` 
    });

    if (eType === 'Attack') stats.attack += val;
    if (eType === 'Defense') stats.defense += val;
    if (eType === 'MaxHp') stats.maxHp += val;
    if (eType === 'Speed') stats.speed += val;
  }

  let name = rarity === 'Common' ? '' : `${rarity} `;
  // @ts-ignore
  if (type === 'Weapon') name += ITEM_BASE_NAMES[type][subType!];
  else name += ITEM_BASE_NAMES[type];

  return {
    id: crypto.randomUUID(),
    name, type, subType, rarity, level, stats, enchantments,
    icon: type === 'Weapon' ? ICONS.Weapon[subType!] : ICONS[type],
    color: THEME.colors.rarity[rarity]
  };
};

/**
 * ==========================================
 * データ & 生成
 * ==========================================
 */

const JOB_DATA: Record<Job, { attributes: Attributes, desc: string, icon: string }> = {
  Swordsman: { attributes: { vitality: 12, strength: 12, dexterity: 12, intelligence: 8, endurance: 11 }, icon: '⚔️', desc: 'バランスの取れた剣士。' },
  Warrior:   { attributes: { vitality: 14, strength: 16, dexterity: 9, intelligence: 6, endurance: 15 }, icon: '🪓', desc: '体力が高い強力な戦士。' },
  Archer:    { attributes: { vitality: 10, strength: 10, dexterity: 16, intelligence: 10, endurance: 10 }, icon: '🏹', desc: '素早い遠距離アタッカー。' },
  Mage:      { attributes: { vitality: 9, strength: 6, dexterity: 12, intelligence: 18, endurance: 8 }, icon: '🪄', desc: '魔法のスペシャリスト。' },
};

const createPlayer = (job: Job, gender: Gender): PlayerEntity => {
  const baseAttrs = JOB_DATA[job].attributes;
  return {
    id: 'player', type: 'player', x: 0, y: 0, width: 20, height: 20, visualWidth: 32, visualHeight: 56,
    color: THEME.colors.player, job, gender, shape: 'humanoid',
    hp: 100, maxHp: 100, mp: 50, maxMp: 50, attack: 10, defense: 0, speed: 4,
    level: 1, xp: 0, nextLevelXp: 100, gold: 0, statPoints: 0, attributes: { ...baseAttrs },
    dead: false, lastAttackTime: 0, attackCooldown: 500, direction: 1,
    inventory: [], equipment: {},
    calculatedStats: { maxHp: 100, maxMp: 50, attack: 10, defense: 0, speed: 4 }
  };
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

const generateEnemy = (x: number, y: number, level: number): EnemyEntity => {
  const type = ENEMY_TYPES[Math.floor(Math.random() * ENEMY_TYPES.length)];
  const rankRoll = Math.random();
  let rank: 'Normal' | 'Elite' | 'Boss' = 'Normal';
  let scale = 1 + (level * 0.1);
  let color = type.color;

  if (rankRoll < 0.05) { rank = 'Boss'; scale *= 3; color = '#ff0000'; }
  else if (rankRoll < 0.2) { rank = 'Elite'; scale *= 1.5; color = '#ffeb3b'; }

  return {
    id: `enemy_${crypto.randomUUID()}`,
    type: 'enemy', race: type.name, rank, x, y,
    width: type.w * (rank === 'Boss' ? 1.5 : 1), height: type.h * (rank === 'Boss' ? 1.5 : 1),
    visualWidth: type.vw! * (rank === 'Boss' ? 1.5 : 1), visualHeight: type.vh! * (rank === 'Boss' ? 1.5 : 1),
    color, shape: type.shape as ShapeType,
    hp: Math.floor(type.hp * scale), maxHp: Math.floor(type.hp * scale),
    attack: Math.floor(type.atk * scale), defense: Math.floor(level * 2), speed: type.spd,
    level, direction: 1, dead: false, lastAttackTime: 0, attackCooldown: 1000 + Math.random() * 500,
    detectionRange: 350, xpValue: Math.floor(type.xp * scale * (rank === 'Boss' ? 5 : rank === 'Elite' ? 2 : 1))
  };
};

const getBiome = (wx: number, wy: number): Biome => {
  if (wx === 0 && wy === 0) return 'Town';
  if (wy < -1) return 'Snow';
  if (wy > 1) return 'Desert';
  if (Math.abs(wx) > 2) return 'Wasteland';
  return 'Plains';
};

const BIOME_NAMES: Record<Biome, string> = {
  Plains: '平原',
  Forest: '森',
  Desert: '砂漠',
  Snow: '雪原',
  Wasteland: '荒野',
  Town: '街'
};

const generateChunk = (wx: number, wy: number): ChunkData => {
  const biome = getBiome(wx, wy);
  const width = GAME_CONFIG.MAP_WIDTH;
  const height = GAME_CONFIG.MAP_HEIGHT;
  
  const map: Tile[][] = Array(height).fill(null).map((_, y) => 
    Array(width).fill(null).map((_, x) => {
      let type: TileType = 'grass';
      
      if (biome === 'Snow') type = 'snow';
      if (biome === 'Desert') type = 'sand';
      if (biome === 'Wasteland') type = 'dirt';
      if (biome === 'Town') type = 'floor';

      if (biome !== 'Town' && Math.random() < 0.05) type = Math.random() > 0.5 ? 'dirt' : 'rock';

      return {
        x: x * GAME_CONFIG.TILE_SIZE,
        y: y * GAME_CONFIG.TILE_SIZE,
        type,
        solid: false
      };
    })
  );

  for(let y=0; y<height; y++) {
    for(let x=0; x<width; x++) {
      if (biome === 'Town') {
        if (x===0 || x===width-1 || y===0 || y===height-1) {
          if ((x === 0 || x === width-1) && Math.abs(y - height/2) < 3) { /* Gate */ }
          else if ((y === 0 || y === height-1) && Math.abs(x - width/2) < 3) { /* Gate */ }
          else {
            map[y][x].type = 'wall';
            map[y][x].solid = true;
          }
        }
      } else {
        if (Math.random() < 0.08 && x > 2 && x < width-2 && y > 2 && y < height-2) {
           map[y][x].type = 'wall';
           map[y][x].solid = true;
        }
        if (Math.random() < 0.05 && x > 2 && x < width-2 && y > 2 && y < height-2) {
           map[y][x].type = 'water';
           map[y][x].solid = true;
        }
      }
    }
  }

  return { map, enemies: [], droppedItems: [], biome };
};

/**
 * ==========================================
 * ロジック & 物理演算
 * ==========================================
 */

const checkCollision = (rect1: Entity, rect2: Entity) => {
  return (
    rect1.x < rect2.x + rect2.width &&
    rect1.x + rect1.width > rect2.x &&
    rect1.y < rect2.y + rect2.height &&
    rect1.y + rect1.height > rect2.y
  );
};

const resolveMapCollision = (entity: Entity, dx: number, dy: number, map: Tile[][]): {x: number, y: number} => {
  const T = GAME_CONFIG.TILE_SIZE;
  const nextX = entity.x + dx;
  const nextY = entity.y + dy;
  
  const startX = Math.floor(nextX / T);
  const endX = Math.floor((nextX + entity.width) / T);
  const startY = Math.floor(nextY / T);
  const endY = Math.floor((nextY + entity.height) / T);

  let collidedX = false;

  if (startX < 0 || endX >= GAME_CONFIG.MAP_WIDTH || startY < 0 || endY >= GAME_CONFIG.MAP_HEIGHT) {
    return { x: nextX, y: nextY };
  }

  for (let y = startY; y <= endY; y++) {
    for (let x = startX; x <= endX; x++) {
      if (map[y]?.[x]?.solid) collidedX = true;
    }
  }

  if (collidedX) return { x: entity.x, y: entity.y };
  return { x: nextX, y: nextY };
};

const updatePlayerStats = (player: PlayerEntity) => {
  const attr = player.attributes;
  
  let maxHp = attr.vitality * 10;
  let maxMp = attr.intelligence * 5;
  let baseAtk = Math.floor(attr.strength * 1.5 + attr.dexterity * 0.5);
  let baseDef = Math.floor(attr.endurance * 1.2);
  let baseSpd = 3 + (attr.dexterity * 0.05);

  let equipAtk = 0;
  let equipDef = 0;
  let equipSpd = 0;
  let equipHp = 0;

  Object.values(player.equipment).forEach(item => {
    if (item) {
      equipAtk += item.stats.attack;
      equipDef += item.stats.defense;
      equipSpd += item.stats.speed;
      equipHp += item.stats.maxHp;
    }
  });

  player.calculatedStats = {
    maxHp: maxHp + equipHp,
    maxMp: maxMp,
    attack: baseAtk + equipAtk,
    defense: baseDef + equipDef,
    speed: baseSpd + equipSpd
  };

  player.maxHp = player.calculatedStats.maxHp;
  player.maxMp = player.calculatedStats.maxMp;
  player.attack = player.calculatedStats.attack;
  player.defense = player.calculatedStats.defense;
  player.speed = player.calculatedStats.speed;

  if (player.hp > player.maxHp) player.hp = player.maxHp;
  if (player.mp > player.maxMp) player.mp = player.maxMp;
};

/**
 * ==========================================
 * レンダラー
 * ==========================================
 */
const renderGame = (
  ctx: CanvasRenderingContext2D, 
  state: GameState, 
  images: Record<string, HTMLImageElement>
) => {
  const { width, height } = ctx.canvas;
  const T = GAME_CONFIG.TILE_SIZE;

  ctx.fillStyle = '#111';
  ctx.fillRect(0, 0, width, height);

  ctx.save();
  const camX = Math.floor(state.player.x + state.player.width/2 - width/2);
  const camY = Math.floor(state.player.y + state.player.height/2 - height/2);
  ctx.translate(-camX, -camY);

  state.camera = { x: camX, y: camY };

  const startCol = Math.floor(camX / T);
  const endCol = startCol + (width / T) + 1;
  const startRow = Math.floor(camY / T);
  const endRow = startRow + (height / T) + 1;

  const rStart = Math.max(0, startRow);
  const rEnd = Math.min(GAME_CONFIG.MAP_HEIGHT - 1, endRow);
  const cStart = Math.max(0, startCol);
  const cEnd = Math.min(GAME_CONFIG.MAP_WIDTH - 1, endCol);

  for (let y = rStart; y <= rEnd; y++) {
    for (let x = cStart; x <= cEnd; x++) {
      const tile = state.map[y]?.[x];
      if (!tile) continue;

      switch(tile.type) {
        case 'grass': ctx.fillStyle = '#1b2e1b'; break;
        case 'dirt': ctx.fillStyle = '#3e2723'; break;
        case 'sand': ctx.fillStyle = '#fbc02d'; break;
        case 'snow': ctx.fillStyle = '#e3f2fd'; break;
        case 'rock': ctx.fillStyle = '#616161'; break;
        case 'wall': ctx.fillStyle = '#424242'; break;
        case 'water': ctx.fillStyle = '#1a237e'; break;
        case 'floor': ctx.fillStyle = '#5d4037'; break;
        default: ctx.fillStyle = '#000';
      }
      ctx.fillRect(tile.x, tile.y, T, T);
      
      ctx.strokeStyle = 'rgba(0,0,0,0.05)';
      ctx.strokeRect(tile.x, tile.y, T, T);
      
      if (tile.type === 'wall') {
        ctx.fillStyle = '#555';
        ctx.fillRect(tile.x, tile.y, T, T-4);
        ctx.fillStyle = '#333';
        ctx.fillRect(tile.x, tile.y+T-4, T, 4);
      }
    }
  }

  state.droppedItems.forEach(drop => {
    const bob = Math.sin(state.gameTime / 10) * 5 + drop.bounceOffset;
    ctx.shadowColor = drop.item.color;
    ctx.shadowBlur = 10;
    
    ctx.fillStyle = '#8d6e63';
    ctx.fillRect(drop.x + 8, drop.y + 8 + bob, 16, 16);
    ctx.fillStyle = drop.item.color;
    ctx.fillRect(drop.x + 8, drop.y + 12 + bob, 16, 4);
    
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(drop.item.icon, drop.x + 16, drop.y + 4 + bob);
    ctx.shadowBlur = 0;
  });

  const allEntities = [...state.enemies, state.player].sort((a, b) => (a.y + a.height) - (b.y + b.height));

  const renderCharacter = (e: CombatEntity, icon?: string) => {
    const vw = e.visualWidth || e.width;
    const vh = e.visualHeight || e.height;

    const centerX = e.x + e.width / 2;
    const bottomY = e.y + e.height;

    let imgKey: string | null = null;
    
    if (e.type === 'player') {
      const p = e as PlayerEntity;
      imgKey = `${p.job}_${p.gender}`; 
    } else if (e.type === 'enemy') {
      const raceName = (e as EnemyEntity).race;
      if (raceName.includes('Slime') || raceName.includes('Jelly')) imgKey = 'Slime';
      else if (raceName.includes('Bandit') || raceName.includes('Assassin') || raceName.includes('Mercenary')) imgKey = 'Bandit';
      else if (raceName.includes('Zombie') || raceName.includes('Ghoul')) imgKey = 'Zombie';
      else if (raceName.includes('Ant') || raceName.includes('Spider') || raceName.includes('Queen')) imgKey = 'Insect';
      else if (raceName.includes('Imp') || raceName.includes('Demon')) imgKey = 'Demon';
      else if (raceName.includes('Bat') || raceName.includes('Vampire')) imgKey = 'Bat';
      else if (raceName.includes('Dragon') || raceName.includes('Wyvern')) imgKey = 'Dragon';
      else if (raceName.includes('Boar') || raceName.includes('Grizzly') || raceName.includes('Chimera')) imgKey = 'Beast';
      else if (raceName.includes('Wolf') || raceName.includes('Hound') || raceName.includes('Cerberus')) imgKey = 'Wolf';
      else if (raceName.includes('Ghost') || raceName.includes('Wraith') || raceName.includes('Lich')) imgKey = 'Ghost';
    }

    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.beginPath();
    const shadowSize = (e.shape === 'flying' || e.shape === 'ghost') ? 0.8 : 1.2;
    ctx.ellipse(centerX, bottomY - 2, e.width/2 * shadowSize, 4, 0, 0, Math.PI*2);
    ctx.fill();

    if (imgKey && images[imgKey]) {
      const img = images[imgKey];
      
      const isMoving = Math.abs(e.vx || 0) > 0.1 || Math.abs(e.vy || 0) > 0.1;
      let scaleX = 1;
      let scaleY = 1;
      let offsetY = 0;

      if (isMoving) {
        const bounce = Math.sin(state.gameTime / 2); 
        scaleX = 1 + (bounce * 0.1);
        scaleY = 1 - (bounce * 0.1);
        if (bounce > 0) offsetY = -bounce * 5;
      }

      if (e.isAttacking) {
         scaleX = 1.2; 
         scaleY = 0.8;
      }

      const isLeft = e.direction === 2;

      const drawW = vw;
      const drawH = vh;
      
      ctx.save();
      ctx.translate(centerX, bottomY + offsetY);
      ctx.scale(isLeft ? -scaleX : scaleX, scaleY);
      ctx.drawImage(img, -drawW / 2, -drawH, drawW, drawH);
      ctx.restore();

    } else {
      const drawX = e.x + (e.width - vw) / 2;
      const drawY = e.y + e.height - vh;

      const isMoving = Math.abs(e.vx || 0) > 0.1 || Math.abs(e.vy || 0) > 0.1;
      let bob = Math.sin(state.gameTime / 3) * (isMoving ? 2 : 0);
      if (e.shape === 'flying' || e.shape === 'ghost') bob = Math.sin(state.gameTime / 5) * 4;

      ctx.fillStyle = e.color;
      if (e.shape === 'ghost') ctx.globalAlpha = 0.6;
      
      ctx.fillRect(drawX, drawY + bob, vw, vh);
      
      ctx.globalAlpha = 1.0;

      if (icon) {
        ctx.font = `${Math.min(vw, vh) * 0.6}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = 'black';
        ctx.shadowBlur = 2;
        ctx.fillStyle = '#fff';
        const iconY = e.shape === 'ghost' ? drawY + vh/3 : drawY + vh/2;
        ctx.fillText(icon, drawX + vw/2, iconY + bob);
        ctx.shadowBlur = 0;
      }
    } 

    if (e.type === 'enemy' && e.hp < e.maxHp) {
      const hpPct = e.hp / e.maxHp;
      const barW = vw;
      const barX = centerX - barW / 2;
      const barY = bottomY - vh - 12;

      ctx.fillStyle = '#000';
      ctx.fillRect(barX, barY, barW, 4);
      ctx.fillStyle = '#f44336';
      ctx.fillRect(barX, barY, barW * hpPct, 4);
    }
  };

  allEntities.forEach(e => {
    if(e.dead) return;
    const type = e.type === 'enemy' ? ENEMY_TYPES.find(t => t.name === (e as EnemyEntity).race) : null;
    const icon = e.type === 'player' ? JOB_DATA[(e as PlayerEntity).job]?.icon : type?.icon;
    renderCharacter(e as CombatEntity, icon);
  });

  state.projectiles.forEach(p => {
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 4, 0, Math.PI*2);
    ctx.fill();
  });

  const p = state.player;
  if (p.isAttacking) {
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    const cx = p.x + p.width/2;
    const cy = p.y + p.height/2;
    const range = 60;
    
    const radius = Math.max(0, range * Math.min(Math.max((Date.now() - p.lastAttackTime) / 200, 0), 1));
    
    ctx.arc(cx, cy, radius, 0, Math.PI*2);
    ctx.stroke();
  }

  state.floatingTexts.forEach(t => {
    ctx.font = 'bold 16px monospace';
    ctx.fillStyle = 'black';
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.textAlign = 'center';
    ctx.strokeText(t.text, t.x, t.y);
    ctx.fillStyle = t.color;
    ctx.fillText(t.text, t.x, t.y);
  });

  ctx.restore();
};

/**
 * ==========================================
 * メインコンポーネント
 * ==========================================
 */
export default function App() {
  const [screen, setScreen] = useState<'auth' | 'title' | 'game' | 'job_select'>('auth');
  const [saveData, setSaveData] = useState<any>(null);
  const [selectedGender, setSelectedGender] = useState<Gender>('Male');
  const [loadingMessage, setLoadingMessage] = useState('クラウドに接続中...');
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameState = useRef<GameState | null>(null);
  const reqRef = useRef<number>();
  const input = useRef({ keys: {} as Record<string, boolean>, mouse: {x:0, y:0, down: false} });
  
  const [uiState, setUiState] = useState<PlayerEntity | null>(null);
  const [worldInfo, setWorldInfo] = useState<{x:number, y:number, biome:Biome}>({x:0, y:0, biome:'Town'});
  const [activeMenu, setActiveMenu] = useState<'none' | 'status' | 'inventory' | 'stats'>('none');
  const [message, setMessage] = useState<string | null>(null);
  const [viewportSize, setViewportSize] = useState({ width: 800, height: 600 });
  
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  if (!isConfigValid) {
    return (
      <div className="w-full h-screen bg-slate-900 flex flex-col items-center justify-center text-white p-8">
        <AlertTriangle size={64} className="text-red-500 mb-4" />
        <h2 className="text-2xl font-bold mb-2">設定エラー</h2>
        <p className="text-center text-slate-400 mb-6 max-w-md">
          FirebaseのAPIキーが見つかりません。<br/>
          App.tsx内の <code>MANUAL_FIREBASE_CONFIG</code> に<br/>
          正しい設定値を入力してください。
        </p>
      </div>
    );
  }

  const loadedAssets = useMemo(() => {
    const images: Record<string, HTMLImageElement> = {};
    Object.entries(ASSETS_SVG).forEach(([key, svg]) => {
      const img = new Image();
      img.src = svgToUrl(svg);
      images[key] = img;
    });
    return images;
  }, []);

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
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          // @ts-ignore
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (e) {
        console.error("Auth Error:", e);
        setLoadingMessage("認証に失敗しました。オフラインで起動します。");
        setTimeout(() => setScreen('title'), 1500);
      }
    };
    initAuth();
    
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u) {
        checkSaveData(u.uid);
      } else {
        //
      }
    });
    
    const handleResize = () => {
      setViewportSize({ width: window.innerWidth, height: window.innerHeight });
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
        input.current.mouse.x = e.clientX - r.left;
        input.current.mouse.y = e.clientY - r.top;
        if(e.type==='mousedown') input.current.mouse.down=true;
        if(e.type==='mouseup') input.current.mouse.down=false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousedown', handleMouseInput);
    window.addEventListener('mouseup', handleMouseInput);
    window.addEventListener('mousemove', handleMouseInput);

    return () => {
      unsubscribe();
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousedown', handleMouseInput);
      window.removeEventListener('mouseup', handleMouseInput);
      window.removeEventListener('mousemove', handleMouseInput);
      if (reqRef.current) cancelAnimationFrame(reqRef.current);
    };
  }, []);

  const checkSaveData = async (uid: string) => {
    if (!db) {
        setScreen('title');
        return;
    }
    try {
      const docRef = doc(db, 'artifacts', appId, 'users', uid, 'saves', 'slot1');
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data();
        if (data && data.player) {
          setSaveData(data);
        }
      }
      setScreen('title');
    } catch (e) {
      console.error("Failed to check save data:", e);
      setScreen('title');
    }
  };

  const startGame = (job: Job, load = false) => {
    let player: PlayerEntity;
    let worldX = 0;
    let worldY = 0;
    let savedChunks = {};

    if (load && saveData) {
      player = { ...saveData.player };
      worldX = saveData.worldX;
      worldY = saveData.worldY;
      savedChunks = saveData.savedChunks || {};
      updatePlayerStats(player);
    } else {
      player = createPlayer(job, selectedGender);
      updatePlayerStats(player);
      player.x = (GAME_CONFIG.MAP_WIDTH * GAME_CONFIG.TILE_SIZE) / 2;
      player.y = (GAME_CONFIG.MAP_HEIGHT * GAME_CONFIG.TILE_SIZE) / 2;
      const starterSword = generateRandomItem(1); 
      if(starterSword) { 
        starterSword.name = "錆びた剣"; 
        starterSword.type = 'Weapon';
        starterSword.subType = 'OneHanded';
        player.inventory.push(starterSword);
      }
    }

    const chunkKey = `${worldX},${worldY}`;
    let initialChunk: ChunkData;
    
    // @ts-ignore
    if (savedChunks[chunkKey]) {
      // @ts-ignore
      initialChunk = savedChunks[chunkKey];
    } else {
      initialChunk = generateChunk(worldX, worldY);
    }

    gameState.current = {
      worldX, worldY, currentBiome: initialChunk.biome, savedChunks,
      map: initialChunk.map,
      player,
      enemies: initialChunk.enemies,
      droppedItems: initialChunk.droppedItems,
      projectiles: [], particles: [], floatingTexts: [],
      camera: { x: 0, y: 0 },
      gameTime: 0, isPaused: false, wave: 1
    };

    setScreen('game');
  };

  const spawnFloatingText = (x: number, y: number, text: string, color: string) => {
    gameState.current?.floatingTexts.push({
      id: crypto.randomUUID(), x, y, width:0, height:0, color, type: 'text', dead: false, text, life: 60
    });
  };

  const switchChunk = (dx: number, dy: number) => {
    if (!gameState.current) return;
    const state = gameState.current;

    const currentKey = `${state.worldX},${state.worldY}`;
    state.savedChunks[currentKey] = {
      map: state.map,
      enemies: state.enemies,
      droppedItems: state.droppedItems,
      biome: state.currentBiome
    };

    state.worldX += dx;
    state.worldY += dy;

    const newKey = `${state.worldX},${state.worldY}`;
    let nextChunk: ChunkData;

    if (state.savedChunks[newKey]) {
      nextChunk = state.savedChunks[newKey];
    } else {
      nextChunk = generateChunk(state.worldX, state.worldY);
    }

    state.map = nextChunk.map;
    state.enemies = nextChunk.enemies;
    state.droppedItems = nextChunk.droppedItems;
    state.currentBiome = nextChunk.biome;
    state.projectiles = [];
    
    setWorldInfo({x: state.worldX, y: state.worldY, biome: state.currentBiome});
    setMessage(`エリア移動：${BIOME_NAMES[state.currentBiome] || state.currentBiome}`);
    setTimeout(() => setMessage(null), 2000);
  };

  const gameLoop = () => {
    if (!gameState.current || !canvasRef.current) {
      reqRef.current = requestAnimationFrame(gameLoop);
      return;
    }
    const state = gameState.current;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    if (!state.isPaused && activeMenu === 'none') {
      state.gameTime++;
      const p = state.player;
      
      let dx = 0, dy = 0;
      const spd = p.speed;
      if (input.current.keys['w'] || input.current.keys['arrowup']) dy = -spd;
      if (input.current.keys['s'] || input.current.keys['arrowdown']) dy = spd;
      if (input.current.keys['a'] || input.current.keys['arrowleft']) dx = -spd;
      if (input.current.keys['d'] || input.current.keys['arrowright']) dx = spd;

      if (dx > 0) p.direction = 0;
      if (dx < 0) p.direction = 2;
      if (dy > 0) p.direction = 1;
      if (dy < 0) p.direction = 3;

      p.vx = dx; p.vy = dy;

      if (dx !== 0 && dy !== 0) {
        const len = Math.sqrt(dx*dx + dy*dy);
        dx = (dx/len) * spd;
        dy = (dy/len) * spd;
      }
      
      if (dx !== 0 || dy !== 0) {
        const nextPos = resolveMapCollision(p, dx, dy, state.map);
        p.x = nextPos.x;
        p.y = nextPos.y;

        const maxX = GAME_CONFIG.MAP_WIDTH * GAME_CONFIG.TILE_SIZE;
        const maxY = GAME_CONFIG.MAP_HEIGHT * GAME_CONFIG.TILE_SIZE;

        if (p.x < -10) {
          switchChunk(-1, 0);
          p.x = maxX - 40;
        } else if (p.x > maxX - 10) {
          switchChunk(1, 0);
          p.x = 20;
        } else if (p.y < -10) {
          switchChunk(0, -1);
          p.y = maxY - 40;
        } else if (p.y > maxY - 10) {
          switchChunk(0, 1);
          p.y = 20;
        }
      }

      state.droppedItems.forEach(drop => {
        if (checkCollision(p, drop)) {
          drop.dead = true;
          p.inventory.push(drop.item);
          spawnFloatingText(p.x, p.y - 20, `${drop.item.name}`, drop.item.color);
          setMessage(`拾った：${drop.item.name}`);
          setTimeout(() => setMessage(null), 2000);
        }
      });

      const now = Date.now();
      
      if ((input.current.keys[' '] || input.current.mouse.down) && now - p.lastAttackTime > p.attackCooldown) {
        p.lastAttackTime = now;
        p.isAttacking = true;
        setTimeout(() => { if(gameState.current) gameState.current.player.isAttacking = false; }, 200);
        
        const attackRange = 60;
        const attackRect = {
          x: p.x + p.width/2 - attackRange/2,
          y: p.y + p.height/2 - attackRange/2,
          width: attackRange, height: attackRange
        } as Entity;

        state.enemies.forEach(e => {
          if (checkCollision(attackRect, e)) {
            const dmg = Math.max(1, Math.floor((p.attack - e.defense/2) * (0.9 + Math.random() * 0.2)));
            e.hp -= dmg;
            spawnFloatingText(e.x + e.width/2, e.y, `-${dmg}`, '#fff');
            
            const angle = Math.atan2(e.y - p.y, e.x - p.x);
            e.x += Math.cos(angle) * 10;
            e.y += Math.sin(angle) * 10;

            if (e.hp <= 0) {
              e.dead = true;
              p.xp += e.xpValue;
              p.gold += Math.floor(Math.random() * 5) + 1;
              spawnFloatingText(e.x + e.width/2, e.y, `+${e.xpValue} XP`, '#ffd700');
              if (p.xp >= p.nextLevelXp) {
                p.level++;
                p.xp -= p.nextLevelXp;
                p.nextLevelXp = Math.floor(p.nextLevelXp * 1.5);
                p.statPoints += 3;
                updatePlayerStats(p);
                p.hp = p.maxHp;
                spawnFloatingText(p.x, p.y - 40, "LEVEL UP!", '#00ff00');
                setMessage("レベルアップ！Cキーで能力値を割り振れます。");
              }
              
              const dropChance = GAME_CONFIG.BASE_DROP_RATE * (e.rank === 'Boss' ? 5 : e.rank === 'Elite' ? 2 : 1);
              if (Math.random() < dropChance) {
                const item = generateRandomItem(e.level, e.rank === 'Boss' ? 5 : e.rank === 'Elite' ? 2 : 0);
                if (item) {
                  state.droppedItems.push({
                    id: crypto.randomUUID(), type: 'drop', x: e.x, y: e.y, width: 32, height: 32,
                    color: item.color, item, life: 3000, bounceOffset: Math.random() * 10, dead: false
                  });
                }
              }
            }
          }
        });
      }

      state.enemies.forEach(e => {
        if (e.dead) return;
        const dist = Math.sqrt((p.x - e.x)**2 + (p.y - e.y)**2);
        
        if (dist < e.detectionRange) {
          const angle = Math.atan2(p.y - e.y, p.x - e.x);
          
          if (Math.abs(Math.cos(angle)) > Math.abs(Math.sin(angle))) {
              e.direction = Math.cos(angle) > 0 ? 0 : 2;
          } else {
              e.direction = Math.sin(angle) > 0 ? 1 : 3;
          }

          const nextX = e.x + Math.cos(angle) * e.speed;
          const nextY = e.y + Math.sin(angle) * e.speed;
          
          if (!state.map[Math.floor(nextY/32)]?.[Math.floor(nextX/32)]?.solid && dist > 30) {
             e.x = nextX;
             e.y = nextY;
             e.vx = Math.cos(angle) * e.speed;
             e.vy = Math.sin(angle) * e.speed;
          } else {
             e.vx = 0; e.vy = 0;
          }

          if (dist < 40 && now - e.lastAttackTime > e.attackCooldown) {
            e.lastAttackTime = now;
            const dmg = Math.max(1, Math.floor(e.attack - p.defense/2));
            p.hp -= dmg;
            spawnFloatingText(p.x + p.width/2, p.y, `-${dmg}`, '#ff0000');
            if (p.hp <= 0) {
               p.hp = p.maxHp;
               state.worldX = 0; state.worldY = 0;
               switchChunk(-state.worldX, -state.worldY);
               
               p.x = (GAME_CONFIG.MAP_WIDTH * 32) / 2;
               p.y = (GAME_CONFIG.MAP_HEIGHT * 32) / 2;
               setMessage("死んでしまった！街で復活します。");
               setTimeout(() => setMessage(null), 3000);
            }
          }
        }
      });

      if (state.currentBiome !== 'Town' && state.enemies.length < 15 && Math.random() < GAME_CONFIG.ENEMY_SPAWN_RATE) {
        let sx, sy, dist;
        do {
           sx = Math.random() * (GAME_CONFIG.MAP_WIDTH * 32);
           sy = Math.random() * (GAME_CONFIG.MAP_HEIGHT * 32);
           dist = Math.sqrt((sx - p.x)**2 + (sy - p.y)**2);
        } while (dist < 500); 
        state.enemies.push(generateEnemy(sx, sy, state.wave + Math.abs(state.worldX) + Math.abs(state.worldY)));
      }

      state.enemies = state.enemies.filter(e => !e.dead);
      state.droppedItems = state.droppedItems.filter(d => !d.dead);
      state.floatingTexts.forEach(t => { t.y -= 0.5; t.life--; });
      state.floatingTexts = state.floatingTexts.filter(t => t.life > 0);
    }

    renderGame(ctx, state, loadedAssets);

    if (state.gameTime % 10 === 0) {
      setUiState({...state.player});
    }

    reqRef.current = requestAnimationFrame(gameLoop);
  };

  useEffect(() => {
    if (screen === 'game') {
      gameLoop();
    }
    return () => { if (reqRef.current) cancelAnimationFrame(reqRef.current); }
  }, [screen]);

  const saveGame = async () => {
    if (!gameState.current || !user || !db) return;
    setIsSaving(true);
    const data = {
      player: gameState.current.player,
      worldX: gameState.current.worldX,
      worldY: gameState.current.worldY,
      savedChunks: gameState.current.savedChunks,
      wave: gameState.current.wave
    };
    
    try {
      await setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'saves', 'slot1'), data);
      setSaveData(data);
      setMessage("クラウドに保存しました！");
    } catch(e) {
      console.error("Save failed", e);
      setMessage("保存に失敗しました！");
    } finally {
      setIsSaving(false);
      setTimeout(() => setMessage(null), 2000);
    }
  };

  const handleEquip = (item: Item) => {
    if (!gameState.current) return;
    const p = gameState.current.player;

    let slot: keyof PlayerEntity['equipment'] = 'mainHand';
    if (item.type === 'Helm') slot = 'helm';
    if (item.type === 'Armor') slot = 'armor';
    if (item.type === 'Boots') slot = 'boots';
    if (item.type === 'Shield') slot = 'offHand';
    
    if (item.type === 'Weapon') {
      const current = p.equipment.mainHand;
      if (current) p.inventory.push(current);
      p.equipment.mainHand = item;
      
      if (item.subType === 'TwoHanded' || item.subType === 'DualWield') {
        const off = p.equipment.offHand;
        if (off) {
          p.inventory.push(off);
          p.equipment.offHand = undefined;
        }
      }
    } else if (item.type === 'Shield') {
      const mh = p.equipment.mainHand;
      if (mh && (mh.subType === 'TwoHanded' || mh.subType === 'DualWield')) {
        setMessage("両手武器と盾は同時に装備できません！");
        setTimeout(() => setMessage(null), 2000);
        return; 
      }
      const current = p.equipment.offHand;
      if (current) p.inventory.push(current);
      p.equipment.offHand = item;
    } else {
      const current = p.equipment[slot];
      if (current) p.inventory.push(current);
      p.equipment[slot] = item;
    }

    p.inventory = p.inventory.filter(i => i.id !== item.id);
    updatePlayerStats(p);
    setUiState({...p}); 
  };

  const handleUnequip = (slot: keyof PlayerEntity['equipment']) => {
    if (!gameState.current) return;
    const p = gameState.current.player;
    const item = p.equipment[slot];
    if (item) {
      p.inventory.push(item);
      p.equipment[slot] = undefined;
      updatePlayerStats(p);
      setUiState({...p});
    }
  };

  const increaseStat = (attr: keyof Attributes) => {
    if (!gameState.current) return;
    const p = gameState.current.player;
    if (p.statPoints > 0) {
      p.attributes[attr]++;
      p.statPoints--;
      updatePlayerStats(p);
      setUiState({...p});
    }
  };

  if (screen === 'auth') {
    return (
      <div className="w-full h-screen bg-slate-900 flex flex-col items-center justify-center text-white">
        <Loader className="animate-spin text-yellow-500 mb-4" size={48} />
        <h2 className="text-xl">{loadingMessage}</h2>
      </div>
    );
  }

  if (screen === 'title') {
    return (
      <div className="w-full h-screen bg-slate-900 flex flex-col items-center justify-center text-white relative overflow-hidden font-sans">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-800 to-black opacity-50"></div>
        <div className="z-10 text-center space-y-8 animate-fade-in">
          <div>
            <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-700 drop-shadow-lg mb-2">
              QUEST OF HARVEST
            </h1>
            <p className="text-slate-400 tracking-[0.5em] text-sm uppercase">Reborn Edition</p>
          </div>
          <div className="flex flex-col gap-4 w-64 mx-auto">
            <button onClick={() => setScreen('job_select')} className="flex items-center justify-center gap-2 px-6 py-3 bg-yellow-700/20 border border-yellow-600/50 hover:bg-yellow-600/40 hover:scale-105 transition-all rounded text-yellow-100 font-semibold">
              <Play size={20} /> ニューゲーム
            </button>
            <button onClick={() => startGame('Swordsman', true)} disabled={!saveData} className={`flex items-center justify-center gap-2 px-6 py-3 border transition-all rounded font-semibold ${saveData ? 'bg-slate-700/50 border-slate-500 hover:bg-slate-600/50 hover:scale-105 text-slate-200' : 'bg-slate-900/50 border-slate-800 text-slate-600 cursor-not-allowed'}`}>
              <Save size={20} /> つづきから
            </button>
          </div>
        </div>
        <div className="absolute bottom-4 text-xs text-slate-600 font-mono">WASD: 移動 • SPACE/クリック: 攻撃 • I:持ち物 • C:ステータス</div>
      </div>
    );
  }

  if (screen === 'job_select') {
    return (
      <div className="w-full h-screen bg-slate-900 flex flex-col items-center justify-center text-white relative">
        <button onClick={() => setScreen('title')} className="absolute top-8 left-8 text-slate-500 hover:text-white flex items-center gap-2">
          <ArrowLeft size={20} /> 戻る
        </button>
        
        <h2 className="text-3xl mb-2 font-bold text-slate-200">キャラクター作成</h2>
        <p className="text-slate-400 mb-8">性別と職業を選択してください。</p>

        {/* 性別選択 */}
        <div className="flex gap-4 mb-8 bg-slate-800 p-2 rounded-full border border-slate-700">
          {(['Male', 'Female'] as Gender[]).map(g => (
            <button
              key={g}
              onClick={() => setSelectedGender(g)}
              className={`px-6 py-2 rounded-full font-bold transition-all ${
                selectedGender === g 
                  ? 'bg-yellow-600 text-white shadow-lg' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              {g === 'Male' ? '男性' : '女性'}
            </button>
          ))}
        </div>

        {/* 職業選択 */}
        <div className="flex gap-4 flex-wrap justify-center max-w-5xl">
          {(Object.keys(JOB_DATA) as Job[]).map(job => {
            const previewKey = `${job}_${selectedGender}`;
            const previewImg = loadedAssets[previewKey];

            return (
              <button key={job} onClick={() => startGame(job)} className="w-56 bg-slate-800 border border-slate-700 p-6 rounded-lg hover:border-yellow-500 hover:bg-slate-700 transition-all group text-left relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-6xl">
                  {JOB_DATA[job].icon}
                </div>
                
                {/* プレビュー画像 */}
                <div className="h-24 mb-4 flex items-center justify-center">
                  {previewImg ? (
                    <img src={previewImg.src} className="h-full w-auto pixel-art drop-shadow-xl group-hover:scale-110 transition-transform" style={{imageRendering: 'pixelated'}} />
                  ) : (
                    <div className="text-4xl">{JOB_DATA[job].icon}</div>
                  )}
                </div>

                <h3 className="text-xl font-bold text-yellow-500 mb-1">{job}</h3>
                <p className="text-xs text-slate-400 mb-4 h-8">{JOB_DATA[job].desc}</p>
                <div className="space-y-1 text-xs text-slate-500 border-t border-slate-700 pt-2">
                  <div className="flex justify-between"><span>VIT</span><span className="text-green-400">{JOB_DATA[job].attributes.vitality}</span></div>
                  <div className="flex justify-between"><span>STR</span><span className="text-red-400">{JOB_DATA[job].attributes.strength}</span></div>
                  <div className="flex justify-between"><span>DEX</span><span className="text-blue-400">{JOB_DATA[job].attributes.dexterity}</span></div>
                  <div className="flex justify-between"><span>INT</span><span className="text-purple-400">{JOB_DATA[job].attributes.intelligence}</span></div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen bg-black flex items-center justify-center overflow-hidden relative" onContextMenu={e => e.preventDefault()}>
      <canvas 
        ref={canvasRef} 
        width={viewportSize.width} 
        height={viewportSize.height} 
        className="bg-black shadow-2xl cursor-crosshair" 
      />
      
      {/* HUD 情報 */}
      <div className="absolute top-4 right-20 flex gap-4 text-white pointer-events-none">
         <div className="bg-slate-900/80 px-4 py-2 rounded border border-slate-700 flex items-center gap-2">
            <Compass size={16} className="text-yellow-500" />
            <span className="font-mono">{BIOME_NAMES[worldInfo.biome] || worldInfo.biome} ({worldInfo.x}, {worldInfo.y})</span>
         </div>
      </div>

      {/* UI オーバーレイ */}
      <div className="absolute top-4 left-4 flex gap-4 pointer-events-none">
        {uiState && (
          <div className="bg-slate-900/90 border border-slate-700 p-3 rounded text-white w-64 shadow-lg pointer-events-auto">
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold text-yellow-500">{uiState.job} Lv.{uiState.level}</span>
              <span className="text-xs text-slate-400">GOLD: {uiState.gold}</span>
            </div>
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
        )}
      </div>

      <div className="absolute top-4 right-4 flex gap-2 pointer-events-auto">
        <button onClick={() => setActiveMenu(activeMenu === 'inventory' ? 'none' : 'inventory')} className="p-2 bg-slate-800 text-white rounded hover:bg-slate-700 border border-slate-600 relative">
          <ShoppingBag size={20} />
          {uiState?.inventory.length ? <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span> : null}
        </button>
        <button onClick={() => setActiveMenu(activeMenu === 'stats' ? 'none' : 'stats')} className="p-2 bg-slate-800 text-white rounded hover:bg-slate-700 border border-slate-600 relative">
          <User size={20} />
          {uiState && uiState.statPoints > 0 ? <span className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></span> : null}
        </button>
        <button onClick={() => setActiveMenu(activeMenu === 'status' ? 'none' : 'status')} className="p-2 bg-slate-800 text-white rounded hover:bg-slate-700 border border-slate-600"><Settings size={20} /></button>
      </div>

      {message && <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-black/80 text-white px-6 py-2 rounded-full border border-yellow-500/50 animate-bounce">{message}</div>}

      {/* メニュー */}
      {activeMenu !== 'none' && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50 p-8">
          
          {/* ステータス/ポーズ メニュー */}
          {activeMenu === 'status' && (
            <div className="bg-slate-800 p-8 rounded-lg border border-slate-600 min-w-[300px] text-white">
              <h2 className="text-2xl font-bold mb-6 text-center border-b border-slate-600 pb-2">メニュー</h2>
              <div className="space-y-3">
                <button onClick={saveGame} disabled={isSaving} className="w-full py-3 bg-blue-700 hover:bg-blue-600 rounded font-bold flex items-center justify-center gap-2">
                  {isSaving ? <Loader className="animate-spin" size={18} /> : <Save size={18} />}
                  {isSaving ? '保存中...' : 'ゲームを保存'}
                </button>
                <button onClick={() => { setScreen('title'); setActiveMenu('none'); }} className="w-full py-3 bg-red-900/50 hover:bg-red-900 rounded border border-red-800 text-red-100 mt-8">タイトルに戻る</button>
                <button onClick={() => setActiveMenu('none')} className="w-full py-2 text-slate-400 hover:text-white mt-2">閉じる</button>
              </div>
            </div>
          )}

          {/* ステータス画面 */}
          {activeMenu === 'stats' && uiState && (
            <div className="bg-slate-900 border border-slate-600 rounded-lg w-[500px] p-6 text-white shadow-2xl relative">
              <button onClick={() => setActiveMenu('none')} className="absolute top-4 right-4 p-1 hover:bg-slate-700 rounded"><X /></button>
              <h2 className="text-2xl font-bold mb-4 text-yellow-500 flex items-center gap-2"><User /> ステータス</h2>
              
              <div className="flex justify-between items-end mb-6 border-b border-slate-700 pb-4">
                <div>
                  <div className="text-3xl font-bold">{uiState.job}</div>
                  <div className="text-slate-400">レベル {uiState.level}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-slate-400">残りポイント</div>
                  <div className="text-3xl font-bold text-yellow-400">{uiState.statPoints}</div>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                {[
                  { key: 'vitality', label: '体力', desc: '最大HPが増加' },
                  { key: 'strength', label: '筋力', desc: '物理攻撃力が増加' },
                  { key: 'dexterity', label: '器用さ', desc: '攻撃速度が増加' },
                  { key: 'intelligence', label: '知力', desc: '最大MPと魔法攻撃力が増加' },
                  { key: 'endurance', label: '耐久', desc: '防御力が増加' },
                ].map((stat) => (
                  <div key={stat.key} className="flex items-center justify-between bg-slate-800 p-3 rounded">
                    <div>
                      <div className="font-bold text-lg">{stat.label}</div>
                      <div className="text-xs text-slate-500">{stat.desc}</div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-2xl font-mono">{uiState.attributes[stat.key as keyof Attributes]}</span>
                      <button 
                        onClick={() => increaseStat(stat.key as keyof Attributes)}
                        disabled={uiState.statPoints <= 0}
                        className={`w-8 h-8 rounded flex items-center justify-center font-bold text-xl ${
                          uiState.statPoints > 0 
                            ? 'bg-yellow-600 hover:bg-yellow-500 text-white' 
                            : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm text-slate-300 bg-slate-800 p-4 rounded">
                <div className="flex justify-between"><span>HP</span> <span className="font-bold text-white">{uiState.maxHp}</span></div>
                <div className="flex justify-between"><span>MP</span> <span className="font-bold text-white">{uiState.maxMp}</span></div>
                <div className="flex justify-between"><span>攻撃力</span> <span className="font-bold text-white">{uiState.attack}</span></div>
                <div className="flex justify-between"><span>防御力</span> <span className="font-bold text-white">{uiState.defense}</span></div>
                <div className="flex justify-between"><span>速度</span> <span className="font-bold text-white">{uiState.speed.toFixed(1)}</span></div>
              </div>
            </div>
          )}

          {/* インベントリ画面 */}
          {activeMenu === 'inventory' && uiState && (
            <div className="bg-slate-900 border border-slate-600 rounded-lg w-full max-w-4xl h-[600px] flex text-white overflow-hidden shadow-2xl">
              {/* 装備パネル */}
              <div className="w-1/3 bg-slate-800/50 p-6 border-r border-slate-700 flex flex-col gap-4">
                <h3 className="text-xl font-bold text-yellow-500 mb-2 border-b border-slate-700 pb-2">装備</h3>
                
                {[
                  { slot: 'mainHand', label: '右手', icon: '⚔️' },
                  { slot: 'offHand', label: '左手', icon: '🛡️' },
                  { slot: 'helm', label: '頭', icon: '🪖' },
                  { slot: 'armor', label: '体', icon: '🛡️' },
                  { slot: 'boots', label: '足', icon: '👢' },
                ].map((s) => {
                  const item = uiState.equipment[s.slot as keyof typeof uiState.equipment];
                  return (
                    <div key={s.slot} className="flex items-center gap-3 p-2 bg-slate-800 rounded border border-slate-700 relative group">
                      <div className="w-10 h-10 bg-slate-900 flex items-center justify-center text-2xl border border-slate-600 rounded">
                        {item ? item.icon : s.icon}
                      </div>
                      <div className="flex-1">
                        <div className="text-xs text-slate-400 uppercase">{s.label}</div>
                        <div className={`font-bold text-sm ${item ? '' : 'text-slate-600'}`} style={{ color: item?.color }}>
                          {item ? item.name : 'なし'}
                        </div>
                      </div>
                      {item && (
                         <button onClick={() => handleUnequip(s.slot as any)} className="absolute right-2 top-2 p-1 hover:bg-red-900 rounded text-slate-400 hover:text-red-200">
                           <X size={14} />
                         </button>
                      )}
                    </div>
                  );
                })}
                
                <div className="mt-auto pt-4 border-t border-slate-700 text-xs text-slate-400">
                   <p>右のアイテムをクリックして装備。</p>
                   <p>同じ種類のスロットが必要です。</p>
                </div>
              </div>

              {/* インベントリリスト */}
              <div className="flex-1 p-6 overflow-y-auto bg-slate-900">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-white">持ち物 ({uiState.inventory.length})</h3>
                  <button onClick={() => setActiveMenu('none')} className="p-1 hover:bg-slate-700 rounded"><X /></button>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  {uiState.inventory.map((item, _idx) => (
                    <div key={item.id} 
                      onClick={() => handleEquip(item)}
                      className="flex gap-3 p-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-yellow-500 rounded cursor-pointer transition-colors group"
                    >
                      <div className="w-12 h-12 bg-slate-900 flex items-center justify-center text-2xl border border-slate-600 rounded shrink-0">
                        {item.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold truncate" style={{ color: item.color }}>{item.name}</div>
                        <div className="text-xs text-slate-400">{item.type} {item.subType ? `(${item.subType})` : ''}</div>
                        
                        <div className="text-xs mt-1 grid grid-cols-2 gap-x-2 text-slate-300">
                          {item.stats.attack > 0 && <span>攻撃 +{item.stats.attack}</span>}
                          {item.stats.defense > 0 && <span>防御 +{item.stats.defense}</span>}
                          {item.stats.speed > 0 && <span>敏捷 +{item.stats.speed}</span>}
                          {item.stats.maxHp > 0 && <span>体力 +{item.stats.maxHp}</span>}
                        </div>
                        
                        {item.enchantments.length > 0 && (
                          <div className="mt-1 pt-1 border-t border-slate-700/50 text-[10px] text-blue-300">
                             {item.enchantments.map(e => e.name).join(', ')}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {uiState.inventory.length === 0 && (
                    <div className="col-span-2 text-center text-slate-500 py-10">アイテムがありません。敵を倒してドロップを探そう！</div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/30 text-xs pointer-events-none">Quest of Harvest v1.6.0</div>
    </div>
  );
}
