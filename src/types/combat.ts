import { CombatEntity, CombatResult } from '../types/combat';
import { calculateTotalStats } from './stats'; // 追加
import { PlayerState } from '../types/gameState';
import { ITEMS } from '../data/items';

const randomRange = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// ...既存のcheckHit, checkCritical... (省略可能だが、呼び出し元でtotalStatsを使うため変更不要)
// 実際には CombatEntity を生成する段階で calculateTotalStats を通す必要がある。

/**
 * CombatEntity生成ヘルパーをここに定義するか、hooks側で行うか。
 * 統一性のためにhooks/useTurnSystem.tsを修正するのがベスト。
 */

const checkHit = (attacker: CombatEntity, defender: CombatEntity): boolean => {
  let hitChance = 95;
  const hitModifier = (attacker.stats.dex - defender.stats.agi) * 0.5;
  hitChance += hitModifier;
  hitChance = Math.max(50, Math.min(100, hitChance));
  return Math.random() * 100 < hitChance;
};

const checkCritical = (attacker: CombatEntity, defender: CombatEntity): boolean => {
  let critChance = 5;
  critChance += attacker.stats.dex * 0.1;
  critChance += (attacker.stats.luc - defender.stats.luc) * 0.05;
  return Math.random() * 100 < critChance;
};

export const calculatePhysicalAttack = (attacker: CombatEntity, defender: CombatEntity): CombatResult => {
  if (!checkHit(attacker, defender)) {
    return {
      hit: false,
      critical: false,
      damage: 0,
      damageType: 'physical',
      message: `${attacker.name}の攻撃は外れた！`
    };
  }

  const isCritical = checkCritical(attacker, defender);

  // ステータス反映ロジック
  // 装備の攻撃力を加算したいが、CombatEntity.statsにはstrしかない
  // 本来CombatEntityに attackPower プロパティを持たせるべきだが、
  // 簡易的に STR * 2 (素手) + 装備補正(Entity生成時にSTRに乗せるのは違う)
  // -> CombatEntityに `attackPower` を追加するのが正しい設計
  // しかし型定義変更の影響範囲が大きいので、
  // ここでは「STR自体が装備補正込みになっている」前提で計算する。
  // (calculateTotalStats で stats.str に装備補正が加算されている)
  
  // さらに「武器攻撃力」自体をどう扱うか？
  // 簡易版: STR * 2 で計算している既存ロジックを維持しつつ、
  // 装備の攻撃力分をダメージに直接加算するアプローチにするには
  // attacker に武器攻撃力情報が必要。
  
  // 今回は「STR * 2」をベースにしつつ、レベル補正等を加える既存ロジックなので、
  // 装備でSTRを盛れば強くなる。
  // 加えて、もし attacker が PlayerState 由来なら武器威力を加算したい。
  // -> hooks/useTurnSystem.ts で PlayerState -> CombatEntity 変換時に
  //    stats.str を盛るだけでなく、仮想的な attackPower を渡せるとベスト。
  
  const attackPower = attacker.stats.str * 2;
  
  let baseDamage = Math.max(
    Math.ceil(attackPower * 0.1),
    attackPower - (defender.stats.vit * 1.5)
  );

  const levelDiff = attacker.level - defender.level;
  const levelModifier = Math.max(0.5, Math.min(2.0, 1 + (levelDiff * 0.05)));
  
  let finalDamage = Math.floor(baseDamage * levelModifier);

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
