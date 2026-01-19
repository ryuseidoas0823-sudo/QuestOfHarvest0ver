import React from 'react';
import { PlayerEntity, Stats } from '../types';

interface InventoryMenuProps {
  player: PlayerEntity; // ここが不足していた
  onClose: () => void;
  onUpgradeStat: (statName: keyof Stats) => void;
}

export const InventoryMenu: React.FC<InventoryMenuProps> = ({ player, onClose, onUpgradeStat }) => {
  return (
    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-40 flex items-center justify-center p-8">
      <div className="bg-slate-900 border-2 border-white/20 rounded-2xl w-full max-w-4xl max-h-[80vh] flex flex-col overflow-hidden">
        <div className="p-6 border-b border-white/10 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-black text-white">CHARACTER</h2>
            <span className="text-blue-400 font-bold bg-blue-400/10 px-3 py-1 rounded text-sm uppercase">{player.job}</span>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">CLOSE [ESC]</button>
        </div>
        
        <div className="flex-1 flex overflow-hidden">
          {/* 左側: ステータス */}
          <div className="w-1/3 p-6 border-r border-white/10 overflow-y-auto bg-slate-900/50">
            <div className="mb-6">
              <div className="text-xs text-gray-500 uppercase tracking-widest mb-1">Available Points</div>
              <div className="text-3xl font-black text-white">{player.statPoints}</div>
            </div>

            <div className="space-y-4">
              {(Object.keys(player.stats) as Array<keyof Stats>).map(key => (
                <div key={key} className="group">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-gray-400 uppercase text-xs font-bold tracking-wider">{key}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-white font-mono text-lg">{player.stats[key]}</span>
                      {player.statPoints > 0 && (
                        <button 
                          onClick={() => onUpgradeStat(key)}
                          className="w-6 h-6 bg-blue-600 hover:bg-blue-500 text-white rounded shadow-lg shadow-blue-900/20 flex items-center justify-center font-bold transition-all active:scale-90"
                        >
                          +
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500/30" style={{ width: `${(player.stats[key] / 30) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 右側: インベントリ */}
          <div className="flex-1 p-6 overflow-y-auto">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Inventory ({player.inventory.length}/50)</h3>
            <div className="grid grid-cols-4 gap-4">
              {player.inventory.map(item => (
                <div key={item.id} className="aspect-square bg-slate-800 rounded-lg border border-white/5 p-2 flex flex-col items-center justify-center text-center group hover:border-blue-500/50 transition-all cursor-pointer">
                  <span className="text-2xl mb-1 group-hover:scale-110 transition-transform">{item.icon || '📦'}</span>
                  <span className="text-[10px] text-gray-400 leading-tight truncate w-full">{item.name}</span>
                </div>
              ))}
              {Array.from({ length: Math.max(0, 12 - player.inventory.length) }).map((_, i) => (
                <div key={i} className="aspect-square bg-slate-800/30 rounded-lg border border-white/5 border-dashed" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
