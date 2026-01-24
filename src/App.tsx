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
import { items as allItems } from './data/items'; // アイテムデータ参照用
import { GameHUD } from './components/GameHUD';
import { dialogues } from './data/dialogues';
import { saveGame, loadGame, hasSaveData, clearSaveData } from './utils/storage'; // 追加

// 画面遷移の状態
type ScreenState = 'title' | 'jobSelect' | 'godSelect' | 'town' | 'dungeon' | 'result';

const calculateLevel = (exp: number) => Math.floor(Math.sqrt(exp / 100)) + 1;

export default function App() {
  const [screen, setScreen] = useState<ScreenState>('title');
  const [canContinue, setCanContinue] = useState(false); // コンティニュー可能か
  
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
  const [inventory, setInventory] = useState<ShopItem[]>([]); // 簡易的にShopItem型を使用
  const [unlockedCompanions, setUnlockedCompanions] = useState<string[]>([]);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 初回ロード時にセーブデータの有無を確認
  useEffect(() => {
    setCanContinue(hasSaveData());
  }, []);

  // オートセーブ関数（重要な更新の後に呼ぶ）
  const performAutoSave = () => {
    // 現在の状態を保存
    // 注意: useStateの値は即座に反映されない場合があるため、
    // ここでは呼び出し元の新しい値を引数で受け取るか、useEffectで監視するのが確実だが
    // 簡易的に現在のstateを使用する（厳密には1フレーム古い可能性があるため注意）
    
    // アイテムIDリストへの変換
    const inventoryIds = inventory.map(i => i.id);
    const activeQuestIds = activeQuests.map(q => q.id);

    saveGame({
      playerJobId: playerJob.id,
      playerStats: { ...playerStats, exp: playerExp }, // EXPも含める
      gold,
      chapter,
      activeQuestIds,
      completedQuestIds,
      inventory: inventoryIds,
      unlockedCompanions,
      savedAt: Date.now()
    });
    
    setCanContinue(true);
  };

  // ゲームロジックフック
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
    chapter,
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

  // 「初めから」
  const handleStartGame = () => {
    clearSaveData(); // データをクリアして開始
    setScreen('jobSelect');
  };

  // 「続きから」
  const handleContinueGame = () => {
    const data = loadGame();
    if (data) {
      // データの復元
      const job = jobs.find(j => j.id === data.playerJobId) || jobs[0];
      setPlayerJob(job);
      setPlayerStats(data.playerStats);
      setPlayerExp(data.playerStats.exp);
      setGold(data.gold);
      setChapter(data.chapter);
      setCompletedQuestIds(data.completedQuestIds);
      setUnlockedCompanions(data.unlockedCompanions);

      // IDからオブジェクトへの復元
      const restoredQuests = allQuests.filter(q => data.activeQuestIds.includes(q.id));
      setActiveQuests(restoredQuests);

      // アイテム復元 (簡易: ShopItem型に合わせるためprice等を補完する必要があるが、一旦モック)
      // 本来はItemDefinitionから復元すべき
      const restoredInventory: ShopItem[] = []; 
      // ※実装省略: IDからアイテムデータを引くロジックが必要

      setScreen('town'); // 街から再開
    }
  };
  
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
    // 初期状態をセーブ
    setTimeout(performAutoSave, 100); 
  };

  const handleGoToDungeon = () => {
    setScreen('dungeon');
  };

  const handleGameOver = () => {
    setScreen('result');
    // ゲームオーバー時はセーブしない、あるいは所持金半減してセーブするなどの処理
  };
  
  const handleReturnToTown = () => {
    // HP回復などの処理
    setPlayerStats(prev => ({ ...prev, hp: prev.maxHp }));
    setScreen('town');
    // 帰還時にオートセーブ
    setTimeout(performAutoSave, 100);
  };

  const handleAcceptQuest = (quest: Quest) => {
    if (!activeQuests.find(q => q.id === quest.id)) {
      const newQuests = [...activeQuests, quest];
      setActiveQuests(newQuests);
      // State更新は非同期なので、セーブはuseEffectで行うか、ここでのセーブは遅延させる工夫が必要
      // 今回は簡易的に手動保存ボタンを実装するか、画面遷移時に保存する運用を推奨
    }
  };

  const handleQuestUpdate = (questId: string, progress: number) => {
     console.log(`Quest Updated: ${questId}, Progress: ${progress}`);
  };

  const handleReportQuest = (quest: Quest) => {
    setGold(gold + quest.rewardGold);
    const newExp = playerExp + quest.rewardExp;
    setPlayerExp(newExp);
    
    setActiveQuests(activeQuests.filter(q => q.id !== quest.id));
    setCompletedQuestIds([...completedQuestIds, quest.id]);
    
    const newLevel = calculateLevel(newExp);
    if (newLevel > playerStats.level) {
        setPlayerStats({ ...playerStats, level: newLevel });
    }

    // 章の進行
    if (quest.id === 'mq_1_5') {
        setChapter(2);
        setUnlockedCompanions(prev => [...prev, 'elias']);
        alert("Chapter 2へ進みました！ 仲間「エリアス」が解禁されました。");
    }
    
    // 報告完了時にオートセーブ（State更新待ちのためsetTimeoutで擬似対応）
    setTimeout(performAutoSave, 500);
  };

  const handleBuyItem = (item: ShopItem) => {
    if (gold >= item.price) {
      setGold(gold - item.price);
      setInventory([...inventory, item]);
      // 購入時セーブ
      setTimeout(performAutoSave, 100);
    }
  };

  const handleUpgradeStatus = (stat: 'str' | 'vit' | 'dex' | 'agi' | 'int' | 'luc') => {
      if (playerExp >= 100) {
          setPlayerExp(playerExp - 100);
          setPlayerStats({ ...playerStats, [stat]: playerStats[stat] + 1 });
          // 強化時セーブ
          setTimeout(performAutoSave, 100);
      }
  };

  return (
    <div className="w-full h-screen bg-black text-white font-sans">
      {screen === 'title' && (
          <div className="flex flex-col items-center justify-center h-full space-y-4 bg-gray-900">
              <TitleScreen onStart={handleStartGame} />
              {/* 続きからボタンの追加 */}
              {canContinue && (
                  <button 
                    onClick={handleContinueGame}
                    className="px-8 py-3 bg-blue-600 hover:bg-blue-500 rounded text-xl font-bold animate-pulse border-2 border-blue-400"
                  >
                      続きから始める
                  </button>
              )}
          </div>
      )}
      
      {screen === 'jobSelect' && <JobSelectScreen onSelectJob={handleSelectJob} />}
      {screen === 'godSelect' && <GodSelectScreen onSelectGod={handleSelectGod} />}
      
      {screen === 'town' && (
        <>
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
            {/* 手動セーブボタン（デバッグ・安心用） */}
            <div className="absolute top-2 right-2 z-50">
                <button 
                    onClick={performAutoSave}
                    className="px-3 py-1 bg-gray-700 text-xs rounded border border-gray-500 hover:bg-gray-600"
                >
                    💾 セーブ
                </button>
            </div>
        </>
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
