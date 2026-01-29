import React, { useState, useRef, useCallback, useEffect } from 'react';
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
        // value=direction, color=variant ('slash' | 'claw')
        if (typeof value === 'string') {
            // color引数をvariantとして利用。未指定なら 'slash'
            const variant = (color === 'claw') ? 'claw' : 'slash';
            dungeonSceneRef.current.playAttackAnimation(pos.x, pos.y, value, variant);
        }
        break;
    }
  }, []);

  // --- Logic Hooks ---
  const { performPlayerAttack, processEnemyTurn, isProcessing, setIsProcessing } = useTurnSystem(
    gameState, 
    setGameState, 
    logManager.addLog,
    handleVisualEvent
  );
  
  const { handleMove } = useDungeon(
    gameState,
    setGameState,
    logManager.addLog,
    performPlayerAttack
  );

  // --- Turn Management ---
  // プレイヤーの行動が終わった後、敵のターンへ
  useEffect(() => {
    if (isProcessing) {
        // 少し待ってから敵ターンを実行（演出用ウェイト）
        const timer = setTimeout(() => {
            processEnemyTurn();
        }, 300);
        return () => clearTimeout(timer);
    }
  }, [isProcessing, processEnemyTurn]);

  // --- Event Handlers ---
  const onCellClick = useCallback((x: number, y: number) => {
    if (isProcessing) return;
    
    // 移動または攻撃処理（内部で isProcessing = true になる）
    const actionTaken = handleMove(x, y);
    if (actionTaken) {
        setIsProcessing(true);
    }
  }, [isProcessing, handleMove, setIsProcessing]);

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
    </div>
  );
};

export default App;
