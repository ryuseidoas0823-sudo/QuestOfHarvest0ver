import React from 'react';
import { PlayerState, GameState } from '../types/gameState';
import { getExpRequiredForNextLevel } from '../utils/level';

// アイコンは外部ライブラリまたはSVGを使用。ここでは簡易SVG
const BackpackIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 20H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2Z"/><path d="M7 7V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2"/><line x1="12" y1="12" x2="12" y2="12"/></svg>
);

const StatsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/></svg>
);

interface Props {
  gameState: GameState;
  onOpenInventory: () => void;
  onOpenStatus: () => void;
  onOpenSkills: () => void;
}

export const GameHUD: React.FC<Props> = ({ gameState, onOpenInventory, onOpenStatus, onOpenSkills }) => {
  const { player } = gameState;
  const nextLevelExp = getExpRequiredForNextLevel(player.level);
  const expPercent = Math.min(100, (player.exp / nextLevelExp) * 100);

  return (
    <div className="fixed top-0 left-0 right-0 p-2 z-10 pointer-events-none">
      {/* 上部ステータスバー */}
      <div className="flex items-start justify-between max-w-5xl mx-auto">
        
        {/* 左上: プレイヤー情報 */}
        <div className="flex gap-2 pointer-events-auto">
          <div className="bg-slate-900/90 border border-slate-700 rounded-lg p-2 text-white shadow-lg w-48 md:w-64">
            <div className="flex justify-between items-baseline mb-1">
              <span className="font-bold text-yellow-500 truncate">{player.name}</span>
              <span className="text-xs text-slate-400">Lv.{player.level}</span>
            </div>
            
            {/* HP Bar */}
            <div className="relative h-3 bg-slate-800 rounded-full overflow-hidden mb-1">
              <div 
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-red-600 to-red-500 transition-all duration-300"
                style={{ width: `${(player.hp / player.maxHp) * 100}%` }}
              />
              <span className="absolute inset-0 flex items-center justify-center text-[8px] font-bold text-white drop-shadow-md">
                {player.hp} / {player.maxHp}
              </span>
            </div>

            {/* MP Bar */}
            <div className="relative h-2 bg-slate-800 rounded-full overflow-hidden mb-1">
              <div 
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-600 to-blue-500 transition-all duration-300"
                style={{ width: `${(player.mp / player.maxMp) * 100}%` }}
              />
            </div>

            {/* EXP Bar */}
            <div className="relative h-1 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="absolute top-0 left-0 h-full bg-yellow-500 transition-all duration-300"
                style={{ width: `${expPercent}%` }}
              />
            </div>
            <div className="text-[9px] text-right text-slate-500 mt-0.5">
               NEXT: {nextLevelExp - player.exp}
            </div>
          </div>
        </div>

        {/* 右上: メニューボタン群 */}
        <div className="flex flex-col gap-2 pointer-events-auto items-end">
          
          {/* ステータス/レベルアップボタン */}
          <button 
            onClick={onOpenStatus}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg font-bold shadow-lg transition-transform active:scale-95 border ${
              player.statPoints > 0 
                ? 'bg-yellow-600 border-yellow-400 text-white animate-pulse' 
                : 'bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <StatsIcon />
            <span className="hidden md:inline">Status</span>
            {player.statPoints > 0 && (
              <span className="bg-red-600 text-white text-xs px-1.5 rounded-full ml-1">
                +{player.statPoints}
              </span>
            )}
          </button>

          {/* インベントリボタン */}
          <button 
            onClick={onOpenInventory}
            className="flex items-center gap-2 bg-slate-800 border border-slate-600 text-slate-300 hover:bg-slate-700 px-3 py-2 rounded-lg font-bold shadow-lg transition-transform active:scale-95"
          >
            <BackpackIcon />
            <span className="hidden md:inline">Items</span>
            {player.inventory.filter(i => i).length > 20 && (
               <span className="text-yellow-500 text-xs">Full</span>
            )}
          </button>

          {/* 所持金 */}
          <div className="bg-slate-900/80 border border-yellow-900/50 text-yellow-400 px-3 py-1 rounded-full text-sm font-mono flex items-center gap-1 shadow-md">
            <span>{player.gold}</span>
            <span className="text-xs">G</span>
          </div>

        </div>
      </div>
      
      {/* バフ/デバフアイコン表示エリア（必要に応じて拡張） */}
      {player.statusEffects.length > 0 && (
          <div className="absolute top-28 left-2 flex flex-col gap-1 pointer-events-none">
              {player.statusEffects.map((effect, i) => (
                  <div key={i} className="flex items-center gap-1 bg-black/60 text-white text-xs px-2 py-1 rounded">
                      <span className={effect.type === 'buff' ? 'text-green-400' : 'text-red-400'}>
                          {effect.type === 'buff' ? '▲' : '▼'}
                      </span>
                      {effect.name} ({effect.duration})
                  </div>
              ))}
          </div>
      )}
    </div>
  );
};
