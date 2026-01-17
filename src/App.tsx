// src/App.tsx
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GAME_CONFIG, ASSETS_SVG } from './constants';
import { GameState, PlayerEntity, PerkData } from './types';
import { createPlayer, generateFloor, renderGame, resolveMapCollision, updatePlayerStats, checkCollision, generateRandomItem } from './utils';
import { TitleScreen, JobSelectScreen, LevelUpMenu } from './components/Screens';
import { GameHUD, ShopMenu, InventoryMenu } from './components/GameUI';
import { PERK_DEFINITIONS } from './data';

// メインコンポーネント
export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [uiScreen, setUiScreen] = useState<'title' | 'job_select' | 'game'>('title');
  const [activeMenu, setActiveMenu] = useState<'none' | 'inventory' | 'shop' | 'status'>('none');
  
  // 入力状態管理
  const keys = useRef<Record<string, boolean>>({});
  const mouse = useRef({ x: 0, y: 0, down: false });

  // キー入力イベント設定
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keys.current[e.code] = true;
      if (e.code === 'KeyI') setActiveMenu(prev => prev === 'inventory' ? 'none' : 'inventory');
      if (e.code === 'Escape') setActiveMenu('none');
    };
    const handleKeyUp = (e: KeyboardEvent) => { keys.current[e.code] = false; };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // ゲーム開始処理
  const startGame = useCallback((job: any, gender: any) => {
    const player = createPlayer(job, gender);
    const floorData = generateFloor(1, 'Forest'); // 初期ダンジョン
    
    if (floorData.entryPos) {
        player.x = floorData.entryPos.x;
        player.y = floorData.entryPos.y;
    }

    setGameState({
      dungeonLevel: 1,
      currentBiome: 'Forest',
      map: floorData.map,
      player,
      enemies: floorData.enemies,
      resources: [],
      droppedItems: [],
      projectiles: [],
      particles: [],
      floatingTexts: [],
      camera: { x: 0, y: 0 },
      gameTime: 0,
      isPaused: false,
      levelUpOptions: null,
      lights: [],
      activeShop: null,
      activeBossId: null,
      inWorldMap: false,
      worldPlayerPos: { x: 0, y: 0 },
      currentLocationId: 'start'
    });
    setUiScreen('game');
  }, []);

  // ゲームループ
  useEffect(() => {
    if (uiScreen !== 'game' || !gameState) return;
    
    let animationId: number;
    const ctx = canvasRef.current?.getContext('2d');
    
    const loop = () => {
      if (!ctx || !canvasRef.current || !gameState || gameState.isPaused || activeMenu !== 'none') {
        // メニュー中は描画だけ更新して停止
        if(ctx && gameState && canvasRef.current) renderGame(ctx, gameState, {}, canvasRef.current.width, canvasRef.current.height);
        animationId = requestAnimationFrame(loop);
        return;
      }

      const { player, map } = gameState;

      // 1. プレイヤー移動処理
      let dx = 0, dy = 0;
      const speed = player.calculatedStats.speed;
      if (keys.current['KeyW'] || keys.current['ArrowUp']) dy -= speed;
      if (keys.current['KeyS'] || keys.current['ArrowDown']) dy += speed;
      if (keys.current['KeyA'] || keys.current['ArrowLeft']) dx -= speed;
      if (keys.current['KeyD'] || keys.current['ArrowRight']) dx += speed;

      if (dx !== 0 || dy !== 0) {
        // 斜め移動の補正
        if (dx !== 0 && dy !== 0) { dx *= 0.707; dy *= 0.707; }
        
        const newPos = resolveMapCollision(player, dx, dy, map);
        player.x = newPos.x;
        player.y = newPos.y;
        
        // 階段チェック
        const cx = Math.floor((player.x + player.width/2) / GAME_CONFIG.TILE_SIZE);
        const cy = Math.floor((player.y + player.height/2) / GAME_CONFIG.TILE_SIZE);
        const tile = map[cy]?.[cx];
        if (tile && tile.type === 'stairs_down') {
             // 次の階層へ (簡易実装)
             const nextLevel = gameState.dungeonLevel + 1;
             const nextFloor = generateFloor(nextLevel, 'Dungeon');
             gameState.map = nextFloor.map;
             gameState.enemies = nextFloor.enemies;
             gameState.dungeonLevel = nextLevel;
             if(nextFloor.entryPos) { player.x = nextFloor.entryPos.x; player.y = nextFloor.entryPos.y; }
        }
      }

      // 2. 攻撃処理
      if (keys.current['Space']) {
         if (!player.isAttacking && Date.now() - player.lastAttackTime > player.calculatedStats.attackCooldown * 16) {
             player.isAttacking = true;
             player.lastAttackTime = Date.now();
             
             // 範囲内の敵にダメージ
             gameState.enemies.forEach(e => {
                 if (e.dead) return;
                 const dist = Math.hypot((e.x - player.x), (e.y - player.y));
                 if (dist < 60) { // 攻撃範囲
                     e.hp -= Math.max(1, player.calculatedStats.attack - e.defense);
                     if (e.hp <= 0) {
                         e.dead = true;
                         player.xp += e.xpValue;
                         player.gold += Math.floor(Math.random() * 10) + 5;
                         
                         // レベルアップチェック
                         if (player.xp >= player.nextLevelXp) {
                             player.level++;
                             player.xp -= player.nextLevelXp;
                             player.nextLevelXp = Math.floor(player.nextLevelXp * 1.2);
                             // 全回復
                             player.hp = player.calculatedStats.maxHp;
                             // ステータス再計算
                             Object.assign(player, updatePlayerStats(player));
                         }
                         
                         // ドロップ
                         if(Math.random() < 0.3) {
                             gameState.droppedItems.push({
                                 id: Math.random().toString(), x: e.x, y: e.y, width: 16, height: 16,
                                 type: 'drop', color: 'yellow', dead: false,
                                 item: generateRandomItem(gameState.dungeonLevel),
                                 life: 1000, bounceOffset: 0
                             });
                         }
                     }
                 }
             });
             
             setTimeout(() => { player.isAttacking = false; }, 200);
         }
      }

      // 3. 敵のAI処理
      gameState.enemies.forEach(e => {
          if(e.dead) return;
          const distToPlayer = Math.hypot(player.x - e.x, player.y - e.y);
          if (distToPlayer < e.detectionRange) {
              const angle = Math.atan2(player.y - e.y, player.x - e.x);
              const ex = Math.cos(angle) * e.speed;
              const ey = Math.sin(angle) * e.speed;
              const newEPos = resolveMapCollision(e, ex, ey, map);
              e.x = newEPos.x;
              e.y = newEPos.y;
              
              // プレイヤーへの攻撃接触
              if (checkCollision(player, e)) {
                  // 無敵時間等の実装は省略（即ダメージ）
                  if (Math.random() < 0.1) { // 毎フレームあたると痛すぎるので確率で
                      player.hp -= Math.max(0, e.attack - player.calculatedStats.defense);
                  }
              }
          }
      });
      
      // 4. アイテム回収
      gameState.droppedItems = gameState.droppedItems.filter(d => {
          if (checkCollision(player, d)) {
              player.inventory.push(d.item);
              return false; // 消滅
          }
          return true;
      });

      // 5. 描画
      renderGame(ctx, gameState, {}, canvasRef.current.width, canvasRef.current.height);
      
      animationId = requestAnimationFrame(loop);
    };
    
    animationId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationId);
  }, [uiScreen, gameState, activeMenu]);

  // UI描画
  return (
    <div className="relative w-full h-screen overflow-hidden bg-black text-white select-none">
      {uiScreen === 'title' && <TitleScreen onStart={() => setUiScreen('job_select')} />}
      
      {uiScreen === 'job_select' && <JobSelectScreen onSelect={startGame} loadedAssets={{}} />}
      
      {uiScreen === 'game' && gameState && (
        <>
          <canvas 
             ref={canvasRef} 
             width={window.innerWidth} 
             height={window.innerHeight} 
             className="block"
          />
          
          <GameHUD 
             uiState={gameState.player} 
             dungeonLevel={gameState.dungeonLevel} 
             toggleMenu={setActiveMenu} 
             activeShop={gameState.activeShop}
          />
          
          {activeMenu === 'inventory' && (
             <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-50">
                <InventoryMenu 
                   uiState={gameState.player} 
                   onClose={() => setActiveMenu('none')} 
                   onEquip={(item: any) => {
                       // 簡易装備ロジック
                       const slot = item.type === 'Weapon' ? 'mainHand' : item.type.toLowerCase();
                       if (gameState.player.equipment[slot as keyof typeof gameState.player.equipment]) {
                           gameState.player.inventory.push(gameState.player.equipment[slot as keyof typeof gameState.player.equipment]!);
                       }
                       gameState.player.equipment[slot as keyof typeof gameState.player.equipment] = item;
                       gameState.player.inventory = gameState.player.inventory.filter(i => i !== item);
                       Object.assign(gameState.player, updatePlayerStats(gameState.player)); // ステータス更新
                   }}
                   onUnequip={(slot: string) => {
                        const item = gameState.player.equipment[slot as keyof typeof gameState.player.equipment];
                        if (item) {
                            gameState.player.inventory.push(item);
                            delete gameState.player.equipment[slot as keyof typeof gameState.player.equipment];
                            Object.assign(gameState.player, updatePlayerStats(gameState.player));
                        }
                   }}
                />
             </div>
          )}
        </>
      )}
    </div>
  );
}
