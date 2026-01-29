import React, { useState, useRef, useCallback } from 'react';
import { DungeonScene, DungeonSceneHandle } from './components/DungeonScene';
import { GameHUD } from './components/GameHUD';
import { useTurnSystem, VisualEventType } from './hooks/useTurnSystem';
import { useGameCore } from './hooks/useGameCore';
import { useDungeon } from './hooks/useDungeon';
import { Position } from './types/gameState';

// メインコンポーネント: 状態保持と配線のみを担当
const App: React.FC = () => {
  // --- Core Hooks & State ---
  const { gameState, setGameState, logManager } = useGameCore();
  
  // --- Refs ---
  const dungeonSceneRef = useRef<DungeonSceneHandle>(null);

  // --- Visual Event Handler (Wiring Hub) ---
  // ロジック層(Hooks)からの視覚効果要求を、描画層(Components)へルーティングする
  const handleVisualEvent = useCallback((type: VisualEventType, pos: Position, value?: string | number, color?: string) => {
    if (!dungeonSceneRef.current) return;

    switch (type) {
      case 'damage':
        dungeonSceneRef.current.addDamageText(String(value), pos.x, pos.y, color);
        break;
      case 'text':
        dungeonSceneRef.current.addDamageText(String(value), pos.x, pos.y, color);
        break;
      case 'effect':
        dungeonSceneRef.current.addHitEffect(pos.x, pos.y, color);
        break;
      case 'attack':
        // 新規追加: 攻撃モーションの配線
        // value引数を方向(direction)として扱う規約
        if (typeof value === 'string') {
            dungeonSceneRef.current.playAttackAnimation(pos.x, pos.y, value);
        }
        break;
    }
  }, []);

  // --- Logic Hooks ---
  const { performPlayerAttack, isProcessing } = useTurnSystem(
    gameState, 
    setGameState, 
    logManager.addLog,
    handleVisualEvent
  );
  
  const { handleMove } = useDungeon(
    gameState,
    setGameState,
    logManager.addLog,
    performPlayerAttack // 敵がいる場合の攻撃アクションとして渡す
  );

  // --- Event Handlers ---
  const onCellClick = useCallback((x: number, y: number) => {
    if (isProcessing) return;
    
    // 簡易的な移動・攻撃ロジック
    handleMove(x, y);
  }, [isProcessing, handleMove]);

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
      
      {/* 3. Modal/Menu Layer (Inventory, Town, etc. - 省略) */}
    </div>
  );
};

export default App;
