/**
 * 2点間の距離を計算する
 */
export const getDistance = (x1: number, y1: number, x2: number, y2: number): number => {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
};

// ==========================================
// 経験値・レベル計算ロジック (Balance Phase 1)
// ==========================================
// 計算式: 必要経験値 = Base * (Level - 1) ^ Power
// Base=100, Power=2.2 の場合:
// Lv1 -> 2: 100 exp
// Lv10: ~12,500 exp
// Lv30: ~178,000 exp (ストーリークリア想定)
// Lv50: ~550,000 exp (無限の塔・深層)

const EXP_BASE = 100;
const EXP_POWER = 2.2;

/**
 * 指定したレベルに到達するために必要な【累積】経験値を計算する
 */
export const calculateExpForLevel = (level: number): number => {
  if (level <= 1) return 0;
  return Math.floor(EXP_BASE * Math.pow(level - 1, EXP_POWER));
};

/**
 * 現在の経験値からレベルを算出する
 */
export const calculateLevel = (exp: number): number => {
  if (exp <= 0) return 1;
  
  // 逆算: level = (exp / BASE)^(1/POWER) + 1
  let level = Math.floor(Math.pow(exp / EXP_BASE, 1 / EXP_POWER)) + 1;
  
  // 誤差修正: 計算されたレベルの規定値に達していない場合は下げる
  if (calculateExpForLevel(level) > exp) {
      level--;
  }
  
  return level;
};
