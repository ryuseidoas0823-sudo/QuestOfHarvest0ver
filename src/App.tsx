import React, { useState, useEffect, useCallback, useRef } from 'react';
import { TitleScreen } from './components/TitleScreen';
import { JobSelectScreen } from './components/JobSelectScreen';
import GameHUD from './components/GameHUD';
import { InventoryMenu } from './components/InventoryMenu';
import { GameState, JobType, PlayerEntity, ResolutionMode, Gender, EnemyEntity } from './types';
import { INITIAL_PLAYER_STATS } from './data';
import { generateWorldMap, updateSurvival, spawnMonsters, updateEnemyAI } from './gameLogic';
import * as Assets from './assets';

const App: React.FC = () => {
  const [screen, setScreen] = useState<'title' | 'jobSelect' | 'game'>('title');
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const [direction, setDirection] = useState<'left' | 'right'>('right');
  const [resolution, setResolution] = useState<ResolutionMode>('auto');
  const lastUpdateRef = useRef<number>(0);

  const TILE_SIZE = 48;
  const MAP_SIZE = 50;

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
      enemies: spawnMonsters(worldMap, 15, 1),
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

  const movePlayer = useCallback((dx: number, dy: number) => {
    setGameState(prev => {
      if (!prev || prev.player.hp <= 0) return prev;
      const newX = Math.max(0, Math.min(MAP_SIZE - 1, prev.player.x + dx));
      const newY = Math.max(0, Math.min(MAP_SIZE - 1, prev.player.y + dy));
      
      if (prev.worldMap[newY][newX] === 1) return prev;
      if (dx < 0) setDirection('left');
      if (dx > 0) setDirection('right');

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
    }, 200);
  }, []);

  // プレイヤーの攻撃アクション
  const handlePlayerAttack = () => {
    const now = Date.now();
    setGameState(prev => {
      if (!prev || prev.player.hp <= 0 || now - prev.player.lastAttackTime < 500) return prev;
      
      const player = prev.player;
      // 前方1マスの敵にダメージ
      const attackX = player.x + (player.direction === 'right' ? 1 : -1);
      const attackY = player.y;

      const hitEnemies = prev.enemies.map(enemy => {
        if (enemy.x === attackX && enemy.y === attackY) {
          const damage = Math.max(5, player.stats.str * 2);
          return { ...enemy, hp: Math.max(0, enemy.hp - damage) };
        }
        return enemy;
      }).filter(enemy => enemy.hp > 0); // 死亡判定

      return {
        ...prev,
        enemies: hitEnemies,
        player: { ...player, lastAttackTime: now }
      };
    });
  };

  const handleInteract = () => {
    setGameState(prev => {
      if (!prev) return null;
      const tileType = prev.worldMap[prev.player.y][prev.player.x];
      const player = { ...prev.player };
      if (tileType === 0) player.hunger = Math.min(100, player.hunger + 5);
      
      const nearWater = [
        prev.worldMap[prev.player.y][prev.player.x],
        prev.worldMap[prev.player.y-1]?.[prev.player.x],
        prev.worldMap[prev.player.y+1]?.[prev.player.x],
        prev.worldMap[prev.player.y]?.[prev.player.x-1],
        prev.worldMap[prev.player.y]?.[prev.player.x+1],
      ].includes(1);

      if (nearWater) player.thirst = Math.min(100, player.thirst + 10);
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
        case 'i': setIsInventoryOpen(prev => !prev); break;
        case ' ': handlePlayerAttack(); break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [screen, isInventoryOpen, movePlayer]);

  // ゲームループ
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
        
        // 敵AIの更新
        let totalDamageToPlayer = 0;
        const updatedEnemies = prev.enemies.map(enemy => {
          const { enemy: newEnemy, damageToPlayer } = updateEnemyAI(enemy, updatedPlayer, prev.worldMap, now, delta);
          totalDamageToPlayer += damageToPlayer;
          return newEnemy;
        });

        // プレイヤーへの被ダメージ（無敵時間チェック）
        if (totalDamageToPlayer > 0 && now > updatedPlayer.invincibleUntil) {
          updatedPlayer.hp = Math.max(0, updatedPlayer.hp - totalDamageToPlayer);
          updatedPlayer.invincibleUntil = now + 1000; // 1秒間無敵
        }

        const timeSpeed = 1; 
        let newTime = prev.gameTime + (delta / 1000) * timeSpeed;
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
      <TitleScreen onStart={() => setScreen('jobSelect')} onContinue={() => {}} canContinue={false} resolution={resolution} setResolution={setResolution} />
    );
  }

  if (screen === 'jobSelect') {
    return (
      <JobSelectScreen onSelect={startGame} onBack={() => setScreen('title')} />
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
        <div className="relative bg-green-900 border-4 border-slate-800 shadow-2xl overflow-hidden" style={{ width: viewWidth * TILE_SIZE, height: viewHeight * TILE_SIZE }}>
          {/* マップタイル */}
          <div className="absolute transition-all duration-100 ease-out" style={{ left: -(startX * TILE_SIZE), top: -(startY * TILE_SIZE), display: 'grid', gridTemplateColumns: `repeat(${MAP_SIZE}, ${TILE_SIZE}px)` }}>
            {worldMap.map((row, y) => row.map((tile, x) => (
              <div key={`${x}-${y}`} style={{ width: TILE_SIZE, height: TILE_SIZE }} className={`border-[0.5px] border-black/5 ${tile === 0 ? 'bg-emerald-800' : 'bg-blue-600'}`}>
                {tile === 0 && Math.random() > 0.98 && <span className="opacity-30 flex items-center justify-center h-full text-xs">🌿</span>}
              </div>
            )))}
          </div>

          {/* 敵キャラクターの描画 */}
          {enemies.map(enemy => (
            <div key={enemy.id} className="absolute transition-all duration-300 z-5" style={{ left: (enemy.x - startX) * TILE_SIZE, top: (enemy.y - startY) * TILE_SIZE, width: TILE_SIZE, height: TILE_SIZE, transform: enemy.direction === 'left' ? 'scaleX(-1)' : 'scaleX(1)' }}>
              <div className="w-full h-full flex flex-col items-center justify-center">
                <div className="w-8 h-8 bg-red-600 rounded-full border-2 border-red-900 shadow-lg animate-bounce flex items-center justify-center text-[10px] text-white font-bold">!</div>
                <div className="w-full h-1 bg-gray-800 rounded-full mt-1 overflow-hidden border border-black/50">
                  <div className="h-full bg-red-500" style={{ width: `${(enemy.hp / enemy.maxHp) * 100}%` }} />
                </div>
              </div>
            </div>
          ))}

          {/* プレイヤー */}
          <div className="absolute transition-all duration-200 z-10" style={{ left: (player.x - startX) * TILE_SIZE, top: (player.y - startY) * TILE_SIZE, width: TILE_SIZE, height: TILE_SIZE, transform: direction === 'left' ? 'scaleX(-1)' : 'scaleX(1)', opacity: Date.now() < player.invincibleUntil && Math.floor(Date.now() / 100) % 2 === 0 ? 0.5 : 1 }}>
            <svg viewBox="0 0 64 96" className="w-full h-full drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)]" dangerouslySetInnerHTML={{ __html: getPlayerSVG() || '' }} />
            {/* 攻撃エフェクト（簡易） */}
            {Date.now() - player.lastAttackTime < 150 && (
              <div className={`absolute top-0 ${player.direction === 'right' ? 'left-full' : 'right-full'} w-full h-full bg-blue-400/50 rounded-full animate-ping`} />
            )}
          </div>
        </div>

        <div className="absolute bottom-4 left-4 text-white/50 text-xs font-mono bg-black/40 p-2 rounded">
          [WASD] MOVE | [SPACE] ATTACK | [E] GATHER | [I] STATUS
        </div>

        <GameHUD player={player} gameTime={gameState.gameTime} dayCount={gameState.dayCount} onOpenInventory={() => setIsInventoryOpen(true)} />
        {isInventoryOpen && <InventoryMenu player={player} onClose={() => setIsInventoryOpen(false)} onUpgradeStat={upgradeStat} />}

        {player.hp <= 0 && (
          <div className="absolute inset-0 bg-red-950/90 flex flex-col items-center justify-center text-white z-50 animate-in fade-in duration-1000">
            <h2 className="text-7xl font-black mb-4 tracking-tighter text-red-500">GAMEOVER</h2>
            <button onClick={() => setScreen('title')} className="px-10 py-4 bg-white text-red-950 font-bold rounded-full hover:bg-red-100 transition-colors shadow-xl">TRY AGAIN</button>
          </div>
        )}
      </div>
    );
  }

  return null;
};

export default App;
