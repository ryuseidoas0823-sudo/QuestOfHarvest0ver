import React, { useState, useEffect, useCallback, useRef } from 'react';
import { TitleScreen } from './components/TitleScreen';
import { JobSelectScreen } from './components/JobSelectScreen';
import GameHUD from './components/GameHUD';
import { InventoryMenu } from './components/InventoryMenu';
import { GameState, JobType, PlayerEntity, ResolutionMode, Gender } from './types';
import { INITIAL_PLAYER_STATS } from './data';
import { generateWorldMap, updateSurvival, spawnMonsters, updateEnemyAI } from './gameLogic';
import * as Assets from './assets';

/**
 * Quest of Harvest - メインアプリケーションコンポーネント
 * 設計書(Doc 01-05)に基づき、サバイバル・リアルタイムアクション・
 * キャラクタービルドの各システムを統合します。
 */
const App: React.FC = () => {
  // --- 画面状態・グローバル設定 ---
  const [screen, setScreen] = useState<'title' | 'jobSelect' | 'game'>('title');
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const [resolution, setResolution] = useState<ResolutionMode>('auto');
  const lastUpdateRef = useRef<number>(0);

  // --- 定数 ---
  const TILE_SIZE = 48;
  const MAP_SIZE = 50;

  /**
   * ゲームの初期化
   */
  const startGame = (job: JobType, gender: Gender) => {
    const initialStats = INITIAL_PLAYER_STATS[job];
    const player: PlayerEntity = {
      id: 'player-1',
      name: 'Hero',
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
      hunger: 100,
      thirst: 100,
      energy: 100,
      x: 25,
      y: 25,
      width: 64,
      height: 96,
      visualWidth: 64,
      visualHeight: 96,
      isMoving: false,
      animFrame: 0,
      direction: 'right',
      lastAttackTime: 0,
      invincibleUntil: 0
    };

    const worldMap = generateWorldMap(MAP_SIZE, MAP_SIZE);
    setGameState({
      player,
      enemies: spawnMonsters(worldMap, 20, 1),
      worldMap: worldMap,
      dayCount: 1,
      gameTime: 480,
      droppedItems: [],
      particles: [],
      floatingTexts: [],
      camera: { x: 25, y: 25 }
    });
    setScreen('game');
  };

  /**
   * プレイヤーの移動
   */
  const movePlayer = useCallback((dx: number, dy: number) => {
    setGameState(prev => {
      if (!prev || prev.player.hp <= 0 || isInventoryOpen) return prev;
      const newX = Math.max(0, Math.min(MAP_SIZE - 1, prev.player.x + dx));
      const newY = Math.max(0, Math.min(MAP_SIZE - 1, prev.player.y + dy));
      
      if (prev.worldMap[newY][newX] === 1) return prev;

      return {
        ...prev,
        player: { 
          ...prev.player, 
          x: newX, 
          y: newY,
          direction: dx < 0 ? 'left' : dx > 0 ? 'right' : prev.player.direction,
          isMoving: true
        },
        camera: { x: newX, y: newY }
      };
    });
    
    setTimeout(() => {
      setGameState(prev => prev ? { ...prev, player: { ...prev.player, isMoving: false } } : null);
    }, 150);
  }, [isInventoryOpen]);

  /**
   * 攻撃アクション
   */
  const handlePlayerAttack = () => {
    const now = Date.now();
    setGameState(prev => {
      if (!prev || prev.player.hp <= 0 || now - prev.player.lastAttackTime < 400) return prev;
      
      const player = prev.player;
      const attackX = player.x + (player.direction === 'right' ? 1 : -1);
      const attackY = player.y;

      const hitEnemies = prev.enemies.map(enemy => {
        if (enemy.x === attackX && enemy.y === attackY) {
          const damage = Math.max(5, Math.floor(player.stats.str * 1.5));
          return { ...enemy, hp: Math.max(0, enemy.hp - damage) };
        }
        return enemy;
      }).filter(enemy => enemy.hp > 0);

      return {
        ...prev,
        enemies: hitEnemies,
        player: { ...player, lastAttackTime: now }
      };
    });
  };

  /**
   * 採取・インタラクション
   */
  const handleInteract = () => {
    setGameState(prev => {
      if (!prev) return null;
      const { x, y } = prev.player;
      const tileType = prev.worldMap[y][x];
      const player = { ...prev.player };

      if (tileType === 0) {
        player.hunger = Math.min(100, player.hunger + 8);
      }
      
      const isNearWater = [
        prev.worldMap[y][x],
        prev.worldMap[y-1]?.[x],
        prev.worldMap[y+1]?.[x],
        prev.worldMap[y]?.[x-1],
        prev.worldMap[y]?.[x+1],
      ].includes(1);

      if (isNearWater) {
        player.thirst = Math.min(100, player.thirst + 15);
      }

      return { ...prev, player };
    });
  };

  useEffect(() => {
    if (screen !== 'game' || isInventoryOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key.toLowerCase()) {
        case 'w': case 'arrowup': movePlayer(0, -1); break;
        case 's': case 'arrowdown': movePlayer(0, 1); break;
        case 'a': case 'arrowleft': movePlayer(-1, 0); break;
        case 'd': case 'arrowright': movePlayer(1, 0); break;
        case 'e': handleInteract(); break;
        case 'i': case 'escape': setIsInventoryOpen(prev => !prev); break;
        case ' ': handlePlayerAttack(); break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [screen, isInventoryOpen, movePlayer]);

  useEffect(() => {
    if (screen !== 'game' || !gameState) return;

    const gameLoop = (timestamp: number) => {
      if (!lastUpdateRef.current) lastUpdateRef.current = timestamp;
      const delta = timestamp - lastUpdateRef.current;
      lastUpdateRef.current = timestamp;

      setGameState(prev => {
        if (!prev || prev.player.hp <= 0) return prev;

        const now = Date.now();
        const updatedPlayer = updateSurvival(prev.player, delta);
        
        let totalDamageToPlayer = 0;
        const updatedEnemies = prev.enemies.map(enemy => {
          const { enemy: newEnemy, damageToPlayer } = updateEnemyAI(enemy, updatedPlayer, prev.worldMap, now, delta);
          totalDamageToPlayer += damageToPlayer;
          return newEnemy;
        });

        if (totalDamageToPlayer > 0 && now > updatedPlayer.invincibleUntil) {
          updatedPlayer.hp = Math.max(0, updatedPlayer.hp - totalDamageToPlayer);
          updatedPlayer.invincibleUntil = now + 800;
        }

        let newTime = prev.gameTime + (delta / 1000); 
        let newDay = prev.dayCount;
        if (newTime >= 1440) {
          newTime = 0;
          newDay += 1;
        }

        return {
          ...prev,
          player: updatedPlayer,
          enemies: updatedEnemies,
          gameTime: Math.floor(newTime),
          dayCount: newDay
        };
      });

      requestAnimationFrame(gameLoop);
    };

    const animId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animId);
  }, [screen, !!gameState]);

  const upgradeStat = (statName: keyof PlayerEntity['stats']) => {
    if (!gameState || gameState.player.statPoints <= 0) return;
    setGameState(prev => {
      if (!prev) return null;
      const currentVal = prev.player.stats[statName];
      const newStats = { ...prev.player.stats, [statName]: currentVal + 1 };
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

  const getPlayerSVG = () => {
    if (!gameState) return null;
    const { job, gender } = gameState.player;
    const jobKey = job.toLowerCase() as keyof typeof Assets;
    const assets = (Assets as any)[jobKey]?.HERO_ASSETS;
    if (!assets) return null;
    return gender === 'male' ? assets.male.idle : assets.female.idle;
  };

  if (screen === 'title') {
    return (
      <TitleScreen 
        onStart={() => setScreen('jobSelect')} 
        onContinue={() => {}} 
        canContinue={false} 
        resolution={resolution} 
        setResolution={setResolution} 
      />
    );
  }

  if (screen === 'jobSelect') {
    return (
      <JobSelectScreen 
        onSelect={startGame} 
        onBack={() => setScreen('title')} 
      />
    );
  }
  
  if (gameState) {
    const { player, worldMap, enemies } = gameState;
    const viewWidth = 15;
    const viewHeight = 11;
    const startX = Math.max(0, Math.min(MAP_SIZE - viewWidth, player.x - Math.floor(viewWidth / 2)));
    const startY = Math.max(0, Math.min(MAP_SIZE - viewHeight, player.y - Math.floor(viewHeight / 2)));

    return (
      <div className="relative w-full h-screen bg-slate-950 overflow-hidden flex items-center justify-center">
        <div 
          className="relative bg-green-900 border-4 border-slate-800 shadow-2xl overflow-hidden" 
          style={{ width: viewWidth * TILE_SIZE, height: viewHeight * TILE_SIZE }}
        >
          <div 
            className="absolute transition-all duration-100 ease-out" 
            style={{ 
              left: -(startX * TILE_SIZE), 
              top: -(startY * TILE_SIZE), 
              display: 'grid', 
              gridTemplateColumns: `repeat(${MAP_SIZE}, ${TILE_SIZE}px)` 
            }}
          >
            {worldMap.map((row, y) => row.map((tile, x) => (
              <div 
                key={`${x}-${y}`} 
                style={{ width: TILE_SIZE, height: TILE_SIZE }} 
                className={`border-[0.5px] border-black/5 flex items-center justify-center ${tile === 0 ? 'bg-emerald-800' : 'bg-blue-600'}`}
              >
                {tile === 0 && Math.random() > 0.98 && <span className="opacity-20 text-[10px]">🌿</span>}
              </div>
            )))}
          </div>

          {enemies.map(enemy => (
            <div 
              key={enemy.id} 
              className="absolute transition-all duration-300 z-5" 
              style={{ 
                left: (enemy.x - startX) * TILE_SIZE, 
                top: (enemy.y - startY) * TILE_SIZE, 
                width: TILE_SIZE, 
                height: TILE_SIZE, 
                transform: enemy.direction === 'left' ? 'scaleX(-1)' : 'scaleX(1)' 
              }}
            >
              <div className="w-full h-full flex flex-col items-center justify-center">
                {enemy.behavior === 'chase' && (
                  <div className="absolute -top-4 w-6 h-6 bg-red-600 rounded-full border border-white flex items-center justify-center text-[10px] text-white font-bold animate-bounce">!</div>
                )}
                <div className={`w-8 h-8 rounded-lg shadow-lg ${enemy.rarity === 'Boss' ? 'bg-purple-600 scale-150' : 'bg-red-500'}`} />
                <div className="w-full h-1 bg-gray-900 rounded-full mt-1 overflow-hidden">
                  <div className="h-full bg-red-500" style={{ width: `${(enemy.hp / enemy.maxHp) * 100}%` }} />
                </div>
              </div>
            </div>
          ))}

          <div 
            className="absolute transition-all duration-200 z-10" 
            style={{ 
              left: (player.x - startX) * TILE_SIZE, 
              top: (player.y - startY) * TILE_SIZE, 
              width: TILE_SIZE, 
              height: TILE_SIZE, 
              transform: player.direction === 'left' ? 'scaleX(-1)' : 'scaleX(1)',
              opacity: Date.now() < player.invincibleUntil && Math.floor(Date.now() / 100) % 2 === 0 ? 0.4 : 1 
            }}
          >
            <svg 
              viewBox="0 0 64 96" 
              className="w-full h-full drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)]" 
              dangerouslySetInnerHTML={{ __html: getPlayerSVG() || '' }} 
            />
            {Date.now() - player.lastAttackTime < 150 && (
              <div className={`absolute top-0 ${player.direction === 'right' ? 'left-full' : 'right-full'} w-full h-full bg-white/40 rounded-full animate-ping border-2 border-blue-400`} />
            )}
          </div>
        </div>

        <div className="absolute bottom-6 left-6 text-white/60 text-[10px] font-mono bg-black/50 p-3 rounded-lg border border-white/10 backdrop-blur-sm space-y-1">
          <div className="flex items-center gap-2"><span className="bg-white/20 px-1 rounded text-white">WASD</span> MOVE</div>
          <div className="flex items-center gap-2"><span className="bg-white/20 px-1 rounded text-white">SPACE</span> ATTACK</div>
          <div className="flex items-center gap-2"><span className="bg-white/20 px-1 rounded text-white">E</span> GATHER FOOD/WATER</div>
          <div className="flex items-center gap-2"><span className="bg-white/20 px-1 rounded text-white">I / ESC</span> MENU</div>
        </div>

        <GameHUD 
          player={player} 
          gameTime={gameState.gameTime} 
          dayCount={gameState.dayCount} 
          onOpenInventory={() => setIsInventoryOpen(true)} 
        />

        {isInventoryOpen && (
          <InventoryMenu 
            player={player} 
            onClose={() => setIsInventoryOpen(false)} 
            onUpgradeStat={upgradeStat} 
          />
        )}

        {player.hp <= 0 && (
          <div className="absolute inset-0 bg-red-950/90 flex flex-col items-center justify-center text-white z-50 animate-in fade-in duration-1000">
            <h2 className="text-8xl font-black mb-2 tracking-tighter text-red-600 drop-shadow-2xl">DEFEATED</h2>
            <p className="text-red-200/60 mb-12 italic font-serif">"The cycle of the harvest ends..."</p>
            <button 
              onClick={() => setScreen('title')} 
              className="px-12 py-4 bg-white text-red-950 font-bold rounded-full hover:bg-red-100 transition-all shadow-2xl active:scale-95"
            >
              RETURN TO TITLE
            </button>
          </div>
        )}
      </div>
    );
  }

  return null;
};

export default App;
