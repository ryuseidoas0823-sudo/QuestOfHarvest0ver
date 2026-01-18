import React, { useState } from 'react';
import { Play, Save, Settings, Monitor, X } from 'lucide-react';
import { ResolutionMode } from '../types';

interface TitleScreenProps {
  onStart: () => void;
  onContinue: () => void;
  canContinue: boolean;
  resolution: ResolutionMode;
  setResolution: (mode: ResolutionMode) => void;
}

export const TitleScreen = ({ onStart, onContinue, canContinue, resolution, setResolution }: TitleScreenProps) => {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className="w-full h-screen bg-slate-900 flex flex-col items-center justify-center text-white relative overflow-hidden font-sans bg-mist">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-30"></div>
      <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl animate-float" style={{animationDelay: '1s'}}></div>
      
      {/* Safe Area Container */}
      <div className="relative z-10 w-full h-full max-w-[177.78vh] max-h-[56.25vw] aspect-video m-auto flex flex-col items-center justify-center p-8">
        
        {/* Main Title Content */}
        <div className={`text-center space-y-10 animate-fade-in transition-all duration-300 w-full ${showSettings ? 'blur-sm scale-95 opacity-50' : ''}`}>
          <div className="relative">
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 via-yellow-500 to-yellow-800 drop-shadow-2xl mb-4 text-shadow-strong tracking-tighter" 
                style={{ filter: 'drop-shadow(0 0 30px rgba(234,179,8,0.6))'}}>
              QUEST OF HARVEST
            </h1>
            <p className="text-slate-400 tracking-[1.2em] text-sm md:text-lg uppercase font-serif mt-6 border-t border-b border-slate-700 py-3 inline-block bg-black/20 backdrop-blur-sm px-8 rounded-full">
              Reborn Edition
            </p>
          </div>

          <div className="flex flex-col gap-4 w-80 md:w-96 mx-auto">
            <button onClick={onStart} className="group relative flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-slate-800/90 to-slate-900/90 border-2 border-yellow-700/50 hover:border-yellow-400 hover:from-slate-800 hover:to-slate-800 transition-all duration-300 text-yellow-100 font-black tracking-widest uppercase text-lg shadow-lg hover:shadow-yellow-500/20 transform hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-400/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              <Play size={24} className="group-hover:text-yellow-400 transition-colors" />
              <span>New Game</span>
            </button>
            
            <button onClick={onContinue} disabled={!canContinue} className={`flex items-center justify-center gap-3 px-8 py-3 border-2 font-bold tracking-widest uppercase transition-all text-base backdrop-blur-sm ${canContinue ? 'bg-slate-800/50 border-slate-600 hover:border-blue-400 hover:bg-slate-700/80 text-slate-200 hover:shadow-blue-500/20' : 'bg-slate-900/50 border-slate-800 text-slate-600 cursor-not-allowed'}`}>
              <Save size={20} />
              <span>Continue</span>
            </button>

            <button onClick={() => setShowSettings(true)} className="flex items-center justify-center gap-3 px-8 py-3 border-2 border-slate-700 bg-slate-800/30 hover:bg-slate-800/60 hover:border-slate-500 font-bold tracking-widest uppercase transition-all text-slate-300 hover:text-white backdrop-blur-sm text-base">
              <Settings size={20} />
              <span>Settings</span>
            </button>
          </div>
        </div>

        {/* Settings Modal Overlay */}
        {showSettings && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md animate-fade-in">
            <div className="bg-slate-900 p-8 rounded-xl border-2 border-slate-600 w-[400px] shadow-2xl transform scale-100 transition-all">
              <div className="flex justify-between items-center mb-8 border-b border-slate-700 pb-4">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Settings className="text-slate-400" /> SETTINGS
                </h2>
                <button onClick={() => setShowSettings(false)} className="text-slate-400 hover:text-white transition-colors p-1 hover:bg-slate-800 rounded-full">
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-3 flex items-center gap-2">
                    <Monitor size={16} /> Screen Resolution (Game)
                  </label>
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      { label: 'AUTO (Fit Window)', val: 'auto', desc: 'Automatically adjusts to window size' }, 
                      { label: 'SVGA (800x600)', val: '800x600', desc: 'Classic 4:3 Aspect Ratio' },
                      { label: 'HD (1280x720)', val: '1280x720', desc: 'Widescreen 16:9' }
                    ].map(opt => (
                      <button 
                        key={opt.val}
                        onClick={() => setResolution(opt.val as ResolutionMode)}
                        className={`flex flex-col items-start p-3 rounded border transition-all ${
                          resolution === opt.val 
                            ? 'bg-yellow-600/20 border-yellow-500 text-yellow-100 shadow-[0_0_10px_rgba(234,179,8,0.2)]' 
                            : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700 hover:border-slate-500'
                        }`}
                      >
                        <span className="font-bold text-sm">{opt.label}</span>
                        <span className="text-[10px] opacity-70">{opt.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button onClick={() => setShowSettings(false)} className="w-full mt-8 py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded transition-colors uppercase tracking-wider text-sm">
                Close
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="absolute bottom-8 text-xs text-slate-500 font-mono tracking-wider opacity-60">
        WASD: MOVE • SPACE: ATTACK • MOUSE: INTERACT
      </div>
    </div>
  );
};
