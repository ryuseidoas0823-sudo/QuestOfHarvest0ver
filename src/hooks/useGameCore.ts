import { useState, useCallback, useEffect } from 'react';
import { GameScreen } from '../types/gameState';
import { usePlayer } from './usePlayer';
import { useDungeon } from './useDungeon';
import { useTurnSystem } from './useTurnSystem';
import { useEventSystem } from './useEventSystem';
import { useGamepad } from './useGamepad';
import { Direction } from '../types';

export const useGameCore = () => {
  const [currentScreen, setCurrentScreen] = useState<GameScreen>('title');
  const [isPaused, setIsPaused] = useState(false);
  const [showInventory, setShowInventory] = useState(false);
  const [showStatus, setShowStatus] = useState(false);
  const [showShop, setShowShop] = useState(false); // 追加

  const player = usePlayer();
  const eventSystem = useEventSystem();
  
  const dungeon = useDungeon(
    player.playerState,
    (updates) => player.updatePlayerStatus(updates)
  );

  const turnSystem = useTurnSystem(
    player.playerState,
    dungeon.dungeonState,
    dungeon.updateEntityPosition,
    player.updatePlayerStatus,
    eventSystem.addLog,
    dungeon.damageEnemy,
    player.gainExp
  );

  const gamepad = useGamepad();

  // --- Handlers ---

  const handleStartGame = useCallback(() => {
    player.resetPlayer();
    setCurrentScreen('name_input');
  }, [player]);

  const handleNameDecided = useCallback((name: string) => {
    player.updatePlayerStatus({ name });
    setCurrentScreen('job_select');
  }, [player]);

  const handleJobSelected = useCallback((jobId: any) => {
    player.selectJob(jobId);
    setCurrentScreen('god_select');
  }, [player]);

  const handleGodSelected = useCallback((godId: any) => {
    player.selectGod(godId);
    setCurrentScreen('tutorial');
  }, [player]);

  const handleTutorialComplete = useCallback(() => {
    setCurrentScreen('town');
  }, []);

  const handleEnterDungeon = useCallback(() => {
    dungeon.generateFloor(1);
    setCurrentScreen('dungeon');
    eventSystem.addLog('ダンジョンに入った！');
  }, [dungeon, eventSystem]);

  const handleReturnToTown = useCallback(() => {
    if (player.playerState.hp <= 0) {
        player.respawnAtTown();
        eventSystem.addLog('命からがら街に戻った... (所持金半減)');
    }
    setCurrentScreen('town');
  }, [player, eventSystem]);

  const handleHealAtInn = useCallback(() => {
      player.fullHeal();
      eventSystem.addLog('宿屋で休んで全回復した。');
  }, [player, eventSystem]);

  // --- Action Logic ---
  
  const handleMove = useCallback((direction: Direction) => {
    if (currentScreen !== 'dungeon' || isPaused || eventSystem.eventState.isEventActive) return;
    if (turnSystem.turnState.isProcessing) return;

    const moved = dungeon.movePlayer(direction);
    if (moved) {
      turnSystem.advanceTurn();
    }
  }, [currentScreen, isPaused, eventSystem.eventState.isEventActive, turnSystem, dungeon]);

  const handleAction = useCallback(() => {
    if (currentScreen !== 'dungeon' || isPaused) return;
    
    // 1. 目の前の敵を攻撃
    const targetEnemy = dungeon.getFrontEnemy();
    if (targetEnemy) {
      turnSystem.executePlayerAttack(targetEnemy);
      return;
    } 

    // 2. 目の前の宝箱を開ける
    const targetTile = dungeon.getFrontTile();
    if (targetTile && targetTile.type === 'chest' && !targetTile.meta?.opened) {
        const msg = dungeon.openChest(targetTile.x, targetTile.y);
        if (msg) eventSystem.addLog(msg);
        
        if (targetTile.meta?.itemId) {
            player.addItem(targetTile.meta.itemId);
        }
        turnSystem.advanceTurn();
        return;
    }
    
    // 3. 階段
    const currentTile = dungeon.dungeonState.map[player.playerState.y]?.[player.playerState.x];
    if (currentTile && (currentTile.type === 'stairs_down' || currentTile.type === 'stairs')) {
        const nextFloor = dungeon.dungeonState.floor + 1;
        dungeon.generateFloor(nextFloor);
        eventSystem.addLog(`地下${nextFloor}階へ降りた。`);
        return;
    }

    eventSystem.addLog('そこには何もない。');
    turnSystem.advanceTurn();

  }, [currentScreen, isPaused, dungeon, turnSystem, eventSystem, player]);

  const handleUseItem = useCallback((index: number) => {
      const msg = player.useItem(index);
      if (msg) {
          eventSystem.addLog(msg);
      }
  }, [player, eventSystem]);

  useEffect(() => {
    if (gamepad.isPressed('UP')) handleMove('up');
    if (gamepad.isPressed('DOWN')) handleMove('down');
    if (gamepad.isPressed('LEFT')) handleMove('left');
    if (gamepad.isPressed('RIGHT')) handleMove('right');
    if (gamepad.isPressed('A')) handleAction();
    if (gamepad.isPressed('START')) setIsPaused(prev => !prev);
    if (gamepad.isPressed('Y')) setShowInventory(prev => !prev);
  }, [gamepad.inputState, handleMove, handleAction]);

  useEffect(() => {
    if (player.playerState.hp <= 0 && currentScreen === 'dungeon') {
        const timer = setTimeout(() => {
            setCurrentScreen('result');
        }, 500);
        return () => clearTimeout(timer);
    }
  }, [player.playerState.hp, currentScreen]);

  useEffect(() => {
    if (player.levelUpLog) {
      eventSystem.addLog(player.levelUpLog);
      player.clearLevelUpLog();
    }
  }, [player.levelUpLog, eventSystem, player]);


  return {
    currentScreen,
    isPaused,
    setIsPaused,
    showInventory,
    setShowInventory,
    showStatus,
    setShowStatus,
    showShop,    // 追加
    setShowShop, // 追加
    player,
    dungeon,
    turnSystem,
    eventSystem,
    handlers: {
      onStartGame: handleStartGame,
      onNameDecided: handleNameDecided,
      onJobSelect: handleJobSelected,
      onGodSelect: handleGodSelected,
      onTutorialComplete: handleTutorialComplete,
      onEnterDungeon: handleEnterDungeon,
      onReturnToTown: handleReturnToTown,
      onHealAtInn: handleHealAtInn,
      onMove: handleMove,
      onAction: handleAction,
      onUseItem: handleUseItem,
    }
  };
};
