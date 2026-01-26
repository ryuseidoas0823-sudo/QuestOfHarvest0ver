import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, appId, auth } from './firebase';

const SAVE_KEY = 'quest_of_harvest_save_v1';

// セーブデータの型定義
export interface SaveData {
  playerJobId: string;
  playerStats: {
    level: number;
    maxHp: number;
    hp: number;
    maxMp: number;
    mp: number;
    exp: number;
    attack: number;
    defense: number;
    str: number;
    vit: number;
    dex: number;
    agi: number;
    int: number;
    luc: number;
  };
  gold: number;
  chapter: number;
  activeQuestIds: string[];
  completedQuestIds: string[];
  inventory: string[];
  unlockedCompanions: string[];
  savedAt: number;
}

// ローカルロード
export const loadGame = (): SaveData | null => {
  try {
    const rawData = localStorage.getItem(SAVE_KEY);
    if (!rawData) return null;

    const jsonStr = atob(rawData);
    const data = JSON.parse(jsonStr) as SaveData;
    
    // 互換性チェック
    if (data.playerStats && typeof data.playerStats.mp === 'undefined') {
        data.playerStats.maxMp = 50;
        data.playerStats.mp = 50;
    }

    return data;
  } catch (e) {
    console.error('Failed to load local save data:', e);
    return null;
  }
};

// ローカルセーブ
export const saveGame = (data: SaveData): boolean => {
  try {
    const jsonStr = JSON.stringify({
      ...data,
      savedAt: Date.now()
    });
    
    const encodedData = btoa(jsonStr);
    localStorage.setItem(SAVE_KEY, encodedData);
    
    // ユーザーがログインしていればクラウドにも保存を試みる（サイレント）
    if (auth?.currentUser) {
      saveToCloud(data).catch(err => console.warn("Background cloud save failed", err));
    }

    return true;
  } catch (e) {
    console.error('Failed to save game locally:', e);
    return false;
  }
};

export const clearSaveData = () => {
  localStorage.removeItem(SAVE_KEY);
};

export const hasSaveData = (): boolean => {
  return !!localStorage.getItem(SAVE_KEY);
};

// --- Cloud Storage Functions ---

// クラウドセーブ
export const saveToCloud = async (data: SaveData): Promise<boolean> => {
  if (!db || !auth?.currentUser) return false;

  try {
    const userId = auth.currentUser.uid;
    // Rule 1: Strict Paths
    const userDocRef = doc(db, 'artifacts', appId, 'users', userId, 'data', 'savefile');
    
    await setDoc(userDocRef, {
      ...data,
      cloudSavedAt: Date.now()
    });
    console.log('Cloud save successful');
    return true;
  } catch (e) {
    console.error('Cloud save failed:', e);
    return false;
  }
};

// クラウドロード
export const loadFromCloud = async (): Promise<SaveData | null> => {
  if (!db || !auth?.currentUser) return null;

  try {
    const userId = auth.currentUser.uid;
    const userDocRef = doc(db, 'artifacts', appId, 'users', userId, 'data', 'savefile');
    const snapshot = await getDoc(userDocRef);

    if (snapshot.exists()) {
      const data = snapshot.data() as SaveData;
      console.log('Cloud load successful');
      return data;
    }
    return null;
  } catch (e) {
    console.error('Cloud load failed:', e);
    return null;
  }
};
