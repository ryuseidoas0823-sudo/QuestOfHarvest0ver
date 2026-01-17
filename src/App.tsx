import { useEffect, useRef, useState, useMemo } from 'react';
import { Loader, AlertTriangle } from 'lucide-react';
import { signInAnonymously, onAuthStateChanged, User as FirebaseUser, signInWithCustomToken } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { ASSETS_SVG, svgToUrl } from './assets';
import { GAME_CONFIG, JOB_DATA, ENEMY_TYPES, THEME } from './constants';
import { Job, Gender, PlayerEntity, GameState, MenuType, ResolutionMode, Attributes, Item, Biome, Entity, EnemyEntity, CombatEntity } from './types';
import { auth, db, isConfigValid, appId } from './firebase';
import { checkCollision, resolveMapCollision, updatePlayerStats, createPlayer, generateEnemy, generateChunk, generateRandomItem } from './utils';

// Components
import { TitleScreen, JobSelectScreen } from './components/Screens';
import { GameHUD, InventoryMenu, SettingsMenu, StatsMenu } from './components/GameUI';

export const BIOME_NAMES_JP: Record<Biome, string> = { Plains: '平原', Forest: '森', Desert: '砂漠', Snow: '雪原', Wasteland: '荒野', Town: '街', Dungeon: 'ダンジョン' };

