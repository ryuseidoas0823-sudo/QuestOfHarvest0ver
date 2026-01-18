import { useEffect, useRef, useState, useMemo } from 'react';
import { Loader, Save, User, Monitor, AlertTriangle, X } from 'lucide-react';
import { onAuthStateChanged, signInAnonymously, signInWithCustomToken, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

import { auth, db, isConfigValid, appId, GAME_CONFIG } from './config';
import { GameState, PlayerEntity, Job, Gender, MenuType, ResolutionMode, Biome, Item, Attributes, ChunkData } from './types';
import { ASSETS_SVG, svgToUrl } from './assets';
import { createPlayer, generateRandomItem, generateWorldMap, getMapData, updatePlayerStats, generateEnemy, getStarterItem } from './gameLogic';
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
  const [loadingMessage, setLoadingMessage] = useState('クラウドに接続中...');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameState = useRef<GameState | null>(null);
  const reqRef = useRef<number>();
  const input = useRef({ keys: {} as Record<string, boolean>, mouse: {x:0, y:0, down: false} });
  const [uiState, setUiState] = useState<PlayerEntity | null>(null);
  const [worldInfo, setWorldInfo] = useState<{x:number, y:number, biome:Biome}>({x:0, y:0, biome:'WorldMap'});
  const [activeMenu, setActiveMenu] = useState<MenuType>('none');
  const [message, setMessage] = useState<string | null>(null);
  const [viewportSize, setViewportSize] = useState({ width: 800, height: 600 });
  const [resolution, setResolution] = useState<ResolutionMode>('auto');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const loadedAssets = useMemo(() => {
    const images: Record<string, HTMLImageElement> = {};
    Object.entries(ASSETS_SVG).forEach(([key, svg]) => { const img = new Image(); img.src = svgToUrl(svg); images[key] = img; });
    return images;
  }, []);

  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
      @keyframes glow { 0%, 100% { box-shadow: 0 0 5px rgba(234, 179, 8, 0.5); } 50% { box-shadow: 0 0 20px rgba(234, 179, 8, 0.8); } }
      @keyframes mist { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
      .animate-float { animation: float 3s ease-in-out infinite; }
      .animate-glow { animation: glow 2s ease-in-out infinite; }
      .bg-mist { background: linear-gradient(-45deg, #0f172a, #1e293b, #0f172a, #312e81); background-size: 400% 400%; animation: mist 15s ease infinite; }
      .pixel-art { image-rendering: pixelated; }
      .text-shadow-strong { text-shadow: 2px 2px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000; }
    `;
    document.head.appendChild(style); return () => { document.head.removeChild(style); };
  }, []);

  useEffect(() => {
    if (!auth) {
      console.warn("Auth not initialized. Starting in offline mode.");
      setLoadingMessage("オフラインモードで起動中...");
      setTimeout(() => setScreen('title'), 1000);
      return;
    }
    const initAuth = async () => {
      try {
        // @ts-ignore
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) await signInWithCustomToken(auth, __initial_auth_token); else await signInAnonymously(auth);
      } catch (e: any) {
        // エラーログを抑制し、ユーザーにはオフラインモードであることを伝える
        console.log("Offline Mode: Cloud features unavailable.", e.code);
        setLoadingMessage("オフラインモードで起動します...");
        setTimeout(() => setScreen('title'), 1500);
      }
    };
    initAuth();
    return onAuthStateChanged(auth, (u) => { setUser(u); if (u) checkSaveData(u.uid); });
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

  const startGame = (job: Job, gender: Gender = 'Male', load = false) => {
    let player: PlayerEntity, worldX = 0, worldY = 0, savedChunks: Record<string, ChunkData> = {}, locationId = 'world';
    
    // 1. ワールドマップの生成（またはロード準備）
    // 重要: ここで生成した worldChunk は必ず savedChunks に保存する
    const worldChunk = generateWorldMap();
    
    // ワールドマップ上のスポーン位置（街の入口）を特定
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

    if (load && saveData) {
      player = { ...saveData.player }; 
      worldX = saveData.worldX; 
      worldY = saveData.worldY; 
      // ロード時は保存されたチャンクデータを使う
      savedChunks = saveData.savedChunks || {};
      
      // もしセーブデータにworldが含まれていなければ（旧データなど）、新規生成したものを入れる
      if (!savedChunks['world']) {
          savedChunks['world'] = worldChunk;
      }
      
      updatePlayerStats(player);
      locationId = saveData.locationId || 'world';
    } else {
      player = createPlayer(job, gender); 
      updatePlayerStats(player);
      locationId = 'town_start'; // ニューゲームは街から
      const starterWeapon = getStarterItem(job);
      player.inventory.push(starterWeapon);
      
      // ニューゲーム時、生成したワールドマップを保存リストに登録
      savedChunks['world'] = worldChunk;
    }
    
    // 2. 現在のロケーションのマップを取得
    let currentChunk: ChunkData;
    if (savedChunks[locationId]) {
        currentChunk = savedChunks[locationId];
    } else {
        currentChunk = getMapData(locationId);
    }
    
    // プレイヤーの配置調整
    if (!load) {
        if (locationId === 'town_start') {
             player.x = (currentChunk.map[0].length * GAME_CONFIG.TILE_SIZE) / 2;
             player.y = (currentChunk.map.length * GAME_CONFIG.TILE_SIZE) / 2;
        } else {
             player.x = worldSpawnX;
             player.y = worldSpawnY;
        }
    }

    gameState.current = {
      worldX, worldY, currentBiome: currentChunk.biome, 
      savedChunks, // 修正されたsavedChunksをセット
      map: currentChunk.map, player, enemies: currentChunk.enemies, droppedItems: currentChunk.droppedItems, locationId,
      projectiles: [], particles: [], floatingTexts: [], camera: { x: 0, y: 0 }, gameTime: 0, isPaused: false, wave: 1,
      lastWorldPos: { x: worldSpawnX, y: worldSpawnY + 32 }
    };
    setScreen('game');
  };

  const switchLocation = (newLocationId: string) => {
    if (!gameState.current) return;
    const state = gameState.current;

    // 1. 移動前の現在のマップ状態を保存する
    // これにより、敵の倒した状況やドロップアイテム、マップの変更が保持される
    // また、ワールドマップの場合はその地形データが保持され、再生成を防ぐ
    state.savedChunks[state.locationId] = {
        map: state.map,
        enemies: state.enemies,
        droppedItems: state.droppedItems,
        biome: state.currentBiome,
        locationId: state.locationId
    };

    if (state.locationId === 'world') {
      state.lastWorldPos = { x: state.player.x, y: state.player.y };
    }

    // 2. 新しいマップの読み込み
    // 既に保存されたチャンクがあればそれを使い、なければ新規生成する
    let newChunk: ChunkData;
    if (state.savedChunks[newLocationId]) {
        newChunk = state.savedChunks[newLocationId];
    } else {
        newChunk = getMapData(newLocationId);
    }

    // ステート更新
    state.map = newChunk.map;
    state.enemies = newChunk.enemies;
    state.droppedItems = newChunk.droppedItems;
    state.currentBiome = newChunk.biome;
    state.locationId = newChunk.locationId;
    state.projectiles = []; // 弾幕はリセット

    // プレイヤー位置の調整
    if (newLocationId === 'world' && state.lastWorldPos) {
       // ワールドマップに戻る場合、前回の位置（街の入り口の前）に戻す
       state.player.x = state.lastWorldPos.x;
       state.player.y = state.lastWorldPos.y; 
       
       // 万が一障害物に埋まっていても utils.ts の resolveMapCollision で押し出されるはずだが
       // 念のため、周囲が安全かチェックするロジックを入れても良い（今回は省略）
    } else {
       // ダンジョンや街に入ったときは、決まった入り口（通常は下側中央）に出現
       // ダンジョン/街のマップ生成ロジックに合わせて調整
       state.player.x = (newChunk.map[0].length * 32) / 2;
       state.player.y = (newChunk.map.length * 32) - 64;
    }

    setWorldInfo({x: state.worldX, y: state.worldY, biome: state.currentBiome});
    setMessage(`${BIOME_NAMES[state.currentBiome] || state.currentBiome} に移動しました`); 
    setTimeout(() => setMessage(null), 2000);
  };

  // ... (gameLoop and other functions remain largely the same, but ensuring references to state are correct)

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
      if (dx > 0) p.direction = 0; if (dx < 0) p.direction = 2; if (dy > 0) p.direction = 1; if (dy < 0) p.direction = 3;
      if (dx !== 0 && dy !== 0) { dx *= 0.707; dy *= 0.707; } 
      p.vx = dx; p.vy = dy;

      if (dx !== 0 || dy !== 0) {
        const nextPos = resolveMapCollision(p, dx, dy, state.map);
        
        // ポータル判定
        const tileX = Math.floor((nextPos.x + p.width/2) / 32);
        const tileY = Math.floor((nextPos.y + p.height/2) / 32);
        const tile = state.map[tileY]?.[tileX];
        
        if (tile && tile.teleportTo) {
           switchLocation(tile.teleportTo);
           return; // マップ切り替え時はループ中断
        }

        p.x = nextPos.x; p.y = nextPos.y;
      }
      
      // ... (Rest of game loop logic: Drops, Combat, Enemy AI, etc.) ...
      state.droppedItems.forEach(drop => {
        if (checkCollision(p, drop)) {
          drop.dead = true; p.inventory.push(drop.item);
          // @ts-ignore
          gameState.current.floatingTexts.push({ id: crypto.randomUUID(), x: p.x, y: p.y - 20, width:0, height:0, color: drop.item.color, type: 'text', dead: false, text: drop.item.name, life: 60 });
          setMessage(`拾った：${drop.item.name}`); setTimeout(() => setMessage(null), 2000);
        }
      });

      const now = Date.now();
      if ((input.current.keys[' '] || input.current.mouse.down) && now - p.lastAttackTime > p.attackCooldown) {
        p.lastAttackTime = now; p.isAttacking = true; 
        // @ts-ignore
        setTimeout(() => { if(gameState.current) gameState.current.player.isAttacking = false; }, 200);
        // @ts-ignore
        const attackRect = { x: p.x + p.width/2 - 30, y: p.y + p.height/2 - 30, width: 60, height: 60 };
        state.enemies.forEach(e => {
          // @ts-ignore
          if (checkCollision(attackRect, e)) {
            const dmg = Math.max(1, Math.floor((p.attack - e.defense/2) * (0.9 + Math.random() * 0.2))); e.hp -= dmg;
            // @ts-ignore
            gameState.current.floatingTexts.push({ id: crypto.randomUUID(), x: e.x + e.width/2, y: e.y, width:0, height:0, color: '#fff', type: 'text', dead: false, text: `-${dmg}`, life: 30 });
            const angle = Math.atan2(e.y - p.y, e.x - p.x); e.x += Math.cos(angle) * 10; e.y += Math.sin(angle) * 10;
            if (e.hp <= 0) {
              e.dead = true; p.xp += e.xpValue; p.gold += Math.floor(Math.random() * 5) + 1;
              // @ts-ignore
              gameState.current.floatingTexts.push({ id: crypto.randomUUID(), x: e.x + e.width/2, y: e.y, width:0, height:0, color: '#ffd700', type: 'text', dead: false, text: `+${e.xpValue} XP`, life: 45 });
              if (p.xp >= p.nextLevelXp) {
                p.level++; p.xp -= p.nextLevelXp; p.nextLevelXp = Math.floor(p.nextLevelXp * 1.5); p.statPoints += 3; updatePlayerStats(p); p.hp = p.maxHp;
                // @ts-ignore
                gameState.current.floatingTexts.push({ id: crypto.randomUUID(), x: p.x, y: p.y - 40, width:0, height:0, color: '#00ff00', type: 'text', dead: false, text: "LEVEL UP!", life: 90 });
                setMessage("レベルアップ！Cキーで能力値を割り振れます。");
              }
              const dropChance = GAME_CONFIG.BASE_DROP_RATE * (e.rank === 'Boss' ? 5 : e.rank === 'Elite' ? 2 : 1);
              if (Math.random() < dropChance) {
                const item = generateRandomItem(e.level, e.rank === 'Boss' ? 5 : e.rank === 'Elite' ? 2 : 0);
                // @ts-ignore
                if (item) state.droppedItems.push({ id: crypto.randomUUID(), type: 'drop', x: e.x, y: e.y, width: 32, height: 32, color: item.color, item, life: 3000, bounceOffset: Math.random() * 10, dead: false });
              }
            }
          }
        });
      }

      state.enemies.forEach(e => {
        if (e.dead) return;
        const dist = Math.sqrt((p.x - e.x)**2 + (p.y - e.y)**2);
        if (dist < e.detectionRange) {
          const angle = Math.atan2(p.y - e.y, p.x - e.x);
          e.direction = Math.abs(Math.cos(angle)) > Math.abs(Math.sin(angle)) ? (Math.cos(angle) > 0 ? 0 : 2) : (Math.sin(angle) > 0 ? 1 : 3);
          const nextX = e.x + Math.cos(angle) * e.speed, nextY = e.y + Math.sin(angle) * e.speed;
          if (!state.map[Math.floor(nextY/32)]?.[Math.floor(nextX/32)]?.solid && dist > 30) { e.x = nextX; e.y = nextY; e.vx = Math.cos(angle) * e.speed; e.vy = Math.sin(angle) * e.speed; } else { e.vx=0; e.vy=0; }
          if (dist < 40 && now - e.lastAttackTime > e.attackCooldown) {
            e.lastAttackTime = now; const dmg = Math.max(1, Math.floor(e.attack - p.defense/2)); p.hp -= dmg;
            // @ts-ignore
            gameState.current.floatingTexts.push({ id: crypto.randomUUID(), x: p.x + p.width/2, y: p.y, width:0, height:0, color: '#ff0000', type: 'text', dead: false, text: `-${dmg}`, life: 30 });
            if (p.hp <= 0) { 
               p.hp = p.maxHp; 
               // @ts-ignore
               state.worldX = 0; state.worldY = 0;
               switchLocation('town_start'); // 死んだら街に戻る
               // switchLocation内で配置されるのでここでは設定不要だが、念の為
               p.x=(GAME_CONFIG.MAP_WIDTH*32)/2; p.y=(GAME_CONFIG.MAP_HEIGHT*32)/2; 
               setMessage("死んでしまった！街に戻ります。"); 
               setTimeout(() => setMessage(null), 3000); 
            }
          }
        }
      });

      if (state.currentBiome !== 'Town' && state.enemies.length < 15 && Math.random() < GAME_CONFIG.ENEMY_SPAWN_RATE) {
        let sx, sy, dist; do { sx = Math.random() * (state.map[0].length * 32); sy = Math.random() * (state.map.length * 32); dist = Math.sqrt((sx - p.x)**2 + (sy - p.y)**2); } while (dist < 500);
        // @ts-ignore
        state.enemies.push(generateEnemy(sx, sy, state.wave + Math.abs(state.worldX) + Math.abs(state.worldY)));
      }
      state.enemies = state.enemies.filter(e => !e.dead); state.droppedItems = state.droppedItems.filter(d => !d.dead);
      state.floatingTexts.forEach(t => { t.y -= 0.5; t.life--; }); state.floatingTexts = state.floatingTexts.filter(t => t.life > 0);
    }
    // @ts-ignore
    renderGame(ctx, state, loadedAssets);
    if (state.gameTime % 10 === 0) setUiState({...state.player});
    reqRef.current = requestAnimationFrame(gameLoop);
  };
  useEffect(() => { if (screen === 'game') gameLoop(); return () => { if (reqRef.current) cancelAnimationFrame(reqRef.current); } }, [screen]);

  // --- UI Handlers ---
  const saveGame = async () => {
    // @ts-ignore
    if (!gameState.current || !user || !db) return;
    setIsSaving(true);
    // セーブ時、現在のマップ状態も最新のsavedChunksに反映
    const state = gameState.current;
    state.savedChunks[state.locationId] = {
        map: state.map, enemies: state.enemies, droppedItems: state.droppedItems, biome: state.currentBiome, locationId: state.locationId
    };
    
    // @ts-ignore
    const data = { player: state.player, worldX: state.worldX, worldY: state.worldY, savedChunks: state.savedChunks, wave: state.wave, locationId: state.locationId };
    // @ts-ignore
    try { await setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'saves', 'slot1'), data); setSaveData(data); setMessage("クラウドに保存しました！"); } catch(e) { console.error("Save failed", e); setMessage("保存に失敗しました！"); } finally { setIsSaving(false); setTimeout(() => setMessage(null), 2000); }
  };

  const handleEquip = (item: Item) => {
    if (!gameState.current) return;
    const p = gameState.current.player;
    let slot: keyof PlayerEntity['equipment'] = 'mainHand';
    if (item.type === 'Helm') slot = 'helm'; if (item.type === 'Armor') slot = 'armor'; if (item.type === 'Boots') slot = 'boots'; if (item.type === 'Shield') slot = 'offHand';
    if (item.type === 'Weapon') {
      const current = p.equipment.mainHand; if (current) p.inventory.push(current); p.equipment.mainHand = item;
      if (item.subType === 'TwoHanded' || item.subType === 'DualWield') { const off = p.equipment.offHand; if (off) { p.inventory.push(off); p.equipment.offHand = undefined; } }
    } else if (item.type === 'Shield') {
      const mh = p.equipment.mainHand; if (mh && (mh.subType === 'TwoHanded' || mh.subType === 'DualWield')) { setMessage("両手武器と盾は同時に装備できません！"); setTimeout(() => setMessage(null), 2000); return; }
      const current = p.equipment.offHand; if (current) p.inventory.push(current); p.equipment.offHand = item;
    } else { const current = p.equipment[slot]; if (current) p.inventory.push(current); p.equipment[slot] = item; }
    p.inventory = p.inventory.filter(i => i.id !== item.id); updatePlayerStats(p); setUiState({...p});
  };

  const handleUnequip = (slot: keyof PlayerEntity['equipment']) => {
    if (!gameState.current) return;
    const p = gameState.current.player;
    const item = p.equipment[slot];
    if (item) { p.inventory.push(item); p.equipment[slot] = undefined; updatePlayerStats(p); setUiState({...p}); }
  };

  const increaseStat = (attr: keyof Attributes) => {
    if (!gameState.current) return;
    const p = gameState.current.player;
    if (p.statPoints > 0) { p.attributes[attr]++; p.statPoints--; updatePlayerStats(p); setUiState({...p}); }
  };

  // --- Render ---
  if (!isConfigValid) return <div className="w-full h-screen bg-slate-900 flex flex-col items-center justify-center text-white p-8"><AlertTriangle size={64} className="text-red-500 mb-4" /><h2 className="text-2xl font-bold mb-2">設定エラー</h2></div>;
  if (screen === 'auth') return <div className="w-full h-screen bg-slate-900 flex flex-col items-center justify-center text-white"><Loader className="animate-spin text-yellow-500 mb-4" size={48} /><h2 className="text-xl">{loadingMessage}</h2></div>;
  
  if (screen === 'title') return (
    <TitleScreen 
      onStart={() => setScreen('job_select')} 
      onContinue={() => startGame('Swordsman', 'Male', true)} 
      canContinue={!!saveData} 
      resolution={resolution}
      setResolution={setResolution}
    />
  );
  
  if (screen === 'job_select') return <JobSelectScreen onBack={() => setScreen('title')} onSelect={(j, g) => startGame(j, g)} loadedAssets={loadedAssets} />;

  return (
    <div className="w-full h-screen bg-black flex items-center justify-center overflow-hidden relative" onContextMenu={e => e.preventDefault()}>
      <canvas ref={canvasRef} width={viewportSize.width} height={viewportSize.height} className="bg-black shadow-2xl cursor-crosshair" />
      {uiState && <GameHUD uiState={uiState} worldInfo={worldInfo} toggleMenu={(m) => setActiveMenu(activeMenu === m ? 'none' : m)} />}
      {message && <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-black/80 text-white px-6 py-2 rounded-full border border-yellow-500/50 animate-bounce">{message}</div>}
      
      {activeMenu !== 'none' && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50 p-8">
          {activeMenu === 'status' && (
            <div className="bg-slate-800 p-8 rounded-lg border border-slate-600 min-w-[300px] text-white">
              <h2 className="text-2xl font-bold mb-6 text-center border-b border-slate-600 pb-2">メニュー</h2>
              
              <div className="mb-6">
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2 flex items-center gap-2">
                  <Monitor size={14} /> Screen Size
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'AUTO', val: 'auto' }, 
                    { label: 'SVGA (800x600)', val: '800x600' },
                    { label: 'XGA (1024x768)', val: '1024x768' },
                    { label: 'HD (1280x720)', val: '1280x720' }
                  ].map(opt => (
                    <button 
                      key={opt.val}
                      onClick={() => setResolution(opt.val as ResolutionMode)}
                      className={`px-3 py-2 text-xs rounded border transition-colors ${
                        resolution === opt.val 
                          ? 'bg-yellow-600 border-yellow-500 text-white' 
                          : 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <button onClick={saveGame} disabled={isSaving} className="w-full py-3 bg-blue-700 hover:bg-blue-600 rounded font-bold flex items-center justify-center gap-2">{isSaving ? <Loader className="animate-spin" size={18} /> : <Save size={18} />}{isSaving ? '保存中...' : 'ゲームを保存'}</button>
                <button onClick={() => { setScreen('title'); setActiveMenu('none'); }} className="w-full py-3 bg-red-900/50 hover:bg-red-900 rounded border border-red-800 text-red-100 mt-8">タイトルに戻る</button>
                <button onClick={() => setActiveMenu('none')} className="w-full py-2 text-slate-400 hover:text-white mt-2">閉じる</button>
              </div>
            </div>
          )}
          {activeMenu === 'stats' && uiState && (
            <div className="bg-slate-900 border border-slate-600 rounded-lg w-[500px] p-6 text-white shadow-2xl relative">
              <button onClick={() => setActiveMenu('none')} className="absolute top-4 right-4 p-1 hover:bg-slate-700 rounded"><X /></button>
              <h2 className="text-2xl font-bold mb-4 text-yellow-500 flex items-center gap-2"><User /> ステータス</h2>
              <div className="flex justify-between items-end mb-6 border-b border-slate-700 pb-4"><div><div className="text-3xl font-bold">{uiState.job}</div><div className="text-slate-400">レベル {uiState.level}</div></div><div className="text-right"><div className="text-sm text-slate-400">残りポイント</div><div className="text-3xl font-bold text-yellow-400">{uiState.statPoints}</div></div></div>
              <div className="space-y-4 mb-6">
                {[ { key: 'vitality', label: '体力', desc: '最大HPが増加' }, { key: 'strength', label: '筋力', desc: '物理攻撃力が増加' }, { key: 'dexterity', label: '器用さ', desc: '攻撃速度が増加' }, { key: 'intelligence', label: '知力', desc: '最大MPと魔法攻撃力が増加' }, { key: 'endurance', label: '耐久', desc: '防御力が増加' }, ].map((stat) => (
                  <div key={stat.key} className="flex items-center justify-between bg-slate-800 p-3 rounded">
                    <div><div className="font-bold text-lg">{stat.label}</div><div className="text-xs text-slate-500">{stat.desc}</div></div>
                    <div className="flex items-center gap-4"><span className="text-2xl font-mono">{uiState.attributes[stat.key as keyof Attributes]}</span><button onClick={() => increaseStat(stat.key as keyof Attributes)} disabled={uiState.statPoints <= 0} className={`w-8 h-8 rounded flex items-center justify-center font-bold text-xl ${uiState.statPoints > 0 ? 'bg-yellow-600 hover:bg-yellow-500 text-white' : 'bg-slate-700 text-slate-500 cursor-not-allowed'}`}>+</button></div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {activeMenu === 'inventory' && uiState && <InventoryMenu uiState={uiState} onEquip={handleEquip} onUnequip={handleUnequip} onClose={() => setActiveMenu('none')} />}
        </div>
      )}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/30 text-xs pointer-events-none">Quest of Harvest v1.8.1</div>
    </div>
  );
}
