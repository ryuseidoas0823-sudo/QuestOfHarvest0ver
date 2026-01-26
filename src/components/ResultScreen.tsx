import React from 'react';

interface ResultScreenProps {
  result: 'gameover' | 'clear';
  score: number;
  floor?: number;
  onTitle: () => void;
  onRetry: () => void;
}

const ResultScreen: React.FC<ResultScreenProps> = ({ 
  result, 
  score, 
  floor = 1,
  onTitle, 
  onRetry 
}) => {
  const isGameOver = result === 'gameover';

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 animate-fade-in">
      <div className="flex flex-col items-center gap-6 p-8 border-2 border-neutral-700 bg-neutral-900 rounded shadow-2xl w-full max-w-md">
        
        <h2 className={`text-4xl font-bold tracking-widest drop-shadow-[0_0_10px_rgba(255,255,255,0.5)] 
          ${isGameOver ? 'text-red-600' : 'text-yellow-400'}`}>
          {isGameOver ? 'GAME OVER' : 'QUEST CLEAR'}
        </h2>

        <div className="flex flex-col gap-2 items-center text-neutral-300">
          <p className="text-lg">到達階層: <span className="text-white font-bold">{floor}F</span></p>
          <p className="text-lg">獲得経験値: <span className="text-white font-bold">{score}</span></p>
          {isGameOver && (
              <p className="text-sm text-red-400 mt-2">※ 街に戻ると所持金が半分になります</p>
          )}
        </div>

        <div className="flex flex-col gap-3 w-full mt-4">
          <button
            onClick={onRetry}
            className="w-full py-3 bg-gradient-to-r from-blue-700 to-blue-600 hover:from-blue-600 hover:to-blue-500 text-white font-bold rounded shadow-lg transition-all transform hover:scale-105"
          >
            {isGameOver ? '街に戻って再起する' : '探索を続ける'}
          </button>
          
          <button
            onClick={onTitle}
            className="w-full py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-400 font-medium rounded border border-neutral-600 transition-colors"
          >
            タイトルに戻る
          </button>
        </div>

      </div>
    </div>
  );
};

export default ResultScreen;
