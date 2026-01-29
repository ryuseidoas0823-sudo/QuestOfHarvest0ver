import { useState, useCallback } from 'react';
import { GameState, Position } from '../types/gameState';
import { EnemyInstance } from '../types/enemy';
import { calculateDamage, isHit, isCritical } from '../utils/battle';
import { LogManager } from './useGameCore';
import { AI } from '../utils/ai';

export type VisualEventType = 'damage' | 'heal' | 'text' | 'effect' | 'attack';

export const useTurnSystem = (
  gameState: GameState,
  setGameState: React.Dispatch<React.SetStateAction<GameState>>,
  addLog: LogManager['addLog'],
  onVisualEvent: (type: VisualEventType, pos: Position, value?: string | number, color?: string) => void
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
    
    const direction = getDirection(player.position, targetEnemy.position);
    onVisualEvent('attack', targetEnemy.position, direction, 'slash'); // 明示的に'slash'

    await new Promise(resolve => setTimeout(resolve, 100));

    if (!isHit(player.stats, targetEnemy.stats)) {
      addLog(`${targetEnemy.name}に攻撃を外した！`, 'warning');
      onVisualEvent('text', targetEnemy.position, 'MISS', '#aaaaaa');
      return;
    }

    const critical = isCritical(player.stats);
    const damage = calculateDamage(player.stats, targetEnemy.stats, critical);
    
    const color = critical ? '#ff4444' : '#ffffff';
    const text = critical ? `${damage}!` : `${damage}`;
    
    onVisualEvent('damage', targetEnemy.position, text, color);
    onVisualEvent('effect', targetEnemy.position, undefined, critical ? '#ffaa00' : '#ffff00');

    if (critical) {
       addLog(`会心の一撃！ ${targetEnemy.name}に${damage}のダメージ！`, 'critical');
    } else {
       addLog(`${targetEnemy.name}に${damage}のダメージを与えた。`);
    }

    setGameState(prev => {
      const updatedEnemies = prev.enemies.map(e => {
        if (e.id === targetEnemy.id) {
            return { ...e, hp: Math.max(0, e.hp - damage) };
        }
        return e;
      });
      return {
        ...prev,
        enemies: updatedEnemies.filter(e => e.hp > 0)
      };
    });

    if (targetEnemy.hp - damage <= 0) {
        addLog(`${targetEnemy.name}を倒した！`, 'success');
    }

  }, [gameState.player, addLog, onVisualEvent, setGameState]);

  // 敵のターン処理
  const processEnemyTurn = useCallback(async () => {
    // プレイヤーが死んでいたら終了
    if (gameState.player.hp <= 0) return;

    // AI思考と行動
    // 状態を更新しながら敵を順番に行動させる必要があるため、
    // ここでは単純化してループ処理するが、本来は非同期でウェイトを入れるべき
    
    // 現在の最新のプレイヤー位置などを取得するため、関数型更新の中で処理するか、
    // またはコピーを持って回す必要がある。
    // ここでは簡易的に現在のgameStateを使って計算し、一括更新する形をとる。
    // ※ 厳密な順次行動には非同期ループが必要
    
    // 敵の行動ログ用バッファ
    const logs: {text: string, type?: 'normal'|'warning'|'danger'}[] = [];
    const visualEvents: {type: VisualEventType, pos: Position, value?: string|number, color?: string, delay: number}[] = [];

    let playerHpDamage = 0;

    gameState.enemies.forEach(enemy => {
        // AI行動決定
        const action = AI.decideAction(enemy, gameState.player, gameState.dungeon);
        
        if (action.type === 'move' && action.to) {
             // 移動処理は setGameState でまとめて行う（座標更新）
             // ここではロジック省略（useDungeon側と重複するため、本来はAI移動もHooks化すべき）
             // 今回は「攻撃」にフォーカスするため、隣接している場合のみ攻撃処理を書く
        } else if (action.type === 'attack') {
             const damage = Math.max(1, enemy.stats.atk - gameState.player.stats.def);
             playerHpDamage += damage;
             
             logs.push({ text: `${enemy.name}の攻撃！ ${damage}のダメージを受けた！`, type: 'danger' });
             
             // 視覚効果: 敵攻撃
             // 敵からプレイヤーへの方向
             const dir = getDirection(enemy.position, gameState.player.position);
             visualEvents.push({ 
                 type: 'attack', 
                 pos: gameState.player.position, 
                 value: dir, 
                 color: 'claw', // ここで variant 'claw' を指定
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

    // 視覚効果の発火（少し遅延させる）
    visualEvents.forEach((ev, i) => {
        setTimeout(() => {
            onVisualEvent(ev.type, ev.pos, ev.value, ev.color);
        }, i * 200 + ev.delay);
    });

    // ログ出力
    logs.forEach(log => addLog(log.text, log.type));

    // プレイヤーHP更新
    if (playerHpDamage > 0) {
        setGameState(prev => ({
            ...prev,
            player: {
                ...prev.player,
                hp: Math.max(0, prev.player.hp - playerHpDamage)
            }
        }));
    }
    
    // ターン終了フラグ解除
    setIsProcessing(false);

  }, [gameState, addLog, onVisualEvent, setGameState]);

  // ターン終了監視エフェクト（プレイヤー行動後に呼ばれる）
  // 実際には useTurnSystem を呼び出す側が制御するが、
  // ここでは performPlayerAttack の後に自動で呼ばれる想定
  
  return {
    performPlayerAttack,
    processEnemyTurn, // 追加
    isProcessing,
    setIsProcessing
  };
};
