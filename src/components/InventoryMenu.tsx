import React from 'react';
import { PlayerEntity, Stats } from '../types';

interface InventoryMenuProps {
  player: PlayerEntity;
  onClose: () => void;
  onUpgradeStat: (statName: keyof Stats) => void;
}

/**
 * インベントリおよびキャラクターステータス画面
 */
export const InventoryMenu: React.FC<InventoryMenuProps> = ({ player, onClose, onUpgradeStat }) => {
  return (
    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-40 flex items-center justify-center p-8">
      <div className="bg-slate-900 border-2 border-white/20 rounded-2xl w-full max-w-4xl max-h-[80vh] flex flex-col overflow-hidden shadow-2xl">
        {/* ヘッダー */}
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-slate-800/50">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-black text-white tracking-tight">CHARACTER</h2>
            <span className="text-blue-400 font-bold bg-blue-400/10 px-3 py-1 rounded text-xs uppercase tracking-widest border border-blue-400/20">
              {player.job}
            </span>
          </div>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-lg"
          >
            CLOSE [ESC]
          </button>
        </div>
        
        <div className="flex-1 flex overflow-hidden">
          {/* 左側: ステータス割り振り */}
          <div className="w-1/3 p-6 border-r border-white/10 overflow-y-auto bg-slate-900/50">
            <div className="mb-8">
              <div className="text-[10px] text-gray-500 uppercase tracking-[0.2em] mb-1 font-bold">Unspent Points</div>
              <div className="text-4xl font-black text-white font-mono">{player.statPoints}</div>
            </div>

            <div className="space-y-5">
              {(Object.keys(player.stats) as Array<keyof Stats>).map(key => (
                <div key={key} className="group">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-gray-400 uppercase text-[10px] font-black tracking-widest">{key}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-white font-mono text-xl font-bold">{player.stats[key]}</span>
                      {player.statPoints > 0 && (
                        <button 
                          onClick={() => onUpgradeStat(key)}
                          className="w-7 h-7 bg-blue-600 hover:bg-blue-500 text-white rounded-md shadow-lg shadow-blue-900/40 flex items-center justify-center font-bold transition-all active:scale-90 hover:scale-110"
                        >
                          +
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 opacity-50 transition-all duration-500" 
                      style={{ width: `${Math.min(100, (player.stats[key] / 40) * 100)}%` }} 
                    />
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-8 pt-8 border-t border-white/5 text-[10px] text-gray-500 leading-relaxed">
              * STR: ダメージ量<br/>
              * VIT: 最大HP・防御<br/>
              * INT: 最大MP・魔法
            </div>
          </div>

          {/* 右側: インベントリ */}
          <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
            <div className="flex justify-between items-end mb-6">
              <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Bag Space</h3>
              <span className="text-xs text-gray-400 font-mono">{player.inventory.length} / 50</span>
            </div>
            
            <div className="grid grid-cols-4 lg:grid-cols-5 gap-4">
              {player.inventory.map(item => (
                <div 
                  key={item.id} 
                  className="aspect-square bg-slate-800/50 rounded-xl border border-white/5 p-3 flex flex-col items-center justify-center text-center group hover:border-blue-500/50 hover:bg-slate-800 transition-all cursor-pointer relative"
                >
                  <span className="text-3xl mb-1 group-hover:scale-110 transition-transform drop-shadow-md">
                    {item.icon || '📦'}
                  </span>
                  <span className="text-[9px] text-gray-400 font-medium leading-tight truncate w-full px-1">
                    {item.name}
                  </span>
                  {/* レアリティマーカー */}
                  <div className={`absolute top-1 right-1 w-1.5 h-1.5 rounded-full ${
                    item.rarity === 'Legendary' ? 'bg-orange-500 shadow-[0_0_5px_rgba(249,115,22,0.8)]' :
                    item.rarity === 'Epic' ? 'bg-purple-500' :
                    item.rarity === 'Rare' ? 'bg-blue-500' : 'bg-gray-600'
                  }`} />
                </div>
              ))}
              {Array.from({ length: Math.max(0, 15 - player.inventory.length) }).map((_, i) => (
                <div key={i} className="aspect-square bg-white/5 rounded-xl border border-white/5 border-dashed flex items-center justify-center">
                  <div className="w-1 h-1 bg-white/10 rounded-full" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
