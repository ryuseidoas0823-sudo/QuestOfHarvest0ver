import { useEffect, useRef, useState, useMemo } from 'react';
import { Loader, Save, AlertTriangle } from 'lucide-react';
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
  const loadingMessage = 'クラウドに接続中...';
  const [loadingProgress, setLoadingProgress] = useState(0); 
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameState = useRef<any>(null);
  const reqRef = useRef<number>();
  const input = useRef({ keys: {} as Record<string, boolean>, mouse: {x:0, y:0, down: false} });
  const [uiState, setUiState] = useState<PlayerEntity | null>(null);
  const [worldInfo, setWorldInfo] = useState<{x:number, y:number, biome:Biome}>({x:0, y:0, biome:'WorldMap'});
  const [activeMenu, setActiveMenu] = useState<MenuType>('none');
  const [message, setMessage] = useState<string | null>(null);
  const [viewportSize, setViewportSize] = useState({ width: 800, height: 600 });
  const [resolution, setResolution] = useState<ResolutionMode>('auto');
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const loadedAssets = useMemo(() => {
    const images: Record<string, HTMLImageElement> = {};
    Object.entries(ASSETS_SVG).forEach(([key, svg]) => { const img = new Image(); img.src = svgToUrl(svg); images[key] = img; });
    return images;
  }, []);

  useEffect(() => {
    if (!auth) {
      setScreen('title');
      return;
    }
    const initAuth = async () => {
      try {
        // @ts-ignore
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) await signInWithCustomToken(auth, __initial_auth_token); else await signInAnonymously(auth);
      } catch (e: any) {
        setScreen('title');
      }
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
      input.current.keys[e.key.toLowerCase()] = true;
      if (e.key.toLowerCase() === 'i') setActiveMenu(prev => prev === 'inventory' ? 'none' : 'inventory');
      if (e.key.toLowerCase() === 'c') setActiveMenu(prev => prev === 'stats' ? 'none' : 'stats');
      if (e.key === 'Escape') setActiveMenu('none');
    };
    const handleKeyUp = (e: KeyboardEvent) => input.current.keys[e.key.toLowerCase()] = false;
    const handleMouseInput = (e: any) => {
        if (!canvasRef.current) return;
        const r = canvasRef.current.getBoundingClientRect();
        input.current.mouse.x = e.clientX - r.left; input.current.mouse.y = e.clientY - r.top;
        if(e.type==='mousedown') input.current.mouse.down=true; if(e.type==='mouseup') input.current.mouse.down=false;
    };
    window.addEventListener('keydown', handleKeyDown); window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousedown', handleMouseInput); window.addEventListener('mouseup', handleMouseInput); window.addEventListener('mousemove', handleMouseInput);
    return () => {
      window.removeEventListener('resize', handleResize); window.removeEventListener('keydown', handleKeyDown); window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousedown', handleMouseInput); window.removeEventListener('mouseup', handleMouseInput); window.removeEventListener('mousemove', handleMouseInput);
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
    setLoadingProgress(10);
    let player: PlayerEntity, worldX = 0, worldY = 0, savedChunks: Record<string, ChunkData> = {}, locationId = 'world';
    const worldChunk = generateWorldMap();
    let worldSpawnX = 210 * 32, worldSpawnY = 60 * 32;

    if (load && saveData) {
      player = { ...saveData.player }; worldX = saveData.worldX; worldY = saveData.worldY; savedChunks = saveData.savedChunks || {};
      if (!savedChunks['world']) savedChunks['world'] = worldChunk;
      updatePlayerStats(player); locationId = saveData.locationId || 'world';
    } else {
      player = createPlayer(job, gender); updatePlayerStats(player);
      locationId = 'town_start'; 
      savedChunks['world'] = worldChunk;
      savedChunks['town_start'] = generateTownMap('town_start');
    }
    
    let currentChunk = savedChunks[locationId] || getMapData(locationId);
    if (!load) {
        if (locationId === 'town_start') { player.x = 15 * 32; player.y = 15 * 32; }
        else { player.x = worldSpawnX; player.y = worldSpawnY; }
    }

    gameState.current = {
      worldX, worldY, currentBiome: currentChunk.biome, savedChunks, 
      map: currentChunk.map, player, enemies: currentChunk.enemies, droppedItems: currentChunk.droppedItems, locationId,
      projectiles: [], particles: [], floatingTexts: [], camera: { x: 0, y: 0 }, gameTime: 0, isPaused: false, wave: 1,
      lastWorldPos: { x: worldSpawnX, y: worldSpawnY + 64 }
    };
    setScreen('game');
  };

  const switchLocation = (newLocationId: string) => {
    if (!gameState.current) return;
    const state = gameState.current;
    if (state.lastTeleportTime && state.gameTime - state.lastTeleportTime < 60) return;

    state.savedChunks[state.locationId] = { map: state.map, enemies: state.enemies, droppedItems: state.droppedItems, biome: state.currentBiome, locationId: state.locationId };
    if (state.locationId === 'world') state.lastWorldPos = { x: state.player.x, y: state.player.y };

    let newChunk = state.savedChunks[newLocationId] || getMapData(newLocationId);
    state.map = newChunk.map; state.enemies = newChunk.enemies; state.droppedItems = newChunk.droppedItems;
    state.currentBiome = newChunk.biome; state.locationId = newChunk.locationId;
    state.projectiles = []; state.lastTeleportTime = state.gameTime;
    input.current.keys = {}; input.current.mouse.down = false;

    if (newLocationId === 'world' && state.lastWorldPos) { state.player.x = state.lastWorldPos.x; state.player.y = state.lastWorldPos.y + 64; }
    else { state.player.x = (newChunk.map[0].length * 32) / 2; state.player.y = (newChunk.map.length * 32) - 96; }

    setWorldInfo({x: state.worldX, y: state.worldY, biome: state.currentBiome});
    setMessage(`${BIOME_NAMES[state.currentBiome]} に移動しました`); setTimeout(() => setMessage(null), 2000);
  };

  const gameLoop = () => {
    if (!gameState.current || !canvasRef.current) { reqRef.current = requestAnimationFrame(gameLoop); return; }
    const state = gameState.current; const ctx = canvasRef.current.getContext('2d'); if (!ctx) return;
    if (!state.isPaused && activeMenu === 'none') {
      state.gameTime++;
      const p = state.player;
      let dx = 0, dy = 0, spd = p.speed;
      if (input.current.keys['w'] || input.current.keys['arrowup']) dy = -spd;
      if (input.current.keys['s'] || input.current.keys['arrowdown']) dy = spd;
      if (input.current.keys['a'] || input.current.keys['arrowleft']) dx = -spd;
      if (input.current.keys['d'] || input.current.keys['arrowright']) dx = spd;
      
      p.isMoving = (dx !== 0 || dy !== 0);
      if (dx > 0) p.direction = 0; if (dx < 0) p.direction = 2; if (dy > 0) p.direction = 1; if (dy < 0) p.direction = 3;
      if (dx !== 0 && dy !== 0) { dx *= 0.707; dy *= 0.707; } 
      
      if (p.isMoving) {
        p.animFrame = (p.animFrame || 0) + 0.15;
        const nextPos = resolveMapCollision(p, dx, dy, state.map);
        const centerX = nextPos.x + p.width / 2, centerY = nextPos.y + p.height / 2;
        const tileX = Math.floor(centerX / 32), tileY = Math.floor(centerY / 32);
        const tile = state.map[tileY]?.[tileX];
        if (tile && tile.teleportTo) { switchLocation(tile.teleportTo); return; }
        p.x = nextPos.x; p.y = nextPos.y;
      } else {
        p.animFrame = 0;
      }

      // 戦闘ロジック
      const now = Date.now();
      if ((input.current.keys[' '] || input.current.mouse.down) && now - p.lastAttackTime > p.attackCooldown && !p.isAttacking) {
        p.lastAttackTime = now; p.isAttacking = true;
        p.attackPhase = 1; 
        setTimeout(() => { 
          if(gameState.current) { 
            gameState.current.player.isAttacking = false; 
            gameState.current.player.attackPhase = 0; 
          }
        }, 200);
      }

      if (p.isAttacking) {
        // ヒットボックスを寛大に設定
        let ax = p.x, ay = p.y, aw = 70, ah = 70;
        if (p.direction === 0) { ax += p.width / 2; ay -= 23; } // 右
        else if (p.direction === 2) { ax -= 58; ay -= 23; } // 左
        else if (p.direction === 1) { ay += p.height / 2; ax -= 23; } // 下
        else { ay -= 58; ax -= 23; } // 上
        
        const attackRect = { x: ax, y: ay, width: aw, height: ah };
        state.enemies.forEach((e: any) => {
          if (e.dead || e.isNPC) return;
          if (checkCollision(attackRect, e)) {
            const dmg = Math.max(1, Math.floor((p.attack - e.defense/2) * (0.9 + Math.random() * 0.2)));
            e.hp -= dmg;
            const angle = Math.atan2(e.y - p.y, e.x - p.x); e.x += Math.cos(angle) * 10; e.y += Math.sin(angle) * 10;
            state.floatingTexts.push({ id: crypto.randomUUID(), x: e.x, y: e.y, text: `-${dmg}`, color: '#fff', life: 30, type: 'text', width: 0, height: 0, dead: false });
            if (e.hp <= 0) {
              e.dead = true; p.xp += e.xpValue; p.gold += 5;
              if (p.xp >= p.nextLevelXp) { p.level++; p.xp -= p.nextLevelXp; p.nextLevelXp = Math.floor(p.nextLevelXp * 1.5); p.statPoints += 3; updatePlayerStats(p); p.hp = p.maxHp; }
            }
          }
        });
      }

      // 敵AI
      state.enemies.forEach((e: any) => {
        if (e.dead || e.isNPC) return;
        const dist = Math.sqrt((p.x - e.x)**2 + (p.y - e.y)**2);
        if (dist < e.detectionRange) {
          const angle = Math.atan2(p.y - e.y, p.x - e.x);
          e.x += Math.cos(angle) * e.speed; e.y += Math.sin(angle) * e.speed;
          e.isMoving = true; e.animFrame = (e.animFrame || 0) + 0.1;
          if (dist < 35 && now - e.lastAttackTime > e.attackCooldown) {
            e.lastAttackTime = now; const dmg = Math.max(1, Math.floor(e.attack - p.defense/2)); p.hp -= dmg;
            state.floatingTexts.push({ id: crypto.randomUUID(), x: p.x, y: p.y, text: `-${dmg}`, color: '#f00', life: 30, type: 'text', width: 0, height: 0, dead: false });
            if (p.hp <= 0) { p.hp = p.maxHp; switchLocation('town_start'); }
          }
        } else {
          e.isMoving = false;
        }
      });

      state.enemies = state.enemies.filter((e: any) => !e.dead);
      state.floatingTexts.forEach((t: any) => { t.y -= 1; t.life--; });
      state.floatingTexts = state.floatingTexts.filter((t: any) => t.life > 0);
    }
    renderGame(ctx, state, loadedAssets);
    if (state.gameTime % 10 === 0) setUiState({...state.player});
    reqRef.current = requestAnimationFrame(gameLoop);
  };
  useEffect(() => { if (screen === 'game') gameLoop(); return () => { if (reqRef.current) cancelAnimationFrame(reqRef.current); } }, [screen]);

  const saveGame = async () => {
    if (!gameState.current || !user || !db) return;
    setIsSaving(true);
    const state = gameState.current;
    state.savedChunks[state.locationId] = { map: state.map, enemies: state.enemies, droppedItems: state.droppedItems, biome: state.currentBiome, locationId: state.locationId };
    const data = { player: state.player, worldX: state.worldX, worldY: state.worldY, savedChunks: state.savedChunks, wave: state.wave, locationId: state.locationId };
    try { await setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'saves', 'slot1'), data); setSaveData(data); setMessage("保存しました！"); } catch(e) { setMessage("保存失敗"); } finally { setIsSaving(false); setTimeout(() => setMessage(null), 2000); }
  };

  if (!isConfigValid) return <div className="w-full h-screen bg-slate-900 flex items-center justify-center text-white"><AlertTriangle className="mr-2 text-red-500" /> 設定エラー</div>;
  if (screen === 'auth') return <div className="w-full h-screen bg-slate-900 flex flex-col items-center justify-center text-white"><Loader className="animate-spin text-yellow-500 mb-4" size={48} /><h2 className="text-xl">{loadingMessage}</h2></div>;
  if (screen === 'title') return <TitleScreen onStart={() => setScreen('job_select')} onContinue={() => startGame('Swordsman', 'Male', true)} canContinue={!!saveData} resolution={resolution} setResolution={setResolution} loadingProgress={loadingProgress} />;
  if (screen === 'job_select') return <JobSelectScreen onBack={() => setScreen('title')} onSelect={(j, g) => startGame(j, g)} loadedAssets={loadedAssets} />;

  return (
    <div className="w-full h-screen bg-black flex items-center justify-center overflow-hidden relative" onContextMenu={e => e.preventDefault()}>
      <canvas ref={canvasRef} width={viewportSize.width} height={viewportSize.height} className="bg-black cursor-crosshair" />
      {uiState && <GameHUD uiState={uiState} worldInfo={worldInfo} toggleMenu={(m) => setActiveMenu(activeMenu === m ? 'none' : m)} />}
      {message && <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-black/80 text-white px-6 py-2 rounded-full border border-yellow-500/50">{message}</div>}
      {activeMenu !== 'none' && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50 p-8">
           {activeMenu === 'status' && <div className="bg-slate-800 p-8 rounded text-white shadow-2xl"><h2 className="text-xl font-bold mb-4 border-b border-slate-600 pb-2">メニュー</h2><button onClick={saveGame} disabled={isSaving} className="w-full py-2 bg-blue-600 hover:bg-blue-500 rounded mb-2 flex items-center justify-center gap-2">{isSaving ? <Loader size={16} className="animate-spin" /> : <Save size={16} />} 保存</button><button onClick={() => setActiveMenu('none')} className="w-full py-2 bg-slate-700 hover:bg-slate-600 rounded">閉じる</button></div>}
           {activeMenu === 'inventory' && uiState && <InventoryMenu uiState={uiState} onEquip={()=>{}} onUnequip={()=>{}} onClose={() => setActiveMenu('none')} />}
        </div>
      )}
    </div>
  );
}
