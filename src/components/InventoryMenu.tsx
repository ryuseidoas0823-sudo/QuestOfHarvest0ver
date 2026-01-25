import React from 'react';
import { ItemDefinition } from '../types/item'; // エイリアスをインポート
import { items as itemData } from '../data/items';

interface InventoryMenuProps {
  inventory: string[];
  equippedItems: { [key: string]: string | null };
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
  // アイテムIDから詳細データを取得
  const getInventoryItems = () => {
    return inventory.map(id => itemData.find(i => i.id === id)).filter(Boolean) as ItemDefinition[];
  };

  const inventoryItems = getInventoryItems();

  const handleItemAction = (item: ItemDefinition) => {
    if (item.type === 'consumable') {
        onUseItem(item.id);
    } else {
        onEquipItem(item.id);
    }
  };

  return (
    <div className="w-full h-full flex items-center justify-center" onClick={onClose}>
      <div className="bg-gray-800 border-2 border-white p-6 rounded-lg w-full max-w-3xl h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4 border-b border-gray-600 pb-2">
            <h2 className="text-2xl font-bold text-white">Inventory</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
        </div>

        <div className="flex flex-1 gap-4 overflow-hidden">
            {/* 装備欄 */}
            <div className="w-1/3 bg-gray-900 p-4 rounded border border-gray-700">
                <h3 className="text-lg font-bold text-blue-300 mb-4">Equipped</h3>
                {['weapon', 'armor', 'accessory'].map(slot => {
                    const equippedId = equippedItems[slot];
                    const equippedItem = equippedId ? itemData.find(i => i.id === equippedId) : null;
                    return (
                        <div key={slot} className="mb-4">
                            <div className="text-xs text-gray-500 uppercase">{slot}</div>
                            <div className="text-white font-medium border-b border-gray-600 py-1 flex items-center h-10">
                                {equippedItem ? (
                                    <>
                                        {/* アイコンがあれば表示 */}
                                        <span className="mr-2 text-yellow-500">★</span>
                                        {equippedItem.name}
                                    </>
                                ) : (
                                    <span className="text-gray-600 italic">Empty</span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* アイテムリスト */}
            <div className="w-2/3 bg-gray-900 p-4 rounded border border-gray-700 overflow-y-auto">
                <h3 className="text-lg font-bold text-yellow-300 mb-4">Items ({inventoryItems.length})</h3>
                <div className="grid grid-cols-1 gap-2">
                    {inventoryItems.map((item, index) => {
                        const isEquipped = Object.values(equippedItems).includes(item.id);
                        return (
                            <div key={index} className="flex justify-between items-center bg-gray-800 p-2 rounded hover:bg-gray-700 cursor-pointer"
                                 onClick={() => handleItemAction(item)}>
                                <div className="flex items-center">
                                    <div className="w-8 h-8 bg-gray-700 mr-3 flex items-center justify-center rounded border border-gray-600">
                                        {item.type === 'weapon' && '⚔️'}
                                        {item.type === 'armor' && '🛡️'}
                                        {item.type === 'consumable' && '🧪'}
                                        {item.type === 'accessory' && '💍'}
                                        {item.type === 'material' && '📦'}
                                    </div>
                                    <div>
                                        <div className="font-bold text-white flex items-center">
                                            {item.name}
                                            {isEquipped && <span className="ml-2 text-xs bg-blue-900 text-blue-200 px-1 rounded">E</span>}
                                        </div>
                                        <div className="text-xs text-gray-400">{item.description}</div>
                                    </div>
                                </div>
                                <div className="text-xs text-gray-500">
                                    {item.type === 'consumable' ? 'Use' : 'Equip'}
                                </div>
                            </div>
                        );
                    })}
                    {inventoryItems.length === 0 && (
                        <div className="text-center text-gray-500 py-10">No items</div>
                    )}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};
