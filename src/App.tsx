import React, { useState, useEffect, useRef } from 'react';
import { TitleScreen } from './components/TitleScreen';
import { GodSelectScreen } from './components/GodSelectScreen';
import { JobSelectScreen } from './components/JobSelectScreen';
import { TownScreen } from './components/TownScreen'; // 追加
import { GameHUD } from './components/GameHUD';
import { InventoryMenu } from './components/InventoryMenu';
import { GODS, GodId } from './data/gods';
import { JOBS, JobId } from './data/jobs';
import { GameScreen, Position, Direction, Stats, Entity, Item, GameState as GameDataType } from './types'; // 型インポート修正
import { useGameLoop } from './gameLogic';
import { renderer } from './renderer';
import { generateDungeon } from './dungeonGenerator';
import { ENEMIES } from './data/enemies';

// ... existing code ...

function App() {
  // GameScreen型を使用するように変更
  const [gameState, setGameState] = useState<GameScreen>('title');
  const [selectedGod, setSelectedGod] = useState<GodId>('warrior_god');
  const [selectedJob, setSelectedJob] = useState<JobId>('warrior');
  
    // プレイヤーの初期化
  const handleJobSelect = (jobId: JobId) => {
    setSelectedJob(jobId);
    
    // プレイヤーの初期化
    const job = JOBS[jobId];
    if (job) {
      setPlayerStats({
        ...job.baseStats,
        maxHp: job.baseStats.hp,
        exp: 0,
        level: 1,
        skillPoints: 0,
        nextLevelExp: 100, // 追加
        speed: job.baseStats.speed || 4, // デフォルト値
      });
    }
    
    // 職選択後は「街」へ移動する
    setGameState('town');
  };

  // 街からダンジョンへ出発する処理
  const handleGoToDungeon = () => {
    startGame();
  };

  const startGame = () => {
    // ダンジョン生成と初期配置
    const newDungeon = generateDungeon(1);
    setDungeon(newDungeon);
    
    // プレイヤー位置を最初の部屋の中心に
    const startRoom = newDungeon.rooms[0];
    const startX = startRoom.x + Math.floor(startRoom.width / 2);
    const startY = startRoom.y + Math.floor(startRoom.height / 2);
    
    setPlayerPos({ x: startX, y: startY });
    setCurrentFloor(1);
    setGameLog(['ダンジョンに到達した。', '探索を開始する。']);
    setGameState('playing');
  };

  // ... existing code ...

  return (
    <div className="relative w-screen h-screen bg-black overflow-hidden select-none font-sans">
      {gameState === 'title' && (
        <TitleScreen onStart={() => setGameState('godSelect')} />
      )}

      {gameState === 'godSelect' && (
        <GodSelectScreen 
          onSelect={handleGodSelect} 
          onBack={() => setGameState('title')}
        />
      )}

      {gameState === 'jobSelect' && (
        <JobSelectScreen 
          onSelect={handleJobSelect}
          onBack={() => setGameState('godSelect')}
        />
      )}

      {/* 街画面の追加 */}
      {gameState === 'town' && (
        <TownScreen 
          onGoToDungeon={handleGoToDungeon}
          onBackToTitle={() => setGameState('title')}
        />
      )}

      {gameState === 'playing' && (
        <>
          <div ref={containerRef} className="absolute inset-0" />
          <GameHUD 
            playerStats={playerStats}
            currentFloor={currentFloor}
            godId={selectedGod}
            jobId={selectedJob}
            gameLog={gameLog}
            onOpenInventory={() => setIsInventoryOpen(true)}
          />
          {isInventoryOpen && (
            <InventoryMenu 
              items={inventory} 
              onClose={() => setIsInventoryOpen(false)} 
              onUseItem={handleUseItem}
            />
          )}
        </>
      )}

      {/* ... existing code ... */}
      {gameState === 'gameOver' && (
        <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-white z-50">
          <h1 className="text-6xl font-bold text-red-600 mb-8">YOU DIED</h1>
          <p className="text-xl mb-8">到達階層: {currentFloor}階</p>
          <button 
            onClick={() => setGameState('title')}
            className="px-8 py-3 bg-white text-black font-bold text-xl rounded hover:bg-gray-200"
          >
            タイトルへ戻る
          </button>
        </div>
      )}

      {gameState === 'gameClear' && (
         <div className="absolute inset-0 bg-white/90 flex flex-col items-center justify-center text-black z-50">
          <h1 className="text-6xl font-bold text-yellow-600 mb-8">GAME CLEARED!</h1>
          <p className="text-xl mb-8">ダンジョン制覇おめでとう！</p>
          <button 
            onClick={() => setGameState('title')}
            className="px-8 py-3 bg-black text-white font-bold text-xl rounded hover:bg-gray-800"
          >
            タイトルへ戻る
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
