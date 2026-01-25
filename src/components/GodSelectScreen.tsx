import React from 'react';
import { GodId } from '../types';
import { GODS } from '../data/gods';

interface GodSelectScreenProps {
  onSelect: (godId: GodId) => void;
}

const GodSelectScreen: React.FC<GodSelectScreenProps> = ({ onSelect }) => {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full bg-slate-900 text-white p-4">
      <h2 className="text-3xl font-bold mb-2 text-amber-400">契約する神を選択</h2>
      <p className="mb-8 text-gray-400">所属するファミリアによって恩恵（パッシブスキル）が異なります</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
        {(Object.keys(GODS) as GodId[]).map((godId) => {
          const god = GODS[godId];
          return (
            <button
              key={godId}
              onClick={() => onSelect(godId)}
              className="flex flex-col items-start p-6 bg-slate-800 border-2 border-slate-600 rounded-lg hover:bg-slate-700 hover:border-yellow-500 transition-all text-left relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 text-6xl font-serif">
                {godId === 'war' ? 'W' : godId === 'blacksmith' ? 'B' : 'D'}
              </div>
              
              <h3 className="text-2xl font-bold mb-1 text-yellow-100">{god.name}</h3>
              <div className="text-xs text-yellow-600 font-bold mb-4 uppercase tracking-widest">{godId} Familia</div>
              
              <p className="text-sm text-gray-300 mb-4 h-12">{god.description}</p>
              
              <div className="w-full bg-slate-900/60 p-3 rounded text-sm space-y-1">
                <div className="font-bold text-gray-400 text-xs mb-1">【恩恵ボーナス】</div>
                {god.bonuses.attack && <div className="text-red-400">攻撃力 +{god.bonuses.attack}</div>}
                {god.bonuses.defense && <div className="text-blue-400">防御力 +{god.bonuses.defense}</div>}
                {god.bonuses.maxHp && <div className="text-green-400">最大HP +{god.bonuses.maxHp}</div>}
                {/* その他ボーナス表示 */}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default GodSelectScreen;
