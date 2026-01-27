import { useState, useCallback } from 'react';
import { GameState, PlayerState, LogEntry } from '../types/gameState';
import { EnemyInstance } from '../types/enemy';
import { StatusEffect } from '../types/combat';
import { useGameCore } from './useGameCore';

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
  // 状態異常の処理（ターン開始時）
  const processStatusEffects = useCallback((entity: PlayerState | EnemyInstance, isPlayer: boolean): { 
    entity: PlayerState | EnemyInstance, 
    messages: string[],
    shouldSkipTurn: boolean 
  } => {
    let currentEntity = { ...entity };
    const messages: string[] = [];
    let shouldSkipTurn = false;
    
    // 状態異常がなければそのまま返す
    if (!currentEntity.statusEffects || currentEntity.statusEffects.length === 0) {
      return { entity: currentEntity, messages, shouldSkipTurn };
    }

    const remainingEffects: StatusEffect[] = [];

    currentEntity.statusEffects.forEach(effect => {
      // 効果処理
      switch (effect.type) {
        case 'poison':
          const poisonDmg = Math.max(1, Math.floor(currentEntity.maxHp * STATUS_DAMAGE.POISON));
          currentEntity.hp = Math.max(0, currentEntity.hp - poisonDmg);
          messages.push(`${currentEntity.name}は毒で${poisonDmg}のダメージを受けた！`);
          break;
          
        case 'burn':
          const burnDmg = Math.max(1, Math.floor(currentEntity.maxHp * STATUS_DAMAGE.BURN));
          currentEntity.hp = Math.max(0, currentEntity.hp - burnDmg);
          messages.push(`${currentEntity.name}は燃焼で${burnDmg}のダメージを受けた！`);
          break;
          
        case 'regen':
          if (currentEntity.hp < currentEntity.maxHp) {
            const heal = Math.max(1, Math.floor(currentEntity.maxHp * STATUS_DAMAGE.REGEN));
            currentEntity.hp = Math.min(currentEntity.maxHp, currentEntity.hp + heal);
            messages.push(`${currentEntity.name}はHPが${heal}回復した。`);
          }
          break;
          
        case 'stun':
          shouldSkipTurn = true;
          messages.push(`${currentEntity.name}はスタンしていて動けない！`);
          break;
      }

      // ターン経過処理（999は永続/トグル扱いとして減らさない）
      if (effect.duration < 999) {
        effect.duration -= 1;
      }

      // 継続する効果のみ残す
      if (effect.duration > 0) {
        remainingEffects.push(effect);
      } else {
        messages.push(`${currentEntity.name}の${effect.name}の効果が切れた。`);
      }
    });

    currentEntity.statusEffects = remainingEffects;
    
    return { entity: currentEntity, messages, shouldSkipTurn };
  }, []);

  // ターン進行処理
  const advanceTurn = useCallback(async () => {
    // 実際の実装はuseGameCoreやgameLogicに依存する部分が多いが、
    // ここでは状態異常処理にフォーカスしたロジックを示す
    
    setGameState(prev => {
      // プレイヤーの状態異常処理
      const { entity: updatedPlayer, messages: pMessages, shouldSkipTurn: pSkip } = processStatusEffects(prev.player, true);
      
      // ログ追加
      pMessages.forEach(msg => addLog(msg, 'warning'));

      // CT加算などのロジックがここに入る...
      
      // 簡易的な実装: 状態異常反映のみ返す
      return {
        ...prev,
        player: updatedPlayer as PlayerState,
        logs: [
            ...prev.logs,
            ...pMessages.map(text => ({ 
                id: crypto.randomUUID(), 
                text, 
                type: 'warning' as const, 
                timestamp: Date.now() 
            }))
        ]
      };
    });
  }, [processStatusEffects, setGameState, addLog]);

  return {
    processStatusEffects,
    advanceTurn
  };
};
