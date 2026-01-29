import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { 
  Sword, Shield, Heart, Zap, Map as MapIcon, RefreshCw, 
  ChevronRight, ChevronLeft, ShoppingBag, User, Settings, 
  Menu, X, Play, Save, Skull, Coins, Scroll, ArrowUp, Star,
  Ghost, Target, Footprints, Flame, Droplets, Wind, Mountain
} from 'lucide-react';

// --- Types & Interfaces ---

type JobId = 'soldier' | 'rogue' | 'ranger' | 'arcanist' | 'monk';
type StatType = 'STR' | 'VIT' | 'DEX' | 'AGI' | 'INT' | 'WIS';
type ItemType = 'weapon' | 'armor' | 'accessory' | 'consumable' | 'material';
type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
type TargetType = 'single' | 'area' | 'self' | 'ally';

interface Stats {
  HP: number;
  maxHP: number;
  MP: number;
  maxMP: number;
  STR: number;
  VIT: number;
  DEX: number;
  AGI: number;
  INT: number;
  WIS: number;
}

interface Job {
  id: JobId;
  name: string;
  description: string;
  baseStats: Partial<Stats>;
}

interface Skill {
  id: string;
  name: string;
  description: string;
  mpCost: number;
  type: 'active' | 'passive';
  target: TargetType;
  effect?: (user: Entity, target: Entity) => void;
  icon?: string;
}

interface Item {
  id: string;
  name: string;
  type: ItemType;
  rarity: Rarity;
  description: string;
  price: number;
  stats?: Partial<Stats>;
  effect?: (user: PlayerState) => void;
}

interface Entity {
  x: number;
  y: number;
  stats: Stats;
  name: string;
  isDead: boolean;
  color?: string; // For rendering
}

interface Enemy extends Entity {
  id: string;
  type: string;
  exp: number;
  dropTable: string[];
  ai: 'chase' | 'random' | 'ranged';
}

interface PlayerState extends Entity {
  name: string;
  job: JobId;
  level: number;
  exp: number;
  nextExp: number;
  gold: number;
  inventory: Item[];
  equipment: {
    weapon: Item | null;
    armor: Item | null;
    accessory: Item | null;
  };
  skills: string[]; // Skill IDs
  god: string | null; // God ID
  floor: number;
}

interface GameState {
  screen: 'title' | 'nameInput' | 'jobSelect' | 'godSelect' | 'town' | 'dungeon' | 'result' | 'shop' | 'status' | 'inventory';
  player: PlayerState;
  dungeon: {
    map: number[][]; // 0: wall, 1: floor, 2: door, 3: stairs
    enemies: Enemy[];
    width: number;
    height: number;
    log: string[];
    turn: number;
  };
  modal: {
    isOpen: boolean;
    title: string;
    content: React.ReactNode;
    onClose: () => void;
  } | null;
}

// Visual Effects Interface
interface VisualEffect {
  id: string;
  type: 'attack' | 'damage' | 'text';
  x: number; // Grid X
  y: number; // Grid Y
  targetX?: number; // Target Grid X (for attack direction)
  targetY?: number; // Target Grid Y
  startTime: number;
  duration: number;
  color?: string;
  text?: string;
  value?: number;
}

// --- Constants & Data ---

const TILE_SIZE = 48; // Slightly larger for better detail
const VIEWPORT_WIDTH = 15;
const VIEWPORT_HEIGHT = 11;

const JOBS: Job[] = [
  { id: 'soldier', name: '戦士', description: '攻守のバランスが良い前衛職。', baseStats: { STR: 5, VIT: 5, DEX: 2, AGI: 2, INT: 1, WIS: 1 } },
  { id: 'rogue', name: '盗賊', description: '素早い動きと高いクリティカル率。', baseStats: { STR: 3, VIT: 2, DEX: 5, AGI: 5, INT: 1, WIS: 1 } },
  { id: 'ranger', name: '狩人', description: '遠距離攻撃と探索スキルに長ける。', baseStats: { STR: 3, VIT: 3, DEX: 6, AGI: 3, INT: 1, WIS: 1 } },
  { id: 'arcanist', name: '魔導士', description: '強力な魔法攻撃を操る。', baseStats: { STR: 1, VIT: 2, DEX: 2, AGI: 2, INT: 6, WIS: 4 } },
  { id: 'monk', name: '武闘家', description: '肉体を武器とし、回避能力が高い。', baseStats: { STR: 4, VIT: 4, DEX: 2, AGI: 4, INT: 1, WIS: 3 } },
];

