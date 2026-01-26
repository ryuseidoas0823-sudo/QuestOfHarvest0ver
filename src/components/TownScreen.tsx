import React from 'react';

interface TownScreenProps {
  onEnterDungeon: () => void;
  onOpenShop: () => void;
  onOpenStatus: () => void;
  onSave: () => void; // App.tsxでonHealAtInnが渡されているため、実質「宿屋」として機能
}

const TownScreen: React.FC<TownScreenProps> = ({ 
  onEnterDungeon, 
  onOpenShop, 
  onOpenStatus, 
  onSave 
}) => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-neutral-900 text-white font-sans relative overflow-hidden">
      {/* 背景装飾（簡易） */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-neutral-800 via-black to-black opacity-50" />
      
      <div className="relative z-10 flex flex-col items-center gap-8 animate-fade-in w-full max-w-lg px-4">
        
        {/* タイトル */}
        <div className="text-center">
          <h2 className="text-4xl font-bold tracking-widest text-yellow-500 drop-shadow-md mb-2">
            迷宮都市
          </h2>
          <p className="text-neutral-400 text-sm">
            冒険の準備を整えよう
          </p>
        </div>

        {/* メニューボタン */}
        <div className="flex flex-col gap-4 w-full">
          
          <button
            onClick={onEnterDungeon}
            className="w-full py-4 bg-gradient-to-r from-red-900 to-red-800 hover:from-red-800 hover:to-red-700 border border-red-700 rounded shadow-lg text-xl font-bold transition-transform transform hover:scale-105 flex items-center justify-center gap-2 group"
          >
            <span>⚔️</span>
            <span className="group-hover:text-red-200">ダンジョンへ挑む</span>
          </button>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={onOpenShop}
              className="py-3 bg-neutral-800 hover:bg-neutral-700 border border-neutral-600 rounded text-neutral-200 font-medium transition-colors flex flex-col items-center gap-1"
            >
              <span className="text-xl">💰</span>
              <span>道具屋</span>
            </button>

            <button
              onClick={onOpenStatus}
              className="py-3 bg-neutral-800 hover:bg-neutral-700 border border-neutral-600 rounded text-neutral-200 font-medium transition-colors flex flex-col items-center gap-1"
            >
              <span className="text-xl">💪</span>
              <span>ステータス</span>
            </button>
          </div>

          <button
            onClick={onSave}
            className="w-full py-3 bg-blue-900/50 hover:bg-blue-800/50 border border-blue-800 rounded text-blue-200 font-medium transition-colors flex items-center justify-center gap-2"
          >
            <span>🛏️</span>
            <span>宿屋で休む (全回復)</span>
          </button>

        </div>

        {/* フッター情報 */}
        <div className="mt-4 p-4 bg-black/50 rounded border border-neutral-800 w-full text-center">
          <p className="text-xs text-neutral-500">
            ※ 宿屋に泊まるとHP・SPが全回復します
          </p>
        </div>

      </div>
    </div>
  );
};

export default TownScreen;
