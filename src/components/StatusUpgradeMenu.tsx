import React from 'react';
import { GameState, Stats } from '../types/gameState';

interface Props {
  player: GameState['player'];
  onUpgrade: (stat: keyof Stats) => void;
  onClose: () => void;
}

export const StatusUpgradeMenu: React.FC<Props> = ({ player, onUpgrade, onClose }) => {
  const statsList: { key: keyof Stats; label: string; desc: string }[] = [
    { key: 'str', label: 'STR', desc: '物理攻撃力' },
    { key: 'vit', label: 'VIT', desc: '最大HP / 防御力' },
    { key: 'dex', label: 'DEX', desc: '命中 / クリティカル' },
    { key: 'agi', label: 'AGI', desc: '回避 / 行動速度' },
    { key: 'int', label: 'INT', desc: '最大MP / 魔法力' },
  ];

  return (
    <div className="bg-gray-900 border-2 border-yellow-600 rounded-lg p-6 max-w-md w-full shadow-2xl text-white relative">
      <h2 className="text-2xl font-bold mb-4 text-center text-yellow-500 border-b border-gray-700 pb-2">
        STATUS UPGRADE
      </h2>
      
      <div className="flex justify-between items-center mb-6 bg-gray-800 p-3 rounded">
        <div>
          <div className="text-sm text-gray-400">Remaining Points</div>
          <div className="text-3xl font-bold text-yellow-400">{player.statPoints} pts</div>
        </div>
        <div className="text-right">
            <div className="text-sm text-gray-400">Level</div>
            <div className="text-2xl">{player.level}</div>
        </div>
      </div>

      <div className="space-y-3">
        {statsList.map((stat) => (
          <div key={stat.key} className="flex items-center justify-between bg-gray-800 p-2 rounded hover:bg-gray-750 transition-colors">
            <div className="flex-1">
              <div className="flex items-baseline gap-2">
                <span className="font-bold text-lg w-10">{stat.label}</span>
                <span className="text-2xl font-mono text-blue-300">{player.stats[stat.key]}</span>
              </div>
              <div className="text-xs text-gray-500">{stat.desc}</div>
            </div>

            <button
              onClick={() => onUpgrade(stat.key)}
              disabled={player.statPoints <= 0}
              className={`
                w-10 h-10 flex items-center justify-center rounded font-bold text-xl
                ${player.statPoints > 0 
                  ? 'bg-yellow-600 hover:bg-yellow-500 text-white shadow-lg cursor-pointer transform active:scale-95 transition-all' 
                  : 'bg-gray-700 text-gray-500 cursor-not-allowed'}
              `}
            >
              +
            </button>
          </div>
        ))}
      </div>

      <div className="mt-8 text-center">
        <button
          onClick={onClose}
          className="px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded text-gray-200 transition-colors"
        >
          Close Menu
        </button>
      </div>
      
      {/* 簡易ヘルプ */}
      <div className="mt-4 text-xs text-gray-500 text-center">
          ポイントを割り振ってキャラクターを強化しましょう。
      </div>
    </div>
  );
};
