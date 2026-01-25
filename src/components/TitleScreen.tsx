import React from 'react';

interface TitleScreenProps {
  onStart: () => void;
}

const TitleScreen: React.FC<TitleScreenProps> = ({ onStart }) => {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full bg-black text-white space-y-8">
      <h1 className="text-4xl md:text-6xl font-bold text-yellow-500 tracking-wider text-center drop-shadow-lg">
        Quest of Harvest
        <br />
        <span className="text-2xl md:text-3xl text-white mt-2 block">神々の迷宮と無限の塔</span>
      </h1>
      
      <div className="space-y-4">
        <button 
          onClick={onStart}
          className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded text-xl transition-transform hover:scale-105"
        >
          GAME START
        </button>
      </div>

      <div className="absolute bottom-4 text-gray-500 text-sm">
        ver 0.2.0 (Phase 2 Preview)
      </div>
    </div>
  );
};

export default TitleScreen;
