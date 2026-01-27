import { useState, useEffect, useCallback } from 'react';
import { GameState, LogMessage } from '../types/gameState';
import { useDungeon } from './useDungeon';
import { usePlayer } from './usePlayer';
import { useTurnSystem } from './useTurnSystem';
import { useItemSystem } from './useItemSystem'; // 追加
import { connectChestLoot } from '../utils/loot'; // 追加
import { Position } from '../types';

export const useGameCore = () => {
  const [gameState, setGameState] = useState<GameState>({
    player: null as any,
    dungeon: null as any,
    enemies: [],
    turn: 1,
    logs: [],
    floor: 1,
    isGameOver: false,
    isGameClear: false
  });

  const { generateNewDungeon } = useDungeon();
  const { createInitialPlayer, useQuickPotion, refillPotions } = usePlayer();
  
  const addLog = useCallback((text: string, type: LogMessage['type'] = 'info') => {
    setGameState(prev => ({
      ...prev,
      logs: [
        { id: crypto.randomUUID(), text, type },
        ...prev.logs
      ].slice(0, 50)
    }));
  }, []);

  // アイテムシステム
  const { obtainItem } = useItemSystem(setGameState, addLog);

  const { handlePlayerAttack, handlePlayerMove: consumeMoveTurn, processTurnCycle, isProcessingTurn } = useTurnSystem(
    gameState,
    setGameState,
    addLog
  );

  // ゲーム開始処理
  const startGame = useCallback((playerName: string) => {
    const player = createInitialPlayer(playerName);
    const dungeon = generateNewDungeon(1);
    
    // スタート地点の設定
    if (dungeon.startPos) {
        player.position = { ...dungeon.startPos };
    }
    
    setGameState({
      player,
      dungeon,
      enemies: [], 
      turn: 1,
      logs: [{ id: 'init', text: 'ダンジョンに到着した。', type: 'info' }],
      floor: 1,
      isGameOver: false,
      isGameClear: false
    });
    
  }, [createInitialPlayer, generateNewDungeon]);

  // 移動ロジック
  const movePlayer = useCallback((dx: number, dy: number) => {
    if (isProcessingTurn || gameState.isGameOver) return;

    setGameState(prev => {
        const { player, dungeon, enemies } = prev;
        const newX = player.position.x + dx;
        const newY = player.position.y + dy;

        // 1. 壁判定
        if (
            newX < 0 || newX >= dungeon.width ||
            newY < 0 || newY >= dungeon.height ||
            dungeon.tiles[newY][newX] === 0 // 0:壁
        ) {
            // 移動不可（ログは出さないか、軽く出す）
            return prev;
        }

        // 2. 敵との衝突判定 -> 攻撃へ
        const targetEnemy = enemies.find(e => e.position.x === newX && e.position.y === newY);
        if (targetEnemy) {
            // ここで攻撃処理を呼び出すが、State更新関数の中なので直接呼べない
            // そのため、useEffectか、State更新の外で判定して分岐させる必要がある
            // 今回はシンプルに「移動不可」として返し、呼び出し元で攻撃に分岐させるパターンが望ましいが
            // キーハンドラ側で処理を分けるのが綺麗。
            return prev; 
        }

        // 3. 宝箱判定
        const chestIndex = dungeon.chests.findIndex(c => c.position.x === newX && c.position.y === newY && !c.isOpened);
        let updatedChests = dungeon.chests;
        
        if (chestIndex !== -1) {
            // 宝箱を開ける
            const chest = dungeon.chests[chestIndex];
            
            // State更新の外で副作用（アイテム獲得ログなど）を起こすためのフラグが必要だが
            // ここでは簡易的にアイテム獲得ロジックを分離できないため
            // 「移動後にアイテム獲得処理をフックする」仕組みが必要。
            // しかしReactのState更新は純粋関数であるべき。
            
            // 解決策: movePlayer関数全体を async にし、State更新前に各種判定を行う。
            return prev;
        }

        // 移動適用
        return {
            ...prev,
            player: {
                ...player,
                position: { x: newX, y: newY },
                direction: dx > 0 ? 'right' : dx < 0 ? 'left' : dy > 0 ? 'down' : 'up'
            }
        };
    });
  }, [gameState.isGameOver, isProcessingTurn]);


  /**
   * 実際の移動アクション（キー入力から呼ばれる）
   */
  const handleMoveAction = useCallback(async (dx: number, dy: number) => {
    if (isProcessingTurn || gameState.isGameOver) return;

    const current = gameState;
    const newX = current.player.position.x + dx;
    const newY = current.player.position.y + dy;

    // A. 敵への攻撃判定
    const targetEnemy = current.enemies.find(e => e.position.x === newX && e.position.y === newY);
    if (targetEnemy) {
        await handlePlayerAttack(targetEnemy.id);
        return;
    }

    // B. 壁判定
    if (
        newX < 0 || newX >= current.dungeon.width ||
        newY < 0 || newY >= current.dungeon.height ||
        current.dungeon.tiles[newY][newX] === 0
    ) {
        return; // 移動不可
    }

    // C. 宝箱判定と取得処理
    const chestIndex = current.dungeon.chests.findIndex(c => c.position.x === newX && c.position.y === newY && !c.isOpened);
    if (chestIndex !== -1) {
        const chest = current.dungeon.chests[chestIndex];
        addLog('宝箱を開けた！', 'success');

        // ドロップ抽選
        const loot = connectChestLoot(current.floor, current.player.stats.luc);
        if (loot) {
            obtainItem(loot.itemId, loot.amount);
        } else {
            addLog('空っぽだった...', 'info');
        }

        // 宝箱を開封済みにする更新
        setGameState(prev => {
            const newChests = [...prev.dungeon.chests];
            newChests[chestIndex] = { ...newChests[chestIndex], isOpened: true };
            return {
                ...prev,
                dungeon: { ...prev.dungeon, chests: newChests }
            };
        });
        
        // 宝箱の上には乗らない（あるいは乗る？今回は「乗って開ける」ではなく「ぶつかって開ける」にする）
        // ぶつかって開けた場合、ターン消費するか？ -> する
        // アイテム取得もターン経過させる
        await consumeMoveTurn(); // ここで移動扱いとしてCT消費だけ呼ぶ
        return;
    }

    // D. 移動実行
    setGameState(prev => ({
        ...prev,
        player: {
            ...prev.player,
            position: { x: newX, y: newY },
            direction: dx > 0 ? 'right' : dx < 0 ? 'left' : dy > 0 ? 'down' : 'up'
        }
    }));

    // ターン消費とサイクル開始
    await consumeMoveTurn();

  }, [gameState, isProcessingTurn, handlePlayerAttack, consumeMoveTurn, obtainItem, addLog, setGameState]);


  // キーボード操作
  useEffect(() => {
    if (gameState.isGameOver || isProcessingTurn) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // 移動キー
      if (e.key === 'ArrowUp') handleMoveAction(0, -1);
      else if (e.key === 'ArrowDown') handleMoveAction(0, 1);
      else if (e.key === 'ArrowLeft') handleMoveAction(-1, 0);
      else if (e.key === 'ArrowRight') handleMoveAction(1, 0);
      
      // ポーションショートカット (Q)
      else if (e.key === 'q' || e.key === 'Q') {
        useQuickPotion(gameState, setGameState, addLog);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, isProcessingTurn, handleMoveAction, useQuickPotion, addLog]);

  return {
    gameState,
    setGameState,
    addLog,
    startGame,
    useQuickPotion,
    refillPotions
  };
};
