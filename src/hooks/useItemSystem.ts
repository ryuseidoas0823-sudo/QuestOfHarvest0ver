import { useState } from 'react';
import { GameState, Position } from '../types/gameState';
import { Item, Equipment } from '../types/item';
import { LogManager } from './useGameCore';
import { calculateHealAmount } from '../utils/potion';
// useTurnSystemから型を借用（本来はtypesへ移動推奨）
import { VisualEventType } from './useTurnSystem';

export const useItemSystem = (
  gameState: GameState,
  setGameState: React.Dispatch<React.SetStateAction<GameState>>,
  addLog: LogManager['addLog'],
  onVisualEvent: (type: VisualEventType, pos: Position, value?: string | number, color?: string) => void
) => {
  const [inventory, setInventory] = useState<Item[]>([]);

  // アイテム追加
  const addItem = (item: Item) => {
    setInventory(prev => [...prev, item]);
    addLog(`${item.name}を手に入れた。`);
  };

  // アイテム削除
  const removeItem = (itemId: string) => {
    setInventory(prev => prev.filter(item => item.id !== itemId));
  };

  // 装備変更
  const equipItem = (item: Equipment) => {
    // 簡易実装: 装備ロジックは別途拡張が必要だが、今回はアイテム使用にフォーカス
    addLog(`${item.name}を装備した。（未実装: ステータス反映）`);
  };

  // アイテム使用
  const useItem = (item: Item) => {
    if (item.type === 'potion') {
      const player = gameState.player;
      
      // HPが満タンなら使えない
      if (player.hp >= player.maxHp) {
        addLog('HPは既に満タンだ。', 'warning');
        return;
      }

      // 回復量計算
      // effectValueがない場合は固定値として扱う簡易フォールバック
      const baseAmount = item.effectValue || 30;
      // 実際にはVITやアイテムの質などで変動させてもよい
      const healAmount = Math.min(baseAmount, player.maxHp - player.hp);

      // 状態更新
      setGameState(prev => ({
        ...prev,
        player: {
          ...prev.player,
          hp: prev.player.hp + healAmount
        }
      }));

      // ログと演出
      addLog(`${item.name}を使った。HPが${healAmount}回復した！`, 'success');
      
      // 視覚効果: 回復エフェクトと数値
      onVisualEvent('heal', player.position); 
      // 数値ポップアップ (色は緑)
      onVisualEvent('text', player.position, `+${healAmount}`, '#44ff44');

      // 消費
      removeItem(item.id);
    } else {
      addLog(`${item.name}は使えない。`);
    }
  };

  return {
    inventory,
    addItem,
    removeItem,
    equipItem,
    useItem
  };
};
