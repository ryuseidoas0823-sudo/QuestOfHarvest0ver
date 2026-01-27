import React, { useState, useEffect, useRef } from 'react';
import TitleScreen from './components/TitleScreen';
import NameInputScreen from './components/NameInputScreen';
import JobSelectScreen from './components/JobSelectScreen';
import GodSelectScreen from './components/GodSelectScreen';
import TownScreen from './components/TownScreen';
import GameHUD from './components/GameHUD';
import ResultScreen from './components/ResultScreen';
import Tutorial from './components/Tutorial';
import EventModal from './components/EventModal';
import DialogueWindow from './components/DialogueWindow';
import PauseMenu from './components/PauseMenu';
import StatusUpgradeMenu from './components/StatusUpgradeMenu';
import ShopMenu from './components/ShopMenu';
import InventoryMenu from './components/InventoryMenu'; // 追加
import { Renderer } from './renderer';
import { useGameCore } from './hooks/useGameCore';
import { useItemSystem } from './hooks/useItemSystem'; // 追加
import { Backpack } from 'lucide-react'; // アイコン追加

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

  // アイテムシステムフックの使用
  const { useItem } = useItemSystem(setGameState, addLog);

  const [appState, setAppState] = useState<AppState>('title');
  const [playerName, setPlayerName] = useState('');
  const [showTutorial, setShowTutorial] = useState(false);
  const [showPauseMenu, setShowPauseMenu] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [showShopMenu, setShowShopMenu] = useState(false);
  const [showInventory, setShowInventory] = useState(false); // 追加: インベントリ表示状態

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<Renderer | null>(null);

  // 初期化
  useEffect(() => {
    if (canvasRef.current && !rendererRef.current) {
      rendererRef.current = new Renderer(canvasRef.current);
    }
  }, []);

  // 描画ループ
  useEffect(() => {
    let animationId: number;
    
    const render = () => {
      if (rendererRef.current && appState === 'dungeon') {
        rendererRef.current.render(gameState);
      }
      animationId = requestAnimationFrame(render);
    };
    
    render();
    
    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [gameState, appState]);

  // ゲームオーバー/クリア監視
  useEffect(() => {
    if (gameState.isGameOver || gameState.isGameClear) {
      // 少し待ってからリザルト画面へ（演出用）
      const timer = setTimeout(() => {
        setAppState('result');
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [gameState.isGameOver, gameState.isGameClear]);

  // キーボードショートカット (インベントリなど)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (appState === 'dungeon' && !gameState.isGameOver && !showPauseMenu) {
        // Iキー: インベントリ
        if (e.key === 'i' || e.key === 'I') {
          setShowInventory(prev => !prev);
        }
        // ESCキー: ポーズメニュー
        if (e.key === 'Escape') {
            setShowPauseMenu(true);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [appState, gameState.isGameOver, showPauseMenu]);


  // 画面遷移ハンドラー
  const handleStartGame = () => {
    setAppState('nameInput');
  };

  const handleNameDecided = (name: string) => {
    setPlayerName(name);
    setAppState('jobSelect');
  };

  const handleJobSelected = (jobId: string) => {
    // ここでジョブ情報を保持する処理が入るが、今回は簡易的に次へ
    setAppState('godSelect');
  };

  const handleGodSelected = (godId: string) => {
    // ゲーム初期化して街へ
    startGame(playerName);
    setAppState('town');
    setShowTutorial(true); // 初回チュートリアル
  };

  const handleDungeonStart = () => {
    setAppState('dungeon');
  };

  const handleReturnToTown = () => {
    setAppState('town');
    setShowPauseMenu(false);
    setShowInventory(false);
    // 街に戻ったらポーション補充等はTownScreen側で自動実行される
  };
  
  const handleTitleReturn = () => {
    setAppState('title');
    setShowPauseMenu(false);
  };

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden select-none font-sans">
      {/* Title Screen */}
      {appState === 'title' && (
        <TitleScreen onStart={handleStartGame} />
      )}

      {/* Setup Screens */}
      {appState === 'nameInput' && (
        <NameInputScreen onConfirm={handleNameDecided} onBack={() => setAppState('title')} />
      )}
      {appState === 'jobSelect' && (
        <JobSelectScreen onSelect={handleJobSelected} onBack={() => setAppState('nameInput')} />
      )}
      {appState === 'godSelect' && (
        <GodSelectScreen onSelect={handleGodSelected} onBack={() => setAppState('jobSelect')} />
      )}

      {/* Town Screen */}
      {appState === 'town' && (
        <TownScreen 
          gameState={gameState} 
          onStartDungeon={handleDungeonStart}
          onSave={() => alert('セーブ機能は未実装です')}
          onRefillPotions={() => refillPotions(setGameState)}
        />
      )}

      {/* Dungeon Phase */}
      {appState === 'dungeon' && (
        <>
          <canvas 
            ref={canvasRef} 
            width={800} 
            height={600}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 shadow-2xl border border-slate-800"
            style={{ imageRendering: 'pixelated' }}
          />
          
          {/* Game HUD */}
          <GameHUD gameState={gameState} onUsePotion={() => useQuickPotion(gameState, setGameState, addLog)} />
          
          {/* インベントリボタン (右下) */}
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

          {/* モーダル群 */}
          {showInventory && (
            <InventoryMenu 
              gameState={gameState} 
              onClose={() => setShowInventory(false)} 
              onUseItem={useItem} 
            />
          )}

          {showPauseMenu && (
            <PauseMenu 
              onResume={() => setShowPauseMenu(false)}
              onReturnTown={handleReturnToTown}
              onTitle={handleTitleReturn}
            />
          )}

          {/* イベントモーダル (宝箱など) */}
          {/* TODO: EventSystem統合時に条件分岐を追加 */}
          
          {/* 会話ウィンドウ */}
          {/* TODO: DialogueSystem統合時に追加 */}

        </>
      )}

      {/* Result Screen */}
      {appState === 'result' && (
        <ResultScreen 
          gameState={gameState} 
          onReturnTown={handleReturnToTown}
        />
      )}

      {/* Tutorial Overlay */}
      {showTutorial && (
        <Tutorial onClose={() => setShowTutorial(false)} />
      )}
      
      {/* ステータス画面やショップ画面など (Townから呼び出し想定だが仮配置) */}
      {showStatusMenu && <StatusUpgradeMenu gameState={gameState} onClose={() => setShowStatusMenu(false)} />}
      {showShopMenu && <ShopMenu gameState={gameState} onClose={() => setShowShopMenu(false)} />}

    </div>
  );
}

export default App;
