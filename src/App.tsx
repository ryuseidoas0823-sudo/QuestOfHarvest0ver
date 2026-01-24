import React, { useState, useEffect, useRef } from 'react';
import { TitleScreen } from './components/TitleScreen';
import { JobSelectScreen } from './components/JobSelectScreen';
import { GodSelectScreen } from './components/GodSelectScreen';
import { TownScreen } from './components/TownScreen';
import { ResultScreen } from './components/ResultScreen';
import { renderDungeon } from './renderer';
import { useGameLogic } from './gameLogic';
import { Job } from './types/job';
import { Quest } from './types/quest';
import { ShopItem } from './data/shopItems';
import { quests as allQuests } from './data/quests';
import { jobs } from './data/jobs';
import { GameHUD } from './components/GameHUD';
import { dialogues } from './data/dialogues';

// 画面遷移の状態
type ScreenState = 'title' | 'jobSelect' | 'godSelect' | 'town' | 'dungeon' | 'result';

const calculateLevel = (exp: number) => Math.floor(Math.sqrt(exp / 100)) + 1;

export default function App() {
  const [screen, setScreen] = useState<ScreenState>('title');
  
  // プレイヤーデータ
  const [playerJob, setPlayerJob] = useState<Job>(jobs[0]);
  const [playerExp, setPlayerExp] = useState(0);
  const [gold, setGold] = useState(0);
  const [playerStats, setPlayerStats] = useState({
    level: 1,
    maxHp: 100,
    hp: 100,
    attack: 10,
    defense: 5,
    str: 10, vit: 10, dex: 10, agi: 10, int: 10, luc: 10
  });

  // 進行状況
  const [chapter, setChapter] = useState(1);
  const [activeQuests, setActiveQuests] = useState<Quest[]>([]);
  const [completedQuestIds, setCompletedQuestIds] = useState<string[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [unlockedCompanions, setUnlockedCompanions] = useState<string[]>([]);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // ゲームロジックフックに chapter を渡す
  const { 
    dungeon, 
    playerPos, 
    enemies, 
    floor, 
    gameOver, 
    messageLog, 
    movePlayer 
  } = useGameLogic(
    playerJob,
    chapter, // 追加
    activeQuests,
    (questId, amount) => handleQuestUpdate(questId, amount),
    () => handleGameOver()
  );

  // キーボード入力処理
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (screen !== 'dungeon') return;
      
      switch(e.key) {
        case 'ArrowUp': movePlayer(0, -1); break;
        case 'ArrowDown': movePlayer(0, 1); break;
        case 'ArrowLeft': movePlayer(-1, 0); break;
        case 'ArrowRight': movePlayer(1, 0); break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [screen, movePlayer]);

  // Canvas描画
  useEffect(() => {
    if (screen === 'dungeon' && canvasRef.current && dungeon) {
      renderDungeon(canvasRef.current, dungeon, playerPos, enemies);
    }
  }, [screen, dungeon, playerPos, enemies]);

  // --- アクションハンドラ ---

  const handleStartGame = () => setScreen('jobSelect');
  
  const handleSelectJob = (job: Job) => {
    setPlayerJob(job);
    setPlayerStats({
      ...playerStats,
      maxHp: job.baseStats.vit * 10,
      hp: job.baseStats.vit * 10,
      attack: job.baseStats.str * 2,
      str: job.baseStats.str,
      vit: job.baseStats.vit,
      dex: job.baseStats.dex,
      agi: job.baseStats.agi,
      int: job.baseStats.int,
      luc: job.baseStats.luc,
    });
    setScreen('godSelect');
  };

  const handleSelectGod = (godId: string) => {
    setScreen('town');
  };

  const handleGoToDungeon = () => {
    setScreen('dungeon');
  };

  const handleGameOver = () => {
    setScreen('result');
  };
  
  const handleReturnToTown = () => {
    setScreen('town');
  };

  const handleAcceptQuest = (quest: Quest) => {
    if (!activeQuests.find(q => q.id === quest.id)) {
      setActiveQuests([...activeQuests, quest]);
    }
  };

  const handleQuestUpdate = (questId: string, progress: number) => {
     console.log(`Quest Updated: ${questId}, Progress: ${progress}`);
  };

  const handleReportQuest = (quest: Quest) => {
    setGold(gold + quest.rewardGold);
    setPlayerExp(playerExp + quest.rewardExp);
    
    setActiveQuests(activeQuests.filter(q => q.id !== quest.id));
    setCompletedQuestIds([...completedQuestIds, quest.id]);
    
    const newLevel = calculateLevel(playerExp + quest.rewardExp);
    if (newLevel > playerStats.level) {
        setPlayerStats({ ...playerStats, level: newLevel });
    }

    // 章の進行
    if (quest.id === 'mq_1_5') {
        setChapter(2);
        setUnlockedCompanions(prev => [...prev, 'elias']);
        alert("Chapter 2へ進みました！ 仲間「エリアス」が解禁されました。");
    }
  };

  const handleBuyItem = (item: ShopItem) => {
    if (gold >= item.price) {
      setGold(gold - item.price);
      setInventory([...inventory, item]);
    }
  };

  const handleUpgradeStatus = (stat: 'str' | 'vit' | 'dex' | 'agi' | 'int' | 'luc') => {
      if (playerExp >= 100) {
          setPlayerExp(playerExp - 100);
          setPlayerStats({ ...playerStats, [stat]: playerStats[stat] + 1 });
      }
  };

  return (
    <div className="w-full h-screen bg-black text-white font-sans">
      {screen === 'title' && <TitleScreen onStart={handleStartGame} />}
      {screen === 'jobSelect' && <JobSelectScreen onSelectJob={handleSelectJob} />}
      {screen === 'godSelect' && <GodSelectScreen onSelectGod={handleSelectGod} />}
      
      {screen === 'town' && (
        <TownScreen
          playerJob={playerJob}
          gold={gold}
          chapter={chapter}
          activeQuests={activeQuests}
          completedQuestIds={completedQuestIds}
          items={inventory}
          onGoToDungeon={handleGoToDungeon}
          onAcceptQuest={handleAcceptQuest}
          onReportQuest={handleReportQuest}
          onBuyItem={handleBuyItem}
          onUpgradeStatus={handleUpgradeStatus}
          playerStats={playerStats}
          playerExp={playerExp}
        />
      )}
      
      {screen === 'dungeon' && (
        <div className="relative w-full h-full flex flex-col items-center justify-center">
            <div className="absolute top-0 left-0 w-full z-10">
                <GameHUD 
                    playerJob={playerJob}
                    level={playerStats.level}
                    hp={playerStats.hp}
                    maxHp={playerStats.maxHp}
                    exp={playerExp}
                    nextExp={100 * playerStats.level}
                    floor={floor}
                    gold={gold}
                />
            </div>

            <canvas 
                ref={canvasRef} 
                width={800} 
                height={600} 
                className="border-4 border-gray-700 bg-gray-900 shadow-2xl"
            />
            
            <div className="absolute bottom-4 left-4 bg-black bg-opacity-70 p-4 rounded max-w-md pointer-events-none">
                {messageLog.map((log, i) => (
                    <div key={i} className="text-sm text-gray-200">{log}</div>
                ))}
            </div>

            {gameOver && (
                <div className="absolute inset-0 bg-red-900 bg-opacity-80 flex items-center justify-center flex-col z-20">
                    <h2 className="text-4xl font-bold mb-4">YOU DIED</h2>
                    <button onClick={handleGameOver} className="px-6 py-3 bg-white text-black font-bold rounded hover:bg-gray-200">
                        Continue
                    </button>
                </div>
            )}
        </div>
      )}

      {screen === 'result' && (
          <ResultScreen onReturnToTown={handleReturnToTown} />
      )}
    </div>
  );
}
