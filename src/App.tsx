import React, { useState, useEffect, useRef } from 'react';
import { TitleScreen } from './components/TitleScreen';
import { GodSelectScreen } from './components/GodSelectScreen';
import { JobSelectScreen } from './components/JobSelectScreen';
import { TownScreen } from './components/TownScreen';
import { GameHUD } from './components/GameHUD';
import { InventoryMenu } from './components/InventoryMenu';
import { ResultScreen, ResultData } from './components/ResultScreen';
import { GODS, GodId } from './data/gods';
import { JOBS, JobId } from './data/jobs';
import { INITIAL_QUESTS } from './data/quests';
import { GameScreen, Position, Direction, Stats, Entity, Item, GameState as GameDataType } from './types';
import { useGameLoop } from './gameLogic';
import { renderer } from './renderer';
import { generateDungeon } from './dungeonGenerator';
import { ENEMIES } from './data/enemies';

function App() {
  const [gameState, setGameState] = useState<GameScreen>('title');
  const [selectedGod, setSelectedGod] = useState<GodId>('warrior_god');
  const [selectedJob, setSelectedJob] = useState<JobId>('warrior');
  
  // プレイヤー基本ステータス
  const [playerStats, setPlayerStats] = useState<Stats>({
    maxHp: 100, hp: 100, attack: 10, defense: 0, level: 1, exp: 0, nextLevelExp: 100, speed: 4
  });
  const [playerGold, setPlayerGold] = useState(1000); // テスト用に初期所持金を付与

  // クエスト状態管理
  const [acceptedQuests, setAcceptedQuests] = useState<string[]>([]);
  const [readyToReportQuests, setReadyToReportQuests] = useState<string[]>([]);
  const [completedQuests, setCompletedQuests] = useState<string[]>([]);

  // ダンジョン進行状態
  const [currentFloor, setCurrentFloor] = useState(1);
  const [gameLog, setGameLog] = useState<string[]>([]);
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const [inventory, setInventory] = useState<string[]>([]);

  // リザルト用一時データ
  const [resultData, setResultData] = useState<ResultData>({
    exp: 0, gold: 0, items: [], floorReached: 0
  });

  const containerRef = useRef<HTMLDivElement>(null);
  
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

  // キャンバス初期化
  useEffect(() => {
    if (gameState === 'playing' && containerRef.current) {
      const { canvas } = renderer.init(containerRef.current);
      return () => {
        renderer.cleanup();
      };
    }
  }, [gameState]);

  // ゲームループ
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

  // --- イベントハンドラ ---

  const handleGodSelect = (godId: GodId) => {
    setSelectedGod(godId);
    setGameState('jobSelect');
  };

  const handleJobSelect = (jobId: JobId) => {
    setSelectedJob(jobId);
    
    // プレイヤー初期化
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
    
    setGameState('town');
  };

  const handleGoToDungeon = () => {
    startGame();
  };

  const startGame = () => {
    const newDungeon = generateDungeon(1);
    setDungeon(newDungeon);
    
    const startRoom = newDungeon.rooms[0];
    const startX = startRoom.x + Math.floor(startRoom.width / 2);
    const startY = startRoom.y + Math.floor(startRoom.height / 2);
    
    setPlayerPos({ x: startX, y: startY });
    setEntities([]); 
    // inventoryは維持する
    setCurrentFloor(1);
    setGameLog(['ダンジョンに到達した。', '探索を開始する。']);
    setGameState('playing');
  };

  const handleReturnTown = () => {
    const earnedExp = currentFloor * 50 + entities.length * 10;
    const earnedGold = currentFloor * 100;
    const earnedItems = [...inventory]; 

    setResultData({
      exp: earnedExp,
      gold: earnedGold,
      items: earnedItems,
      floorReached: currentFloor
    });

    const newReady = [...readyToReportQuests];
    acceptedQuests.forEach(qId => {
      if (!completedQuests.includes(qId) && !newReady.includes(qId)) {
        newReady.push(qId);
      }
    });
    setReadyToReportQuests(newReady);

    setGameState('result');
  };

  const handleBackToTownFromResult = () => {
    setPlayerStats(prev => ({
      ...prev,
      exp: prev.exp + resultData.exp
    }));
    setPlayerGold(prev => prev + resultData.gold);

    // インベントリは一旦リセット（倉庫機能未実装のため）
    setInventory([]);
    
    setGameState('town');
  };

  const handleUseItem = (index: number) => {
    logicHandleUseItem(index, playerStats);
  };

  const handleAcceptQuest = (questId: string) => {
    if (!acceptedQuests.includes(questId)) {
      setAcceptedQuests([...acceptedQuests, questId]);
      alert('クエストを受注しました！');
    }
  };

  const handleReportQuest = (questId: string) => {
    const quest = INITIAL_QUESTS.find(q => q.id === questId);
    if (quest) {
      setPlayerGold(prev => prev + quest.reward.gold);
      setPlayerStats(prev => ({ ...prev, exp: prev.exp + quest.reward.experience }));
      
      setCompletedQuests([...completedQuests, questId]);
      setAcceptedQuests(acceptedQuests.filter(id => id !== questId));
      setReadyToReportQuests(readyToReportQuests.filter(id => id !== questId));
      
      alert(`クエスト「${quest.title}」を達成！\n報酬: ${quest.reward.gold}G, ${quest.reward.experience}Exp を獲得しました。`);
    }
  };

  // アイテム購入用ハンドラ
  const handleAddItem = (itemId: string) => {
    setInventory(prev => [...prev, itemId]);
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

      {gameState === 'town' && (
        <TownScreen 
          onGoToDungeon={handleGoToDungeon}
          onBackToTitle={() => setGameState('title')}
          acceptedQuests={acceptedQuests}
          onAcceptQuest={handleAcceptQuest}
          completedQuests={completedQuests}
          readyToReportQuests={readyToReportQuests}
          onReportQuest={handleReportQuest}
          // 追加Props
          playerGold={playerGold}
          playerStats={playerStats}
          onUpdateGold={setPlayerGold}
          onUpdateStats={setPlayerStats}
          onAddItem={handleAddItem}
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
            onReturnTown={handleReturnTown}
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

      {gameState === 'result' && (
        <ResultScreen 
          resultData={resultData}
          onBackToTown={handleBackToTownFromResult}
        />
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
