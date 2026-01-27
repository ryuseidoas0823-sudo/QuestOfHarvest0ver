import React, { useState, useEffect, useRef } from 'react';
import TitleScreen from './components/TitleScreen';
import NameInputScreen from './components/NameInputScreen';
import JobSelectScreen from './components/JobSelectScreen';
import GodSelectScreen from './components/GodSelectScreen';
import TownScreen from './components/TownScreen';
import GameHUD from './components/GameHUD';
import ResultScreen from './components/ResultScreen';
import Tutorial from './components/Tutorial';
import PauseMenu from './components/PauseMenu';
import StatusUpgradeMenu from './components/StatusUpgradeMenu';
import ShopMenu from './components/ShopMenu';
import InventoryMenu from './components/InventoryMenu';
import { Renderer } from './renderer';
import { useGameCore } from './hooks/useGameCore';
import { useItemSystem } from './hooks/useItemSystem';
import { Backpack } from 'lucide-react';

type AppState = 'title' | 'nameInput' | 'jobSelect' | 'godSelect' | 'town' | 'dungeon' | 'result';

function App() {
  const { 
    gameState, 
    setGameState, 
    addLog, 
    startGame, 
    useQuickPotion, 
    refillPotions 
  } = useGameCore();

  // useItemSystem
  const { useItem, unequipItem } = useItemSystem(setGameState, addLog);

  const [appState, setAppState] = useState<AppState>('title');
  const [playerName, setPlayerName] = useState('');
  const [showTutorial, setShowTutorial] = useState(false);
  const [showPauseMenu, setShowPauseMenu] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [showShopMenu, setShowShopMenu] = useState(false);
  const [showInventory, setShowInventory] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<Renderer | null>(null);

  useEffect(() => {
    if (canvasRef.current && !rendererRef.current) {
      rendererRef.current = new Renderer(canvasRef.current);
    }
  }, []);

  useEffect(() => {
    let animationId: number;
    const render = () => {
      if (rendererRef.current && appState === 'dungeon') {
        rendererRef.current.render(gameState);
      }
      animationId = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animationId);
  }, [gameState, appState]);

  useEffect(() => {
    if (gameState.isGameOver || gameState.isGameClear) {
      const timer = setTimeout(() => {
        setAppState('result');
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [gameState.isGameOver, gameState.isGameClear]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (appState === 'dungeon' && !gameState.isGameOver && !showPauseMenu) {
        if (e.key === 'i' || e.key === 'I') {
          setShowInventory(prev => !prev);
        }
        if (e.key === 'Escape') {
            setShowPauseMenu(true);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [appState, gameState.isGameOver, showPauseMenu]);

  const handleStartGame = () => {
    setAppState('nameInput');
  };

  const handleNameDecided = (name: string) => {
    setPlayerName(name);
    setAppState('jobSelect');
  };

  const handleJobSelected = (jobId: string) => {
    setAppState('godSelect');
  };

  const handleGodSelected = (godId: string) => {
    startGame(playerName);
    setAppState('town');
    setShowTutorial(true);
  };

  const handleDungeonStart = () => {
    setAppState('dungeon');
  };

  const handleReturnToTown = () => {
    setAppState('town');
    setShowPauseMenu(false);
    setShowInventory(false);
  };
  
  const handleTitleReturn = () => {
    setAppState('title');
    setShowPauseMenu(false);
  };

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden select-none font-sans">
      {appState === 'title' && <TitleScreen onStart={handleStartGame} />}
      {appState === 'nameInput' && <NameInputScreen onConfirm={handleNameDecided} onBack={() => setAppState('title')} />}
      {appState === 'jobSelect' && <JobSelectScreen onSelect={handleJobSelected} onBack={() => setAppState('nameInput')} />}
      {appState === 'godSelect' && <GodSelectScreen onSelect={handleGodSelected} onBack={() => setAppState('jobSelect')} />}

      {appState === 'town' && (
        <TownScreen 
          gameState={gameState} 
          onStartDungeon={handleDungeonStart}
          onSave={() => alert('セーブ機能は未実装です')}
          onRefillPotions={() => refillPotions(setGameState)}
        />
      )}

      {appState === 'dungeon' && (
        <>
          <canvas 
            ref={canvasRef} 
            width={800} 
            height={600}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 shadow-2xl border border-slate-800"
            style={{ imageRendering: 'pixelated' }}
          />
          
          <GameHUD gameState={gameState} onUsePotion={() => useQuickPotion(gameState, setGameState, addLog)} />
          
          <div className="absolute bottom-20 right-4 z-10 pointer-events-auto">
             <button 
               onClick={() => setShowInventory(true)}
               className="bg-slate-800/80 hover:bg-slate-700 text-white p-3 rounded-full border-2 border-slate-600 shadow-lg transition-all active:scale-95 group"
               title="アイテム一覧 (I)"
             >
               <Backpack size={24} className="text-amber-400 group-hover:text-amber-300" />
               <div className="absolute -top-2 -right-2 bg-slate-900 text-[10px] text-white px-1.5 py-0.5 rounded border border-slate-600">I</div>
             </button>
          </div>

          {showInventory && (
            <InventoryMenu 
              gameState={gameState} 
              onClose={() => setShowInventory(false)} 
              onUseItem={useItem}
              onUnequip={unequipItem}
            />
          )}

          {showPauseMenu && (
            <PauseMenu 
              onResume={() => setShowPauseMenu(false)}
              onReturnTown={handleReturnToTown}
              onTitle={handleTitleReturn}
            />
          )}
        </>
      )}

      {appState === 'result' && <ResultScreen gameState={gameState} onReturnTown={handleReturnToTown} />}
      {showTutorial && <Tutorial onClose={() => setShowTutorial(false)} />}
      
      {showStatusMenu && <StatusUpgradeMenu gameState={gameState} onClose={() => setShowStatusMenu(false)} />}
      {showShopMenu && <ShopMenu gameState={gameState} onClose={() => setShowShopMenu(false)} />}
    </div>
  );
}

export default App;
