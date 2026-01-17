import { useEffect, useRef, useState, useMemo } from 'react';
import { Save, Play, ShoppingBag, X, User, Compass, Loader, Settings, ArrowLeft, AlertTriangle, Sword, Zap, Heart, Activity, Monitor, ArrowDownCircle, Droplets, Wind, Hammer, Coins, Shield, Clock, Star, Book, Skull } from 'lucide-react';
import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, User as FirebaseUser, signInWithCustomToken, Auth } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, Firestore } from 'firebase/firestore';

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
 * SECTION 2: ASSETS (SVG & STYLES)
 * ############################################################################
 */
const ASSETS_SVG = {
  Slime: `<svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path d="M4 14h8v1H4z" fill="rgba(0,0,0,0.3)" /><path d="M6 14h4v-1h3v-2h1v-5h-1v-1h-1v-1H5v1H4v1H3v1H2v5h1v2h3v1z" fill="#76ff03" /><path d="M5 8h2v2H5zm0 0h1v1h-1z" fill="#000" /><path d="M6 8h1v1H6z" fill="#fff" /><path d="M9 8h2v2H9zm0 0h1v1h-1z" fill="#000" /><path d="M10 8h1v1h-1z" fill="#fff" /><path d="M6 5h2v1H6zm-1 1h1v2H5z" fill="#ccff90" opacity="0.5" /></svg>`,
  Bandit: `<svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path d="M4 14h8v1H4z" fill="rgba(0,0,0,0.3)" /><path d="M5 2h6v4H5z" fill="#5d4037" /><path d="M6 5h4v1H6z" fill="#000" opacity="0.8" /><path d="M6 6h4v1H6z" fill="#ffccaa" /><path d="M5 7h6v5H5z" fill="#8d6e63" /><path d="M5 12h2v4H5zm4 0h2v4H9z" fill="#3e2723" /><path d="M11 9h3v1h-3z" fill="#cfd8dc" /><path d="M11 9h1v3h-1z" fill="#5d4037" /></svg>`,
  Zombie: `<svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path d="M4 14h8v1H4z" fill="rgba(0,0,0,0.3)" /><path d="M5 2h6v3H5z" fill="#6d4c41" /><path d="M5 5h6v3H5z" fill="#81c784" /><path d="M6 6h1v1H6zm4 0h1v1h-1z" fill="#000" /><path d="M4 8h8v5H4z" fill="#5d4037" /><path d="M4 8h2v2H4zm6 0h2v2h-2z" fill="#4e342e" /><path d="M5 13h2v3H5zm4 0h2v3H9z" fill="#3e2723" /><path d="M2 8h3v2H2zm9 0h3v2h-3z" fill="#81c784" /></svg>`,
  Insect: `<svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path d="M2 14h12v1H2z" fill="rgba(0,0,0,0.3)" /><path d="M3 8h4v4H3z" fill="#3e2723" /><path d="M7 9h2v2H7z" fill="#5d4037" /><path d="M9 7h4v4H9z" fill="#3e2723" /><path d="M12 8h1v1h-1z" fill="#ffeb3b" /><path d="M4 12h1v2H4zm3 0h1v2H7zm4 0h1v2h-1z" fill="#000" /><path d="M13 7h2v-2h-2z" fill="#000" opacity="0.5" /></svg>`,
  Demon: `<svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path d="M4 14h8v1H4z" fill="rgba(0,0,0,0.3)" /><path d="M5 3h1v2H5zm5 0h1v2h-1z" fill="#ffd700" /><path d="M5 5h6v3H5z" fill="#e57373" /><path d="M6 6h1v1H6zm4 0h1v1h-1z" fill="#000" /><path d="M4 8h8v5H4z" fill="#b71c1c" /><path d="M2 7h3v2H2zm9 0h3v4h-1v-2h-2z" fill="#b71c1c" /><path d="M13 7h1v5h-1z" fill="#000" /><path d="M5 13h2v3H5zm4 0h2v3H9z" fill="#3e2723" /></svg>`,
  Bat: `<svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path d="M6 14h4v1H6z" fill="rgba(0,0,0,0.3)" /><path d="M7 6h2v2H7z" fill="#4a148c" /><path d="M2 5h5v4H6V8H5V7H4V6H2z" fill="#7b1fa2" /><path d="M9 5h5v1h-2v1h-1v1h-1v1H9z" fill="#7b1fa2" /><path d="M7 7h1v1H7zm1 0h1v1H8z" fill="#fff" /></svg>`,
  Dragon: `<svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path d="M3 14h10v1H3z" fill="rgba(0,0,0,0.3)" /><path d="M6 3h4v4H6z" fill="#00695c" /><path d="M7 4h1v1H7zm2 0h1v1H9z" fill="#ffeb3b" /><path d="M5 7h6v6H5z" fill="#004d40" /><path d="M2 6h3v4H4V9H3V8H2z" fill="#4db6ac" /><path d="M11 6h3v1h-1v1h-1v2h-1z" fill="#4db6ac" /><path d="M5 13h2v3H5zm4 0h2v3H9z" fill="#004d40" /><path d="M4 10h-2v2h2z" fill="#004d40" /></svg>`,
  Beast: `<svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path d="M3 14h10v1H3z" fill="rgba(0,0,0,0.3)" /><path d="M3 6h10v6H3z" fill="#5d4037" /><path d="M2 5h4v4H2z" fill="#4e342e" /><path d="M3 6h1v1H3z" fill="#fff" /><path d="M2 8h1v1H2z" fill="#fff" /><path d="M4 12h2v4H4zm6 0h2v4h-2z" fill="#3e2723" /></svg>`,
  Wolf: `<svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path d="M3 14h10v1H3z" fill="rgba(0,0,0,0.3)" /><path d="M4 7h8v5H4z" fill="#757575" /><path d="M2 6h4v3H2z" fill="#616161" /><path d="M3 5h1v1H3z" fill="#616161" /><path d="M3 7h1v1H3z" fill="#fff" /><path d="M12 8h2v2h-2z" fill="#757575" /><path d="M4 12h2v4H4zm6 0h2v4h-2z" fill="#424242" /></svg>`,
  Ghost: `<svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path d="M5 14h6v1H5z" fill="rgba(0,0,0,0.1)" /><path d="M5 4h6v8H5z" fill="#eceff1" opacity="0.8" /><path d="M4 6h1v6H4zm7 0h1v6h-1z" fill="#eceff1" opacity="0.6" /><path d="M6 6h1v1H6zm3 0h1v1H9z" fill="#000" /><path d="M5 12h1v2H5zm2-1h2v2H7zm3 1h1v2h-1z" fill="#eceff1" opacity="0.8" /></svg>`,
  Swordsman_Male: `<svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path d="M4 14h8v1H4z" fill="rgba(0,0,0,0.3)" /><path d="M5 2h6v3H5z" fill="#ffd700" /><path d="M5 5h6v3H5z" fill="#ffccaa" /><path d="M6 6h1v1H6zm4 0h1v1h-1z" fill="#000" /><path d="M4 8h8v5H4z" fill="#1565c0" /><path d="M6 9h4v4H6z" fill="#64b5f6" opacity="0.3" /><path d="M5 13h2v3H5zm4 0h2v3H9z" fill="#424242" /><path d="M12 5h1v3h-1z" fill="#bdbdbd" /><path d="M11 8h3v1h-3z" fill="#5d4037" /><path d="M12 9h1v2h-1z" fill="#5d4037" /></svg>`,
  Swordsman_Female: `<svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path d="M4 14h8v1H4z" fill="rgba(0,0,0,0.3)" /><path d="M4 2h8v6H4z" fill="#ffab00" /><path d="M5 5h6v3H5z" fill="#ffccaa" /><path d="M6 6h1v1H6zm4 0h1v1h-1z" fill="#000" /><path d="M5 8h6v4H5z" fill="#1565c0" /><path d="M4 12h8v2H4z" fill="#0d47a1" /><path d="M5 14h2v2H5zm4 0h2v2H9z" fill="#424242" /><path d="M12 5h1v3h-1z" fill="#bdbdbd" /><path d="M11 8h3v1h-3z" fill="#5d4037" /><path d="M12 9h1v2h-1z" fill="#5d4037" /></svg>`,
  Warrior_Male: `<svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path d="M3 14h10v1H3z" fill="rgba(0,0,0,0.3)" /><path d="M5 2h6v3H5z" fill="#5d4037" /><path d="M4 3h1v2H4zm7 0h1v2h-1z" fill="#bcaaa4" /><path d="M5 5h6v3H5z" fill="#d7ccc8" /><path d="M6 6h1v1H6zm4 0h1v1h-1z" fill="#000" /><path d="M3 8h10v5H3z" fill="#3e2723" /><path d="M5 9h6v3H5z" fill="#5d4037" /><path d="M4 13h3v3H4zm5 0h3v3H9z" fill="#212121" /><path d="M13 4h2v4h-2z" fill="#757575" /><path d="M14 8h1v5h-1z" fill="#5d4037" /></svg>`,
  Warrior_Female: `<svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path d="M3 14h10v1H3z" fill="rgba(0,0,0,0.3)" /><path d="M5 2h6v2H5z" fill="#cfd8dc" /><path d="M3 3h2v2H3zm6 0h2v2H9z" fill="#fff" /><path d="M5 4h6v7H5z" fill="#fdd835" /><path d="M5 5h6v3H5z" fill="#ffccaa" /><path d="M6 6h1v1H6zm4 0h1v1h-1z" fill="#000" /><path d="M5 8h6v4H5z" fill="#b71c1c" /><path d="M5 12h2v4H5zm4 0h2v4H9z" fill="#4a148c" /><path d="M13 5h2v3h-2z" fill="#90a4ae" /><path d="M14 8h1v5h-1z" fill="#5d4037" /></svg>`,
  Archer_Male: `<svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path d="M4 14h8v1H4z" fill="rgba(0,0,0,0.3)" /><path d="M5 2h6v4H5z" fill="#33691e" /><path d="M5 5h6v3H5z" fill="#ffccaa" /><path d="M6 6h1v1H6zm4 0h1v1h-1z" fill="#000" /><path d="M5 8h6v5H5z" fill="#558b2f" /><path d="M6 9h4v3H6z" fill="#7cb342" /><path d="M5 13h2v3H5zm4 0h2v3H9z" fill="#3e2723" /><path d="M12 6h1v6h-1z" fill="#8d6e63" /><path d="M12 6h-1v1h1zm-1 5h1v1h-1z" fill="#8d6e63" /></svg>`,
  Archer_Female: `<svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path d="M4 14h8v1H4z" fill="rgba(0,0,0,0.3)" /><path d="M5 2h6v3H5z" fill="#a1887f" /><path d="M11 3h2v3h-2z" fill="#a1887f" /><path d="M5 5h6v3H5z" fill="#ffccaa" /><path d="M6 6h1v1H6zm4 0h1v1h-1z" fill="#000" /><path d="M5 8h6v4H5z" fill="#33691e" /><path d="M5 12h2v4H5zm4 0h2v4H9z" fill="#5d4037" /><path d="M12 6h1v6h-1z" fill="#8d6e63" /><path d="M12 6h-1v1h1zm-1 5h1v1h-1z" fill="#8d6e63" /></svg>`,
  Mage_Male: `<svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path d="M4 14h8v1H4z" fill="rgba(0,0,0,0.3)" /><path d="M4 4h8v1H4z" fill="#311b92" /><path d="M5 1h6v3H5z" fill="#311b92" /><path d="M5 5h6v3H5z" fill="#ffccaa" /><path d="M6 6h1v1H6zm4 0h1v1h-1z" fill="#000" /><path d="M4 8h8v6H4z" fill="#4527a0" /><path d="M6 8h4v6H6z" fill="#673ab7" /><path d="M13 5h1v8h-1z" fill="#8d6e63" /><path d="M12 4h3v1h-3z" fill="#ffeb3b" /></svg>`,
  Mage_Female: `<svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path d="M4 14h8v1H4z" fill="rgba(0,0,0,0.3)" /><path d="M3 4h10v1H3z" fill="#ad1457" /><path d="M5 1h6v3H5z" fill="#ad1457" /><path d="M4 5h8v4H4z" fill="#f48fb1" /><path d="M5 5h6v3H5z" fill="#ffccaa" /><path d="M6 6h1v1H6zm4 0h1v1h-1z" fill="#000" /><path d="M5 8h6v6H5z" fill="#880e4f" /><path d="M13 5h1v8h-1z" fill="#8d6e63" /><path d="M12 4h3v1h-3z" fill="#00e676" /></svg>`,
  Torch: `<svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path d="M6 8h4v8H6z" fill="#5d4037" /><path d="M7 6h2v2H7z" fill="#ffeb3b" /><path d="M6 4h4v3H6z" fill="#ff9800" opacity="0.8" /><path d="M7 2h2v4H7z" fill="#ff5722" opacity="0.8" /></svg>`,
  Potion: `<svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path d="M6 14h4v1H6z" fill="rgba(0,0,0,0.3)" /><path d="M7 2h2v3H7z" fill="#b0bec5" /><path d="M6 4h4v1H6z" fill="#cfd8dc" /><path d="M5 5h6v8H5z" fill="#ef5350" /><path d="M6 6h1v2H6zm3 1h1v1H9z" fill="#ffcdd2" opacity="0.6" /><path d="M5 11h6v2H5z" fill="#c62828" /></svg>`,
  Tree: `<svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path d="M6 13h4v3H6z" fill="#5d4037" /><path d="M4 10h8v3H4z" fill="#2e7d32" /><path d="M5 7h6v3H5z" fill="#388e3c" /><path d="M6 4h4v3H6z" fill="#43a047" /><path d="M7 2h2v2H7z" fill="#4caf50" /></svg>`,
  Rock: `<svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path d="M3 10h10v6H3z" fill="#757575" /><path d="M4 8h8v2H4z" fill="#9e9e9e" /><path d="M5 6h6v2H5z" fill="#bdbdbd" /><path d="M3 13h2v2H3zm8 0h2v2h-2z" fill="#616161" /></svg>`,
  Ore: `<svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path d="M3 10h10v6H3z" fill="#546e7a" /><path d="M4 8h8v2H4z" fill="#78909c" /><path d="M5 6h6v2H5z" fill="#90a4ae" /><path d="M5 9h2v2H5zm5 2h2v2h-2z" fill="#ffeb3b" /><path d="M7 12h2v2H7z" fill="#ffeb3b" /></svg>`
};
const svgToUrl = (s: string) => "data:image/svg+xml;charset=utf-8," + encodeURIComponent(s.trim());

