import React from 'react';
import { PlayerEntity, Item } from '../types';
import { PERK_DEFINITIONS } from '../data';
import { GAME_CONFIG } from '../constants';

interface GameHUDProps {
  uiState: PlayerEntity;
  dungeonLevel: number;
  toggleMenu: (menu: 'inventory' | 'shop' | 'status') => void;
  activeShop: any;
}

export const GameHUD: React.FC<GameHUDProps> = ({ uiState, dungeonLevel, toggleMenu, activeShop }) => {
  return (
    <div className="absolute inset-0 pointer-events-none">
      <div className="absolute top-2 left-2 flex gap-4 p-2 bg-black/50 rounded pointer-events-auto text-white">
        <div className="flex flex-col">
          <div className="text-xl font-bold">{uiState.job} Lv.{uiState.level}</div>
          <div className="text-sm text-gray-300">Floor B{dungeonLevel}</div>
        </div>
        
        <div className="flex flex-col w-48 gap-1">
          <div className="relative h-4 bg-gray-700 rounded overflow-hidden">
            <div 
              className="absolute top-0 left-0 h-full bg-red-600 transition-all duration-300"
              style={{ width: `${(uiState.hp / uiState.calculatedStats.maxHp) * 100}%` }}
            />
            <span className="absolute inset-0 flex items-center justify-center text-xs font-bold shadow-black drop-shadow-md">
              HP {Math.floor(uiState.hp)}/{uiState.calculatedStats.maxHp}
            </span>
          </div>

          <div className="relative h-4 bg-gray-700 rounded overflow-hidden">
             <div 
               className="absolute top-0 left-0 h-full bg-blue-600 transition-all duration-300"
               style={{ width: `${(uiState.mp / uiState.calculatedStats.maxMp) * 100}%` }}
             />
             <span className="absolute inset-0 flex items-center justify-center text-xs font-bold shadow-black drop-shadow-md">
               MP {Math.floor(uiState.mp)}/{uiState.calculatedStats.maxMp}
             </span>
          </div>
        </div>
      </div>

      <div className="absolute bottom-4 right-4 flex gap-2 pointer-events-auto">
        <button onClick={() => toggleMenu('inventory')} className="px-4 py-2 bg-gray-800 text-white border border-gray-600 rounded hover:bg-gray-700">
          Inventory (I)
        </button>
        {activeShop && (
          <button onClick={() => toggleMenu('shop')} className="px-4 py-2 bg-yellow-800 text-white border border-yellow-600 rounded hover:bg-yellow-700">
            Shop
          </button>
        )}
      </div>

      {/* Debug Info */}
      <div className="absolute top-2 right-2 text-xs text-gray-500 font-mono">
         SPEED: {uiState.calculatedStats.speed.toFixed(1)} / TILE: {GAME_CONFIG.TILE_SIZE}
      </div>
    </div>
  );
};

interface InventoryMenuProps {
  uiState: PlayerEntity;
  onClose: () => void;
  onEquip: (item: Item) => void;
  onUnequip: (slot: string) => void;
}

export const InventoryMenu: React.FC<InventoryMenuProps> = ({ uiState, onClose, onEquip, onUnequip }) => {
  return (
    <div className="bg-gray-900 border-2 border-gray-600 p-6 rounded-lg shadow-xl w-[800px] max-h-[80vh] flex gap-6 pointer-events-auto text-white">
      {/* Equipment Slots */}
      <div className="w-1/3 flex flex-col gap-4">
        <h2 className="text-xl font-bold border-b border-gray-700 pb-2">Equipment</h2>
        {(['mainHand', 'offHand', 'helm', 'armor', 'boots'] as const).map(slot => (
          <div key={slot} className="flex items-center gap-2 bg-gray-800 p-2 rounded border border-gray-700">
            <div className="w-10 h-10 bg-black flex items-center justify-center text-2xl">
              {uiState.equipment[slot]?.icon || '🛡️'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold truncate">
                {uiState.equipment[slot]?.name || 'Empty'}
              </div>
              <div className="text-xs text-gray-400 capitalize">{slot}</div>
            </div>
            {uiState.equipment[slot] && (
              <button 
                onClick={() => onUnequip(slot)}
                className="text-xs px-2 py-1 bg-red-900 hover:bg-red-700 rounded"
              >
                Unequip
              </button>
            )}
          </div>
        ))}

        <div className="mt-4">
           <h3 className="font-bold text-gray-400 mb-2">Perks</h3>
           <div className="text-xs space-y-1">
             {uiState.perks.map(p => {
               const def = PERK_DEFINITIONS.find(d => d.id === p.id);
               return <div key={p.id} className="flex justify-between"><span>{def?.name || p.id}</span><span>Lv.{p.level}</span></div>
             })}
           </div>
        </div>
      </div>

      {/* Inventory Grid */}
      <div className="flex-1 flex flex-col">
        <div className="flex justify-between items-center mb-4 border-b border-gray-700 pb-2">
          <h2 className="text-xl font-bold">Inventory</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">✕ Close</button>
        </div>
        
        <div className="grid grid-cols-5 gap-2 overflow-y-auto pr-2 custom-scrollbar">
          {uiState.inventory.map((item, idx) => (
            <div 
              key={item.id + idx}
              onClick={() => onEquip(item)}
              className="aspect-square bg-gray-800 border border-gray-600 hover:border-white cursor-pointer rounded flex flex-col items-center justify-center relative group"
              style={{ borderColor: item.color }}
            >
              <span className="text-2xl">{item.icon}</span>
              <div className="absolute inset-0 bg-black/80 hidden group-hover:flex items-center justify-center text-xs text-center p-1">
                {item.name}
              </div>
            </div>
          ))}
          {Array(25 - uiState.inventory.length).fill(null).map((_, i) => (
             <div key={`empty-${i}`} className="aspect-square bg-black/20 border border-gray-800 rounded"/>
          ))}
        </div>
        
        <div className="mt-4 p-2 bg-gray-800 rounded text-sm">
           <div className="flex justify-between"><span>Gold:</span> <span className="text-yellow-400">{uiState.gold} G</span></div>
           <div className="flex justify-between"><span>ATK:</span> <span>{uiState.calculatedStats.attack}</span></div>
           <div className="flex justify-between"><span>DEF:</span> <span>{uiState.calculatedStats.defense}</span></div>
        </div>
      </div>
    </div>
  );
};

export const ShopMenu: React.FC = () => <div>Shop (Not Implemented)</div>;
