import { useState, useCallback } from 'react';
import { PlayerState, GameState } from '../types/gameState';
import { calculateMaxPotions, calculateHealAmount } from '../utils/potion';
import { ITEMS } from '../data/items'; // 追加

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
    gold: 500, // 少し所持金を持たせる
    position: { x: 1, y: 1 },
    direction: 'down',
    ...INITIAL_PLAYER_STATS,
    stats: { ...INITIAL_PLAYER_STATS },
    ct: 0,
    quickPotion: {
      current: 3,
      max: 3
    },
    inventory: [
        // テスト用に初期アイテムを持たせる
        { item: ITEMS['potion_low'], quantity: 3 },
        { item: ITEMS['ether_low'], quantity: 1 }
    ],
    equipment: {}
  });

  /**
   * ポーションを使用するアクション (Quick Potion)
   */
  const useQuickPotion = useCallback((
    gameState: GameState, 
    setGameState: React.Dispatch<React.SetStateAction<GameState>>,
    addLog: (msg: string, type?: 'success' | 'warning') => void
  ) => {
    setGameState(prev => {
      const player = prev.player;
      if (player.quickPotion.current <= 0) {
        addLog("クイックポーションが切れている！", 'warning');
        return prev;
      }
      if (player.hp >= player.maxHp) {
        addLog("HPは満タンだ。", 'warning');
        return prev;
      }
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
   * ポーションを補充する
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
