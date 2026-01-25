const SAVE_KEY = 'quest_of_harvest_save_v1';

// セーブデータの型定義
export interface SaveData {
  playerJobId: string;
  playerStats: {
    level: number;
    maxHp: number;
    hp: number;
    maxMp: number; // 追加
    mp: number;    // 追加
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

// データのロード
export const loadGame = (): SaveData | null => {
  try {
    const rawData = localStorage.getItem(SAVE_KEY);
    if (!rawData) return null;

    const jsonStr = atob(rawData);
    const data = JSON.parse(jsonStr) as SaveData;
    
    // 古いセーブデータとの互換性チェック（mpがない場合は補完）
    if (data.playerStats && typeof data.playerStats.mp === 'undefined') {
        data.playerStats.maxMp = 50;
        data.playerStats.mp = 50;
    }

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
    
    const encodedData = btoa(jsonStr);
    localStorage.setItem(SAVE_KEY, encodedData);
    
    console.log('Game saved successfully');
    return true;
  } catch (e) {
    console.error('Failed to save game:', e);
    return false;
  }
};

export const clearSaveData = () => {
  localStorage.removeItem(SAVE_KEY);
};

export const hasSaveData = (): boolean => {
  return !!localStorage.getItem(SAVE_KEY);
};
