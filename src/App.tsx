import React from 'react';
import { useGameCore } from './hooks/useGameCore';

// Screens
import TitleScreen from './components/TitleScreen';
import JobSelectScreen from './components/JobSelectScreen';
import GodSelectScreen from './components/GodSelectScreen';
import Tutorial from './components/Tutorial';
import TownScreen from './components/TownScreen';
import ResultScreen from './components/ResultScreen';

// Dungeon Components
import PixelSprite from './components/PixelSprite';
import GameHUD from './components/GameHUD';
import PauseMenu from './components/PauseMenu';
import InventoryMenu from './components/InventoryMenu';
import EventModal from './components/EventModal';
import DialogueWindow from './components/DialogueWindow';

// Styles
import './index.css';

const App: React.FC = () => {
  // ゲームロジックのコアフックを使用
  const game = useGameCore();
  const { 
    currentScreen, 
    player, 
    dungeon, 
    turnSystem, 
    eventSystem, 
    handlers 
  } = game;

  // --- Rendering Helpers ---

  // ダンジョン画面のレンダリング
  const renderDungeon = () => (
    <div className="relative w-full h-full bg-black overflow-hidden flex flex-col items-center justify-center">
      
      {/* HUD (Header) */}
      <div className="absolute top-0 left-0 w-full z-10">
        <GameHUD 
          playerState={player.playerState} 
          floor={dungeon.dungeonState.floor}
          logs={eventSystem.eventState.logs}
          miniMap={dungeon.dungeonState.map}
        />
      </div>

      {/* Main Game View (Viewport) */}
      <div className="relative w-[640px] h-[480px] bg-[#1a1a1a] border-4 border-[#4a4a4a] overflow-hidden shadow-2xl">
        
        {/* Map Grid Rendering */}
        <div 
          className="absolute transition-transform duration-300 ease-in-out"
          style={{
            transform: `translate(
              ${320 - player.playerState.x * 32 - 16}px, 
              ${240 - player.playerState.y * 32 - 16}px
            )`
          }}
        >
          {dungeon.dungeonState.map.map((row, y) => (
            <div key={y} className="flex">
              {row.map((tile, x) => (
                <div 
                  key={`${x}-${y}`} 
                  className="w-8 h-8 flex-shrink-0"
                  style={{
                    backgroundColor: tile.visible ? 
                      (tile.type === 'wall' ? '#444' : 
                       tile.type === 'floor' ? '#222' : 
                       tile.type === 'corridor' ? '#111' : '#000') 
                      : '#000',
                    border: tile.visible ? '1px solid #333' : 'none'
                  }}
                >
                  {/* Debug Info or Tile Decoration */}
                </div>
              ))}
            </div>
          ))}

          {/* Enemies */}
          {dungeon.dungeonState.enemies.map(enemy => (
            enemy.hp > 0 && dungeon.dungeonState.map[enemy.y][enemy.x].visible && (
              <div 
                key={enemy.id}
                className="absolute w-8 h-8 transition-all duration-300"
                style={{
                  left: enemy.x * 32,
                  top: enemy.y * 32,
                }}
              >
                <PixelSprite 
                  type="enemy" 
                  data={enemy} // 敵の種類に応じたアセットID等を渡すのが理想
                  state="idle"
                />
              </div>
            )
          ))}

          {/* Player */}
          <div 
            className="absolute w-8 h-8 z-20 transition-all duration-200"
            style={{
              left: player.playerState.x * 32,
              top: player.playerState.y * 32,
            }}
          >
             <PixelSprite 
               type="player" 
               jobId={player.activeJob}
               state={turnSystem.turnState.isProcessing ? 'attack' : 'idle'}
             />
          </div>
          
        </div>

        {/* Visual Effects (Overlay) */}
        {player.playerState.hp < player.playerState.maxHp * 0.2 && (
          <div className="absolute inset-0 pointer-events-none bg-red-900/20 animate-pulse" />
        )}

      </div>

      {/* UI Overlays */}
      {game.showInventory && (
        <InventoryMenu 
          player={player.playerState} 
          onClose={() => game.setShowInventory(false)}
          onEquip={(item) => {/* 装備処理 */}}
          onUse={(item) => {/* 使用処理 */}}
        />
      )}

      {game.isPaused && (
        <PauseMenu 
          onResume={() => game.setIsPaused(false)}
          onRetire={() => {
            game.setIsPaused(false);
            handlers.onReturnToTown();
          }}
        />
      )}

      {/* Event/Dialogue Overlay */}
      {eventSystem.eventState.isEventActive && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[600px]">
          <DialogueWindow 
            text={eventSystem.eventState.currentText}
            speaker={eventSystem.eventState.currentSpeaker}
            onNext={eventSystem.nextDialogue}
          />
        </div>
      )}

    </div>
  );

  // --- Main Render Switch ---

  return (
    <div className="w-screen h-screen bg-neutral-900 text-white font-sans overflow-hidden select-none">
      {currentScreen === 'title' && (
        <TitleScreen onStart={handlers.onStartGame} />
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
          player={player.playerState} 
          onDungeon={handlers.onEnterDungeon}
          // 各施設へのハンドラはまだ仮
          onShop={() => console.log('Shop')} 
          onGuild={() => console.log('Guild')} 
          onFamilia={() => console.log('Familia')}
        />
      )}

      {currentScreen === 'dungeon' && renderDungeon()}

      {currentScreen === 'result' && (
        <ResultScreen 
          result={player.playerState.hp > 0 ? 'clear' : 'gameover'}
          score={player.playerState.gold} // 仮のスコア
          onReturn={handlers.onReturnToTown}
        />
      )}
      
      {/* Global Modal Layer */}
      {eventSystem.eventState.modalContent && (
        <EventModal 
          content={eventSystem.eventState.modalContent} 
          onClose={eventSystem.closeModal} 
        />
      )}
    </div>
  );
};

export default App;
