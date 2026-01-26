import React, { useState, useEffect } from 'react';
import TitleScreen from './components/TitleScreen';
import JobSelectScreen from './components/JobSelectScreen';
import GodSelectScreen from './components/GodSelectScreen';
import TownScreen from './components/TownScreen';
import GameHUD from './components/GameHUD';
import PixelSprite from './components/PixelSprite';
import ResultScreen from './components/ResultScreen';
import PauseMenu from './components/PauseMenu';
import InventoryMenu from './components/InventoryMenu';
import Tutorial from './components/Tutorial';
import StatusUpgradeMenu from './components/StatusUpgradeMenu';
import NameInputScreen from './components/NameInputScreen';
import ShopMenu from './components/ShopMenu';
import EventModal from './components/EventModal';
import DialogueWindow from './components/DialogueWindow';
import { useGameCore } from './hooks/useGameCore';
import { Direction } from './types';

const App: React.FC = () => {
  const game = useGameCore();
  const { 
    currentScreen, 
    player, 
    dungeon, 
    turnSystem, 
    eventSystem, 
    handlers,
    showInventory,
    setShowInventory,
    isPaused,
    setIsPaused,
    showStatus,
    setShowStatus,
    showShop,
    setShowShop
  } = game;

  // View State for UI
  const [playerDirection, setPlayerDirection] = useState<'left' | 'right' | 'up' | 'down'>('down');

  // キーボードイベントの監視（向き更新用）
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (currentScreen !== 'dungeon') return;
      
      let dir: Direction | null = null;
      switch(e.key) {
        case 'ArrowLeft': dir = 'left'; break;
        case 'ArrowRight': dir = 'right'; break;
        case 'ArrowUp': dir = 'up'; break;
        case 'ArrowDown': dir = 'down'; break;
      }

      if (dir) {
        setPlayerDirection(prev => {
           if (dir === 'left') return 'left';
           if (dir === 'right') return 'right';
           if (dir === 'up') return 'up';
           if (dir === 'down') return 'down';
           return prev;
        });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentScreen]);


  // --- Rendering Helpers ---

  // ダンジョン画面のレンダリング
  const renderDungeon = () => (
    <div className="relative w-full h-full bg-neutral-900 overflow-hidden flex flex-col items-center justify-center font-pixel">
      
      {/* HUD (Header) */}
      <div className="absolute top-0 left-0 w-full z-10">
        <GameHUD 
          playerState={player.playerState} 
          floor={dungeon.dungeonState.floor}
          logs={eventSystem.eventState.logs}
          miniMap={dungeon.dungeonState.map}
        />
      </div>

      {/* Main Game Viewport */}
      <div className="relative w-[640px] h-[480px] bg-[#111] border-[8px] border-neutral-700 rounded-lg overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)] flex-shrink-0">
        
        {/* Map Grid Container */}
        <div 
          className="absolute transition-transform duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)]"
          style={{
            transform: `translate(
              ${320 - player.playerState.x * 32 - 16}px, 
              ${240 - player.playerState.y * 32 - 16}px
            )`
          }}
        >
          {dungeon.dungeonState.map.map((row, y) => (
            <div key={y} className="flex">
              {row.map((tile, x) => {
                const isWall = tile.type === 'wall';
                const isFloor = tile.type === 'floor';
                
                return (
                  <div 
                    key={`${x}-${y}`} 
                    className="w-8 h-8 flex-shrink-0 relative"
                    style={{
                      opacity: tile.visible ? 1 : 0,
                      backgroundColor: !tile.visible ? '#000' : (isWall ? '#3d342b' : isFloor ? '#2a2a2a' : '#1a1a1a'),
                      backgroundImage: !tile.visible ? 'none' : (
                        isWall ? `linear-gradient(335deg, rgba(20,20,20,0.4) 23px, transparent 23px), linear-gradient(155deg, rgba(40,30,20,0.4) 23px, transparent 23px)` :
                        isFloor ? `linear-gradient(335deg, rgba(0,0,0,0.1) 23px, transparent 23px)` : 'none'
                      ),
                      backgroundSize: isWall ? '16px 16px' : '58px 58px',
                      boxShadow: isWall ? 'inset 0 0 4px rgba(0,0,0,0.5)' : 'none',
                      borderBottom: isWall ? '2px solid #1a1612' : 'none',
                    }}
                  >
                    <PixelSprite 
                      type={tile.type} 
                      variant="dungeon-1" 
                      tileData={tile}
                    />
                  </div>
                );
              })}
            </div>
          ))}

          {/* Enemies Layer */}
          {dungeon.dungeonState.enemies.map(enemy => (
            enemy.hp > 0 && dungeon.dungeonState.map[enemy.y][enemy.x].visible && (
              <div 
                key={enemy.id}
                className="absolute w-8 h-8 transition-all duration-300 z-10"
                style={{
                  left: enemy.x * 32,
                  top: enemy.y * 32,
                }}
              >
                <PixelSprite 
                  type="enemy" 
                  data={enemy} 
                  state={turnSystem.turnState.isProcessing ? 'idle' : 'move'}
                />
                <div className="absolute -top-1 left-0 w-full h-1 bg-red-900 border border-black">
                  <div 
                    className="h-full bg-red-500 transition-all duration-300"
                    style={{ width: `${(enemy.hp / (enemy.maxHp || 10)) * 100}%` }}
                  />
                </div>
              </div>
            )
          ))}

          {/* Player Layer */}
          <div 
            className="absolute w-8 h-8 z-20 transition-all duration-200"
            style={{
              left: player.playerState.x * 32,
              top: player.playerState.y * 32,
            }}
          >
             <PixelSprite 
               type="player" 
               jobId={player.playerState.jobId}
               state={turnSystem.turnState.isProcessing ? 'attack' : 'idle'}
               direction={playerDirection}
             />
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[radial-gradient(circle,rgba(255,255,200,0.1)_0%,rgba(0,0,0,0)_60%)] pointer-events-none" />
          </div>
          
        </div>

        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_30%,rgba(0,0,0,0.8)_100%)] z-30" />

        {player.playerState.hp < player.playerState.maxHp * 0.3 && (
          <div className="absolute inset-0 pointer-events-none bg-red-900/30 animate-pulse z-40 mix-blend-overlay" />
        )}

      </div>

      {showInventory && (
        <InventoryMenu 
          items={player.playerState.inventory} 
          onClose={() => setShowInventory(false)}
          onUse={handlers.onUseItem}
        />
      )}

      {isPaused && (
        <PauseMenu 
          onResume={() => setIsPaused(false)}
          onTitle={() => window.location.reload()}
        />
      )}

      {showStatus && (
        <div className="absolute inset-0 z-40 bg-black/90 flex items-center justify-center">
           <StatusUpgradeMenu 
             playerState={player.playerState}
             onClose={() => setShowStatus(false)}
             onUpgrade={(stat) => console.log('Upgrade', stat)}
           />
        </div>
      )}

      {eventSystem.eventState.isEventActive && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[580px] z-50">
          <DialogueWindow 
            text={eventSystem.eventState.currentText}
            speaker={eventSystem.eventState.currentSpeaker}
            onNext={eventSystem.nextDialogue}
          />
        </div>
      )}

    </div>
  );

  return (
    <div className="fixed inset-0 w-full h-full bg-neutral-950 text-white font-sans overflow-hidden select-none flex items-center justify-center">
      <div className="w-full h-full max-w-4xl max-h-[800px] relative mx-auto flex items-center justify-center">
      
        {currentScreen === 'title' && (
          <TitleScreen onStart={handlers.onStartGame} />
        )}

        {currentScreen === 'name_input' && (
          <NameInputScreen onNameDecided={handlers.onNameDecided} />
        )}

        {currentScreen === 'job_select' && (
          <JobSelectScreen onSelect={handlers.onJobSelect} />
        )}

        {currentScreen === 'god_select' && (
          <GodSelectScreen onSelect={handlers.onGodSelect} />
        )}

        {currentScreen === 'tutorial' && (
          <Tutorial onComplete={handlers.onTutorialComplete} />
        )}

        {currentScreen === 'town' && (
          <TownScreen 
            onEnterDungeon={handlers.onEnterDungeon}
            onOpenShop={() => setShowShop(true)}
            onOpenStatus={() => setShowStatus(true)}
            onSave={handlers.onHealAtInn}
          />
        )}

        {currentScreen === 'dungeon' && renderDungeon()}

        {currentScreen === 'result' && (
          <ResultScreen 
            result={player.playerState.hp > 0 ? 'clear' : 'gameover'}
            score={player.playerState.exp} 
            floor={dungeon.dungeonState.floor}
            onTitle={() => window.location.reload()}
            onRetry={handlers.onReturnToTown}
          />
        )}
        
        {eventSystem.eventState.modalContent && (
          <EventModal 
            content={eventSystem.eventState.modalContent} 
            onClose={eventSystem.closeModal} 
          />
        )}

        {showShop && (
          <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <ShopMenu
              playerState={player.playerState}
              onClose={() => setShowShop(false)}
              onBuy={player.buyItem}
              onSell={player.sellItem}
            />
          </div>
        )}

      </div>
    </div>
  );
};

export default App;
