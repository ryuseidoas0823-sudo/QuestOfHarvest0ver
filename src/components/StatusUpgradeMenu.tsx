import React from 'react';
import { Stats } from '../types';

interface StatusUpgradeMenuProps {
  stats: Stats;
  onUpgrade: (statKey: keyof Stats, cost: number) => void;
  onClose: () => void;
}

export const StatusUpgradeMenu: React.FC<StatusUpgradeMenuProps> = ({ stats, onUpgrade, onClose }) => {
  // ステータスごとの強化コスト計算（簡易式）
  const getCost = (val: number) => Math.floor(val * 10);

  const StatRow = ({ label, statKey, value, color }: { label: string, statKey: keyof Stats, value: number, color: string }) => {
    const cost = getCost(value);
    const canAfford = stats.exp >= cost;

    return (
      <div className="flex justify-between items-center bg-slate-900/50 p-3 rounded border border-indigo-900/50">
        <div className="flex items-center gap-3">
          <span className={`font-bold w-20 ${color}`}>{label}</span>
          <span className="text-2xl font-mono text-white">{value}</span>
        </div>
        <button
          onClick={() => onUpgrade(statKey, cost)}
          disabled={!canAfford}
          className={`px-4 py-1 rounded text-sm font-bold flex items-center gap-2 ${
            canAfford 
              ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' 
              : 'bg-slate-700 text-slate-500 cursor-not-allowed'
          }`}
        >
          強化 <span className="text-xs font-normal opacity-80">({cost} Exp)</span>
        </button>
      </div>
    );
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-800 rounded-lg border-2 border-indigo-500 overflow-hidden relative">
      <div className="bg-indigo-900/50 p-4 border-b border-indigo-700">
        <h2 className="text-2xl font-bold text-indigo-200 mb-1">ステータス更新</h2>
        <div className="flex justify-between items-end">
          <p className="text-indigo-300 text-sm">神の血（イコル）を受け、能力を更新します。</p>
          <div className="text-blue-400 font-mono text-xl font-bold">Exp: {stats.exp}</div>
        </div>
      </div>

      <div className="flex-grow p-6 flex flex-col gap-4 overflow-y-auto">
        <StatRow label="最大HP" statKey="maxHp" value={stats.maxHp} color="text-red-400" />
        <StatRow label="攻撃力" statKey="attack" value={stats.attack} color="text-orange-400" />
        <StatRow label="防御力" statKey="defense" value={stats.defense} color="text-green-400" />
        <StatRow label="素早さ" statKey="speed" value={stats.speed} color="text-cyan-400" />
      </div>

      <div className="p-4 border-t border-slate-700 bg-slate-800">
        <button 
          onClick={onClose}
          className="w-full py-2 text-slate-400 hover:text-white underline transition-colors"
        >
          ← 街へ戻る
        </button>
      </div>
    </div>
  );
};
