import React from 'react';
import { Job } from '../types/job';
import { PixelSprite } from './PixelSprite';

interface GameHUDProps {
  playerJob: Job;
  level: number;
  hp: number;
  maxHp: number;
  exp: number;
  nextExp: number;
  floor: number;
  gold: number;
}

export const GameHUD: React.FC<GameHUDProps> = ({ 
  playerJob, 
  level, 
  hp, 
  maxHp, 
  exp, 
  nextExp,
  floor,
  gold
}) => {
  const hpPercentage = Math.max(0, Math.min(100, (hp / maxHp) * 100));
  const expPercentage = Math.max(0, Math.min(100, (exp / nextExp) * 100));

  return (
    <div className="bg-gray-900 border-b-2 border-gray-700 p-2 text-white shadow-lg">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        
        {/* 左側: キャラクター情報 */}
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gray-800 rounded border border-gray-600 flex items-center justify-center overflow-hidden">
             {/* PixelSpriteを使用 */}
             <PixelSprite spriteKey={playerJob.id} size={40} />
          </div>
          
          <div>
            <div className="flex items-baseline space-x-2">
              <span className="font-bold text-yellow-500">{playerJob.name}</span>
              <span className="text-sm text-gray-400">Lv.{level}</span>
            </div>
            
            {/* HP Bar */}
            <div className="w-32 h-3 bg-gray-700 rounded-full mt-1 relative overflow-hidden">
              <div 
                className="absolute top-0 left-0 h-full bg-red-500 transition-all duration-300"
                style={{ width: `${hpPercentage}%` }}
              ></div>
              <span className="absolute w-full text-center text-[10px] leading-3 text-white drop-shadow-md">
                {hp} / {maxHp}
              </span>
            </div>
          </div>
        </div>

        {/* 中央: フロア情報 */}
        {floor > 0 && (
            <div className="text-center">
                <div className="text-xs text-gray-400">現在地</div>
                <div className="text-xl font-bold text-blue-400">B{floor}F</div>
            </div>
        )}

        {/* 右側: 経験値 & ゴールド */}
        <div className="flex flex-col items-end min-w-[100px]">
           <div className="flex items-center text-yellow-400 font-mono mb-1">
             <span className="text-lg mr-1">G</span>
             <span>{gold.toLocaleString()}</span>
           </div>
           
           {/* EXP Bar */}
           <div className="w-24 h-2 bg-gray-700 rounded-full relative overflow-hidden" title={`Next Lv: ${nextExp - exp}`}>
              <div 
                className="absolute top-0 left-0 h-full bg-blue-500"
                style={{ width: `${expPercentage}%` }}
              ></div>
           </div>
           <span className="text-[10px] text-gray-500">EXP {Math.floor(expPercentage)}%</span>
        </div>

      </div>
    </div>
  );
};
