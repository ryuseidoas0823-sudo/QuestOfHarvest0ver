import { useState, useCallback } from 'react';
import { PlayerState } from '../types';
import { EnemyInstance } from '../types/enemy';
import { calculateDamage } from '../data/balance'; // 追加

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
  damageEnemy: (id: string, dmg: number) => void,
  gainExp: (amount: number) => void // 追加
) => {
  const [turnState, setTurnState] = useState<TurnState>({
    turnCount: 0,
    isProcessing: false
  });

  // 敵のターン処理
  const processEnemyTurn = useCallback(() => {
    dungeonState.enemies.forEach(enemy => {
      if (enemy.hp <= 0) return; // 死体蹴り防止

      const dx = playerState.x - enemy.x;
      const dy = playerState.y - enemy.y;
      const distance = Math.abs(dx) + Math.abs(dy);

      // 1. 隣接していれば攻撃
      if (distance === 1) {
        // 敵攻撃力 vs プレイヤー防御力
        const atk = enemy.attack || 10;
        const def = playerState.stats.defense || 0;
        const damage = calculateDamage(atk, def);

        updatePlayerStatus({ hp: Math.max(0, playerState.hp - damage) });
        addLog(`${enemy.name}の攻撃！ ${damage}のダメージ！`);
      }
      // 2. 距離が近ければ移動（視界内）
      else if (distance < 8) {
        let newX = enemy.x;
        let newY = enemy.y;

        // X軸移動優先度などの簡単なAI
        if (dx !== 0 && Math.random() > 0.3) {
          newX += dx > 0 ? 1 : -1;
        } else if (dy !== 0) {
          newY += dy > 0 ? 1 : -1;
        }

        // 壁チェック
        if (dungeonState.map[newY] && dungeonState.map[newY][newX] && dungeonState.map[newY][newX].type !== 'wall') {
            // 他の敵やプレイヤーとの重なりチェック
            const isBlockedByEnemy = dungeonState.enemies.some(e => e.x === newX && e.y === newY && e.hp > 0);
            const isBlockedByPlayer = (newX === playerState.x && newY === playerState.y);

            if (!isBlockedByEnemy && !isBlockedByPlayer) {
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

    // プレイヤー攻撃力 vs 敵防御力
    const atk = playerState.stats.attack || 10;
    const def = target.defense || 0;
    const damage = calculateDamage(atk, def);

    addLog(`${target.name}に攻撃！ ${damage}のダメージ！`);
    
    // ダメージ適用
    damageEnemy(target.id, damage);

    // 敵撃破判定 (簡易的にここで判定。本来はdamageEnemyの結果やuseEffectで監視)
    if (target.hp - damage <= 0) {
        const exp = target.exp || 10;
        addLog(`${target.name}を倒した！ ${exp} Exp獲得。`);
        gainExp(exp);
    }
    
    // 攻撃したらターン経過
    advanceTurn();

  }, [addLog, damageEnemy, advanceTurn, playerState.stats, gainExp]);

  return {
    turnState,
    advanceTurn,
    executePlayerAttack
  };
};
