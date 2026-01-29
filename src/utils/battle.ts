import { Stats } from '../types/gameState';

/**
 * 戦闘計算ユーティリティ
 * * 計算式:
 * 物理攻撃力 (P.ATK) = STR * 2 + DEX * 0.5 + (装備ATK)
 * 物理防御力 (P.DEF) = VIT * 1.5 + STR * 0.5 + (装備DEF)
 * 命中率 = 95 + (攻撃側DEX - 防御側AGI) * 0.5 (%)
 * クリティカル率 = 5 + (攻撃側DEX * 0.2) + (攻撃側LUK * 0.1) (%)
 */

// ステータスオブジェクトから攻撃力を算出するヘルパー
const getAttackPower = (stats: Stats): number => {
  // atkが直接定義されている場合はそれを使用（敵キャラ等）
  // 定義されていない場合はSTR, DEXから算出（プレイヤー等）
  if (stats.atk !== undefined) return stats.atk;
  
  const str = stats.str || 0;
  const dex = stats.dex || 0;
  return Math.floor(str * 2 + dex * 0.5);
};

// ステータスオブジェクトから防御力を算出するヘルパー
const getDefensePower = (stats: Stats): number => {
  // defが直接定義されている場合はそれを使用
  if (stats.def !== undefined) return stats.def;
  
  const vit = stats.vit || 0;
  const str = stats.str || 0;
  return Math.floor(vit * 1.5 + str * 0.5);
};

/**
 * 命中判定
 * @param attacker 攻撃側のステータス
 * @param defender 防御側のステータス
 * @returns 命中したかどうか
 */
export const isHit = (attacker: Stats, defender: Stats): boolean => {
  // 基本命中率
  let hitRate = 95;
  
  // DEXとAGIによる補正
  const attackerDex = attacker.dex || 10;
  const defenderAgi = defender.agi || 10;
  
  // 相手の方が素早いと命中率が下がる
  hitRate += (attackerDex - defenderAgi) * 0.5;

  // 下限50%、上限100%（必中スキル等の例外を除く）
  hitRate = Math.max(50, Math.min(100, hitRate));

  return Math.random() * 100 < hitRate;
};

/**
 * クリティカル判定
 * @param attacker 攻撃側のステータス
 * @returns クリティカルかどうか
 */
export const isCritical = (attacker: Stats): boolean => {
  // 基本クリティカル率 5%
  let critRate = 5;
  
  // DEXによる補正 (DEX 10ごとに +2%)
  const dex = attacker.dex || 10;
  critRate += dex * 0.2;
  
  // LUKがあれば補正（未実装なら0）
  // critRate += (attacker.luk || 0) * 0.1;

  // 上限を設定してもよい
  critRate = Math.min(50, critRate);

  return Math.random() * 100 < critRate;
};

/**
 * ダメージ計算
 * @param attacker 攻撃側のステータス
 * @param defender 防御側のステータス
 * @param isCritical クリティカルヒットかどうか
 * @returns 最終ダメージ値
 */
export const calculateDamage = (attacker: Stats, defender: Stats, isCritical: boolean): number => {
  const atk = getAttackPower(attacker);
  const def = getDefensePower(defender);

  // 基礎ダメージ = 攻撃力 - 防御力/2
  // (防御力を完全に引くとダメージが通りにくすぎるため、係数を調整)
  let damage = atk - (def * 0.7);

  // 最低ダメージ保証 (1〜レベル相当など、ここではシンプルに)
  // 攻撃力が低すぎても、1〜3程度のダメージは通るようにする
  if (damage < 1) {
    damage = 1 + Math.random() * 2;
  }

  // 乱数補正 (0.9倍 〜 1.1倍)
  // ダメージに揺らぎを持たせる
  const variance = 0.9 + Math.random() * 0.2;
  damage *= variance;

  // クリティカル補正 (1.5倍)
  if (isCritical) {
    damage *= 1.5;
    // オプション: 防御力を一部無視する計算にするのもあり
  }

  return Math.floor(damage);
};
