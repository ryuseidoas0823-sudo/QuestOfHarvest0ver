import React from 'react';
import { PlayerState } from '../types';

interface TownScreenProps {
  player: PlayerState;
  onDungeon: () => void;
  onShop: () => void;
  onGuild: () => void;
  onFamilia: () => void;
}

const TownScreen: React.FC<TownScreenProps> = ({ 
  player, 
  onDungeon, 
  onShop, 
  onGuild, 
  onFamilia 
}) => {
  return (
    <div className="w-full h-full relative overflow-hidden flex flex-col items-center justify-between text-white font-sans">
      
      {/* Background: 夕暮れの街並み風 (CSS) */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-slate-800 to-slate-900">
        {/* 空 */}
        <div className="absolute top-0 w-full h-1/2 bg-gradient-to-b from-indigo-900 to-orange-900/50" />
        {/* 遠景の建物シルエット */}
        <div className="absolute bottom-1/2 w-full h-32 bg-repeat-x" 
             style={{
               backgroundImage: 'linear-gradient(to top, #1a1a1a 0%, transparent 100%)',
               backgroundSize: '40px 100%'
             }} 
        />
        {/* 地面 */}
        <div className="absolute bottom-0 w-full h-1/2 bg-[#1a1a1a] border-t-4 border-orange-900/30" />
      </div>

      {/* Header */}
      <div className="relative z-10 w-full p-6 bg-gradient-to-b from-black/80 to-transparent flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-amber-500 drop-shadow-md tracking-wider">迷宮都市バベル</h2>
          <p className="text-neutral-400 text-sm">現在の時刻: 夕刻</p>
        </div>
        <div className="text-right">
           <div className="text-xl font-bold text-white">{player.name}</div>
           <div className="text-yellow-400 text-sm">Lv.{player.level} / {player.gold} G</div>
        </div>
      </div>

      {/* Main Action Menu (Center) */}
      <div className="relative z-10 w-full max-w-4xl flex-1 flex items-center justify-center p-8 gap-6">
        
        {/* 施設カード群 */}
        <div className="grid grid-cols-2 gap-4 w-full max-w-2xl">
          
          <button 
            onClick={onGuild}
            className="group relative h-32 bg-slate-800/90 border-2 border-slate-600 rounded-lg p-4 hover:bg-slate-700 hover:border-amber-400 transition-all duration-300 text-left overflow-hidden shadow-lg"
          >
            <div className="absolute right-0 bottom-0 opacity-10 group-hover:opacity-20 text-8xl font-serif">G</div>
            <div className="relative z-10">
              <h3 className="text-xl font-bold text-amber-100 group-hover:text-amber-400 mb-1">冒険者ギルド</h3>
              <p className="text-xs text-slate-300">クエスト受注 / 換金</p>
            </div>
          </button>

          <button 
            onClick={onShop}
            className="group relative h-32 bg-slate-800/90 border-2 border-slate-600 rounded-lg p-4 hover:bg-slate-700 hover:border-amber-400 transition-all duration-300 text-left overflow-hidden shadow-lg"
          >
            <div className="absolute right-0 bottom-0 opacity-10 group-hover:opacity-20 text-8xl font-serif">S</div>
            <div className="relative z-10">
              <h3 className="text-xl font-bold text-amber-100 group-hover:text-amber-400 mb-1">豊穣の市場</h3>
              <p className="text-xs text-slate-300">アイテム購入 / 装備修理</p>
            </div>
          </button>

          <button 
            onClick={onFamilia}
            className="group relative h-32 bg-slate-800/90 border-2 border-slate-600 rounded-lg p-4 hover:bg-slate-700 hover:border-amber-400 transition-all duration-300 text-left overflow-hidden shadow-lg"
          >
            <div className="absolute right-0 bottom-0 opacity-10 group-hover:opacity-20 text-8xl font-serif">F</div>
            <div className="relative z-10">
              <h3 className="text-xl font-bold text-amber-100 group-hover:text-amber-400 mb-1">ファミリアホーム</h3>
              <p className="text-xs text-slate-300">ステータス更新 / 倉庫</p>
            </div>
          </button>

          <button 
            onClick={() => {/* 設定など */}}
            className="group relative h-32 bg-slate-800/90 border-2 border-slate-600 rounded-lg p-4 hover:bg-slate-700 hover:border-amber-400 transition-all duration-300 text-left overflow-hidden shadow-lg"
          >
             <div className="absolute right-0 bottom-0 opacity-10 group-hover:opacity-20 text-8xl font-serif">O</div>
            <div className="relative z-10">
              <h3 className="text-xl font-bold text-amber-100 group-hover:text-amber-400 mb-1">オプション</h3>
              <p className="text-xs text-slate-300">設定 / セーブ</p>
            </div>
          </button>

        </div>
      </div>

      {/* Dungeon Button (Bottom) */}
      <div className="relative z-10 w-full p-8 bg-gradient-to-t from-black/90 to-transparent flex justify-center">
        <button 
          onClick={onDungeon}
          className="w-full max-w-md py-4 bg-gradient-to-r from-red-800 to-red-600 border-2 border-red-400 rounded-lg text-white font-bold text-xl tracking-widest hover:scale-105 hover:from-red-700 hover:to-red-500 shadow-[0_0_20px_rgba(220,38,38,0.5)] transition-all duration-300"
        >
          ダンジョンへ挑む
        </button>
      </div>

    </div>
  );
};

export default TownScreen;
