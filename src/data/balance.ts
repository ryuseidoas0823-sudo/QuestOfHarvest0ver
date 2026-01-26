// ゲームバランス調整用定数

// レベルアップに必要な経験値計算 (簡易式: Base * (Level ^ Curve))
export const EXP_TABLE = {
  BASE: 50,
  CURVE: 1.5,
};

// ダメージ計算係数
export const DAMAGE_CONSTANTS = {
  BASE_DAMAGE: 1, // 最低保証ダメージ
  VARIANCE: 0.2,  // ダメージのばらつき (±20%)
};

// レベルごとの必要経験値を計算する関数
export const getNextLevelExp = (level: number): number => {
  return Math.floor(EXP_TABLE.BASE * Math.pow(level, EXP_TABLE.CURVE));
};

// ステータスに応じたダメージ計算
export const calculateDamage = (attackerAtk: number, defenderDef: number): number => {
  // 基本ダメージ = (攻撃力 * 2) - 防御力
  // ※ RPGツクール的な簡易式からスタート
  let base = (attackerAtk * 1.5) - defenderDef;
  
  if (base < 1) base = 1; // 最低保証

  // 乱数補正 (0.8 ~ 1.2倍)
  const variance = DAMAGE_CONSTANTS.VARIANCE;
  const multiplier = 1 - variance + Math.random() * (variance * 2);
  
  return Math.floor(base * multiplier);
};
