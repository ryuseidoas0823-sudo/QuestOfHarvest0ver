import { useState, useCallback } from 'react';
import { GameState, PlayerState } from '../types/gameState';
import { Item } from '../types/item';
import { SHOP_ITEMS } from '../data/shopItems';

export const useShop = (
  gameState: GameState,
  setGameState: React.Dispatch<React.SetStateAction<GameState>>,
  addLog: (text: string, type?: 'info' | 'success' | 'warning' | 'danger') => void
) => {
  const [activeTab, setActiveTab] = useState<'buy' | 'sell'>('buy');

  // 購入処理
  const buyItem = useCallback((item: Item) => {
    setGameState(prev => {
      const player = { ...prev.player };
      
      // 金額チェック
      if (player.gold < (item.value || 0)) {
        addLog("所持金が足りません！", 'warning');
        return prev;
      }

      // インベントリ空きチェック
      if (player.inventory.length >= player.maxInventorySize) {
        addLog("持ち物がいっぱいです！", 'warning');
        return prev;
      }

      // 購入実行
      player.gold -= (item.value || 0);
      
      // 新しいアイテムインスタンスを作成（IDをユニークにする）
      const newItem = { ...item, id: crypto.randomUUID() };
      player.inventory = [...player.inventory, newItem];

      addLog(`${item.name}を購入しました。(-${item.value} G)`, 'success');

      return {
        ...prev,
        player
      };
    });
  }, [setGameState, addLog]);

  // 売却処理
  const sellItem = useCallback((item: Item) => {
    setGameState(prev => {
      const player = { ...prev.player };
      const sellPrice = Math.floor((item.value || 0) / 2); // 売却価格は価値の半額

      // インベントリから削除
      const index = player.inventory.findIndex(i => i.id === item.id);
      if (index === -1) return prev;

      player.inventory.splice(index, 1);
      player.gold += sellPrice;

      addLog(`${item.name}を売却しました。(+${sellPrice} G)`, 'success');

      // 装備中のアイテムだった場合、装備を外す処理が必要ならここに追加
      // 現状はインベントリ画面での売却を想定

      return {
        ...prev,
        player
      };
    });
  }, [setGameState, addLog]);

  return {
    activeTab,
    setActiveTab,
    buyItem,
    sellItem,
    shopInventory: SHOP_ITEMS // 定義済みの商品リスト
  };
};
