import React, { useState, useEffect, useCallback } from 'react';
import { TitleScreen } from './components/TitleScreen';
import { NameInputScreen } from './components/NameInputScreen';
import { JobSelectScreen } from './components/JobSelectScreen';
import { GodSelectScreen } from './components/GodSelectScreen';
import { TownScreen } from './components/TownScreen';
import { GameHUD } from './components/GameHUD';
import { InventoryMenu } from './components/InventoryMenu';
import { StatusUpgradeMenu } from './components/StatusUpgradeMenu';
import { SkillTreeMenu } from './components/SkillTreeMenu';
import { ShopMenu } from './components/ShopMenu';
import { ResultScreen } from './components/ResultScreen';
import { PauseMenu } from './components/PauseMenu';
import { EventModal } from './components/EventModal';
import { DialogueWindow } from './components/DialogueWindow';
import { TargetingOverlay } from './components/TargetingOverlay';
import { PixelSprite } from './components/PixelSprite';
import { Tutorial } from './components/Tutorial';

import { useGameCore } from './hooks/useGameCore';
import { useTurnSystem } from './hooks/useTurnSystem';
import { usePlayer } from './hooks/usePlayer';
import { useDungeon } from './hooks/useDungeon';
import { useEventSystem } from './hooks/useEventSystem';
import { useItemSystem } from './hooks/useItemSystem';
import { useShop } from './hooks/useShop';
import { useSkillSystem } from './hooks/useSkillSystem';
import { useTargeting } from './hooks/useTargeting';
import { useGamepad } from './hooks/useGamepad';

import { loadGame } from './utils/storage';
import { playBGM, stopBGM, playSE } from './utils/audioManager';
import { Position } from './types/gameState';
import { INITIAL_GAME_STATE } from './types/gameState';

// 画面遷移の状態
type Screen = 'title' | 'nameInput' | 'jobSelect' | 'godSelect' | 'town' | 'dungeon' | 'result' | 'shop';

