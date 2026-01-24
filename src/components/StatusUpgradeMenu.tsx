import React from 'react';
import { Stats } from '../types';

interface StatusUpgradeMenuProps {
  currentStats: Stats;
  playerExp: number;
  onUpgrade: (stat: keyof Stats, cost: number) => void;
  onClose?: () => void;
}

export const StatusUpgradeMenu: React.FC<StatusUpgradeMenuProps> = ({
  currentStats,
  playerExp,
  onUpgrade,
  onClose
}) => {
  // ステータス上昇に必要なコスト計算（簡易式：現在の値 * 10）
  const getCost = (val: number) => val * 10;

  const statsToUpgrade: { key: keyof Stats; label: string }[] = [
    { key: 'str', label: '筋力 (STR)' },
    { key: 'vit', label: '耐久 (VIT)' },
    { key: 'dex', label: '器用 (DEX)' },
    { key: 'agi', label: '敏捷 (AGI)' }, // speed -> agi に修正
    { key: 'int', label: '魔力 (INT)' },
    { key: 'luc', label: '運 (LUC)' },
  ];

  return (
    <div className="bg-gray-800 p-6 rounded-lg border-2 border-yellow-600 w-full max-w-2xl">
      <h3 className="text-2xl font-bold text-yellow-500 mb-4 text-center">神の恩恵 (ステータス更新)</h3>
      
      <div className="flex justify-between items-center mb-6 bg-gray-900 p-4 rounded">
        <div>
          <span className="text-gray-400 text-sm">現在の経験値</span>
          <div className="text-2xl font-mono text-blue-400">{playerExp} EXP</div>
        </div>
        <div className="text-right">
          <span className="text-gray-400 text-sm">現在のレベル</span>
          <div className="text-2xl font-mono text-white">Lv. {currentStats.level}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {statsToUpgrade.map((stat) => {
          const currentVal = currentStats[stat.key] || 0;
          const cost = getCost(currentVal);
          const canAfford = playerExp >= cost;

          return (
            <div key={stat.key} className="flex justify-between items-center bg-gray-700 p-3 rounded hover:bg-gray-600 transition-colors">
              <div>
                <div className="font-bold text-lg">{stat.label}</div>
                <div className="text-gray-300">
                    値: <span className="text-white font-mono">{currentVal}</span>
                </div>
              </div>
              
              <button
                onClick={() => onUpgrade(stat.key, cost)}
                disabled={!canAfford}
                className={`px-4 py-2 rounded font-bold text-sm flex flex-col items-center min-w-[100px]
                  ${canAfford 
                    ? 'bg-yellow-600 hover:bg-yellow-500 text-white shadow-lg' 
                    : 'bg-gray-500 text-gray-300 cursor-not-allowed opacity-60'
                  }`}
              >
                <span>UP</span>
                <span className="text-xs">-{cost} exp</span>
              </button>
            </div>
          );
        })}
      </div>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-400 mb-4">
          ※ ステータスを上げると、神の背中の聖なる文字（ヒエログリフ）が更新されます。
        </p>
        {onClose && (
            <button onClick={onClose} className="px-6 py-2 bg-gray-600 rounded hover:bg-gray-500">
                閉じる
            </button>
        )}
      </div>
    </div>
  );
};
