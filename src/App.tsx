import React, { useState, useRef, useCallback, useEffect } from 'react';
import { DungeonScene, DungeonSceneHandle } from './components/DungeonScene';
import { GameHUD } from './components/GameHUD';
import { useTurnSystem, VisualEventType } from './hooks/useTurnSystem';
import { useGameCore } from './hooks/useGameCore';
import { useDungeon } from './hooks/useDungeon';
import { useItemSystem } from './hooks/useItemSystem'; // 追加
import { Position } from './types/gameState';
import { InventoryMenu } from './components/InventoryMenu'; // インベントリUIがあれば使う

// メインコンポーネント: 状態保持と配線のみを担当
const App: React.FC = () => {
  // --- Core Hooks & State ---
  const { gameState, setGameState, logManager } = useGameCore();
  const [showInventory, setShowInventory] = useState(false); // インベントリ表示フラグ
  
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
      case 'heal': // 新規追加
        dungeonSceneRef.current.playHealAnimation(pos.x, pos.y);
        break;
    }
  }, []);

  // --- Logic Hooks ---
  
  // Item System (New)
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
    handleVisualEvent
  );
  
  // Dungeon System
  const { handleMove } = useDungeon(
    gameState,
    setGameState,
    logManager.addLog,
    performPlayerAttack,
    addItem, // 宝箱用
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
    if (isProcessing || showInventory) return;
    
    const actionTaken = handleMove(x, y);
    if (actionTaken) {
        setIsProcessing(true);
    }
  }, [isProcessing, showInventory, handleMove, setIsProcessing]);

  // キーボード操作でインベントリを開くなどの処理が必要だが、
  // 今回は仮に画面右下にボタンを置くか、InventoryMenuを表示する
  const toggleInventory = () => setShowInventory(!showInventory);

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
      
      {/* 簡易インベントリボタン */}
      <div className="absolute bottom-4 right-4 z-50">
          <button 
            className="bg-gray-800 border-2 border-gray-600 px-4 py-2 rounded hover:bg-gray-700"
            onClick={toggleInventory}
          >
            ITEM ({inventory.length})
          </button>
      </div>

      {/* 3. Modal Layer */}
      {showInventory && (
          <div className="absolute inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
              {/* InventoryMenuコンポーネントがあれば使用、なければ簡易表示 */}
              <InventoryMenu 
                inventory={inventory}
                onUse={(item) => { useItem(item); }} // 使用時にターン経過させるなら setIsProcessing(true) も必要
                onEquip={equipItem}
                onClose={toggleInventory}
              />
          </div>
      )}
    </div>
  );
};

export default App;
