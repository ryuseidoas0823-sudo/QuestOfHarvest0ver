import { useCallback } from 'react';
import { GameState, Position } from '../types/gameState';
import { TILE_SIZE } from '../config';
import { LogManager } from './useGameCore';
import { EnemyInstance } from '../types/enemy';
// アイテム生成用
import { generateLoot } from '../utils/lootGenerator';
import { Item } from '../types/item';
import { VisualEventType } from './useTurnSystem';

export const useDungeon = (
  gameState: GameState,
  setGameState: React.Dispatch<React.SetStateAction<GameState>>,
  addLog: LogManager['addLog'],
  onPlayerAttack: (enemy: EnemyInstance) => void,
  addItem: (item: Item) => void, // インベントリへの追加用
  onVisualEvent: (type: VisualEventType, pos: Position, value?: string | number, color?: string) => void
) => {
  
  // 移動処理
  const handleMove = useCallback((x: number, y: number) => {
    // 範囲外チェック
    if (x < 0 || x >= gameState.dungeon.width || y < 0 || y >= gameState.dungeon.height) {
      return false;
    }

    const targetCell = gameState.dungeon.grid[y][x];

    // 壁チェック
    if (targetCell.type === 'wall') {
      addLog('壁がある。', 'warning');
      return false;
    }

    // 敵チェック
    const enemy = gameState.enemies.find(e => e.position.x === x && e.position.y === y);
    if (enemy) {
      // 敵がいる場合は攻撃
      onPlayerAttack(enemy);
      return true; // 行動消費あり
    }

    // --- 宝箱チェック (新規追加) ---
    if (targetCell.type === 'chest') {
        // アイテム生成 (階層レベルを渡す想定だが、今は1固定)
        const loot = generateLoot(1);
        addItem(loot);
        
        // 演出
        onVisualEvent('effect', {x, y}, undefined, '#FFD700'); // 金色のエフェクト
        onVisualEvent('text', {x, y}, 'GET!', '#FFD700');

        // 宝箱を開けたので床にする
        // (本来は 'chest_open' などのタイプにして画像を変えるのが良いが、まずは床にして消す)
        setGameState(prev => {
            const newGrid = [...prev.dungeon.grid];
            newGrid[y] = [...newGrid[y]];
            newGrid[y][x] = { ...newGrid[y][x], type: 'floor' };
            
            return {
                ...prev,
                dungeon: {
                    ...prev.dungeon,
                    grid: newGrid
                }
            };
        });
        
        return true; // 行動消費あり（宝箱を開ける時間）
    }

    // 移動実行
    setGameState(prev => ({
      ...prev,
      player: {
        ...prev.player,
        position: { x, y }
      }
    }));
    
    // 視界更新などはsetGameState内で別途行うか、useEffectで検知して行う設計が望ましいが、
    // 既存実装に合わせて座標更新のみとする（GameLogic側で視界更新されている前提）

    return true; // 行動成功
  }, [gameState, setGameState, addLog, onPlayerAttack, addItem, onVisualEvent]);

  return {
    handleMove
  };
};
