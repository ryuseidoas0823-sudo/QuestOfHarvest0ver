import { useCallback } from 'react';
import { GameState, PlayerState, PlayerStats } from '../types/gameState';
import { getExpRequiredForNextLevel } from '../utils/level';
import { calculatePlayerStats } from '../utils/stats';

export const usePlayer = (
  setGameState: React.Dispatch<React.SetStateAction<GameState>>,
  addLog: (text: string, type?: 'info' | 'success' | 'warning' | 'danger') => void
) => {

  // 経験値獲得とレベルアップ処理
  const gainExp = useCallback((amount: number) => {
    setGameState(prev => {
      let player = { ...prev.player };
      let exp = player.exp + amount;
      let level = player.level;
      let leveledUp = false;
      let skillPointsGained = 0;
      let statPointsGained = 0;

      // 複数レベルアップに対応
      while (exp >= getExpRequiredForNextLevel(level)) {
        exp -= getExpRequiredForNextLevel(level);
        level++;
        leveledUp = true;
        
        // レベルアップボーナス
        const sp = 1; // スキルポイント
        const ap = 5; // ステータスポイント
        
        player.skillPoints += sp;
        player.statPoints += ap;
        skillPointsGained += sp;
        statPointsGained += ap;
      }

      player.exp = exp;
      player.level = level;

      // ステータス再計算（最大HP/MPの更新のため）
      const newStats = calculatePlayerStats(player);
      player.stats = newStats;

      if (leveledUp) {
        // 全回復
        player.hp = newStats.maxHp;
        player.mp = newStats.maxMp;
        
        addLog(`レベルが ${level} に上がった！`, 'success');
        addLog(`ステータスポイント+${statPointsGained}, スキルポイント+${skillPointsGained} を獲得。`, 'info');
      }

      return {
        ...prev,
        player
      };
    });
  }, [setGameState, addLog]);

  // ステータスポイントの割り振り
  const upgradeStat = useCallback((statKey: keyof Pick<PlayerStats, 'str' | 'vit' | 'dex' | 'agi' | 'int' | 'wis'>, amount: number = 1) => {
    setGameState(prev => {
      const player = { ...prev.player };

      if (player.statPoints < amount) {
        // UI側で制御するが、念のため
        return prev;
      }

      // ベースステータスを加算
      player[statKey] = (player[statKey] || 0) + amount;
      player.statPoints -= amount;

      // ステータス再計算
      const newStats = calculatePlayerStats(player);
      
      // 最大HP/MPが増えた分だけ現在値も回復させる（親切設計）
      const hpDiff = newStats.maxHp - player.stats.maxHp;
      const mpDiff = newStats.maxMp - player.stats.maxMp;
      
      if (hpDiff > 0) player.hp += hpDiff;
      if (mpDiff > 0) player.mp += mpDiff;

      player.stats = newStats;

      return {
        ...prev,
        player
      };
    });
  }, [setGameState]);

  return {
    gainExp,
    upgradeStat
  };
};
