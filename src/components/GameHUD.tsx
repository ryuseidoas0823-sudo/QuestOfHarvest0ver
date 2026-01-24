import React from 'react';
import { Stats } from '../types';
import { GodId, GODS } from '../data/gods';
import { JobId, JOBS } from '../data/jobs';

interface GameHUDProps {
  playerStats: Stats;
  currentFloor: number;
  godId: GodId;
  jobId: JobId;
  gameLog: string[];
  onOpenInventory: () => void;
  onReturnTown: () => void; // 追加
}

export const GameHUD: React.FC<GameHUDProps> = ({ 
  playerStats, 
  currentFloor, 
  godId, 
  jobId, 
  gameLog,
  onOpenInventory,
  onReturnTown
}) => {
  const god = GODS[godId];
  const job = JOBS[jobId];

  // HPバーの計算
  const hpPercentage = Math.max(0, Math.min(100, (playerStats.hp / playerStats.maxHp) * 100));
  // EXPバーの計算
  const expPercentage = Math.max(0, Math.min(100, (playerStats.exp / playerStats.nextLevelExp) * 100));

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4">
      {/* 上部ステータスバー */}
      <div className="flex justify-between items-start pointer-events-auto">
        <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-700 text-white w-64 shadow-lg backdrop-blur-sm">
          <div className="flex justify-between items-baseline mb-1">
            <span className="font-bold text-yellow-500">{job?.name || '冒険者'} Lv.{playerStats.level}</span>
            <span className="text-xs text-slate-400">{god?.name || '無所属'}</span>
          </div>
          
          {/* HP Bar */}
          <div className="w-full bg-slate-700 h-4 rounded-full overflow-hidden mb-1 border border-slate-600">
            <div 
              className="bg-gradient-to-r from-red-600 to-red-500 h-full transition-all duration-300 ease-out" 
              style={{ width: `${hpPercentage}%` }}
            />
          </div>
          <div className="text-xs text-right mb-1">{playerStats.hp} / {playerStats.maxHp}</div>

          {/* EXP Bar */}
          <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden border border-slate-600">
            <div 
              className="bg-blue-500 h-full transition-all duration-300" 
              style={{ width: `${expPercentage}%` }}
            />
          </div>
        </div>

        <div className="flex flex-col gap-2 items-end">
          <div className="bg-black/50 text-white px-4 py-2 rounded font-mono text-xl border border-slate-600 backdrop-blur-sm">
            B{currentFloor}F
          </div>
          
          {/* メニューボタン群 */}
          <div className="flex gap-2">
            <button 
              className="bg-slate-800 hover:bg-slate-700 text-white px-3 py-1 rounded border border-slate-600 text-sm pointer-events-auto transition-colors"
              onClick={onReturnTown}
            >
              帰還
            </button>
            <button 
              className="bg-slate-800 hover:bg-slate-700 text-white px-3 py-1 rounded border border-slate-600 text-sm pointer-events-auto transition-colors"
              onClick={onOpenInventory}
            >
              アイテム
            </button>
          </div>
        </div>
      </div>

      {/* ログウィンドウ */}
      <div className="w-full max-w-lg bg-black/60 p-2 rounded text-sm text-slate-200 h-32 overflow-hidden flex flex-col-reverse pointer-events-auto backdrop-blur-sm border border-slate-700/50">
        {gameLog.map((log, index) => (
          <div key={index} className="truncate drop-shadow-sm">
            <span className="opacity-50 text-xs mr-2">[{index}]</span>
            {log}
          </div>
        ))}
      </div>
    </div>
  );
};
