import React from 'react';
import { ITEMS } from '../data/items';
// import { getAsset } from '../assets/assetRegistry'; // アセットレジストリがあれば使用
import { ItemDefinition } from '../types/item';
import { Equipment } from '../types'; // Equipment型をインポート

interface InventoryMenuProps {
  inventory: string[];
  equipment: Equipment; // 追加
  onClose: () => void;
  onUseItem: (itemId: string) => void;
}

const InventoryMenu: React.FC<InventoryMenuProps> = ({ inventory, equipment, onClose, onUseItem }) => {
  const inventoryCounts = inventory.reduce((acc, itemId) => {
    acc[itemId] = (acc[itemId] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // 装備品もリストに表示するためにユニークIDリストを作成（所持品 + 装備中のもの）
  // ※現在の仕様では装備するとインベントリから消えるロジックになっているため、
  //   装備中のアイテムも表示したい場合は別途リストアップする必要がある。
  //   ここでは「インベントリにあるもの」と「装備中のもの」をマージして表示する。
  
  const uniqueItemIds = Array.from(new Set([
      ...Object.keys(inventoryCounts),
      ...(equipment.mainHand ? [equipment.mainHand] : []),
      ...(equipment.armor ? [equipment.armor] : [])
  ]));

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
                if (!itemDef) return null;

                // 装備中かチェック
                const isEquippedMain = equipment.mainHand === itemId;
                const isEquippedArmor = equipment.armor === itemId;
                const isEquipped = isEquippedMain || isEquippedArmor;

                // 所持数 (装備中のものはインベントリにないので +1 して表示する調整が必要だが、今回は簡易表示)
                const count = inventoryCounts[itemId] || 0;
                const displayCount = isEquipped ? count + 1 : count; // 簡易的

                return (
                  <div 
                    key={itemId} 
                    className={`p-3 rounded-lg flex items-start gap-3 border transition-colors group ${
                        isEquipped ? 'bg-gray-700 border-yellow-500' : 'bg-gray-700 border-gray-600 hover:border-gray-400'
                    }`}
                  >
                    <div className="w-16 h-16 bg-gray-900 rounded border border-gray-600 flex items-center justify-center shrink-0 relative">
                      <span className="text-2xl font-bold text-gray-500">{itemDef.name[0]}</span>
                      {isEquipped && (
                          <div className="absolute -top-2 -right-2 bg-yellow-500 text-black text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full border-2 border-gray-800">
                              E
                          </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <h3 className={`font-bold truncate ${getRarityColor(itemDef.baseRarity)}`}>
                          {itemDef.name}
                        </h3>
                        {!isEquipped && count > 0 && (
                            <span className="bg-gray-800 text-gray-300 text-xs px-2 py-0.5 rounded-full ml-2">
                            x{count}
                            </span>
                        )}
                      </div>
                      
                      <p className="text-xs text-gray-400 mt-1 line-clamp-2 min-h-[2.5em]">
                        {itemDef.description}
                      </p>

                      <div className="mt-3 flex justify-end gap-2">
                        {/* 装備中のアイテムは「外す」ボタン等が望ましいが、今回は再選択で切り替えのためボタン非表示または無効化 */}
                        {isEquipped ? (
                            <span className="text-xs text-yellow-500 font-bold py-1.5 px-3">装備中</span>
                        ) : (
                            inventoryCounts[itemId] > 0 && (
                                <button
                                onClick={() => onUseItem(itemId)}
                                className="text-xs bg-gray-600 hover:bg-yellow-600 hover:text-black text-white px-3 py-1.5 rounded transition-colors"
                                >
                                {itemDef.type === 'consumable' ? '使う' : '装備'}
                                </button>
                            )
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        
        {/* ステータスサマリー (簡易) */}
        <div className="mt-4 pt-4 border-t border-gray-600 flex justify-between text-sm text-gray-400">
            <div>
                武器: {equipment.mainHand ? ITEMS[equipment.mainHand]?.name : 'なし'}
            </div>
            <div>
                防具: {equipment.armor ? ITEMS[equipment.armor]?.name : 'なし'}
            </div>
        </div>
      </div>
    </div>
  );
};

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
