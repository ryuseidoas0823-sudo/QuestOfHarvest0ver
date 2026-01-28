import React, { useState } from 'react';
import { GameState } from '../types/gameState';
import { saveGame } from '../utils/storage';

interface Props {
  gameState: GameState;
  onResume: () => void;
  onReturnToTitle: () => void;
}

export const PauseMenu: React.FC<Props> = ({ gameState, onResume, onReturnToTitle }) => {
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  const handleSave = () => {
    setSaveStatus('saving');
    
    // UIフィードバックのために少し遅延を入れる
    setTimeout(() => {
      const success = saveGame(gameState);
      if (success) {
        setSaveStatus('saved');
        // 2秒後にアイドル状態に戻す
        setTimeout(() => setSaveStatus('idle'), 2000);
      } else {
        setSaveStatus('error');
        setTimeout(() => setSaveStatus('idle'), 2000);
      }
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm bg-slate-900 border-2 border-slate-600 rounded-lg shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="bg-slate-800 p-4 border-b border-slate-700 text-center">
          <h2 className="text-2xl font-bold text-white tracking-widest">PAUSE</h2>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          
          <button 
            onClick={onResume}
            className="w-full py-3 bg-blue-700 hover:bg-blue-600 text-white font-bold rounded transition-colors shadow-lg border border-blue-500"
          >
            再開する (Resume)
          </button>

          <button 
            onClick={handleSave}
            disabled={saveStatus !== 'idle'}
            className={`w-full py-3 font-bold rounded transition-colors shadow-lg border flex items-center justify-center gap-2 ${
              saveStatus === 'saved' 
                ? 'bg-green-700 border-green-500 text-white' 
                : saveStatus === 'error'
                ? 'bg-red-700 border-red-500 text-white'
                : 'bg-slate-700 hover:bg-slate-600 border-slate-500 text-slate-200'
            }`}
          >
            {saveStatus === 'idle' && (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                セーブする (Save)
              </>
            )}
            {saveStatus === 'saving' && '保存中...'}
            {saveStatus === 'saved' && '保存しました！'}
            {saveStatus === 'error' && '保存失敗'}
          </button>

          <div className="border-t border-slate-700 my-4"></div>

          <button 
            onClick={onReturnToTitle}
            className="w-full py-3 bg-red-900/50 hover:bg-red-900 text-red-200 font-bold rounded transition-colors border border-red-900 hover:border-red-500"
          >
            タイトルへ戻る
          </button>
        </div>

      </div>
    </div>
  );
};
