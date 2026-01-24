import React, { useState, useEffect, useRef } from 'react';
import TitleScreen from './components/TitleScreen';
import JobSelectScreen from './components/JobSelectScreen';
import GodSelectScreen from './components/GodSelectScreen';
import GameHUD from './components/GameHUD';
import InventoryMenu from './components/InventoryMenu';
import { GameState } from './types';
import { JobId } from './types/job';
import { createInitialPlayer, updateGameLogic, generateDungeon, activateSkill, useItem } from './gameLogic';

type AppPhase = 'title' | 'jobSelect' | 'godSelect' | 'game' | 'gameOver';

function App() {
  const [phase, setPhase] = useState<AppPhase>('title');
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [selectedJob, setSelectedJob] = useState<JobId | null>(null);
  const [selectedGod, setSelectedGod] = useState<string | null>(null);
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const keysPressed = useRef<Record<string, boolean>>({});

  useEffect(() => {
    if (phase !== 'game') return;

    let animationFrameId: number;
    const loop = () => {
      setGameState(prevState => {
        if (!prevState) return null;
        let nextState = updateGameLogic(prevState, { keys: keysPressed.current });
        if (nextState.player.stats.hp <= 0) {
             setTimeout(() => setPhase('gameOver'), 0);
        }
        return nextState;
      });
      animationFrameId = requestAnimationFrame(loop);
    };
    loop();
    return () => cancelAnimationFrame(animationFrameId);
  }, [phase]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current[e.key] = true;
      if (phase !== 'game') return;
      if (e.key === 'i' || e.key === 'I') setIsInventoryOpen(prev => !prev);
      if (e.key === 'Escape') setIsInventoryOpen(false);
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
    const handleKeyUp = (e: KeyboardEvent) => { keysPressed.current[e.key] = false; };
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
    if (selectedJob) startGame(selectedJob, godId);
  };
  const startGame = (jobId: JobId, godId: string) => {
    const startPos = { x: 5, y: 5 };
    const player = createInitialPlayer(jobId, godId, startPos);
    const dungeonData = generateDungeon(1, player);
    const initialState: GameState = {
      player: dungeonData.player,
      enemies: dungeonData.enemies,
      items: dungeonData.items,
      projectiles: [],
      inventory: ['potion_small'],
      equipment: { mainHand: null, armor: null }, // 初期装備なし
      floatingTexts: [], // 初期化
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
      setGameState(prev => prev ? useItem(prev, itemId) : null); 
  };

  const renderTile = (tileId: number, x: number, y: number) => {
      const style = { left: x, top: y, width: 40, height: 40, position: 'absolute' as const };
      switch(tileId) {
          case 1: return <div key={`${x}-${y}`} style={{...style, backgroundColor: '#444'}} />; // Wall
          case 2: return <div key={`${x}-${y}`} style={{...style, backgroundColor: '#cf4420'}} />; // Lava
          case 3: return <div key={`${x}-${y}`} style={{...style, backgroundColor: '#d4af37', border: '4px solid #8B4513'}} />; // Locked Door
          case 4: return <div key={`${x}-${y}`} style={{...style, backgroundColor: '#444'}} />; // Secret Wall
          case 5: return <div key={`${x}-${y}`} style={{...style, backgroundColor: '#0066cc', border: '2px solid #88ccff', opacity: 0.8 }} title="Stairs" />; // Stairs
          case 6: return <div key={`${x}-${y}`} style={{...style, backgroundColor: '#440000', border: '4px solid #ff0000'}} />; // Boss Door
          default: return null; 
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
             <div style={{ 
                 transform: `translate(${-gameState.player.x + window.innerWidth/2}px, ${-gameState.player.y + window.innerHeight/2}px)`,
                 transition: 'transform 0.1s linear'
             }}>
                 {gameState.map.tiles.map((row, y) => 
                    row.map((tile, x) => renderTile(tile, x * 40, y * 40))
                 )}
                 {gameState.items.map(item => (
                     <div key={item.id} className="absolute w-6 h-6 bg-yellow-300 rounded-full flex items-center justify-center text-xs text-black font-bold animate-bounce"
                          style={{ left: item.x + 7, top: item.y + 7 }}>?</div>
                 ))}
                 {gameState.enemies.map(enemy => (
                    <div key={enemy.id} className="absolute w-10 h-10 bg-red-600 rounded flex items-center justify-center z-10"
                        style={{ left: enemy.x, top: enemy.y }}>
                        E
                        <div className="absolute -top-3 w-full h-1 bg-gray-700">
                            <div className="bg-red-500 h-full" style={{width: `${(enemy.stats.hp / enemy.stats.maxHp) * 100}%`}}></div>
                        </div>
                    </div>
                 ))}
                <div className="absolute w-10 h-10 rounded-full flex items-center justify-center shadow-lg border-2 border-white z-20"
                    style={{ left: gameState.player.x, top: gameState.player.y, backgroundColor: gameState.player.color || '#00ff00' }}>
                    <div className="text-xs font-bold text-black">{gameState.player.stats.level}</div>
                </div>
                {gameState.projectiles && gameState.projectiles.map(proj => (
                    <div key={proj.id} className="absolute w-4 h-4 bg-yellow-400 rounded-full z-30" style={{ left: proj.x, top: proj.y }} />
                ))}
                
                {/* ダメージポップアップの描画 */}
                {gameState.floatingTexts && gameState.floatingTexts.map(ft => (
                    <div key={ft.id} 
                         className="absolute text-sm font-bold pointer-events-none z-50 text-shadow-sm"
                         style={{ 
                             left: ft.x, 
                             top: ft.y, 
                             color: ft.color,
                             textShadow: '1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000',
                             opacity: Math.min(1, ft.lifeTime / 300) // 最後はフェードアウト
                         }}>
                        {ft.text}
                    </div>
                ))}
             </div>
             {(gameState.map as any).isDark && (
                 <div className="absolute inset-0 pointer-events-none z-40"
                      style={{ background: `radial-gradient(circle at 50% 50%, transparent 150px, rgba(0,0,0,0.95) 300px)` }} />
             )}
            <GameHUD player={gameState.player} floor={gameState.floor} messages={gameState.messages} />
          </div>
          {isInventoryOpen && (
            <InventoryMenu 
              inventory={gameState.inventory || []} 
              equipment={gameState.equipment} // 装備データを渡す
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
                <p className="mb-4">到達階層: {gameState?.floor}F</p>
                <button className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded" onClick={() => setPhase('title')}>Return to Title</button>
             </div>
         </div>
      )}
    </div>
  );
}
export default App;
