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

  // モーション対応のアセット読み込みロジックの改善
  const loadedAssets = useMemo(() => {
    const images: Record<string, HTMLImageElement> = {};
    const allAssets = { ...HERO_ASSETS, ...MONSTER_ASSETS };
    
    Object.entries(allAssets).forEach(([key, value]) => { 
      if (typeof value === 'string') {
        const img = new Image(); 
        img.src = svgToUrl(value); 
        images[key] = img;
      } else if (value && typeof value === 'object') {
        const motions = value as Record<string, string>;
        Object.entries(motions).forEach(([motion, svg]) => {
          const img = new Image();
          img.src = svgToUrl(svg);
          images[`${key}_${motion}`] = img;
        });

        // 常に 'idle' をデフォルトとして登録しておく
        if (motions.idle) {
          const img = new Image();
          img.src = svgToUrl(motions.idle);
          images[key] = img;
        }
      }
    });
    return images;
  }, []);

  useEffect(() => {
    if (!auth) {
      setScreen('title');
      return;
    }

    // 認証初期化
    const initAuth = async () => {
      try {
        // @ts-ignore
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (e) {
        console.error("Auth initialization failed:", e);
        setScreen('title');
      }
    };

    initAuth();

    // 認証状態の監視
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u) {
        // ログイン成功時にセーブデータを確認
        checkSaveData(u.uid);
      } else {
        // ログインしていない場合はタイトル画面へ（接続中画面で止まるのを防ぐ）
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
      // セーブデータ確認が終わったらタイトルへ
      if (screen === 'auth') setScreen('title');
    } catch (e) {
      console.error("Failed to fetch save data:", e);
      setScreen('title');
    }
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
        // 初期スポーン位置（タウン内）
        player.x = 15 * 32; 
        player.y = 15 * 32;
      }

      const currentChunk = locationId === 'world' ? worldChunk : generateTownMap(locationId);
      
      gameState.current = {
        worldX: 0,
        worldY: 0,
        currentBiome: currentChunk.biome,
        savedChunks: { [locationId]: currentChunk, world: worldChunk }, 
        map: currentChunk.map,
        player,
        enemies: currentChunk.enemies,
        droppedItems: currentChunk.droppedItems,
        locationId,
        projectiles: [],
        particles: [],
        floatingTexts: [],
        camera: { x: 0, y: 0 },
        gameTime: 0,
        isPaused: false
      };

      setWorldInfo({ x: player.x, y: player.y, biome: currentChunk.biome });
      setUiState({ ...player });
      setScreen('game');
    } catch (e) {
      console.error("Failed to start game:", e);
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
      }
      state.gameTime++;
    }
    
    renderGame(ctx, state, loadedAssets);
    
    // UI情報の定期的な同期
    if (state.gameTime % 10 === 0) {
      setUiState({ ...state.player });
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

  // 設定エラー時の表示
  if (!isConfigValid) {
    return (
      <div className="w-full h-screen bg-slate-900 flex items-center justify-center text-white">
        <div className="bg-red-900/20 p-6 rounded-lg border border-red-500/50 flex items-center">
          <AlertTriangle className="mr-3 text-red-500" size={32} />
          <div>
            <h1 className="text-xl font-bold">Firebase設定エラー</h1>
            <p className="text-sm opacity-70">設定を確認してください。</p>
          </div>
        </div>
      </div>
    );
  }

  // 認証待機中の表示
  if (screen === 'auth') {
    return (
      <div className="w-full h-screen bg-slate-900 flex flex-col items-center justify-center text-white">
        <Loader className="animate-spin text-yellow-500 mb-4" size={48} />
        <h2 className="text-xl font-bold tracking-widest">CONNECTING TO WORLD...</h2>
        <p className="text-xs opacity-50 mt-2">Authenticating your hero...</p>
      </div>
    );
  }

  // タイトル、職業選択、ゲーム画面の切り替え
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
                        await setDoc(doc(db!, 'artifacts', appId, 'users', user!.uid, 'saves', 'slot1'), { 
                          player: gameState.current.player, 
                          locationId: gameState.current.locationId 
                        });
                        setMessage("冒険の記録を保存しました。");
                      } catch (e) {
                        setMessage("保存に失敗しました。");
                      } finally {
                        setIsSaving(false);
                        setTimeout(() => setMessage(null), 2000);
                      }
                    }} 
                    disabled={isSaving} 
                    className="w-full py-3 bg-blue-600 hover:bg-blue-500 rounded mb-4 flex items-center justify-center gap-2 transition-colors"
                  >
                    {isSaving ? <Loader size={16} className="animate-spin" /> : <Save size={16} />} 
                    セーブする
                  </button>
                  <button 
                    onClick={() => setActiveMenu('none')} 
                    className="w-full py-2 bg-slate-700 hover:bg-slate-600 rounded transition-colors"
                  >
                    閉じる
                  </button>
                </div>
              )}

              {activeMenu === 'stats' && uiState && (
                <div className="bg-slate-900 border border-slate-700 p-8 rounded-lg text-white shadow-2xl max-w-md w-full">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-black text-yellow-500 italic uppercase tracking-tighter">Character Stats</h2>
                    <div className="bg-yellow-600/20 text-yellow-500 px-3 py-1 rounded-full text-xs font-bold border border-yellow-500/30">
                      Points: {uiState.statPoints}
                    </div>
                  </div>
                  <div className="space-y-4">
                    {[
                      { id: 'strength', label: '腕力 (STR)', val: uiState.attributes.strength, desc: '物理攻撃力に影響' },
                      { id: 'vitality', label: '体力 (VIT)', val: uiState.attributes.vitality, desc: '最大HPに影響' },
                      { id: 'dexterity', label: '器用 (DEX)', val: uiState.attributes.dexterity, desc: '攻撃力と移動速度に影響' },
                      { id: 'intelligence', label: '知力 (INT)', val: uiState.attributes.intelligence, desc: '最大MPに影響' },
                      { id: 'endurance', label: '忍耐 (END)', val: uiState.attributes.endurance, desc: '物理防御力に影響' }
                    ].map(attr => (
                      <div key={attr.id} className="flex items-center justify-between bg-slate-800/50 p-3 rounded border border-slate-700 hover:border-slate-500 transition-colors">
                        <div>
                          <div className="text-sm font-bold text-slate-200">{attr.label}</div>
                          <div className="text-[10px] text-slate-500 uppercase font-mono">{attr.desc}</div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-xl font-mono text-yellow-400 font-bold">{attr.val}</span>
                          <button 
                            disabled={uiState.statPoints <= 0}
                            onClick={() => upgradeStat(attr.id as any)}
                            className={`p-1 rounded-full transition-all ${uiState.statPoints > 0 ? 'text-yellow-500 hover:bg-yellow-500/20 hover:scale-110 active:scale-90' : 'text-slate-700 cursor-not-allowed opacity-30'}`}
                          >
                            <PlusCircle size={24} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button 
                    onClick={() => setActiveMenu('none')} 
                    className="mt-8 w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded transition-colors uppercase tracking-widest text-sm border border-slate-700"
                  >
                    Close Status
                  </button>
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
        <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-slate-900/90 text-white px-8 py-3 rounded-full border border-yellow-500/50 shadow-2xl z-[100] animate-in fade-in slide-in-from-top-4 duration-300">
          <p className="text-sm font-bold flex items-center gap-2">
            <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
            {message}
          </p>
        </div>
      )}
    </div>
  );
}