/**
 * ############################################################################
 * SECTION 3: TYPE DEFINITIONS
 * ############################################################################
 */
type TileType = 'grass' | 'dirt' | 'wall' | 'water' | 'floor' | 'portal_out' | 'town_entrance' | 'sand' | 'snow' | 'rock' | 'stairs_down' | 'dungeon_entrance' | 'return_portal' | 'town_floor';
type EntityType = 'player' | 'enemy' | 'npc' | 'projectile' | 'particle' | 'text' | 'drop' | 'resource';
type Job = 'Swordsman' | 'Warrior' | 'Archer' | 'Mage';
type Gender = 'Male' | 'Female';
type ShapeType = 'humanoid' | 'beast' | 'slime' | 'large' | 'insect' | 'ghost' | 'demon' | 'dragon' | 'flying';
type Biome = 'Plains' | 'Forest' | 'Desert' | 'Snow' | 'Wasteland' | 'Town' | 'Dungeon';
type Rarity = 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary';
type EquipmentType = 'Weapon' | 'Helm' | 'Armor' | 'Shield' | 'Boots' | 'Consumable' | 'Material';
type WeaponStyle = 'OneHanded' | 'TwoHanded' | 'DualWield';
type WeaponClass = 'Sword' | 'Axe' | 'Bow' | 'Staff' | 'Wand';
type MenuType = 'none' | 'status' | 'inventory' | 'stats' | 'level_up' | 'crafting' | 'shop'; 
type ResolutionMode = 'auto' | '800x600' | '1024x768' | '1280x720';

interface Tile { x: number; y: number; type: TileType; solid: boolean; }
interface Enchantment { type: 'Attack' | 'Defense' | 'Speed' | 'MaxHp'; value: number; strength: 'Weak' | 'Medium' | 'Strong'; name: string; }
interface Item { id: string; name: string; type: EquipmentType; subType?: WeaponStyle; weaponClass?: WeaponClass; rarity: Rarity; level: number; stats: { attack: number; defense: number; speed: number; maxHp: number; }; enchantments: Enchantment[]; icon: string; color: string; count?: number; }
interface Entity { id: string; x: number; y: number; width: number; height: number; visualWidth?: number; visualHeight?: number; color: string; type: EntityType; dead: boolean; vx?: number; vy?: number; }
interface DroppedItem extends Entity { type: 'drop'; item: Item; life: number; bounceOffset: number; }
interface CombatEntity extends Entity { hp: number; maxHp: number; level: number; attack: number; defense: number; speed: number; lastAttackTime: number; attackCooldown: number; isAttacking?: boolean; direction: number; shape?: ShapeType; }
interface Attributes { vitality: number; strength: number; dexterity: number; intelligence: number; endurance: number; }
interface ResourceEntity extends Entity { type: 'resource'; resourceType: 'tree' | 'rock' | 'ore'; hp: number; maxHp: number; }

interface LightSource { x: number; y: number; radius: number; flicker: boolean; color: string; }

interface PerkData {
  id: string;
  name: string;
  desc: string;
  rarity: 'Common' | 'Uncommon' | 'Rare' | 'Legendary';
  icon: any; 
  color: string;
}

interface PlayerEntity extends CombatEntity { 
  job: Job; gender: Gender; xp: number; nextLevelXp: number; gold: number; maxMp: number; mp: number; statPoints: number; 
  attributes: Attributes; 
  inventory: Item[]; 
  equipment: { mainHand?: Item; offHand?: Item; helm?: Item; armor?: Item; boots?: Item; }; 
  calculatedStats: { maxHp: number; maxMp: number; attack: number; defense: number; speed: number; maxStamina: number; staminaRegen: number; attackCooldown: number; };
  perks: { id: string; level: number }[]; // Updated to store level
  stamina: number; 
  lastStaminaUse: number;
}

interface EnemyEntity extends CombatEntity { targetId?: string; detectionRange: number; race: string; xpValue: number; rank: 'Normal' | 'Elite' | 'Boss'; }
interface Particle extends Entity { life: number; maxLife: number; size: number; }
interface FloatingText extends Entity { text: string; life: number; color: string; }
interface Projectile extends Entity { damage: number; ownerId: string; life: number; color: string; }
interface FloorData { map: Tile[][]; enemies: EnemyEntity[]; resources: ResourceEntity[]; droppedItems: DroppedItem[]; biome: Biome; level: number; lights: LightSource[]; shopZones?: {x:number, y:number, w:number, h:number, type:'blacksmith'|'general'}[]; bossId?: string | null; entryPos?: {x:number, y:number}; }

interface GameState { 
  dungeonLevel: number; 
  currentBiome: Biome; 
  map: Tile[][]; 
  player: PlayerEntity; 
  enemies: EnemyEntity[]; 
  resources: ResourceEntity[]; 
  droppedItems: DroppedItem[]; 
  projectiles: Projectile[]; 
  particles: Particle[]; 
  floatingTexts: FloatingText[]; 
  camera: { x: number; y: number }; 
  gameTime: number; 
  isPaused: boolean; 
  levelUpOptions: PerkData[] | null;
  lights: LightSource[];
  shopZones?: {x:number, y:number, w:number, h:number, type:'blacksmith'|'general'}[];
  activeShop: 'blacksmith' | 'general' | null;
  activeBossId: string | null; // Phase 5: Track active boss
}

/**
 * ############################################################################
 * SECTION 4: GAME CONSTANTS & DATA
 * ############################################################################
 */
const GAME_CONFIG = {
  TILE_SIZE: 32, MAP_WIDTH: 80, MAP_HEIGHT: 60, PLAYER_SPEED: 5, ENEMY_SPAWN_RATE: 0.02, BASE_DROP_RATE: 0.2,
  STAMINA_ATTACK_COST: 15,
  STAMINA_DASH_COST: 1, 
  STAMINA_REGEN: 0.5,
  PROJECTILE_SPEED: 8, 
};

const THEME = {
  colors: {
    ground: '#1a1a1a', grass: '#1e2b1e', wall: '#424242', water: '#1a237e', townFloor: '#5d4037', player: '#d4af37', enemy: '#8b0000', text: '#c0c0c0', highlight: '#ffd700',
    rarity: { Common: '#ffffff', Uncommon: '#1eff00', Rare: '#0070dd', Epic: '#a335ee', Legendary: '#ff8000', }
  }
};

const RARITY_MULTIPLIERS = { Common: 1.0, Uncommon: 1.2, Rare: 1.5, Epic: 2.0, Legendary: 3.0 };
const ENCHANT_SLOTS = { Common: 0, Uncommon: 1, Rare: 2, Epic: 3, Legendary: 5 };
const ITEM_BASE_NAMES = { Weapon: { OneHanded: '剣', TwoHanded: '大剣', DualWield: '双剣' }, Helm: '兜', Armor: '板金鎧', Shield: '盾', Boots: '具足', Consumable: '道具', Material: '素材' };
const ICONS = { 
    Weapon: { OneHanded: '⚔️', TwoHanded: '🗡️', DualWield: '⚔️', Bow: '🏹', Staff: '🪄', Wand: '🥢' }, 
    Helm: '🪖', Armor: '🛡️', Shield: '🛡️', Boots: '👢', Consumable: '🎒', Material: '📦' 
};

const PERK_DEFINITIONS: Record<string, PerkData> = {
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
  // Phase 5: Bosses
  { name: 'Dragon',    hp: 500, atk: 30, spd: 3.0, color: '#004d40', icon: '🐲', xp: 500, shape: 'dragon', w: 64, h: 64, vw: 80, vh: 80 },
];

/**
 * ############################################################################
 * SECTION 5: GAME LOGIC HELPERS (PURE FUNCTIONS)
 * ############################################################################
 */
const generateRandomItem = (level: number, rankBonus: number = 0): Item | null => {
  let roll = Math.random() * 100 - rankBonus * 5;
  
  if (Math.random() < 0.15) {
      const typeRoll = Math.random();
      if (typeRoll < 0.5) return { id: crypto.randomUUID(), name: "松明", type: "Consumable", rarity: "Common", level: 1, stats: { attack:0, defense:0, speed:0, maxHp:0 }, enchantments: [], icon: "🔥", color: "#ff9800", count: 1 };
      else return { id: crypto.randomUUID(), name: "ポーション", type: "Consumable", rarity: "Common", level: 1, stats: { attack:0, defense:0, speed:0, maxHp:0 }, enchantments: [], icon: "🧪", color: "#f44336", count: 1 };
  }

  let rarity: Rarity = roll < 1 ? 'Legendary' : roll < 5 ? 'Epic' : roll < 15 ? 'Rare' : roll < 40 ? 'Uncommon' : 'Common';
  const types: EquipmentType[] = ['Weapon', 'Helm', 'Armor', 'Shield', 'Boots'];
  const type = types[Math.floor(Math.random() * types.length)];
  
  let subType: WeaponStyle | undefined;
  let weaponClass: WeaponClass | undefined;
  let icon = "";
  
  if (type === 'Weapon') {
      const wRoll = Math.random();
      if (wRoll < 0.3) { weaponClass = 'Sword'; subType = 'OneHanded'; icon = ICONS.Weapon.OneHanded; }
      else if (wRoll < 0.45) { weaponClass = 'Axe'; subType = 'TwoHanded'; icon = ICONS.Weapon.TwoHanded; } 
      else if (wRoll < 0.65) { weaponClass = 'Bow'; subType = 'TwoHanded'; icon = ICONS.Weapon.Bow; }
      else if (wRoll < 0.85) { weaponClass = 'Staff'; subType = 'TwoHanded'; icon = ICONS.Weapon.Staff; }
      else { weaponClass = 'Wand'; subType = 'OneHanded'; icon = ICONS.Weapon.Wand; }
  } else {
      // @ts-ignore
      icon = ICONS[type];
  }

  const mult = RARITY_MULTIPLIERS[rarity];
  const baseVal = Math.max(1, level * 2);
  const stats = { attack: 0, defense: 0, speed: 0, maxHp: 0 };

  if (type === 'Weapon') {
    stats.attack = Math.floor(baseVal * 3 * mult);
    if (weaponClass === 'Axe' || weaponClass === 'Staff' || weaponClass === 'Bow') stats.attack = Math.floor(stats.attack * 1.3);
    if (weaponClass === 'Wand') stats.attack = Math.floor(stats.attack * 0.8);
    
    if (weaponClass === 'Axe') stats.speed = -1;
    if (weaponClass === 'Bow') stats.speed = 1;
  } else if (type === 'Armor') { stats.defense = Math.floor(baseVal * 2 * mult); stats.maxHp = Math.floor(baseVal * 5 * mult);
  } else if (type === 'Helm') { stats.defense = Math.floor(baseVal * 1 * mult); stats.maxHp = Math.floor(baseVal * 2 * mult);
  } else if (type === 'Shield') { stats.defense = Math.floor(baseVal * 2.5 * mult);
  } else if (type === 'Boots') { stats.defense = Math.floor(baseVal * 0.5 * mult); stats.speed = Number((0.2 * mult).toFixed(1)); }

  const enchantments: Enchantment[] = [];
  const enchantCount = Math.floor(Math.random() * (ENCHANT_SLOTS[rarity] + 1));
  for (let i = 0; i < enchantCount; i++) {
    const eType = (['Attack', 'Defense', 'Speed', 'MaxHp'] as const)[Math.floor(Math.random() * 4)];
    const strength = (['Weak', 'Medium', 'Strong'] as const)[Math.floor(Math.random() * 3)];
    let val = 0;
    if (eType === 'Attack' || eType === 'Defense') val = Math.floor(level * (strength === 'Strong' ? 3 : strength === 'Medium' ? 2 : 1));
    else if (eType === 'MaxHp') val = Math.floor(level * 5 * (strength === 'Strong' ? 3 : strength === 'Medium' ? 2 : 1));
    else if (eType === 'Speed') val = Number((0.1 * (strength === 'Strong' ? 3 : strength === 'Medium' ? 2 : 1)).toFixed(1));
    enchantments.push({ type: eType, value: val, strength, name: `${eType}+` });
    // @ts-ignore
    if (eType === 'Attack') stats.attack += val; else if (eType === 'Defense') stats.defense += val; else if (eType === 'MaxHp') stats.maxHp += val; else if (eType === 'Speed') stats.speed += val;
  }
  
  let namePrefix = rarity === 'Common' ? '' : `${rarity} `;
  let baseName = type === 'Weapon' ? (weaponClass === 'Axe' ? '斧' : weaponClass === 'Bow' ? '弓' : weaponClass === 'Staff' ? '杖' : weaponClass === 'Wand' ? '短杖' : '剣') : ITEM_BASE_NAMES[type];
  
  return { id: crypto.randomUUID(), name: `${namePrefix}${baseName}`, type, subType, weaponClass, rarity, level, stats, enchantments, icon, color: THEME.colors.rarity[rarity] };
};

