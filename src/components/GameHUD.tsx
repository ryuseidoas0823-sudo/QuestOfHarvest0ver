import React from 'react';
import { PlayerState, Tile } from '../types';

interface GameHUDProps {
  playerState: PlayerState;
  floor: number;
  logs: string[];
  miniMap: Tile[][];
}

const GameHUD: React.FC<GameHUDProps> = ({ playerState, floor, logs, miniMap: _miniMap }) => {
  // HP/SPの割合計算
  const hpPercent = Math.max(0, Math.min(100, (playerState.hp / playerState.maxHp) * 100));
  const spPercent = Math.max(0, Math.min(100, (playerState.sp / playerState.maxSp) * 100));
  const expPercent = Math.max(0, Math.min(100, (playerState.exp / playerState.nextExp) * 100));

  return (
    <div className="w-full px-4 py-2 pointer-events-none flex justify-between items-start font-sans text-sm">
      
      {/* Left: Status Bars */}
      <div className="flex flex-col gap-1 w-48 bg-black/60 p-2 rounded border border-neutral-600 backdrop-blur-sm">
        {/* Name & Level */}
        <div className="flex justify-between items-baseline mb-1">
          <span className="font-bold text-yellow-500 text-base shadow-black drop-shadow-md">{playerState.name}</span>
          <span className="text-xs text-neutral-300">Lv.{playerState.level}</span>
        </div>

        {/* HP Bar */}
        <div className="relative h-4 w-full bg-neutral-900 rounded border border-neutral-700 overflow-hidden">
          <div 
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-red-600 to-red-500 transition-all duration-300"
            style={{ width: `${hpPercent}%` }}
          />
          <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white drop-shadow-md">
            HP {playerState.hp}/{playerState.maxHp}
          </div>
        </div>

        {/* SP Bar */}
        <div className="relative h-3 w-full bg-neutral-900 rounded border border-neutral-700 overflow-hidden mt-1">
          <div 
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-600 to-blue-500 transition-all duration-300"
            style={{ width: `${spPercent}%` }}
          />
          <div className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-white drop-shadow-md">
            SP {playerState.sp}/{playerState.maxSp}
          </div>
        </div>

        {/* EXP Bar (Thin) */}
        <div className="relative h-1.5 w-full bg-neutral-800 rounded-full border border-neutral-700 overflow-hidden mt-1">
          <div 
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-yellow-500 to-yellow-300 transition-all duration-300"
            style={{ width: `${expPercent}%` }}
          />
        </div>
        
        {/* Gold & Floor */}
        <div className="flex justify-between mt-1 text-xs text-neutral-200">
           <span className="flex items-center gap-1">
             <span className="text-yellow-400">G</span> {playerState.gold}
           </span>
           <span className="flex items-center gap-1">
             <span className="text-neutral-400">B</span> {floor}F
           </span>
        </div>
      </div>

      {/* Center: Message Log (Latest 3) */}
      <div className="flex-1 mx-4">
        <div className="flex flex-col-reverse items-center gap-1 w-full opacity-90">
          {logs.slice(-3).reverse().map((log, i) => (
            <div 
              key={i} 
              className={`text-center px-3 py-1 rounded text-shadow-sm border border-transparent
                ${i === 0 ? 'bg-black/70 text-white border-neutral-600 scale-100' : 'bg-black/40 text-gray-400 scale-90'}
                transition-all duration-300
              `}
            >
              {log}
            </div>
          ))}
        </div>
      </div>

      {/* Right: Mini Map */}
      <div className="w-24 h-24 bg-black/80 border-2 border-neutral-600 rounded p-1 opacity-80 relative overflow-hidden hidden sm:block">
         <div className="w-full h-full grid grid-cols-10 grid-rows-10 gap-[1px]">
            {/* 方角 */}
            <div className="absolute inset-0 flex items-center justify-center text-neutral-600 font-bold text-2xl">
              N
            </div>
            {/* プレイヤー位置 */}
            <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-blue-500 rounded-full -translate-x-1/2 -translate-y-1/2 shadow-[0_0_5px_#3b82f6]" />
         </div>
      </div>

    </div>
  );
};

export default GameHUD;