export default function App() {
  const [screen, setScreen] = useState<'auth' | 'title' | 'game' | 'job_select'>('auth');
  const [saveData, setSaveData] = useState<any>(null);
  const [loadingMessage, setLoadingMessage] = useState('クラウドに接続中...');
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
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Assets
  const loadedAssets = useMemo(() => {
    const images: Record<string, HTMLImageElement> = {};
    Object.entries(ASSETS_SVG).forEach(([key, svg]) => { const img = new Image(); img.src = svgToUrl(svg); images[key] = img; });
    return images;
  }, []);

  // Auth
  useEffect(() => {
    if (!auth) {
      setLoadingMessage("オフラインモードで起動中...");
      setTimeout(() => setScreen('title'), 1000);
      return;
    }
    const initAuth = async () => {
      try {
        // @ts-ignore
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) await signInWithCustomToken(auth, __initial_auth_token); else await signInAnonymously(auth);
      } catch (e: any) {
        setLoadingMessage("オフラインモードで起動します...");
        setTimeout(() => setScreen('title'), 1500);
      }
    };
    initAuth();
    return onAuthStateChanged(auth, (u) => { setUser(u); if (u) checkSaveData(u.uid); });
  }, []);

  // Input & Resize
  useEffect(() => {
    const handleResize = () => {
      if (resolution === 'auto') { setViewportSize({ width: window.innerWidth, height: window.innerHeight }); } 
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

  // Logic
  const checkSaveData = async (uid: string) => {
    if (!db) { setScreen('title'); return; }
    try {
      const snap = await getDoc(doc(db, 'artifacts', appId, 'users', uid, 'saves', 'slot1'));
      if (snap.exists()) setSaveData(snap.data());
      setScreen('title');
    } catch (e) { setScreen('title'); }
  };

  const startGame = (job: Job, gender: Gender = 'Male', load = false) => {
    let player: PlayerEntity, worldX = 0, worldY = 0, savedChunks = {};
    if (load && saveData) {
      player = { ...saveData.player }; worldX = saveData.worldX; worldY = saveData.worldY; savedChunks = saveData.savedChunks || {}; updatePlayerStats(player);
    } else {
      player = createPlayer(job, gender); 
      player.x = (GAME_CONFIG.MAP_WIDTH * GAME_CONFIG.TILE_SIZE) / 2; player.y = (GAME_CONFIG.MAP_HEIGHT * GAME_CONFIG.TILE_SIZE) / 2;
      const starterSword = generateRandomItem(1); 
      if(starterSword) { starterSword.name = "錆びた剣"; starterSword.type = 'Weapon'; starterSword.subType = 'OneHanded'; player.inventory.push(starterSword); }
    }
    const chunkKey = `${worldX},${worldY}`;
    // @ts-ignore
    const initialChunk = savedChunks[chunkKey] || generateChunk(worldX, worldY);
    gameState.current = {
      worldX, worldY, currentBiome: initialChunk.biome, savedChunks, map: initialChunk.map, player, enemies: initialChunk.enemies, droppedItems: initialChunk.droppedItems,
      projectiles: [], particles: [], floatingTexts: [], camera: { x: 0, y: 0 }, gameTime: 0, isPaused: false, wave: 1
    };
    setScreen('game');
  };

  const switchChunk = (dx: number, dy: number) => {
    if (!gameState.current) return;
    const state = gameState.current;
    state.savedChunks[`${state.worldX},${state.worldY}`] = { map: state.map, enemies: state.enemies, droppedItems: state.droppedItems, biome: state.currentBiome };
    state.worldX += dx; state.worldY += dy;
    const nextChunk = state.savedChunks[`${state.worldX},${state.worldY}`] || generateChunk(state.worldX, state.worldY);
    state.map = nextChunk.map; state.enemies = nextChunk.enemies; state.droppedItems = nextChunk.droppedItems; state.currentBiome = nextChunk.biome; state.projectiles = [];
    setWorldInfo({x: state.worldX, y: state.worldY, biome: state.currentBiome});
    setMessage(`エリア移動：${BIOME_NAMES_JP[state.currentBiome] || state.currentBiome}`); setTimeout(() => setMessage(null), 2000);
  };

  // Rendering
  const renderGame = (ctx: CanvasRenderingContext2D, state: GameState) => {
    const { width, height } = ctx.canvas;
    const T = GAME_CONFIG.TILE_SIZE;
    ctx.fillStyle = '#111'; ctx.fillRect(0, 0, width, height);
    ctx.save();
    const camX = Math.floor(state.player.x + state.player.width/2 - width/2);
    const camY = Math.floor(state.player.y + state.player.height/2 - height/2);
    ctx.translate(-camX, -camY);
    state.camera = { x: camX, y: camY };
  
    const startCol = Math.max(0, Math.floor(camX / T));
    const endCol = Math.min(GAME_CONFIG.MAP_WIDTH - 1, startCol + (width / T) + 1);
    const startRow = Math.max(0, Math.floor(camY / T));
    const endRow = Math.min(GAME_CONFIG.MAP_HEIGHT - 1, startRow + (height / T) + 1);
  
    for (let y = startRow; y <= endRow; y++) {
      for (let x = startCol; x <= endCol; x++) {
        const tile = state.map[y]?.[x];
        if (!tile) continue;
        // @ts-ignore
        ctx.fillStyle = { grass:'#1b2e1b', dirt:'#3e2723', sand:'#fbc02d', snow:'#e3f2fd', rock:'#616161', wall:'#424242', water:'#1a237e', town_floor:'#5d4037', portal_out: '#000', town_entrance: '#000' }[tile.type] || '#000';
        ctx.fillRect(tile.x, tile.y, T, T);
        ctx.strokeStyle = 'rgba(0,0,0,0.05)'; ctx.strokeRect(tile.x, tile.y, T, T);
        if (tile.type === 'wall') { ctx.fillStyle = '#555'; ctx.fillRect(tile.x, tile.y, T, T-4); ctx.fillStyle = '#333'; ctx.fillRect(tile.x, tile.y+T-4, T, 4); }
      }
    }
  
    state.droppedItems.forEach(drop => {
      const bob = Math.sin(state.gameTime / 10) * 5 + drop.bounceOffset;
      ctx.shadowColor = drop.item.color; ctx.shadowBlur = 10;
      ctx.fillStyle = '#8d6e63'; ctx.fillRect(drop.x + 8, drop.y + 8 + bob, 16, 16);
      ctx.fillStyle = drop.item.color; ctx.fillRect(drop.x + 8, drop.y + 12 + bob, 16, 4);
      ctx.font = '16px Arial'; ctx.textAlign = 'center'; ctx.fillText(drop.item.icon, drop.x + 16, drop.y + 4 + bob); ctx.shadowBlur = 0;
    });
  
    const renderCharacter = (e: CombatEntity, icon?: string) => {
      const vw = e.visualWidth || e.width, vh = e.visualHeight || e.height;
      const centerX = e.x + e.width / 2, bottomY = e.y + e.height;
      let imgKey: string | null = null;
      if (e.type === 'player') imgKey = `${(e as PlayerEntity).job}_${(e as PlayerEntity).gender}`;
      else if (e.type === 'enemy') {
         const race = (e as EnemyEntity).race;
         if (race.includes('Slime') || race.includes('Jelly')) imgKey = 'Slime';
         else if (race.includes('Bandit')) imgKey = 'Bandit';
         else if (race.includes('Zombie') || race.includes('Ghoul')) imgKey = 'Zombie';
         else if (race.includes('Ant') || race.includes('Spider')) imgKey = 'Insect';
         else if (race.includes('Imp') || race.includes('Demon')) imgKey = 'Demon';
         else if (race.includes('Bat')) imgKey = 'Bat';
         else if (race.includes('Dragon')) imgKey = 'Dragon';
         else if (race.includes('Boar') || race.includes('Grizzly') || race.includes('Wolf')) imgKey = race.includes('Wolf') ? 'Wolf' : 'Beast';
         else if (race.includes('Ghost')) imgKey = 'Ghost';
      }
  
      ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.beginPath();
      ctx.ellipse(centerX, bottomY - 2, e.width/2 * (['flying','ghost'].includes(e.shape || '') ? 0.8 : 1.2), 4, 0, 0, Math.PI*2); ctx.fill();
  
      if (imgKey && loadedAssets[imgKey]) {
        const isMoving = Math.abs(e.vx || 0) > 0.1 || Math.abs(e.vy || 0) > 0.1;
        const bounce = isMoving ? Math.sin(state.gameTime / 2) : 0;
        const scaleX = (isMoving ? 1 + bounce * 0.1 : 1) * (e.isAttacking ? 1.2 : 1) * (e.direction === 2 ? -1 : 1);
        const scaleY = (isMoving ? 1 - bounce * 0.1 : 1) * (e.isAttacking ? 0.8 : 1);
        ctx.save(); ctx.translate(centerX, bottomY + (bounce > 0 ? -bounce * 5 : 0));
        ctx.scale(scaleX, scaleY); ctx.drawImage(loadedAssets[imgKey], -vw / 2, -vh, vw, vh); ctx.restore();
      } else {
        const bob = Math.sin(state.gameTime / 3) * ((Math.abs(e.vx||0)>0.1 || Math.abs(e.vy||0)>0.1) ? 2 : 0);
        ctx.fillStyle = e.color; if (e.shape === 'ghost') ctx.globalAlpha = 0.6;
        ctx.fillRect(e.x + (e.width-vw)/2, e.y + e.height - vh + bob, vw, vh); ctx.globalAlpha = 1.0;
        if (icon) { ctx.font = `${Math.min(vw, vh) * 0.6}px Arial`; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillStyle='#fff'; ctx.fillText(icon, e.x+e.width/2, e.y+e.height-vh/2+bob); }
      }
      if (e.type === 'enemy' && e.hp < e.maxHp) {
        const barX = centerX - vw/2, barY = bottomY - vh - 12;
        ctx.fillStyle='#000'; ctx.fillRect(barX, barY, vw, 4); ctx.fillStyle='#f44336'; ctx.fillRect(barX, barY, vw * (e.hp/e.maxHp), 4);
      }
    };
  
    [...state.enemies, state.player].sort((a,b)=>(a.y+a.height)-(b.y+b.height)).forEach(e => {
      if (e.dead) return;
      const icon = e.type==='player' ? JOB_DATA[(e as PlayerEntity).job]?.icon : ENEMY_TYPES.find(t=>t.name===(e as EnemyEntity).race)?.icon;
      renderCharacter(e as CombatEntity, icon);
    });
  
    if (state.player.isAttacking) {
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.beginPath();
      const radius = Math.max(0, 60 * Math.min(Math.max((Date.now() - state.player.lastAttackTime) / 200, 0), 1));
      ctx.arc(state.player.x + state.player.width/2, state.player.y + state.player.height/2, radius, 0, Math.PI*2); ctx.stroke();
    }
  
    state.floatingTexts.forEach(t => {
      ctx.font = 'bold 16px monospace'; ctx.fillStyle = 'black'; ctx.strokeStyle = 'white'; ctx.lineWidth = 2; ctx.textAlign = 'center';
      ctx.strokeText(t.text, t.x, t.y); ctx.fillStyle = t.color; ctx.fillText(t.text, t.x, t.y);
    });
    ctx.restore();
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
      if (dx > 0) p.direction = 0; if (dx < 0) p.direction = 2; if (dy > 0) p.direction = 1; if (dy < 0) p.direction = 3;
      if (dx !== 0 && dy !== 0) { dx *= 0.707; dy *= 0.707; } // Normalize diagonal
      p.vx = dx; p.vy = dy;

      if (dx !== 0 || dy !== 0) {
        const nextPos = resolveMapCollision(p, dx, dy, state.map); p.x = nextPos.x; p.y = nextPos.y;
        const maxX = GAME_CONFIG.MAP_WIDTH * GAME_CONFIG.TILE_SIZE, maxY = GAME_CONFIG.MAP_HEIGHT * GAME_CONFIG.TILE_SIZE;
        if (p.x < -10) { switchChunk(-1, 0); p.x = maxX - 40; } else if (p.x > maxX - 10) { switchChunk(1, 0); p.x = 20; }
        else if (p.y < -10) { switchChunk(0, -1); p.y = maxY - 40; } else if (p.y > maxY - 10) { switchChunk(0, 1); p.y = 20; }
      }

      state.droppedItems.forEach(drop => {
        if (checkCollision(p, drop)) {
          drop.dead = true; p.inventory.push(drop.item);
          state.floatingTexts.push({ id: crypto.randomUUID(), x: p.x, y: p.y - 20, width:0, height:0, color: drop.item.color, type: 'text', dead: false, text: drop.item.name, life: 60 });
          setMessage(`拾った：${drop.item.name}`); setTimeout(() => setMessage(null), 2000);
        }
      });

      const now = Date.now();
      if ((input.current.keys[' '] || input.current.mouse.down) && now - p.lastAttackTime > p.attackCooldown) {
        p.lastAttackTime = now; p.isAttacking = true; setTimeout(() => { if(gameState.current) gameState.current.player.isAttacking = false; }, 200);
        const attackRect = { x: p.x + p.width/2 - 30, y: p.y + p.height/2 - 30, width: 60, height: 60 } as Entity;
        state.enemies.forEach(e => {
          if (checkCollision(attackRect, e)) {
            const dmg = Math.max(1, Math.floor((p.attack - e.defense/2) * (0.9 + Math.random() * 0.2))); e.hp -= dmg;
            state.floatingTexts.push({ id: crypto.randomUUID(), x: e.x + e.width/2, y: e.y, width:0, height:0, color: '#fff', type: 'text', dead: false, text: `-${dmg}`, life: 30 });
            const angle = Math.atan2(e.y - p.y, e.x - p.x); e.x += Math.cos(angle) * 10; e.y += Math.sin(angle) * 10;
            if (e.hp <= 0) {
              e.dead = true; p.xp += e.xpValue; p.gold += Math.floor(Math.random() * 5) + 1;
              state.floatingTexts.push({ id: crypto.randomUUID(), x: e.x + e.width/2, y: e.y, width:0, height:0, color: '#ffd700', type: 'text', dead: false, text: `+${e.xpValue} XP`, life: 45 });
              if (p.xp >= p.nextLevelXp) {
                p.level++; p.xp -= p.nextLevelXp; p.nextLevelXp = Math.floor(p.nextLevelXp * 1.5); p.statPoints += 3; updatePlayerStats(p); p.hp = p.maxHp;
                state.floatingTexts.push({ id: crypto.randomUUID(), x: p.x, y: p.y - 40, width:0, height:0, color: '#00ff00', type: 'text', dead: false, text: "LEVEL UP!", life: 90 });
                setMessage("レベルアップ！Cキーで能力値を割り振れます。");
              }
              const dropChance = GAME_CONFIG.BASE_DROP_RATE * (e.rank === 'Boss' ? 5 : e.rank === 'Elite' ? 2 : 1);
              if (Math.random() < dropChance) {
                const item = generateRandomItem(e.level, e.rank === 'Boss' ? 5 : e.rank === 'Elite' ? 2 : 0);
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
            state.floatingTexts.push({ id: crypto.randomUUID(), x: p.x + p.width/2, y: p.y, width:0, height:0, color: '#ff0000', type: 'text', dead: false, text: `-${dmg}`, life: 30 });
            if (p.hp <= 0) { p.hp = p.maxHp; state.worldX=0; state.worldY=0; switchChunk(-state.worldX, -state.worldY); p.x=(GAME_CONFIG.MAP_WIDTH*32)/2; p.y=(GAME_CONFIG.MAP_HEIGHT*32)/2; setMessage("死んでしまった！街で復活します。"); setTimeout(() => setMessage(null), 3000); }
          }
        }
      });

      if (state.currentBiome !== 'Town' && state.enemies.length < 15 && Math.random() < GAME_CONFIG.ENEMY_SPAWN_RATE) {
        let sx, sy, dist; do { sx = Math.random() * (GAME_CONFIG.MAP_WIDTH * 32); sy = Math.random() * (GAME_CONFIG.MAP_HEIGHT * 32); dist = Math.sqrt((sx - p.x)**2 + (sy - p.y)**2); } while (dist < 500);
        state.enemies.push(generateEnemy(sx, sy, state.wave + Math.abs(state.worldX) + Math.abs(state.worldY)));
      }
      state.enemies = state.enemies.filter(e => !e.dead); state.droppedItems = state.droppedItems.filter(d => !d.dead);
      state.floatingTexts.forEach(t => { t.y -= 0.5; t.life--; }); state.floatingTexts = state.floatingTexts.filter(t => t.life > 0);
    }
    renderGame(ctx, state);
    if (state.gameTime % 10 === 0) setUiState({...state.player});
    reqRef.current = requestAnimationFrame(gameLoop);
  };
  useEffect(() => { if (screen === 'game') gameLoop(); return () => { if (reqRef.current) cancelAnimationFrame(reqRef.current); } }, [screen]);

  // Actions
  const saveGame = async () => {
    if (!gameState.current || !user || !db) return;
    setIsSaving(true);
    const data = { player: gameState.current.player, worldX: gameState.current.worldX, worldY: gameState.current.worldY, savedChunks: gameState.current.savedChunks, wave: gameState.current.wave };
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
          {activeMenu === 'status' && <SettingsMenu isSaving={isSaving} saveGame={saveGame} setScreen={setScreen} setActiveMenu={setActiveMenu} resolution={resolution} setResolution={setResolution} />}
          {activeMenu === 'stats' && uiState && <StatsMenu uiState={uiState} increaseStat={increaseStat} setActiveMenu={setActiveMenu} />}
          {activeMenu === 'inventory' && uiState && <InventoryMenu uiState={uiState} onEquip={handleEquip} onUnequip={handleUnequip} onClose={() => setActiveMenu('none')} />}
        </div>
      )}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/30 text-xs pointer-events-none">Quest of Harvest v1.8.0</div>
    </div>
  );
}
