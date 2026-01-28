// 経験値曲線の定義
// 基本値 * (レベル ^ 補正値)
const BASE_EXP = 50;
const EXP_EXPONENT = 1.5;

// 最大レベル制限（これを超えてレベルアップしない）
export const MAX_LEVEL = 99;

/**
 * 次のレベルに上がるために必要な経験値を計算
 * 例: Lv1 -> Lv2 に必要な経験値
 */
export const getExpRequiredForNextLevel = (currentLevel: number): number => {
  if (currentLevel >= MAX_LEVEL) {
    return Infinity; // カンスト時は無限（レベルアップ不可）
  }
  return Math.floor(BASE_EXP * Math.pow(currentLevel, EXP_EXPONENT));
};

/**
 * 特定のレベルに到達するために必要な累計経験値を計算
 * (Expバーの表示率計算などに使用)
 */
export const getTotalExpForLevel = (level: number): number => {
  let total = 0;
  // Lv1から目標レベルの手前までの必要経験値を合計
  for (let i = 1; i < level; i++) {
    total += getExpRequiredForNextLevel(i);
  }
  return total;
};

/**
 * 現在の累計経験値からレベルを逆算
 * (セーブデータロード時の復元用)
 */
export const getLevelFromExp = (exp: number): number => {
  let level = 1;
  // 次のレベルに必要な経験値を持っているかチェック
  // かつ、最大レベルを超えないように制限
  while (level < MAX_LEVEL && exp >= getExpRequiredForNextLevel(level)) {
    exp -= getExpRequiredForNextLevel(level);
    level++;
  }
  return level;
};
