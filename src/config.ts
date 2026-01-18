import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

export const GAME_CONFIG = {
  TILE_SIZE: 32, MAP_WIDTH: 50, MAP_HEIGHT: 40, PLAYER_SPEED: 5, ENEMY_SPAWN_RATE: 0.015, BASE_DROP_RATE: 0.2,
};

export const THEME = {
  colors: {
    ground: '#1a1a1a', grass: '#1e2b1e', wall: '#424242', water: '#1a237e', townFloor: '#5d4037', player: '#d4af37', enemy: '#8b0000', text: '#c0c0c0', highlight: '#ffd700',
    rarity: { Common: '#ffffff', Uncommon: '#1eff00', Rare: '#0070dd', Epic: '#a335ee', Legendary: '#ff8000', }
  }
};

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
export const rawAppId = typeof __app_id !== 'undefined' ? __app_id : 'quest-of-harvest';
export const appId = rawAppId.replace(/[\/.]/g, '_');

let firebaseConfig: any = MANUAL_FIREBASE_CONFIG;
if (!firebaseConfig.apiKey) {
  try {
    const parsedConfig = JSON.parse(rawConfig);
    if (parsedConfig && parsedConfig.apiKey) firebaseConfig = parsedConfig;
  } catch (e) { console.error("Config Parse Error", e); }
}

export let app: FirebaseApp | undefined;
export let auth: Auth | undefined;
export let db: Firestore | undefined;
export let isConfigValid = false;

if (firebaseConfig && firebaseConfig.apiKey) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    isConfigValid = true;
  } catch (e) { console.error("Firebase Initialization Error:", e); }
}
