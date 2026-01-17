import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GAME_CONFIG } from './constants';
import { 
  createPlayer, generateFloor, updatePlayerStats, resolveMapCollision, 
  checkCollision, renderGame, generateRandomItem, svgToUrl 
} from './utils';
import { TitleScreen, JobSelectScreen, LevelUpMenu } from './components/Screens';
import { GameHUD, ShopMenu, InventoryMenu } from './components/GameUI';
import { GameState, PerkData, Item, Job, Gender, ResolutionMode } from './types';
import { PERK_DEFINITIONS, WORLD_LOCATIONS } from './data';
import { ASSETS_SVG } from './constants';

const App = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mode, setMode] = useState<'title' | 'job_select' | 'game'>('title');
  const [uiState, setUiState] = useState<any>(null); // HUD用state
  const [activeMenu, setActiveMenu] = useState<'none' | 'inventory' | 'status' | 'shop' | 'level_up'>('none');
  const [activeShop, setActiveShop] = useState<'general' | 'blacksmith' | 'none'>('none');
  const [levelUpOptions, setLevelUpOptions] = useState<PerkData[] | null>(null);
  const [resolution, setResolution] = useState<ResolutionMode>('auto');
  const [bossData, setBossData] = useState<any>(null);

  // ゲームステート（Refで管理して再レンダリングを防ぐ）
  const gameState = useRef<GameState | null>(null);
  const keys = useRef<Record<string, boolean>>({});
  const loopRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const imagesRef = useRef<Record<string, HTMLImageElement>>({});

  // 画像アセットのプリロード
  useEffect(() => {
    const loadImages = async () => {
      const loaded: Record<string, HTMLImageElement> = {};
      for (const [key, svg] of Object.entries(ASSETS_SVG)) {
        const img = new Image();
        img.src = svgToUrl(svg);
        await new Promise(r => img.onload = r);
        loaded[key] = img;
      }
      imagesRef.current = loaded;
    };
    loadImages();
  }, []);

  // キー入力ハンドリング
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keys.current[e.key.toLowerCase()] = true;
      if (gameState.current && mode === 'game') {
        if (e.key.toLowerCase() === 'f') handleInteraction();
        if (e.key.toLowerCase() === 'q') usePotion();
        if (e.key === 'Escape') setActiveMenu(prev => prev === 'none' ? 'status' : 'none');
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keys.current[e.key.toLowerCase()] = false;
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [mode]);

  const startGame = (job: Job, gender: Gender) => {
    const player = createPlayer(job, gender);
    // 初期マップ生成（タウン）
    const floorData = generateFloor(0, 'town_start'); 
    
    gameState.current = {
      dungeonLevel: 0,
      currentBiome: 'Town',
      map: floorData.map,
      player: { ...player, x: floorData.entryPos!.x, y: floorData.entryPos!.y },
      enemies: floorData.enemies,
      resources: floorData.resources,
      droppedItems: floorData.droppedItems,
      projectiles: [],
      particles: [],
      floatingTexts: [],
      camera: { x: 0, y: 0 },
      gameTime: 0,
      isPaused: false,
      levelUpOptions: null,
      lights: floorData.lights,
      shopZones: floorData.shopZones,
      activeShop: null,
      activeBossId: null,
      inWorldMap: false,
      worldPlayerPos: { x: 15, y: 10 },
      currentLocationId: 'town_start'
    };
    setMode('game');
    lastTimeRef.current = performance.now();
    requestAnimationFrame(gameLoop);
  };

  const gameLoop = (time: number) => {
    if (!gameState.current || mode !== 'game') return;
    const dt = Math.min(time - lastTimeRef.current, 50); // Delta time cap
    lastTimeRef.current = time;

    update(dt);
    draw();

    if (gameState.current.levelUpOptions && activeMenu !== 'level_up') {
      setLevelUpOptions(gameState.current.levelUpOptions);
      setActiveMenu('level_up');
      gameState.current.isPaused = true;
    }

    loopRef.current = requestAnimationFrame(gameLoop);
  };

  const update = (dt: number) => {
    const state = gameState.current!;
    if (state.isPaused || activeMenu !== 'none') return;

    state.gameTime += dt * 0.001;

    // プレイヤー移動
    const player = state.player;
    let dx = 0, dy = 0;
    const speed = player.speed * (keys.current['shift'] && player.stamina > 0 ? 1.5 : 1.0);
    
    if (keys.current['w'] || keys.current['arrowup']) dy = -1;
    if (keys.current['s'] || keys.current['arrowdown']) dy = 1;
    if (keys.current['a'] || keys.current['arrowleft']) dx = -1;
    if (keys.current['d'] || keys.current['arrowright']) dx = 1;

    if (dx !== 0 || dy !== 0) {
        // 正規化
        const len = Math.sqrt(dx*dx + dy*dy);
        dx = (dx / len) * speed;
        dy = (dy / len) * speed;
        
        // 衝突判定と移動
        const nextPos = resolveMapCollision(player, dx, dy, state.map);
        player.x = nextPos.x;
        player.y = nextPos.y;
        
        // 向き更新
        if (dx > 0) player.direction = 1;
        if (dx < 0) player.direction = 2;

        // スタミナ消費（ダッシュ時）
        if (keys.current['shift'] && player.stamina > 0) {
            player.stamina = Math.max(0, player.stamina - GAME_CONFIG.STAMINA_DASH_COST);
            player.lastStaminaUse = Date.now();
        }
    } else {
        // スタミナ回復
        if (Date.now() - player.lastStaminaUse > 1000 && player.stamina < player.calculatedStats.maxStamina) {
            player.stamina = Math.min(player.calculatedStats.maxStamina, player.stamina + player.calculatedStats.staminaRegen);
        }
    }

    // 攻撃処理
    if (keys.current[' '] && Date.now() - player.lastAttackTime > player.attackCooldown) {
        performAttack(state);
    }
    player.isAttacking = Date.now() - player.lastAttackTime < 200;

    // エンティティ更新 (敵、弾、アイテムなど)
    updateEntities(state, dt);

    // インタラクションチェック (ポータル、ショップ)
    checkTriggers(state);

    // React UIへの同期 (頻度を落とすのが理想だが今回は毎フレーム同期)
    // パフォーマンス向上のため、必要な情報だけ抽出してsetUiStateするのが良い
    if (loopRef.current % 10 === 0) { // 10フレームに1回更新
        setUiState({
            hp: player.hp, maxHp: player.maxHp,
            mp: player.mp, maxMp: player.maxMp,
            xp: player.xp, nextLevelXp: player.nextLevelXp,
            stamina: player.stamina, calculatedStats: player.calculatedStats,
            gold: player.gold,
            level: player.level,
            job: player.job,
            statPoints: player.statPoints,
            inventory: player.inventory,
            equipment: player.equipment,
            perks: player.perks,
            attack: player.calculatedStats.attack,
            defense: player.calculatedStats.defense,
            speed: player.calculatedStats.speed
        });
        
        // ボス情報の更新
        if (state.activeBossId) {
            const boss = state.enemies.find(e => e.id === state.activeBossId);
            setBossData(boss ? { ...boss } : { dead: true, hp: 0, maxHp: 1 });
        } else {
            setBossData(null);
        }
    }
  };

  const performAttack = (state: GameState) => {
    const p = state.player;
    p.lastAttackTime = Date.now();
    p.stamina = Math.max(0, p.stamina - GAME_CONFIG.STAMINA_ATTACK_COST);
    p.lastStaminaUse = Date.now();

    // 攻撃範囲
    const range = 50 + (p.equipment.mainHand?.weaponClass === 'Axe' ? 20 : 0);
    const hitBox = {
        x: p.x + p.width/2 - range + (p.direction === 1 ? 20 : -20),
        y: p.y + p.height/2 - range/2,
        width: range * 2,
        height: range
    };
    
    // 敵へのダメージ判定
    state.enemies.forEach(e => {
        if (!e.dead && checkCollision(hitBox as any, e)) {
            const dmg = Math.max(1, p.attack - e.defense);
            e.hp -= dmg;
            state.floatingTexts.push({ 
                id: crypto.randomUUID(), x: e.x, y: e.y, width:0, height:0, type:'text', dead: false, 
                text: `${dmg}`, life: 60, color: '#fff' 
            });
            e.vx = (e.x - p.x) * 0.1; // ノックバック
            e.vy = (e.y - p.y) * 0.1;
            
            if (e.hp <= 0) {
                e.dead = true;
                p.xp += e.xpValue;
                p.gold += Math.floor(Math.random() * 10) + e.level * 2;
                checkLevelUp(state);
                // アイテムドロップ
                if (Math.random() < GAME_CONFIG.BASE_DROP_RATE) {
                    const item = generateRandomItem(e.level, e.rank === 'Boss' ? 5 : e.rank === 'Elite' ? 2 : 0);
                    if (item) {
                        state.droppedItems.push({
                            id: crypto.randomUUID(), x: e.x, y: e.y, width: 16, height: 16, type: 'drop', dead: false,
                            item: item, life: 3000, bounceOffset: 0
                        });
                    }
                }
            }
        }
    });

    // 資源（木・岩）の採取
    state.resources.forEach(r => {
        if (checkCollision(hitBox as any, r)) {
            r.hp -= p.attack;
            if (r.hp <= 0 && !r.dead) {
                r.dead = true;
                const matName = r.resourceType === 'tree' ? '木材' : (r.resourceType === 'ore' ? '鉱石' : '石');
                const dropItem: Item = { id: crypto.randomUUID(), name: matName, type: 'Material', rarity: 'Common', level: 1, stats: {attack:0,defense:0,speed:0,maxHp:0}, enchantments:[], icon: r.resourceType==='tree'?'🪵':r.resourceType==='ore'?'⛏️':'🪨', color:'#ccc', count: 1 };
                state.droppedItems.push({
                    id: crypto.randomUUID(), x: r.x, y: r.y, width: 16, height: 16, type: 'drop', dead: false,
                    item: dropItem, life: 3000, bounceOffset: 0
                });
            }
        }
    });
  };

  const updateEntities = (state: GameState, dt: number) => {
      // 敵のAI（簡易）
      state.enemies.forEach(e => {
          if (e.dead) return;
          const dist = Math.sqrt(Math.pow(state.player.x - e.x, 2) + Math.pow(state.player.y - e.y, 2));
          if (dist < e.detectionRange) {
              const dx = (state.player.x - e.x) / dist;
              const dy = (state.player.y - e.y) / dist;
              const nextX = e.x + dx * e.speed;
              const nextY = e.y + dy * e.speed;
              const newPos = resolveMapCollision(e, dx * e.speed, dy * e.speed, state.map);
              e.x = newPos.x;
              e.y = newPos.y;
              e.direction = dx > 0 ? 1 : 2;
              
              // プレイヤー攻撃
              if (dist < 40 && Date.now() - e.lastAttackTime > e.attackCooldown) {
                  e.lastAttackTime = Date.now();
                  const dmg = Math.max(1, e.attack - state.player.defense);
                  state.player.hp -= dmg;
                  state.floatingTexts.push({ id: crypto.randomUUID(), x: state.player.x, y: state.player.y, width:0, height:0, type:'text', dead: false, text: `-${dmg}`, life: 60, color: '#f00' });
              }
          }
          // ノックバック減衰
          if (e.vx) { e.x += e.vx; e.vx *= 0.8; if(Math.abs(e.vx)<0.1) e.vx=0; }
          if (e.vy) { e.y += e.vy; e.vy *= 0.8; if(Math.abs(e.vy)<0.1) e.vy=0; }
      });

      // アイテム回収
      state.droppedItems.forEach(d => {
          const dist = Math.sqrt(Math.pow(state.player.x - d.x, 2) + Math.pow(state.player.y - d.y, 2));
          if (dist < 40) { // 自動回収
              d.dead = true;
              const existing = state.player.inventory.find(i => i.name === d.item.name && i.type === 'Material');
              if (existing) existing.count = (existing.count || 1) + 1;
              else state.player.inventory.push({ ...d.item, count: 1 });
              state.floatingTexts.push({ id: crypto.randomUUID(), x: state.player.x, y: state.player.y - 20, width:0, height:0, type:'text', dead: false, text: `+${d.item.name}`, life: 60, color: '#ff0' });
          }
      });
      state.droppedItems = state.droppedItems.filter(d => !d.dead);
      state.enemies = state.enemies.filter(e => !e.dead);
      state.resources = state.resources.filter(r => !r.dead);
      
      // テキスト
      state.floatingTexts.forEach(t => { t.y -= 0.5; t.life--; if(t.life<=0) t.dead=true; });
      state.floatingTexts = state.floatingTexts.filter(t => !t.dead);
  };

  const checkTriggers = (state: GameState) => {
      const p = state.player;
      const tileX = Math.floor((p.x + p.width/2) / GAME_CONFIG.TILE_SIZE);
      const tileY = Math.floor((p.y + p.height/2) / GAME_CONFIG.TILE_SIZE);
      const tile = state.map[tileY]?.[tileX];
      
      if (!tile) return;

      // 階段（次の階層へ）
      if (tile.type === 'stairs_down' || tile.type === 'dungeon_entrance') {
           // インタラクションキーで移動する場合はここに条件追加、今回は自動移動もしくはFキー
           // Fキーハンドリング内で処理する方が良いが、簡易的に
      }

      // ショップエリア判定
      if (state.shopZones) {
          const inShop = state.shopZones.find(z => 
              p.x + p.width/2 > z.x && p.x + p.width/2 < z.x + z.w &&
              p.y + p.height/2 > z.y && p.y + p.height/2 < z.y + z.h
          );
          if (inShop) {
              setActiveShop(inShop.type);
          } else {
              setActiveShop('none');
          }
      }
  };

  const handleInteraction = () => {
      const state = gameState.current;
      if (!state) return;
      const p = state.player;
      const tileX = Math.floor((p.x + p.width/2) / GAME_CONFIG.TILE_SIZE);
      const tileY = Math.floor((p.y + p.height/2) / GAME_CONFIG.TILE_SIZE);
      const tile = state.map[tileY]?.[tileX];

      if (tile?.type === 'stairs_down' || tile?.type === 'dungeon_entrance') {
          const nextLevel = state.dungeonLevel + 1;
          const floor = generateFloor(nextLevel);
          state.map = floor.map;
          state.enemies = floor.enemies;
          state.resources = floor.resources;
          state.droppedItems = [];
          state.dungeonLevel = nextLevel;
          state.currentBiome = floor.biome;
          state.lights = floor.lights;
          state.activeBossId = floor.bossId || null;
          p.x = floor.entryPos!.x;
          p.y = floor.entryPos!.y;
      } else if (tile?.type === 'portal_out' || tile?.type === 'return_portal') {
          // タウンに戻る
          const floor = generateFloor(0, 'town_start');
          state.map = floor.map;
          state.enemies = [];
          state.resources = [];
          state.dungeonLevel = 0;
          state.currentBiome = 'Town';
          state.shopZones = floor.shopZones;
          state.lights = floor.lights;
          p.x = floor.entryPos!.x;
          p.y = floor.entryPos!.y;
      } else if (activeShop !== 'none') {
          setActiveMenu('shop');
          state.isPaused = true;
      }
  };

  const checkLevelUp = (state: GameState) => {
      if (state.player.xp >= state.player.nextLevelXp) {
          state.player.xp -= state.player.nextLevelXp;
          state.player.level++;
          state.player.nextLevelXp = Math.floor(state.player.nextLevelXp * 1.5);
          state.player.statPoints += 3;
          
          // パーク選択肢の生成
          const opts: PerkData[] = [];
          const allPerks = Object.values(PERK_DEFINITIONS);
          for(let i=0; i<3; i++) {
              const p = allPerks[Math.floor(Math.random() * allPerks.length)];
              opts.push(p);
          }
          state.levelUpOptions = opts;
          updatePlayerStats(state.player);
      }
  };

  const usePotion = () => {
      if (!gameState.current) return;
      const p = gameState.current.player;
      const potionIdx = p.inventory.findIndex(i => i.name === 'ポーション');
      if (potionIdx >= 0) {
          p.hp = Math.min(p.maxHp, p.hp + 50);
          p.inventory.splice(potionIdx, 1);
          gameState.current.floatingTexts.push({ id: crypto.randomUUID(), x: p.x, y: p.y, width:0, height:0, type:'text', dead: false, text: `Heal!`, life: 60, color: '#0f0' });
      }
  };

  const draw = () => {
    if (!canvasRef.current || !gameState.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    // キャンバスサイズ調整
    const { width, height } = canvasRef.current.getBoundingClientRect();
    if (canvasRef.current.width !== width || canvasRef.current.height !== height) {
        canvasRef.current.width = width;
        canvasRef.current.height = height;
    }
    
    // utils.tsの描画関数を使用
    renderGame(ctx, gameState.current, imagesRef.current, width, height);
  };

  const handleEquip = (item: Item) => {
      if (!gameState.current) return;
      const p = gameState.current.player;
      if (item.type === 'Consumable' || item.type === 'Material') return;
      
      // 既存装備を外す
      const slot = item.type === 'Weapon' ? 'mainHand' : (item.type === 'Shield' ? 'offHand' : (item.type === 'Helm' ? 'helm' : (item.type === 'Armor' ? 'armor' : 'boots')));
      // @ts-ignore
      const oldItem = p.equipment[slot];
      if (oldItem) p.inventory.push(oldItem);
      
      // 装備
      // @ts-ignore
      p.equipment[slot] = item;
      const idx = p.inventory.findIndex(i => i.id === item.id);
      if (idx >= 0) p.inventory.splice(idx, 1);
      
      updatePlayerStats(p);
  };
  
  const handleUnequip = (slot: string) => {
      if (!gameState.current) return;
      const p = gameState.current.player;
      // @ts-ignore
      const item = p.equipment[slot];
      if (item) {
          p.inventory.push(item);
          // @ts-ignore
          p.equipment[slot] = undefined;
          updatePlayerStats(p);
      }
  };

  const handleBuy = (type: string) => {
      if (!gameState.current) return;
      const p = gameState.current.player;
      const price = type === 'torch' ? 50 : 100;
      if (p.gold >= price) {
          p.gold -= price;
          const item: Item = type === 'torch' 
              ? { id: crypto.randomUUID(), name: "松明", type: "Consumable", rarity: "Common", level: 1, stats: {attack:0,defense:0,speed:0,maxHp:0}, enchantments:[], icon: "🔥", color: "#ff9800", count: 1 }
              : { id: crypto.randomUUID(), name: "ポーション", type: "Consumable", rarity: "Common", level: 1, stats: {attack:0,defense:0,speed:0,maxHp:0}, enchantments:[], icon: "🧪", color: "#f44336", count: 1 };
          
          const existing = p.inventory.find(i => i.name === item.name);
          if (existing) existing.count = (existing.count || 1) + 1;
          else p.inventory.push(item);
      }
  };

  const handleCraft = () => {
      if (!gameState.current) return;
      const p = gameState.current.player;
      // 簡易クラフトロジック：木2、石2、200Gでランダム作成
      const wood = p.inventory.find(i => i.name === '木材');
      const stone = p.inventory.find(i => i.name === '石');
      if (p.gold >= 200 && wood && wood.count! >= 2 && stone && stone.count! >= 2) {
          p.gold -= 200;
          wood.count! -= 2;
          stone.count! -= 2;
          // count0なら削除する処理が必要だが省略
          const newItem = generateRandomItem(p.level, 0);
          if (newItem) p.inventory.push(newItem);
      }
  };

  const handlePerkSelect = (perkId: string) => {
      if (!gameState.current) return;
      const p = gameState.current.player;
      const existing = p.perks.find(pk => pk.id === perkId);
      if (existing) existing.level++;
      else p.perks.push({ id: perkId, level: 1 });
      
      updatePlayerStats(p);
      gameState.current.levelUpOptions = null;
      setActiveMenu('none');
      gameState.current.isPaused = false;
  };

  return (
    <>
      {mode === 'title' && (
        <TitleScreen 
           onStart={() => setMode('job_select')} 
           onContinue={() => {}} 
           canContinue={false} 
           resolution={resolution}
           setResolution={setResolution}
        />
      )}
      {mode === 'job_select' && (
        <JobSelectScreen 
           onBack={() => setMode('title')} 
           onSelect={startGame}
           loadedAssets={imagesRef.current}
        />
      )}
      {mode === 'game' && (
        <div className="relative w-full h-screen bg-black overflow-hidden flex items-center justify-center">
          <canvas ref={canvasRef} className="w-full h-full object-contain" />
          {uiState && (
             <GameHUD 
                uiState={uiState} 
                dungeonLevel={gameState.current?.dungeonLevel || 0}
                toggleMenu={(m: any) => {
                    setActiveMenu(prev => prev === m ? 'none' : m);
                    if (gameState.current) gameState.current.isPaused = (m !== 'none');
                }}
                activeShop={activeShop !== 'none'}
                bossData={bossData}
             />
          )}
          {activeMenu === 'inventory' && uiState && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-40">
                  <InventoryMenu 
                      uiState={uiState} 
                      onEquip={handleEquip} 
                      onUnequip={handleUnequip} 
                      onClose={() => { setActiveMenu('none'); if(gameState.current) gameState.current.isPaused = false; }} 
                  />
              </div>
          )}
          {activeMenu === 'shop' && uiState && (
              <ShopMenu 
                 type={activeShop} 
                 player={uiState} 
                 onClose={() => { setActiveMenu('none'); if(gameState.current) gameState.current.isPaused = false; }}
                 onBuy={handleBuy}
                 onCraft={handleCraft}
              />
          )}
          {activeMenu === 'level_up' && levelUpOptions && (
              <LevelUpMenu 
                  options={levelUpOptions} 
                  onSelect={handlePerkSelect} 
              />
          )}
        </div>
      )}
    </>
  );
};

export default App;
