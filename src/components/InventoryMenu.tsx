import React, { useState } from 'react';
import { GameState } from '../types/gameState';
import { X, Backpack, Sparkles, Shield, Sword, Shirt, Gem } from 'lucide-react';
import { InventoryItem, ItemType, EquipmentSlot } from '../types/item';
import { ITEMS } from '../data/items';
import { getCombatStats, calculateTotalStats } from '../utils/stats'; // 追加

interface InventoryMenuProps {
  gameState: GameState;
  onClose: () => void;
  onUseItem: (itemId: string) => void;
  onUnequip?: (slot: EquipmentSlot) => void; // 追加
}

const InventoryMenu: React.FC<InventoryMenuProps> = ({ gameState, onClose, onUseItem, onUnequip }) => {
  const { inventory, equipment, gold, level } = gameState.player;
  const [filter, setFilter] = useState<ItemType | 'all'>('all');

  // 装備込みステータス（表示用）
  const totalStats = calculateTotalStats(gameState.player);
  const combatStats = getCombatStats(gameState.player);

  const filteredInventory = inventory.filter(inv => 
    filter === 'all' ? true : inv.item.type === filter
  );

  const EquipmentSlotIcon = ({ slot, icon: Icon, label }: { slot: EquipmentSlot, icon: any, label: string }) => {
    const equippedId = equipment[slot];
    const item = equippedId ? ITEMS[equippedId] : null;

    return (
      <div className="flex flex-col gap-1">
        <span className="text-xs text-slate-400 font-bold uppercase">{label}</span>
        <div className="relative group">
            <div 
                className={`h-16 w-full rounded-lg border-2 flex items-center justify-center relative overflow-hidden transition-colors ${
                    item ? 'bg-slate-800 border-slate-500' : 'bg-slate-900/50 border-slate-700 border-dashed'
                }`}
            >
                {item ? (
                    <>
                        <div className="text-3xl">{item.icon}</div>
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            {onUnequip && (
                                <button 
                                    onClick={() => onUnequip(slot)}
                                    className="text-xs bg-red-900/80 text-white px-2 py-1 rounded border border-red-500 hover:bg-red-700"
                                >
                                    外す
                                </button>
                            )}
                        </div>
                    </>
                ) : (
                    <Icon className="text-slate-600" size={24} />
                )}
            </div>
            {item && (
                <div className="absolute top-full left-0 mt-1 z-10 w-48 bg-black/90 border border-slate-600 p-2 rounded text-xs hidden group-hover:block pointer-events-none">
                    <p className="font-bold text-amber-400">{item.name}</p>
                    <p className="text-slate-300">{item.description}</p>
                    {item.equipmentStats?.attackPower && <p className="text-red-300">攻撃: {item.equipmentStats.attackPower}</p>}
                    {item.equipmentStats?.defense && <p className="text-blue-300">防御: {item.equipmentStats.defense}</p>}
                </div>
            )}
        </div>
      </div>
    );
  };

  return (
    <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-slate-900 w-full max-w-4xl rounded-xl border-2 border-slate-600 shadow-2xl flex flex-col h-[85vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700 bg-slate-800 rounded-t-xl">
          <div className="flex items-center gap-3">
            <Backpack className="text-amber-400" />
            <h2 className="text-xl font-bold text-white">装備・所持品</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-700 rounded-full transition-colors">
            <X className="text-slate-400 hover:text-white" />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
            {/* Left: Equipment & Stats */}
            <div className="w-1/3 bg-slate-800/30 border-r border-slate-700 p-4 overflow-y-auto">
                <div className="mb-6">
                    <h3 className="text-sm font-bold text-slate-300 mb-3 border-b border-slate-700 pb-1">装備 (Equipment)</h3>
                    <div className="grid grid-cols-2 gap-3">
                        <EquipmentSlotIcon slot="mainHand" icon={Sword} label="Main Hand" />
                        <EquipmentSlotIcon slot="offHand" icon={Shield} label="Off Hand" />
                        <EquipmentSlotIcon slot="body" icon={Shirt} label="Body Armor" />
                        <EquipmentSlotIcon slot="accessory" icon={Gem} label="Accessory" />
                    </div>
                </div>

                <div>
                    <h3 className="text-sm font-bold text-slate-300 mb-3 border-b border-slate-700 pb-1">ステータス (Lv.{level})</h3>
                    <div className="space-y-2 text-sm font-mono">
                        <div className="flex justify-between">
                            <span className="text-slate-400">攻撃力</span>
                            <span className="text-white font-bold">{combatStats.attack}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-400">防御力</span>
                            <span className="text-white font-bold">{combatStats.defense}</span>
                        </div>
                        <div className="h-px bg-slate-700 my-2" />
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                            <div className="flex justify-between"><span className="text-red-400">STR</span><span>{totalStats.str}</span></div>
                            <div className="flex justify-between"><span className="text-blue-400">VIT</span><span>{totalStats.vit}</span></div>
                            <div className="flex justify-between"><span className="text-green-400">DEX</span><span>{totalStats.dex}</span></div>
                            <div className="flex justify-between"><span className="text-cyan-400">AGI</span><span>{totalStats.agi}</span></div>
                            <div className="flex justify-between"><span className="text-purple-400">MAG</span><span>{totalStats.mag}</span></div>
                            <div className="flex justify-between"><span className="text-yellow-400">LUC</span><span>{totalStats.luc}</span></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right: Inventory List */}
            <div className="flex-1 flex flex-col bg-slate-900">
                {/* Filters */}
                <div className="flex gap-2 p-3 border-b border-slate-700 overflow-x-auto">
                    {(['all', 'consumable', 'weapon', 'armor', 'accessory'] as const).map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-3 py-1 rounded text-xs font-bold capitalize transition-colors ${
                                filter === f 
                                    ? 'bg-blue-600 text-white' 
                                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                            }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto p-4">
                    {filteredInventory.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-500">
                            <p>アイテムがありません</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-2">
                            {filteredInventory.map((invItem: InventoryItem) => (
                                <div 
                                    key={invItem.item.id}
                                    className="bg-slate-800/50 p-3 rounded-lg border border-slate-700 flex items-center justify-between group hover:border-slate-500 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded flex items-center justify-center text-2xl border ${
                                            invItem.item.rarity === 'rare' ? 'bg-blue-900/30 border-blue-800' :
                                            invItem.item.rarity === 'epic' ? 'bg-purple-900/30 border-purple-800' :
                                            'bg-slate-900 border-slate-700'
                                        }`}>
                                            {invItem.item.icon || '📦'}
                                        </div>
                                        <div>
                                            <div className="font-bold text-slate-200 flex items-center gap-2">
                                                {invItem.item.name}
                                                <span className="text-xs font-normal text-slate-400 bg-slate-700 px-1.5 rounded">
                                                    x{invItem.quantity}
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-400 line-clamp-1 w-64">
                                                {invItem.item.description}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <button
                                        onClick={() => onUseItem(invItem.item.id)}
                                        className={`px-4 py-1.5 rounded text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1 ${
                                            invItem.item.isConsumable 
                                                ? 'bg-blue-900/40 hover:bg-blue-600 text-blue-200 hover:text-white border border-blue-800 hover:border-blue-500'
                                                : 'bg-green-900/40 hover:bg-green-600 text-green-200 hover:text-white border border-green-800 hover:border-green-500'
                                        }`}
                                    >
                                        {invItem.item.isConsumable ? (
                                            <><Sparkles size={12} /> 使用</>
                                        ) : (
                                            <><Shield size={12} /> 装備</>
                                        )}
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-700 bg-slate-800 rounded-b-xl flex justify-between text-xs text-slate-400">
            <span>所持金: {gold} G</span>
            <span>重量: {inventory.length} / 50</span>
        </div>
      </div>
    </div>
  );
};

export default InventoryMenu;
