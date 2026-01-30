import React, { useState } from 'react';
import { PlayerState } from '../types/gameState';
import { Item, Equipment, ItemStats } from '../types/item';
import { getSetById } from '../data/sets';
import { calculateItemValue } from '../utils/loot';

// Icons (Simple SVGs)
const SwordIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5"/><line x1="13" y1="19" x2="19" y2="13"/><line x1="16" y1="16" x2="20" y2="20"/><line x1="19" y1="21" x2="21" y2="19"/></svg>;
const ShieldIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
const PotionIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V5.5L14 2z"/><polyline points="14 2 14 8 20 8"/><path d="M12 18v-6"/></svg>;

interface Props {
  player: PlayerState;
  onClose: () => void;
  onUseItem: (item: Item) => void;
  onEquipItem: (item: Equipment) => void;
  onUnequipItem: (item: Equipment) => void;
  onDropItem: (item: Item) => void;
}

export const InventoryMenu: React.FC<Props> = ({ player, onClose, onUseItem, onEquipItem, onUnequipItem, onDropItem }) => {
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  // Helper to render stats safely
  const renderStat = (label: string, value?: number) => {
    if (!value) return null;
    return <div className="text-xs text-slate-300 flex justify-between"><span>{label}</span><span>{value > 0 ? '+' : ''}{value}</span></div>;
  };

  const getItemColor = (item: Item) => {
    switch(item.rarity) {
      case 'legendary': return 'text-orange-500 border-orange-500';
      case 'epic': return 'text-purple-500 border-purple-500';
      case 'rare': return 'text-blue-400 border-blue-400';
      case 'uncommon': return 'text-green-400 border-green-400';
      default: return 'text-slate-300 border-slate-600';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border-2 border-slate-600 rounded-lg w-full max-w-4xl h-[80vh] flex flex-col md:flex-row overflow-hidden shadow-2xl">
        
        {/* Left: Equipment & Inventory Grid */}
        <div className="flex-1 p-4 overflow-y-auto">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span className="text-yellow-500">Inventory</span>
            <span className="text-xs text-slate-500 font-normal">
              ({player.inventory.filter(i => i).length} / {player.maxInventorySize})
            </span>
          </h2>

          {/* Equipment Slots */}
          <div className="grid grid-cols-2 gap-4 mb-6 bg-slate-800/50 p-4 rounded">
            {['mainHand', 'offHand', 'armor', 'accessory'].map((slot) => {
               const item = player.equipment[slot as keyof typeof player.equipment];
               return (
                 <div key={slot} className="flex flex-col gap-1">
                    <span className="text-xs text-slate-400 uppercase">{slot}</span>
                    <div 
                      className={`h-16 border rounded flex items-center justify-center cursor-pointer transition-colors ${item ? getItemColor(item) : 'border-slate-700 bg-slate-800'}`}
                      onClick={() => item && setSelectedItem(item)}
                    >
                      {item ? (
                        <div className="text-center">
                           <div className="font-bold text-sm truncate px-1">{item.name}</div>
                        </div>
                      ) : (
                        <span className="text-slate-600 text-xs">Empty</span>
                      )}
                    </div>
                 </div>
               );
            })}
          </div>

          {/* Inventory Grid */}
          <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
            {player.inventory.map((item, i) => (
              <div 
                key={i}
                className={`aspect-square border rounded flex flex-col items-center justify-center cursor-pointer hover:bg-slate-800 transition-colors relative ${
                    item ? getItemColor(item) : 'border-slate-800 bg-slate-900/50'
                } ${selectedItem === item ? 'ring-2 ring-yellow-400 bg-slate-800' : ''}`}
                onClick={() => item && setSelectedItem(item)}
              >
                {item && (
                    <>
                        {item.type === 'weapon' && <SwordIcon />}
                        {item.type === 'armor' && <ShieldIcon />}
                        {item.type === 'potion' && <PotionIcon />}
                        <span className="text-[10px] text-center mt-1 truncate w-full px-1">{item.name}</span>
                        {item.quantity > 1 && (
                            <span className="absolute bottom-1 right-1 text-xs font-bold bg-black/60 px-1 rounded">{item.quantity}</span>
                        )}
                    </>
                )}
              </div>
            ))}
            {/* Fill empty slots */}
            {Array.from({ length: Math.max(0, player.maxInventorySize - player.inventory.length) }).map((_, i) => (
               <div key={`empty-${i}`} className="aspect-square border border-slate-800 bg-slate-900/30 rounded"></div>
            ))}
          </div>
        </div>

        {/* Right: Item Details */}
        <div className="w-full md:w-80 bg-slate-950 p-6 border-l border-slate-700 flex flex-col">
          {selectedItem ? (
            <>
              <div className={`text-lg font-bold mb-1 ${getItemColor(selectedItem).split(' ')[0]}`}>
                {selectedItem.name}
              </div>
              <div className="text-xs text-slate-500 mb-4 capitalize">
                {selectedItem.rarity} {selectedItem.type} - Tier {selectedItem.tier}
              </div>
              
              <div className="flex-1 overflow-y-auto space-y-4">
                <div className="text-sm text-slate-300 italic">
                  {selectedItem.description}
                </div>
                
                {/* Stats */}
                {selectedItem.stats && (
                    <div className="bg-slate-900 p-3 rounded border border-slate-800">
                        {renderStat('Attack', selectedItem.stats.attack)}
                        {renderStat('Defense', selectedItem.stats.defense)}
                        {renderStat('M.Attack', selectedItem.stats.magicAttack)}
                        {renderStat('M.Defense', selectedItem.stats.magicDefense)}
                        {renderStat('Speed', selectedItem.stats.speed)}
                        {renderStat('HP', selectedItem.stats.hp)}
                        {renderStat('STR', selectedItem.stats.str)}
                        {renderStat('VIT', selectedItem.stats.vit)}
                    </div>
                )}

                {/* Enchants */}
                {selectedItem.enchants && selectedItem.enchants.length > 0 && (
                    <div>
                        <div className="text-xs font-bold text-blue-400 mb-1">Enchants:</div>
                        {selectedItem.enchants.map((e, i) => (
                            <div key={i} className="text-xs text-blue-200 mb-1">• {e.description}</div>
                        ))}
                    </div>
                )}
                
                {/* Set Bonus */}
                {selectedItem.setId && (
                    <div className="text-xs text-green-400">
                        Set: {getSetById(selectedItem.setId)?.name || selectedItem.setId}
                    </div>
                )}

                <div className="text-right text-yellow-500 text-sm font-mono mt-2">
                    Value: {selectedItem.price} G
                </div>
              </div>

              {/* Actions */}
              <div className="mt-4 grid grid-cols-2 gap-2">
                {selectedItem.type === 'potion' && (
                    <button 
                        onClick={() => { onUseItem(selectedItem); setSelectedItem(null); }}
                        className="bg-green-700 hover:bg-green-600 text-white py-2 rounded font-bold"
                    >
                        Use
                    </button>
                )}
                {(selectedItem.type === 'weapon' || selectedItem.type === 'armor' || selectedItem.type === 'accessory') && (
                    (() => {
                        const isEquipped = Object.values(player.equipment).some(e => e?.id === selectedItem.id);
                        return isEquipped ? (
                            <button 
                                onClick={() => { onUnequipItem(selectedItem as Equipment); setSelectedItem(null); }}
                                className="bg-yellow-700 hover:bg-yellow-600 text-white py-2 rounded font-bold"
                            >
                                Unequip
                            </button>
                        ) : (
                            <button 
                                onClick={() => { onEquipItem(selectedItem as Equipment); setSelectedItem(null); }}
                                className="bg-blue-700 hover:bg-blue-600 text-white py-2 rounded font-bold"
                            >
                                Equip
                            </button>
                        );
                    })()
                )}
                <button 
                    onClick={() => { onDropItem(selectedItem); setSelectedItem(null); }}
                    className="bg-red-900/50 hover:bg-red-700 text-red-200 py-2 rounded border border-red-900"
                >
                    Drop
                </button>
              </div>

            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-600 italic">
              Select an item to view details
            </div>
          )}
          
          <button 
            onClick={onClose}
            className="mt-4 w-full bg-slate-800 hover:bg-slate-700 text-white py-3 rounded font-bold"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
