import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

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

export { auth, db, isConfigValid };
