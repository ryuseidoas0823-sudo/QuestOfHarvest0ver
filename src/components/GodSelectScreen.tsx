import React from 'react';
import { GODS } from '../data/gods';

interface GodSelectScreenProps {
  onSelectGod: (godId: string) => void;
  onBack: () => void;
}

const GodSelectScreen: React.FC<GodSelectScreenProps> = ({ onSelectGod, onBack }) => {
  const godList = Object.values(GODS);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-8">
      <h2 className="text-4xl font-bold mb-2 text-yellow-400">契約する神を選択してください</h2>
      <p className="text-gray-400 mb-8">神によって与えられる恩恵（パッシブボーナス）が異なります</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">
        {godList.map((god) => (
          <div 
            key={god.id}
            className="bg-gray-800 border-2 border-gray-700 rounded-xl p-6 flex flex-col hover:border-white transition-all cursor-pointer shadow-lg group relative overflow-hidden"
            style={{ borderColor: god.color }} // 選択時は神のテーマカラーで枠を表示したいが、tailwindと競合するためinline styleも併用
            onClick={() => onSelectGod(god.id)}
          >
            {/* 背景装飾 */}
            <div 
              className="absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-20 blur-xl"
              style={{ backgroundColor: god.color }}
            />

            <h3 className="text-2xl font-bold mb-1" style={{ color: god.color }}>{god.name}</h3>
            <div className="text-sm font-bold text-gray-500 mb-4 tracking-widest">{god.title}</div>
            
            <p className="text-gray-300 text-sm mb-6 min-h-[3rem] leading-relaxed">
              {god.description}
            </p>

            <div className="mt-auto bg-gray-900/50 rounded p-3">
              <div className="text-xs text-gray-400 mb-2 uppercase font-bold">Passive Bonus</div>
              <ul className="text-sm space-y-1">
                {god.passiveBonus.attack && (
                  <li className="flex justify-between">
                    <span>攻撃力</span> <span className="text-green-400">+{god.passiveBonus.attack}</span>
                  </li>
                )}
                {god.passiveBonus.defense && (
                  <li className="flex justify-between">
                    <span>防御力</span> <span className="text-green-400">+{god.passiveBonus.defense}</span>
                  </li>
                )}
                {god.passiveBonus.maxHp && (
                  <li className="flex justify-between">
                    <span>最大HP</span> <span className="text-green-400">+{god.passiveBonus.maxHp}</span>
                  </li>
                )}
                {god.passiveBonus.critRate && (
                  <li className="flex justify-between">
                    <span>クリティカル率</span> <span className="text-green-400">+{god.passiveBonus.critRate}%</span>
                  </li>
                )}
                {god.passiveBonus.dropRate && (
                  <li className="flex justify-between">
                    <span>ドロップ率</span> <span className="text-green-400">x{god.passiveBonus.dropRate}</span>
                  </li>
                )}
              </ul>
            </div>

            <div className="mt-4 text-center opacity-0 group-hover:opacity-100 transition-opacity text-sm font-bold animate-pulse">
              この神と契約する
            </div>
          </div>
        ))}
      </div>

      <button 
        onClick={onBack}
        className="mt-12 px-6 py-2 text-gray-400 hover:text-white border border-gray-600 hover:border-gray-400 rounded transition-colors"
      >
        職業選択に戻る
      </button>
    </div>
  );
};

export default GodSelectScreen;
