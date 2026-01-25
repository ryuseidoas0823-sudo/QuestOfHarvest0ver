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

// Assets & Styles
import './index.css';
import { TILE_PATTERNS } from './assets/pixelData';

const App: React.FC = () => {
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

  // タイルスタイルの取得
  const getTileStyle = (tile: any, x: number, y: number) => {
    if (!tile.visible) {
      return { backgroundColor: '#000' };
    }

    // 基本スタイル（マップチップ）
    let style: React.CSSProperties = {
      position: 'relative',
    };

    // マップチップの適用
    switch (tile.type) {
      case 'floor':
        return { css: TILE_PATTERNS.floor };
      case 'wall':
        return { css: TILE_PATTERNS.wall };
      case 'corridor':
        return { css: TILE_PATTERNS.corridor };
      case 'stairs_down':
        return { css: TILE_PATTERNS.stairs };
      default:
        return { backgroundColor: '#000' };
    }
  };

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
      {/* 枠線とシャドウでレトロゲーム機のような演出 */}
      <div className="relative w-[640px] h-[480px] bg-[#111] border-[8px] border-neutral-700 rounded-lg overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)]">
        
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
                const styleData = getTileStyle(tile, x, y);
                // style属性に展開（TILE_PATTERNSはCSS文字列なので、style属性用に変換が必要だが、
                // ここでは簡易的にstyleオブジェクトとして扱うか、css変数として注入するアプローチをとる。
                // Reactのstyle属性はオブジェクトを期待するため、TILE_PATTERNSの文字列をstyleオブジェクトに変換する処理は複雑。
                // 今回はインラインstyleで直接指定する方式に簡易化して実装します。
                
                // 簡易パース用：実際はclassNameやstyled-componentsが望ましいが、今回はインラインで解決
                const isWall = tile.type === 'wall';
                const isFloor = tile.type === 'floor';
                
                return (
                  <div 
                    key={`${x}-${y}`} 
                    className="w-8 h-8 flex-shrink-0 relative"
                    style={{
                      // 可視状態の制御
                      opacity: tile.visible ? 1 : 0,
                      backgroundColor: !tile.visible ? '#000' : (isWall ? '#3d342b' : isFloor ? '#2a2a2a' : '#1a1a1a'),
                      // 簡易的なテクスチャ表現（CSSグラデーション）
                      backgroundImage: !tile.visible ? 'none' : (
                        isWall ? `linear-gradient(335deg, rgba(20,20,20,0.4) 23px, transparent 23px), linear-gradient(155deg, rgba(40,30,20,0.4) 23px, transparent 23px)` :
                        isFloor ? `linear-gradient(335deg, rgba(0,0,0,0.1) 23px, transparent 23px)` : 'none'
                      ),
                      backgroundSize: isWall ? '16px 16px' : '58px 58px',
                      boxShadow: isWall ? 'inset 0 0 4px rgba(0,0,0,0.5)' : 'none',
                      borderBottom: isWall ? '2px solid #1a1612' : 'none',
                    }}
                  >
                    {/* 階段などのオブジェクト */}
                    {tile.type === 'stairs_down' && tile.visible && (
                      <div className="absolute inset-1 bg-neutral-500 border-2 border-neutral-300 animate-pulse" />
                    )}
                    
                    {/* デバッグ用座標（オプション） */}
                    {/* <span className="text-[8px] text-white/20">{x},{y}</span> */}
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
                {/* HP Bar */}
                <div className="absolute -top-1 left-0 w-full h-1 bg-red-900">
                  <div 
                    className="h-full bg-red-500 transition-all duration-300"
                    style={{ width: `${(enemy.hp / enemy.maxHp) * 100}%` }}
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
               jobId={player.activeJob}
               state={turnSystem.turnState.isProcessing ? 'attack' : 'idle'}
             />
             {/* Player Spotlight Effect (CSS Radial Gradient Overlay) */}
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[radial-gradient(circle,rgba(255,255,200,0.1)_0%,rgba(0,0,0,0)_60%)] pointer-events-none" />
          </div>
          
        </div>

        {/* Global Lighting / Vignette (画面周辺を暗くする) */}
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_30%,rgba(0,0,0,0.8)_100%)] z-30" />

        {/* Damage Effect Overlay */}
        {player.playerState.hp < player.playerState.maxHp * 0.3 && (
          <div className="absolute inset-0 pointer-events-none bg-red-900/30 animate-pulse z-40 Mix-blend-overlay" />
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

  // --- Main Render Switch ---

  return (
    <div className="w-screen h-screen bg-neutral-950 text-white font-sans overflow-hidden select-none flex items-center justify-center">
      {/* 画面全体のコンテナ（PC画面風のアスペクト比維持用） */}
      <div className="w-full h-full max-w-4xl max-h-[800px] relative">
      
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
            // 各施設へのハンドラ
            onShop={() => console.log('Shop')} 
            onGuild={() => console.log('Guild')} 
            onFamilia={() => console.log('Familia')}
          />
        )}

        {currentScreen === 'dungeon' && renderDungeon()}

        {currentScreen === 'result' && (
          <ResultScreen 
            result={player.playerState.hp > 0 ? 'clear' : 'gameover'}
            score={player.playerState.gold} 
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
    </div>
  );
};

export default App;
