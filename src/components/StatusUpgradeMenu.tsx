import React from 'react';
import { PlayerState } from '../types';

interface StatusUpgradeMenuProps {
  playerState: PlayerState;
  onClose: () => void;
  onUpgrade: (stat: string) => void;
}

// export defaultを追加
const StatusUpgradeMenu: React.FC<StatusUpgradeMenuProps> = ({ playerState, onClose, onUpgrade }) => {
  return (
    <div className="flex flex-col w-full h-full max-w-md bg-neutral-900 border-2 border-neutral-600 rounded p-6 text-white font-sans">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-yellow-500">ステータス</h2>
        <button onClick={onClose} className="px-3 py-1 bg-neutral-700 rounded text-sm">閉じる</button>
      </div>

      <div className="flex flex-col gap-4">
        {/* 主要ステータス表示（簡易） */}
        {Object.entries(playerState.stats).map(([key, value]) => {
           // 主要6ステータスのみ表示
           if (!['str', 'vit', 'dex', 'agi', 'int', 'luc'].includes(key)) return null;
           
           return (
             <div key={key} className="flex justify-between items-center p-2 bg-neutral-800 rounded">
               <span className="uppercase font-bold text-neutral-400">{key}</span>
               <div className="flex items-center gap-4">
                 <span className="text-xl font-bold">{value}</span>
                 {/* アップグレード機能は未実装のためボタンはダミー */}
                 <button 
                   onClick={() => onUpgrade(key)}
                   className="w-6 h-6 flex items-center justify-center bg-blue-900 text-blue-200 rounded text-xs opacity-50 cursor-not-allowed"
                   disabled
                 >
                   +
                 </button>
               </div>
             </div>
           );
        })}
      </div>
      
      <div className="mt-6 text-sm text-neutral-500 text-center">
        ステータスポイント機能は準備中です
      </div>
    </div>
  );
};

export default StatusUpgradeMenu;
