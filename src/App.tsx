import React, { useState, useEffect, useRef } from 'react';
import { TitleScreen } from './components/TitleScreen';
import { GodSelectScreen } from './components/GodSelectScreen';
import { JobSelectScreen } from './components/JobSelectScreen';
import { TownScreen } from './components/TownScreen';
import { GameHUD } from './components/GameHUD';
import { InventoryMenu } from './components/InventoryMenu';
import { GODS, GodId } from './data/gods';
import { JOBS, JobId } from './data/jobs';
import { GameScreen, Position, Direction, Stats, Entity, Item, GameState as GameDataType } from './types';
import { useGameLoop } from './gameLogic';
import { renderer } from './renderer';
import { generateDungeon } from './dungeonGenerator';
import { ENEMIES } from './data/enemies';

// ゲームの状態を管理するメインコンポーネント
function App() {
  // GameScreen型を使用するように変更
  const [gameState, setGameState] = useState<GameScreen>('title');
  const [selectedGod, setSelectedGod] = useState<GodId>('warrior_god');
  const [selectedJob, setSelectedJob] = useState<JobId>('warrior');
  
  // HUD表示用のステート
  const [playerStats, setPlayerStats] = useState<Stats>({
    maxHp: 100, hp: 100, attack: 10, defense: 0, level: 1, exp: 0, nextLevelExp: 100, speed: 4
  });
  const [currentFloor, setCurrentFloor] = useState(1);
  const [gameLog, setGameLog] = useState<string[]>([]);
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const [inventory, setInventory] = useState<string[]>([]);

  // レンダリング用のRef
  const containerRef = useRef<HTMLDivElement>(null);
  
  // ゲームロジックフック
  const { 
    dungeon, 
    setDungeon, 
    playerPos, 
    setPlayerPos, 
    gameLoop, 
    entities, 
    items,
    setEntities,
    handleUseItem: logicHandleUseItem
  } = useGameLoop(
    (stats) => setPlayerStats(stats),
    (log) => setGameLog(prev => [log, ...prev].slice(0, 50)),
    (floor) => setCurrentFloor(floor),
    () => setGameState('gameOver'),
    (inv) => setInventory(inv)
  );

  // キャンバスのセットアップ
  useEffect(() => {
    if (gameState === 'playing' && containerRef.current) {
      const { canvas } = renderer.init(containerRef.current);
      return () => {
        renderer.cleanup();
      };
    }
  }, [gameState]);

  // ゲームループの開始/停止
  useEffect(() => {
    if (gameState === 'playing') {
      const loopId = requestAnimationFrame(function loop() {
        gameLoop(selectedJob, selectedGod);
        if (gameState === 'playing') {
          requestAnimationFrame(loop);
        }
      });
      return () => cancelAnimationFrame(loopId);
    }
  }, [gameState, gameLoop, selectedJob, selectedGod]);

  const handleGodSelect = (godId: GodId) => {
    setSelectedGod(godId);
    setGameState('jobSelect');
  };

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
        nextLevelExp: 100,
        speed: job.baseStats.speed || 4,
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
    setEntities([]); // 敵などの初期化
    setInventory([]); // 本来は引き継ぐが、今は初期化
    setCurrentFloor(1);
    setGameLog(['ダンジョンに到達した。', '探索を開始する。']);
    setGameState('playing');
  };

  const handleUseItem = (index: number) => {
    logicHandleUseItem(index, playerStats);
  };

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

      {/* 街画面 */}
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

      {gameState === 'gameOver' && (
        <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-white z-50">
          <h1 className="text-6xl font-bold text-red-600 mb-8 tracking-widest">YOU DIED</h1>
          <p className="text-xl mb-8">到達階層: {currentFloor}階</p>
          <button 
            onClick={() => setGameState('title')}
            className="px-8 py-3 bg-white text-black font-bold text-xl rounded hover:bg-gray-200 transition-colors"
          >
            タイトルへ戻る
          </button>
        </div>
      )}

      {gameState === 'gameClear' && (
         <div className="absolute inset-0 bg-white/90 flex flex-col items-center justify-center text-black z-50">
          <h1 className="text-6xl font-bold text-yellow-600 mb-8 tracking-widest">GAME CLEARED!</h1>
          <p className="text-xl mb-8">ダンジョン制覇おめでとう！</p>
          <button 
            onClick={() => setGameState('title')}
            className="px-8 py-3 bg-black text-white font-bold text-xl rounded hover:bg-gray-800 transition-colors"
          >
            タイトルへ戻る
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
