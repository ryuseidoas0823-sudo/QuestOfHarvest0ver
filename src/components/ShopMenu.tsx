import React, { useState } from 'react';
import { items as itemData } from '../data/items';
import { shopItems } from '../data/shopItems';
import { PlayerState } from '../types';

interface ShopMenuProps {
  playerState: PlayerState;
  onClose: () => void;
  onBuy: (itemId: string) => boolean;
  onSell: (index: number) => void;
}

const ShopMenu: React.FC<ShopMenuProps> = ({ playerState, onClose, onBuy, onSell }) => {
  const [mode, setMode] = useState<'buy' | 'sell'>('buy');
  const [message, setMessage] = useState('いらっしゃい！何にするんだい？');

  const handleBuy = (itemId: string) => {
    const success = onBuy(itemId);
    if (success) {
      setMessage('まいどあり！');
    } else {
      setMessage('金が足りないみたいだな。');
    }
  };

  const handleSell = (index: number) => {
    onSell(index);
    setMessage('買い取らせてもらうよ。');
  };

  return (
    <div className="flex flex-col w-full h-full max-w-2xl bg-neutral-900 border-2 border-yellow-700 rounded-lg shadow-2xl p-6 text-white font-sans">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-neutral-700 pb-4 mb-4">
        <h2 className="text-2xl font-bold text-yellow-500">道具屋</h2>
        <div className="flex gap-4">
          <div className="text-xl">所持金: <span className="text-yellow-400">{playerState.gold} G</span></div>
          <button onClick={onClose} className="px-3 py-1 bg-neutral-700 hover:bg-neutral-600 rounded text-sm">閉じる</button>
        </div>
      </div>

      {/* Message Area */}
      <div className="bg-black/50 p-3 rounded mb-4 text-center border border-neutral-700 min-h-[3rem] flex items-center justify-center">
        {message}
      </div>

      {/* Tabs */}
      <div className="flex mb-2">
        <button
          onClick={() => { setMode('buy'); setMessage('何を買うんだい？'); }}
          className={`flex-1 py-2 text-center font-bold rounded-t-lg transition-colors
            ${mode === 'buy' ? 'bg-neutral-800 text-yellow-500 border-t border-x border-yellow-700' : 'bg-neutral-900 text-neutral-500 border-b border-yellow-700'}
          `}
        >
          購入する
        </button>
        <button
          onClick={() => { setMode('sell'); setMessage('何を売るんだい？'); }}
          className={`flex-1 py-2 text-center font-bold rounded-t-lg transition-colors
            ${mode === 'sell' ? 'bg-neutral-800 text-yellow-500 border-t border-x border-yellow-700' : 'bg-neutral-900 text-neutral-500 border-b border-yellow-700'}
          `}
        >
          売却する
        </button>
      </div>

      {/* List Area */}
      <div className="flex-1 overflow-y-auto bg-neutral-800/50 p-2 rounded border border-neutral-700">
        
        {mode === 'buy' && (
          <div className="flex flex-col gap-2">
            {shopItems.map((itemId) => {
              const item = itemData[itemId];
              if (!item) return null;
              const canAfford = playerState.gold >= item.price;
              
              return (
                <div key={itemId} className="flex justify-between items-center p-3 bg-neutral-900 rounded border border-neutral-700 hover:border-yellow-600 transition-colors group">
                  <div className="flex flex-col">
                    <span className="font-bold text-lg group-hover:text-yellow-200">{item.name}</span>
                    <span className="text-xs text-neutral-400">{item.description}</span>
                  </div>
                  <button
                    onClick={() => handleBuy(itemId)}
                    disabled={!canAfford}
                    className={`px-4 py-2 rounded font-bold min-w-[100px]
                      ${canAfford 
                        ? 'bg-yellow-700 hover:bg-yellow-600 text-white shadow-md' 
                        : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'}
                    `}
                  >
                    {item.price} G
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {mode === 'sell' && (
          <div className="flex flex-col gap-2">
            {playerState.inventory.length === 0 ? (
              <div className="text-center text-neutral-500 mt-8">売るものがないようだ。</div>
            ) : (
              playerState.inventory.map((itemId, index) => {
                const item = itemData[itemId];
                if (!item) return null;
                const sellPrice = Math.floor(item.price / 2);

                return (
                  <div key={`${itemId}-${index}`} className="flex justify-between items-center p-3 bg-neutral-900 rounded border border-neutral-700 hover:border-blue-600 transition-colors group">
                     <div className="flex flex-col">
                        <span className="font-bold text-lg group-hover:text-blue-200">{item.name}</span>
                        <span className="text-xs text-neutral-400">{item.description}</span>
                     </div>
                     <button
                        onClick={() => handleSell(index)}
                        className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-blue-100 rounded font-bold min-w-[100px] shadow-md border border-blue-700"
                     >
                        売 {sellPrice} G
                     </button>
                  </div>
                );
              })
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default ShopMenu;
