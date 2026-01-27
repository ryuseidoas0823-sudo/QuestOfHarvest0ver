import { CombatEntity, CombatResult } from '../types/combat';

const randomRange = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * 命中判定: (DEX - 相手AGI) で変動
 */
const checkHit = (attacker: CombatEntity, defender: CombatEntity): boolean => {
  let hitChance = 95;
  const hitModifier = (attacker.stats.dex - defender.stats.agi) * 0.5;
  hitChance += hitModifier;
  hitChance = Math.max(50, Math.min(100, hitChance));
  return Math.random() * 100 < hitChance;
};

/**
 * クリティカル判定: DEXとLUCに依存
 */
const checkCritical = (attacker: CombatEntity, defender: CombatEntity): boolean => {
  let critChance = 5;
  critChance += attacker.stats.dex * 0.1;
  critChance += (attacker.stats.luc - defender.stats.luc) * 0.05;
  return Math.random() * 100 < critChance;
};

/**
 * 物理攻撃計算
 */
export const calculatePhysicalAttack = (attacker: CombatEntity, defender: CombatEntity): CombatResult => {
  if (!checkHit(attacker, defender)) {
    return {
      hit: false,
      critical: false,
      damage: 0,
      damageType: 'physical',
      message: `${attacker.name}の攻撃は外れた！` // Miss
    };
  }

  const isCritical = checkCritical(attacker, defender);

  // 基本攻撃力 = STR * 2
  const attackPower = attacker.stats.str * 2;
  
  // 防御減算 = VIT * 1.5
  let baseDamage = Math.max(
    Math.ceil(attackPower * 0.1), // 最低保証
    attackPower - (defender.stats.vit * 1.5)
  );

  // レベル差補正
  const levelDiff = attacker.level - defender.level;
  const levelModifier = Math.max(0.5, Math.min(2.0, 1 + (levelDiff * 0.05)));
  
  let finalDamage = Math.floor(baseDamage * levelModifier);

  // 乱数幅 ±10%
  finalDamage = Math.floor(finalDamage * (randomRange(90, 110) / 100));

  if (isCritical) {
    finalDamage = Math.floor(finalDamage * 1.5);
  }

  finalDamage = Math.max(1, finalDamage);

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
