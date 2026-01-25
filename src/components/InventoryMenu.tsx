import React, { useState } from 'react';
import { ItemDefinition } from '../types/item';
import { items as itemData } from '../data/items';
import { Stats } from '../types';

interface InventoryMenuProps {
  inventory: string[];
  equippedItems: { [key: string]: string | null };
  playerStats: Stats; // 現在のプレイヤー基本ステータス（装備込みだと計算が重複するので、Base+GodBonusの状態が望ましいが、App側でFinalStatsを渡している場合は差分計算に注意）
  onUseItem: (itemId: string) => void;
  onEquipItem: (itemId: string) => void;
  onClose: () => void;
}

export const InventoryMenu: React.FC<InventoryMenuProps> = ({
  inventory,
  equippedItems,
  playerStats,
  onUseItem,
  onEquipItem,
  onClose
}) => {
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  // インベントリリストの構築
  const inventoryList = inventory.map((id, index) => {
    const item = itemData.find(i => i.id === id);
    return { item, originalIndex: index }; // 元のインデックスを保持
  }).filter(entry => entry.item) as { item: ItemDefinition, originalIndex: number }[];

  const selectedItem = selectedItemId 
    ? itemData.find(i => i.id === selectedItemId) 
    : null;

  // 装備中アイテムの取得
  const getEquippedItem = (slot: string) => {
    const id = equippedItems[slot];
    return id ? itemData.find(i => i.id === id) : null;
  };

  // ステータス比較の計算
  const calculateStatDiff = (statName: keyof Stats) => {
    if (!selectedItem || !selectedItem.equipStats || selectedItem.type === 'consumable' || selectedItem.type === 'material') return null;
    
    // 現在の装備の補正値
    const currentEquip = getEquippedItem(selectedItem.type);
    const currentVal = currentEquip?.equipStats?.[statName] || 0;
    
    // 選択中アイテムの補正値
    const newVal = selectedItem.equipStats[statName] || 0;
    
    const diff = newVal - currentVal;
    if (diff === 0) return null;
    
    return diff > 0 ? `+${diff}` : `${diff}`;
  };

  const renderStatDiff = (statName: keyof Stats, label: string) => {
    const diff = calculateStatDiff(statName);
    if (!diff) return null;
    const isPositive = diff.startsWith('+');
    return (
      <div className="flex justify-between text-sm">
        <span className="text-gray-400">{label}</span>
        <span className={isPositive ? 'text-green-400' : 'text-red-400'}>
          {diff}
        </span>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4" onClick={onClose}>
      <div className="w-full max-w-5xl h-[85vh] bg-slate-900 border border-slate-600 rounded-lg shadow-2xl flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-slate-700 bg-slate-800">
          <h2 className="text-2xl font-bold text-yellow-500 tracking-wider">EQUIPMENT & INVENTORY</h2>
          <div className="flex gap-4">
            <div className="text-right">
              <div className="text-xs text-gray-400">GOLD</div>
              <div className="text-yellow-400 font-mono text-lg">--- G</div>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl font-bold px-2">
              ✕
            </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          
          {/* Left: Equipment Slots & Current Stats */}
          <div className="w-1/3 bg-slate-900 p-6 border-r border-slate-700 flex flex-col gap-6">
            
            {/* Character Info */}
            <div className="flex items-center gap-4 mb-2">
              <div className="w-16 h-16 bg-slate-800 rounded-full border-2 border-yellow-600 overflow-hidden">
                {/* プレイヤーアイコンがあれば表示 */}
                <div className="w-full h-full flex items-center justify-center text-2xl">👤</div>
              </div>
              <div>
                <div className="text-xl font-bold text-white">Player</div>
                <div className="text-sm text-gray-400">Lv.{playerStats.level}</div>
              </div>
            </div>

            {/* Stats Panel */}
            <div className="bg-slate-800/50 p-4 rounded border border-slate-700 space-y-2">
              <h3 className="text-xs font-bold text-gray-500 mb-2 uppercase">Current Stats</h3>
              <div className="grid grid-cols-2 gap-y-1 text-sm">
                <div className="flex justify-between pr-2"><span>ATK</span><span className="text-white">{playerStats.attack}</span></div>
                <div className="flex justify-between pl-2 border-l border-slate-700"><span>STR</span><span className="text-white">{playerStats.str}</span></div>
                <div className="flex justify-between pr-2"><span>DEF</span><span className="text-white">{playerStats.defense}</span></div>
                <div className="flex justify-between pl-2 border-l border-slate-700"><span>VIT</span><span className="text-white">{playerStats.vit}</span></div>
                <div className="flex justify-between pr-2"><span>HP</span><span className="text-white">{playerStats.maxHp}</span></div>
                <div className="flex justify-between pl-2 border-l border-slate-700"><span>AGI</span><span className="text-white">{playerStats.agi}</span></div>
              </div>
            </div>

            {/* Equipment Slots */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-gray-500 uppercase">Equipment</h3>
              {['weapon', 'armor', 'accessory'].map(slot => {
                const item = getEquippedItem(slot);
                return (
                  <div key={slot} className="relative group">
                    <div className="absolute -top-2 left-2 px-1 bg-slate-900 text-xs text-blue-400 uppercase">{slot}</div>
                    <div 
                      className={`h-16 border rounded flex items-center px-3 cursor-pointer transition-colors ${item ? 'border-slate-500 bg-slate-800 hover:border-yellow-500' : 'border-slate-700 bg-slate-900/50 border-dashed'}`}
                      onClick={() => item && onEquipItem(item.id)}
                    >
                      {item ? (
                        <>
                          <div className="text-2xl mr-3">{slot === 'weapon' ? '⚔️' : slot === 'armor' ? '🛡️' : '💍'}</div>
                          <div className="flex-1">
                            <div className="font-bold text-white text-sm">{item.name}</div>
                            <div className="text-xs text-gray-400 truncate">{item.description}</div>
                          </div>
                        </>
                      ) : (
                        <div className="text-gray-600 text-sm italic w-full text-center">Empty Slot</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Center: Inventory List */}
          <div className="w-1/3 bg-slate-800/30 p-4 border-r border-slate-700 flex flex-col">
            <h3 className="text-sm font-bold text-gray-400 mb-4 uppercase flex justify-between">
              <span>Backpack</span>
              <span>{inventory.length} / 30</span>
            </h3>
            
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-1">
              {inventoryList.map((entry, idx) => {
                const isSelected = selectedItemId === entry.item.id;
                const isEquipped = Object.values(equippedItems).includes(entry.item.id);
                return (
                  <div 
                    key={`${entry.item.id}-${idx}`}
                    onClick={() => setSelectedItemId(entry.item.id)}
                    className={`
                      flex items-center p-2 rounded cursor-pointer border transition-all
                      ${isSelected ? 'bg-indigo-900/50 border-indigo-500' : 'bg-slate-800 border-slate-700 hover:border-slate-500'}
                    `}
                  >
                    <div className="w-8 h-8 bg-slate-900 rounded flex items-center justify-center text-lg mr-3 border border-slate-700">
                      {entry.item.type === 'weapon' && '⚔️'}
                      {entry.item.type === 'armor' && '🛡️'}
                      {entry.item.type === 'consumable' && '🧪'}
                      {entry.item.type === 'accessory' && '💍'}
                      {entry.item.type === 'material' && '📦'}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm text-white font-medium flex items-center justify-between">
                        {entry.item.name}
                        {isEquipped && <span className="text-[10px] bg-blue-600 text-white px-1 rounded">E</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
              {inventory.length === 0 && (
                <div className="text-center text-gray-500 mt-10">No Items</div>
              )}
            </div>
          </div>

          {/* Right: Item Details & Actions */}
          <div className="w-1/3 bg-slate-900 p-6 flex flex-col">
            {selectedItem ? (
              <div className="flex-1 flex flex-col animate-fade-in">
                {/* Item Header */}
                <div className="border-b border-slate-700 pb-4 mb-4">
                  <div className="text-xs text-yellow-500 uppercase mb-1">{selectedItem.type}</div>
                  <h2 className="text-2xl font-bold text-white mb-2">{selectedItem.name}</h2>
                  <div className="flex gap-2">
                    <span className="text-xs bg-slate-800 px-2 py-1 rounded text-gray-300">
                      Rarity: {selectedItem.rarity || 'Common'}
                    </span>
                    <span className="text-xs bg-slate-800 px-2 py-1 rounded text-gray-300">
                      Price: {selectedItem.price} G
                    </span>
                  </div>
                </div>

                {/* Description */}
                <div className="text-gray-300 text-sm leading-relaxed mb-6 bg-slate-800 p-3 rounded italic">
                  "{selectedItem.description}"
                </div>

                {/* Stat Comparison */}
                {selectedItem.type !== 'consumable' && selectedItem.type !== 'material' && (
                  <div className="bg-slate-800/50 p-4 rounded mb-6 border border-slate-700">
                    <h3 className="text-xs font-bold text-gray-500 mb-3 uppercase">Stat Changes</h3>
                    <div className="space-y-2">
                      {/* 装備時の変動のみを表示 */}
                      {selectedItem.equipStats && (
                        <>
                          {renderStatDiff('attack', 'Attack Power')}
                          {renderStatDiff('defense', 'Defense')}
                          {renderStatDiff('str', 'Strength')}
                          {renderStatDiff('vit', 'Vitality')}
                          {renderStatDiff('dex', 'Dexterity')}
                          {renderStatDiff('agi', 'Agility')}
                          {renderStatDiff('int', 'Intelligence')}
                          {renderStatDiff('maxHp', 'Max HP')}
                        </>
                      )}
                      {!Object.keys(selectedItem.equipStats || {}).length && (
                        <div className="text-gray-500 text-xs">No stat changes</div>
                      )}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="mt-auto pt-4 border-t border-slate-700">
                  {selectedItem.type === 'consumable' ? (
                    <button
                      onClick={() => onUseItem(selectedItem.id)}
                      className="w-full py-3 bg-green-700 hover:bg-green-600 text-white font-bold rounded shadow transition-colors"
                    >
                      USE ITEM
                    </button>
                  ) : (
                    <button
                      onClick={() => onEquipItem(selectedItem.id)}
                      className="w-full py-3 bg-blue-700 hover:bg-blue-600 text-white font-bold rounded shadow transition-colors"
                    >
                      {Object.values(equippedItems).includes(selectedItem.id) ? 'UNEQUIP' : 'EQUIP'}
                    </button>
                  )}
                </div>

              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-600 italic">
                Select an item to view details
              </div>
            )}
          </div>

        </div>
        
        {/* Footer Hints */}
        <div className="bg-slate-950 p-2 text-xs text-center text-gray-500 border-t border-slate-800">
          [I] Close Menu • [↑↓] Navigate • [Enter] Select
        </div>
      </div>
    </div>
  );
};
