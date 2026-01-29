import { useCallback } from 'react';
import { GameState, Position } from '../types/gameState';
import { LogManager } from './useGameCore';
import { VisualEventType } from './useTurnSystem';
// レベル計算用ユーティリティ（既存ファイルにある想定、なければ簡易計算）
import { calculateNextLevelExp } from '../utils/level';

export const usePlayer = (
  gameState: GameState,
  setGameState: React.Dispatch<React.SetStateAction<GameState>>,
  addLog: LogManager['addLog'],
  onVisualEvent: (type: VisualEventType, pos: Position, value?: string | number, color?: string) => void
) => {

  const gainExp = useCallback((amount: number) => {
    setGameState(prev => {
      const player = prev.player;
      let newExp = player.exp + amount;
      let newLevel = player.level;
      let newMaxHp = player.maxHp;
      let newMaxMp = player.maxMp;
      let newHp = player.hp;
      let newMp = player.mp;
      let newStats = { ...player.stats };

      // 次のレベルまでの必要経験値（簡易式: level * 100）
      // 本来は src/utils/level.ts のロジックを使用
      let nextLevelExp = calculateNextLevelExp(newLevel);

      let leveledUp = false;

      // レベルアップ判定（複数レベルアップ対応）
      while (newExp >= nextLevelExp) {
        newExp -= nextLevelExp;
        newLevel++;
        leveledUp = true;
        nextLevelExp = calculateNextLevelExp(newLevel);

        // ステータス上昇（簡易実装）
        // 実際にはジョブごとの成長率などを参照
        newMaxHp += 10;
        newMaxMp += 5;
        newStats.str += 1;
        newStats.vit += 1;
        newStats.dex += 1;
        newStats.agi += 1;
        newStats.int += 1;
      }

      if (leveledUp) {
        // レベルアップ時は全回復
        newHp = newMaxHp;
        newMp = newMaxMp;

        // ログと演出
        addLog(`レベルが ${newLevel} に上がった！`, 'success');
        // 遅延させてログを出すと読みやすい
        setTimeout(() => addLog('最大HPとMPが上昇し、全回復した。'), 100);

        onVisualEvent('text', player.position, 'LEVEL UP!', '#FFD700'); // 金色テキスト
        onVisualEvent('heal', player.position); // 回復エフェクトを流用して祝福演出
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
          stats: newStats
        }
      };
    });
  }, [setGameState, addLog, onVisualEvent]);

  return {
    gainExp
  };
};
