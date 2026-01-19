import { useEffect, useRef, useState, useMemo } from 'react';
import { Loader, Save, AlertTriangle, PlusCircle } from 'lucide-react';
import { onAuthStateChanged, signInAnonymously, signInWithCustomToken, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

import { auth, db, isConfigValid, appId } from './config';
import { PlayerEntity, Job, Gender, MenuType, ResolutionMode, Biome, ChunkData } from './types';
import { ASSETS_SVG, svgToUrl } from './assets';
import { createPlayer, generateWorldMap, getMapData, updatePlayerStats, generateTownMap } from './gameLogic';
import { resolveMapCollision, checkCollision } from './utils';
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
    return onAuthStateChanged(auth, (u) => { setUser(u); if (u) checkSaveData(u.uid); });
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (resolution === 'auto') setViewportSize({ width: window.innerWidth, height: window.innerHeight });
      else { const [w, h] = resolution.split('x').map(Number); setViewportSize({ width: w, height: h }); }
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
    window.addEventListener('keydown', handleKeyDown); window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('resize', handleResize); window.removeEventListener('keydown', handleKeyDown); window.removeEventListener('keyup', handleKeyUp);
      if (reqRef.current) cancelAnimationFrame(reqRef.current);
    };
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
    let player: PlayerEntity, locationId = 'town_start';
    const worldChunk = generateWorldMap();
    if (load && saveData) {
      player = { ...saveData.player }; locationId = saveData.locationId || 'world';
    } else {
      player = createPlayer(job, gender); 
      player.x = 15 * 32; player.y = 15 * 32;
    }
    const currentChunk = locationId === 'world' ? worldChunk : generateTownMap(locationId);
    gameState.current = {
      worldX: 0, worldY: 0, currentBiome: currentChunk.biome, savedChunks: { [locationId]: currentChunk, world: worldChunk }, 
      map: currentChunk.map, player, enemies: currentChunk.enemies, droppedItems: currentChunk.droppedItems, locationId,
      projectiles: [], particles: [], floatingTexts: [], camera: { x: 0, y: 0 }, gameTime: 0, isPaused: false
    };
    setScreen('game');
  };

  const upgradeStat = (attr: keyof PlayerEntity['attributes']) => {
    if (!gameState.current || gameState.current.player.statPoints <= 0) return;
    gameState.current.player.attributes[attr]++;
    gameState.current.player.statPoints--;
    updatePlayerStats(gameState.current.player);
    setUiState({...gameState.current.player});
  };

  const gameLoop = () => {
    if (!gameState.current || !canvasRef.current) { reqRef.current = requestAnimationFrame(gameLoop); return; }
    const state = gameState.current; const ctx = canvasRef.current.getContext('2d'); if (!ctx) return;
    
    if (activeMenu === 'none') {
      const p = state.player; let dx = 0, dy = 0;
      if (input.current.keys['w'] || input.current.keys['arrowup']) dy = -p.speed;
      if (input.current.keys['s'] || input.current.keys['arrowdown']) dy = p.speed;
      if (input.current.keys['a'] || input.current.keys['arrowleft']) dx = -p.speed;
      if (input.current.keys['d'] || input.current.keys['arrowright']) dx = p.speed;
      
      p.isMoving = (dx !== 0 || dy !== 0);
      if (dx > 0) p.direction = 0; if (dx < 0) p.direction = 2; if (dy > 0) p.direction = 1; if (dy < 0) p.direction = 3;
      
      if (p.isMoving) {
        p.animFrame += 0.15;
        const nextPos = resolveMapCollision(p, dx, dy, state.map);
        p.x = nextPos.x; p.y = nextPos.y;
      }
      state.gameTime++;
    }
    
    renderGame(ctx, state, loadedAssets);
    if (state.gameTime % 10 === 0) setUiState({...state.player});
    reqRef.current = requestAnimationFrame(gameLoop);
  };
  useEffect(() => { if (screen === 'game') gameLoop(); return () => { if (reqRef.current) cancelAnimationFrame(reqRef.current); } }, [screen]);

  if (!isConfigValid) return <div className="w-full h-screen bg-slate-900 flex items-center justify-center text-white"><AlertTriangle className="mr-2 text-red-500" /> 設定エラー</div>;
  if (screen === 'auth') return <div className="w-full h-screen bg-slate-900 flex flex-col items-center justify-center text-white"><Loader className="animate-spin text-yellow-500 mb-4" size={48} /><h2 className="text-xl">クラウドに接続中...</h2></div>;
  if (screen === 'title') return <TitleScreen onStart={() => setScreen('job_select')} onContinue={() => startGame('Swordsman', 'Male', true)} canContinue={!!saveData} resolution={resolution} setResolution={setResolution} loadingProgress={loadingProgress} />;
  if (screen === 'job_select') return <JobSelectScreen onBack={() => setScreen('title')} onSelect={(j, g) => startGame(j, g)} loadedAssets={loadedAssets} />;

  return (
    <div className="w-full h-screen bg-black flex items-center justify-center overflow-hidden relative">
      <canvas ref={canvasRef} width={viewportSize.width} height={viewportSize.height} />
      {uiState && <GameHUD uiState={uiState} worldInfo={worldInfo} toggleMenu={(m) => setActiveMenu(activeMenu === m ? 'none' : m)} />}
      {activeMenu !== 'none' && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50 p-8">
           {activeMenu === 'status' && (
             <div className="bg-slate-800 p-8 rounded text-white shadow-2xl max-w-sm w-full">
               <h2 className="text-xl font-bold mb-4 border-b border-slate-600 pb-2">メニュー</h2>
               <button onClick={async () => {
                 setIsSaving(true);
                 await setDoc(doc(db!, 'artifacts', appId, 'users', user!.uid, 'saves', 'slot1'), { player: gameState.current.player, locationId: gameState.current.locationId });
                 setIsSaving(false); setMessage("保存しました！"); setTimeout(() => setMessage(null), 2000);
               }} disabled={isSaving} className="w-full py-2 bg-blue-600 hover:bg-blue-500 rounded mb-2 flex items-center justify-center gap-2">
                 {isSaving ? <Loader size={16} className="animate-spin" /> : <Save size={16} />} 保存
               </button>
               <button onClick={() => setActiveMenu('none')} className="w-full py-2 bg-slate-700 hover:bg-slate-600 rounded">閉じる</button>
             </div>
           )}
           {activeMenu === 'stats' && uiState && (
             <div className="bg-slate-900 border border-slate-700 p-8 rounded-lg text-white shadow-2xl max-w-md w-full">
               <div className="flex justify-between items-center mb-6">
                 <h2 className="text-2xl font-black text-yellow-500 italic uppercase">Character Stats</h2>
                 <div className="bg-yellow-600/20 text-yellow-500 px-3 py-1 rounded-full text-xs font-bold">Points: {uiState.statPoints}</div>
               </div>
               <div className="space-y-4">
                 {[
                   { id: 'strength', label: '腕力 (STR)', val: uiState.attributes.strength, desc: '攻撃力に影響' },
                   { id: 'vitality', label: '体力 (VIT)', val: uiState.attributes.vitality, desc: '最大HPに影響' },
                   { id: 'dexterity', label: '器用 (DEX)', val: uiState.attributes.dexterity, desc: '攻撃力と速度に影響' },
                   { id: 'intelligence', label: '知力 (INT)', val: uiState.attributes.intelligence, desc: '最大MPに影響' },
                   { id: 'endurance', label: '忍耐 (END)', val: uiState.attributes.endurance, desc: '防御力に影響' }
                 ].map(attr => (
                   <div key={attr.id} className="flex items-center justify-between bg-slate-800/50 p-3 rounded border border-slate-700">
                     <div>
                       <div className="text-sm font-bold">{attr.label}</div>
                       <div className="text-[10px] text-slate-500 uppercase">{attr.desc}</div>
                     </div>
                     <div className="flex items-center gap-4">
                       <span className="text-xl font-mono text-yellow-400">{attr.val}</span>
                       <button 
                         disabled={uiState.statPoints <= 0}
                         onClick={() => upgradeStat(attr.id as any)}
                         className={`p-1 rounded-full transition-colors ${uiState.statPoints > 0 ? 'text-yellow-500 hover:bg-yellow-500/20' : 'text-slate-700 cursor-not-allowed'}`}
                       >
                         <PlusCircle size={24} />
                       </button>
                     </div>
                   </div>
                 ))}
               </div>
               <button onClick={() => setActiveMenu('none')} className="mt-8 w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded transition-colors uppercase tracking-widest text-sm">Close Status</button>
             </div>
           )}
           {activeMenu === 'inventory' && uiState && <InventoryMenu uiState={uiState} onEquip={()=>{}} onUnequip={()=>{}} onClose={() => setActiveMenu('none')} />}
        </div>
      )}
      {message && <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-black/80 text-white px-6 py-2 rounded-full border border-yellow-500/50 z-50">{message}</div>}
    </div>
  );
}
