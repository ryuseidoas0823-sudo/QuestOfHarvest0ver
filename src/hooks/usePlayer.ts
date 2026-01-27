import { useState, useCallback } from 'react';
import { PlayerState, GameState } from '../types/gameState';
import { calculateMaxPotions, calculateHealAmount } from '../utils/potion';

// 初期ステータス定義
const INITIAL_PLAYER_STATS = {
  hp: 100,
  maxHp: 100,
  mp: 30,
  maxMp: 30,
  str: 10,
  vit: 10,
  dex: 10,
  agi: 10,
  mag: 10,
  luc: 10
};

export const usePlayer = () => {
  // 初期状態の生成
  const createInitialPlayer = (name: string): PlayerState => ({
    name,
    level: 1,
    exp: 0,
    nextExp: 100,
    gold: 0,
    position: { x: 1, y: 1 },
    direction: 'down',
    ...INITIAL_PLAYER_STATS,
    stats: { ...INITIAL_PLAYER_STATS },
    ct: 0,
    quickPotion: {
      current: 3,
      max: 3
    }
  });

  /**
   * ポーションを使用するアクション
   * ターン消費なしで即時回復
   */
  const useQuickPotion = useCallback((
    gameState: GameState, 
    setGameState: React.Dispatch<React.SetStateAction<GameState>>,
    addLog: (msg: string, type?: 'success' | 'warning') => void
  ) => {
    setGameState(prev => {
      const player = prev.player;

      // チェック: 所持数があるか
      if (player.quickPotion.current <= 0) {
        addLog("クイックポーションが切れている！", 'warning');
        return prev;
      }

      // チェック: HPが満タンか
      if (player.hp >= player.maxHp) {
        addLog("HPは満タンだ。", 'warning');
        return prev;
      }

      // 回復計算
      const healAmount = calculateHealAmount(player);
      const newHp = Math.min(player.maxHp, player.hp + healAmount);
      const actualHeal = newHp - player.hp;

      addLog(`クイックポーション使用！ HPが${actualHeal}回復した。`, 'success');

      return {
        ...prev,
        player: {
          ...player,
          hp: newHp,
          quickPotion: {
            ...player.quickPotion,
            current: player.quickPotion.current - 1
          }
        }
      };
    });
  }, []);

  /**
   * ポーションを補充する（街などで使用）
   */
  const refillPotions = useCallback((
    setGameState: React.Dispatch<React.SetStateAction<GameState>>
  ) => {
    setGameState(prev => {
      const max = calculateMaxPotions(prev.player);
      return {
        ...prev,
        player: {
          ...prev.player,
          quickPotion: {
            current: max,
            max: max
          }
        }
      };
    });
  }, []);

  return {
    createInitialPlayer,
    useQuickPotion,
    refillPotions
  };
};