const ITEMS: Record<string, Item> = {
  'potion': { id: 'potion', name: 'ポーション', type: 'consumable', rarity: 'common', price: 50, description: 'HPを50回復する', effect: (p) => { p.stats.HP = Math.min(p.stats.maxHP, p.stats.HP + 50); } },
  'rusty_sword': { id: 'rusty_sword', name: '錆びた剣', type: 'weapon', rarity: 'common', price: 10, description: '古い剣。STR+2', stats: { STR: 2 } },
  'leather_armor': { id: 'leather_armor', name: '革の鎧', type: 'armor', rarity: 'common', price: 30, description: '冒険者の基本装備。VIT+2', stats: { VIT: 2 } },
  'iron_sword': { id: 'iron_sword', name: '鉄の剣', type: 'weapon', rarity: 'uncommon', price: 150, description: '標準的な剣。STR+5', stats: { STR: 5 } },
  'chainmail': { id: 'chainmail', name: 'チェーンメイル', type: 'armor', rarity: 'uncommon', price: 200, description: '鎖帷子。VIT+5', stats: { VIT: 5 } },
  'magic_ring': { id: 'magic_ring', name: '魔力の指輪', type: 'accessory', rarity: 'rare', price: 500, description: 'MPが増える指輪。MP+20', stats: { maxMP: 20 } },
};

const ENEMIES_DATA: Record<string, Partial<Enemy>> = {
  'slime': { name: 'スライム', type: 'slime', exp: 10, stats: { HP: 20, maxHP: 20, STR: 3, VIT: 2, DEX: 1, AGI: 1, INT: 1, WIS: 1, MP: 0, maxMP: 0 }, color: '#4ade80', ai: 'random' },
  'bat': { name: 'バット', type: 'bat', exp: 15, stats: { HP: 15, maxHP: 15, STR: 4, VIT: 1, DEX: 5, AGI: 5, INT: 1, WIS: 1, MP: 0, maxMP: 0 }, color: '#a78bfa', ai: 'chase' },
  'goblin': { name: 'ゴブリン', type: 'goblin', exp: 25, stats: { HP: 35, maxHP: 35, STR: 6, VIT: 3, DEX: 3, AGI: 3, INT: 1, WIS: 1, MP: 0, maxMP: 0 }, color: '#166534', ai: 'chase' },
  'skeleton': { name: 'スケルトン', type: 'skeleton', exp: 40, stats: { HP: 50, maxHP: 50, STR: 8, VIT: 5, DEX: 2, AGI: 2, INT: 1, WIS: 1, MP: 0, maxMP: 0 }, color: '#e5e7eb', ai: 'chase' },
};

// --- Utils ---

const generateDungeon = (width: number, height: number, floor: number) => {
  const map = Array(height).fill(null).map(() => Array(width).fill(0));
  const rooms: { x: number, y: number, w: number, h: number }[] = [];
  const maxRooms = 8 + Math.floor(floor / 2);
  
  // Simple Room Generation
  for (let i = 0; i < maxRooms; i++) {
    const w = Math.floor(Math.random() * 5) + 4;
    const h = Math.floor(Math.random() * 5) + 4;
    const x = Math.floor(Math.random() * (width - w - 2)) + 1;
    const y = Math.floor(Math.random() * (height - h - 2)) + 1;

    let overlap = false;
    for (const r of rooms) {
      if (x < r.x + r.w + 1 && x + w + 1 > r.x && y < r.y + r.h + 1 && y + h + 1 > r.y) {
        overlap = true;
        break;
      }
    }

    if (!overlap) {
      rooms.push({ x, y, w, h });
      for (let ry = y; ry < y + h; ry++) {
        for (let rx = x; rx < x + w; rx++) {
          map[ry][rx] = 1;
        }
      }
    }
  }

  // Corridors
  for (let i = 0; i < rooms.length - 1; i++) {
    const r1 = rooms[i];
    const r2 = rooms[i + 1];
    const cx1 = Math.floor(r1.x + r1.w / 2);
    const cy1 = Math.floor(r1.y + r1.h / 2);
    const cx2 = Math.floor(r2.x + r2.w / 2);
    const cy2 = Math.floor(r2.y + r2.h / 2);

    // Horizontal then Vertical
    if (Math.random() < 0.5) {
      for (let x = Math.min(cx1, cx2); x <= Math.max(cx1, cx2); x++) map[cy1][x] = 1;
      for (let y = Math.min(cy1, cy2); y <= Math.max(cy1, cy2); y++) map[y][cx2] = 1;
    } else {
      for (let y = Math.min(cy1, cy2); y <= Math.max(cy1, cy2); y++) map[y][cx1] = 1;
      for (let x = Math.min(cx1, cx2); x <= Math.max(cx1, cx2); x++) map[cy2][x] = 1;
    }
  }

  // Stairs
  const lastRoom = rooms[rooms.length - 1];
  const stairsX = Math.floor(lastRoom.x + lastRoom.w / 2);
  const stairsY = Math.floor(lastRoom.y + lastRoom.h / 2);
  map[stairsY][stairsX] = 3;

  // Enemies
  const enemies: Enemy[] = [];
  const enemyCount = 3 + Math.floor(floor * 1.5);
  const enemyTypes = Object.keys(ENEMIES_DATA);
  
  for(let i=0; i<enemyCount; i++) {
    const room = rooms[Math.floor(Math.random() * (rooms.length - 1))]; // Avoid stairs room slightly
    const ex = Math.floor(room.x + Math.random() * room.w);
    const ey = Math.floor(room.y + Math.random() * room.h);
    
    if (map[ey][ex] === 1 && !(ex === rooms[0].x && ey === rooms[0].y)) {
       const type = enemyTypes[Math.floor(Math.random() * Math.min(enemyTypes.length, 1 + Math.floor(floor / 3)))];
       const data = ENEMIES_DATA[type];
       if(data) {
         enemies.push({
           ...data,
           id: `enemy_${i}`,
           x: ex,
           y: ey,
           isDead: false,
           stats: { ...data.stats } as Stats,
           dropTable: [],
         } as Enemy);
       }
    }
  }

  return { map, rooms, enemies, startX: Math.floor(rooms[0].x + rooms[0].w/2), startY: Math.floor(rooms[0].y + rooms[0].h/2) };
};

