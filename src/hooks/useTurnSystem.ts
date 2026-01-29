import { useState, useCallback } from 'react';
import { GameState, Position } from '../types/gameState';
import { EnemyInstance } from '../types/enemy';
import { calculateDamage, isHit, isCritical } from '../utils/battle';
import { LogManager } from './useGameCore';

// 視覚効果イベントの型定義（拡張）
// 'attack' を追加: 攻撃モーション再生用
export type VisualEventType = 'damage' | 'heal' | 'text' | 'effect' | 'attack';

export const useTurnSystem = (
  gameState: GameState,
  setGameState: React.Dispatch<React.SetStateAction<GameState>>,
  addLog: LogManager['addLog'],
  onVisualEvent: (type: VisualEventType, pos: Position, value?: string | number, color?: string) => void
) => {
  const [isProcessing, setIsProcessing] = useState(false);

  // 攻撃方向を計算するヘルパー関数
  const getDirection = (from: Position, to: Position): string => {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    // 横方向の移動量が大きい場合は左右、そうでなければ上下
    if (Math.abs(dx) > Math.abs(dy)) {
      return dx > 0 ? 'right' : 'left';
    }
    return dy > 0 ? 'down' : 'up';
  };

  // プレイヤーの攻撃処理
  const performPlayerAttack = useCallback(async (targetEnemy: EnemyInstance) => {
    const player = gameState.player;
    
    // 1. 攻撃モーションイベントの発火 (ここが今回の追加ポイント)
    // プレイヤーの位置からターゲットの位置への方向を計算して渡す
    const direction = getDirection(player.position, targetEnemy.position);
    onVisualEvent('attack', targetEnemy.position, direction);

    // アニメーションとダメージ表示のタイミングを少しずらす（演出強化）
    await new Promise(resolve => setTimeout(resolve, 100));

    // 2. 命中判定
    if (!isHit(player.stats, targetEnemy.stats)) {
      addLog(`${targetEnemy.name}に攻撃を外した！`, 'warning');
      onVisualEvent('text', targetEnemy.position, 'MISS', '#aaaaaa');
      return;
    }

    // 3. ダメージ計算
    const critical = isCritical(player.stats);
    const damage = calculateDamage(player.stats, targetEnemy.stats, critical);
    
    // 4. ダメージとエフェクトのイベント発火
    const color = critical ? '#ff4444' : '#ffffff';
    const text = critical ? `${damage}!` : `${damage}`;
    
    // ダメージ数値ポップアップ
    onVisualEvent('damage', targetEnemy.position, text, color);
    
    // ヒットエフェクト（パーティクル等）
    onVisualEvent('effect', targetEnemy.position, undefined, critical ? '#ffaa00' : '#ffff00');

    if (critical) {
       addLog(`会心の一撃！ ${targetEnemy.name}に${damage}のダメージ！`, 'critical');
    } else {
       addLog(`${targetEnemy.name}に${damage}のダメージを与えた。`);
    }

    // 5. 敵の状態更新 (HP減算)
    setGameState(prev => {
      // 敵リストを更新
      const updatedEnemies = prev.enemies.map(e => {
        if (e.id === targetEnemy.id) {
            return { ...e, hp: Math.max(0, e.hp - damage) };
        }
        return e;
      });

      // 死亡した敵の処理（アイテムドロップや経験値加算は別関数に切り出すのが理想だが簡略化）
      const survivingEnemies = updatedEnemies.filter(e => e.hp > 0);
      const deadEnemies = updatedEnemies.filter(e => e.hp <= 0);

      // ログ出力
      deadEnemies.forEach(e => {
          // ここではsetState内なのでログ出力できないが、外側で判定済みならOK
          // 本来はuseEffect等で検知するか、この関数の外で処理する
      });

      return {
        ...prev,
        enemies: survivingEnemies
      };
    });

    if (targetEnemy.hp - damage <= 0) {
        addLog(`${targetEnemy.name}を倒した！`, 'success');
        // 経験値処理などをここに呼び出す
    }

  }, [gameState.player, addLog, onVisualEvent, setGameState]);

  return {
    performPlayerAttack,
    isProcessing,
    setIsProcessing
  };
};
