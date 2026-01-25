import { useState, useCallback } from 'react';
import { PlayerState, DungeonMap } from '../types';
import { EnemyInstance } from '../types/enemy';

interface TurnState {
  turnCount: number;
  isProcessing: boolean;
}

export const useTurnSystem = (
  _playerState: PlayerState,
  _dungeonState: any, // 循環参照回避のためany、あるいはDungeonState型
  _updateEntityPosition: (id: string, x: number, y: number) => void,
  updatePlayerStatus: (updates: Partial<PlayerState>) => void,
  addLog: (msg: string) => void
) => {
  const [turnState, setTurnState] = useState<TurnState>({
    turnCount: 0,
    isProcessing: false
  });

  const advanceTurn = useCallback(() => {
    if (turnState.isProcessing) return;

    setTurnState(prev => ({ ...prev, isProcessing: true }));

    // 1. プレイヤーの回復など
    // updatePlayerStatus({ sp: Math.min(playerState.maxSp, playerState.sp + 1) });

    // 2. 敵の行動（非同期処理風に）
    setTimeout(() => {
      // 本来はここでAI処理
      // ...

      setTurnState(prev => ({ 
        turnCount: prev.turnCount + 1, 
        isProcessing: false 
      }));
    }, 100); // 演出用ウェイト

  }, [turnState.isProcessing]);

  const executePlayerAttack = useCallback((_target: EnemyInstance) => {
    addLog('攻撃！ しかし敵はいない（仮）');
    // ダメージ計算とHP減少処理
  }, [addLog]);

  return {
    turnState,
    advanceTurn,
    executePlayerAttack
  };
};
