import React from 'react';
import { PlayerState } from '../types';

interface InventoryMenuProps {
  player: PlayerState;
  onClose: () => void;
  onEquip: (item: any) => void;
  onUse: (item: any) => void;
}

const InventoryMenu: React.FC<InventoryMenuProps> = ({ player, onClose }) => {
  return (
    <div className="absolute inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-slate-900 border-2 border-slate-600 rounded-lg p-6 flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center mb-6 border-b border-slate-700 pb-2">
          <h3 className="text-2xl font-bold text-white">Inventory</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white px-3 py-1 bg-slate-800 rounded">
            CLOSE (Esc)
          </button>
        </div>

        <div className="flex flex-1 gap-6 overflow-hidden">
          {/* Equipment Slots */}
          <div className="w-1/3 space-y-4">
            <h4 className="text-yellow-500 font-bold mb-2">Equipment</h4>
            <div className="bg-slate-800 p-3 rounded">
              <div className="text-xs text-gray-500">WEAPON</div>
              <div className="text-white">{player.equipment.weapon?.name || 'No Weapon'}</div>
            </div>
            <div className="bg-slate-800 p-3 rounded">
              <div className="text-xs text-gray-500">ARMOR</div>
              <div className="text-white">{player.equipment.armor?.name || 'No Armor'}</div>
            </div>
            <div className="bg-slate-800 p-3 rounded">
              <div className="text-xs text-gray-500">ACCESSORY</div>
              <div className="text-white">{player.equipment.accessory?.name || 'No Accessory'}</div>
            </div>

            <div className="mt-8 bg-slate-800/50 p-4 rounded text-sm text-gray-300 space-y-1">
              <div className="flex justify-between"><span>STR:</span><span>{player.stats.str}</span></div>
              <div className="flex justify-between"><span>VIT:</span><span>{player.stats.vit}</span></div>
              {/* Stats定義拡張によりエラーは解消される */}
              <div className="flex justify-between text-red-300"><span>ATK:</span><span>{player.stats.attack || 0}</span></div>
              <div className="flex justify-between text-blue-300"><span>DEF:</span><span>{player.stats.defense || 0}</span></div>
            </div>
          </div>

          {/* Item List */}
          <div className="w-2/3 bg-slate-800 rounded p-4 overflow-y-auto">
             <h4 className="text-yellow-500 font-bold mb-2">Items ({player.inventory.length})</h4>
             {player.inventory.length === 0 ? (
               <div className="text-gray-500 text-center mt-10">No Items</div>
             ) : (
               <div className="space-y-2">
                 {player.inventory.map((item, idx) => (
                   <div key={idx} className="flex justify-between items-center bg-slate-700 p-2 rounded hover:bg-slate-600">
                     <span>{item.name}</span>
                     <button className="text-xs bg-blue-600 px-2 py-1 rounded text-white">Use</button>
                   </div>
                 ))}
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryMenu;
