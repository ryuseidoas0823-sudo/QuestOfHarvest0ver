import React from 'react';
import { PlayerState } from '../types';
import { items as itemData } from '../data/items';

interface InventoryMenuProps {
  // App.tsxからは playerState.inventory (string[]) が渡されることを想定
  // しかし、App.tsxの実装を見ると items={playerState.inventory} としているため、
  // ここでは items プロパティとして受け取るのが正しい
  items: string[]; 
  onClose: () => void;
  onUse: (index: number) => void;
  // 以下は今回使わないがインターフェースとして残すならオプショナルに
  player?: PlayerState; 
  onEquip?: (item: any) => void;
}

const InventoryMenu: React.FC<InventoryMenuProps> = ({ items, onClose, onUse }) => {
  return (
    <div className="absolute inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-neutral-900 border-2 border-neutral-600 rounded-lg p-6 flex flex-col max-h-[80vh]">
        <div className="flex justify-between items-center mb-6 border-b border-neutral-700 pb-2">
          <h3 className="text-2xl font-bold text-yellow-500">持ち物</h3>
          <button onClick={onClose} className="text-neutral-400 hover:text-white px-3 py-1 bg-neutral-800 rounded">
            閉じる
          </button>
        </div>

        <div className="flex-1 overflow-y-auto bg-neutral-800/50 rounded p-4">
             {items.length === 0 ? (
               <div className="text-neutral-500 text-center mt-10">アイテムを持っていません</div>
             ) : (
               <div className="flex flex-col gap-2">
                 {items.map((itemId, idx) => {
                   const item = itemData[itemId];
                   if (!item) return null;
                   
                   return (
                     <div key={idx} className="flex justify-between items-center bg-neutral-700 p-3 rounded hover:bg-neutral-600 transition-colors">
                       <div className="flex flex-col">
                         <span className="font-bold">{item.name}</span>
                         <span className="text-xs text-neutral-300">{item.description}</span>
                       </div>
                       
                       {item.type === 'consumable' && (
                         <button 
                           onClick={() => onUse(idx)}
                           className="text-xs bg-blue-600 hover:bg-blue-500 px-3 py-1.5 rounded text-white font-bold shadow-sm"
                         >
                           使う
                         </button>
                       )}
                     </div>
                   );
                 })}
               </div>
             )}
        </div>
      </div>
    </div>
  );
};

export default InventoryMenu;
