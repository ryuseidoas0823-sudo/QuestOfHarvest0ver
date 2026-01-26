import { useState, useCallback } from 'react';
import { PlayerState, JobId, GodId, Stats, Item } from '../types';
import { jobs } from '../data/jobs';
import { getNextLevelExp } from '../data/balance';
import { items as itemData } from '../data/items';

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
  inventory: [], // string[] of itemIds
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

  // アイテム入手
  const addItem = useCallback((itemId: string) => {
    setPlayerState(prev => ({
      ...prev,
      inventory: [...prev.inventory, itemId]
    }));
  }, []);

  // アイテム使用
  const useItem = useCallback((index: number): string | null => {
    let message = null;
    
    setPlayerState(prev => {
      const itemId = prev.inventory[index];
      const item = itemData[itemId];
      
      if (!item || item.type !== 'consumable') {
        return prev;
      }

      // 効果適用
      let newHp = prev.hp;
      let newSp = prev.sp;
      let used = false;

      if (item.effect?.type === 'heal_hp') {
        if (prev.hp < prev.maxHp) {
            newHp = Math.min(prev.maxHp, prev.hp + (item.effect.value || 0));
            used = true;
            message = `${item.name}を使った。HPが回復した。`;
        } else {
            message = `HPは満タンだ。`;
        }
      } else if (item.effect?.type === 'heal_sp') {
        if (prev.sp < prev.maxSp) {
            newSp = Math.min(prev.maxSp, prev.sp + (item.effect.value || 0));
            used = true;
            message = `${item.name}を使った。SPが回復した。`;
        } else {
            message = `SPは満タンだ。`;
        }
      } else if (item.effect?.type === 'heal_full') {
         newHp = prev.maxHp;
         newSp = prev.maxSp;
         used = true;
         message = `${item.name}を使った。全回復した！`;
      }

      if (used) {
        // 使用したアイテムを削除
        const newInventory = [...prev.inventory];
        newInventory.splice(index, 1);
        
        return {
          ...prev,
          hp: newHp,
          sp: newSp,
          inventory: newInventory
        };
      }
      
      return prev;
    });

    return message;
  }, []);


  // 経験値獲得とレベルアップ処理
  const gainExp = useCallback((amount: number) => {
    setPlayerState(prev => {
      let currentExp = prev.exp + amount;
      let currentLevel = prev.level;
      let nextLevelExp = prev.nextExp;
      let leveledUp = false;

      while (currentExp >= nextLevelExp) {
        currentExp -= nextLevelExp;
        currentLevel++;
        nextLevelExp = getNextLevelExp(currentLevel);
        leveledUp = true;
      }

      if (!leveledUp) {
        return { ...prev, exp: currentExp, nextExp: nextLevelExp };
      }

      const jobGrowth = jobs[prev.jobId]?.growthRates || { str: 1, vit: 1, dex: 1, agi: 1, int: 1, luc: 1 };
      
      const newStats = { ...prev.stats };
      newStats.str += jobGrowth.str;
      newStats.vit += jobGrowth.vit;
      newStats.dex += jobGrowth.dex;
      newStats.agi += jobGrowth.agi;
      newStats.int += jobGrowth.int;
      newStats.luc += jobGrowth.luc;

      const hpGain = Math.floor(jobGrowth.vit * 2 + Math.random() * 3);
      const spGain = Math.floor(jobGrowth.int * 1 + Math.random() * 2);

      const newMaxHp = prev.maxHp + hpGain;
      const newMaxSp = prev.maxSp + spGain;

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
        hp: newMaxHp,
        maxSp: newMaxSp,
        sp: newMaxSp
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
  }, []);

  const clearLevelUpLog = useCallback(() => setLevelUpLog(null), []);

  return {
    playerState,
    updatePlayerStatus,
    resetPlayer,
    selectJob,
    selectGod,
    gainExp,
    addItem, // 公開
    useItem, // 公開
    levelUpLog,
    clearLevelUpLog
  };
};
