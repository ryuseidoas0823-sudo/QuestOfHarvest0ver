import React from 'react';
import { ShopItem, SHOP_ITEMS } from '../data/shopItems';

interface ShopMenuProps {
  playerGold: number;
  onBuy: (item: ShopItem) => void;
  onClose: () => void;
}

export const ShopMenu: React.FC<ShopMenuProps> = ({ playerGold, onBuy, onClose }) => {
  return (
    <div className="w-full h-full flex flex-col bg-slate-800 rounded-lg border-2 border-orange-600 overflow-hidden relative">
      <div className="bg-orange-900/50 p-4 border-b border-orange-700 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-orange-200">豊穣の市場</h2>
        <div className="text-yellow-400 font-mono text-xl">所持金: {playerGold} G</div>
      </div>

      <div className="flex-grow p-4 overflow-y-auto custom-scrollbar">
        <div className="grid grid-cols-1 gap-3">
          {SHOP_ITEMS.map((item) => (
            <div key={item.id} className="flex justify-between items-center bg-slate-900/80 p-3 rounded border border-slate-700 hover:border-orange-500 transition-colors">
              <div>
                <div className="font-bold text-slate-200">{item.name}</div>
                <div className="text-xs text-slate-400">{item.description}</div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-yellow-500 font-mono">{item.price} G</div>
                <button
                  onClick={() => onBuy(item)}
                  disabled={playerGold < item.price}
                  className={`px-4 py-1 rounded font-bold text-sm ${
                    playerGold >= item.price
                      ? 'bg-orange-600 hover:bg-orange-500 text-white shadow'
                      : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  購入
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="p-4 border-t border-slate-700 bg-slate-800">
        <button 
          onClick={onClose}
          className="w-full py-2 text-slate-400 hover:text-white underline transition-colors"
        >
          ← 街へ戻る
        </button>
      </div>
    </div>
  );
};
