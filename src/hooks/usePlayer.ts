import { useCallback } from 'react';
import { GameState, Position } from '../types/gameState';
import { LogManager } from './useGameCore';
import { VisualEventType } from './useTurnSystem';
import { calculateNextLevelExp } from '../utils/level';

export const usePlayer = (
  gameState: GameState,
  setGameState: React.Dispatch<React.SetStateAction<GameState>>,
  addLog: LogManager['addLog'],
  onVisualEvent: (type: VisualEventType, pos: Position, value?: string | number, color?: string) => void
) => {

  // 経験値獲得とレベルアップ
  const gainExp = useCallback((amount: number) => {
    setGameState(prev => {
      const player = prev.player;
      let newExp = player.exp + amount;
      let newLevel = player.level;
      let newMaxHp = player.maxHp;
      let newMaxMp = player.maxMp;
      let newHp = player.hp;
      let newMp = player.mp;
      let newStatPoints = player.statPoints;

      // 次のレベルまでの必要経験値
      let nextLevelExp = calculateNextLevelExp(newLevel);

      let leveledUp = false;

      // レベルアップ判定
      while (newExp >= nextLevelExp) {
        newExp -= nextLevelExp;
        newLevel++;
        leveledUp = true;
        nextLevelExp = calculateNextLevelExp(newLevel);

        // 成長処理:
        // 1. HP/MPは自動成長 (VIT/INTの影響はStats計算時に反映されるが、基礎値も少し上げる)
        newMaxHp += 5;
        newMaxMp += 2;
        
        // 2. ステータスポイント付与 (1レベルにつき3ポイントなど)
        newStatPoints += 3;
      }

      if (leveledUp) {
        // レベルアップ時は全回復
        newHp = newMaxHp;
        newMp = newMaxMp;

        addLog(`レベルが ${newLevel} に上がった！ (SP +${newStatPoints - player.statPoints})`, 'success');
        onVisualEvent('text', player.position, 'LEVEL UP!', '#FFD700');
        onVisualEvent('heal', player.position);
      } else {
        addLog(`${amount} の経験値を獲得。`);
      }

      return {
        ...prev,
        player: {
          ...player,
          level: newLevel,
          exp: newExp,
          maxHp: newMaxHp,
          maxMp: newMaxMp,
          hp: newHp,
          mp: newMp,
          statPoints: newStatPoints
        }
      };
    });
  }, [setGameState, addLog, onVisualEvent]);

  // ステータス割り振り
  const upgradeStat = useCallback((statKey: keyof GameState['player']['stats']) => {
    setGameState(prev => {
      const player = prev.player;
      
      if (player.statPoints <= 0) {
        return prev;
      }

      const newStats = { ...player.stats };
      newStats[statKey] = (newStats[statKey] || 0) + 1;
      
      // 副次効果の反映 (VITが上がればMaxHPも増やす等)
      let newMaxHp = player.maxHp;
      let newMaxMp = player.maxMp;
      
      if (statKey === 'vit') newMaxHp += 2; // VIT 1につきHP+2
      if (statKey === 'int') newMaxMp += 1; // INT 1につきMP+1

      return {
        ...prev,
        player: {
          ...player,
          stats: newStats,
          maxHp: newMaxHp,
          maxMp: newMaxMp,
          // 現在値も少し回復させるか、そのままにするか。今回はMaxのみ上昇
          statPoints: player.statPoints - 1
        }
      };
    });
  }, [setGameState]);

  return {
    gainExp,
    upgradeStat
  };
};
