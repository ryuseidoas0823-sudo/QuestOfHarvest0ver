import React from 'react';

interface PauseMenuProps {
  onResume: () => void;
  onTitle: () => void; // 追加
}

const PauseMenu: React.FC<PauseMenuProps> = ({ onResume, onTitle }) => {
  return (
    <div className="flex flex-col items-center gap-4 bg-neutral-900 border border-neutral-600 p-8 rounded shadow-2xl min-w-[300px]">
      <h2 className="text-2xl font-bold text-neutral-300 mb-2">PAUSE</h2>
      
      <button 
        onClick={onResume}
        className="w-full py-3 bg-neutral-800 hover:bg-neutral-700 border border-neutral-600 rounded text-lg transition-colors"
      >
        再開する
      </button>

      <button 
        onClick={onTitle}
        className="w-full py-3 bg-neutral-800 hover:bg-neutral-700 border border-neutral-600 rounded text-lg transition-colors text-red-300 hover:text-red-200"
      >
        タイトルに戻る
      </button>
    </div>
  );
};

export default PauseMenu;
