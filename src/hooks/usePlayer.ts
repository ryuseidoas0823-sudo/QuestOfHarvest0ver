import { useState, useCallback } from 'react';
import { PlayerState, JobId, GodId } from '../types';
import { JOBS } from '../data/jobs';

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
  x: 1, // 初期座標を追加
  y: 1
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
      skills: [...job.skills],
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

  // ステータス更新
  const updatePlayerStatus = useCallback((updates: Partial<PlayerState>) => {
    setPlayerState(prev => ({
      ...prev,
      ...updates
    }));
  }, []);

  // 経験値獲得
  const gainExp = useCallback((amount: number) => {
    setPlayerState(prev => {
      let currentExp = prev.exp + amount;
      let currentLevel = prev.level;
      let nextLevelExp = prev.nextExp;
      let levelUp = false;

      while (currentExp >= nextLevelExp) {
        currentExp -= nextLevelExp;
        currentLevel++;
        nextLevelExp = Math.floor(nextLevelExp * 1.5);
        levelUp = true;
      }

      return {
        ...prev,
        level: currentLevel,
        exp: currentExp,
        nextExp: nextLevelExp,
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
