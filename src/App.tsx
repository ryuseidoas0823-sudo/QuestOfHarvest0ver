import { useEffect, useRef, useState, useMemo } from 'react';
import { Loader, Save, AlertTriangle, PlusCircle } from 'lucide-react';
import { onAuthStateChanged, signInAnonymously, signInWithCustomToken, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

import { auth, db, isConfigValid, appId } from './config';
import { PlayerEntity, Job, Gender, MenuType, ResolutionMode, Biome } from './types';
// 統合アセット構成からのインポート
import { HERO_ASSETS, MONSTER_ASSETS, svgToUrl } from './assets/index';
import { createPlayer, generateWorldMap, updatePlayerStats, generateTownMap } from './gameLogic';
import { resolveMapCollision } from './utils';
import { renderGame } from './renderer';

import { TitleScreen } from './components/TitleScreen';
import { JobSelectScreen } from './components/JobSelectScreen';
import { GameHUD } from './components/GameHUD';
import { InventoryMenu } from './components/InventoryMenu';

// グローバル変数の宣言
declare const __initial_auth_token: string | undefined;

export default function App() {
  const [screen, setScreen] = useState<'auth' | 'title' | 'game' | 'job_select'>('auth');
  const [saveData, setSaveData] = useState<any>(null);
  const loadingProgress = 0; 
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameState = useRef<any>(null);
  const reqRef = useRef<number>();
  const input = useRef({ keys: {} as Record<string, boolean>, mouse: {x:0, y:0, down: false} });
  const [uiState, setUiState] = useState<PlayerEntity | null>(null);
  const [worldInfo, setWorldInfo] = useState<{x:number, y:number, biome:Biome}>({x:0, y:0, biome:'WorldMap'}); 
  const [activeMenu, setActiveMenu] = useState<MenuType>('none');
  const [message, setMessage] = useState<string | null>(null);
  const [viewportSize, setViewportSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [resolution, setResolution] = useState<ResolutionMode>('auto');
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // アセット読み込みロジックの改善
  const loadedAssets = useMemo(() => {
    const images: Record<string, HTMLImageElement> = {};
    const allAssets = { ...(HERO_ASSETS || {}), ...(MONSTER_ASSETS || {}) };
    
    Object.entries(allAssets).forEach(([key, value]) => { 
      if (!value) return;

      if (typeof value === 'string') {
        try {
          const img = new Image(); 
          img.src = svgToUrl(value); 
          images[key] = img;
        } catch (e) {
          console.error(`Failed to load asset: ${key}`, e);
        }
      } else if (typeof value === 'object' && value !== null) {
        const motions = value as Record<string, unknown>;
        
        Object.entries(motions).forEach(([motion, svg]) => {
          if (typeof svg === 'string') {
            try {
              const img = new Image();
              img.src = svgToUrl(svg);
              // "Swordsman_Male_idle" のようなキーで保存
              images[`${key}_${motion}`] = img;
              
              // 互換性：idle の場合は "Swordsman_Male" というベースキーでも保存
              if (motion === 'idle') {
                const baseImg = new Image();
                baseImg.src = svgToUrl(svg);
                images[key] = baseImg;
              }
            } catch (e) {
              console.error(`Failed to load motion asset: ${key}_${motion}`, e);
            }
          }
        });
      }
    });
    return images;
  }, []);

  useEffect(() => {
    if (!auth) {
      setScreen('title');
      return;
    }

    const initAuth = async () => {
      try {
        const firebaseAuth = auth!;
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(firebaseAuth, __initial_auth_token);
        } else {
          await signInAnonymously(firebaseAuth);
        }
      } catch (e) {
        console.warn("Auth initialization failed - fallback to Title:", e);
        setScreen('title');
      }
    };

    initAuth();

    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u) {
        checkSaveData(u.uid);
      } else {
        if (screen === 'auth') setScreen('title');
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (resolution === 'auto') {
        setViewportSize({ width: window.innerWidth, height: window.innerHeight });
      } else {
        const [w, h] = resolution.split('x').map(Number);
        setViewportSize({ width: w, height: h });
      }
    };
    handleResize(); 
    window.addEventListener('resize', handleResize);

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      input.current.keys[key] = true;
      if (key === 'i') setActiveMenu(prev => prev === 'inventory' ? 'none' : 'inventory');
      if (key === 'c') setActiveMenu(prev => prev === 'stats' ? 'none' : 'stats');
      if (key === ' ') {
          if (gameState.current && !gameState.current.player.isAttacking) {
              gameState.current.player.isAttacking = true;
              setTimeout(() => { if(gameState.current) gameState.current.player.isAttacking = false; }, 300);
          }
      }
      if (e.key === 'Escape') setActiveMenu('none');
    };
    const handleKeyUp = (e: KeyboardEvent) => input.current.keys[e.key.toLowerCase()] = false;
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (reqRef.current) cancelAnimationFrame(reqRef.current);
    };
  }, [resolution]);

  const checkSaveData = async (uid: string) => {
    if (!db) {
      setScreen('title');
      return;
    }
    try {
      const snap = await getDoc(doc(db, 'artifacts', appId, 'users', uid, 'saves', 'slot1'));
      if (snap.exists()) {
        setSaveData(snap.data());
      }
      setScreen(prev => prev === 'auth' ? 'title' : prev);
    } catch (e) {
      setScreen('title');
    }
  };

  const handleTeleport = (dest: string) => {
    const state = gameState.current;
    if (!state) return;

    // 以前のマップデータがあれば再利用、なければ生成
    let newChunk = state.savedChunks[dest];
    
    if (dest === 'world') {
      if (!newChunk) newChunk = generateWorldMap();
      // data.ts / gameLogic.ts の town_entrance 座標 (row: 60, col: 210) に合わせる
      state.player.x = 210 * 32; 
      state.player.y = 60 * 32;
      setMessage("ワールドマップへ出ました");
    } else if (dest === 'town_start') {
      if (!newChunk) newChunk = generateTownMap('town_start');
      // 街のスポーン地点
      state.player.x = 15 * 32;
      state.player.y = 15 * 32;
      setMessage("街へ入りました");
    } else {
      return;
    }

    state.savedChunks[dest] = newChunk;
    state.map = newChunk.map;
    state.enemies = newChunk.enemies;
    state.droppedItems = newChunk.droppedItems;
    state.currentBiome = newChunk.biome;
    state.locationId = dest;
    
    setWorldInfo({ x: state.player.x, y: state.player.y, biome: newChunk.biome });
    setTimeout(() => setMessage(null), 2000);
  };

  const startGame = async (job: Job, gender: Gender = 'Male', load = false) => {
    try {
      let player: PlayerEntity, locationId = 'town_start';
      const worldChunk = generateWorldMap();

      if (load && saveData) {
        player = { ...saveData.player };
        locationId = saveData.locationId || 'world';
      } else {
        player = createPlayer(job, gender); 
        player.x = 15 * 32; 
        player.y = 15 * 32;
      }

      const currentChunk = locationId === 'world' ? worldChunk : generateTownMap(locationId);
      
      gameState.current = {
        worldX: 0, worldY: 0, currentBiome: currentChunk.biome,
        savedChunks: { [locationId]: currentChunk, world: worldChunk }, 
        map: currentChunk.map, player, enemies: currentChunk.enemies, droppedItems: currentChunk.droppedItems, locationId,
        projectiles: [], particles: [], floatingTexts: [], camera: { x: 0, y: 0 }, gameTime: 0, isPaused: false
      };

      setWorldInfo({ x: player.x, y: player.y, biome: currentChunk.biome });
      setUiState({ ...player });
      setScreen('game');
    } catch (e) {
      setMessage("ゲームの起動に失敗しました。");
      setScreen('title');
    }
  };

  const upgradeStat = (attr: keyof PlayerEntity['attributes']) => {
    if (!gameState.current || gameState.current.player.statPoints <= 0) return;
    gameState.current.player.attributes[attr]++;
    gameState.current.player.statPoints--;
    updatePlayerStats(gameState.current.player);
    setUiState({...gameState.current.player});
  };

  const gameLoop = () => {
    if (!gameState.current || !canvasRef.current || screen !== 'game') {
      reqRef.current = requestAnimationFrame(gameLoop);
      return;
    }
    
    const state = gameState.current;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    
    if (activeMenu === 'none') {
      const p = state.player;
      let dx = 0, dy = 0;
      if (input.current.keys['w'] || input.current.keys['arrowup']) dy = -p.speed;
      if (input.current.keys['s'] || input.current.keys['arrowdown']) dy = p.speed;
      if (input.current.keys['a'] || input.current.keys['arrowleft']) dx = -p.speed;
      if (input.current.keys['d'] || input.current.keys['arrowright']) dx = p.speed;
      
      p.isMoving = (dx !== 0 || dy !== 0);
      if (dx > 0) p.direction = 0;
      if (dx < 0) p.direction = 2;
      if (dy > 0) p.direction = 1;
      if (dy < 0) p.direction = 3;
      
      if (p.isMoving) {
        p.animFrame += 0.15;
        const nextPos = resolveMapCollision(p, dx, dy, state.map);
        p.x = nextPos.x;
        p.y = nextPos.y;

        // ポータル（マップ切り替え）の検知
        const gx = Math.floor((p.x + p.width/2) / 32);
        const gy = Math.floor((p.y + p.height/2) / 32);
        const tile = state.map[gy]?.[gx];
        if (tile?.teleportTo) {
            handleTeleport(tile.teleportTo);
        }
      }
      state.gameTime++;
    }
    
    renderGame(ctx, state, loadedAssets);
    
    if (state.gameTime % 10 === 0) {
      setUiState({ ...state.player });
      setWorldInfo(prev => ({ ...prev, x: state.player.x, y: state.player.y }));
    }
    
    reqRef.current = requestAnimationFrame(gameLoop);
  };

  useEffect(() => {
    if (screen === 'game') {
      gameLoop();
    }
    return () => {
      if (reqRef.current) cancelAnimationFrame(reqRef.current);
    };
  }, [screen]);

  if (!isConfigValid) {
    return (
      <div className="w-full h-screen bg-slate-900 flex items-center justify-center text-white p-8">
        <div className="bg-red-900/20 p-8 rounded-2xl border border-red-500/50 max-w-lg">
          <AlertTriangle className="mb-4 text-red-500" size={48} />
          <h1 className="text-2xl font-bold mb-2">Firebase Configuration Error</h1>
          <p className="opacity-70 mb-4">Firebaseの設定が正しくありません。Firebase ConsoleでAuthenticationを有効にし、Anonymous(匿名)ログインを許可してください。</p>
          <button onClick={() => window.location.reload()} className="px-6 py-2 bg-red-600 rounded-lg font-bold">Retry</button>
        </div>
      </div>
    );
  }

  if (screen === 'auth') {
    return (
      <div className="w-full h-screen bg-slate-900 flex flex-col items-center justify-center text-white">
        <Loader className="animate-spin text-yellow-500 mb-4" size={48} />
        <h2 className="text-xl font-bold tracking-widest uppercase text-center px-4">Connecting to World...</h2>
      </div>
    );
  }

  return (
    <div className="w-full h-screen bg-black flex items-center justify-center overflow-hidden relative font-sans">
      {screen === 'title' && (
        <TitleScreen 
          onStart={() => setScreen('job_select')} 
          onContinue={() => startGame('Swordsman', 'Male', true)} 
          canContinue={!!saveData} 
          resolution={resolution} 
          setResolution={setResolution} 
          loadingProgress={loadingProgress} 
        />
      )}

      {screen === 'job_select' && (
        <JobSelectScreen 
          onBack={() => setScreen('title')} 
          onSelect={(j, g) => startGame(j, g)} 
          loadedAssets={loadedAssets} 
        />
      )}

      {screen === 'game' && (
        <>
          <canvas ref={canvasRef} width={viewportSize.width} height={viewportSize.height} />
          {uiState && (
            <GameHUD 
              uiState={uiState} 
              worldInfo={worldInfo} 
              toggleMenu={(m) => setActiveMenu(activeMenu === m ? 'none' : m)} 
            />
          )}
          
          {activeMenu !== 'none' && (
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-8">
              {activeMenu === 'status' && (
                <div className="bg-slate-800 p-8 rounded border border-slate-600 text-white shadow-2xl max-w-sm w-full">
                  <h2 className="text-xl font-bold mb-4 border-b border-slate-600 pb-2">メニュー</h2>
                  <button 
                    onClick={async () => {
                      setIsSaving(true);
                      try {
                        const uid = user?.uid;
                        if (!uid) throw new Error("User not found");
                        await setDoc(doc(db!, 'artifacts', appId, 'users', uid, 'saves', 'slot1'), { 
                          player: gameState.current.player, 
                          locationId: gameState.current.locationId 
                        });
                        setMessage("保存完了！");
                      } catch (e) {
                        setMessage("保存失敗（匿名ログインが必要です）");
                      } finally {
                        setIsSaving(false);
                        setTimeout(() => setMessage(null), 2000);
                      }
                    }} 
                    disabled={isSaving} 
                    className="w-full py-3 bg-blue-600 hover:bg-blue-500 rounded mb-4 flex items-center justify-center gap-2"
                  >
                    {isSaving ? <Loader size={16} className="animate-spin" /> : <Save size={16} />} 
                    セーブ
                  </button>
                  <button onClick={() => setActiveMenu('none')} className="w-full py-2 bg-slate-700 hover:bg-slate-600 rounded">閉じる</button>
                </div>
              )}

              {activeMenu === 'stats' && uiState && (
                <div className="bg-slate-900 border border-slate-700 p-8 rounded-lg text-white shadow-2xl max-w-md w-full">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-black text-yellow-500 italic uppercase">Stats</h2>
                    <div className="text-xs font-bold text-yellow-500">Points: {uiState.statPoints}</div>
                  </div>
                  <div className="space-y-4">
                    {['strength', 'vitality', 'dexterity', 'intelligence', 'endurance'].map(attr => (
                      <div key={attr} className="flex items-center justify-between bg-slate-800/50 p-3 rounded">
                        <span className="text-sm font-bold uppercase">{attr}</span>
                        <div className="flex items-center gap-4">
                          <span className="text-xl font-mono text-yellow-400">{(uiState.attributes as any)[attr]}</span>
                          <button 
                            disabled={uiState.statPoints <= 0}
                            onClick={() => upgradeStat(attr as any)}
                            className="text-yellow-500 disabled:opacity-30"
                          >
                            <PlusCircle size={24} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => setActiveMenu('none')} className="mt-8 w-full py-3 bg-slate-800 rounded">閉じる</button>
                </div>
              )}

              {activeMenu === 'inventory' && uiState && (
                <InventoryMenu 
                  uiState={uiState} 
                  onEquip={()=>{}} 
                  onUnequip={()=>{}} 
                  onClose={() => setActiveMenu('none')} 
                />
              )}
            </div>
          )}
        </>
      )}

      {message && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-slate-900/90 text-white px-8 py-3 rounded-full border border-yellow-500/50 shadow-2xl z-[100] animate-pulse">
          {message}
        </div>
      )}
    </div>
  );
}
