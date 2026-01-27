import React, { useState } from 'react';
import { GameState } from '../types/gameState';
import { Map, ShoppingBag, Bed, Tent, User, Trophy, PlayCircle } from 'lucide-react';
import ShopMenu from './ShopMenu';
import StatusUpgradeMenu from './StatusUpgradeMenu';
import SkillTreeMenu from './SkillTreeMenu';
import JobSelectScreen from './JobSelectScreen';
import GodSelectScreen from './GodSelectScreen'; // 仮定：神選択画面がある場合

interface TownScreenProps {
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
  onStartDungeon: () => void;
  addLog: (text: string, type?: 'info' | 'success' | 'warning' | 'danger') => void;
}

const TownScreen: React.FC<TownScreenProps> = ({ gameState, setGameState, onStartDungeon, addLog }) => {
  const [activeMenu, setActiveMenu] = useState<'none' | 'shop' | 'status' | 'skills' | 'job' | 'god'>('none');
  const { player } = gameState;

  // 宿屋（回復）処理
  const handleRest = () => {
    const cost = player.level * 10;
    if (player.gold >= cost) {
      setGameState(prev => ({
        ...prev,
        player: {
          ...prev.player,
          gold: prev.player.gold - cost,
          hp: prev.player.maxHp,
          mp: prev.player.maxMp
        }
      }));
      addLog(`宿屋で休みました。HPとMPが全回復しました！ (-${cost} G)`, 'success');
    } else {
      addLog('金貨が足りません！', 'warning');
    }
  };

  // メニューレンダリング
  if (activeMenu === 'shop') {
    return <ShopMenu gameState={gameState} setGameState={setGameState} onClose={() => setActiveMenu('none')} addLog={addLog} />;
  }
  
  if (activeMenu === 'status') {
    return <StatusUpgradeMenu gameState={gameState} setGameState={setGameState} onClose={() => setActiveMenu('none')} />;
  }

  if (activeMenu === 'skills') {
    return <SkillTreeMenu gameState={gameState} setGameState={setGameState} onClose={() => setActiveMenu('none')} />;
  }

  if (activeMenu === 'job') {
      // 転職画面があればここで表示（今回はプレースホルダー）
      return (
        <div className="absolute inset-0 bg-slate-900 flex items-center justify-center z-20">
            <div className="text-white">Job Change Screen (Not Implemented yet in this flow)</div>
            <button onClick={() => setActiveMenu('none')} className="mt-4 px-4 py-2 bg-slate-700 rounded">Close</button>
        </div>
      );
  }

  return (
    <div className="relative w-full h-full bg-slate-900 overflow-hidden select-none">
      {/* Background Image (Placeholder) */}
      <div className="absolute inset-0 opacity-30 bg-[url('https://images.unsplash.com/photo-1519074069444-1ba4fff66d16?q=80&w=2574&auto=format&fit=crop')] bg-cover bg-center" />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start z-10">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1 flex items-center gap-3">
            <Map className="text-yellow-500" /> Orario Town
          </h1>
          <p className="text-slate-400">冒険の拠点</p>
        </div>
        
        <div className="bg-black/50 backdrop-blur-md p-4 rounded-lg border border-slate-700 flex flex-col gap-2 min-w-[200px]">
          <div className="flex justify-between items-center text-white font-bold">
            <span>{player.name}</span>
            <span className="text-yellow-400">Lv.{player.level}</span>
          </div>
          <div className="flex justify-between items-center text-sm text-slate-300">
             <span>Gold</span>
             <span className="text-yellow-400 font-mono">{player.gold} G</span>
          </div>
          <div className="w-full h-px bg-slate-700 my-1" />
          <div className="flex justify-between text-xs text-slate-400">
            <span>HP: {player.hp}/{player.maxHp}</span>
            <span>MP: {player.mp}/{player.maxMp}</span>
          </div>
        </div>
      </div>

      {/* Main Action Buttons */}
      <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
        <div className="grid grid-cols-2 gap-6 pointer-events-auto max-w-4xl w-full px-12">
          
          {/* Dungeon */}
          <button
            onClick={onStartDungeon}
            className="col-span-2 group relative h-32 bg-red-900/40 hover:bg-red-900/60 border border-red-500/30 hover:border-red-500 rounded-xl flex items-center justify-center gap-4 transition-all overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-500/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
            <PlayCircle size={48} className="text-red-400 group-hover:scale-110 transition-transform" />
            <div className="text-left">
              <div className="text-2xl font-bold text-white group-hover:text-red-200">ダンジョンへ挑む</div>
              <div className="text-red-300/70">Enter the Dungeon</div>
            </div>
          </button>

          {/* Shop */}
          <button
            onClick={() => setActiveMenu('shop')}
            className="h-24 bg-slate-800/60 hover:bg-slate-700/80 border border-slate-600 hover:border-yellow-500 rounded-xl flex items-center px-6 gap-4 transition-all"
          >
            <div className="p-3 bg-yellow-900/30 rounded-full text-yellow-500">
              <ShoppingBag size={28} />
            </div>
            <div className="text-left">
              <div className="text-lg font-bold text-white">雑貨屋</div>
              <div className="text-xs text-slate-400">装備とアイテムの売買</div>
            </div>
          </button>

          {/* Inn */}
          <button
            onClick={handleRest}
            className="h-24 bg-slate-800/60 hover:bg-slate-700/80 border border-slate-600 hover:border-green-500 rounded-xl flex items-center px-6 gap-4 transition-all"
          >
            <div className="p-3 bg-green-900/30 rounded-full text-green-500">
              <Bed size={28} />
            </div>
            <div className="text-left">
              <div className="text-lg font-bold text-white">宿屋で休む</div>
              <div className="text-xs text-slate-400">HP・MP全回復 ({player.level * 10} G)</div>
            </div>
          </button>

          {/* Status & Skills */}
          <button
            onClick={() => setActiveMenu('status')}
            className="h-24 bg-slate-800/60 hover:bg-slate-700/80 border border-slate-600 hover:border-blue-500 rounded-xl flex items-center px-6 gap-4 transition-all"
          >
            <div className="p-3 bg-blue-900/30 rounded-full text-blue-500">
              <User size={28} />
            </div>
            <div className="text-left">
              <div className="text-lg font-bold text-white">ステータス</div>
              <div className="text-xs text-slate-400">能力値の確認と強化</div>
            </div>
          </button>

          <button
            onClick={() => setActiveMenu('skills')}
            className="h-24 bg-slate-800/60 hover:bg-slate-700/80 border border-slate-600 hover:border-purple-500 rounded-xl flex items-center px-6 gap-4 transition-all"
          >
            <div className="p-3 bg-purple-900/30 rounded-full text-purple-500">
              <Trophy size={28} />
            </div>
            <div className="text-left">
              <div className="text-lg font-bold text-white">スキルツリー</div>
              <div className="text-xs text-slate-400">スキルの習得と強化</div>
            </div>
          </button>

        </div>
      </div>
    </div>
  );
};

export default TownScreen;
