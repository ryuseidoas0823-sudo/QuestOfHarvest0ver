import React from 'react';
import { ResolutionMode } from '../types';
import { loadFromCloud } from '../utils/storage';
import { auth } from '../utils/firebase';

export interface TitleScreenProps {
  onStart: () => void;
  onContinue: () => void;
  canContinue: boolean;
  resolution: ResolutionMode;
  setResolution: (mode: ResolutionMode) => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({ 
    onStart, 
    onContinue, 
    canContinue,
    resolution,
    setResolution
}) => {
  const handleCloudLoad = async () => {
    if (!auth?.currentUser) {
      alert("クラウド機能を利用するにはオンラインである必要があります。");
      return;
    }
    const data = await loadFromCloud();
    if (data) {
      // ローカルストレージを上書きしてリロードさせるのが一番簡単だが、
      // ここではonContinueを呼ぶ前にローカルを更新する
      const jsonStr = JSON.stringify(data);
      localStorage.setItem('quest_of_harvest_save_v1', btoa(jsonStr));
      alert("クラウドからセーブデータを復元しました。");
      onContinue();
    } else {
      alert("クラウド上のセーブデータが見つかりませんでした。");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-8 animate-fade-in text-center p-8 w-full max-w-3xl">
      <div className="space-y-2">
        <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 via-yellow-500 to-yellow-700 drop-shadow-lg tracking-wider" style={{ fontFamily: '"Cinzel", serif' }}>
          Quest of Harvest
        </h1>
        <p className="text-xl text-gray-400 tracking-widest uppercase border-t border-gray-700 pt-4 mt-4">
          Oratorio of the Infinite Tower
        </p>
      </div>

      <div className="flex flex-col space-y-4 w-64">
        <button 
          onClick={onStart}
          className="group relative px-8 py-4 bg-gradient-to-r from-blue-900 to-blue-800 rounded border border-blue-500 hover:from-blue-800 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-[0_0_15px_rgba(59,130,246,0.5)]"
        >
          <span className="text-xl font-bold text-white tracking-widest group-hover:text-yellow-200">NEW GAME</span>
          <div className="absolute inset-0 rounded border-2 border-white opacity-0 group-hover:opacity-20 animate-pulse"></div>
        </button>

        {canContinue && (
          <button 
            onClick={onContinue}
            className="group relative px-8 py-4 bg-gradient-to-r from-green-900 to-green-800 rounded border border-green-500 hover:from-green-800 hover:to-green-700 transition-all duration-300 transform hover:scale-105 shadow-[0_0_15px_rgba(34,197,94,0.5)]"
          >
            <span className="text-xl font-bold text-white tracking-widest group-hover:text-yellow-200">CONTINUE</span>
          </button>
        )}

        {/* Cloud Load Button */}
        <button 
          onClick={handleCloudLoad}
          className="px-8 py-2 bg-gray-800 hover:bg-gray-700 rounded border border-gray-600 text-gray-300 text-sm transition-colors flex items-center justify-center gap-2"
        >
          <span>☁️</span> Cloud Load
        </button>
        
        {/* 解像度設定 (簡易UI) */}
        <div className="flex items-center justify-between bg-gray-800 p-2 rounded border border-gray-700 mt-4">
            <span className="text-xs text-gray-400">GRAPHICS:</span>
            <select 
                value={resolution} 
                onChange={(e) => setResolution(e.target.value as ResolutionMode)}
                className="bg-gray-700 text-white text-xs p-1 rounded border border-gray-600 outline-none"
            >
                <option value="low">Low (Light)</option>
                <option value="standard">Standard</option>
                <option value="high">High (Quality)</option>
            </select>
        </div>
      </div>

      <div className="text-xs text-gray-500 mt-12">
        <p>© 2026 Quest of Harvest Project. All Rights Reserved.</p>
        <p>Ver 1.0.0 Release</p>
      </div>
    </div>
  );
};
