import { CombatEntity, CombatResult } from '../types/combat';

/**
 * ランダムな変動値を計算する (min ~ max)
 */
const randomRange = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * 命中判定を行う
 * DEXとAGIの差分で命中率が変動
 */
const checkHit = (attacker: CombatEntity, defender: CombatEntity): boolean => {
  // 基本命中率 95%
  let hitChance = 95;
  
  // 命中補正: (攻撃側のDEX - 防御側のAGI) * 0.5
  // 器用な攻撃手は素早い相手にも当てやすい
  const hitModifier = (attacker.stats.dex - defender.stats.agi) * 0.5;
  
  hitChance += hitModifier;
  
  // 最低命中率50%、最大100%
  hitChance = Math.max(50, Math.min(100, hitChance));
  
  return Math.random() * 100 < hitChance;
};

/**
 * クリティカル判定を行う
 * DEXとLUCに依存
 */
const checkCritical = (attacker: CombatEntity, defender: CombatEntity): boolean => {
  // 基本クリティカル率 5%
  let critChance = 5;
  
  // DEXによる補正 (技術点)
  critChance += attacker.stats.dex * 0.1;
  
  // LUCによる補正 (運)
  critChance += (attacker.stats.luc - defender.stats.luc) * 0.05;
  
  return Math.random() * 100 < critChance;
};

/**
 * 物理攻撃のダメージ計算を行う
 * 『ダンまち』風: ステータスが直接的に威力に影響する
 */
export const calculatePhysicalAttack = (attacker: CombatEntity, defender: CombatEntity): CombatResult => {
  // 1. 命中判定
  if (!checkHit(attacker, defender)) {
    return {
      hit: false,
      critical: false,
      damage: 0,
      damageType: 'physical',
      message: `${attacker.name}の攻撃は外れた！`
    };
  }

  // 2. クリティカル判定
  const isCritical = checkCritical(attacker, defender);

  // 3. ダメージ計算
  // 基本攻撃力 = STR * 2 (本来はこれに武器威力が加算される想定)
  const attackPower = attacker.stats.str * 2;
  
  // 基本防御力 = VIT (本来はこれに防具防御力が加算される想定)
  // ダメージ = 攻撃力 - 防御力/2 (防御貫通しやすいバランス)
  // 最低でも1ダメージ、または攻撃力の10%は保証する
  let baseDamage = Math.max(
    Math.ceil(attackPower * 0.1),
    attackPower - (defender.stats.vit * 1.5)
  );

  // レベル差補正 (高レベル相手には通りにくく、低レベルには強い)
  // レベル1につき 5% 程度の補正
  const levelDiff = attacker.level - defender.stats.level; // statsにlevelがない場合はentity.levelを使う
  const levelModifier = 1 + (levelDiff * 0.05);
  // 0.5倍 ~ 2.0倍 の範囲に収める
  const clampedLevelMod = Math.max(0.5, Math.min(2.0, levelModifier));
  
  let finalDamage = Math.floor(baseDamage * clampedLevelMod);

  // 乱数幅 (±10%)
  const variance = randomRange(90, 110) / 100;
  finalDamage = Math.floor(finalDamage * variance);

  // クリティカル補正 (1.5倍)
  if (isCritical) {
    finalDamage = Math.floor(finalDamage * 1.5);
  }

  // 最終確認 (最低1ダメージ)
  finalDamage = Math.max(1, finalDamage);

  // ログメッセージの生成
  let message = `${attacker.name}の攻撃！ ${defender.name}に${finalDamage}のダメージ！`;
  if (isCritical) {
    message = `会心の一撃！！ ${defender.name}に${finalDamage}の大ダメージ！`;
  }

  return {
    hit: true,
    critical: isCritical,
    damage: finalDamage,
    damageType: 'physical',
    message
  };
};

/**
 * 敵用のアダプター関数などが必要ならここに追加
 * (既存のPlayerState型などをCombatEntityに変換するヘルパーなど)
 */
