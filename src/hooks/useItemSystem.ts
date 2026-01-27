import { useCallback } from 'react';
import { GameState, LogMessage } from '../types/gameState';
import { Item, InventoryItem, EquipmentSlot } from '../types/item';
import { applyItemEffect } from '../utils/itemEffect';
import { ITEMS } from '../data/items';
import { calculateTotalStats } from '../utils/stats'; // 追加

export const useItemSystem = (
  setGameState: React.Dispatch<React.SetStateAction<GameState>>,
  addLog: (message: string, type?: LogMessage['type']) => void
) => {

  /**
   * アイテムを使用または装備する
   */
  const useItem = useCallback((itemId: string) => {
    setGameState(prev => {
      const player = prev.player;
      const inventoryIndex = player.inventory.findIndex(inv => inv.item.id === itemId);
      
      if (inventoryIndex === -1) {
        addLog('アイテムを持っていない。', 'warning');
        return prev;
      }

      const inventoryItem = player.inventory[inventoryIndex];
      const item = inventoryItem.item;

      // --- 装備品の処理 ---
      if (item.type === 'weapon' || item.type === 'armor' || item.type === 'accessory') {
        const slot = item.equipmentStats?.slot;
        if (!slot) return prev;

        // 現在装備しているアイテムがあれば外してインベントリに戻す
        let newInventory = [...player.inventory];
        const currentEquippedId = player.equipment[slot];
        
        // 装備アイテムをインベントリから減らす
        if (inventoryItem.quantity > 1) {
            newInventory[inventoryIndex] = { ...inventoryItem, quantity: inventoryItem.quantity - 1 };
        } else {
            newInventory.splice(inventoryIndex, 1);
        }

        // 外した装備をインベントリに追加
        if (currentEquippedId) {
            const equippedItem = ITEMS[currentEquippedId];
            if (equippedItem) {
                const existingIdx = newInventory.findIndex(i => i.item.id === currentEquippedId);
                if (existingIdx !== -1) {
                    newInventory[existingIdx] = { ...newInventory[existingIdx], quantity: newInventory[existingIdx].quantity + 1 };
                } else {
                    newInventory.push({ item: equippedItem, quantity: 1 });
                }
                addLog(`${equippedItem.name}を外した。`, 'info');
            }
        }

        // 装備更新
        const newEquipment = { ...player.equipment, [slot]: item.id };
        
        // ステータス再計算（実際に適用するのはstatsプロパティ）
        // ※本来は baseStats と currentStats を分けるべきだが、
        // 今回は簡易的に「装備変更時に stats を再計算する」方式を取る。
        // ただしレベルアップ等で stats が永続上昇しているので、
        // 「現在の stats から旧装備分を引き、新装備分を足す」か
        // 「裸ステータスを別途保持する」必要がある。
        // 現状の PlayerState 構造だと裸ステータスがないため、
        // 簡易実装として「装備補正は戦闘時計算(calculateTotalStats)に任せ、
        // UI表示や戦闘ロジック側でその関数を通す」形が安全。
        // -> 今回は `calculateTotalStats` を戦闘ロジックで呼ぶ形にシフトする。
        // ここでは equipment 情報の更新のみ行う。

        addLog(`${item.name}を装備した！`, 'success');

        return {
            ...prev,
            player: {
                ...player,
                inventory: newInventory,
                equipment: newEquipment
            }
        };
      }

      // --- 消費アイテムの処理 ---
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

      // アイテム消費
      const newInventory = [...player.inventory];
      if (inventoryItem.quantity > 1) {
        newInventory[inventoryIndex] = {
          ...inventoryItem,
          quantity: inventoryItem.quantity - 1
        };
      } else {
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
   * 装備を外す
   */
  const unequipItem = useCallback((slot: EquipmentSlot) => {
    setGameState(prev => {
        const player = prev.player;
        const itemId = player.equipment[slot];
        if (!itemId) return prev;

        const item = ITEMS[itemId];
        if (!item) return prev;

        // インベントリに戻す
        const newInventory = [...player.inventory];
        const existingIdx = newInventory.findIndex(i => i.item.id === itemId);
        if (existingIdx !== -1) {
            newInventory[existingIdx] = { ...newInventory[existingIdx], quantity: newInventory[existingIdx].quantity + 1 };
        } else {
            newInventory.push({ item, quantity: 1 });
        }

        const newEquipment = { ...player.equipment };
        delete newEquipment[slot];

        addLog(`${item.name}を外した。`, 'info');

        return {
            ...prev,
            player: {
                ...player,
                inventory: newInventory,
                equipment: newEquipment
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
    unequipItem,
    obtainItem
  };
};
