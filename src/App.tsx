import { useEffect, useRef, useState, useMemo } from 'react';
import { onAuthStateChanged, signInAnonymously, signInWithCustomToken } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

import { auth, db, isConfigValid, appId, GAME_CONFIG } from './config';
import { GameState, PlayerEntity, Job, Gender, MenuType, ResolutionMode, Biome, ChunkData } from './types';
import { ASSETS_SVG, svgToUrl } from './assets';
import { createPlayer, generateOverworld, getMapData, updatePlayerStats, getStarterItem, generateTownMap } from './gameLogic';
import { resolveMapCollision } from './utils';
import { renderGame } from './renderer';
import { BIOME_NAMES } from './data';

import { TitleScreen } from './components/TitleScreen';
import { JobSelectScreen } from './components/JobSelectScreen';
import { GameHUD } from './components/GameHUD';
import { InventoryMenu } from './components/InventoryMenu';

export default function App() {
  const [screen, setScreen] = useState<'auth' | 'title' | 'game' | 'job_select'>('auth');
  const [saveData, setSaveData] = useState<any>(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isMapLoading, setIsMapLoading] = useState(false);
  const [loadingMapName, setLoadingMapName] = useState('');
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameState = useRef<GameState | null>(null);
  const reqRef = useRef<number>();
  const input = useRef({ keys: {} as Record<string, boolean>, mouse: {x:0, y:0, down: false} });
  const [uiState, setUiState] = useState<PlayerEntity | null>(null);
  const [worldInfo, setWorldInfo] = useState<{x:number, y:number, biome:Biome}>({x:0, y:0, biome:'Town'});
  const [activeMenu, setActiveMenu] = useState<MenuType>('none');
  const [message, setMessage] = useState<string | null>(null);
  const [viewportSize, setViewportSize] = useState({ width: 800, height: 600 });
  const [resolution, setResolution] = useState<ResolutionMode>('auto');

  const loadedAssets = useMemo(() => {
    const images: Record<string, HTMLImageElement> = {};
    Object.entries(ASSETS_SVG).forEach(([key, svg]) => { const img = new Image(); img.src = svgToUrl(svg); images[key] = img; });
    return images;
  }, []);

  useEffect(() => {
    if (!auth) { setScreen('title'); return; }
    const initAuth = async () => {
      try {
        // @ts-ignore
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) await signInWithCustomToken(auth, __initial_auth_token); else await signInAnonymously(auth);
      } catch (e) { setScreen('title'); }
    };
    initAuth();
    return onAuthStateChanged(auth, (u) => { if (u) checkSaveData(u.uid); else setScreen('title'); });
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (resolution === 'auto') setViewportSize({ width: window.innerWidth, height: window.innerHeight });
      else { const [w, h] = resolution.split('x').map(Number); setViewportSize({ width: w, height: h }); }
    };
    handleResize(); 
    window.addEventListener('resize', handleResize);
    const handleKeyDown = (e: KeyboardEvent) => {
      input.current.keys[e.key.toLowerCase()] = true;
      if (e.key.toLowerCase() === 'i') setActiveMenu(prev => prev === 'inventory' ? 'none' : 'inventory');
      if (e.key.toLowerCase() === 'c') setActiveMenu(prev => prev === 'stats' ? 'none' : 'stats');
      if (e.key === 'Escape') setActiveMenu('none');
    };
    const handleKeyUp = (e: KeyboardEvent) => input.current.keys[e.key.toLowerCase()] = false;
    window.addEventListener('keydown', handleKeyDown); window.addEventListener('keyup', handleKeyUp);
    return () => { window.removeEventListener('resize', handleResize); window.removeEventListener('keydown', handleKeyDown); window.removeEventListener('keyup', handleKeyUp); };
  }, [resolution]);

  const checkSaveData = async (uid: string) => {
    if (!db) { setScreen('title'); return; }
    try {
      const snap = await getDoc(doc(db, 'artifacts', appId, 'users', uid, 'saves', 'slot1'));
      if (snap.exists()) setSaveData(snap.data());
      setScreen('title');
    } catch (e) { setScreen('title'); }
  };

  const startGame = async (job: Job, gender: Gender = 'Male', load = false) => {
    setLoadingProgress(10);
    let player: PlayerEntity, worldX = 0, worldY = 0, savedChunks: Record<string, ChunkData> = {}, locationId = 'world';
    
    const worldChunk = generateOverworld();
    let worldSpawnX = (worldChunk.map[0].length * GAME_CONFIG.TILE_SIZE) / 2;
    let worldSpawnY = (worldChunk.map.length * GAME_CONFIG.TILE_SIZE) / 2;
    
    for(let y=0; y<worldChunk.map.length; y++) {
        for(let x=0; x<worldChunk.map[0].length; x++) {
            if(worldChunk.map[y][x].type === 'town_entrance') {
                worldSpawnX = x * GAME_CONFIG.TILE_SIZE;
                worldSpawnY = y * GAME_CONFIG.TILE_SIZE;
                break;
            }
        }
    }
    
    setLoadingProgress(50);

    if (load && saveData) {
      player = { ...saveData.player }; 
      worldX = saveData.worldX; worldY = saveData.worldY; 
      savedChunks = saveData.savedChunks || {};
      if (!savedChunks['world']) savedChunks['world'] = worldChunk;
      locationId = saveData.locationId || 'world';
      updatePlayerStats(player);
    } else {
      player = createPlayer(job, gender); 
      updatePlayerStats(player);
      locationId = 'town_start';
      player.inventory.push(getStarterItem(job));
      savedChunks['world'] = worldChunk;
      savedChunks['town_start'] = generateTownMap('town_start');
    }
    
    let currentChunk = savedChunks[locationId] || getMapData(locationId);
    setLoadingProgress(90);

    if (!load) {
        if (locationId === 'town_start') {
             player.x = (currentChunk.map[0].length * GAME_CONFIG.TILE_SIZE) / 2;
             player.y = (currentChunk.map.length * GAME_CONFIG.TILE_SIZE) / 2;
        } else {
             player.x = worldSpawnX; player.y = worldSpawnY;
        }
    }

    gameState.current = {
      worldX, worldY, currentBiome: currentChunk.biome, savedChunks,
      map: currentChunk.map, player, enemies: currentChunk.enemies, droppedItems: currentChunk.droppedItems, locationId,
      projectiles: [], particles: [], floatingTexts: [], camera: { x: 0, y: 0 }, gameTime: 0, isPaused: false, wave: 1,
      lastWorldPos: { x: worldSpawnX, y: worldSpawnY + GAME_CONFIG.TILE_SIZE }
    };
    
    setWorldInfo({ x: worldX, y: worldY, biome: currentChunk.biome });
    setLoadingProgress(100);
    setTimeout(() => { setScreen('game'); setLoadingProgress(0); }, 200);
  };

  const switchLocation = (newLocationId: string) => {
    if (!gameState.current || isMapLoading) return;
    const state = gameState.current;

    if (state.lastTeleportTime && state.gameTime - state.lastTeleportTime < 60) return;

    // ロード開始
    setIsMapLoading(true);
    setLoadingProgress(0);
    
    const newChunk = state.savedChunks[newLocationId] || getMapData(newLocationId);
    setLoadingMapName(BIOME_NAMES[newChunk.biome] || 'エリア');

    // ロード進行の演出
    let currentProg = 0;
    const loadTimer = setInterval(() => {
      currentProg += 5 + Math.random() * 10;
      if (currentProg >= 100) {
        currentProg = 100;
        clearInterval(loadTimer);
        
        // 実際のマップ切り替え処理
        performActualSwitch(newLocationId, newChunk);
      }
      setLoadingProgress(Math.floor(currentProg));
    }, 50);
  };

  const performActualSwitch = (newLocationId: string, newChunk: ChunkData) => {
    const state = gameState.current;
    if (!state) return;

    if (state.locationId === 'world') state.lastWorldPos = { x: state.player.x, y: state.player.y };

    state.savedChunks[state.locationId] = {
        map: state.map, enemies: state.enemies, droppedItems: state.droppedItems, biome: state.currentBiome, locationId: state.locationId
    };

    if (!state.savedChunks[newLocationId]) state.savedChunks[newLocationId] = newChunk;

    state.map = newChunk.map;
    state.enemies = newChunk.enemies;
    state.droppedItems = newChunk.droppedItems;
    state.currentBiome = newChunk.biome;
    state.locationId = newChunk.locationId;
    state.lastTeleportTime = state.gameTime;
    
    input.current.keys = {};

    if (newLocationId === 'world' && state.lastWorldPos) {
       state.player.x = state.lastWorldPos.x;
       state.player.y = state.lastWorldPos.y + 64; 
    } else {
       state.player.x = (newChunk.map[0].length * GAME_CONFIG.TILE_SIZE) / 2;
       state.player.y = (newChunk.map.length * GAME_CONFIG.TILE_SIZE) - 96; 
    }

    setWorldInfo({x: state.worldX, y: state.worldY, biome: state.currentBiome});
    
    // ロード終了
    setTimeout(() => {
      setIsMapLoading(false);
      setLoadingProgress(0);
      setMessage(`${BIOME_NAMES[state.currentBiome] || state.currentBiome} に到着しました`); 
      setTimeout(() => setMessage(null), 2000);
    }, 200);
  };

  const gameLoop = () => {
    if (!gameState.current || !canvasRef.current || isMapLoading) { 
      reqRef.current = requestAnimationFrame(gameLoop); 
      return; 
    }
    const state = gameState.current; const ctx = canvasRef.current.getContext('2d'); if (!ctx) return;
    
    if (!state.isPaused && activeMenu === 'none') {
      state.gameTime++;
      const p = state.player;
      let dx = 0, dy = 0, spd = p.speed;
      if (input.current.keys['w'] || input.current.keys['arrowup']) dy = -spd;
      if (input.current.keys['s'] || input.current.keys['arrowdown']) dy = spd;
      if (input.current.keys['a'] || input.current.keys['arrowleft']) dx = -spd;
      if (input.current.keys['d'] || input.current.keys['arrowright']) dx = spd;
      
      if (dx > 0) p.direction = 0; if (dx < 0) p.direction = 2; if (dy > 0) p.direction = 1; if (dy < 0) p.direction = 3;
      if (dx !== 0 && dy !== 0) { dx *= 0.707; dy *= 0.707; } 

      if (dx !== 0 || dy !== 0) {
        const nextPos = resolveMapCollision(p, dx, dy, state.map);
        const feetX = nextPos.x + p.width / 2;
        const feetY = nextPos.y + p.height - 4; 
        const tileX = Math.floor(feetX / GAME_CONFIG.TILE_SIZE);
        const tileY = Math.floor(feetY / GAME_CONFIG.TILE_SIZE);
        const tile = state.map[tileY]?.[tileX];
        
        if (tile && tile.teleportTo) {
           switchLocation(tile.teleportTo);
           return; 
        }
        p.x = nextPos.x; p.y = nextPos.y;
      }
    }
    renderGame(ctx, state, loadedAssets);
    if (state.gameTime % 10 === 0) setUiState({...state.player});
    reqRef.current = requestAnimationFrame(gameLoop);
  };

  useEffect(() => { if (screen === 'game') gameLoop(); return () => { if (reqRef.current) cancelAnimationFrame(reqRef.current); } }, [screen, isMapLoading]);

  if (!isConfigValid) return <div className="w-full h-screen bg-slate-900 text-white flex items-center justify-center">設定エラー</div>;
  if (screen === 'auth') return <div className="w-full h-screen bg-slate-900 text-white flex items-center justify-center">接続中...</div>;
  if (screen === 'title') return <TitleScreen onStart={() => setScreen('job_select')} onContinue={() => startGame('Swordsman', 'Male', true)} canContinue={!!saveData} resolution={resolution} setResolution={setResolution} loadingProgress={loadingProgress} />;
  if (screen === 'job_select') return <JobSelectScreen onBack={() => setScreen('title')} onSelect={(j, g) => startGame(j, g)} loadedAssets={loadedAssets} />;

  return (
    <div className="w-full h-screen bg-black flex items-center justify-center overflow-hidden relative">
      <canvas ref={canvasRef} width={viewportSize.width} height={viewportSize.height} className="bg-black" />
      
      {/* Loading Overlay */}
      {isMapLoading && (
        <div className="absolute inset-0 bg-slate-900 flex flex-col items-center justify-center z-[100] transition-opacity duration-300">
          <div className="text-white text-2xl font-bold mb-8 animate-pulse">{loadingMapName} へ移動中...</div>
          <div className="w-64 h-4 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
            <div 
              className="h-full bg-yellow-500 transition-all duration-100 ease-out shadow-[0_0_15px_rgba(234,179,8,0.5)]"
              style={{ width: `${loadingProgress}%` }}
            />
          </div>
          <div className="mt-4 text-yellow-500 font-mono text-xl">{loadingProgress}%</div>
          <div className="mt-12 text-slate-400 text-sm italic">広大な世界を生成しています</div>
        </div>
      )}

      {uiState && <GameHUD uiState={uiState} worldInfo={worldInfo} toggleMenu={(m) => setActiveMenu(activeMenu === m ? 'none' : m)} />}
      {message && <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-black/80 text-white px-6 py-2 rounded-full border border-yellow-500/50 shadow-lg z-50">{message}</div>}
      
      {activeMenu === 'inventory' && uiState && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50 p-8">
          <InventoryMenu uiState={uiState} onEquip={() => {}} onUnequip={() => {}} onClose={() => setActiveMenu('none')} />
        </div>
      )}
    </div>
  );
}
