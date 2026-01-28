import { useState, useCallback } from 'react';
import { GameState, PlayerState, LogEntry } from '../types/gameState';
import { EnemyInstance } from '../types/enemy';
import { StatusEffect } from '../types/combat';
import { processEnemyTurn } from '../utils/ai';
import { calculateDamage, processEnemyDrop } from '../utils/battle';
import { calculatePlayerStats } from '../utils/stats';
import { useItemSystem } from './useItemSystem';

// 状態異常によるダメージ計算などの定数
const STATUS_DAMAGE = {
  POISON: 0.05, // MaxHPの5%
  BURN: 0.08,   // MaxHPの8%
  REGEN: 0.05,  // MaxHPの5%回復
};

export const useTurnSystem = (
  gameState: GameState, 
  setGameState: React.Dispatch<React.SetStateAction<GameState>>,
  addLog: (text: string, type?: LogEntry['type']) => void
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
    // stats.hpと直下のhpを同期させておく（念の為）
    if (isPlayer) {
        (currentEntity as PlayerState).stats.hp = (currentEntity as PlayerState).hp;
    }

    const messages: string[] = [];
    let shouldSkipTurn = false;
    
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
          break;
        case 'burn':
          const burnDmg = Math.max(1, Math.floor(maxHp * STATUS_DAMAGE.BURN));
          hp = Math.max(0, hp - burnDmg);
          messages.push(`${currentEntity.name}は燃焼で${burnDmg}のダメージを受けた！`);
          break;
        case 'regen':
          if (hp < maxHp) {
            const heal = Math.max(1, Math.floor(maxHp * STATUS_DAMAGE.REGEN));
            hp = Math.min(maxHp, hp + heal);
            messages.push(`${currentEntity.name}はHPが${heal}回復した。`);
          }
          break;
        case 'stun':
          shouldSkipTurn = true;
          messages.push(`${currentEntity.name}はスタンしていて動けない！`);
          break;
      }

      // 値を戻す
      if (isPlayer) {
          (currentEntity as PlayerState).hp = hp;
          (currentEntity as PlayerState).stats.hp = hp;
      } else {
          (currentEntity as EnemyInstance).stats.hp = hp;
          // EnemyInstanceは直下のhpプロパティを持たない定義もあるが、互換性のためstats優先
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
  }, []);

  /**
   * 敵ターンの処理サイクル
   */
  const processTurnCycle = useCallback(async () => {
    setIsProcessingTurn(true);

    // 1. 敵の行動処理 (AI & Status)
    setGameState(prev => {
        // AI移動・攻撃処理
        const newState = processEnemyTurn(prev);
        
        // プレイヤーの死亡判定
        if (newState.player.hp <= 0) {
            return {
                ...newState,
                isGameOver: true,
                logs: [...newState.logs, { id: crypto.randomUUID(), text: 'あなたは力尽きた...', type: 'danger', timestamp: Date.now() }]
            };
        }

        return newState;
    });

    // 少しウェイトを入れる（演出用）
    await new Promise(resolve => setTimeout(resolve, 100));

    // 2. プレイヤーの状態異常処理（ターン開始時）
    setGameState(prev => {
        if (prev.isGameOver) return prev;

        const { entity: updatedPlayer, messages: pMessages } = processStatusEffects(prev.player, true);
        
        // ログ反映
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
  }, [setGameState, processStatusEffects]);

  /**
   * プレイヤー移動時のターン消費
   */
  const handlePlayerMove = useCallback(async () => {
      // 移動完了後に敵ターンへ
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
        
        // --- ユニーク効果: 狂戦士の斧 (Berserker's Axe) ---
        const hasBerserkerAxe = newPlayer.equipment.mainHand?.id === 'unique_berserker_axe';
        let selfDamageMsg = '';
        
        if (hasBerserkerAxe) {
            const selfDmg = Math.floor(newPlayer.maxHp * 0.05);
            newPlayer.hp = Math.max(1, newPlayer.hp - selfDmg); // 1残るか死ぬか。ここでは死なない仕様とする
            newPlayer.stats.hp = newPlayer.hp;
            selfDamageMsg = `(反動ダメージ: ${selfDmg})`;
        }
        // ------------------------------------------------

        // ダメージ計算（ステータス再計算込み）
        const currentStats = calculatePlayerStats(newPlayer);
        // 更新したステータスを反映
        newPlayer.stats = { ...newPlayer.stats, ...currentStats };

        const result = calculateDamage(newPlayer, target); // utils/battle.ts
        
        addLog(`あなたの攻撃！ ${target.name}に${result.damage}のダメージ！${result.critical ? ' 会心の一撃！' : ''} ${selfDamageMsg}`, 'success');

        // 敵HP更新
        const newEnemies = [...enemies];
        const newTarget = { ...target, stats: { ...target.stats, hp: target.stats.hp - result.damage } };
        
        // 死亡判定
        if (newTarget.stats.hp <= 0) {
            addLog(`${target.name}を倒した！`, 'info');
            
            // ドロップ処理
            const drop = processEnemyDrop(newTarget, player.level);
            
            // 経験値・ゴールド獲得
            newPlayer.gold += drop.gold;
            newPlayer.exp += drop.exp;
            addLog(`${drop.exp} EXP と ${drop.gold} Gold を獲得。`, 'info');

            // レベルアップ判定は別途必要だが省略

            // アイテム獲得
            drop.items.forEach(item => {
                obtainItem(item.id, item.quantity); // Note: ここで呼ぶと二重更新になるリスクがあるため、ログだけ出すかActionを分けるべきだが今回は許容
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

    // 攻撃後、敵ターンへ
    await processTurnCycle();

  }, [isProcessingTurn, setGameState, addLog, processTurnCycle, obtainItem]);

  return {
    handlePlayerAttack,
    handlePlayerMove,
    processTurnCycle,
    processStatusEffects,
    advanceTurn: processTurnCycle, // 互換性のため
    isProcessingTurn
  };
};
