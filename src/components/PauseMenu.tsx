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
          
          <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
            {/* Keyboard */}
            <div className="col-span-2 text-center text-xs text-gray-500 border-b border-gray-700 pb-1 mb-2">
              KEYBOARD
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">移動</span>
              <span className="font-mono text-white">矢印キー</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">決定/攻撃</span>
              <span className="font-mono text-white">Enter</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">スキル</span>
              <span className="font-mono text-white">1-4</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">メニュー</span>
              <span className="font-mono text-white">I (アイ)</span>
            </div>

            {/* Controller */}
            <div className="col-span-2 text-center text-xs text-gray-500 border-b border-gray-700 pb-1 mb-2 mt-4">
              CONTROLLER
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">移動</span>
              <span className="font-mono text-yellow-200">十字キー/Lスティック</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">決定/攻撃</span>
              <span className="font-mono text-yellow-200">A / ×</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">戻る/キャンセル</span>
              <span className="font-mono text-yellow-200">B / ○</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">スキル</span>
              <span className="font-mono text-yellow-200">X / Y / L / R</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">メニュー</span>
              <span className="font-mono text-yellow-200">Y / △</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">ポーズ</span>
              <span className="font-mono text-yellow-200">Start / Options</span>
            </div>
          </div>
        </div>

        {/* ゲーム情報セクション */}
        <div className="bg-gray-800/80 p-6 rounded-lg border border-gray-600 shadow-lg flex flex-col items-center justify-center w-64">
           <p className="text-gray-400 mb-2">現在の目的</p>
           <p className="text-lg font-bold text-white mb-4">ダンジョン深層へ</p>
           <div className="text-xs text-gray-500 mt-4 text-center">
             <p>コントローラー接続:</p>
             <p className="text-green-400 animate-pulse">
               {navigator.getGamepads()[0] ? "接続済み" : "未接続"}
             </p>
           </div>
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
