import { Job } from '../types/job';
import { Quest } from '../types/quest';

const SAVE_KEY = 'quest_of_harvest_save_v1';

// セーブデータの型定義
export interface SaveData {
  playerJobId: string;
  playerStats: {
    level: number;
    maxHp: number;
    hp: number;
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
  activeQuestIds: string[]; // データ容量削減のためIDのみ保存
  completedQuestIds: string[];
  inventory: string[]; // Item ID list
  unlockedCompanions: string[];
  savedAt: number;
}

// データのロード
export const loadGame = (): SaveData | null => {
  try {
    const rawData = localStorage.getItem(SAVE_KEY);
    if (!rawData) return null;

    // 簡易的な復号化 (Base64デコード)
    const jsonStr = atob(rawData);
    const data = JSON.parse(jsonStr) as SaveData;
    
    console.log('Game loaded successfully:', data);
    return data;
  } catch (e) {
    console.error('Failed to load save data:', e);
    return null;
  }
};

// データのセーブ
export const saveGame = (data: SaveData): boolean => {
  try {
    const jsonStr = JSON.stringify({
      ...data,
      savedAt: Date.now()
    });
    
    // 簡易的な暗号化 (Base64エンコード)
    const encodedData = btoa(jsonStr);
    localStorage.setItem(SAVE_KEY, encodedData);
    
    console.log('Game saved successfully');
    return true;
  } catch (e) {
    console.error('Failed to save game:', e);
    return false;
  }
};

// セーブデータの削除（リセット用）
export const clearSaveData = () => {
  localStorage.removeItem(SAVE_KEY);
};

// セーブデータが存在するかチェック
export const hasSaveData = (): boolean => {
  return !!localStorage.getItem(SAVE_KEY);
};
