import React from 'react';

export interface ResultData {
  exp: number;
  gold: number;
  items: string[];
  floorReached: number;
}

interface ResultScreenProps {
  resultData: ResultData;
  onBackToTown: () => void;
}

export const ResultScreen: React.FC<ResultScreenProps> = ({ resultData, onBackToTown }) => {
  return (
    <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center text-white z-50 font-sans">
      <div className="w-full max-w-2xl bg-slate-800 border-2 border-slate-600 rounded-xl p-8 shadow-2xl animate-fade-in-up">
        <h2 className="text-4xl font-bold text-center mb-8 text-yellow-500 tracking-widest border-b border-slate-600 pb-4">
          EXPLORATION RESULT
        </h2>

        <div className="grid grid-cols-2 gap-8 mb-8">
          <div className="space-y-4">
            <div>
              <p className="text-slate-400 text-sm">到達階層</p>
              <p className="text-3xl font-bold">{resultData.floorReached} <span className="text-lg font-normal text-slate-500">階</span></p>
            </div>
            <div>
              <p className="text-slate-400 text-sm">獲得経験値</p>
              <p className="text-3xl font-bold text-blue-400">+{resultData.exp} <span className="text-lg font-normal text-slate-500">Exp</span></p>
            </div>
            <div>
              <p className="text-slate-400 text-sm">獲得ゴールド</p>
              <p className="text-3xl font-bold text-yellow-400">+{resultData.gold} <span className="text-lg font-normal text-slate-500">G</span></p>
            </div>
          </div>

          <div className="bg-slate-900 rounded p-4 border border-slate-700">
            <p className="text-slate-400 text-sm mb-2">獲得アイテム</p>
            {resultData.items.length > 0 ? (
              <ul className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                {resultData.items.map((item, index) => (
                  <li key={index} className="flex items-center text-sm">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    {item}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-slate-600 italic text-sm">なし</p>
            )}
          </div>
        </div>

        <div className="text-center pt-4">
          <button
            onClick={onBackToTown}
            className="px-10 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-lg rounded shadow-lg transition-all transform hover:scale-105"
          >
            街へ戻る
          </button>
        </div>
      </div>
    </div>
  );
};
