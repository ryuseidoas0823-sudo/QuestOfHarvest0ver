import React from 'react';

interface ResultScreenProps {
  result: 'clear' | 'gameover';
  score: number;
  onReturn: () => void;
}

const ResultScreen: React.FC<ResultScreenProps> = ({ result, score, onReturn }) => {
  const isClear = result === 'clear';
  return (
    <div className="flex flex-col items-center justify-center w-full h-full bg-black/95 text-white z-50">
      <h2 className={`text-5xl font-bold mb-4 ${isClear ? 'text-yellow-400' : 'text-red-600'}`}>
        {isClear ? 'DUNGEON CLEARED!' : 'GAME OVER'}
      </h2>
      
      <div className="text-2xl mb-8">
        Score: <span className="text-yellow-200">{score}</span>
      </div>

      <button 
        onClick={onReturn}
        className="px-8 py-3 bg-neutral-700 hover:bg-neutral-600 text-white rounded border border-neutral-500"
      >
        街へ戻る
      </button>
    </div>
  );
};

export default ResultScreen;
