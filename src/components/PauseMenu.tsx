import React from 'react';

interface PauseMenuProps {
  onResume: () => void;
  onRetire: () => void;
}

export const PauseMenu: React.FC<PauseMenuProps> = ({ onResume, onRetire }) => {
  return (
    <div className="absolute inset-0 bg-black/80 z-50 flex flex-col items-center justify-center text-white backdrop-blur-sm">
      <h2 className="text-4xl font-bold mb-8 text-yellow-500 tracking-widest border-b-2 border-yellow-500 pb-2">
        PAUSE
      </h2>

      <div className="flex gap-12 mb-10">
        {/* 操作説明セクション */}
        <div className="bg-gray-800/80 p-6 rounded-lg border border-gray-600 shadow-lg">
          <h3 className="text-xl font-bold mb-4 text-blue-300 text-center">🎮 操作方法</h3>
          <ul className="space-y-3 text-sm">
            <li className="flex justify-between w-64 border-b border-gray-700 pb-1">
              <span className="text-gray-400">移動 / 攻撃</span>
              <span className="font-mono font-bold text-yellow-200">↑ ↓ ← →</span>
            </li>
            <li className="flex justify-between w-64 border-b border-gray-700 pb-1">
              <span className="text-gray-400">スキル使用</span>
              <span className="font-mono font-bold text-yellow-200">1, 2, 3, 4</span>
            </li>
            <li className="flex justify-between w-64 border-b border-gray-700 pb-1">
              <span className="text-gray-400">インベントリ</span>
              <span className="font-mono font-bold text-yellow-200">I (アイ)</span>
            </li>
            <li className="flex justify-between w-64 border-b border-gray-700 pb-1">
              <span className="text-gray-400">ポーズ / 戻る</span>
              <span className="font-mono font-bold text-yellow-200">Esc</span>
            </li>
          </ul>
        </div>

        {/* ゲーム情報セクション（将来的に拡張可能） */}
        <div className="bg-gray-800/80 p-6 rounded-lg border border-gray-600 shadow-lg flex flex-col items-center justify-center w-64">
           <p className="text-gray-400 mb-2">現在の目的</p>
           <p className="text-lg font-bold text-white mb-4">ダンジョン深層へ</p>
           <p className="text-xs text-gray-500">※ オートセーブ対応</p>
        </div>
      </div>

      <div className="flex flex-col space-y-4 w-64">
        <button
          onClick={onResume}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded font-bold text-white shadow-lg transition-transform transform hover:scale-105"
        >
          ゲームに戻る
        </button>
        <button
          onClick={() => {
            if (window.confirm('街に戻りますか？（進行状況はセーブされます）')) {
              onRetire();
            }
          }}
          className="px-6 py-3 bg-red-800 hover:bg-red-700 rounded font-bold text-gray-200 border border-red-600 hover:text-white transition-colors"
        >
          街へ帰還する
        </button>
      </div>
    </div>
  );
};
