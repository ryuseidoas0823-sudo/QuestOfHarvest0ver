import { useState, useCallback, useEffect } from 'react';
import { GameScreen } from '../types/gameState';
import { usePlayer } from './usePlayer';
import { useDungeon } from './useDungeon';
import { useTurnSystem } from './useTurnSystem';
import { useEventSystem } from './useEventSystem';
import { useGamepad } from './useGamepad';
import { Direction } from '../types';

/**
 * ゲーム全体のロジックを統括するカスタムフック
 * App.tsxからロジックを分離し、各サブシステム（Dungeon, Turn, Event）を連携させる
 */
export const useGameCore = () => {
  // --- State Management ---
  const [currentScreen, setCurrentScreen] = useState<GameScreen>('title');
  const [isPaused, setIsPaused] = useState(false);
  const [showInventory, setShowInventory] = useState(false);
  const [showStatus, setShowStatus] = useState(false);

  // --- Sub-Systems ---
  const player = usePlayer();
  const eventSystem = useEventSystem();
  
  // Dungeon System
  const dungeon = useDungeon(
    player.playerState,
    (updates) => player.updatePlayerStatus(updates)
  );

  // Turn System
  const turnSystem = useTurnSystem(
    player.playerState,
    dungeon.dungeonState,
    dungeon.updateEntityPosition,
    player.updatePlayerStatus,
    eventSystem.addLog,
    dungeon.damageEnemy // 追加
  );

  // Input System (Gamepad/Keyboard)
  const gamepad = useGamepad();

  // --- Game Flow Control ---

  // ゲーム開始（タイトル -> ジョブ選択）
  const handleStartGame = useCallback(() => {
    player.resetPlayer();
    setCurrentScreen('job_select');
  }, [player]);

  // ジョブ選択完了 -> 神選択
  const handleJobSelected = useCallback((jobId: any) => {
    player.selectJob(jobId);
    setCurrentScreen('god_select');
  }, [player]);

  // 神選択完了 -> 街へ（チュートリアル）
  const handleGodSelected = useCallback((godId: any) => {
    player.selectGod(godId);
    // 初回のみチュートリアルを表示するロジックを入れるならここ
    // 今回は簡易的にチュートリアル画面へ
    setCurrentScreen('tutorial');
  }, [player]);

  // チュートリアル終了 -> 街
  const handleTutorialComplete = useCallback(() => {
    setCurrentScreen('town');
  }, []);

  // ダンジョン探索開始
  const handleEnterDungeon = useCallback(() => {
    dungeon.generateFloor(1);
    setCurrentScreen('dungeon');
    eventSystem.addLog('ダンジョンに入った！');
  }, [dungeon, eventSystem]);

  // 街に戻る
  const handleReturnToTown = useCallback(() => {
    setCurrentScreen('town');
    // ダンジョン状態のリセット等は必要に応じて
  }, []);

  // --- Input Handling ---
  
  // プレイヤー移動処理
  const handleMove = useCallback((direction: Direction) => {
    if (currentScreen !== 'dungeon' || isPaused || eventSystem.eventState.isEventActive) return;
    if (turnSystem.turnState.isProcessing) return;

    const moved = dungeon.movePlayer(direction);
    if (moved) {
      turnSystem.advanceTurn();
    }
  }, [currentScreen, isPaused, eventSystem.eventState.isEventActive, turnSystem, dungeon]);

  // アクション（攻撃など）
  const handleAction = useCallback(() => {
    if (currentScreen !== 'dungeon' || isPaused) return;
    
    // 目の前の敵を攻撃
    // ※ 簡易実装：本来は攻撃範囲判定などが必要
    const target = dungeon.getFrontEnemy();
    if (target) {
      turnSystem.executePlayerAttack(target);
      turnSystem.advanceTurn();
    } else {
      // 空振り、または調査
      eventSystem.addLog('そこには何もいない。');
      turnSystem.advanceTurn();
    }
  }, [currentScreen, isPaused, dungeon, turnSystem, eventSystem]);

  // キーボード/ゲームパッド入力の監視
  useEffect(() => {
    if (gamepad.isPressed('UP')) handleMove('up');
    if (gamepad.isPressed('DOWN')) handleMove('down');
    if (gamepad.isPressed('LEFT')) handleMove('left');
    if (gamepad.isPressed('RIGHT')) handleMove('right');
    
    // 単押し判定が必要なものは別途ロジックが必要だが、一旦簡易的に
    if (gamepad.isPressed('A')) handleAction();
    
    // メニュー開閉など
    if (gamepad.isPressed('START')) setIsPaused(prev => !prev);
    if (gamepad.isPressed('Y')) setShowInventory(prev => !prev);

  }, [gamepad.inputState, handleMove, handleAction]);


  // --- Game Over / Clear Check ---
  useEffect(() => {
    if (player.playerState.hp <= 0 && currentScreen === 'dungeon') {
      setCurrentScreen('result');
    }
  }, [player.playerState.hp, currentScreen]);


  return {
    // States
    currentScreen,
    isPaused,
    setIsPaused,
    showInventory,
    setShowInventory,
    showStatus,
    setShowStatus,

    // Sub-System Hooks (exposed for UI)
    player,
    dungeon,
    turnSystem,
    eventSystem,

    // Handlers
    handlers: {
      onStartGame: handleStartGame,
      onJobSelect: handleJobSelected,
      onGodSelect: handleGodSelected,
      onTutorialComplete: handleTutorialComplete,
      onEnterDungeon: handleEnterDungeon,
      onReturnToTown: handleReturnToTown,
      onMove: handleMove,
      onAction: handleAction,
    }
  };
};
