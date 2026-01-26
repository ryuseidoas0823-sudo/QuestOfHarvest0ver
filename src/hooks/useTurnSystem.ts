import { useState, useCallback } from 'react';
import { PlayerState } from '../types';
import { EnemyInstance } from '../types/enemy';
import { DungeonMap } from '../types'; // 型定義が必要ならインポート

interface TurnState {
  turnCount: number;
  isProcessing: boolean;
}

// 必要な関数を引数で受け取る
export const useTurnSystem = (
  playerState: PlayerState,
  dungeonState: { enemies: EnemyInstance[], map: any[][] },
  updateEntityPosition: (id: string, x: number, y: number) => void,
  updatePlayerStatus: (updates: Partial<PlayerState>) => void,
  addLog: (msg: string) => void,
  damageEnemy: (id: string, dmg: number) => void
) => {
  const [turnState, setTurnState] = useState<TurnState>({
    turnCount: 0,
    isProcessing: false
  });

  // 敵のターン処理
  const processEnemyTurn = useCallback(() => {
    // 全敵の行動処理
    dungeonState.enemies.forEach(enemy => {
      const dx = playerState.x - enemy.x;
      const dy = playerState.y - enemy.y;
      const distance = Math.abs(dx) + Math.abs(dy);

      // 1. 隣接していれば攻撃
      if (distance === 1) {
        // 簡易ダメージ計算
        const damage = Math.max(1, Math.floor(Math.random() * 5)); 
        updatePlayerStatus({ hp: Math.max(0, playerState.hp - damage) });
        addLog(`${enemy.name}の攻撃！ ${damage}のダメージ！`);
        // アニメーション用のフラグなどはここで管理するか、PlayerStateに持たせる
      }
      // 2. 距離が近ければ移動（視界内）
      else if (distance < 8) {
        let newX = enemy.x;
        let newY = enemy.y;

        // X軸移動
        if (dx !== 0) {
          newX += dx > 0 ? 1 : -1;
        } 
        // Y軸移動（Xで移動しなかった場合、またはランダムで）
        else if (dy !== 0) {
          newY += dy > 0 ? 1 : -1;
        }

        // 壁チェック（簡易）
        if (dungeonState.map[newY][newX].type !== 'wall') {
            // 他の敵との重なりチェック
            const isBlocked = dungeonState.enemies.some(e => e.x === newX && e.y === newY);
            if (!isBlocked && (newX !== playerState.x || newY !== playerState.y)) {
                updateEntityPosition(enemy.id, newX, newY);
            }
        }
      }
    });
  }, [dungeonState, playerState, updatePlayerStatus, addLog, updateEntityPosition]);

  // ターン進行のメイン関数
  const advanceTurn = useCallback(() => {
    if (turnState.isProcessing) return;

    setTurnState(prev => ({ ...prev, isProcessing: true }));

    // 1. プレイヤーの自然回復など
    // updatePlayerStatus({ sp: Math.min(playerState.maxSp, playerState.sp + 1) });

    // 2. 敵の行動（演出のため少し遅らせる）
    setTimeout(() => {
      processEnemyTurn();

      setTurnState(prev => ({ 
        turnCount: prev.turnCount + 1, 
        isProcessing: false 
      }));
    }, 200); 

  }, [turnState.isProcessing, processEnemyTurn]);

  // プレイヤーの攻撃アクション
  const executePlayerAttack = useCallback((target: EnemyInstance) => {
    if (!target) {
        addLog('そこには誰もいない。');
        return;
    }

    // ダメージ計算
    // 本来は playerState.attack などを使う
    const damage = 10 + Math.floor(Math.random() * 5);
    addLog(`${target.name}に攻撃！ ${damage}のダメージ！`);
    
    // ダメージ適用
    damageEnemy(target.id, damage);
    
    // 攻撃したらターン経過
    advanceTurn();

  }, [addLog, damageEnemy, advanceTurn]);

  return {
    turnState,
    advanceTurn,
    executePlayerAttack
  };
};
