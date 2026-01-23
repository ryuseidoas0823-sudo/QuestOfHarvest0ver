import React from 'react';
import { ITEMS } from '../data/items';
import { getAsset } from '../assets/assetRegistry';
import { ItemDefinition } from '../types/item';

interface InventoryMenuProps {
  // プレイヤーの所持品（アイテムIDの配列、またはインスタンス）
  // 現段階ではIDのリストとして扱います。拡張後はItemInstance[]になります。
  inventory: string[]; 
  onClose: () => void;
  onUseItem: (itemId: string) => void;
}

const InventoryMenu: React.FC<InventoryMenuProps> = ({ inventory, onClose, onUseItem }) => {
  // インベントリ内のアイテムIDをカウントしてスタック数を表示するための集計
  const inventoryCounts = inventory.reduce((acc, itemId) => {
    acc[itemId] = (acc[itemId] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // ユニークなアイテムIDのリスト
  const uniqueItemIds = Object.keys(inventoryCounts);

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-black bg-opacity-75">
      <div className="bg-gray-800 border-2 border-yellow-600 rounded-lg p-6 w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl">
        <div className="flex justify-between items-center mb-6 border-b border-gray-600 pb-4">
          <h2 className="text-3xl text-yellow-500 font-bold tracking-wider">INVENTORY</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors text-xl font-bold px-3 py-1 rounded hover:bg-gray-700"
          >
            ✕ CLOSE
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pr-2">
          {uniqueItemIds.length === 0 ? (
            <div className="text-center text-gray-500 py-10 text-xl">
              アイテムを持っていません
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {uniqueItemIds.map((itemId) => {
                const itemDef = ITEMS[itemId];
                
                // 定義が存在しないアイテムIDのエラーハンドリング
                if (!itemDef) {
                  return (
                    <div key={itemId} className="bg-red-900/30 p-4 rounded border border-red-800 text-red-400">
                      Unknown Item: {itemId}
                    </div>
                  );
                }

                const count = inventoryCounts[itemId];
                // アイコンアセットの取得（未設定時はデフォルトアイコン）
                const ItemIcon = getAsset(itemDef.assetIcon); 

                return (
                  <div 
                    key={itemId} 
                    className="bg-gray-700 p-3 rounded-lg flex items-start gap-3 border border-gray-600 hover:border-yellow-500 transition-colors group"
                  >
                    {/* アイコン表示エリア */}
                    <div className="w-16 h-16 bg-gray-900 rounded border border-gray-600 flex items-center justify-center shrink-0">
                      {ItemIcon ? (
                        // アセットがコンポーネントの場合
                        // <ItemIcon className="w-10 h-10 text-gray-300" />
                        <span className="text-xs text-gray-500">IMG</span>
                      ) : (
                         // 仮のアイコン（頭文字）
                        <span className="text-2xl font-bold text-gray-500">{itemDef.name[0]}</span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <h3 className={`font-bold truncate ${getRarityColor(itemDef.baseRarity)}`}>
                          {itemDef.name}
                        </h3>
                        <span className="bg-gray-800 text-gray-300 text-xs px-2 py-0.5 rounded-full ml-2">
                          x{count}
                        </span>
                      </div>
                      
                      <p className="text-xs text-gray-400 mt-1 line-clamp-2 min-h-[2.5em]">
                        {itemDef.description}
                      </p>

                      <div className="mt-3 flex justify-end">
                        <button
                          onClick={() => onUseItem(itemId)}
                          className="text-xs bg-gray-600 hover:bg-yellow-600 hover:text-black text-white px-3 py-1.5 rounded transition-colors"
                        >
                          {itemDef.type === 'consumable' ? '使う' : '装備'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="mt-6 pt-4 border-t border-gray-600 text-right text-gray-500 text-sm">
          所持数: {inventory.length} / 20
        </div>
      </div>
    </div>
  );
};

// レアリティに応じた文字色クラスを返すヘルパー
const getRarityColor = (rarity: string) => {
  switch (rarity) {
    case 'legendary': return 'text-orange-400';
    case 'epic': return 'text-purple-400';
    case 'rare': return 'text-blue-400';
    case 'uncommon': return 'text-green-400';
    default: return 'text-gray-200';
  }
};

export default InventoryMenu;
