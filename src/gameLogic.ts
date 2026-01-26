import { PlayerState, Stats } from '../types';
import { EXP_TABLE, getNextLevelExp } from '../data/balance';
import { jobs } from '../data/jobs';

/**
 * 経験値を加算し、レベルアップ判定を行う関数
 * レベルアップした場合はステータス上昇処理も行う
 */
export const addExperience = (
  currentState: PlayerState, 
  amount: number
): { newState: PlayerState; leveledUp: boolean; levelUpDetails?: { levelsGained: number; hpGain: number; spGain: number } } => {
  
  let currentExp = currentState.exp + amount;
  let currentLevel = currentState.level;
  let nextLevelExp = currentState.nextExp;
  
  let levelsGained = 0;
  let totalHpGain = 0;
  let totalSpGain = 0;

  // レベルアップ判定ループ（一度に複数レベルアップする場合に対応）
  while (currentExp >= nextLevelExp) {
    currentExp -= nextLevelExp;
    currentLevel++;
    levelsGained++;
    nextLevelExp = getNextLevelExp(currentLevel);

    // ステータス上昇計算
    const jobGrowth = jobs[currentState.jobId]?.growthRates || { str: 1, vit: 1, dex: 1, agi: 1, int: 1, luc: 1 };
    
    // HP/SP上昇 (VIT/INT依存 + ランダム要素)
    const hpGain = Math.floor(jobGrowth.vit * 2 + Math.random() * 3);
    const spGain = Math.floor(jobGrowth.int * 1 + Math.random() * 2);

    totalHpGain += hpGain;
    totalSpGain += spGain;
  }

  if (levelsGained === 0) {
    return {
      newState: {
        ...currentState,
        exp: currentExp,
        nextExp: nextLevelExp
      },
      leveledUp: false
    };
  }

  // ステータスへの反映
  const jobGrowth = jobs[currentState.jobId]?.growthRates || { str: 1, vit: 1, dex: 1, agi: 1, int: 1, luc: 1 };
  const newStats: Stats = { ...currentState.stats };

  // 基礎ステータス上昇 (上昇レベル分)
  newStats.str += jobGrowth.str * levelsGained;
  newStats.vit += jobGrowth.vit * levelsGained;
  newStats.dex += jobGrowth.dex * levelsGained;
  newStats.agi += jobGrowth.agi * levelsGained;
  newStats.int += jobGrowth.int * levelsGained;
  newStats.luc += jobGrowth.luc * levelsGained;

  // 派生ステータス再計算
  newStats.attack = Math.floor(newStats.str * 2);
  newStats.defense = Math.floor(newStats.vit * 1.5);

  const newMaxHp = currentState.maxHp + totalHpGain;
  const newMaxSp = currentState.maxSp + totalSpGain;

  return {
    newState: {
      ...currentState,
      level: currentLevel,
      exp: currentExp,
      nextExp: nextLevelExp,
      stats: newStats,
      maxHp: newMaxHp,
      hp: newMaxHp, // 全回復
      maxSp: newMaxSp,
      sp: newMaxSp  // 全回復
    },
    leveledUp: true,
    levelUpDetails: {
      levelsGained,
      hpGain: totalHpGain,
      spGain: totalSpGain
    }
  };
};

/**
 * スタミナ(SP)消費判定と消費処理
 */
export const consumeSp = (currentState: PlayerState, amount: number): PlayerState | null => {
  if (currentState.sp < amount) return null; // SP不足

  return {
    ...currentState,
    sp: currentState.sp - amount
  };
};

/**
 * 回復処理
 */
export const healPlayer = (currentState: PlayerState, hpAmount: number, spAmount: number = 0): PlayerState => {
  return {
    ...currentState,
    hp: Math.min(currentState.maxHp, currentState.hp + hpAmount),
    sp: Math.min(currentState.maxSp, currentState.sp + spAmount)
  };
};
