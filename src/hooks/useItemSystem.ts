import { useCallback } from 'react';
import { GameState, LogMessage } from '../types/gameState';
import { Item, InventoryItem } from '../types/item';
import { applyItemEffect } from '../utils/itemEffect';
import { ITEMS } from '../data/items';

export const useItemSystem = (
  setGameState: React.Dispatch<React.SetStateAction<GameState>>,
  addLog: (message: string, type?: LogMessage['type']) => void
) => {

  /**
   * アイテムを使用する
   */
  const useItem = useCallback((itemId: string) => {
    setGameState(prev => {
      const player = prev.player;
      
      // インベントリからアイテムを探す
      const inventoryIndex = player.inventory.findIndex(inv => inv.item.id === itemId);
      
      if (inventoryIndex === -1) {
        addLog('アイテムを持っていない。', 'warning');
        return prev;
      }

      const inventoryItem = player.inventory[inventoryIndex];
      const item = inventoryItem.item;

      // 装備品などの場合（今回は消費アイテムのみ想定）
      if (!item.isConsumable) {
        addLog(`${item.name}は使用できない。`, 'info');
        return prev;
      }

      // 効果適用
      const result = applyItemEffect(player, item);

      if (!result.success) {
        addLog(result.message, 'warning');
        return prev;
      }

      addLog(`${item.name}を使用した。${result.message}`, 'success');

      // アイテム消費処理
      const newInventory = [...player.inventory];
      if (inventoryItem.quantity > 1) {
        newInventory[inventoryIndex] = {
          ...inventoryItem,
          quantity: inventoryItem.quantity - 1
        };
      } else {
        // 残り1個なら削除
        newInventory.splice(inventoryIndex, 1);
      }

      return {
        ...prev,
        player: {
          ...result.updatedPlayer,
          inventory: newInventory
        }
      };
    });
  }, [setGameState, addLog]);

  /**
   * アイテムを入手する
   */
  const obtainItem = useCallback((itemId: string, amount: number = 1) => {
    const itemData = ITEMS[itemId];
    if (!itemData) return;

    setGameState(prev => {
      const newInventory = [...prev.player.inventory];
      const existingIndex = newInventory.findIndex(inv => inv.item.id === itemId);

      if (existingIndex !== -1) {
        newInventory[existingIndex] = {
          ...newInventory[existingIndex],
          quantity: newInventory[existingIndex].quantity + amount
        };
      } else {
        newInventory.push({
          item: itemData,
          quantity: amount
        });
      }

      addLog(`${itemData.name}を${amount}個手に入れた！`, 'success');

      return {
        ...prev,
        player: {
          ...prev.player,
          inventory: newInventory
        }
      };
    });
  }, [setGameState, addLog]);

  return {
    useItem,
    obtainItem
  };
};
