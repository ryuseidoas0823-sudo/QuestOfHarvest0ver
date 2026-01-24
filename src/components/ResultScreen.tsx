import React from 'react';

// Props定義を拡張
export interface ResultScreenProps {
  onReturnToTown: () => void;
  resultData?: {
      exp: number;
      gold: number;
      items: string[];
  };
}

export const ResultScreen: React.FC<ResultScreenProps> = ({ 
    onReturnToTown,
    resultData = { exp: 0, gold: 0, items: [] } // デフォルト値
}) => {
  return (
    <div className="absolute inset-0 z-50 bg-black/90 flex flex-col items-center justify-center animate-fade-in">
      <h2 className="text-5xl font-bold text-red-600 mb-8 tracking-widest" style={{ textShadow: '0 0 10px #991b1b' }}>
        GAME OVER
      </h2>
      
      <div className="bg-gray-900/80 border border-gray-700 p-8 rounded-lg max-w-md w-full mb-8 text-center space-y-4">
        <p className="text-gray-400">今回の冒険の成果</p>
        <div className="grid grid-cols-2 gap-4 text-xl">
            <div className="text-right text-gray-400">獲得経験値:</div>
            <div className="text-left text-blue-400 font-mono">+{resultData.exp}</div>
            
            <div className="text-right text-gray-400">獲得ゴールド:</div>
            <div className="text-left text-yellow-400 font-mono">+{resultData.gold}</div>
        </div>
        
        {resultData.items.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-800">
                <p className="text-sm text-gray-500 mb-2">回収したアイテム</p>
                <div className="flex flex-wrap gap-2 justify-center">
                    {resultData.items.map((item, i) => (
                        <span key={i} className="text-xs bg-gray-800 px-2 py-1 rounded text-gray-300 border border-gray-700">
                            {item}
                        </span>
                    ))}
                </div>
            </div>
        )}
      </div>

      <p className="text-gray-400 mb-8 text-lg">
        冒険者は力尽きたが、その魂は神の元へ還る...
      </p>

      <button
        onClick={onReturnToTown}
        className="px-10 py-4 bg-red-900/50 hover:bg-red-800 text-white rounded border border-red-600 text-xl transition-all duration-300 hover:scale-105"
      >
        街へ帰還する
      </button>
    </div>
  );
};
