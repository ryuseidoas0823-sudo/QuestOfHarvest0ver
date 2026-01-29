import React, { useState, useRef, useCallback, useEffect } from 'react';
import { DungeonScene, DungeonSceneHandle } from './components/DungeonScene';
import { GameHUD } from './components/GameHUD';
import { useTurnSystem, VisualEventType } from './hooks/useTurnSystem';
import { useGameCore } from './hooks/useGameCore';
import { useDungeon } from './hooks/useDungeon';
import { useItemSystem } from './hooks/useItemSystem';
import { usePlayer } from './hooks/usePlayer';
import { Position } from './types/gameState';
import { InventoryMenu } from './components/InventoryMenu';
import { StatusUpgradeMenu } from './components/StatusUpgradeMenu'; // 追加

// メインコンポーネント: 状態保持と配線のみを担当
const App: React.FC = () => {
  // --- Core Hooks & State ---
  const { gameState, setGameState, logManager } = useGameCore();
  
  // UI表示フラグ
  const [showInventory, setShowInventory] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);

  // --- Refs ---
  const dungeonSceneRef = useRef<DungeonSceneHandle>(null);

  // --- Visual Event Handler (Wiring Hub) ---
  const handleVisualEvent = useCallback((type: VisualEventType, pos: Position, value?: string | number, color?: string) => {
    if (!dungeonSceneRef.current) return;

    switch (type) {
      case 'damage':
      case 'text':
        dungeonSceneRef.current.addDamageText(String(value), pos.x, pos.y, color);
        break;
      case 'effect':
        dungeonSceneRef.current.addHitEffect(pos.x, pos.y, color);
        break;
      case 'attack':
        if (typeof value === 'string') {
            const variant = (color === 'claw') ? 'claw' : 'slash';
            dungeonSceneRef.current.playAttackAnimation(pos.x, pos.y, value, variant);
        }
        break;
      case 'heal':
        dungeonSceneRef.current.playHealAnimation(pos.x, pos.y);
        break;
    }
  }, []);

  // --- Logic Hooks ---
  
  // Player System
  const { gainExp, upgradeStat } = usePlayer(
    gameState,
    setGameState,
    logManager.addLog,
    handleVisualEvent
  );
  
  // Item System
  const { inventory, addItem, useItem, equipItem } = useItemSystem(
      gameState,
      setGameState,
      logManager.addLog,
      handleVisualEvent
  );

  // Turn System
  const { performPlayerAttack, processEnemyTurn, isProcessing, setIsProcessing } = useTurnSystem(
    gameState, 
    setGameState, 
    logManager.addLog,
    handleVisualEvent,
    addItem, 
    gainExp
  );
  
  // Dungeon System
  const { handleMove } = useDungeon(
    gameState,
    setGameState,
    logManager.addLog,
    performPlayerAttack,
    addItem,
    handleVisualEvent
  );

  // --- Turn Management ---
  useEffect(() => {
    if (isProcessing) {
        const timer = setTimeout(() => {
            processEnemyTurn();
        }, 300);
        return () => clearTimeout(timer);
    }
  }, [isProcessing, processEnemyTurn]);

  // --- Event Handlers ---
  const onCellClick = useCallback((x: number, y: number) => {
    if (isProcessing || showInventory || showStatusMenu) return;
    
    const actionTaken = handleMove(x, y);
    if (actionTaken) {
        setIsProcessing(true);
    }
  }, [isProcessing, showInventory, showStatusMenu, handleMove, setIsProcessing]);

  const toggleInventory = () => setShowInventory(!showInventory);
  const toggleStatusMenu = () => setShowStatusMenu(!showStatusMenu);

  return (
    <div className="w-full h-screen bg-black relative overflow-hidden font-sans select-none text-white">
      {/* 1. Game World Layer */}
      <DungeonScene 
        ref={dungeonSceneRef}
        gameState={gameState}
        onCellClick={onCellClick}
      />

      {/* 2. HUD Layer */}
      <GameHUD 
        gameState={gameState} 
        logs={logManager.logs} 
      />
      
      {/* メニューボタン群 */}
      <div className="absolute bottom-4 right-4 z-40 flex gap-2">
          {/* レベルアップ可能な場合、ボタンを目立たせる */}
          <button 
            className={`
              border-2 px-4 py-2 rounded font-bold transition-colors
              ${gameState.player.statPoints > 0 
                ? 'bg-yellow-700 border-yellow-500 text-yellow-100 animate-pulse' 
                : 'bg-gray-800 border-gray-600 hover:bg-gray-700'}
            `}
            onClick={toggleStatusMenu}
          >
            STATUS {gameState.player.statPoints > 0 && <span className="ml-1 text-yellow-300">(!)</span>}
          </button>

          <button 
            className="bg-gray-800 border-2 border-gray-600 px-4 py-2 rounded hover:bg-gray-700"
            onClick={toggleInventory}
          >
            ITEM
          </button>
      </div>

      {/* 3. Modal Layer */}
      {/* インベントリ */}
      {showInventory && (
          <div className="absolute inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
              <InventoryMenu 
                inventory={inventory}
                onUse={(item) => { useItem(item); }}
                onEquip={equipItem}
                onClose={toggleInventory}
              />
          </div>
      )}

      {/* ステータス画面 */}
      {showStatusMenu && (
          <div className="absolute inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
            <StatusUpgradeMenu 
              player={gameState.player}
              onUpgrade={upgradeStat}
              onClose={toggleStatusMenu}
            />
          </div>
      )}
    </div>
  );
};

export default App;