function App() {
  // --- Core State ---
  // ゲーム全体の状態管理
  const [gameState, setGameState] = useState(INITIAL_GAME_STATE);
  const [screen, setScreen] = useState<Screen>('title');
  
  // --- UI States ---
  const [showInventory, setShowInventory] = useState(false);
  const [showStatus, setShowStatus] = useState(false);
  const [showSkills, setShowSkills] = useState(false);
  const [showPauseMenu, setShowPauseMenu] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);

  // --- Hooks Initialization ---
  // 各システムフックの初期化
  const { addLog } = useGameCore(gameState, setGameState);
  const { gainExp, upgradeStat } = usePlayer(setGameState, addLog);
  const { movePlayer, generateNewDungeon, enterDungeon, exitDungeon } = useDungeon(setGameState, addLog);
  const turnSystem = useTurnSystem(gameState, setGameState, addLog);
  const eventSystem = useEventSystem(gameState, setGameState, addLog);
  const itemSystem = useItemSystem(setGameState, addLog);
  const shopSystem = useShop(setGameState, addLog);
  const skillSystem = useSkillSystem(setGameState, addLog);
  const targeting = useTargeting(gameState, turnSystem.handlePlayerAttack, skillSystem.useActiveSkill);

  // --- Gamepad Support ---
  useGamepad({
    onMove: (dx, dy) => {
      if (screen === 'dungeon' && !gameState.isGameOver && !showInventory && !showStatus && !showPauseMenu) {
        if (!targeting.isTargeting) {
            // 移動処理
            const newPos = { x: gameState.player.position.x + dx, y: gameState.player.position.y + dy };
            // 移動ロジックは本来 useDungeon 等にあるべきだが、簡易的にここで判定して movePlayer を呼ぶ
            // ※ここでは movePlayer の実装に依存するが、方向入力として処理
            handleMove(dx, dy); 
        } else {
            // ターゲットカーソル移動
            targeting.moveCursor(dx, dy);
        }
      }
    },
    onConfirm: () => {
        if (targeting.isTargeting) {
            targeting.confirmTarget();
        } else if (gameState.currentEvent) {
            // イベント進行
            eventSystem.handleEventChoice(0); // 仮: 最初の選択肢
        }
    },
    onCancel: () => {
        if (targeting.isTargeting) {
            targeting.cancelTargeting();
        } else if (showInventory) {
            setShowInventory(false);
        } else if (showStatus) {
            setShowStatus(false);
        } else {
            setShowPauseMenu(true);
        }
    },
    onMenu: () => setShowInventory(prev => !prev)
  });

  // --- Audio Management ---
  useEffect(() => {
    // 画面や状況に応じたBGM再生
    if (screen === 'title') {
      playBGM('theme');
    } else if (screen === 'town') {
      playBGM('town');
    } else if (screen === 'dungeon') {
      if (gameState.dungeon.floor % 10 === 0) {
        playBGM('boss');
      } else {
        playBGM('dungeon');
      }
    } else if (screen === 'result') {
      stopBGM();
    }
  }, [screen, gameState.dungeon.floor]);


  // --- Event Handlers ---

  const handleStartGame = () => {
    playSE('decide');
    setGameState(INITIAL_GAME_STATE);
    setScreen('nameInput');
  };

  const handleContinue = () => {
    const savedData = loadGame();
    if (savedData) {
      playSE('decide');
      setGameState(savedData);
      // セーブデータ内の状態に応じて適切な画面へ復帰
      // 基本的には街かダンジョンだが、安全のため街に戻すか、保存時のフラグを見る
      // ここでは簡易的に「ダンジョンデータがあればダンジョン、なければ街」とする
      if (savedData.dungeon && savedData.dungeon.floor > 0) {
          setScreen('dungeon');
      } else {
          setScreen('town');
      }
    }
  };

  const handleNameSubmit = (name: string) => {
    playSE('decide');
    setGameState(prev => ({ ...prev, player: { ...prev.player, name } }));
    setScreen('jobSelect');
  };

  const handleJobSelect = (jobId: string) => {
    playSE('decide');
    // ジョブデータの適用（初期ステータスや装備など）はここで処理
    // ※ 簡易実装: usePlayer等にジョブ適用ロジックがある想定
    setGameState(prev => ({ ...prev, player: { ...prev.player, job: jobId } })); // 必要に応じて詳細設定
    setScreen('godSelect');
  };

  const handleGodSelect = (godId: string) => {
    playSE('decide');
    setGameState(prev => ({ ...prev, player: { ...prev.player, god: godId } }));
    
    // ゲーム開始処理完了
    setScreen('town');
    setShowTutorial(true);
  };

  const handleGoToDungeon = () => {
    playSE('stairs');
    enterDungeon(); // ダンジョン生成または階層移動
    setScreen('dungeon');
  };

  const handleReturnToTown = () => {
    playSE('stairs');
    exitDungeon();
    setScreen('town');
  };

  const handleGameOver = () => {
      setScreen('result');
  };

  const handleReturnToTitle = () => {
      stopBGM();
      setScreen('title');
      setShowPauseMenu(false);
  };

  // ダンジョン内移動ハンドラ
  const handleMove = (dx: number, dy: number) => {
      if (turnSystem.isProcessingTurn) return;
      if (gameState.isGameOver) return;
      
      const targetX = gameState.player.position.x + dx;
      const targetY = gameState.player.position.y + dy;

      movePlayer(targetX, targetY, turnSystem.handlePlayerMove);
  };

  // --- Render ---

  if (screen === 'title') {
    return (
        <TitleScreen 
            onStartGame={handleStartGame} 
            onContinueGame={handleContinue}
        />
    );
  }

  if (screen === 'nameInput') {
    return <NameInputScreen onSubmit={handleNameSubmit} />;
  }

  if (screen === 'jobSelect') {
    return <JobSelectScreen onSelect={handleJobSelect} />;
  }

  if (screen === 'godSelect') {
    return <GodSelectScreen onSelect={handleGodSelect} />;
  }

  if (screen === 'result') {
    return <ResultScreen gameState={gameState} onReturnToTitle={handleReturnToTitle} />;
  }

  // Main Game Loop UI (Town or Dungeon)
  return (
    <div className="relative w-full h-screen bg-black overflow-hidden select-none">
      
      {/* 1. Game World Layer */}
      {screen === 'dungeon' ? (
        <div className="relative w-full h-full flex items-center justify-center">
            {/* Dungeon Renderer would go here - using visualManager or direct canvas/div rendering */}
            {/* 簡易的なグリッド表示の代わり */}
            <div className="relative">
                {/* マップ描画 (renderer.tsの内容をコンポーネント化したものと想定) */}
                {/* プレイヤーや敵の表示 */}
                {/* ここは実装量が多いので、既存のメインロジックに任せるか、別途Rendererコンポーネントが必要 */}
                {/* 本サンプルでは省略し、HUDやメニューの統合を示す */}
                <div className="text-slate-500 text-center mt-20">
                    Dungeon View Check Renderer.ts
                    <br/>
                    (Rendering logic is handled by Canvas or Map Component)
                </div>
            </div>
            
            {/* ターゲティングオーバーレイ */}
            {targeting.isTargeting && (
                <TargetingOverlay 
                    gameState={gameState} 
                    cursorPos={targeting.cursorPos} 
                    validTargets={targeting.validTargets}
                />
            )}
        </div>
      ) : (
        <TownScreen 
            gameState={gameState}
            onGoDungeon={handleGoToDungeon}
            onOpenShop={() => setScreen('shop')}
            onRest={() => {
                playSE('heal');
                addLog('宿屋で休んでHP/MPが回復した。', 'success');
                setGameState(prev => ({ 
                    ...prev, 
                    player: { ...prev.player, hp: prev.player.maxHp, mp: prev.player.maxMp } 
                }));
            }}
            onSave={() => setShowPauseMenu(true)} // 街でもメニュー開けるように
        />
      )}

      {/* 2. HUD Layer */}
      <GameHUD 
        gameState={gameState}
        onOpenInventory={() => setShowInventory(true)}
        onOpenStatus={() => setShowStatus(true)}
        onOpenSkills={() => setShowSkills(true)}
      />

      {/* 3. Modal/Menu Layer */}
      {showInventory && (
        <InventoryMenu 
            player={gameState.player}
            onClose={() => setShowInventory(false)}
            onUseItem={itemSystem.useItem}
            onEquipItem={itemSystem.equipItem}
            onUnequipItem={itemSystem.unequipItem}
            onDropItem={itemSystem.dropItem}
        />
      )}

      {showStatus && (
        <StatusUpgradeMenu 
            player={gameState.player}
            onUpgrade={upgradeStat}
            onClose={() => setShowStatus(false)}
        />
      )}

      {showSkills && (
        <SkillTreeMenu 
            player={gameState.player}
            onLearn={skillSystem.learnSkill}
            onClose={() => setShowSkills(false)}
        />
      )}

      {screen === 'shop' && (
          <ShopMenu 
            player={gameState.player}
            onBuy={shopSystem.buyItem}
            onSell={shopSystem.sellItem}
            onClose={() => setScreen('town')}
          />
      )}

      {showPauseMenu && (
        <PauseMenu 
            gameState={gameState}
            onResume={() => setShowPauseMenu(false)}
            onReturnToTitle={handleReturnToTitle}
        />
      )}

      {/* 4. Event/Dialogue Layer */}
      {gameState.currentEvent && (
        <EventModal 
            event={gameState.currentEvent}
            onChoice={eventSystem.handleEventChoice}
        />
      )}
      
      {gameState.activeDialogue && (
        <DialogueWindow 
            dialogue={gameState.activeDialogue}
            onNext={eventSystem.advanceDialogue}
        />
      )}

      {/* 5. Tutorial */}
      {showTutorial && (
          <Tutorial onClose={() => setShowTutorial(false)} />
      )}

      {/* 6. Message Log (Overlay) */}
      <div className="fixed bottom-4 left-4 w-96 max-h-48 overflow-y-auto pointer-events-none fade-mask">
          <div className="flex flex-col gap-1 justify-end min-h-full">
            {gameState.logs.slice(-10).map((log) => (
                <div key={log.id} className={`text-sm font-bold drop-shadow-md animate-slide-in ${
                    log.type === 'danger' ? 'text-red-400' :
                    log.type === 'success' ? 'text-green-400' :
                    log.type === 'warning' ? 'text-yellow-400' : 'text-white'
                }`}>
                    {log.text}
                </div>
            ))}
          </div>
      </div>

    </div>
  );
}

export default App;
