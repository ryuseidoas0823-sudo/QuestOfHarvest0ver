import React from 'react';
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
import { useGameCore } from './hooks/useGameCore';

function App() {
  const {
    currentScreen,
    isPaused,
    setIsPaused,
    showInventory,
    setShowInventory,
    showStatus,
    setShowStatus,
    showShop,
    setShowShop,
    player,
    dungeon,
    eventSystem,
    handlers
  } = useGameCore();

  const { playerState } = player;
  const { dungeonState } = dungeon;

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden select-none font-sans text-white">
      
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

      {currentScreen === 'result' && (
        <ResultScreen 
          result="gameover"
          score={playerState.exp} 
          floor={dungeonState.floor}
          onTitle={() => window.location.reload()}
          onRetry={handlers.onReturnToTown}
        />
      )}

      {currentScreen === 'dungeon' && dungeonState.map.length > 0 && (
        <div className="relative w-full h-full flex justify-center items-center bg-black">
          
          <div className="relative" style={{ width: '640px', height: '640px' }}>
            <div 
              className="absolute transition-all duration-200 ease-linear"
              style={{
                top: '50%',
                left: '50%',
                transform: `translate(${-playerState.x * 32 - 16}px, ${-playerState.y * 32 - 16}px)` 
              }}
            >
              {dungeonState.map.map((row, y) => (
                <div key={y} className="flex">
                  {row.map((tile, x) => (
                    <PixelSprite 
                      key={`${x}-${y}`} 
                      type={tile.type} 
                      variant="dungeon-1" 
                      tileData={tile}
                    />
                  ))}
                </div>
              ))}

              {dungeonState.enemies.map(enemy => (
                <div 
                  key={enemy.id}
                  className="absolute transition-all duration-200"
                  style={{ left: enemy.x * 32, top: enemy.y * 32, zIndex: 10 }}
                >
                  <PixelSprite 
                    type="enemy" 
                    variant={enemy.defId} 
                    data={enemy} 
                  />
                </div>
              ))}

              <div 
                className="absolute transition-all duration-100 z-20"
                style={{ left: playerState.x * 32, top: playerState.y * 32 }}
              >
                <PixelSprite 
                  type="player" 
                  jobId={playerState.jobId}
                  direction="down"
                  state={eventSystem.eventState.isEventActive ? 'idle' : 'move'}
                />
              </div>

            </div>
          </div>

          <div className="absolute inset-0 pointer-events-none">
            <GameHUD 
              playerState={playerState} 
              floor={dungeonState.floor}
              logs={eventSystem.eventState.logs}
              miniMap={dungeonState.map}
            />
          </div>
        </div>
      )}

      {isPaused && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <PauseMenu 
            onResume={() => setIsPaused(false)}
            onTitle={() => window.location.reload()}
          />
        </div>
      )}

      {showInventory && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/80">
          <InventoryMenu 
            items={playerState.inventory} 
            onClose={() => setShowInventory(false)}
            onUse={handlers.onUseItem} 
          />
        </div>
      )}

      {showStatus && (
        <div className="absolute inset-0 z-40 bg-black/90">
           <StatusUpgradeMenu 
             playerState={playerState}
             onClose={() => setShowStatus(false)}
             onUpgrade={(stat) => console.log('Upgrade', stat)}
           />
        </div>
      )}

      {showShop && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/80 backdrop-blur-sm">
           <ShopMenu
             playerState={playerState}
             onClose={() => setShowShop(false)}
             onBuy={player.buyItem}
             onSell={player.sellItem}
           />
        </div>
      )}

    </div>
  );
}

export default App;
