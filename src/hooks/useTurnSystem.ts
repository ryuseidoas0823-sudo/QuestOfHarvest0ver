import { useState, useCallback } from 'react';
import { GameState, PlayerState, LogEntry, Position } from '../types/gameState';
import { EnemyInstance } from '../types/enemy';
import { StatusEffect } from '../types/combat';
import { processEnemyTurn } from '../utils/ai';
import { calculateDamage, processEnemyDrop } from '../utils/battle';
import { calculatePlayerStats } from '../utils/stats';
import { useItemSystem } from './useItemSystem';

// 視覚効果イベントの定義
export type VisualEventType = 'damage' | 'heal' | 'miss' | 'effect';
export type VisualEventCallback = (type: VisualEventType, position: Position, value?: string | number, color?: string) => void;

// 状態異常によるダメージ計算などの定数
const STATUS_DAMAGE = {
  POISON: 0.05,
  BURN: 0.08, 
  REGEN: 0.05,
};

export const useTurnSystem = (
  gameState: GameState, 
  setGameState: React.Dispatch<React.SetStateAction<GameState>>,
  addLog: (text: string, type?: LogEntry['type']) => void,
  onVisualEvent?: VisualEventCallback // 追加: 視覚効果用コールバック
) => {
  const [isProcessingTurn, setIsProcessingTurn] = useState(false);
  const { obtainItem } = useItemSystem(setGameState, addLog);

  // 状態異常の処理
  const processStatusEffects = useCallback((entity: PlayerState | EnemyInstance, isPlayer: boolean): { 
    entity: PlayerState | EnemyInstance, 
    messages: string[],
    shouldSkipTurn: boolean 
  } => {
    let currentEntity = { ...entity };
    // プレイヤーのhp/stats.hp同期
    if (isPlayer) {
        (currentEntity as PlayerState).stats.hp = (currentEntity as PlayerState).hp;
    }

    const messages: string[] = [];
    let shouldSkipTurn = false;
    
    // 位置情報の取得（エフェクト表示用）
    const pos = isPlayer ? (currentEntity as PlayerState).position : (currentEntity as EnemyInstance).position;
    
    if (!currentEntity.statusEffects || currentEntity.statusEffects.length === 0) {
      return { entity: currentEntity, messages, shouldSkipTurn };
    }

    const remainingEffects: StatusEffect[] = [];

    currentEntity.statusEffects.forEach(effect => {
      let hp = isPlayer ? (currentEntity as PlayerState).hp : (currentEntity as EnemyInstance).stats.hp;
      const maxHp = isPlayer ? (currentEntity as PlayerState).maxHp : (currentEntity as EnemyInstance).stats.maxHp;

      switch (effect.type) {
        case 'poison':
          const poisonDmg = Math.max(1, Math.floor(maxHp * STATUS_DAMAGE.POISON));
          hp = Math.max(0, hp - poisonDmg);
          messages.push(`${currentEntity.name}は毒で${poisonDmg}のダメージを受けた！`);
          if (onVisualEvent) onVisualEvent('damage', pos, poisonDmg, '#a855f7'); // 紫色
          break;
        case 'burn':
          const burnDmg = Math.max(1, Math.floor(maxHp * STATUS_DAMAGE.BURN));
          hp = Math.max(0, hp - burnDmg);
          messages.push(`${currentEntity.name}は燃焼で${burnDmg}のダメージを受けた！`);
          if (onVisualEvent) onVisualEvent('damage', pos, burnDmg, '#f97316'); // オレンジ
          break;
        case 'regen':
          if (hp < maxHp) {
            const heal = Math.max(1, Math.floor(maxHp * STATUS_DAMAGE.REGEN));
            hp = Math.min(maxHp, hp + heal);
            messages.push(`${currentEntity.name}はHPが${heal}回復した。`);
            if (onVisualEvent) onVisualEvent('heal', pos, heal, '#22c55e'); // 緑
          }
          break;
        case 'stun':
          shouldSkipTurn = true;
          messages.push(`${currentEntity.name}はスタンしていて動けない！`);
          if (onVisualEvent) onVisualEvent('effect', pos, 'STUN', '#eab308'); // 黄色
          break;
      }

      // 値を戻す
      if (isPlayer) {
          (currentEntity as PlayerState).hp = hp;
          (currentEntity as PlayerState).stats.hp = hp;
      } else {
          (currentEntity as EnemyInstance).stats.hp = hp;
      }

      if (effect.duration < 999) {
        effect.duration -= 1;
      }

      if (effect.duration > 0) {
        remainingEffects.push(effect);
      } else {
        messages.push(`${currentEntity.name}の${effect.name}の効果が切れた。`);
      }
    });

    currentEntity.statusEffects = remainingEffects;
    
    return { entity: currentEntity, messages, shouldSkipTurn };
  }, [onVisualEvent]);

  /**
   * 敵ターンの処理サイクル
   */
  const processTurnCycle = useCallback(async () => {
    setIsProcessingTurn(true);

    // 1. 敵の行動処理 (AI & Status)
    setGameState(prev => {
        // AI移動・攻撃処理
        // Note: processEnemyTurn内で発生したダメージのエフェクトを表示するには
        // processEnemyTurnの戻り値を拡張する必要があるが、今回は簡易的に
        // プレイヤーHPの減少を見てエフェクトを出すロジックをここに追加も可能
        // (本格対応はutils/ai.tsの改修が必要)
        const newState = processEnemyTurn(prev);
        
        // 簡易被ダメージエフェクト検出
        const dmgTaken = prev.player.hp - newState.player.hp;
        if (dmgTaken > 0 && onVisualEvent) {
             // プレイヤー位置に赤字
             onVisualEvent('damage', newState.player.position, dmgTaken, '#ef4444');
        }

        if (newState.player.hp <= 0) {
            return {
                ...newState,
                isGameOver: true,
                logs: [...newState.logs, { id: crypto.randomUUID(), text: 'あなたは力尽きた...', type: 'danger', timestamp: Date.now() }]
            };
        }

        return newState;
    });

    await new Promise(resolve => setTimeout(resolve, 100));

    // 2. プレイヤーの状態異常処理
    setGameState(prev => {
        if (prev.isGameOver) return prev;

        const { entity: updatedPlayer, messages: pMessages } = processStatusEffects(prev.player, true);
        
        const newLogs = pMessages.map(msg => ({ 
            id: crypto.randomUUID(), text: msg, type: 'warning' as const, timestamp: Date.now() 
        }));

        if ((updatedPlayer as PlayerState).hp <= 0) {
            return {
                ...prev,
                player: updatedPlayer as PlayerState,
                isGameOver: true,
                logs: [...prev.logs, ...newLogs, { id: crypto.randomUUID(), text: '力尽きた...', type: 'danger', timestamp: Date.now() }]
            };
        }

        return {
            ...prev,
            player: updatedPlayer as PlayerState,
            logs: [...prev.logs, ...newLogs]
        };
    });

    setIsProcessingTurn(false);
  }, [setGameState, processStatusEffects, onVisualEvent]);

  /**
   * プレイヤー移動時のターン消費
   */
  const handlePlayerMove = useCallback(async () => {
      await processTurnCycle();
  }, [processTurnCycle]);

  /**
   * プレイヤーの攻撃処理
   */
  const handlePlayerAttack = useCallback(async (targetEnemyId: string) => {
    if (isProcessingTurn) return;

    setGameState(prev => {
        const { player, enemies } = prev;
        const targetIndex = enemies.findIndex(e => e.id === targetEnemyId);
        if (targetIndex === -1) return prev;

        const target = enemies[targetIndex];
        let newPlayer = { ...player };
        
        // ユニーク効果処理（自傷）
        const hasBerserkerAxe = newPlayer.equipment.mainHand?.id === 'unique_berserker_axe';
        let selfDamageMsg = '';
        if (hasBerserkerAxe) {
            const selfDmg = Math.floor(newPlayer.maxHp * 0.05);
            newPlayer.hp = Math.max(1, newPlayer.hp - selfDmg);
            newPlayer.stats.hp = newPlayer.hp;
            selfDamageMsg = `(反動: ${selfDmg})`;
            
            // 自傷エフェクト
            if (onVisualEvent) onVisualEvent('damage', newPlayer.position, selfDmg, '#ef4444');
        }

        // ダメージ計算
        const currentStats = calculatePlayerStats(newPlayer);
        newPlayer.stats = { ...newPlayer.stats, ...currentStats };

        const result = calculateDamage(newPlayer, target);
        
        addLog(`攻撃！ ${target.name}に${result.damage}のダメージ！${result.critical ? ' 会心！' : ''} ${selfDamageMsg}`, 'success');

        // ★ 攻撃ヒット時の視覚効果 ★
        if (onVisualEvent) {
            const color = result.critical ? '#ff0000' : '#ffffff';
            const text = result.critical ? `${result.damage}!` : `${result.damage}`;
            onVisualEvent('damage', target.position, text, color);
            onVisualEvent('effect', target.position, '', '#ffff00'); // ヒットエフェクト
        }

        // 敵HP更新
        const newEnemies = [...enemies];
        const newTarget = { ...target, stats: { ...target.stats, hp: target.stats.hp - result.damage } };
        
        if (newTarget.stats.hp <= 0) {
            addLog(`${target.name}を倒した！`, 'info');
            const drop = processEnemyDrop(newTarget, player.level);
            newPlayer.gold += drop.gold;
            newPlayer.exp += drop.exp;
            addLog(`${drop.exp} EXP, ${drop.gold} G 獲得。`, 'info');
            
            // 簡易的なレベルアップ確認
            // (本来はusePlayerのgainExpを使うべきだが、Hookの呼び出し構造上ここで簡易加算し、後で整合性を取るか、gainExpを外から呼ぶ形にする)
            
            drop.items.forEach(item => {
                obtainItem(item.id, item.quantity);
            });
            newEnemies.splice(targetIndex, 1);
        } else {
            newEnemies[targetIndex] = newTarget;
        }

        return {
            ...prev,
            player: newPlayer,
            enemies: newEnemies
        };
    });

    await processTurnCycle();

  }, [isProcessingTurn, setGameState, addLog, processTurnCycle, obtainItem, onVisualEvent]);

  return {
    handlePlayerAttack,
    handlePlayerMove,
    processTurnCycle,
    processStatusEffects,
    advanceTurn: processTurnCycle,
    isProcessingTurn
  };
};
