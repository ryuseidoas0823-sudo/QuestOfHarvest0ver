import { useState, useCallback } from 'react';
import { PlayerState, JobId, GodId } from '../types';
import { JOBS } from '../data/jobs';
import { GODS } from '../data/gods';

// 初期ステータス
const INITIAL_PLAYER_STATE: PlayerState = {
  hp: 100,
  maxHp: 100,
  sp: 50,
  maxSp: 50,
  stats: {
    str: 10,
    vit: 10,
    dex: 10,
    agi: 10,
    int: 10,
    luc: 10,
  },
  level: 1,
  exp: 0,
  nextExp: 100,
  gold: 0,
  equipment: {
    weapon: null,
    armor: null,
    accessory: null,
  },
  inventory: [],
  jobId: 'swordsman',
  godId: 'war',
  skills: [],
  quests: [],
  name: 'ベル',
};

export const usePlayer = () => {
  const [playerState, setPlayerState] = useState<PlayerState>(INITIAL_PLAYER_STATE);
  const [activeJob, setActiveJob] = useState<JobId>('swordsman');
  const [activeGod, setActiveGod] = useState<GodId>('war');

  // プレイヤーの完全リセット
  const resetPlayer = useCallback(() => {
    setPlayerState(INITIAL_PLAYER_STATE);
    setActiveJob('swordsman');
    setActiveGod('war');
  }, []);

  // ジョブ選択時の処理
  const selectJob = useCallback((jobId: JobId) => {
    setActiveJob(jobId);
    const job = JOBS[jobId];
    
    setPlayerState(prev => ({
      ...prev,
      jobId: jobId,
      stats: { ...prev.stats, ...job.baseStats },
      maxHp: 100 + (job.baseStats.vit || 0) * 5,
      hp: 100 + (job.baseStats.vit || 0) * 5,
      skills: [...job.skills], // 初期スキル習得
    }));
  }, []);

  // 神選択時の処理
  const selectGod = useCallback((godId: GodId) => {
    setActiveGod(godId);
    setPlayerState(prev => ({
      ...prev,
      godId: godId,
    }));
  }, []);

  // ステータス更新（ダメージ、回復、レベルアップ等）
  const updatePlayerStatus = useCallback((updates: Partial<PlayerState>) => {
    setPlayerState(prev => ({
      ...prev,
      ...updates
    }));
  }, []);

  // 経験値獲得とレベルアップチェック
  const gainExp = useCallback((amount: number) => {
    setPlayerState(prev => {
      let currentExp = prev.exp + amount;
      let currentLevel = prev.level;
      let nextLevelExp = prev.nextExp;
      let levelUp = false;

      // 簡易的なレベルアップ計算
      while (currentExp >= nextLevelExp) {
        currentExp -= nextLevelExp;
        currentLevel++;
        nextLevelExp = Math.floor(nextLevelExp * 1.5);
        levelUp = true;
      }

      // レベルアップ時のステータス上昇処理などは別途必要であればここで行う
      // 今回はレベルと経験値の更新のみ

      return {
        ...prev,
        level: currentLevel,
        exp: currentExp,
        nextExp: nextLevelExp,
        // HP/SP全回復ボーナス
        hp: levelUp ? prev.maxHp : prev.hp,
        sp: levelUp ? prev.maxSp : prev.sp,
      };
    });
  }, []);

  return {
    playerState,
    activeJob,
    activeGod,
    setPlayerState,
    resetPlayer,
    selectJob,
    selectGod,
    updatePlayerStatus,
    gainExp
  };
};
