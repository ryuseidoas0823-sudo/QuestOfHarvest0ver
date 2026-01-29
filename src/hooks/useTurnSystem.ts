import { useState, useCallback } from 'react';
import { GameState, Position } from '../types/gameState';
import { EnemyInstance } from '../types/enemy';
import { calculateDamage, isHit, isCritical } from '../utils/battle';
import { LogManager } from './useGameCore';
import { AI } from '../utils/ai';
// アイテム生成用
import { generateLoot } from '../utils/lootGenerator';
import { Item } from '../types/item';

export type VisualEventType = 'damage' | 'heal' | 'text' | 'effect' | 'attack';

export const useTurnSystem = (
  gameState: GameState,
  setGameState: React.Dispatch<React.SetStateAction<GameState>>,
  addLog: LogManager['addLog'],
  onVisualEvent: (type: VisualEventType, pos: Position, value?: string | number, color?: string) => void,
  // 依存関係を追加
  addItem: (item: Item) => void,
  gainExp: (amount: number) => void
) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const getDirection = (from: Position, to: Position): string => {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    if (Math.abs(dx) > Math.abs(dy)) return dx > 0 ? 'right' : 'left';
    return dy > 0 ? 'down' : 'up';
  };

  const performPlayerAttack = useCallback(async (targetEnemy: EnemyInstance) => {
    const player = gameState.player;
    
    // 1. 攻撃モーション
    const direction = getDirection(player.position, targetEnemy.position);
    onVisualEvent('attack', targetEnemy.position, direction, 'slash');

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
    
    // 4. 視覚効果
    const color = critical ? '#ff4444' : '#ffffff';
    const text = critical ? `${damage}!` : `${damage}`;
    onVisualEvent('damage', targetEnemy.position, text, color);
    onVisualEvent('effect', targetEnemy.position, undefined, critical ? '#ffaa00' : '#ffff00');

    if (critical) {
       addLog(`会心の一撃！ ${targetEnemy.name}に${damage}のダメージ！`, 'critical');
    } else {
       addLog(`${targetEnemy.name}に${damage}のダメージを与えた。`);
    }

    // 5. 敵のHP更新と死亡判定
    let enemyDied = false;

    setGameState(prev => {
      const updatedEnemies = prev.enemies.map(e => {
        if (e.id === targetEnemy.id) {
            const newHp = Math.max(0, e.hp - damage);
            if (newHp === 0) enemyDied = true;
            return { ...e, hp: newHp };
        }
        return e;
      });
      // HP0の敵を除外
      return {
        ...prev,
        enemies: updatedEnemies.filter(e => e.hp > 0)
      };
    });

    // 6. 死亡時処理（報酬）
    // setGameStateの外で実行（副作用）
    if (targetEnemy.hp - damage <= 0) {
        addLog(`${targetEnemy.name}を倒した！`, 'success');
        
        // 経験値獲得 (敵の経験値プロパティがあればそれを使う。なければ固定値)
        const exp = targetEnemy.exp || 10;
        gainExp(exp);

        // アイテムドロップ判定 (30%の確率とする)
        if (Math.random() < 0.3) {
            // 階層レベルを渡して生成
            const loot = generateLoot(1);
            addItem(loot);
            
            addLog(`${targetEnemy.name}は ${loot.name} を落とした！`, 'success');
            onVisualEvent('text', targetEnemy.position, 'DROP', '#00ffff');
        }
    }

  }, [gameState.player, addLog, onVisualEvent, setGameState, addItem, gainExp]);

  // 敵のターン処理
  const processEnemyTurn = useCallback(async () => {
    if (gameState.player.hp <= 0) return;

    const logs: {text: string, type?: 'normal'|'warning'|'danger'}[] = [];
    const visualEvents: {type: VisualEventType, pos: Position, value?: string|number, color?: string, delay: number}[] = [];
    let playerHpDamage = 0;

    gameState.enemies.forEach(enemy => {
        const action = AI.decideAction(enemy, gameState.player, gameState.dungeon);
        
        if (action.type === 'attack') {
             const damage = Math.max(1, enemy.stats.atk - gameState.player.stats.def);
             playerHpDamage += damage;
             
             logs.push({ text: `${enemy.name}の攻撃！ ${damage}のダメージを受けた！`, type: 'danger' });
             
             const dir = getDirection(enemy.position, gameState.player.position);
             visualEvents.push({ 
                 type: 'attack', 
                 pos: gameState.player.position, 
                 value: dir, 
                 color: 'claw', 
                 delay: 0 
             });
             visualEvents.push({ 
                 type: 'damage', 
                 pos: gameState.player.position, 
                 value: damage, 
                 color: '#ff0000',
                 delay: 200 
             });
        }
    });

    visualEvents.forEach((ev, i) => {
        setTimeout(() => {
            onVisualEvent(ev.type, ev.pos, ev.value, ev.color);
        }, i * 200 + ev.delay);
    });

    logs.forEach(log => addLog(log.text, log.type));

    if (playerHpDamage > 0) {
        setGameState(prev => ({
            ...prev,
            player: {
                ...prev.player,
                hp: Math.max(0, prev.player.hp - playerHpDamage)
            }
        }));
    }
    
    setIsProcessing(false);

  }, [gameState, addLog, onVisualEvent, setGameState, setIsProcessing]);
  
  return {
    performPlayerAttack,
    processEnemyTurn,
    isProcessing,
    setIsProcessing
  };
};
