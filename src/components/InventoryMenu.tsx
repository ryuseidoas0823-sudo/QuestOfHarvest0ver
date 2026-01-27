import React from 'react';
import { GameState } from '../types/gameState';
import { X, Backpack, Sparkles } from 'lucide-react';
import { InventoryItem } from '../types/item';

interface InventoryMenuProps {
  gameState: GameState;
  onClose: () => void;
  onUseItem: (itemId: string) => void; // 追加
}

const InventoryMenu: React.FC<InventoryMenuProps> = ({ gameState, onClose, onUseItem }) => {
  const { inventory } = gameState.player;

  return (
    <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 w-full max-w-2xl rounded-xl border-2 border-slate-600 shadow-2xl flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700 bg-slate-800 rounded-t-xl">
          <div className="flex items-center gap-3">
            <Backpack className="text-amber-400" />
            <h2 className="text-xl font-bold text-white">アイテム一覧</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-slate-700 rounded-full transition-colors"
          >
            <X className="text-slate-400 hover:text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {inventory.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 py-12">
              <Backpack size={48} className="mb-4 opacity-50" />
              <p>アイテムを持っていません</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {inventory.map((invItem: InventoryItem) => (
                <div 
                  key={invItem.item.id}
                  className="bg-slate-800/50 p-3 rounded-lg border border-slate-700 flex items-start justify-between group hover:border-slate-500 transition-colors"
                >
                  <div className="flex gap-3">
                    <div className="w-10 h-10 bg-slate-900 rounded flex items-center justify-center text-2xl border border-slate-700">
                      {invItem.item.icon || '📦'}
                    </div>
                    <div>
                      <div className="font-bold text-slate-200 flex items-center gap-2">
                        {invItem.item.name}
                        <span className="text-xs font-normal text-slate-400 bg-slate-700 px-1.5 rounded">
                          x{invItem.quantity}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                        {invItem.item.description}
                      </p>
                    </div>
                  </div>
                  
                  {invItem.item.isConsumable && (
                    <button
                      onClick={() => onUseItem(invItem.item.id)}
                      className="ml-2 bg-blue-900/40 hover:bg-blue-600 text-blue-200 hover:text-white border border-blue-800 hover:border-blue-500 px-3 py-1.5 rounded text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1"
                    >
                      <Sparkles size={12} />
                      使用
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700 bg-slate-800 rounded-b-xl flex justify-between text-xs text-slate-400">
            <span>所持金: {gameState.player.gold} G</span>
            <span>アイテム数: {inventory.length}</span>
        </div>
      </div>
    </div>
  );
};

export default InventoryMenu;
