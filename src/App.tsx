import React, { useState, useEffect, useRef, useMemo } from 'react';
import { TitleScreen } from './components/TitleScreen';
import { JobSelectScreen } from './components/JobSelectScreen';
import { GodSelectScreen } from './components/GodSelectScreen';
import { TownScreen } from './components/TownScreen';
import { ResultScreen } from './components/ResultScreen';
import { InventoryMenu } from './components/InventoryMenu'; // 追加
import { renderDungeon } from './renderer';
import { useGameLogic } from './gameLogic';
import { Job } from './types/job';
import { Quest } from './types/quest';
import { ShopItem } from './data/shopItems';
import { quests as allQuests } from './data/quests';
import { jobs } from './data/jobs';
import { items as itemData } from './data/items';
import { GameHUD } from './components/GameHUD';
import { saveGame, loadGame, hasSaveData, clearSaveData } from './utils/storage';
import { audioManager } from './utils/audioManager';

// 画面遷移の状態
type ScreenState = 'title' | 'jobSelect' | 'godSelect' | 'town' | 'dungeon' | 'result' | 'inventory';

const calculateLevel = (exp: number) => Math.floor(Math.sqrt(exp / 100)) + 1;

export default function App() {
  const [screen, setScreen] = useState<ScreenState>('title');
  const [canContinue, setCanContinue] = useState(false);
  
  // プレイヤーデータ
  const [playerJob, setPlayerJob] = useState<Job>(jobs[0]);
  const [playerExp, setPlayerExp] = useState(0);
  const [gold, setGold] = useState(0);
  
  // 基礎ステータス（レベル依存）
  const [baseStats, setBaseStats] = useState({
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
  // アイテムはIDの配列で管理
  const [inventory, setInventory] = useState<string[]>([]);
  // 装備中アイテム { slot: itemId }
  const [equippedItems, setEquippedItems] = useState<{ [key: string]: string | null }>({
    weapon: null,
    armor: null,
    accessory: null
  });
  const [unlockedCompanions, setUnlockedCompanions] = useState<string[]>([]);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // --- ステータス計算 (装備込み) ---
  // useMemoを使って、装備やレベルが変わった時だけ再計算する
  const finalStats = useMemo(() => {
    let stats = { ...baseStats };
    
    // 装備補正を加算
    Object.values(equippedItems).forEach(itemId => {
      if (!itemId) return;
      const item = itemData.find(i => i.id === itemId);
      if (item && item.equipStats) {
        if (item.equipStats.attack) stats.attack += item.equipStats.attack;
        if (item.equipStats.defense) stats.defense += item.equipStats.defense;
        if (item.equipStats.str) stats.str += item.equipStats.str;
        if (item.equipStats.vit) stats.vit += item.equipStats.vit;
        if (item.equipStats.maxHp) stats.maxHp += item.equipStats.maxHp;
        // 他のステータスも同様に加算
      }
    });
    
    return stats;
  }, [baseStats, equippedItems]);

  useEffect(() => {
    setCanContinue(hasSaveData());
  }, []);

  // --- セーブ・ロード ---
  const performAutoSave = () => {
    // 簡易実装: IDリストのみ保存
    const activeQuestIds = activeQuests.map(q => q.id);

    saveGame({
      playerJobId: playerJob.id,
      playerStats: { ...baseStats, exp: playerExp }, // 保存するのはBaseStats
      gold,
      chapter,
      activeQuestIds,
      completedQuestIds,
      inventory,
      unlockedCompanions,
      savedAt: Date.now()
    });
    setCanContinue(true);
  };

  const handleStartGame = () => {
    audioManager.playSeSelect();
    clearSaveData();
    setScreen('jobSelect');
  };

  const handleContinueGame = () => {
    audioManager.playSeSelect();
    const data = loadGame();
    if (data) {
      const job = jobs.find(j => j.id === data.playerJobId) || jobs[0];
      setPlayerJob(job);
      setBaseStats(data.playerStats);
      setPlayerExp(data.playerStats.exp);
      setGold(data.gold);
      setChapter(data.chapter);
      setCompletedQuestIds(data.completedQuestIds);
      setInventory(data.inventory);
      setUnlockedCompanions(data.unlockedCompanions);

      const restoredQuests = allQuests.filter(q => data.activeQuestIds.includes(q.id));
      setActiveQuests(restoredQuests);

      setScreen('town');
    }
  };

  // --- ゲームロジック連携 ---
  const { 
    dungeon, 
    playerPos, 
    enemies, 
    floor, 
    gameOver, 
    messageLog, 
    movePlayer,
    useSkill,
    skillCooldowns,
    playerHp,
    playerMaxHp
  } = useGameLogic(
    playerJob,
    chapter,
    activeQuests,
    (questId, amount) => handleQuestUpdate(questId, amount),
    () => handleGameOver()
  );

  // HP同期用: useGameLogicの内部ステートを更新する手段がないため、
  // 今回は簡易的に「ゲーム開始時」にLogicへStatsを渡す形になっているが、
  // 本来はLogic側が外部からStatsを受け取る設計にすべき。
  // ここではLogicのリファクタリングを避けるため、Logic内のHPはダンジョン中のみ有効とする。

  // --- 入力処理 ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // インベントリを開く (Iキー)
      if (e.key === 'i' && (screen === 'town' || screen === 'dungeon')) {
        setScreen('inventory');
        return;
      }
      // インベントリを閉じる (ESC)
      if (e.key === 'Escape' && screen === 'inventory') {
        setScreen(dungeon ? 'dungeon' : 'town'); // 戻る場所判定
        return;
      }

      if (screen !== 'dungeon') return;
      
      switch(e.key) {
        case 'ArrowUp': movePlayer(0, -1); break;
        case 'ArrowDown': movePlayer(0, 1); break;
        case 'ArrowLeft': movePlayer(-1, 0); break;
        case 'ArrowRight': movePlayer(1, 0); break;
        case '1': if(playerJob.skills[0]) useSkill(playerJob.skills[0]); break;
        case '2': if(playerJob.skills[1]) useSkill(playerJob.skills[1]); break;
        case '3': if(playerJob.skills[2]) useSkill(playerJob.skills[2]); break;
        case '4': if(playerJob.skills[3]) useSkill(playerJob.skills[3]); break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [screen, movePlayer, useSkill, playerJob, dungeon]);

  // --- アイテムアクション ---
  
  const handleUseItem = (itemId: string) => {
    const item = itemData.find(i => i.id === itemId);
    if (!item || !item.effect) return;

    if (item.effect.type === 'heal_hp') {
        // ダンジョン内なら回復（Logic側への干渉が必要だが、ここではBaseStats回復 + ログのみ）
        // 実際には useGameLogic に healPlayer 関数を追加して呼ぶ必要がある
        // 簡易実装: BaseStatsのHPを回復
        setBaseStats(prev => ({ ...prev, hp: Math.min(prev.maxHp, prev.hp + item.effect!.value) }));
        audioManager.playSeSelect(); // 回復音代用
        alert(`${item.name}を使用しました。`);
        
        // 消費: インベントリから1つ削除
        const idx = inventory.indexOf(itemId);
        if (idx > -1) {
            const newInv = [...inventory];
            newInv.splice(idx, 1);
            setInventory(newInv);
        }
    }
  };

  const handleEquipItem = (itemId: string) => {
    const item = itemData.find(i => i.id === itemId);
    if (!item) return;

    // トグル動作 (既に装備中なら外す)
    const currentEquippedId = equippedItems[item.type];
    if (currentEquippedId === itemId) {
        setEquippedItems(prev => ({ ...prev, [item.type]: null }));
        audioManager.playSeCancel(); // 外す音代用
        return;
    }

    // 装備する
    setEquippedItems(prev => ({ ...prev, [item.type]: itemId }));
    audioManager.playSeSelect(); // 装備音代用
  };

  // --- その他ハンドラ ---
  const handleSelectJob = (job: Job) => {
    audioManager.playSeSelect();
    setPlayerJob(job);
    setBaseStats({
      ...baseStats,
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
    audioManager.playSeSelect();
    setScreen('town');
    setTimeout(performAutoSave, 100); 
  };

  const handleGoToDungeon = () => {
    audioManager.playSeSelect();
    setScreen('dungeon');
  };

  const handleGameOver = () => {
    setScreen('result');
  };
  
  const handleReturnToTown = () => {
    audioManager.playSeSelect();
    setBaseStats(prev => ({ ...prev, hp: prev.maxHp }));
    setScreen('town');
    setTimeout(performAutoSave, 100);
  };

  const handleAcceptQuest = (quest: Quest) => {
    audioManager.playSeSelect();
    if (!activeQuests.find(q => q.id === quest.id)) {
      setActiveQuests([...activeQuests, quest]);
    }
  };

  const handleQuestUpdate = (questId: string, progress: number) => {
     console.log(`Quest Updated: ${questId}, Progress: ${progress}`);
  };

  const handleReportQuest = (quest: Quest) => {
    audioManager.playSeLevelUp();
    setGold(gold + quest.rewardGold);
    const newExp = playerExp + quest.rewardExp;
    setPlayerExp(newExp);
    
    setActiveQuests(activeQuests.filter(q => q.id !== quest.id));
    setCompletedQuestIds([...completedQuestIds, quest.id]);
    
    const newLevel = calculateLevel(newExp);
    if (newLevel > baseStats.level) {
        setBaseStats({ ...baseStats, level: newLevel });
    }

    if (quest.id === 'mq_1_5') {
        setChapter(2);
        setUnlockedCompanions(prev => [...prev, 'elias']);
        alert("Chapter 2へ進みました！");
    }
    
    setTimeout(performAutoSave, 500);
  };

  const handleBuyItem = (item: ShopItem) => {
    if (gold >= item.price) {
      audioManager.playSeSelect();
      setGold(gold - item.price);
      setInventory([...inventory, item.id]); // IDのみ保存
      setTimeout(performAutoSave, 100);
    } else {
      audioManager.playSeCancel();
    }
  };

  const handleUpgradeStatus = (stat: 'str' | 'vit' | 'dex' | 'agi' | 'int' | 'luc') => {
      if (playerExp >= 100) {
          audioManager.playSeSelect();
          setPlayerExp(playerExp - 100);
          setBaseStats({ ...baseStats, [stat]: baseStats[stat] + 1 });
          setTimeout(performAutoSave, 100);
      } else {
          audioManager.playSeCancel();
      }
  };

  // Canvas描画
  useEffect(() => {
    if (screen === 'dungeon' && canvasRef.current && dungeon) {
      renderDungeon(canvasRef.current, dungeon, playerPos, enemies);
    }
  }, [screen, dungeon, playerPos, enemies]);

  return (
    <div className="w-full h-screen bg-black text-white font-sans">
      {screen === 'title' && (
          <div className="flex flex-col items-center justify-center h-full space-y-4 bg-gray-900">
              <TitleScreen onStart={handleStartGame} />
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
                items={inventory.map(id => ({ id, name: 'Item', price: 0 } as any))} // 型合わせ用仮変換
                onGoToDungeon={handleGoToDungeon}
                onAcceptQuest={handleAcceptQuest}
                onReportQuest={handleReportQuest}
                onBuyItem={handleBuyItem}
                onUpgradeStatus={handleUpgradeStatus}
                playerStats={finalStats} // 装備込みステータスを渡す
                playerExp={playerExp}
            />
            
            {/* メニューボタン */}
            <div className="absolute top-2 right-2 z-50 flex space-x-2">
                <button 
                    onClick={() => setScreen('inventory')}
                    className="px-3 py-1 bg-blue-700 text-xs rounded border border-blue-500 hover:bg-blue-600"
                >
                    🎒 アイテム
                </button>
                <button 
                    onClick={performAutoSave}
                    className="px-3 py-1 bg-gray-700 text-xs rounded border border-gray-500 hover:bg-gray-600"
                >
                    💾 セーブ
                </button>
            </div>
        </>
      )}

      {screen === 'inventory' && (
          <div className="absolute inset-0 bg-black bg-opacity-95 z-50 p-4">
              <InventoryMenu 
                  inventory={inventory}
                  equippedItems={equippedItems}
                  onUseItem={handleUseItem}
                  onEquipItem={handleEquipItem}
                  onClose={() => setScreen(dungeon ? 'dungeon' : 'town')}
              />
          </div>
      )}
      
      {screen === 'dungeon' && (
        <div className="relative w-full h-full flex flex-col items-center justify-center">
            <div className="absolute top-0 left-0 w-full z-10">
                <GameHUD 
                    playerJob={playerJob}
                    level={finalStats.level}
                    hp={playerHp} // 注: ダンジョン内HPはGameLogic管理
                    maxHp={finalStats.maxHp} // 最大HPは装備込み
                    exp={playerExp}
                    nextExp={100 * finalStats.level}
                    floor={floor}
                    gold={gold}
                    skillCooldowns={skillCooldowns}
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
            
            {/* ダンジョン内メニューボタン */}
            <div className="absolute top-16 right-2 z-50">
                <button 
                    onClick={() => setScreen('inventory')}
                    className="px-3 py-1 bg-blue-700 text-xs rounded border border-blue-500 hover:bg-blue-600 opacity-80"
                >
                    🎒 アイテム
                </button>
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