const calculateDamage = (attacker: Entity, defender: Entity) => {
  const baseDmg = Math.max(1, attacker.stats.STR - Math.floor(defender.stats.VIT / 2));
  // Variance
  const dmg = Math.floor(baseDmg * (0.9 + Math.random() * 0.2));
  return Math.max(1, dmg);
};

// --- Components ---

const Button = ({ onClick, children, className = '', disabled = false }: any) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`px-4 py-2 bg-slate-800 text-slate-100 border-2 border-slate-600 rounded hover:bg-slate-700 hover:border-amber-500 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
  >
    {children}
  </button>
);

const Card = ({ children, className = '', title }: any) => (
  <div className={`bg-slate-900 border border-slate-700 rounded-lg p-4 shadow-xl ${className}`}>
    {title && <h3 className="text-amber-500 font-bold mb-3 border-b border-slate-700 pb-2">{title}</h3>}
    {children}
  </div>
);

// --- Main Application ---

export default function App() {
  const [gameState, setGameState] = useState<GameState>({
    screen: 'title',
    player: {
      name: '',
      job: 'soldier',
      level: 1,
      exp: 0,
      nextExp: 100,
      gold: 100,
      inventory: [ITEMS['potion'], ITEMS['potion']],
      equipment: { weapon: ITEMS['rusty_sword'], armor: ITEMS['leather_armor'], accessory: null },
      skills: [],
      god: null,
      floor: 1,
      x: 0, y: 0,
      isDead: false,
      stats: { HP: 50, maxHP: 50, MP: 20, maxMP: 20, STR: 10, VIT: 10, DEX: 5, AGI: 5, INT: 5, WIS: 5 }
    },
    dungeon: {
      map: [],
      enemies: [],
      width: 40,
      height: 30,
      log: ['ゲーム開始。'],
      turn: 1,
    },
    modal: null
  });

  // Visual Effects Ref (Managed outside of state loop to prevent re-renders)
  const visualEffectsRef = useRef<VisualEffect[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();

  // --- Game Loop / Logic Hooks ---

  const addLog = (message: string) => {
    setGameState(prev => ({
      ...prev,
      dungeon: { ...prev.dungeon, log: [message, ...prev.dungeon.log].slice(0, 50) }
    }));
  };

  const addEffect = (effect: Omit<VisualEffect, 'id'>) => {
    visualEffectsRef.current.push({
      ...effect,
      id: crypto.randomUUID()
    });
  };

  const initGame = (name: string, job: JobId, god: string) => {
    const jobData = JOBS.find(j => j.id === job)!;
    const baseStats = { HP: 50, maxHP: 50, MP: 20, maxMP: 20, STR: 5, VIT: 5, DEX: 5, AGI: 5, INT: 5, WIS: 5 };
    
    // Apply Job Stats
    Object.keys(jobData.baseStats).forEach(key => {
      (baseStats as any)[key] += (jobData.baseStats as any)[key];
    });

    setGameState(prev => ({
      ...prev,
      screen: 'town',
      player: {
        ...prev.player,
        name,
        job,
        god,
        stats: baseStats
      }
    }));
  };

  const startDungeon = () => {
    const floor = gameState.player.floor;
    const { map, enemies, startX, startY } = generateDungeon(40, 30, floor);
    
    setGameState(prev => ({
      ...prev,
      screen: 'dungeon',
      player: { ...prev.player, x: startX, y: startY },
      dungeon: {
        ...prev.dungeon,
        map,
        enemies,
        log: [`地下 ${floor} 階に到達した。`],
        turn: 1
      }
    }));
  };

  const processTurn = (action: 'move' | 'wait' | 'attack', payload?: any) => {
    if (gameState.screen !== 'dungeon') return;

    let newPlayer = { ...gameState.player };
    let newEnemies = [...gameState.dungeon.enemies];
    let newLog = [...gameState.dungeon.log];
    let playerMoved = false;

    // 1. Player Action
    if (action === 'move') {
      const { dx, dy } = payload;
      const nx = newPlayer.x + dx;
      const ny = newPlayer.y + dy;

      // Check collision with walls
      if (gameState.dungeon.map[ny][nx] !== 0) {
        // Check collision with enemies
        const targetEnemyIndex = newEnemies.findIndex(e => !e.isDead && e.x === nx && e.y === ny);
        if (targetEnemyIndex !== -1) {
          // Attack!
          const enemy = newEnemies[targetEnemyIndex];
          const dmg = calculateDamage(newPlayer, enemy);
          enemy.stats.HP -= dmg;
          newLog.unshift(`${enemy.name} に ${dmg} のダメージを与えた！`);
          
          // Add Attack Effect
          addEffect({
            type: 'attack',
            x: newPlayer.x,
            y: newPlayer.y,
            targetX: enemy.x,
            targetY: enemy.y,
            startTime: performance.now(),
            duration: 250, // ms
            color: '#fbbf24' // Amber
          });

          // Add Damage Text Effect
          addEffect({
             type: 'text',
             x: enemy.x,
             y: enemy.y,
             startTime: performance.now(),
             duration: 600,
             text: `${dmg}`,
             color: '#ffffff'
          });

          if (enemy.stats.HP <= 0) {
            enemy.isDead = true;
            newLog.unshift(`${enemy.name} を倒した！ EXP +${enemy.exp}`);
            newPlayer.exp += enemy.exp;
            // Level up check
            if (newPlayer.exp >= newPlayer.nextExp) {
              newPlayer.level++;
              newPlayer.exp -= newPlayer.nextExp;
              newPlayer.nextExp = Math.floor(newPlayer.nextExp * 1.5);
              newPlayer.stats.maxHP += 10;
              newPlayer.stats.HP = newPlayer.stats.maxHP;
              newPlayer.stats.STR += 2; // Simplified
              newLog.unshift(`レベルアップ！ Lv${newPlayer.level} になった！`);
            }
          }
        } else {
          // Move
          newPlayer.x = nx;
          newPlayer.y = ny;
          playerMoved = true;

          // Check Stairs
          if (gameState.dungeon.map[ny][nx] === 3) {
            newLog.unshift('階段を見つけた！ (進むには決定キー)');
          }
        }
      } else {
        newLog.unshift('壁がある。');
      }
    } else if (action === 'wait') {
        newLog.unshift('様子を見た。');
    }

    // 2. Enemy Action (Simple AI)
    newEnemies.forEach(enemy => {
      if (enemy.isDead) return;

      const dist = Math.abs(enemy.x - newPlayer.x) + Math.abs(enemy.y - newPlayer.y);
      if (dist <= 1) {
        // Attack Player
        const dmg = calculateDamage(enemy, newPlayer);
        newPlayer.stats.HP -= dmg;
        newLog.unshift(`${enemy.name} の攻撃！ ${dmg} のダメージ！`);
        
        addEffect({
            type: 'attack',
            x: enemy.x,
            y: enemy.y,
            targetX: newPlayer.x,
            targetY: newPlayer.y,
            startTime: performance.now(),
            duration: 250,
            color: '#ef4444' // Red
        });

        addEffect({
             type: 'text',
             x: newPlayer.x,
             y: newPlayer.y,
             startTime: performance.now(),
             duration: 600,
             text: `${dmg}`,
             color: '#ef4444'
        });

      } else if (dist < 6 && enemy.ai === 'chase') {
        // Move towards player
        let ex = enemy.x;
        let ey = enemy.y;
        if (enemy.x < newPlayer.x) ex++;
        else if (enemy.x > newPlayer.x) ex--;
        else if (enemy.y < newPlayer.y) ey++;
        else if (enemy.y > newPlayer.y) ey--;

        if (gameState.dungeon.map[ey][ex] !== 0 && !(ex === newPlayer.x && ey === newPlayer.y)) {
             // Check other enemies
             if (!newEnemies.some(e => !e.isDead && e.id !== enemy.id && e.x === ex && e.y === ey)) {
                 enemy.x = ex;
                 enemy.y = ey;
             }
        }
      }
    });

    if (newPlayer.stats.HP <= 0) {
      newPlayer.isDead = true;
      setGameState({
        ...gameState,
        screen: 'result',
        player: newPlayer,
        dungeon: { ...gameState.dungeon, enemies: newEnemies, log: newLog }
      });
      return;
    }

    setGameState(prev => ({
      ...prev,
      player: newPlayer,
      dungeon: {
        ...prev.dungeon,
        enemies: newEnemies,
        log: newLog.slice(0, 50),
        turn: prev.dungeon.turn + 1
      }
    }));
  };

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (gameState.screen === 'dungeon' && !gameState.player.isDead) {
      if (e.key === 'ArrowUp') processTurn('move', { dx: 0, dy: -1 });
      if (e.key === 'ArrowDown') processTurn('move', { dx: 0, dy: 1 });
      if (e.key === 'ArrowLeft') processTurn('move', { dx: -1, dy: 0 });
      if (e.key === 'ArrowRight') processTurn('move', { dx: 1, dy: 0 });
      if (e.key === ' ') {
          // Check Stairs
           if (gameState.dungeon.map[gameState.player.y][gameState.player.x] === 3) {
               setGameState(prev => ({
                   ...prev,
                   player: { ...prev.player, floor: prev.player.floor + 1 }
               }));
               setTimeout(startDungeon, 0); // Hack to trigger gen
           } else {
               processTurn('wait');
           }
      }
    }
  }, [gameState]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
  
  // Trigger Dungeon Gen on floor change (initial or stairs)
  useEffect(() => {
      if(gameState.screen === 'dungeon' && gameState.dungeon.map.length === 0) {
          startDungeon();
      }
  }, [gameState.player.floor, gameState.screen]);

  // --- Canvas Rendering Loop ---

  const render = (time: number) => {
    const canvas = canvasRef.current;
    if (!canvas || gameState.screen !== 'dungeon') return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear
    ctx.fillStyle = '#111827';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const { map, width, height, enemies } = gameState.dungeon;
    const { player } = gameState;

    // Camera Calculation
    const camX = Math.max(0, Math.min(width - VIEWPORT_WIDTH, player.x - Math.floor(VIEWPORT_WIDTH / 2)));
    const camY = Math.max(0, Math.min(height - VIEWPORT_HEIGHT, player.y - Math.floor(VIEWPORT_HEIGHT / 2)));

    // Draw Map
    for (let y = 0; y < VIEWPORT_HEIGHT; y++) {
      for (let x = 0; x < VIEWPORT_WIDTH; x++) {
        const mx = camX + x;
        const my = camY + y;
        
        if (mx >= 0 && mx < width && my >= 0 && my < height) {
          const tile = map[my][mx];
          const drawX = x * TILE_SIZE;
          const drawY = y * TILE_SIZE;

          if (tile === 0) {
            ctx.fillStyle = '#1f2937'; // Wall
            ctx.fillRect(drawX, drawY, TILE_SIZE, TILE_SIZE);
          } else {
            ctx.fillStyle = '#374151'; // Floor
            ctx.fillRect(drawX, drawY, TILE_SIZE, TILE_SIZE);
            
            // Grid lines
            ctx.strokeStyle = '#4b5563';
            ctx.lineWidth = 1;
            ctx.strokeRect(drawX, drawY, TILE_SIZE, TILE_SIZE);

            if (tile === 3) {
              ctx.fillStyle = '#f59e0b'; // Stairs
              ctx.font = '24px sans-serif';
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillText('⚡', drawX + TILE_SIZE/2, drawY + TILE_SIZE/2);
            }
          }
        }
      }
    }

    // Draw Enemies
    enemies.forEach(enemy => {
      if (enemy.isDead) return;
      if (enemy.x >= camX && enemy.x < camX + VIEWPORT_WIDTH && 
          enemy.y >= camY && enemy.y < camY + VIEWPORT_HEIGHT) {
        
        const drawX = (enemy.x - camX) * TILE_SIZE;
        const drawY = (enemy.y - camY) * TILE_SIZE;

        ctx.fillStyle = enemy.color || 'red';
        ctx.beginPath();
        ctx.arc(drawX + TILE_SIZE/2, drawY + TILE_SIZE/2, TILE_SIZE/3, 0, Math.PI * 2);
        ctx.fill();
        
        // HP Bar
        const hpPct = enemy.stats.HP / enemy.stats.maxHP;
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(drawX + 4, drawY - 6, (TILE_SIZE - 8) * hpPct, 4);
      }
    });

    // Draw Player
    const pDrawX = (player.x - camX) * TILE_SIZE;
    const pDrawY = (player.y - camY) * TILE_SIZE;
    
    ctx.fillStyle = '#3b82f6';
    ctx.beginPath();
    // Simple shape for player
    ctx.arc(pDrawX + TILE_SIZE/2, pDrawY + TILE_SIZE/2, TILE_SIZE/3, 0, Math.PI*2);
    ctx.fill();

    // --- Draw Effects ---
    visualEffectsRef.current = visualEffectsRef.current.filter(effect => {
      const elapsed = time - effect.startTime;
      if (elapsed > effect.duration) return false;
      const progress = elapsed / effect.duration; // 0 to 1

      const drawX = (effect.x - camX) * TILE_SIZE;
      const drawY = (effect.y - camY) * TILE_SIZE;

      if (effect.type === 'attack' && effect.targetX !== undefined && effect.targetY !== undefined) {
         // Attack Animation: Swing a sword
         const targetDrawX = (effect.targetX - camX) * TILE_SIZE;
         const targetDrawY = (effect.targetY - camY) * TILE_SIZE;
         
         const angle = Math.atan2(targetDrawY - drawY, targetDrawX - drawX);
         
         ctx.save();
         // Translate to center of attacker
         ctx.translate(drawX + TILE_SIZE/2, drawY + TILE_SIZE/2);
         // Rotate towards target
         ctx.rotate(angle);
         
         // Swing motion: -45deg to +45deg
         const swingAngle = (progress - 0.5) * Math.PI / 1.5; 
         ctx.rotate(swingAngle);
         
         // Draw Sword
         ctx.fillStyle = '#cbd5e1'; // Blade
         ctx.fillRect(10, -2, TILE_SIZE * 0.8, 4);
         ctx.fillStyle = '#78350f'; // Hilt
         ctx.fillRect(0, -4, 10, 8);
         // Crossguard
         ctx.fillStyle = '#b45309';
         ctx.fillRect(8, -8, 4, 16);
         
         // Slash Trail
         if (progress > 0.2 && progress < 0.8) {
            ctx.beginPath();
            ctx.strokeStyle = '#ffffffaa';
            ctx.lineWidth = 2;
            ctx.arc(0, 0, TILE_SIZE, -0.3, 0.3); 
            ctx.stroke();
         }

         ctx.restore();
      } else if (effect.type === 'text') {
        // Floating Text
        const floatY = drawY - (progress * 20);
        ctx.font = 'bold 20px sans-serif';
        ctx.fillStyle = effect.color || 'white';
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
        ctx.textAlign = 'center';
        ctx.strokeText(effect.text || '', drawX + TILE_SIZE/2, floatY);
        ctx.fillText(effect.text || '', drawX + TILE_SIZE/2, floatY);
      }

      return true;
    });

    requestRef.current = requestAnimationFrame(render);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(render);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [gameState.dungeon, gameState.player]); // Dependencies for re-binding, though render uses ref state mostly for non-react updates if we optimized. Here we use state directly.

  // --- UI Renders ---

  if (gameState.screen === 'title') {
    return (
      <div className="w-full h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-100">
        <h1 className="text-6xl font-bold mb-8 text-amber-500 tracking-wider">Quest of Harvest</h1>
        <div className="space-y-4">
          <Button className="w-64 text-xl" onClick={() => setGameState(prev => ({ ...prev, screen: 'nameInput' }))}>
            New Game
          </Button>
          <Button className="w-64 text-xl" disabled>Load Game</Button>
        </div>
      </div>
    );
  }

  if (gameState.screen === 'nameInput') {
    return (
      <div className="w-full h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-100">
        <Card title="冒険者の登録" className="w-96">
           <input 
             className="w-full bg-slate-800 border border-slate-600 p-2 rounded text-white mb-4"
             placeholder="名前を入力..."
             value={gameState.player.name}
             onChange={e => setGameState(prev => ({ ...prev, player: { ...prev.player, name: e.target.value } }))}
           />
           <div className="flex justify-end">
             <Button 
               disabled={!gameState.player.name}
               onClick={() => setGameState(prev => ({ ...prev, screen: 'jobSelect' }))}
             >
               次へ <ChevronRight className="inline w-4 h-4"/>
             </Button>
           </div>
        </Card>
      </div>
    );
  }

  if (gameState.screen === 'jobSelect') {
    return (
      <div className="w-full h-screen bg-slate-950 p-8 text-slate-100 overflow-auto">
        <h2 className="text-3xl font-bold mb-6 text-center text-amber-500">ジョブ選択</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {JOBS.map(job => (
            <Card key={job.id} title={job.name} className="hover:border-amber-500 cursor-pointer transition-colors" onClick={() => {
              // Select Job and go to God Select (Skipped for now, straight to town)
              initGame(gameState.player.name, job.id, 'none');
            }}>
              <p className="text-slate-400 mb-4 h-12">{job.description}</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                 {Object.entries(job.baseStats).map(([k, v]) => (
                   <div key={k} className="flex justify-between border-b border-slate-700 pb-1">
                     <span className="text-slate-500">{k}</span>
                     <span className="font-mono text-amber-400">+{v}</span>
                   </div>
                 ))}
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (gameState.screen === 'town') {
    return (
      <div className="w-full h-screen bg-slate-900 text-slate-100 flex flex-col">
        {/* Header */}
        <div className="bg-slate-800 p-4 shadow-md flex justify-between items-center z-10">
           <div className="flex items-center gap-4">
             <div className="bg-slate-700 p-2 rounded-full"><User className="w-6 h-6"/></div>
             <div>
               <div className="font-bold text-lg">{gameState.player.name} <span className="text-sm text-slate-400">Lv.{gameState.player.level} {JOBS.find(j=>j.id===gameState.player.job)?.name}</span></div>
               <div className="text-xs text-amber-400">Gold: {gameState.player.gold} G</div>
             </div>
           </div>
           <div className="flex gap-2">
              <Button onClick={() => alert('保存しました（仮）')}><Save className="w-4 h-4 mr-2 inline"/>Save</Button>
           </div>
        </div>

        {/* Town Menu */}
        <div className="flex-1 flex p-8 gap-8 items-center justify-center bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-800 to-slate-950">
           <div className="grid grid-cols-2 gap-8 w-full max-w-4xl">
              <Card title="ダンジョンへ" className="h-48 flex items-center justify-center cursor-pointer hover:bg-slate-800 group" onClick={startDungeon}>
                 <div className="text-center">
                    <Mountain className="w-12 h-12 mx-auto mb-2 text-red-500 group-hover:scale-110 transition-transform"/>
                    <div className="font-bold text-xl">探索開始</div>
                    <div className="text-sm text-slate-400">地下 {gameState.player.floor} 階へ</div>
                 </div>
              </Card>
              <Card title="宿屋" className="h-48 flex items-center justify-center cursor-pointer hover:bg-slate-800 group" onClick={() => {
                 setGameState(prev => ({ ...prev, player: { ...prev.player, stats: { ...prev.player.stats, HP: prev.player.stats.maxHP, MP: prev.player.stats.maxMP } } }));
                 alert('全回復しました！');
              }}>
                 <div className="text-center">
                    <Heart className="w-12 h-12 mx-auto mb-2 text-pink-500 group-hover:scale-110 transition-transform"/>
                    <div className="font-bold text-xl">休息する</div>
                    <div className="text-sm text-slate-400">HP/MP 全回復</div>
                 </div>
              </Card>
              <Card title="道具屋" className="h-48 flex items-center justify-center cursor-pointer hover:bg-slate-800 group">
                 <div className="text-center">
                    <ShoppingBag className="w-12 h-12 mx-auto mb-2 text-blue-500 group-hover:scale-110 transition-transform"/>
                    <div className="font-bold text-xl">アイテム購入</div>
                    <div className="text-sm text-slate-400">準備を整える</div>
                 </div>
              </Card>
              <Card title="ステータス" className="h-48 flex items-center justify-center cursor-pointer hover:bg-slate-800 group">
                 <div className="text-center">
                    <Zap className="w-12 h-12 mx-auto mb-2 text-yellow-500 group-hover:scale-110 transition-transform"/>
                    <div className="font-bold text-xl">能力強化</div>
                    <div className="text-sm text-slate-400">神の恩恵 / スキル</div>
                 </div>
              </Card>
           </div>
        </div>
      </div>
    );
  }

  if (gameState.screen === 'dungeon') {
    return (
      <div className="w-full h-screen bg-black flex flex-col">
        {/* HUD */}
        <div className="h-16 bg-slate-900 border-b border-slate-700 flex items-center px-4 justify-between shrink-0">
          <div className="flex gap-4 text-white">
            <div className="flex flex-col w-32">
               <div className="flex justify-between text-xs mb-1"><span>HP</span><span>{gameState.player.stats.HP}/{gameState.player.stats.maxHP}</span></div>
               <div className="w-full bg-slate-700 h-2 rounded overflow-hidden">
                 <div className="bg-green-500 h-full transition-all" style={{ width: `${(gameState.player.stats.HP / gameState.player.stats.maxHP) * 100}%` }}></div>
               </div>
            </div>
            <div className="flex flex-col w-32">
               <div className="flex justify-between text-xs mb-1"><span>MP</span><span>{gameState.player.stats.MP}/{gameState.player.stats.maxMP}</span></div>
               <div className="w-full bg-slate-700 h-2 rounded overflow-hidden">
                 <div className="bg-blue-500 h-full transition-all" style={{ width: `${(gameState.player.stats.MP / gameState.player.stats.maxMP) * 100}%` }}></div>
               </div>
            </div>
          </div>
          <div className="text-slate-400 text-sm">
            Floor: {gameState.player.floor} | Lv: {gameState.player.level}
          </div>
        </div>

        {/* Game View */}
        <div className="flex-1 flex relative overflow-hidden">
           {/* Canvas Container */}
           <div className="flex-1 bg-black flex items-center justify-center">
              <canvas 
                ref={canvasRef} 
                width={VIEWPORT_WIDTH * TILE_SIZE} 
                height={VIEWPORT_HEIGHT * TILE_SIZE} 
                className="bg-slate-900 shadow-2xl border border-slate-700"
              />
              
              {/* Virtual Pad for Mobile (Simplified) */}
              <div className="absolute bottom-8 right-8 grid grid-cols-3 gap-2 opacity-50 hover:opacity-100 md:hidden">
                 <div/>
                 <button className="w-12 h-12 bg-slate-700 rounded-full flex items-center justify-center text-white" onClick={()=>processTurn('move', {dx:0,dy:-1})}><ArrowUp/></button>
                 <div/>
                 <button className="w-12 h-12 bg-slate-700 rounded-full flex items-center justify-center text-white" onClick={()=>processTurn('move', {dx:-1,dy:0})}><ChevronLeft/></button>
                 <button className="w-12 h-12 bg-slate-600 rounded-full flex items-center justify-center text-white font-bold" onClick={()=>processTurn('wait')}>Wait</button>
                 <button className="w-12 h-12 bg-slate-700 rounded-full flex items-center justify-center text-white" onClick={()=>processTurn('move', {dx:1,dy:0})}><ChevronRight/></button>
                 <div/>
                 <button className="w-12 h-12 bg-slate-700 rounded-full flex items-center justify-center text-white rotate-180" onClick={()=>processTurn('move', {dx:0,dy:1})}><ArrowUp/></button>
                 <div/>
              </div>
           </div>

           {/* Side Log */}
           <div className="w-64 bg-slate-900 border-l border-slate-700 flex flex-col shrink-0">
              <div className="p-2 bg-slate-800 font-bold text-slate-200 border-b border-slate-700">Log</div>
              <div className="flex-1 p-2 overflow-y-auto font-mono text-xs space-y-1 text-slate-300">
                {gameState.dungeon.log.map((log, i) => (
                  <div key={i} className={i === 0 ? 'text-white font-bold' : 'opacity-70'}>{log}</div>
                ))}
              </div>
           </div>
        </div>
      </div>
    );
  }

  if (gameState.screen === 'result') {
     return (
        <div className="w-full h-screen bg-slate-950 flex flex-col items-center justify-center text-red-500">
           <Skull className="w-24 h-24 mb-4"/>
           <h1 className="text-5xl font-bold mb-4">YOU DIED</h1>
           <p className="text-slate-400 mb-8">地下 {gameState.player.floor} 階で力尽きた...</p>
           <Button onClick={() => setGameState(prev => ({ ...prev, screen: 'title' }))}>タイトルへ戻る</Button>
        </div>
     );
  }

  return <div>Loading...</div>;
}
