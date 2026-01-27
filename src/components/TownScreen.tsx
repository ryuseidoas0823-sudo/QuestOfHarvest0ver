import React, { useEffect } from 'react';
import { GameState } from '../types/gameState';

interface TownScreenProps {
  gameState: GameState;
  onStartDungeon: () => void;
  onSave: () => void;
  onRefillPotions: () => void; // 追加
}

const TownScreen: React.FC<TownScreenProps> = ({ gameState, onStartDungeon, onSave, onRefillPotions }) => {
  
  // 街に戻ってきたらポーションを補充
  useEffect(() => {
    onRefillPotions();
  }, [onRefillPotions]);

  return (
    <div className="relative w-full h-full bg-slate-900 flex flex-col items-center justify-center text-white">
        {/* 背景画像があればここに */}
        <div className="absolute inset-0 bg-[url('/town-bg.png')] bg-cover opacity-50" />
        
        <div className="relative z-10 bg-slate-800/90 p-8 rounded-xl border-4 border-slate-600 shadow-2xl max-w-2xl w-full text-center">
            <h2 className="text-3xl font-bold mb-2 text-amber-400">冒険者の拠点 オラリオ</h2>
            <p className="text-slate-300 mb-8">次の冒険の準備を整えよう</p>

            <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-slate-700/50 p-4 rounded border border-slate-600">
                    <h3 className="text-lg font-bold text-blue-300 mb-2">ステータス</h3>
                    <div className="text-left font-mono text-sm space-y-1">
                        <p>Name: {gameState.player.name}</p>
                        <p>Level: {gameState.player.level}</p>
                        <p>Gold: {gameState.player.gold} G</p>
                    </div>
                </div>
                <div className="bg-slate-700/50 p-4 rounded border border-slate-600">
                     <h3 className="text-lg font-bold text-green-300 mb-2">補給完了</h3>
                     <p className="text-sm text-slate-300">
                        クイックポーションが<br/>
                        最大数({gameState.player.quickPotion?.max})まで補充されました。
                     </p>
                </div>
            </div>

            <div className="space-y-3">
                <button 
                    onClick={onStartDungeon}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 px-6 rounded-lg transition-colors border-b-4 border-blue-800 active:border-b-0 active:translate-y-1"
                >
                    ダンジョンへ挑む
                </button>
                
                <div className="grid grid-cols-2 gap-3">
                    <button className="bg-slate-600 hover:bg-slate-500 text-white font-bold py-3 px-4 rounded-lg transition-colors border-b-4 border-slate-800">
                        武具店 (未実装)
                    </button>
                    <button 
                        onClick={onSave}
                        className="bg-amber-700 hover:bg-amber-600 text-white font-bold py-3 px-4 rounded-lg transition-colors border-b-4 border-amber-900"
                    >
                        セーブして中断
                    </button>
                </div>
            </div>
        </div>
    </div>
  );
};

export default TownScreen;
