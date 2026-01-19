import React from 'react';
import { PlayerEntity } from '../types';

interface GameHUDProps {
  player: PlayerEntity;
  gameTime: number;
  dayCount: number;
  onOpenInventory: () => void;
}

const GameHUD: React.FC<GameHUDProps> = ({ player, gameTime, dayCount, onOpenInventory }) => {
  const formatTime = (time: number) => {
    const hours = Math.floor(time / 60);
    const minutes = time % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  const Bar = ({ value, max, color, label }: { value: number; max: number; color: string; label: string }) => (
    <div className="flex items-center gap-2 mb-1">
      <span className="text-xs font-bold text-white w-8">{label}</span>
      <div className="flex-1 h-3 bg-gray-800 rounded-full overflow-hidden border border-gray-600">
        <div 
          className={`h-full ${color} transition-all duration-300`} 
          style={{ width: `${(value / max) * 100}%` }}
        />
      </div>
      <span className="text-[10px] text-gray-300 w-12 text-right">{Math.floor(value)}/{max}</span>
    </div>
  );

  return (
    <div className="absolute top-0 left-0 w-full p-4 pointer-events-none select-none">
      <div className="flex justify-between items-start">
        {/* ステータスセクション */}
        <div className="w-64 p-3 bg-black/60 backdrop-blur-md rounded-lg border border-white/20 pointer-events-auto">
          <div className="flex justify-between items-center mb-2">
            <span className="text-lg font-bold text-white">{player.name}</span>
            <span className="text-sm font-bold text-yellow-400">Lv.{player.level}</span>
          </div>

          <Bar label="HP" value={player.hp} max={player.maxHp} color="bg-red-500" />
          <Bar label="MP" value={player.mp} max={player.maxMp} color="bg-blue-500" />
          
          <div className="mt-3 pt-2 border-t border-white/10">
            <Bar label="食糧" value={player.hunger} max={100} color="bg-orange-400" />
            <Bar label="水分" value={player.thirst} max={100} color="bg-cyan-400" />
            <Bar label="精力" value={player.energy} max={100} color="bg-green-400" />
          </div>

          <div className="mt-2 h-1 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-yellow-300" 
              style={{ width: `${(player.exp / player.maxExp) * 100}%` }}
            />
          </div>
        </div>

        {/* 時間・設定セクション */}
        <div className="flex flex-col items-end gap-2">
          <div className="px-4 py-2 bg-black/60 backdrop-blur-md rounded-lg border border-white/20 text-white font-mono pointer-events-auto">
            <div className="text-xs text-gray-400">Day {dayCount}</div>
            <div className="text-xl">{formatTime(gameTime)}</div>
          </div>
          
          <button 
            onClick={onOpenInventory}
            className="p-3 bg-gray-800 hover:bg-gray-700 text-white rounded-full border border-white/20 shadow-lg pointer-events-auto transition-transform active:scale-95"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameHUD;
