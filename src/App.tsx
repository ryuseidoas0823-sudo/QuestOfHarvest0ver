import React, { useState, useEffect, useCallback, useRef } from 'react';
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
import { DungeonScene, DungeonSceneHandle } from './components/DungeonScene';

import { useGameCore } from './hooks/useGameCore';
import { useTurnSystem, VisualEventType } from './hooks/useTurnSystem';
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

  // --- Refs ---
  // ダンジョンシーン（Canvas）への参照。エフェクト再生などで使用。
  const dungeonSceneRef = useRef<DungeonSceneHandle>(null);

  // --- Visual Event Handler ---
  // ロジック側から視覚効果を呼び出すためのコールバック
  // useTurnSystem に渡され、攻撃命中時などに呼び出される
  const handleVisualEvent = useCallback((type: VisualEventType, pos: Position, value?: string | number, color?: string) => {
      if (!dungeonSceneRef.current) return;

      switch (type) {
          case 'damage':
          case 'heal':
          case 'miss':
              if (value !== undefined) {
                  dungeonSceneRef.current.addDamageText(value.toString(), pos.x, pos.y, color);
              }
              break;
          case 'effect':
              // ヒットエフェクトなど
              dungeonSceneRef.current.addHitEffect(pos.x, pos.y, color || '#ffff00');
              break;
      }
  }, []);

  // --- Hooks Initialization ---
  // 各システムフックの初期化
  const { addLog } = useGameCore(gameState, setGameState);
  const { gainExp, upgradeStat } = usePlayer(setGameState, addLog);
  const { movePlayer, generateNewDungeon, enterDungeon, exitDungeon } = useDungeon(setGameState, addLog);
  
  // useTurnSystemにvisualEventHandlerを渡す
  const turnSystem = useTurnSystem(gameState, setGameState, addLog, handleVisualEvent);
  
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
            eventSystem.handleEventChoice(0);
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
    setGameState(prev => ({ ...prev, player: { ...prev.player, job: jobId } }));
    setScreen('godSelect');
  };

  const handleGodSelect = (godId: string) => {
    playSE('decide');
    setGameState(prev => ({ ...prev, player: { ...prev.player, god: godId } }));
    setScreen('town');
    setShowTutorial(true);
  };

  const handleGoToDungeon = () => {
    playSE('stairs');
    enterDungeon();
    setScreen('dungeon');
  };

  const handleReturnToTown = () => {
    playSE('stairs');
    exitDungeon();
    setScreen('town');
  };

  const handleReturnToTitle = () => {
      stopBGM();
      setScreen('title');
      setShowPauseMenu(false);
  };

  const handleMove = (dx: number, dy: number) => {
      if (turnSystem.isProcessingTurn) return;
      if (gameState.isGameOver) return;
      
      const targetX = gameState.player.position.x + dx;
      const targetY = gameState.player.position.y + dy;

      movePlayer(targetX, targetY, turnSystem.handlePlayerMove);
  };

  const handleDungeonClick = (x: number, y: number) => {
      if (turnSystem.isProcessingTurn || gameState.isGameOver) return;
      
      if (targeting.isTargeting) {
          const enemy = gameState.enemies.find(e => e.position.x === x && e.position.y === y);
          if (enemy) {
              targeting.confirmTarget();
          }
      } else {
          const dx = x - gameState.player.position.x;
          const dy = y - gameState.player.position.y;
          
          // 敵をクリックしたら攻撃モードへ（簡易実装：隣接していれば即攻撃、遠ければ移動）
          const enemy = gameState.enemies.find(e => e.position.x === x && e.position.y === y);
          if (enemy) {
             const dist = Math.abs(dx) + Math.abs(dy);
             if (dist === 1) {
                 turnSystem.handlePlayerAttack(enemy.id);
                 return;
             }
          }

          if (Math.abs(dx) + Math.abs(dy) === 1) {
              handleMove(dx, dy);
          }
      }
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

  // Main Game Loop UI
  return (
    <div className="relative w-full h-screen bg-black overflow-hidden select-none">
      
      {screen === 'dungeon' ? (
        <div className="relative w-full h-full flex items-center justify-center">
            {/* Dungeon Renderer */}
            <DungeonScene 
                ref={dungeonSceneRef}
                gameState={gameState}
                onCellClick={handleDungeonClick}
            />
            
            {/* ターゲティングオーバーレイ */}
            {targeting.isTargeting && (
                <div className="absolute inset-0 pointer-events-none">
                    <TargetingOverlay 
                        gameState={gameState} 
                        cursorPos={targeting.cursorPos} 
                        validTargets={targeting.validTargets}
                    />
                </div>
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
            onSave={() => setShowPauseMenu(true)}
        />
      )}

      {/* UI Layer */}
      <GameHUD 
        gameState={gameState}
        onOpenInventory={() => setShowInventory(true)}
        onOpenStatus={() => setShowStatus(true)}
        onOpenSkills={() => setShowSkills(true)}
      />

      {/* Modal/Menu Layer */}
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

      {showTutorial && (
          <Tutorial onClose={() => setShowTutorial(false)} />
      )}

      {/* Message Log Overlay */}
      <div className="fixed bottom-4 left-4 w-96 max-h-48 overflow-y-auto pointer-events-none fade-mask z-20">
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
