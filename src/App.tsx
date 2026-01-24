import React, { useState, useEffect, useRef } from 'react';
import TitleScreen from './components/TitleScreen';
import JobSelectScreen from './components/JobSelectScreen';
import GodSelectScreen from './components/GodSelectScreen';
import GameHUD from './components/GameHUD';
import InventoryMenu from './components/InventoryMenu';
import { GameState, Direction } from './types';
import { JobId } from './types/job';
import { createInitialPlayer, updateGameLogic, activateSkill, moveEntity } from './gameLogic'; // 追加import

// ゲームの状態遷移
type AppPhase = 'title' | 'jobSelect' | 'godSelect' | 'game' | 'gameOver';

function App() {
  const [phase, setPhase] = useState<AppPhase>('title');
  const [gameState, setGameState] = useState<GameState | null>(null);
  
  // 選択データ
  const [selectedJob, setSelectedJob] = useState<JobId | null>(null);
  const [selectedGod, setSelectedGod] = useState<string | null>(null);
  
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  
  // キー入力状態の保持
  const keysPressed = useRef<Record<string, boolean>>({});

  // ゲームループ
  useEffect(() => {
    if (phase !== 'game') return;

    let animationFrameId: number;

    const loop = () => {
      setGameState(prevState => {
        if (!prevState) return null;

        // 1. 基本ロジックの更新（移動、AI、飛び道具など）
        let nextState = updateGameLogic(prevState, { keys: keysPressed.current });

        // 2. プレイヤー入力に基づく移動処理の簡易実装（gameLogic内に移動するのが理想だが、繋ぎ込みとしてここに記載）
        // 実際は updateGameLogic 内で行うべき
        let dx = 0;
        let dy = 0;
        let direction = nextState.player.direction;
        const speed = nextState.player.stats.speed * 3; // 移動速度係数

        if (keysPressed.current['ArrowUp'] || keysPressed.current['w']) { dy -= speed; direction = 'up'; }
        if (keysPressed.current['ArrowDown'] || keysPressed.current['s']) { dy += speed; direction = 'down'; }
        if (keysPressed.current['ArrowLeft'] || keysPressed.current['a']) { dx -= speed; direction = 'left'; }
        if (keysPressed.current['ArrowRight'] || keysPressed.current['d']) { dx += speed; direction = 'right'; }

        if (dx !== 0 || dy !== 0) {
           const movedPlayer = moveEntity(nextState.player, dx, dy, nextState.map);
           nextState.player = { ...movedPlayer, direction, isMoving: true };
        } else {
           nextState.player = { ...nextState.player, isMoving: false };
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

      // インベントリ
      if (e.key === 'i' || e.key === 'I') {
        setIsInventoryOpen(prev => !prev);
      }
      if (e.key === 'Escape') {
        setIsInventoryOpen(false);
      }

      // スキル発動 (Q, E, R キー)
      // プレイヤーが持つスキルのインデックスに対応させる
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
  }, [phase, isInventoryOpen, gameState?.player.skills]); // gameStateの依存を追加時は注意（頻繁な再登録を防ぐため工夫が必要だが今回は簡易実装）


  // ... JobSelect, GodSelect ハンドラ (前回のコードと同様) ...
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

    const initialState: GameState = {
      player: player,
      enemies: [
          // テスト用の敵
          { id: 'test_slime', type: 'enemy', x: 300, y: 300, width: 40, height: 40, color: 'red', direction: 'down', isMoving: false, stats: { maxHp: 30, hp: 30, attack: 2, defense: 0, level: 1, exp: 0, nextLevelExp: 0, speed: 1 } }
      ],
      items: [],
      projectiles: [], // 追加
      inventory: ['potion_small'],
      map: { width: 50, height: 50, tiles: [], rooms: [] },
      gameTime: 0,
      floor: 1,
      messages: ['ゲーム開始！', 'Q, E キーでスキルを使用できます'],
      camera: { x: 0, y: 0 }
    };

    setGameState(initialState);
    setPhase('game');
  };
  
  const handleUseItem = (itemId: string) => { /* 省略 */ };

  return (
    <div className="App w-full h-screen overflow-hidden bg-black text-white font-sans relative">
      {phase === 'title' && <TitleScreen onStart={() => setPhase('jobSelect')} />}
      {phase === 'jobSelect' && <JobSelectScreen onSelectJob={handleJobSelect} />}
      {phase === 'godSelect' && <GodSelectScreen onSelectGod={handleGodSelect} onBack={() => setPhase('jobSelect')} />}

      {phase === 'game' && gameState && (
        <>
          <div id="game-container" className="relative w-full h-full bg-gray-900">
            {/* 描画エリア: 本来はRendererコンポーネントに分離推奨 */}
            {/* プレイヤー */}
            <div 
              className="absolute w-10 h-10 rounded-full flex items-center justify-center shadow-lg border-2 border-white z-10"
              style={{ 
                left: gameState.player.x, // 簡易的に絶対座標で表示（カメラオフセットなし）
                top: gameState.player.y,
                backgroundColor: gameState.player.color || '#00ff00',
                transition: 'left 0.1s linear, top 0.1s linear'
              }}
            >
               P
               {/* 向き表示 */}
               <div className={`absolute w-2 h-2 bg-white rounded-full 
                 ${gameState.player.direction === 'up' ? '-top-1' : ''}
                 ${gameState.player.direction === 'down' ? '-bottom-1' : ''}
                 ${gameState.player.direction === 'left' ? '-left-1' : ''}
                 ${gameState.player.direction === 'right' ? '-right-1' : ''}
               `}/>
            </div>

            {/* 敵 */}
            {gameState.enemies.map(enemy => (
                <div key={enemy.id}
                    className="absolute w-10 h-10 bg-red-600 rounded flex items-center justify-center z-10"
                    style={{ left: enemy.x, top: enemy.y }}
                >
                    E
                    <div className="absolute -top-3 w-full h-1 bg-gray-700">
                        <div className="bg-red-500 h-full" style={{width: `${(enemy.stats.hp / enemy.stats.maxHp) * 100}%`}}></div>
                    </div>
                </div>
            ))}

            {/* 飛び道具 */}
            {gameState.projectiles && gameState.projectiles.map(proj => (
                <div key={proj.id}
                    className="absolute w-4 h-4 bg-yellow-400 rounded-full shadow-orange-500 shadow-md z-20"
                    style={{ left: proj.x, top: proj.y }}
                />
            ))}
            
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
             <h2 className="text-5xl text-red-600">GAME OVER</h2>
         </div>
      )}
    </div>
  );
}

export default App;
