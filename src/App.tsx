import React, { useState, useEffect, useRef } from 'react';
import TitleScreen from './components/TitleScreen';
import JobSelectScreen from './components/JobSelectScreen';
import GameHUD from './components/GameHUD';
import InventoryMenu from './components/InventoryMenu';
import { GameState, Direction, Item } from './types';
import { JobId } from './types/job';
import { createInitialPlayer } from './gameLogic';
// ... existing imports ...

// ゲームの状態遷移
type AppPhase = 'title' | 'jobSelect' | 'game' | 'gameOver';

function App() {
  const [phase, setPhase] = useState<AppPhase>('title');
  const [gameState, setGameState] = useState<GameState | null>(null);
  
  // 選択された職業を一時保持
  const [selectedJob, setSelectedJob] = useState<JobId | null>(null);

  // ゲーム開始処理
  const startGame = (jobId: JobId) => {
    setSelectedJob(jobId);
    
    // 初期マップ生成などのロジック（既存のものを使用）
    // ここでは仮の初期位置
    const startPos = { x: 5, y: 5 };
    
    // データ駆動でプレイヤー生成
    const player = createInitialPlayer(jobId, startPos);

    // 初期ゲーム状態の構築
    const initialState: GameState = {
      player: player,
      enemies: [], // generateDungeonなどで生成
      items: [],
      map: {
        width: 50,
        height: 50,
        tiles: [], // generateDungeonなどで生成
        rooms: []
      },
      gameTime: 0,
      floor: 1,
      messages: ['迷宮に入った...'],
      camera: { x: 0, y: 0 }
    };

    // ※ここで既存のダンジョン生成ロジックを呼び出して map と tiles を埋める必要があります
    // generateDungeon(initialState); 

    setGameState(initialState);
    setPhase('game');
  };

  // ... existing code (useEffect for game loop, input handling, etc.) ...

  return (
    <div className="App w-full h-screen overflow-hidden bg-black text-white font-sans">
      {phase === 'title' && (
        <TitleScreen onStart={() => setPhase('jobSelect')} />
      )}

      {phase === 'jobSelect' && (
        <JobSelectScreen onSelectJob={startGame} />
      )}

      {phase === 'game' && gameState && (
        <>
          {/* メインゲーム描画エリア (Canvasなど) */}
          <div id="game-container" className="relative w-full h-full">
            {/* ここに Renderer コンポーネントなどを配置 */}
            {/* <GameRenderer gameState={gameState} /> */}
            
            <GameHUD 
              player={gameState.player} 
              floor={gameState.floor}
              messages={gameState.messages}
            />
          </div>
          
          {/* インベントリなどのオーバーレイUI */}
          {/* <InventoryMenu ... /> */}
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
