import React, { useState, useEffect, useCallback, useRef } from 'react';
import TitleScreen from './components/TitleScreen';
import JobSelectScreen from './components/JobSelectScreen';
import GameHUD from './components/GameHUD';
import InventoryMenu from './components/InventoryMenu';
import { GameState, JobType, PlayerEntity } from './types';
import { INITIAL_PLAYER_STATS } from './data';
import { generateWorldMap, updateSurvival } from './gameLogic';

const App: React.FC = () => {
  const [screen, setScreen] = useState<'title' | 'jobSelect' | 'game'>('title');
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const lastUpdateRef = useRef<number>(0);

  const startGame = (job: JobType, name: string, gender: 'male' | 'female') => {
    const initialStats = INITIAL_PLAYER_STATS[job];
    const player: PlayerEntity = {
      id: 'player-1',
      name: name || 'Hero',
      job,
      gender,
      level: 1,
      hp: initialStats.vit * 10,
      maxHp: initialStats.vit * 10,
      mp: initialStats.int * 10,
      maxMp: initialStats.int * 10,
      exp: 0,
      maxExp: 100,
      stats: initialStats,
      statPoints: 0,
      inventory: [],
      equipment: { weapon: null, shield: null, head: null, body: null, legs: null, accessory: null },
      hunger: 100, // 初期値100
      thirst: 100,
      energy: 100,
      x: 10,
      y: 10
    };

    setGameState({
      player,
      enemies: [],
      worldMap: generateWorldMap(50, 50),
      dayCount: 1,
      gameTime: 480 // 08:00 AM
    });
    setScreen('game');
  };

  // ゲームループ
  useEffect(() => {
    if (screen !== 'game' || !gameState) return;

    const gameLoop = (timestamp: number) => {
      if (!lastUpdateRef.current) lastUpdateRef.current = timestamp;
      const delta = timestamp - lastUpdateRef.current;
      lastUpdateRef.current = timestamp;

      setGameState(prev => {
        if (!prev) return null;

        // 時間の進行 (1分 = 1秒の実時間と仮定)
        const timeSpeed = 1; 
        let newTime = prev.gameTime + (delta / 1000) * timeSpeed;
        let newDay = prev.dayCount;
        if (newTime >= 1440) {
          newTime = 0;
          newDay += 1;
        }

        // サバイバル計算
        const updatedPlayer = updateSurvival(prev.player, delta);

        return {
          ...prev,
          player: updatedPlayer,
          gameTime: Math.floor(newTime),
          dayCount: newDay
        };
      });

      requestAnimationFrame(gameLoop);
    };

    const animId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animId);
  }, [screen, !!gameState]);

  // レベルアップ時のステータス割り振り用（既存ロジック流用）
  const upgradeStat = (statName: keyof PlayerEntity['stats']) => {
    if (!gameState || gameState.player.statPoints <= 0) return;
    setGameState(prev => {
      if (!prev) return null;
      const newStats = { ...prev.player.stats, [statName]: prev.player.stats[statName] + 1 };
      return {
        ...prev,
        player: {
          ...prev.player,
          stats: newStats,
          statPoints: prev.player.statPoints - 1,
          maxHp: newStats.vit * 10,
          maxMp: newStats.int * 10
        }
      };
    });
  };

  if (screen === 'title') return <TitleScreen onStart={() => setScreen('jobSelect')} />;
  if (screen === 'jobSelect') return <JobSelectScreen onSelect={startGame} onBack={() => setScreen('title')} />;
  
  if (gameState) {
    return (
      <div className="relative w-full h-screen bg-slate-900 overflow-hidden">
        {/* ワールド描画（仮） */}
        <div className="absolute inset-0 flex items-center justify-center text-white/10 text-9xl font-bold select-none">
          WORLD MAP
        </div>

        <GameHUD 
          player={gameState.player} 
          gameTime={gameState.gameTime} 
          dayCount={gameState.dayCount} 
          onOpenInventory={() => setIsInventoryOpen(true)}
        />

        {isInventoryOpen && (
          <InventoryMenu 
            player={gameState.player} 
            onClose={() => setIsInventoryOpen(false)} 
            onUpgradeStat={upgradeStat}
          />
        )}

        {/* 死亡時のオーバーレイ */}
        {gameState.player.hp <= 0 && (
          <div className="absolute inset-0 bg-red-900/80 flex flex-col items-center justify-center text-white z-50">
            <h2 className="text-6xl font-black mb-4">YOU DIED</h2>
            <p className="mb-8 text-xl">飢えか、渇きか、あるいは……</p>
            <button 
              onClick={() => setScreen('title')}
              className="px-8 py-3 bg-white text-red-900 font-bold rounded-lg hover:bg-gray-200"
            >
              TITLE BACK
            </button>
          </div>
        )}
      </div>
    );
  }

  return null;
};

export default App;
