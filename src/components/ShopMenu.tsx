import React from 'react';
import { GameState } from '../types/gameState';
import { useShop } from '../hooks/useShop';
import { Coins, ShoppingBag, ArrowLeft, ShieldCheck, Sword, Zap } from 'lucide-react';
import { Item } from '../types/item';

interface ShopMenuProps {
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
  onClose: () => void;
  addLog: (text: string, type?: 'info' | 'success' | 'warning' | 'danger') => void;
}

const ShopMenu: React.FC<ShopMenuProps> = ({ gameState, setGameState, onClose, addLog }) => {
  const { activeTab, setActiveTab, buyItem, sellItem, shopInventory } = useShop(gameState, setGameState, addLog);
  const { player } = gameState;

  const renderItemCard = (item: Item, isBuying: boolean) => {
    const price = isBuying ? item.value : Math.floor((item.value || 0) / 2);
    const canAfford = player.gold >= (price || 0);

    return (
      <div 
        key={item.id} 
        className="bg-slate-800 border border-slate-700 p-3 rounded-lg flex flex-col gap-2 hover:border-slate-500 transition-colors group"
      >
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded bg-slate-900 border border-slate-700 
              ${item.rarity === 'rare' ? 'border-yellow-500/50 text-yellow-500' : 
                item.rarity === 'uncommon' ? 'border-blue-500/50 text-blue-500' : 'text-slate-400'}`}
            >
              {item.type === 'weapon' ? <Sword size={16} /> :
               item.type === 'armor' ? <ShieldCheck size={16} /> :
               item.type === 'accessory' ? <Zap size={16} /> :
               <ShoppingBag size={16} />}
            </div>
            <div>
              <div className={`font-bold text-sm ${
                item.rarity === 'rare' ? 'text-yellow-400' : 
                item.rarity === 'uncommon' ? 'text-blue-400' : 'text-white'
              }`}>
                {item.name}
              </div>
              <div className="text-xs text-slate-400">{item.type}</div>
            </div>
          </div>
        </div>

        <div className="text-xs text-slate-400 flex-1 min-h-[2.5em]">
          {item.description}
        </div>

        {/* 簡易ステータス表示 */}
        <div className="flex gap-2 text-[10px] text-slate-300 mb-1">
          {item.stats?.attack > 0 && <span className="bg-red-900/40 px-1 rounded">ATK +{item.stats.attack}</span>}
          {item.stats?.defense > 0 && <span className="bg-blue-900/40 px-1 rounded">DEF +{item.stats.defense}</span>}
          {item.stats?.magicAttack > 0 && <span className="bg-purple-900/40 px-1 rounded">MAT +{item.stats.magicAttack}</span>}
        </div>

        <div className="mt-auto pt-2 border-t border-slate-700 flex justify-between items-center">
          <div className="flex items-center gap-1 text-yellow-500 font-mono font-bold">
            <Coins size={14} />
            {price} G
          </div>
          <button
            onClick={() => isBuying ? buyItem(item) : sellItem(item)}
            disabled={isBuying && !canAfford}
            className={`px-3 py-1 rounded text-xs font-bold transition-all
              ${isBuying 
                ? (canAfford ? 'bg-yellow-700 hover:bg-yellow-600 text-white' : 'bg-slate-700 text-slate-500 cursor-not-allowed')
                : 'bg-blue-800 hover:bg-blue-700 text-white'
              }`}
          >
            {isBuying ? '購入' : '売却'}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="absolute inset-0 bg-slate-950 flex flex-col z-20">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-900 flex justify-between items-center shadow-md">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold text-yellow-500 flex items-center gap-2">
            <ShoppingBag /> General Store
          </h2>
          <div className="flex bg-slate-800 rounded-lg p-1 gap-1">
            <button
              onClick={() => setActiveTab('buy')}
              className={`px-4 py-1.5 rounded text-sm font-bold transition-colors ${
                activeTab === 'buy' ? 'bg-yellow-600 text-white' : 'text-slate-400 hover:bg-slate-700'
              }`}
            >
              購入 (Buy)
            </button>
            <button
              onClick={() => setActiveTab('sell')}
              className={`px-4 py-1.5 rounded text-sm font-bold transition-colors ${
                activeTab === 'sell' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-700'
              }`}
            >
              売却 (Sell)
            </button>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="bg-slate-800 px-4 py-2 rounded-lg border border-slate-700 flex items-center gap-2">
            <span className="text-slate-400 text-xs uppercase tracking-wider">Your Gold</span>
            <span className="text-yellow-400 font-mono font-bold text-lg flex items-center gap-1">
              <Coins size={18} /> {player.gold}
            </span>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
          {activeTab === 'buy' ? (
            shopInventory.map((item) => renderItemCard(item, true))
          ) : (
            player.inventory.length === 0 ? (
              <div className="col-span-full text-center text-slate-500 py-20 italic">
                売却できるアイテムを持っていません
              </div>
            ) : (
              player.inventory.map((item) => renderItemCard(item, false))
            )
          )}
        </div>
      </div>

      {/* Footer Hint */}
      <div className="bg-slate-900 p-2 border-t border-slate-800 text-center text-xs text-slate-500">
        {activeTab === 'buy' ? 'アイテムを選択して購入します。持ち物がいっぱいだと購入できません。' : '売却価格は購入価格の50%です。売却したアイテムは元に戻せません。'}
      </div>
    </div>
  );
};

export default ShopMenu;
