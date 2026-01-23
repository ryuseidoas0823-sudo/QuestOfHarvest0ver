import React, { useState, useEffect, useRef } from 'react';
import TitleScreen from './components/TitleScreen';
import JobSelectScreen from './components/JobSelectScreen';
import GameHUD from './components/GameHUD';
import InventoryMenu from './components/InventoryMenu';
import { GameState } from './types';
import { JobId } from './types/job';
import { createInitialPlayer } from './gameLogic';
// import { generateDungeon } from './utils'; // 必要に応じてutilsからインポート

// ゲームの状態遷移
type AppPhase = 'title' | 'jobSelect' | 'game' | 'gameOver';

function App() {
  const [phase, setPhase] = useState<AppPhase>('title');
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [selectedJob, setSelectedJob] = useState<JobId | null>(null);
  
  // インベントリの開閉状態
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);

  // ゲーム開始処理
  const startGame = (jobId: JobId) => {
    setSelectedJob(jobId);
    
    const startPos = { x: 5, y: 5 };
    const player = createInitialPlayer(jobId, startPos);

    // 初期ゲーム状態
    // ※ GameState型に inventory プロパティを追加する必要があります (後述のtypes.ts修正で対応想定)
    const initialState: GameState = {
      player: player,
      enemies: [],
      items: [], // マップに落ちているアイテム
      inventory: ['potion_small', 'potion_small', 'rusty_sword'], // 初期所持品（テスト用）
      map: {
        width: 50,
        height: 50,
        tiles: [],
        rooms: []
      },
      gameTime: 0,
      floor: 1,
      messages: ['迷宮に入った...', 'Iキーでインベントリを開けます。'],
      camera: { x: 0, y: 0 }
    };

    // 本来はここでダンジョン生成を行う
    // initialState = generateDungeon(initialState);

    setGameState(initialState);
    setPhase('game');
    setIsInventoryOpen(false);
  };

  // キー入力イベントハンドラ（インベントリ開閉用）
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (phase !== 'game') return;

      // 'I' キーでインベントリ開閉
      if (e.key === 'i' || e.key === 'I') {
        setIsInventoryOpen(prev => !prev);
      }
      
      // ESCキーでインベントリを閉じる
      if (e.key === 'Escape' && isInventoryOpen) {
        setIsInventoryOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [phase, isInventoryOpen]);

  // アイテム使用処理
  const handleUseItem = (itemId: string) => {
    if (!gameState) return;

    // TODO: ここで itemId に基づいて効果を発動させる (src/data/items.tsを参照)
    // 今回は簡易的に「使用してなくなる」処理のみ実装

    setGameState(prev => {
      if (!prev) return null;
      
      // インベントリからアイテムを1つ削除
      const newInventory = [...(prev.inventory || [])];
      const index = newInventory.indexOf(itemId);
      if (index > -1) {
        newInventory.splice(index, 1);
      }

      return {
        ...prev,
        inventory: newInventory,
        messages: [`${itemId} を使用した！`, ...prev.messages].slice(0, 10) // ログは最新10件まで
      };
    });
  };

  return (
    <div className="App w-full h-screen overflow-hidden bg-black text-white font-sans relative">
      {phase === 'title' && (
        <TitleScreen onStart={() => setPhase('jobSelect')} />
      )}

      {phase === 'jobSelect' && (
        <JobSelectScreen onSelectJob={startGame} />
      )}

      {phase === 'game' && gameState && (
        <>
          {/* メインゲーム描画エリア */}
          <div id="game-container" className="relative w-full h-full bg-gray-900">
            {/* プレイヤーの描画（簡易デバッグ用） */}
            <div 
              className="absolute w-10 h-10 bg-green-500 rounded-full flex items-center justify-center transition-all duration-100"
              style={{ 
                left: '50%', 
                top: '50%', 
                transform: 'translate(-50%, -50%)' 
              }}
            >
               {/* 実際は gameState.camera を考慮して描画位置を計算する必要があります */}
               P
            </div>
            
            <div className="absolute top-1/2 left-1/2 mt-8 text-center text-gray-500 transform -translate-x-1/2">
              (Game Rendering Area)
            </div>

            <GameHUD 
              player={gameState.player} 
              floor={gameState.floor}
              messages={gameState.messages}
            />
          </div>
          
          {/* インベントリメニュー */}
          {isInventoryOpen && (
            <InventoryMenu 
              inventory={gameState.inventory || []}
              onClose={() => setIsInventoryOpen(false)}
              onUseItem={handleUseItem}
            />
          )}
        </>
      )}

      {phase === 'gameOver' && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-80 z-50">
          <div className="text-center">
            <h2 className="text-5xl text-red-600 font-bold mb-4">GAME OVER</h2>
            <button 
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded text-xl"
              onClick={() => setPhase('title')}
            >
              タイトルへ戻る
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
