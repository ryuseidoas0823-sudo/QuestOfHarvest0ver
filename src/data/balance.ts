/**
 * ゲームバランス調整用定数・計算式定義
 * 難易度調整や経済バランスはここを変更することで一括管理します。
 */

export const BALANCE = {
  // レベル・成長関連
  LEVEL: {
    MAX: 99,
    // 経験値計算式: 必要経験値 = BASE * (現在のレベル - 1) ^ POW
    // 初期設定: 100 * (Lv-1)^2 -> Lv2=100, Lv3=400, Lv10=8100...
    EXP_BASE: 100,
    EXP_POW: 2,
  },

  // 戦闘関連
  BATTLE: {
    // 最低ダメージ保証 (防御が高くても最低これだけは通る)
    MIN_DAMAGE: 1,
    
    // 防御力の有効率 (1.0 = 完全減算, 0.5 = 防御力の半分だけ減算)
    // 調整例: 敵が硬すぎる場合は0.8などに下げる
    DEFENSE_EFFECTIVENESS: 1.0,
    
    // ダメージのランダム幅 (0.1 = ±10%の乱数)
    DAMAGE_VARIANCE: 0.1,
    
    // クリティカル
    CRITICAL_BASE_RATE: 0.05, // 5%
    CRITICAL_MULTIPLIER: 1.5, // 1.5倍
    
    // 回避
    DODGE_BASE_RATE: 0.05, // 5%
  },

  // アイテム・ドロップ関連
  DROP: {
    // 全体的なドロップ率の倍率 (イベント時などに変更可能)
    GLOBAL_RATE_MODIFIER: 1.0,
  },

  // 経済関連
  ECONOMY: {
    // アイテム売却時の価格率 (定価の何割で売れるか)
    SELL_PRICE_RATIO: 0.25,
    // ダンジョンでのゴールド入手量の倍率
    GOLD_DROP_MULTIPLIER: 1.0,
  },
  
  // スキル関連
  SKILL: {
    // クールダウン時間の全体補正 (デバッグ時に0.1などにすると連発可能)
    COOLDOWN_FACTOR: 1.0,
    // 消費MPの全体補正
    COST_FACTOR: 1.0,
  }
};

/**
 * 累積経験値から現在のレベルを計算
 * @param exp 累積経験値
 * @returns 現在のレベル
 */
export const calculateLevel = (exp: number): number => {
  if (exp <= 0) return 1;
  // exp = BASE * (level - 1)^POW
  // level - 1 = (exp / BASE)^(1/POW)
  // level = (exp / BASE)^(1/POW) + 1
  const level = Math.floor(Math.pow(exp / BALANCE.LEVEL.EXP_BASE, 1 / BALANCE.LEVEL.EXP_POW)) + 1;
  return Math.min(level, BALANCE.LEVEL.MAX);
};

/**
 * 指定レベルに到達するために必要な累積経験値を計算
 * @param level 目標レベル
 * @returns 必要累積経験値
 */
export const calculateExpForLevel = (level: number): number => {
  if (level <= 1) return 0;
  return Math.floor(BALANCE.LEVEL.EXP_BASE * Math.pow(level - 1, BALANCE.LEVEL.EXP_POW));
};

/**
 * ダメージ計算式
 * @param attack 攻撃側の攻撃力
 * @param defense 防御側の防御力
 * @param variance ランダム幅を適用するかどうか (UI表示用などはfalse)
 * @returns 最終ダメージ
 */
export const calculateDamage = (attack: number, defense: number, variance: boolean = true): number => {
  // 基本ダメージ計算: 攻撃力 - 防御力
  let baseDamage = attack - (defense * BALANCE.BATTLE.DEFENSE_EFFECTIVENESS);
  
  // 最低保証
  baseDamage = Math.max(BALANCE.BATTLE.MIN_DAMAGE, baseDamage);

  if (variance) {
    // ±N% の乱数を適用
    const range = baseDamage * BALANCE.BATTLE.DAMAGE_VARIANCE;
    const offset = (Math.random() * range * 2) - range; // -range ~ +range
    return Math.floor(Math.max(1, baseDamage + offset));
  }
  
  return Math.floor(baseDamage);
};
