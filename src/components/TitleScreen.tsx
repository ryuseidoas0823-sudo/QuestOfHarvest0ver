import { Play, RotateCcw, Monitor } from 'lucide-react';
import { ResolutionMode } from '../types';

interface TitleScreenProps {
  onStart: () => void;
  onContinue: () => void;
  canContinue: boolean;
  resolution: ResolutionMode;
  setResolution: (mode: ResolutionMode) => void;
  loadingProgress?: number; // 0-100
}

export const TitleScreen = ({ onStart, onContinue, canContinue, resolution, setResolution, loadingProgress = 0 }: TitleScreenProps) => {
  return (
    <div className="w-full h-screen bg-slate-900 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background Effect */}
      <div className="absolute inset-0 opacity-20 bg-mist"></div>
      <div className="absolute inset-0 bg-[url('https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/swords.svg')] bg-repeat opacity-5 animate-pulse"></div>

      <div className="relative z-10 text-center">
        <h1 className="text-6xl md:text-8xl font-black text-yellow-500 mb-2 tracking-tighter text-shadow-strong animate-float">
          QUEST OF<br />HARVEST
        </h1>
        <p className="text-slate-400 mb-12 text-lg tracking-widest uppercase">Roguelike Action RPG</p>

        {loadingProgress > 0 ? (
           // ロード画面
           <div className="w-80 mx-auto">
             <div className="flex justify-between text-yellow-400 mb-2 font-mono text-sm">
                <span>GENERATING WORLD...</span>
                <span>{loadingProgress}%</span>
             </div>
             <div className="w-full h-4 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
               <div 
                 className="h-full bg-gradient-to-r from-yellow-600 to-yellow-400 transition-all duration-300 ease-out"
                 style={{ width: `${loadingProgress}%` }}
               ></div>
             </div>
             <p className="text-slate-500 text-xs mt-2 animate-pulse">地形を構築中...</p>
           </div>
        ) : (
          // 通常メニュー
          <div className="space-y-4 w-64 mx-auto">
            <button
              onClick={onStart}
              className="w-full py-4 bg-yellow-600 hover:bg-yellow-500 text-white font-bold rounded-lg shadow-lg hover:shadow-yellow-500/20 transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2 group"
            >
              <Play className="group-hover:fill-current" /> NEW GAME
            </button>
            
            {canContinue && (
              <button
                onClick={onContinue}
                className="w-full py-4 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-lg shadow-lg transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2"
              >
                <RotateCcw /> CONTINUE
              </button>
            )}

            <div className="pt-8 border-t border-slate-800/50 mt-8">
               <div className="text-xs text-slate-500 mb-2 flex items-center justify-center gap-1">
                 <Monitor size={12} /> RESOLUTION
               </div>
               <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => setResolution('auto')}
                    className={`px-2 py-1 text-xs rounded border ${resolution === 'auto' ? 'bg-slate-600 border-slate-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-500 hover:text-slate-300'}`}
                  >
                    AUTO
                  </button>
                  <button 
                    onClick={() => setResolution('800x600')}
                    className={`px-2 py-1 text-xs rounded border ${resolution === '800x600' ? 'bg-slate-600 border-slate-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-500 hover:text-slate-300'}`}
                  >
                    SVGA
                  </button>
               </div>
            </div>
          </div>
        )}
      </div>

      <div className="absolute bottom-4 text-slate-600 text-xs">
        © 2024 Quest of Harvest. All rights reserved.
      </div>
    </div>
  );
};