const createPlayer = (job: Job, gender: Gender): PlayerEntity => {
  const baseAttrs = JOB_DATA[job].attributes;
  return {
    id: 'player', type: 'player', x: 0, y: 0, width: 20, height: 20, visualWidth: 32, visualHeight: 56, color: THEME.colors.player, job, gender, shape: 'humanoid',
    hp: 100, maxHp: 100, mp: 50, maxMp: 50, attack: 10, defense: 0, speed: 4, level: 1, xp: 0, nextLevelXp: 100, gold: 0, statPoints: 0, attributes: { ...baseAttrs },
    dead: false, lastAttackTime: 0, attackCooldown: 500, direction: 1, inventory: [], equipment: {}, calculatedStats: { maxHp: 100, maxMp: 50, attack: 10, defense: 0, speed: 4, maxStamina: 100, staminaRegen: 0.5, attackCooldown: 500 },
    perks: [],
    stamina: 100, lastStaminaUse: 0
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

const generateFloor = (level: number): FloorData => {
  const width = GAME_CONFIG.MAP_WIDTH;
  const height = GAME_CONFIG.MAP_HEIGHT;
  const map: Tile[][] = Array(height).fill(null).map((_, y) => Array(width).fill(null).map((_, x) => {
      return { x: x * GAME_CONFIG.TILE_SIZE, y: y * GAME_CONFIG.TILE_SIZE, type: 'grass', solid: false };
    })
  );

  const enemies: EnemyEntity[] = [];
  const resources: ResourceEntity[] = [];
  const lights: LightSource[] = [];
  const shopZones: {x:number, y:number, w:number, h:number, type:'blacksmith'|'general'}[] = [];
  const biome: Biome = level === 0 ? 'Town' : (['Dungeon', 'Plains', 'Forest', 'Wasteland', 'Snow', 'Desert'] as Biome[])[(level % 5) + 1] || 'Dungeon';
  let bossId: string | null = null;
  let entryPos = { x: (width/2) * GAME_CONFIG.TILE_SIZE, y: (height/2) * GAME_CONFIG.TILE_SIZE };

  // --- Town Generation (Level 0) ---
  if (level === 0) {
    for(let y=0; y<height; y++) {
      for(let x=0; x<width; x++) {
        map[y][x].type = 'town_floor';
        if (x===0 || x===width-1 || y===0 || y===height-1) {
           map[y][x].type = 'wall'; map[y][x].solid = true;
        }
      }
    }
    const cx = Math.floor(width/2), cy = Math.floor(height/2);
    map[cy][cx].type = 'dungeon_entrance';
    lights.push({ x: cx * 32 + 16, y: cy * 32 + 16, radius: 150, flicker: true, color: '#f59e0b' });
    entryPos = { x: cx * 32, y: (cy + 2) * 32 }; 

    // Shops
    for(let y=5; y<10; y++) for(let x=5; x<12; x++) { map[y][x].type = 'wall'; map[y][x].solid = true; } 
    shopZones.push({x: 5*32, y: 10*32, w: 7*32, h: 2*32, type:'general'}); 

    for(let y=5; y<10; y++) for(let x=width-12; x<width-5; x++) { map[y][x].type = 'wall'; map[y][x].solid = true; } 
    shopZones.push({x: (width-12)*32, y: 10*32, w: 7*32, h: 2*32, type:'blacksmith'}); 

    return { map, enemies: [], resources: [], droppedItems: [], biome: 'Town', level: 0, lights, shopZones, entryPos };
  }

  // --- Boss Floor (Every 5 levels) ---
  if (level > 0 && level % 5 === 0) {
      // Create Big Arena
      for(let y=0; y<height; y++) {
          for(let x=0; x<width; x++) {
            if (x===0 || x===width-1 || y===0 || y===height-1) {
                map[y][x].type = 'wall'; map[y][x].solid = true;
            } else {
                map[y][x].type = 'floor'; map[y][x].solid = false;
            }
          }
      }
      
      // Spawn Boss
      const cx = Math.floor(width/2) * GAME_CONFIG.TILE_SIZE;
      const cy = Math.floor(height/2) * GAME_CONFIG.TILE_SIZE;
      
      const bossType = ENEMY_TYPES.find(e => e.name === 'Dragon') || ENEMY_TYPES[ENEMY_TYPES.length - 1];
      const boss = {
        id: `boss_${crypto.randomUUID()}`, type: 'enemy', race: bossType.name, rank: 'Boss', x: cx, y: cy, width: bossType.w * 2, height: bossType.h * 2,
        visualWidth: bossType.vw! * 2, visualHeight: bossType.vh! * 2, color: '#ff0000', shape: bossType.shape as ShapeType,
        hp: bossType.hp * 5 + (level * 20), maxHp: bossType.hp * 5 + (level * 20), attack: bossType.atk * 1.5, defense: level * 3, speed: bossType.spd * 1.2,
        level, direction: 1, dead: false, lastAttackTime: 0, attackCooldown: 800, detectionRange: 800, xpValue: bossType.xp * 10
      } as EnemyEntity;
      enemies.push(boss);
      bossId = boss.id;

      lights.push({ x: cx, y: cy, radius: 300, flicker: true, color: '#ff5252' });
      map[Math.floor(height/2) - 4][Math.floor(width/2)].type = 'stairs_down';
      entryPos = { x: (width/2) * 32, y: (height - 5) * 32 };

      return { map, enemies, resources: [], droppedItems: [], biome: 'Dungeon', level, lights, bossId, entryPos, shopZones: [] };
  }

  // --- Normal Dungeon Generation ---
  for(let y=0; y<height; y++) {
    for(let x=0; x<width; x++) {
      map[y][x].type = 'wall'; 
      map[y][x].solid = true;
    }
  }

  const rooms: {x: number, y: number, w: number, h: number}[] = [];
  const minRoomSize = 6;
  const maxRoomSize = 12;
  const maxRooms = 15; // Increased rooms for bigger map

  for (let i = 0; i < maxRooms; i++) {
    const w = Math.floor(Math.random() * (maxRoomSize - minRoomSize + 1)) + minRoomSize;
    const h = Math.floor(Math.random() * (maxRoomSize - minRoomSize + 1)) + minRoomSize;
    const x = Math.floor(Math.random() * (width - w - 2)) + 1;
    const y = Math.floor(Math.random() * (height - h - 2)) + 1;

    const newRoom = { x, y, w, h };
    rooms.push(newRoom);

    for (let ry = y; ry < y + h; ry++) {
      for (let rx = x; rx < x + w; rx++) {
        if (ry > 0 && ry < height -1 && rx > 0 && rx < width -1) {
            let floorType: TileType = 'floor';
            if (biome === 'Snow') floorType = 'snow';
            else if (biome === 'Desert') floorType = 'sand';
            else if (biome === 'Wasteland') floorType = 'dirt';
            
            map[ry][rx].type = floorType;
            map[ry][rx].solid = false;
        }
      }
    }
    
    if (Math.random() < 0.7) {
        const resType = biome === 'Forest' || biome === 'Plains' ? 'tree' : (Math.random() < 0.3 ? 'ore' : 'rock');
        const count = Math.floor(Math.random() * 3) + 1;
        for(let k=0; k<count; k++) {
            const rx = x + Math.floor(Math.random() * w);
            const ry = y + Math.floor(Math.random() * h);
            if (!map[ry][rx].solid) {
                resources.push({
                    id: crypto.randomUUID(), x: rx*32, y: ry*32, width: 32, height: 32, type: 'resource', resourceType: resType,
                    hp: 30, maxHp: 30, color: resType === 'tree' ? '#4caf50' : (resType === 'ore' ? '#ffeb3b' : '#9e9e9e'), dead: false
                });
            }
        }
    }
  }

  for (let i = 1; i < rooms.length; i++) {
      const prev = rooms[i-1];
      const curr = rooms[i];
      const prevCx = Math.floor(prev.x + prev.w / 2);
      const prevCy = Math.floor(prev.y + prev.h / 2);
      const currCx = Math.floor(curr.x + curr.w / 2);
      const currCy = Math.floor(curr.y + curr.h / 2);

      const carveH = (y: number, x1: number, x2: number) => {
          for (let x = Math.min(x1, x2); x <= Math.max(x1, x2); x++) {
              if (y > 0 && y < height-1 && x > 0 && x < width-1) {
                let floorType: TileType = 'floor';
                if (biome === 'Snow') floorType = 'snow';
                else if (biome === 'Desert') floorType = 'sand';
                else if (biome === 'Wasteland') floorType = 'dirt';
                map[y][x].type = floorType; map[y][x].solid = false;
                map[y+1][x].type = floorType; map[y+1][x].solid = false; 
              }
          }
      };
      const carveV = (x: number, y1: number, y2: number) => {
          for (let y = Math.min(y1, y2); y <= Math.max(y1, y2); y++) {
              if (y > 0 && y < height-1 && x > 0 && x < width-1) {
                let floorType: TileType = 'floor';
                if (biome === 'Snow') floorType = 'snow';
                else if (biome === 'Desert') floorType = 'sand';
                else if (biome === 'Wasteland') floorType = 'dirt';
                map[y][x].type = floorType; map[y][x].solid = false;
                map[y][x+1].type = floorType; map[y][x+1].solid = false; 
              }
          }
      };

      if (Math.random() < 0.5) { carveH(prevCy, prevCx, currCx); carveV(currCx, prevCy, currCy); } 
      else { carveV(prevCx, prevCy, currCy); carveH(currCy, prevCx, currCx); }
  }

  const getRandomFloorTile = () => {
      let limit = 1000;
      while(limit-- > 0) {
          const rx = Math.floor(Math.random() * (width - 2)) + 1;
          const ry = Math.floor(Math.random() * (height - 2)) + 1;
          if (!map[ry][rx].solid) return {x: rx, y: ry};
      }
      return {x: Math.floor(width/2), y: Math.floor(height/2)};
  };

  // Determine Entry Point (Safe spawn)
  const entryTile = getRandomFloorTile();
  entryPos = { x: entryTile.x * GAME_CONFIG.TILE_SIZE, y: entryTile.y * GAME_CONFIG.TILE_SIZE };

  // Determine Exit Point
  let stairsPos = getRandomFloorTile();
  // Ensure some distance between start and end
  while (Math.abs(stairsPos.x - entryTile.x) + Math.abs(stairsPos.y - entryTile.y) < 15) {
      stairsPos = getRandomFloorTile();
  }
  map[stairsPos.y][stairsPos.x].type = 'stairs_down';
  lights.push({ x: stairsPos.x * 32 + 16, y: stairsPos.y * 32 + 16, radius: 100, flicker: false, color: '#ffffff' });

  if (level % 5 === 0) {
      let portalPos = getRandomFloorTile();
      while (portalPos.x === stairsPos.x && portalPos.y === stairsPos.y) portalPos = getRandomFloorTile();
      map[portalPos.y][portalPos.x].type = 'return_portal';
      lights.push({ x: portalPos.x * 32 + 16, y: portalPos.y * 32 + 16, radius: 120, flicker: true, color: '#00e676' });
  }

  // Spawn Enemies with Safe Zone check
  const enemyCount = 5 + Math.floor(level * 0.5);
  let spawnedCount = 0;
  let attempts = 0;
  while (spawnedCount < enemyCount && attempts < 100) {
    attempts++;
    const pos = getRandomFloorTile();
    // Safe Zone Check: Don't spawn within 8 tiles of entry
    if (Math.abs(pos.x - entryTile.x) + Math.abs(pos.y - entryTile.y) < 8) continue;
    
    enemies.push(generateEnemy(pos.x * GAME_CONFIG.TILE_SIZE, pos.y * GAME_CONFIG.TILE_SIZE, level));
    spawnedCount++;
  }

  return { map, enemies, resources, droppedItems: [], biome, level, lights, entryPos, shopZones: [] };
};

const checkCollision = (rect1: Entity, rect2: Entity) => rect1.x < rect2.x + rect2.width && rect1.x + rect1.width > rect2.x && rect1.y < rect2.y + rect2.height && rect1.y + rect1.height > rect2.y;

const resolveMapCollision = (entity: Entity, dx: number, dy: number, map: Tile[][]): {x: number, y: number} => {
  const T = GAME_CONFIG.TILE_SIZE;
  const nextX = entity.x + dx, nextY = entity.y + dy;
  const startX = Math.floor(nextX / T), endX = Math.floor((nextX + entity.width) / T), startY = Math.floor(nextY / T), endY = Math.floor((nextY + entity.height) / T);
  if (startX < 0 || endX >= GAME_CONFIG.MAP_WIDTH || startY < 0 || endY >= GAME_CONFIG.MAP_HEIGHT) return { x: entity.x, y: entity.y };
  for (let y = startY; y <= endY; y++) for (let x = startX; x <= endX; x++) if (map[y]?.[x]?.solid) return { x: entity.x, y: entity.y };
  return { x: nextX, y: nextY };
};

const updatePlayerStats = (player: PlayerEntity) => {
  const attr = player.attributes;
  let maxHp = attr.vitality * 10, maxMp = attr.intelligence * 5, baseAtk = Math.floor(attr.strength * 1.5 + attr.dexterity * 0.5), baseDef = Math.floor(attr.endurance * 1.2), baseSpd = 3 + (attr.dexterity * 0.05);
  let equipAtk = 0, equipDef = 0, equipSpd = 0, equipHp = 0;
  Object.values(player.equipment).forEach(item => { if (item) { equipAtk += item.stats.attack; equipDef += item.stats.defense; equipSpd += item.stats.speed; equipHp += item.stats.maxHp; } });
  
  // Perks logic with levels
  player.perks.forEach(p => {
      const level = p.level;
      if (p.id === 'stone_skin') baseDef += 5 * level;
      if (p.id === 'berserker') baseAtk += 5 * level;
      if (p.id === 'vitality_boost') maxHp += 20 * level;
      if (p.id === 'swift_step') baseSpd *= (1 + 0.1 * level);
      if (p.id === 'glass_cannon') { baseAtk += (10 + 5 * level); baseDef = Math.max(0, baseDef - 5); }
      if (p.id === 'heavy_armor') { baseDef += (5 + 5 * level); baseSpd *= 0.9; }
      if (p.id === 'endurance') { /* MaxStamina is handled below */ }
      if (p.id === 'mana_well') { maxMp += 50 * level; /* Int boost omitted for simplicity in stat calc */ }
  });

  let maxStamina = 100 + (attr.endurance * 2);
  const endPerk = player.perks.find(p => p.id === 'endurance');
  if (endPerk) maxStamina += 50 * endPerk.level;

  let staminaRegen = GAME_CONFIG.STAMINA_REGEN + (attr.endurance * 0.05);
  
  let attackCooldown = 500;
  const hastePerk = player.perks.find(p => p.id === 'haste');
  if (hastePerk) attackCooldown = Math.max(200, 500 * (1 - 0.1 * hastePerk.level));

  player.calculatedStats = { maxHp: maxHp + equipHp, maxMp: maxMp, attack: baseAtk + equipAtk, defense: baseDef + equipDef, speed: baseSpd + equipSpd, maxStamina, staminaRegen, attackCooldown };
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
  const camX = Math.floor(state.player.x + state.player.width/2 - width/2);
  const camY = Math.floor(state.player.y + state.player.height/2 - height/2);
  ctx.translate(-camX, -camY);
  state.camera = { x: camX, y: camY };

  const startCol = Math.max(0, Math.floor(camX / T));
  const endCol = Math.min(GAME_CONFIG.MAP_WIDTH - 1, startCol + (width / T) + 1);
  const startRow = Math.max(0, Math.floor(camY / T));
  const endRow = Math.min(GAME_CONFIG.MAP_HEIGHT - 1, startRow + (height / T) + 1);

  // Layer 1: World
  for (let y = startRow; y <= endRow; y++) {
    for (let x = startCol; x <= endCol; x++) {
      const tile = state.map[y]?.[x];
      if (!tile) continue;
      let color = '#000';
      if (tile.type === 'grass') color = '#1b2e1b';
      else if (tile.type === 'dirt') color = '#3e2723';
      else if (tile.type === 'sand') color = '#fbc02d';
      else if (tile.type === 'snow') color = '#e3f2fd';
      else if (tile.type === 'rock') color = '#616161';
      else if (tile.type === 'wall') color = '#424242';
      else if (tile.type === 'water') color = '#1a237e';
      else if (tile.type === 'floor') color = '#37474f';
      else if (tile.type === 'town_floor') color = '#5d4037';
      else if (tile.type === 'dungeon_entrance') color = '#000';
      else if (tile.type === 'stairs_down') color = '#000';
      else if (tile.type === 'return_portal') color = '#000';

      ctx.fillStyle = color; ctx.fillRect(tile.x, tile.y, T, T);
      ctx.strokeStyle = 'rgba(0,0,0,0.05)'; ctx.strokeRect(tile.x, tile.y, T, T);

      if (tile.type === 'wall') { ctx.fillStyle = '#555'; ctx.fillRect(tile.x, tile.y, T, T-4); ctx.fillStyle = '#333'; ctx.fillRect(tile.x, tile.y+T-4, T, 4); }
      if (tile.type === 'stairs_down') { ctx.fillStyle = '#000'; ctx.fillRect(tile.x + 8, tile.y + 8, 16, 16); ctx.strokeStyle = '#fff'; ctx.strokeRect(tile.x + 8, tile.y + 8, 16, 16); ctx.fillStyle = '#fff'; ctx.font = '10px Arial'; ctx.textAlign='center'; ctx.fillText('DOWN', tile.x+16, tile.y+20); }
      if (tile.type === 'dungeon_entrance') { ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(tile.x+16, tile.y+16, 12, 0, Math.PI*2); ctx.fill(); ctx.fillStyle = '#f00'; ctx.font = '10px Arial'; ctx.textAlign='center'; ctx.fillText('IN', tile.x+16, tile.y+20); }
      if (tile.type === 'return_portal') { ctx.fillStyle = '#00e676'; ctx.beginPath(); ctx.arc(tile.x+16, tile.y+16, 10 + Math.sin(state.gameTime/5)*2, 0, Math.PI*2); ctx.fill(); }
    }
  }

  // Shop Zones Rendering (Visual indicators)
  if (state.dungeonLevel === 0 && state.shopZones) {
      state.shopZones.forEach(z => {
          ctx.fillStyle = 'rgba(255, 255, 0, 0.2)'; 
          ctx.fillRect(z.x, z.y, z.w, z.h);
          ctx.font = 'bold 14px Arial';
          ctx.fillStyle = '#fff';
          ctx.textAlign = 'center';
          ctx.fillText(z.type === 'general' ? 'General Store' : 'Blacksmith', z.x + z.w/2, z.y + z.h/2);
          ctx.font = '24px Arial';
          ctx.fillText(z.type === 'general' ? '🎒' : '🔨', z.x + z.w/2, z.y + z.h/2 - 20);
      });
  }

  // Layer 2: Entities
  state.droppedItems.forEach(drop => {
    const bob = Math.sin(state.gameTime / 10) * 5 + drop.bounceOffset;
    ctx.shadowColor = drop.item.color; ctx.shadowBlur = 10;
    ctx.fillStyle = '#8d6e63'; ctx.fillRect(drop.x + 8, drop.y + 8 + bob, 16, 16);
    ctx.fillStyle = drop.item.color; ctx.fillRect(drop.x + 8, drop.y + 12 + bob, 16, 4);
    ctx.font = '16px Arial'; ctx.textAlign = 'center'; ctx.fillText(drop.item.icon, drop.x + 16, drop.y + 4 + bob); ctx.shadowBlur = 0;
  });

  state.projectiles.forEach(proj => {
      ctx.fillStyle = proj.color;
      ctx.beginPath();
      ctx.arc(proj.x + proj.width/2, proj.y + proj.height/2, 4, 0, Math.PI*2);
      ctx.fill();
      ctx.strokeStyle = proj.color; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(proj.x + proj.width/2, proj.y + proj.height/2); ctx.lineTo(proj.x + proj.width/2 - proj.vx! * 2, proj.y + proj.height/2 - proj.vy! * 2); ctx.stroke();
  });

  state.resources.forEach(r => {
      let imgKey = r.resourceType === 'tree' ? 'Tree' : (r.resourceType === 'ore' ? 'Ore' : 'Rock');
      if (images[imgKey]) {
          const wobble = Math.sin(state.gameTime / 5) * (r.hp < r.maxHp ? 2 : 0);
          ctx.save(); ctx.translate(r.x + 16 + wobble, r.y + 16);
          ctx.drawImage(images[imgKey], -16, -16, 32, 32);
          ctx.restore();
      } else {
          ctx.fillStyle = r.color; ctx.fillRect(r.x, r.y, r.width, r.height);
      }
  });

  state.lights.forEach(l => {
      if (l.color === '#ff9800') { 
          const flick = l.flicker ? Math.random() * 2 : 0;
          ctx.fillStyle = '#5d4037'; ctx.fillRect(l.x - 2, l.y, 4, 10);
          ctx.fillStyle = '#ffeb3b'; ctx.beginPath(); ctx.arc(l.x, l.y, 4 + flick, 0, Math.PI*2); ctx.fill();
      }
  });

  const renderCharacter = (e: CombatEntity, icon?: string) => {
    const vw = e.visualWidth || e.width, vh = e.visualHeight || e.height;
    const centerX = e.x + e.width / 2, bottomY = e.y + e.height;
    let imgKey: string | null = null;
    if (e.type === 'player') imgKey = `${(e as PlayerEntity).job}_${(e as PlayerEntity).gender}`;
    else if (e.type === 'enemy') {
       const race = (e as EnemyEntity).race;
       if (race.includes('Slime') || race.includes('Jelly')) imgKey = 'Slime';
       else if (race.includes('Bandit')) imgKey = 'Bandit';
       else if (race.includes('Zombie') || race.includes('Ghoul')) imgKey = 'Zombie';
       else if (race.includes('Ant') || race.includes('Spider')) imgKey = 'Insect';
       else if (race.includes('Imp') || race.includes('Demon')) imgKey = 'Demon';
       else if (race.includes('Bat')) imgKey = 'Bat';
       else if (race.includes('Dragon')) imgKey = 'Dragon';
       else if (race.includes('Boar') || race.includes('Grizzly') || race.includes('Wolf')) imgKey = race.includes('Wolf') ? 'Wolf' : 'Beast';
       else if (race.includes('Ghost')) imgKey = 'Ghost';
    }

    ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.beginPath();
    ctx.ellipse(centerX, bottomY - 2, e.width/2 * (['flying','ghost'].includes(e.shape || '') ? 0.8 : 1.2), 4, 0, 0, Math.PI*2); ctx.fill();

    if (imgKey && images[imgKey]) {
      const isMoving = Math.abs(e.vx || 0) > 0.1 || Math.abs(e.vy || 0) > 0.1;
      const bounce = isMoving ? Math.sin(state.gameTime / 2) : 0;
      const scaleX = (isMoving ? 1 + bounce * 0.1 : 1) * (e.isAttacking ? 1.2 : 1) * (e.direction === 2 ? -1 : 1);
      const scaleY = (isMoving ? 1 - bounce * 0.1 : 1) * (e.isAttacking ? 0.8 : 1);
      ctx.save(); ctx.translate(centerX, bottomY + (bounce > 0 ? -bounce * 5 : 0));
      ctx.scale(scaleX, scaleY); ctx.drawImage(images[imgKey], -vw / 2, -vh, vw, vh); ctx.restore();
    } else {
      const bob = Math.sin(state.gameTime / 3) * ((Math.abs(e.vx||0)>0.1 || Math.abs(e.vy||0)>0.1) ? 2 : 0);
      ctx.fillStyle = e.color; if (e.shape === 'ghost') ctx.globalAlpha = 0.6;
      ctx.fillRect(e.x + (e.width-vw)/2, e.y + e.height - vh + bob, vw, vh); ctx.globalAlpha = 1.0;
      if (icon) { ctx.font = `${Math.min(vw, vh) * 0.6}px Arial`; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillStyle='#fff'; ctx.fillText(icon, e.x+e.width/2, e.y+e.height-vh/2+bob); }
    }
    if (e.type === 'enemy' && e.hp < e.maxHp) {
      const barX = centerX - vw/2, barY = bottomY - vh - 12;
      ctx.fillStyle='#000'; ctx.fillRect(barX, barY, vw, 4); ctx.fillStyle='#f44336'; ctx.fillRect(barX, barY, vw * (e.hp/e.maxHp), 4);
    }
  };

  [...state.enemies, state.player].sort((a,b)=>(a.y+a.height)-(b.y+b.height)).forEach(e => {
    if (e.dead) return;
    const icon = e.type==='player' ? JOB_DATA[(e as PlayerEntity).job]?.icon : ENEMY_TYPES.find(t=>t.name===(e as EnemyEntity).race)?.icon;
    renderCharacter(e as CombatEntity, icon);
  });

  if (state.player.isAttacking) {
    const weapon = state.player.equipment.mainHand;
    if (!weapon || (weapon.weaponClass !== 'Bow' && weapon.weaponClass !== 'Staff' && weapon.weaponClass !== 'Wand')) {
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.beginPath();
        const radius = Math.max(0, 60 * Math.min(Math.max((Date.now() - state.player.lastAttackTime) / 200, 0), 1));
        ctx.arc(state.player.x + state.player.width/2, state.player.y + state.player.height/2, radius, 0, Math.PI*2); ctx.stroke();
    }
  }

  state.floatingTexts.forEach(t => {
    ctx.font = 'bold 16px monospace'; ctx.fillStyle = 'black'; ctx.strokeStyle = 'white'; ctx.lineWidth = 2; ctx.textAlign = 'center';
    ctx.strokeText(t.text, t.x, t.y); ctx.fillStyle = t.color; ctx.fillText(t.text, t.x, t.y);
  });

  if (state.currentBiome === 'Dungeon') {
      ctx.globalCompositeOperation = 'multiply';
      ctx.fillStyle = '#000000'; ctx.fillRect(camX, camY, width, height); 
      ctx.globalCompositeOperation = 'destination-out';
      const drawLight = (x: number, y: number, r: number, flicker: boolean) => {
          const flickVal = flicker ? Math.random() * 5 : 0;
          const gradient = ctx.createRadialGradient(x, y, r * 0.2, x, y, r + flickVal);
          gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
          gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
          ctx.fillStyle = gradient; ctx.beginPath(); ctx.arc(x, y, r + flickVal, 0, Math.PI * 2); ctx.fill();
      };
      drawLight(state.player.x + state.player.width/2, state.player.y + state.player.height/2, 180, false);
      state.lights.forEach(l => { drawLight(l.x, l.y, l.radius, l.flicker); });
      state.projectiles.forEach(p => { drawLight(p.x + 4, p.y + 4, 30, true); });
      ctx.globalCompositeOperation = 'source-over'; 
  }

  ctx.restore();
};

/**
 * ############################################################################
 * SECTION 7: SUB-COMPONENTS (SCREENS & UI)
 * ############################################################################
 */

// ... (ShopMenu, TitleScreen, JobSelectScreen, InventoryMenu, LevelUpMenu) ...
const ShopMenu = ({ type, player, onClose, onBuy, onCraft }: any) => {
    return (
        <div className="absolute inset-0 bg-black/90 flex items-center justify-center z-50 p-8">
            <div className="bg-slate-800 border-2 border-slate-600 rounded-xl p-8 w-full max-w-2xl shadow-2xl relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white"><X size={24}/></button>
                <h2 className="text-3xl font-bold text-yellow-500 mb-6 flex items-center gap-3">
                    {type === 'general' ? <ShoppingBag size={32}/> : <Hammer size={32}/>}
                    {type === 'general' ? 'General Store' : 'Blacksmith Forge'}
                </h2>
                {type === 'general' ? (
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-700 p-4 rounded flex justify-between items-center">
                            <div className="flex items-center gap-3"><div className="text-2xl">🔥</div><div><div className="font-bold text-white">松明 (Torch)</div><div className="text-xs text-slate-400">暗闇を照らす</div></div></div>
                            <button onClick={() => onBuy('torch')} className="bg-yellow-600 hover:bg-yellow-500 px-4 py-2 rounded text-white font-bold flex items-center gap-1">50 <span className="text-xs">G</span></button>
                        </div>
                        <div className="bg-slate-700 p-4 rounded flex justify-between items-center">
                            <div className="flex items-center gap-3"><div className="text-2xl">🧪</div><div><div className="font-bold text-white">ポーション</div><div className="text-xs text-slate-400">HP 50回復</div></div></div>
                            <button onClick={() => onBuy('potion')} className="bg-yellow-600 hover:bg-yellow-500 px-4 py-2 rounded text-white font-bold flex items-center gap-1">100 <span className="text-xs">G</span></button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <p className="text-slate-400 mb-4">素材とゴールドを使って、新しい装備を作成します。</p>
                        <div className="bg-slate-700 p-4 rounded flex justify-between items-center">
                            <div><div className="font-bold text-white text-lg">ランダム装備作成</div><div className="text-xs text-slate-400">必要: 木材x2, 石x2, 200G</div></div>
                            <button onClick={onCraft} className="bg-blue-600 hover:bg-blue-500 px-6 py-3 rounded text-white font-bold uppercase tracking-wider">CRAFT</button>
                        </div>
                    </div>
                )}
                <div className="mt-8 pt-4 border-t border-slate-600 flex justify-between text-slate-300">
                    <div className="flex items-center gap-2"><Coins size={16} className="text-yellow-500"/> {player.gold} G</div>
                    <div className="flex gap-4">
                        <span className="flex items-center gap-1">🪵 {player.inventory.find((i:Item)=>i.name==='木材')?.count || 0}</span>
                        <span className="flex items-center gap-1">🪨 {player.inventory.find((i:Item)=>i.name==='石')?.count || 0}</span>
                        <span className="flex items-center gap-1">⛏️ {player.inventory.find((i:Item)=>i.name==='鉱石')?.count || 0}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

const TitleScreen = ({ onStart, onContinue, canContinue, resolution, setResolution }: any) => {
  const [showSettings, setShowSettings] = useState(false);
  return (
    <div className="w-full h-screen bg-slate-900 flex flex-col items-center justify-center text-white relative overflow-hidden font-sans bg-mist">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-30"></div>
      <div className="relative z-10 w-full h-full max-w-[177.78vh] max-h-[56.25vw] aspect-video m-auto flex flex-col items-center justify-center p-8">
        <div className={`text-center space-y-10 animate-fade-in transition-all duration-300 w-full ${showSettings ? 'blur-sm scale-95 opacity-50' : ''}`}>
          <div className="relative"><h1 className="text-6xl md:text-8xl lg:text-9xl font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 via-yellow-500 to-yellow-800 drop-shadow-2xl mb-4 text-shadow-strong tracking-tighter" style={{ filter: 'drop-shadow(0 0 30px rgba(234,179,8,0.6))'}}>QUEST OF HARVEST</h1><p className="text-red-400 tracking-[1.2em] text-sm md:text-lg uppercase font-serif mt-6 border-t border-b border-red-900 py-3 inline-block bg-black/40 backdrop-blur-sm px-8 rounded-full">Phase 5: Boss Battle</p></div>
          <div className="flex flex-col gap-4 w-80 md:w-96 mx-auto">
            <button onClick={onStart} className="group relative flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-red-900/90 to-black/90 border-2 border-red-700/50 hover:border-red-500 transition-all duration-300 text-red-100 font-black tracking-widest uppercase text-lg shadow-lg hover:shadow-red-500/20 transform hover:-translate-y-1"><Play size={24} className="group-hover:text-red-400 transition-colors" /><span>New Game</span></button>
            <button onClick={onContinue} disabled={!canContinue} className={`flex items-center justify-center gap-3 px-8 py-3 border-2 font-bold tracking-widest uppercase transition-all text-base backdrop-blur-sm ${canContinue ? 'bg-slate-800/50 border-slate-600 hover:border-blue-400 hover:bg-slate-700/80 text-slate-200' : 'bg-slate-900/50 border-slate-800 text-slate-600 cursor-not-allowed'}`}><Save size={20} /><span>Continue</span></button>
            <button onClick={() => setShowSettings(true)} className="flex items-center justify-center gap-3 px-8 py-3 border-2 border-slate-700 bg-slate-800/30 hover:bg-slate-800/60 hover:border-slate-500 font-bold tracking-widest uppercase text-slate-300 hover:text-white backdrop-blur-sm text-base"><Settings size={20} /><span>Settings</span></button>
          </div>
        </div>
        {showSettings && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md animate-fade-in">
            <div className="bg-slate-900 p-8 rounded-xl border-2 border-slate-600 w-[400px] shadow-2xl transform scale-100 transition-all">
              <div className="flex justify-between items-center mb-8 border-b border-slate-700 pb-4"><h2 className="text-2xl font-bold text-white flex items-center gap-2"><Settings className="text-slate-400" /> SETTINGS</h2><button onClick={() => setShowSettings(false)} className="text-slate-400 hover:text-white transition-colors p-1 hover:bg-slate-800 rounded-full"><X size={24} /></button></div>
              <div className="space-y-6">
                <div><label className="block text-xs font-bold text-slate-400 uppercase mb-3 flex items-center gap-2"><Monitor size={16} /> Screen Resolution</label><div className="grid grid-cols-1 gap-2">{[{ label: 'AUTO', val: 'auto' }, { label: 'SVGA (800x600)', val: '800x600' }, { label: 'HD (1280x720)', val: '1280x720' }].map(opt => (<button key={opt.val} onClick={() => setResolution(opt.val as ResolutionMode)} className={`flex flex-col items-start p-3 rounded border transition-all ${resolution === opt.val ? 'bg-yellow-600/20 border-yellow-500 text-yellow-100' : 'bg-slate-800 border-slate-700 text-slate-400'}`}><span className="font-bold text-sm">{opt.label}</span></button>))}</div></div>
              </div>
              <button onClick={() => setShowSettings(false)} className="w-full mt-8 py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded transition-colors uppercase tracking-wider text-sm">Close</button>
            </div>
          </div>
        )}
      </div>
      <div className="absolute bottom-8 text-xs text-slate-500 font-mono tracking-wider opacity-60">WASD: MOVE • SHIFT: DASH • SPACE: ATTACK • Q: POTION • F: ACTION</div>
    </div>
  );
};

const JobSelectScreen = ({ onBack, onSelect, loadedAssets }: any) => {
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

const GameHUD = ({ uiState, dungeonLevel, toggleMenu, activeShop, bossData }: any) => (
  <>
    {/* Boss HP Bar */}
    {bossData && !bossData.dead && (
      <div className="absolute top-4 left-1/2 -translate-x-1/2 w-[600px] z-50 pointer-events-none">
          <div className="flex justify-between text-red-500 font-bold mb-1 items-center">
              <span className="flex items-center gap-2 text-xl filter drop-shadow-md"><Skull size={24}/> {bossData.race}</span>
              <span className="text-sm">{bossData.hp}/{bossData.maxHp}</span>
          </div>
          <div className="h-6 bg-slate-900/80 border-2 border-red-900 rounded overflow-hidden relative shadow-[0_0_20px_rgba(220,38,38,0.5)]">
              <div className="h-full bg-gradient-to-r from-red-900 via-red-600 to-red-500 transition-all duration-300" style={{ width: `${(bossData.hp/bossData.maxHp)*100}%` }}></div>
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
          </div>
      </div>
    )}

    <div className="absolute top-4 right-20 flex gap-4 text-white pointer-events-none">
       <div className="bg-slate-900/80 px-4 py-2 rounded border border-slate-700 flex items-center gap-2"><Compass size={16} className="text-yellow-500" /><span className="font-mono font-bold text-lg">{dungeonLevel === 0 ? "Town of Beginnings" : `Floor B${dungeonLevel}`}</span></div>
    </div>
    <div className="absolute top-4 left-4 flex gap-4 pointer-events-none">
      <div className="bg-slate-900/90 border border-slate-700 p-3 rounded text-white w-64 shadow-lg pointer-events-auto">
        <div className="flex justify-between items-center mb-2"><span className="font-bold text-yellow-500">{uiState.job} Lv.{uiState.level}</span><span className="text-xs text-slate-400">GOLD: {uiState.gold}</span></div>
        <div className="mb-2 space-y-1 text-xs text-slate-300">
           <div className="flex justify-between"><span>攻撃: {uiState.attack}</span><span>防御: {uiState.defense}</span></div>
           <div className="flex justify-between"><span>速度: {uiState.speed.toFixed(1)}</span></div>
        </div>
        <div className="mb-1">
          <div className="flex justify-between text-xs mb-0.5"><span className="text-green-400">ST</span><span>{Math.floor(uiState.stamina)}/{uiState.calculatedStats.maxStamina}</span></div>
          <div className="h-1 bg-slate-700 rounded-full overflow-hidden"><div className="h-full bg-green-500 transition-all duration-75" style={{ width: `${(uiState.stamina/uiState.calculatedStats.maxStamina)*100}%` }}></div></div>
        </div>
        <div className="mb-1">
          <div className="flex justify-between text-xs mb-0.5"><span>HP</span><span>{uiState.hp}/{uiState.maxHp}</span></div>
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden"><div className="h-full bg-red-600 transition-all duration-300" style={{ width: `${(uiState.hp/uiState.maxHp)*100}%` }}></div></div>
        </div>
         <div>
          <div className="flex justify-between text-xs mb-0.5"><span>XP</span><span>{uiState.xp}/{uiState.nextLevelXp}</span></div>
          <div className="h-1 bg-slate-700 rounded-full overflow-hidden"><div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${(uiState.xp/uiState.nextLevelXp)*100}%` }}></div></div>
        </div>
        <div className="mt-2 pt-2 border-t border-slate-700 flex flex-wrap gap-1">
          {uiState.perks.map((p: any) => {
             const def = PERK_DEFINITIONS[p.id];
             if(!def) return null;
             const Icon = def.icon;
             return <div key={p.id} className="w-6 h-6 rounded bg-slate-800 flex items-center justify-center border border-slate-600 text-slate-300 relative" title={`${def.name} Lv.${p.level}`}><Icon size={12} style={{color:def.color}}/>
             {p.level > 1 && <span className="absolute -top-1 -right-1 text-[8px] bg-black text-white px-0.5 rounded border border-slate-500">{p.level}</span>}
             </div>;
          })}
        </div>
      </div>
    </div>
    {activeShop && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-yellow-500/80 text-black px-4 py-2 rounded-full animate-bounce font-bold border-2 border-white pointer-events-none">
            PRESS F TO SHOP
        </div>
    )}
    <div className="absolute top-4 right-4 flex gap-2 pointer-events-auto">
      <button onClick={() => toggleMenu('inventory')} className="p-2 bg-slate-800 text-white rounded hover:bg-slate-700 border border-slate-600 relative"><ShoppingBag size={20} />{uiState?.inventory.length ? <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span> : null}</button>
      <button onClick={() => toggleMenu('stats')} className="p-2 bg-slate-800 text-white rounded hover:bg-slate-700 border border-slate-600 relative"><User size={20} />{uiState && uiState.statPoints > 0 ? <span className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></span> : null}</button>
      <button onClick={() => toggleMenu('status')} className="p-2 bg-slate-800 text-white rounded hover:bg-slate-700 border border-slate-600"><Settings size={20} /></button>
    </div>
  </>
);

const InventoryMenu = ({ uiState, onEquip, onUnequip, onClose }: any) => (
  <div className="bg-slate-900 border border-slate-600 rounded-lg w-full max-w-4xl h-[600px] flex text-white overflow-hidden shadow-2xl">
    <div className="w-1/3 bg-slate-800/50 p-6 border-r border-slate-700 flex flex-col gap-4">
      <h3 className="text-xl font-bold text-yellow-500 mb-2 border-b border-slate-700 pb-2">装備</h3>
      {[{ slot: 'mainHand', label: '右手', icon: '⚔️' }, { slot: 'offHand', label: '左手', icon: '🛡️' }, { slot: 'helm', label: '頭', icon: '🪖' }, { slot: 'armor', label: '体', icon: '🛡️' }, { slot: 'boots', label: '足', icon: '👢' }].map((s) => {
        const item = uiState.equipment[s.slot];
        return (
          <div key={s.slot} className="flex items-center gap-3 p-2 bg-slate-800 rounded border border-slate-700 relative group">
            <div className="w-10 h-10 bg-slate-900 flex items-center justify-center text-2xl border border-slate-600 rounded">{item ? item.icon : s.icon}</div>
            <div className="flex-1">
              <div className="text-xs text-slate-400 uppercase">{s.label}</div>
              <div className={`font-bold text-sm ${item ? '' : 'text-slate-600'}`} style={{ color: item?.color }}>{item ? item.name : 'なし'}</div>
              {item && (
                <div className="text-[10px] text-slate-300 grid grid-cols-2 gap-x-1 mt-0.5">
                  {item.stats.attack > 0 && <span>攻+{item.stats.attack}</span>}
                  {item.stats.defense > 0 && <span>防+{item.stats.defense}</span>}
                  {item.stats.speed > 0 && <span>速+{item.stats.speed}</span>}
                  {item.stats.maxHp > 0 && <span>HP+{item.stats.maxHp}</span>}
                </div>
              )}
            </div>
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
            <div className="w-12 h-12 bg-slate-900 flex items-center justify-center text-2xl border border-slate-600 rounded shrink-0 relative">
                {item.icon}
                {item.count && item.count > 1 && <span className="absolute bottom-0 right-0 bg-black/80 text-white text-[10px] px-1 rounded">{item.count}</span>}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold truncate" style={{ color: item.color }}>{item.name}</div>
              <div className="text-xs text-slate-400">{item.type} {item.subType ? `(${item.subType})` : ''}</div>
              <div className="text-xs mt-1 grid grid-cols-2 gap-x-2 text-slate-300">
                {item.stats.attack > 0 && <span>攻撃 +{item.stats.attack}</span>} {item.stats.defense > 0 && <span>防御 +{item.stats.defense}</span>}
                {(item.type === 'Consumable' || item.type === 'Material') && <span className="text-yellow-300">{item.type === 'Consumable' ? '消耗品' : '素材'}</span>}
              </div>
            </div>
          </div>
        ))}
        {uiState.inventory.length === 0 && (<div className="col-span-2 text-center text-slate-500 py-10">アイテムがありません。</div>)}
      </div>
    </div>
  </div>
);

const LevelUpMenu = ({ options, onSelect }: { options: PerkData[], onSelect: (perkId: string) => void }) => {
  return (
    <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center z-50 animate-fade-in p-8">
      <h2 className="text-4xl font-extrabold text-yellow-500 mb-2 uppercase tracking-widest text-shadow-strong">Level Up!</h2>
      <p className="text-slate-400 mb-12">Select a new ability or upgrade existing one</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
        {options.map((perk, i) => {
           const Icon = perk.icon;
           // @ts-ignore
           const isUpgrade = perk.currentLevel !== undefined && perk.currentLevel > 0;
           return (
             <button key={perk.id} onClick={() => onSelect(perk.id)} className="group relative bg-slate-800 border-2 border-slate-600 hover:border-white p-6 rounded-xl transition-all hover:-translate-y-2 hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] flex flex-col items-center text-center overflow-hidden" style={{ animationDelay: `${i*100}ms` }}>
               <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
               <div className="w-24 h-24 rounded-full bg-slate-900 flex items-center justify-center mb-6 border border-slate-700 group-hover:border-white/50 transition-colors shadow-xl"><Icon size={48} style={{ color: perk.color }} className="group-hover:scale-110 transition-transform" /></div>
               <h3 className="text-xl font-bold text-white mb-2 uppercase tracking-wider">{perk.name}</h3>
               <span className={`text-xs px-2 py-1 rounded mb-4 font-bold uppercase ${perk.rarity === 'Legendary' ? 'bg-orange-500/20 text-orange-400' : perk.rarity === 'Rare' ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-700 text-slate-400'}`}>{perk.rarity}</span>
               {isUpgrade && <span className="text-xs text-green-400 font-bold mb-2">Upgrade to Lv.{(perk as any).currentLevel + 1}</span>}
               <p className="text-sm text-slate-400 leading-relaxed">{perk.desc}</p>
             </button>
           );
        })}
      </div>
    </div>
  );
};

