import { GameState } from '../types/gameState';

const STORAGE_KEY = 'quest_of_harvest_v1_save';

/**
 * ゲームデータをローカルストレージに保存
 */
export const saveGame = (gameState: GameState): boolean => {
  try {
    // 循環参照の回避や、データ量削減が必要な場合はここで加工する
    // 現状の構成ならJSON化で問題ないと想定
    const serialized = JSON.stringify(gameState);
    localStorage.setItem(STORAGE_KEY, serialized);
    console.log(`Game saved. Size: ${(serialized.length / 1024).toFixed(2)} KB`);
    return true;
  } catch (error) {
    console.error('Failed to save game:', error);
    return false;
  }
};

/**
 * ゲームデータをロード
 */
export const loadGame = (): GameState | null => {
  try {
    const serialized = localStorage.getItem(STORAGE_KEY);
    if (!serialized) return null;

    const gameState = JSON.parse(serialized) as GameState;
    
    // バージョン差異の吸収やDate型の復元などが必要ならここで行う
    // 例: ログのタイムスタンプ整合性チェックなど
    
    return gameState;
  } catch (error) {
    console.error('Failed to load game:', error);
    return null;
  }
};

/**
 * セーブデータの存在確認
 */
export const hasSaveData = (): boolean => {
  return !!localStorage.getItem(STORAGE_KEY);
};

/**
 * セーブデータの削除（デバッグ用やデータリセット用）
 */
export const deleteSaveData = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};
