import { useState, useCallback } from 'react';
import { PlayerState, JobId, GodId, Stats } from '../types';
import { jobs } from '../data/jobs';
import { gods } from '../data/gods';
import { getNextLevelExp } from '../data/balance';

const INITIAL_STATS: Stats = {
  str: 10, vit: 10, dex: 10, agi: 10, int: 10, luc: 10,
  hp: 50, maxHp: 50, sp: 20, maxSp: 20,
  attack: 10, defense: 5
};

const INITIAL_STATE: PlayerState = {
  name: '',
  hp: 50,
  maxHp: 50,
  sp: 20,
  maxSp: 20,
  stats: INITIAL_STATS,
  level: 1,
  exp: 0,
  nextExp: getNextLevelExp(1),
  gold: 0,
  equipment: { weapon: null, armor: null, accessory: null },
  inventory: [],
  jobId: 'swordsman',
  godId: 'war',
  skills: [],
  quests: [],
  x: 1,
  y: 1
};

export const usePlayer = () => {
  const [playerState, setPlayerState] = useState<PlayerState>(INITIAL_STATE);
  const [levelUpLog, setLevelUpLog] = useState<string | null>(null);

  const updatePlayerStatus = useCallback((updates: Partial<PlayerState>) => {
    setPlayerState(prev => ({ ...prev, ...updates }));
  }, []);

  // 経験値獲得とレベルアップ処理
  const gainExp = useCallback((amount: number) => {
    setPlayerState(prev => {
      let currentExp = prev.exp + amount;
      let currentLevel = prev.level;
      let nextLevelExp = prev.nextExp;
      let leveledUp = false;

      // レベルアップ判定（複数レベルアップ対応）
      while (currentExp >= nextLevelExp) {
        currentExp -= nextLevelExp;
        currentLevel++;
        nextLevelExp = getNextLevelExp(currentLevel);
        leveledUp = true;
      }

      if (!leveledUp) {
        return { ...prev, exp: currentExp, nextExp: nextLevelExp };
      }

      // レベルアップ時のステータス上昇
      // ジョブ成長率を取得
      const jobGrowth = jobs[prev.jobId]?.growthRates || { str: 1, vit: 1, dex: 1, agi: 1, int: 1, luc: 1 };
      
      const newStats = { ...prev.stats };
      newStats.str += jobGrowth.str;
      newStats.vit += jobGrowth.vit;
      newStats.dex += jobGrowth.dex;
      newStats.agi += jobGrowth.agi;
      newStats.int += jobGrowth.int;
      newStats.luc += jobGrowth.luc;

      // HP/SP上昇 (VIT/INT依存の簡易計算)
      const hpGain = Math.floor(jobGrowth.vit * 2 + Math.random() * 3);
      const spGain = Math.floor(jobGrowth.int * 1 + Math.random() * 2);

      const newMaxHp = prev.maxHp + hpGain;
      const newMaxSp = prev.maxSp + spGain;

      // 派生ステータス再計算
      // Attack = STR * 2, Defense = VIT * 1.5
      newStats.attack = Math.floor(newStats.str * 2);
      newStats.defense = Math.floor(newStats.vit * 1.5);

      setLevelUpLog(`レベルが ${currentLevel} に上がった！ (HP+${hpGain}, SP+${spGain})`);

      return {
        ...prev,
        level: currentLevel,
        exp: currentExp,
        nextExp: nextLevelExp,
        stats: newStats,
        maxHp: newMaxHp,
        hp: newMaxHp, // 全回復
        maxSp: newMaxSp,
        sp: newMaxSp  // 全回復
      };
    });
  }, []);

  const resetPlayer = useCallback(() => {
    setPlayerState(INITIAL_STATE);
  }, []);

  const selectJob = useCallback((jobId: JobId) => {
    const job = jobs[jobId];
    if (!job) return;

    setPlayerState(prev => {
      // 基本ステータスをジョブ補正
      // ※ 本来はBase + JobBonusだが、ここではベースごと書き換え
      const newStats = { ...job.baseStats };
      
      return {
        ...prev,
        jobId,
        stats: newStats,
        maxHp: newStats.hp || 50,
        hp: newStats.hp || 50,
        maxSp: newStats.sp || 20,
        sp: newStats.sp || 20,
      };
    });
  }, []);

  const selectGod = useCallback((godId: GodId) => {
    setPlayerState(prev => ({ ...prev, godId }));
    // 神の恩恵（パッシブボーナス）は別途計算時に参照する
  }, []);

  const clearLevelUpLog = useCallback(() => setLevelUpLog(null), []);

  return {
    playerState,
    updatePlayerStatus,
    resetPlayer,
    selectJob,
    selectGod,
    gainExp,
    levelUpLog,
    clearLevelUpLog
  };
};
