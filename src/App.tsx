import React, { useState, useEffect, useRef } from 'react';
import TitleScreen from './components/TitleScreen';
import JobSelectScreen from './components/JobSelectScreen';
import GodSelectScreen from './components/GodSelectScreen'; // 追加
import GameHUD from './components/GameHUD';
import InventoryMenu from './components/InventoryMenu';
import { GameState } from './types';
import { JobId } from './types/job';
import { createInitialPlayer } from './gameLogic';

// ゲームの状態遷移に 'godSelect' を追加
type AppPhase = 'title' | 'jobSelect' | 'godSelect' | 'game' | 'gameOver';

function App() {
  const [phase, setPhase] = useState<AppPhase>('title');
  const [gameState, setGameState] = useState<GameState | null>(null);
  
  // 選択データの一時保持
  const [selectedJob, setSelectedJob] = useState<JobId | null>(null);
  const [selectedGod, setSelectedGod] = useState<string | null>(null);
  
  // インベントリの開閉状態
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);

  // 職業選択完了ハンドラ
  const handleJobSelect = (jobId: JobId) => {
    setSelectedJob(jobId);
    setPhase('godSelect'); // 次のフェーズへ
  };

  // 神選択完了→ゲーム開始ハンドラ
  const handleGodSelect = (godId: string) => {
    setSelectedGod(godId);
    if (selectedJob) {
      startGame(selectedJob, godId);
    }
  };

  // ゲーム開始処理（引数を更新）
  const startGame = (jobId: JobId, godId: string) => {
    const startPos = { x: 5, y: 5 };
    
    // 神IDを渡してプレイヤー生成
    const player = createInitialPlayer(jobId, godId, startPos);

    const initialState: GameState = {
      player: player,
      enemies: [],
      items: [],
      inventory: ['potion_small', 'potion_small', 'rusty_sword'],
      map: {
        width: 50,
        height: 50,
        tiles: [],
        rooms: []
      },
      gameTime: 0,
      floor: 1,
      messages: [
        '迷宮に入った...', 
        'Iキーでインベントリを開けます。',
        'WASDまたは矢印キーで移動。'
      ],
      camera: { x: 0, y: 0 }
    };

    setGameState(initialState);
    setPhase('game');
    setIsInventoryOpen(false);
  };

  // キー入力イベントハンドラ（インベントリ開閉用）
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (phase !== 'game') return;

      if (e.key === 'i' || e.key === 'I') {
        setIsInventoryOpen(prev => !prev);
      }
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

    setGameState(prev => {
      if (!prev) return null;
      
      const newInventory = [...(prev.inventory || [])];
      const index = newInventory.indexOf(itemId);
      if (index > -1) {
        newInventory.splice(index, 1);
      }

      return {
        ...prev,
        inventory: newInventory,
        messages: [`${itemId} を使用した！`, ...prev.messages].slice(0, 10)
      };
    });
  };

  return (
    <div className="App w-full h-screen overflow-hidden bg-black text-white font-sans relative">
      {phase === 'title' && (
        <TitleScreen onStart={() => setPhase('jobSelect')} />
      )}

      {phase === 'jobSelect' && (
        <JobSelectScreen onSelectJob={handleJobSelect} />
      )}

      {phase === 'godSelect' && (
        <GodSelectScreen 
          onSelectGod={handleGodSelect} 
          onBack={() => setPhase('jobSelect')}
        />
      )}

      {phase === 'game' && gameState && (
        <>
          {/* メインゲーム描画エリア */}
          <div id="game-container" className="relative w-full h-full bg-gray-900">
            {/* プレイヤーの描画（デバッグ用） */}
            <div 
              className="absolute w-10 h-10 rounded-full flex items-center justify-center transition-all duration-100 shadow-lg border-2 border-white"
              style={{ 
                left: '50%', 
                top: '50%', 
                transform: 'translate(-50%, -50%)',
                backgroundColor: gameState.player.color || '#00ff00' // 神のカラーを反映
              }}
            >
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