export default function App() {
  const [screen, setScreen] = useState<'auth' | 'title' | 'game' | 'job_select'>('auth');
  const [saveData, setSaveData] = useState<any>(null);
  const [loadingMessage, setLoadingMessage] = useState('クラウドに接続中...');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameState = useRef<GameState | null>(null);
  const reqRef = useRef<number>();
  const input = useRef({ keys: {} as Record<string, boolean>, mouse: {x:0, y:0, down: false} });
  const [uiState, setUiState] = useState<PlayerEntity | null>(null);
  const [dungeonLevel, setDungeonLevel] = useState(0);
  const [activeMenu, setActiveMenu] = useState<MenuType>('none');
  const [levelUpOptions, setLevelUpOptions] = useState<PerkData[] | null>(null);
  const [activeShopType, setActiveShopType] = useState<'blacksmith' | 'general' | null>(null); 
  const activeShopTypeRef = useRef<'blacksmith' | 'general' | null>(null); // New Ref for game loop sync
  const [activeBossData, setActiveBossData] = useState<EnemyEntity | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [viewportSize, setViewportSize] = useState({ width: 800, height: 600 });
  const [resolution, setResolution] = useState<ResolutionMode>('auto'); 
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const loadedAssets = useMemo(() => {
    const images: Record<string, HTMLImageElement> = {};
    Object.entries(ASSETS_SVG).forEach(([key, svg]) => { const img = new Image(); img.src = svgToUrl(svg); images[key] = img; });
    return images;
  }, []);

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
        setLoadingMessage("オフラインモードで起動します...");
        setTimeout(() => setScreen('title'), 1500);
      }
    };
    initAuth();
    return onAuthStateChanged(auth, (u) => { setUser(u); if (u) checkSaveData(u.uid); });
  }, []);

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
      if (!input.current.keys[e.key.toLowerCase()]) { 
          if (e.key.toLowerCase() === 'i') setActiveMenu(prev => prev === 'inventory' ? 'none' : 'inventory');
          if (e.key.toLowerCase() === 'c') setActiveMenu(prev => prev === 'stats' ? 'none' : 'stats');
          if (e.key.toLowerCase() === 'f') interactAction();
          if (e.key.toLowerCase() === 'q') usePotion();
      }
      input.current.keys[e.key.toLowerCase()] = true;
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
  }, [resolution]);

  const checkSaveData = async (uid: string) => {
    if (!db) { setScreen('title'); return; }
    try {
      const snap = await getDoc(doc(db, 'artifacts', appId, 'users', uid, 'saves', 'slot1'));
      if (snap.exists()) setSaveData(snap.data());
      setScreen('title');
    } catch (e) { setScreen('title'); }
  };

  const startGame = (job: Job, gender: Gender = 'Male', load = false) => {
    let player: PlayerEntity, dungeonLevel = 0;
    if (load && saveData) {
      player = { ...saveData.player };
      dungeonLevel = 0; 
      updatePlayerStats(player);
    } else {
      player = createPlayer(job, gender); updatePlayerStats(player);
      player.inventory.push({ id: crypto.randomUUID(), name: "松明", type: "Consumable", rarity: "Common", level: 1, stats: { attack:0, defense:0, speed:0, maxHp:0 }, enchantments: [], icon: "🔥", color: "#ff9800", count: 3 });
      
      let starterWeapon = generateRandomItem(1);
      if (starterWeapon) {
          starterWeapon.type = 'Weapon'; // Force Weapon type
          starterWeapon.stats = { attack: 5, defense: 0, speed: 0, maxHp: 0 }; // Basic stats

          if (job === 'Swordsman') { 
              starterWeapon.name = "訓練用の剣"; 
              starterWeapon.weaponClass = 'Sword'; 
              starterWeapon.subType = 'OneHanded'; 
              starterWeapon.icon = ICONS.Weapon.OneHanded; 
          }
          else if (job === 'Warrior') { 
              starterWeapon.name = "錆びた斧"; 
              starterWeapon.weaponClass = 'Axe'; 
              starterWeapon.subType = 'TwoHanded'; 
              starterWeapon.icon = ICONS.Weapon.TwoHanded; 
              starterWeapon.stats.attack = 8;
              starterWeapon.stats.speed = -1;
          }
          else if (job === 'Archer') { 
              starterWeapon.name = "練習用の弓"; 
              starterWeapon.weaponClass = 'Bow'; 
              starterWeapon.subType = 'TwoHanded'; 
              starterWeapon.icon = ICONS.Weapon.Bow; 
              starterWeapon.stats.attack = 4;
              starterWeapon.stats.speed = 1;
          }
          else if (job === 'Mage') { 
              starterWeapon.name = "古い杖"; 
              starterWeapon.weaponClass = 'Staff'; 
              starterWeapon.subType = 'TwoHanded'; 
              starterWeapon.icon = ICONS.Weapon.Staff; 
              starterWeapon.stats.attack = 3;
          }
          player.inventory.push(starterWeapon);
      }
    }
    const floorData = generateFloor(dungeonLevel);
    
    if (dungeonLevel === 0) {
        player.x = (GAME_CONFIG.MAP_WIDTH * GAME_CONFIG.TILE_SIZE) / 2;
        player.y = (GAME_CONFIG.MAP_HEIGHT * GAME_CONFIG.TILE_SIZE) / 2 + 64; 
    } else {
        player.x = (GAME_CONFIG.MAP_WIDTH * GAME_CONFIG.TILE_SIZE) / 2;
        player.y = (GAME_CONFIG.MAP_HEIGHT * GAME_CONFIG.TILE_SIZE) / 2;
    }

    gameState.current = {
      dungeonLevel,
      currentBiome: floorData.biome,
      map: floorData.map,
      player,
      enemies: floorData.enemies,
      resources: floorData.resources,
      droppedItems: floorData.droppedItems,
      projectiles: [], particles: [], floatingTexts: [],
      camera: { x: 0, y: 0 }, gameTime: 0, isPaused: false,
      levelUpOptions: null,
      lights: floorData.lights,
      shopZones: floorData.shopZones,
      activeShop: null,
      activeBossId: floorData.bossId || null 
    };
    setDungeonLevel(dungeonLevel);
    setScreen('game');
  };

  const transitionLevel = (newLevel: number) => {
    if (!gameState.current) return;
    const state = gameState.current;
    const floorData = generateFloor(newLevel);
    state.dungeonLevel = newLevel;
    state.currentBiome = floorData.biome;
    state.map = floorData.map;
    state.enemies = floorData.enemies;
    state.resources = floorData.resources;
    state.droppedItems = floorData.droppedItems;
    state.lights = floorData.lights; 
    state.shopZones = floorData.shopZones || []; // Fallback to empty array if undefined
    state.activeBossId = floorData.bossId || null; 
    state.projectiles = [];
    state.particles = [];
    setActiveBossData(null); 
    
    if (floorData.entryPos) {
        state.player.x = floorData.entryPos.x;
        state.player.y = floorData.entryPos.y;
    }

    if (newLevel === 0) {
      setMessage("街に戻りました。");
    } else {
      setMessage(`B${newLevel}F に到達！`);
    }
    setDungeonLevel(newLevel);
    setTimeout(() => setMessage(null), 3000);
  };

  const handleDeath = () => {
    if (!gameState.current) return;
    const p = gameState.current.player;
    p.inventory = [];
    p.equipment = {};
    p.gold = Math.floor(p.gold / 2);
    p.xp = 0; 
    p.hp = p.maxHp;
    p.perks = []; 
    updatePlayerStats(p); 
    transitionLevel(0);
    setMessage("YOU DIED - 全アイテムを失いました");
    setTimeout(() => setMessage(null), 5000);
  };

  const interactAction = () => {
      if (!gameState.current || gameState.current.isPaused) return;
      const state = gameState.current;
      
      if (state.activeShop) {
          setActiveMenu('shop');
          return;
      }
      useTorch();
  };

  const useTorch = () => {
      if (!gameState.current) return;
      const p = gameState.current.player;
      const torchIndex = p.inventory.findIndex(i => i.name === "松明");
      if (torchIndex === -1) {
          setMessage("松明を持っていません");
          setTimeout(() => setMessage(null), 1500);
          return;
      }

      const torch = p.inventory[torchIndex];
      if (torch.count && torch.count > 1) torch.count--; else p.inventory.splice(torchIndex, 1);

      gameState.current.lights.push({
          x: p.x + p.width/2,
          y: p.y + p.height/2,
          radius: 120,
          flicker: true,
          color: '#ff9800'
      });
      setMessage("松明を設置しました");
      setTimeout(() => setMessage(null), 1500);
  };

  const usePotion = () => {
      if (!gameState.current || gameState.current.isPaused) return;
      const p = gameState.current.player;
      const potionIndex = p.inventory.findIndex(i => i.name === "ポーション");
      
      if (potionIndex === -1) {
          setMessage("ポーションを持っていません！");
          setTimeout(() => setMessage(null), 1500);
          return;
      }

      const potion = p.inventory[potionIndex];
      if (potion.count && potion.count > 1) potion.count--; else p.inventory.splice(potionIndex, 1);
      
      const healAmount = Math.floor(p.maxHp * 0.3);
      p.hp = Math.min(p.maxHp, p.hp + healAmount);
      
      setMessage(`ポーションを使用しました (+${healAmount} HP)`);
      setTimeout(() => setMessage(null), 1500);
      setUiState({...p});
  };

  const handleShopBuy = (itemKey: string) => {
      if (!gameState.current) return;
      const p = gameState.current.player;
      
      if (itemKey === 'torch') {
          if (p.gold < 50) { setMessage("ゴールドが足りません！"); return; }
          p.gold -= 50;
          const existing = p.inventory.find(i => i.name === "松明");
          if (existing) existing.count = (existing.count || 1) + 1;
          else p.inventory.push({ id: crypto.randomUUID(), name: "松明", type: "Consumable", rarity: "Common", level: 1, stats: { attack:0, defense:0, speed:0, maxHp:0 }, enchantments: [], icon: "🔥", color: "#ff9800", count: 1 });
      } else if (itemKey === 'potion') {
          if (p.gold < 100) { setMessage("ゴールドが足りません！"); return; }
          p.gold -= 100;
          const existing = p.inventory.find(i => i.name === "ポーション");
          if (existing) existing.count = (existing.count || 1) + 1;
          else p.inventory.push({ id: crypto.randomUUID(), name: "ポーション", type: "Consumable", rarity: "Common", level: 1, stats: { attack:0, defense:0, speed:0, maxHp:0 }, enchantments: [], icon: "🧪", color: "#f44336", count: 1 });
      }
      setUiState({...p}); 
  };

  const handleCraft = () => {
      if (!gameState.current) return;
      const p = gameState.current.player;
      
      const wood = p.inventory.find(i => i.name === "木材");
      const stone = p.inventory.find(i => i.name === "石");
      
      if (!wood || !wood.count || wood.count < 2 || !stone || !stone.count || stone.count < 2 || p.gold < 200) {
          setMessage("素材またはゴールドが足りません (木材x2, 石x2, 200G)");
          setTimeout(() => setMessage(null), 2000);
          return;
      }

      wood.count -= 2; if(wood.count<=0) p.inventory = p.inventory.filter(i=>i.id!==wood.id);
      stone.count -= 2; if(stone.count<=0) p.inventory = p.inventory.filter(i=>i.id!==stone.id);
      p.gold -= 200;

      const item = generateRandomItem(Math.max(5, p.level + 2), 2);
      if (item) {
          p.inventory.push(item);
          setMessage(`${item.name}を作成しました！`);
          setTimeout(() => setMessage(null), 2000);
      }
      setUiState({...p});
  };

  const triggerLevelUp = () => {
    if (!gameState.current) return;
    gameState.current.isPaused = true;
    const allPerks = Object.values(PERK_DEFINITIONS);
    const shuffled = allPerks.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 3);
    const optionsWithLevel = selected.map(p => {
        const existing = gameState.current!.player.perks.find(ep => ep.id === p.id);
        return {
            ...p,
            currentLevel: existing ? existing.level : 0
        };
    });
    setLevelUpOptions(optionsWithLevel);
    setActiveMenu('level_up');
  };

  const selectPerk = (perkId: string) => {
    if (!gameState.current) return;
    const p = gameState.current.player;
    const existing = p.perks.find(pk => pk.id === perkId);
    if (existing) { existing.level++; } else { p.perks.push({ id: perkId, level: 1 }); }
    updatePlayerStats(p);
    gameState.current.isPaused = false;
    setActiveMenu('none');
    setLevelUpOptions(null);
    const perkName = PERK_DEFINITIONS[perkId].name;
    const newLevel = existing ? existing.level : 1;
    setMessage(`${perkName} (Lv.${newLevel}) を習得しました！`);
    setTimeout(() => setMessage(null), 3000);
  };

  const gameLoop = () => {
    if (!gameState.current || !canvasRef.current) { reqRef.current = requestAnimationFrame(gameLoop); return; }
    const state = gameState.current; const ctx = canvasRef.current.getContext('2d'); if (!ctx) return;
    if (!state.isPaused && activeMenu === 'none') {
      state.gameTime++;
      const p = state.player;
      
      if (p.stamina < p.calculatedStats.maxStamina) {
          p.stamina = Math.min(p.calculatedStats.maxStamina, p.stamina + p.calculatedStats.staminaRegen);
      }

      const isDashing = (input.current.keys['shift']) && p.stamina > 0;
      let spd = p.speed * (isDashing ? 1.8 : 1);
      if (isDashing) {
          p.stamina = Math.max(0, p.stamina - GAME_CONFIG.STAMINA_DASH_COST);
      }

      let dx = 0, dy = 0;
      if (input.current.keys['w'] || input.current.keys['arrowup']) dy = -spd;
      if (input.current.keys['s'] || input.current.keys['arrowdown']) dy = spd;
      if (input.current.keys['a'] || input.current.keys['arrowleft']) dx = -spd;
      if (input.current.keys['d'] || input.current.keys['arrowright']) dx = spd;
      if (dx > 0) p.direction = 0; if (dx < 0) p.direction = 2; if (dy > 0) p.direction = 1; if (dy < 0) p.direction = 3;
      if (dx !== 0 && dy !== 0) { dx *= 0.707; dy *= 0.707; }
      p.vx = dx; p.vy = dy;

      if (dx !== 0 || dy !== 0) {
        const nextPos = resolveMapCollision(p, dx, dy, state.map); p.x = nextPos.x; p.y = nextPos.y;
      }

      const cx = Math.floor((p.x + p.width/2) / GAME_CONFIG.TILE_SIZE);
      const cy = Math.floor((p.y + p.height/2) / GAME_CONFIG.TILE_SIZE);
      const currentTile = state.map[cy]?.[cx];
      if (currentTile) {
        if (currentTile.type === 'dungeon_entrance') transitionLevel(1);
        else if (currentTile.type === 'stairs_down') transitionLevel(state.dungeonLevel + 1);
        else if (currentTile.type === 'return_portal') transitionLevel(0);
      }

      let inShop: 'blacksmith' | 'general' | null = null;
      if (state.shopZones) {
          for (const zone of state.shopZones) {
              if (p.x < zone.x + zone.w && p.x + p.width > zone.x && p.y < zone.y + zone.h && p.y + p.height > zone.y) {
                  inShop = zone.type;
                  break;
              }
          }
      }
      state.activeShop = inShop;
      
      // FIX: Use Ref to track and update activeShopType state correctly in loop
      if (inShop !== activeShopTypeRef.current) {
          activeShopTypeRef.current = inShop;
          setActiveShopType(inShop);
      }

      state.droppedItems.forEach(drop => {
        if (checkCollision(p, drop)) {
          drop.dead = true; 
          if (drop.item.type === 'Consumable' || drop.item.type === 'Material') {
              const existing = p.inventory.find(i => i.name === drop.item.name);
              if (existing) existing.count = (existing.count || 1) + (drop.item.count || 1);
              else p.inventory.push(drop.item);
          } else {
              p.inventory.push(drop.item);
          }
          state.floatingTexts.push({ id: crypto.randomUUID(), x: p.x, y: p.y - 20, width:0, height:0, color: drop.item.color, type: 'text', dead: false, text: drop.item.name, life: 60 });
          setMessage(`拾った：${drop.item.name}`); setTimeout(() => setMessage(null), 2000);
        }
      });

      // Update Projectiles
      state.projectiles.forEach(proj => {
          proj.life--;
          if (proj.life <= 0) { proj.dead = true; return; }
          const nextX = proj.x + proj.vx!;
          const nextY = proj.y + proj.vy!;
          const tileX = Math.floor(nextX / 32);
          const tileY = Math.floor(nextY / 32);
          if (state.map[tileY]?.[tileX]?.solid) { proj.dead = true; return; }
          proj.x = nextX;
          proj.y = nextY;
          state.enemies.forEach(e => {
              if (!e.dead && checkCollision(proj, e)) {
                  proj.dead = true;
                  e.hp -= proj.damage;
                  state.floatingTexts.push({ id: crypto.randomUUID(), x: e.x + e.width/2, y: e.y, width:0, height:0, color: '#fff', type: 'text', dead: false, text: `-${proj.damage}`, life: 30 });
                  if (e.hp <= 0) {
                      e.dead = true; 
                      let xpMult = 1.0;
                      const wis = p.perks.find(pk => pk.id === 'wisdom');
                      if (wis) xpMult = 1.0 + (0.2 * wis.level);
                      p.xp += Math.floor(e.xpValue * xpMult);
                      let goldMult = 1.0;
                      const rush = p.perks.find(pk => pk.id === 'gold_rush');
                      if (rush) goldMult = 1.0 + (0.5 * rush.level);
                      p.gold += Math.floor((Math.random() * 5 * (state.dungeonLevel || 1) + 1) * goldMult);
                      state.floatingTexts.push({ id: crypto.randomUUID(), x: e.x + e.width/2, y: e.y, width:0, height:0, color: '#ffd700', type: 'text', dead: false, text: `+${Math.floor(e.xpValue * xpMult)} XP`, life: 45 });
                      const vampire = p.perks.find(pk => pk.id === 'vampire');
                      if (vampire) { const heal = 3 + (2 * vampire.level); p.hp = Math.min(p.maxHp, p.hp + heal); state.floatingTexts.push({ id: crypto.randomUUID(), x: p.x + p.width/2, y: p.y - 30, width:0, height:0, color: '#f43f5e', type: 'text', dead: false, text: `+${heal} HP`, life: 45 }); }
                      if (p.xp >= p.nextLevelXp) { p.level++; p.xp -= p.nextLevelXp; p.nextLevelXp = Math.floor(p.nextLevelXp * 1.5); p.statPoints += 3; updatePlayerStats(p); p.hp = p.maxHp; state.floatingTexts.push({ id: crypto.randomUUID(), x: p.x, y: p.y - 40, width:0, height:0, color: '#00ff00', type: 'text', dead: false, text: "LEVEL UP!", life: 90 }); triggerLevelUp(); }
                      const dropChance = GAME_CONFIG.BASE_DROP_RATE * (e.rank === 'Boss' ? 5 : e.rank === 'Elite' ? 2 : 1);
                      if (Math.random() < dropChance) { const item = generateRandomItem(state.dungeonLevel || 1, e.rank === 'Boss' ? 5 : e.rank === 'Elite' ? 2 : 0); if (item) state.droppedItems.push({ id: crypto.randomUUID(), type: 'drop', x: e.x, y: e.y, width: 32, height: 32, color: item.color, item, life: 3000, bounceOffset: Math.random() * 10, dead: false }); }
                  }
              }
          });
      });
      state.projectiles = state.projectiles.filter(p => !p.dead);

      const now = Date.now();
      if ((input.current.keys[' '] || input.current.mouse.down) && now - p.lastAttackTime > p.calculatedStats.attackCooldown) {
        if (p.stamina >= GAME_CONFIG.STAMINA_ATTACK_COST) {
            p.stamina -= GAME_CONFIG.STAMINA_ATTACK_COST;
            p.lastAttackTime = now; p.isAttacking = true; setTimeout(() => { if(gameState.current) gameState.current.player.isAttacking = false; }, 200);
            const weapon = p.equipment.mainHand;
            const isRanged = weapon && (weapon.weaponClass === 'Bow' || weapon.weaponClass === 'Staff' || weapon.weaponClass === 'Wand');
            if (isRanged) {
                let dmg = Math.floor(p.attack * 0.8); 
                if (weapon.weaponClass === 'Bow') dmg += Math.floor(p.attributes.dexterity * 1.5);
                if (weapon.weaponClass === 'Staff' || weapon.weaponClass === 'Wand') dmg += Math.floor(p.attributes.intelligence * 1.5);
                const mx = input.current.mouse.x + state.camera.x;
                const my = input.current.mouse.y + state.camera.y;
                const angle = Math.atan2(my - (p.y + p.height/2), mx - (p.x + p.width/2));
                state.projectiles.push({ id: crypto.randomUUID(), type: 'projectile', x: p.x + p.width/2, y: p.y + p.height/2, width: 8, height: 8, vx: Math.cos(angle) * GAME_CONFIG.PROJECTILE_SPEED, vy: Math.sin(angle) * GAME_CONFIG.PROJECTILE_SPEED, damage: dmg, ownerId: p.id, life: 100, color: weapon.weaponClass === 'Bow' ? '#fff' : '#00ffff', dead: false });
            } else {
                const attackRect = { x: p.x + p.width/2 - 30, y: p.y + p.height/2 - 30, width: 60, height: 60 } as Entity;
                state.enemies.forEach(e => {
                  if (checkCollision(attackRect, e)) {
                    let dmg = Math.max(1, Math.floor((p.attack - e.defense/2) * (0.9 + Math.random() * 0.2))); 
                    const thunder = p.perks.find(pk => pk.id === 'thunder_strike');
                    if (thunder && Math.random() < 0.2) { dmg += (15 * thunder.level); state.floatingTexts.push({ id: crypto.randomUUID(), x: e.x + e.width/2, y: e.y - 20, width:0, height:0, color: '#fbbf24', type: 'text', dead: false, text: "⚡ THUNDER!", life: 45 }); }
                    e.hp -= dmg;
                    state.floatingTexts.push({ id: crypto.randomUUID(), x: e.x + e.width/2, y: e.y, width:0, height:0, color: '#fff', type: 'text', dead: false, text: `-${dmg}`, life: 30 });
                    const angle = Math.atan2(e.y - p.y, e.x - p.x); e.x += Math.cos(angle) * 10; e.y += Math.sin(angle) * 10;
                    if (e.hp <= 0) {
                      e.dead = true; 
                      let xpMult = 1.0;
                      const wis = p.perks.find(pk => pk.id === 'wisdom');
                      if (wis) xpMult = 1.0 + (0.2 * wis.level);
                      p.xp += Math.floor(e.xpValue * xpMult);
                      let goldMult = 1.0;
                      const rush = p.perks.find(pk => pk.id === 'gold_rush');
                      if (rush) goldMult = 1.0 + (0.5 * rush.level);
                      p.gold += Math.floor((Math.random() * 5 * (state.dungeonLevel || 1) + 1) * goldMult);
                      state.floatingTexts.push({ id: crypto.randomUUID(), x: e.x + e.width/2, y: e.y, width:0, height:0, color: '#ffd700', type: 'text', dead: false, text: `+${Math.floor(e.xpValue * xpMult)} XP`, life: 45 });
                      const vampire = p.perks.find(pk => pk.id === 'vampire');
                      if (vampire) { const heal = 3 + (2 * vampire.level); p.hp = Math.min(p.maxHp, p.hp + heal); state.floatingTexts.push({ id: crypto.randomUUID(), x: p.x + p.width/2, y: p.y - 30, width:0, height:0, color: '#f43f5e', type: 'text', dead: false, text: `+${heal} HP`, life: 45 }); }
                      if (p.xp >= p.nextLevelXp) { p.level++; p.xp -= p.nextLevelXp; p.nextLevelXp = Math.floor(p.nextLevelXp * 1.5); p.statPoints += 3; updatePlayerStats(p); p.hp = p.maxHp; state.floatingTexts.push({ id: crypto.randomUUID(), x: p.x, y: p.y - 40, width:0, height:0, color: '#00ff00', type: 'text', dead: false, text: "LEVEL UP!", life: 90 }); triggerLevelUp(); }
                      const dropChance = GAME_CONFIG.BASE_DROP_RATE * (e.rank === 'Boss' ? 5 : e.rank === 'Elite' ? 2 : 1);
                      if (Math.random() < dropChance) { const item = generateRandomItem(state.dungeonLevel || 1, e.rank === 'Boss' ? 5 : e.rank === 'Elite' ? 2 : 0); if (item) state.droppedItems.push({ id: crypto.randomUUID(), type: 'drop', x: e.x, y: e.y, width: 32, height: 32, color: item.color, item, life: 3000, bounceOffset: Math.random() * 10, dead: false }); }
                    }
                  }
                });
                state.resources.forEach(r => {
                    if (checkCollision(attackRect, r)) {
                        r.hp -= p.attack;
                        const angle = Math.atan2(r.y - p.y, r.x - p.x); r.x += Math.cos(angle) * 2; r.y += Math.sin(angle) * 2;
                        state.floatingTexts.push({ id: crypto.randomUUID(), x: r.x + r.width/2, y: r.y, width:0, height:0, color: '#ccc', type: 'text', dead: false, text: "Hit", life: 20 });
                        if (r.hp <= 0) {
                            r.dead = true;
                            let item: Item | null = null;
                            let count = 1;
                            if (r.resourceType === 'tree') { count = Math.floor(Math.random()*3)+1; item = { id: crypto.randomUUID(), name: "木材", type: "Material", rarity: "Common", level: 1, stats: { attack:0, defense:0, speed:0, maxHp:0 }, enchantments: [], icon: "🪵", color: "#795548", count: count }; } else if (r.resourceType === 'rock') { count = Math.floor(Math.random()*2)+1; item = { id: crypto.randomUUID(), name: "石", type: "Material", rarity: "Common", level: 1, stats: { attack:0, defense:0, speed:0, maxHp:0 }, enchantments: [], icon: "🪨", color: "#9e9e9e", count: count }; } else if (r.resourceType === 'ore') { count = 1; item = { id: crypto.randomUUID(), name: "鉱石", type: "Material", rarity: "Uncommon", level: 1, stats: { attack:0, defense:0, speed:0, maxHp:0 }, enchantments: [], icon: "⛏️", color: "#607d8b", count: count }; }
                            const scav = p.perks.find(pk => pk.id === 'scavenger');
                            if (scav && item) { item.count = (item.count || 1) + scav.level; state.floatingTexts.push({ id: crypto.randomUUID(), x: r.x, y: r.y - 20, width:0, height:0, color: '#a3e635', type: 'text', dead: false, text: `Scavenger +${scav.level}!`, life: 40 }); }
                            if (item) state.droppedItems.push({ id: crypto.randomUUID(), type: 'drop', x: r.x, y: r.y, width: 32, height: 32, color: item.color, item, life: 3000, bounceOffset: Math.random() * 10, dead: false });
                        }
                    }
                });
            }
        } else {
            state.floatingTexts.push({ id: crypto.randomUUID(), x: p.x + p.width/2, y: p.y - 20, width:0, height:0, color: '#ef4444', type: 'text', dead: false, text: "No Stamina!", life: 20 });
        }
      }

      state.enemies.forEach(e => {
        if (state.activeBossId && e.id === state.activeBossId) {
             setActiveBossData({...e});
             if (e.dead) {
                 setActiveBossData(null);
                 state.activeBossId = null;
                 const rewardPos = { x: e.x, y: e.y };
                 state.droppedItems.push({ id: crypto.randomUUID(), type: 'drop', x: rewardPos.x, y: rewardPos.y, width: 32, height: 32, color: '#ffd700', item: generateRandomItem(state.dungeonLevel + 5, 5)!, life: 10000, bounceOffset: 0, dead: false });
                 setMessage("BOSS DEFEATED!");
             }
        }
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
            if (p.hp <= 0) { handleDeath(); }
          }
        }
      });
      state.enemies = state.enemies.filter(e => !e.dead); 
      state.resources = state.resources.filter(r => !r.dead); 
      state.droppedItems = state.droppedItems.filter(d => !d.dead);
      state.floatingTexts.forEach(t => { t.y -= 0.5; t.life--; }); state.floatingTexts = state.floatingTexts.filter(t => t.life > 0);
    }
    renderGame(ctx, state, loadedAssets);
    if (state.gameTime % 10 === 0) setUiState({...state.player});
    reqRef.current = requestAnimationFrame(gameLoop);
  };
  useEffect(() => { if (screen === 'game') gameLoop(); return () => { if (reqRef.current) cancelAnimationFrame(reqRef.current); } }, [screen]);

  // UI Handlers (Same as before)
  const saveGame = async () => {
    if (!gameState.current || !user || !db) return;
    setIsSaving(true);
    const data = { player: gameState.current.player, dungeonLevel: gameState.current.dungeonLevel };
    try { await setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'saves', 'slot1'), data); setSaveData(data); setMessage("クラウドに保存しました！"); } catch(e) { console.error("Save failed", e); setMessage("保存に失敗しました！"); } finally { setIsSaving(false); setTimeout(() => setMessage(null), 2000); }
  };
  const handleEquip = (item: Item) => {
    if (!gameState.current) return;
    const p = gameState.current.player;
    if (item.type === 'Consumable' || item.type === 'Material') { setMessage("装備できません。"); setTimeout(()=>setMessage(null), 2000); return; }
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

  if (!isConfigValid) return <div className="w-full h-screen bg-slate-900 flex flex-col items-center justify-center text-white p-8"><AlertTriangle size={64} className="text-red-500 mb-4" /><h2 className="text-2xl font-bold mb-2">設定エラー</h2></div>;
  if (screen === 'auth') return <div className="w-full h-screen bg-slate-900 flex flex-col items-center justify-center text-white"><Loader className="animate-spin text-yellow-500 mb-4" size={48} /><h2 className="text-xl">{loadingMessage}</h2></div>;
  
  if (screen === 'title') return (
    <TitleScreen onStart={() => setScreen('job_select')} onContinue={() => startGame('Swordsman', 'Male', true)} canContinue={!!saveData} resolution={resolution} setResolution={setResolution} />
  );
  
  if (screen === 'job_select') return <JobSelectScreen onBack={() => setScreen('title')} onSelect={(j: Job, g: Gender) => startGame(j, g)} loadedAssets={loadedAssets} />;

  return (
    <div className="w-full h-screen bg-black flex items-center justify-center overflow-hidden relative" onContextMenu={e => e.preventDefault()}>
      <canvas ref={canvasRef} width={viewportSize.width} height={viewportSize.height} className="bg-black shadow-2xl cursor-crosshair" />
      {uiState && <GameHUD uiState={uiState} dungeonLevel={dungeonLevel} toggleMenu={(m: MenuType) => setActiveMenu(activeMenu === m ? 'none' : m)} activeShop={activeShopType} bossData={activeBossData} />}
      {message && <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-black/80 text-white px-6 py-2 rounded-full border border-yellow-500/50 animate-bounce text-center whitespace-nowrap">{message}</div>}
      
      {activeMenu !== 'none' && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50 p-8">
          {activeMenu === 'shop' && activeShopType && uiState && (
              <ShopMenu type={activeShopType} player={uiState} onClose={() => setActiveMenu('none')} onBuy={handleShopBuy} onCraft={handleCraft} />
          )}
          {activeMenu === 'level_up' && levelUpOptions && (
             <LevelUpMenu options={levelUpOptions} onSelect={selectPerk} />
          )}
          {activeMenu === 'status' && (
            <div className="bg-slate-800 p-8 rounded-lg border border-slate-600 min-w-[300px] text-white">
              <h2 className="text-2xl font-bold mb-6 text-center border-b border-slate-600 pb-2">メニュー</h2>
              <div className="mb-6">
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2 flex items-center gap-2">
                  <Monitor size={14} /> Screen Size
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[{ label: 'AUTO', val: 'auto' }, { label: 'SVGA (800x600)', val: '800x600' }, { label: 'XGA (1024x768)', val: '1024x768' }, { label: 'HD (1280x720)', val: '1280x720' }].map(opt => (
                    <button key={opt.val} onClick={() => setResolution(opt.val as ResolutionMode)} className={`px-3 py-2 text-xs rounded border transition-colors ${resolution === opt.val ? 'bg-yellow-600 border-yellow-500 text-white' : 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600'}`}>{opt.label}</button>
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
                {[ { key: 'vitality', label: '体力', desc: '最大HPが増加' }, { key: 'strength', label: '筋力', desc: '物理攻撃力が増加' }, { key: 'dexterity', label: '器用さ', desc: '攻撃速度が増加' }, { key: 'intelligence', label: '知力', desc: '最大MPと魔法攻撃力が増加' }, { key: 'endurance', label: '耐久', desc: '防御力とスタミナが増加' }, ].map((stat) => (
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
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/30 text-xs pointer-events-none">Quest of Harvest: Roguelike Edition v5.2 (Shop Fixed)</div>
    </div>
  );
}
