import React, { useEffect, useState } from 'react';
import { hasSaveData } from '../utils/storage';

interface Props {
  onStartGame: () => void;
  onContinueGame?: () => void; // オプショナルにして既存コードとの互換性を維持しつつ、実装を促す
}

export const TitleScreen: React.FC<Props> = ({ onStartGame, onContinueGame }) => {
  const [canContinue, setCanContinue] = useState(false);

  useEffect(() => {
    // マウント時にセーブデータの有無を確認
    setCanContinue(hasSaveData());
  }, []);

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-slate-950 overflow-hidden font-sans">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black z-0"></div>
      
      {/* Scanline Effect (Optional CSS) */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjMDAwIiBmaWxsLW9wYWNpdHk9IjAuMSIvPgo8L3N2Zz4=')] opacity-20 pointer-events-none z-0"></div>

      <div className="z-10 text-center space-y-12 p-8 animate-fade-in">
        
        {/* Logo / Title Area */}
        <div className="space-y-4">
          <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-400 to-yellow-700 drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] tracking-tighter transform hover:scale-105 transition-transform duration-500 cursor-default">
            QUEST OF<br/>HARVEST
          </h1>
          <div className="flex items-center justify-center gap-2 text-slate-400 text-sm md:text-base tracking-[0.3em] uppercase">
            <span className="w-8 h-[1px] bg-slate-600"></span>
            <span>Roguelike RPG</span>
            <span className="w-8 h-[1px] bg-slate-600"></span>
          </div>
        </div>

        {/* Menu Buttons */}
        <div className="flex flex-col gap-4 w-full max-w-xs mx-auto">
          
          {/* Continue Button: セーブデータがある場合のみ表示 */}
          {canContinue && onContinueGame && (
            <button 
              onClick={onContinueGame}
              className="group relative px-8 py-4 bg-slate-800 hover:bg-blue-900 text-white font-bold rounded border-2 border-slate-600 hover:border-blue-400 transition-all shadow-lg hover:shadow-blue-500/50 hover:-translate-y-1"
            >
              <div className="flex items-center justify-center gap-2">
                <span className="text-blue-400">▶</span>
                <span>CONTINUE</span>
              </div>
              <span className="text-xs text-slate-400 font-normal block mt-1">続きから始める</span>
            </button>
          )}

          {/* New Game Button */}
          <button 
            onClick={onStartGame}
            className={`group relative px-8 py-4 bg-slate-800 hover:bg-red-900 text-white font-bold rounded border-2 border-slate-600 hover:border-red-400 transition-all shadow-lg hover:shadow-red-500/50 hover:-translate-y-1 ${!canContinue ? 'animate-pulse' : ''}`}
          >
             <div className="flex items-center justify-center gap-2">
                <span className="text-red-400">★</span>
                <span>NEW GAME</span>
              </div>
          </button>
          
          {/* Footer Info */}
          <div className="mt-8 text-xs text-slate-600 font-mono">
            Ver 0.2.0 | React + TS
          </div>
        </div>
      </div>
    </div>
  );
};
