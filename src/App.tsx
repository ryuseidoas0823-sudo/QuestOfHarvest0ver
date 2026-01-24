import React, { useState, useEffect, useRef } from 'react';
import TitleScreen from './components/TitleScreen';
import JobSelectScreen from './components/JobSelectScreen';
import GodSelectScreen from './components/GodSelectScreen';
import GameHUD from './components/GameHUD';
import InventoryMenu from './components/InventoryMenu';
import { GameState } from './types';
import { JobId } from './types/job';
import { createInitialPlayer, updateGameLogic, generateDungeon, activateSkill } from './gameLogic';

// ゲームの状態遷移
type AppPhase = 'title' | 'jobSelect' | 'godSelect' | 'game' | 'gameOver';

function App() {
  const [phase, setPhase] = useState<AppPhase>('title');
  const [gameState, setGameState] = useState<GameState | null>(null);
  
  const [selectedJob, setSelectedJob] = useState<JobId | null>(null);
  const [selectedGod, setSelectedGod] = useState<string | null>(null);
  
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const keysPressed = useRef<Record<string, boolean>>({});

  // ゲームループ
  useEffect(() => {
    if (phase !== 'game') return;

    let animationFrameId: number;

    const loop = () => {
      setGameState(prevState => {
        if (!prevState) return null;

        // updateGameLogic に移動処理も統合されたため、ここで呼び出すだけでOK
        let nextState = updateGameLogic(prevState, { keys: keysPressed.current });

        // ゲームオーバー判定
        if (nextState.player.stats.hp <= 0) {
            // ここでphaseを変えるとレンダリング中にエラーになる可能性があるため、
            // 実際はフラグを立ててuseEffectで処理するか、簡易的に許容する
             setTimeout(() => setPhase('gameOver'), 0);
        }

        return nextState;
      });

      animationFrameId = requestAnimationFrame(loop);
    };

    loop();
    return () => cancelAnimationFrame(animationFrameId);
  }, [phase]);

  // キーイベントハンドラ
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current[e.key] = true;

      if (phase !== 'game') return;

      if (e.key === 'i' || e.key === 'I') {
        setIsInventoryOpen(prev => !prev);
      }
      if (e.key === 'Escape') {
        setIsInventoryOpen(false);
      }

      // スキル発動 (Q, E, R)
      if (gameState && !isInventoryOpen) {
        let skillIndex = -1;
        if (e.key === 'q' || e.key === 'Q') skillIndex = 0;
        if (e.key === 'e' || e.key === 'E') skillIndex = 1;
        if (e.key === 'r' || e.key === 'R') skillIndex = 2;

        if (skillIndex !== -1 && gameState.player.skills && gameState.player.skills[skillIndex]) {
          const skillId = gameState.player.skills[skillIndex];
          setGameState(prev => prev ? activateSkill(prev, skillId) : null);
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current[e.key] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [phase, isInventoryOpen, gameState?.player.skills]);


  const handleJobSelect = (jobId: JobId) => {
    setSelectedJob(jobId);
    setPhase('godSelect');
  };

  const handleGodSelect = (godId: string) => {
    setSelectedGod(godId);
    if (selectedJob) {
      startGame(selectedJob, godId);
    }
  };

  const startGame = (jobId: JobId, godId: string) => {
    const startPos = { x: 5, y: 5 };
    const player = createInitialPlayer(jobId, godId, startPos);

    // 1階層目のダンジョン生成
    const dungeonData = generateDungeon(1, player);

    const initialState: GameState = {
      player: dungeonData.player,
      enemies: dungeonData.enemies,
      items: dungeonData.items,
      projectiles: [],
      inventory: ['potion_small'],
      map: dungeonData.map,
      gameTime: 0,
      floor: 1,
      messages: ['迷宮に入った...', 'WASDで移動、Q/Eでスキル、Iでインベントリ'],
      camera: { x: 0, y: 0 }
    };

    setGameState(initialState);
    setPhase('game');
  };
  
  const handleUseItem = (itemId: string) => { 
      // アイテム使用ロジック (簡易)
      setGameState(prev => {
          if(!prev) return null;
          // ... (Potion等の効果実装が必要) ...
          return prev; 
      });
  };

  // 簡易レンダラーヘルパー
  const renderTile = (tileId: number, x: number, y: number) => {
      const style = { left: x, top: y, width: 40, height: 40, position: 'absolute' as const };
      switch(tileId) {
          case 1: return <div key={`${x}-${y}`} style={{...style, backgroundColor: '#444'}} />; // Wall
          case 2: return <div key={`${x}-${y}`} style={{...style, backgroundColor: '#cf4420'}} />; // Lava
          case 3: return <div key={`${x}-${y}`} style={{...style, backgroundColor: '#d4af37', border: '4px solid #8B4513'}} />; // Door
          default: return null; // Floor (transparent)
      }
  };

  return (
    <div className="App w-full h-screen overflow-hidden bg-black text-white font-sans relative">
      {phase === 'title' && <TitleScreen onStart={() => setPhase('jobSelect')} />}
      {phase === 'jobSelect' && <JobSelectScreen onSelectJob={handleJobSelect} />}
      {phase === 'godSelect' && <GodSelectScreen onSelectGod={handleGodSelect} onBack={() => setPhase('jobSelect')} />}

      {phase === 'game' && gameState && (
        <>
          <div id="game-container" className="relative w-full h-full bg-gray-900 overflow-hidden">
             {/* マップ描画 (簡易) - 画面内のみ描画する最適化はしていないため重い可能性あり */}
             <div style={{ 
                 transform: `translate(${-gameState.player.x + window.innerWidth/2}px, ${-gameState.player.y + window.innerHeight/2}px)`,
                 transition: 'transform 0.1s linear'
             }}>
                 {/* 床・壁 */}
                 {gameState.map.tiles.map((row, y) => 
                    row.map((tile, x) => renderTile(tile, x * 40, y * 40))
                 )}
                 
                 {/* アイテム */}
                 {gameState.items.map(item => (
                     <div key={item.id} className="absolute w-6 h-6 bg-yellow-300 rounded-full flex items-center justify-center text-xs text-black font-bold"
                          style={{ left: item.x + 7, top: item.y + 7 }}>
                         ?
                     </div>
                 ))}

                 {/* 敵 */}
                 {gameState.enemies.map(enemy => (
                    <div key={enemy.id} className="absolute w-10 h-10 bg-red-600 rounded flex items-center justify-center z-10"
                        style={{ left: enemy.x, top: enemy.y }}>
                        E
                        <div className="absolute -top-3 w-full h-1 bg-gray-700">
                            <div className="bg-red-500 h-full" style={{width: `${(enemy.stats.hp / enemy.stats.maxHp) * 100}%`}}></div>
                        </div>
                    </div>
                 ))}

                {/* プレイヤー */}
                <div className="absolute w-10 h-10 rounded-full flex items-center justify-center shadow-lg border-2 border-white z-20"
                    style={{ left: gameState.player.x, top: gameState.player.y, backgroundColor: gameState.player.color || '#00ff00' }}>
                    P
                </div>

                {/* 飛び道具 */}
                {gameState.projectiles && gameState.projectiles.map(proj => (
                    <div key={proj.id} className="absolute w-4 h-4 bg-yellow-400 rounded-full z-30"
                        style={{ left: proj.x, top: proj.y }} />
                ))}
             </div>

             {/* 暗闇ゾーン (Overlay) */}
             {(gameState.map as any).isDark && (
                 <div className="absolute inset-0 pointer-events-none z-40"
                      style={{
                          background: `radial-gradient(circle at 50% 50%, transparent 150px, rgba(0,0,0,0.95) 300px)`
                      }}
                 />
             )}

            <GameHUD 
              player={gameState.player} 
              floor={gameState.floor}
              messages={gameState.messages}
            />
          </div>
          
          {isInventoryOpen && (
            <InventoryMenu 
              inventory={gameState.inventory || []}
              onClose={() => setIsInventoryOpen(false)}
              onUseItem={handleUseItem}
            />
          )}
        </>
      )}

      {phase === 'gameOver' && (
         <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-80 z-50">
             <div className="text-center">
                <h2 className="text-5xl text-red-600 mb-4">GAME OVER</h2>
                <button className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded" onClick={() => setPhase('title')}>Return to Title</button>
             </div>
         </div>
      )}
    </div>
  );
}

export default App;
