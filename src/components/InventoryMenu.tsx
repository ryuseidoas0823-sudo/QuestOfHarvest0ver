import React, { useState } from 'react';
import { items as itemData } from '../data/items';
import { ItemDefinition } from '../types/item';
import { PixelSprite } from './PixelSprite';

interface InventoryMenuProps {
  inventory: string[]; // 所持アイテムIDリスト
  equippedItems: { [key: string]: string | null }; // slot -> itemId
  onUseItem: (itemId: string) => void;
  onEquipItem: (itemId: string) => void;
  onClose: () => void;
}

export const InventoryMenu: React.FC<InventoryMenuProps> = ({
  inventory,
  equippedItems,
  onUseItem,
  onEquipItem,
  onClose
}) => {
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  // IDからアイテムデータを取得してカウントする
  const itemCounts: { [id: string]: number } = {};
  inventory.forEach(id => {
    itemCounts[id] = (itemCounts[id] || 0) + 1;
  });

  const uniqueItems = Array.from(new Set(inventory)).map(id => 
    itemData.find(d => d.id === id)
  ).filter((item): item is ItemDefinition => !!item);

  const selectedItem = uniqueItems.find(i => i.id === selectedItemId);

  // 装備中かどうかチェック
  const isEquipped = (itemId: string) => {
    return Object.values(equippedItems).includes(itemId);
  };

  return (
    <div className="flex flex-col h-full text-white">
      <div className="flex justify-between items-center mb-4 border-b border-gray-700 pb-2">
        <h2 className="text-2xl font-bold text-yellow-500">所持品</h2>
        <button onClick={onClose} className="px-3 py-1 bg-gray-700 rounded hover:bg-gray-600">閉じる</button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* 左側: アイテムリスト */}
        <div className="w-1/2 overflow-y-auto pr-2 border-r border-gray-700">
          {uniqueItems.length === 0 && <p className="text-gray-500 text-center mt-4">アイテムを持っていません</p>}
          
          <div className="grid grid-cols-1 gap-2">
            {uniqueItems.map(item => (
              <div 
                key={item.id}
                onClick={() => setSelectedItemId(item.id)}
                className={`flex items-center p-2 rounded cursor-pointer border ${
                  selectedItemId === item.id ? 'bg-blue-900 border-blue-500' : 'bg-gray-800 border-gray-700 hover:bg-gray-700'
                }`}
              >
                <div className="w-8 h-8 flex items-center justify-center bg-gray-900 rounded mr-3">
                  {/* アイコンがあればPixelSprite、なければ文字アイコン */}
                  {/* item.assetIcon は絵文字なのでそのまま表示 */}
                  <span className="text-xl">{item.assetIcon}</span>
                </div>
                <div className="flex-1">
                  <div className="font-bold text-sm">
                    {item.name}
                    {isEquipped(item.id) && <span className="ml-2 text-green-400 text-xs">[装備中]</span>}
                  </div>
                  <div className="text-xs text-gray-400">{item.type}</div>
                </div>
                <div className="font-mono text-yellow-400">x{itemCounts[item.id]}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 右側: 詳細 & アクション */}
        <div className="w-1/2 pl-4 flex flex-col">
          {selectedItem ? (
            <>
              <div className="flex items-center mb-4">
                <span className="text-4xl mr-4">{selectedItem.assetIcon}</span>
                <div>
                  <h3 className="text-xl font-bold">{selectedItem.name}</h3>
                  <span className="text-sm px-2 py-0.5 bg-gray-700 rounded text-gray-300">{selectedItem.type}</span>
                </div>
              </div>
              
              <div className="bg-gray-800 p-3 rounded mb-4 text-sm text-gray-300 min-h-[80px]">
                {selectedItem.description}
              </div>

              {/* ステータス補正表示 */}
              {selectedItem.equipStats && (
                <div className="mb-4 bg-gray-900 p-3 rounded">
                  <h4 className="text-xs font-bold text-gray-500 mb-2">装備効果</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {Object.entries(selectedItem.equipStats).map(([key, val]) => (
                      <div key={key} className="flex justify-between">
                        <span className="capitalize text-gray-400">{key}:</span>
                        <span className="text-green-400">+{val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* アクションボタン */}
              <div className="mt-auto space-y-2">
                {/* 装備品の場合 */}
                {(selectedItem.type === 'weapon' || selectedItem.type === 'armor' || selectedItem.type === 'accessory') && (
                  <button 
                    onClick={() => onEquipItem(selectedItem.id)}
                    className={`w-full py-2 rounded font-bold ${
                      isEquipped(selectedItem.id) 
                        ? 'bg-red-900 text-red-300 border border-red-700 hover:bg-red-800' 
                        : 'bg-green-700 text-white hover:bg-green-600'
                    }`}
                  >
                    {isEquipped(selectedItem.id) ? '装備を外す' : '装備する'}
                  </button>
                )}

                {/* 消費アイテムの場合 */}
                {selectedItem.type === 'consumable' && (
                  <button 
                    onClick={() => onUseItem(selectedItem.id)}
                    className="w-full py-2 bg-blue-600 text-white rounded font-bold hover:bg-blue-500"
                  >
                    使用する
                  </button>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-600">
              アイテムを選択してください
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
