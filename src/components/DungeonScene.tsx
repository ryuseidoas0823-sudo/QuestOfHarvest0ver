import React, { useRef, useEffect, useState, useCallback, useImperativeHandle, forwardRef } from 'react';
import { GameState, Position } from '../types/gameState';
import { EnemyInstance } from '../types/enemy';
import { ItemInstance } from '../types/item';
import { VisualManager, Shockwave } from '../utils/visualManager';

// 設定定数
const TILE_SIZE = 32; // 1タイルのピクセルサイズ
const PIXEL_SCALE = 2; // ドット絵の1ピクセルを画面上で何ピクセルにするか（16x16ドット絵 * 2 = 32px）

// 外部からVisualManagerを操作するためのハンドル
export interface DungeonSceneHandle {
    addDamageText: (text: string, x: number, y: number, color?: string) => void;
    addHitEffect: (x: number, y: number, color?: string) => void;
}

interface Props {
  gameState: GameState;
  onCellClick: (x: number, y: number) => void;
}

// --- Pixel Art Data Definitions ---
// .: 透明, x: 黒/輪郭, w: 白, r: 赤, b: 青, g: 緑, y: 黄/金, s: 肌色, c: 銀/鉄
const PALETTE: { [key: string]: string } = {
    '.': 'rgba(0,0,0,0)',
    'x': '#0f172a', // Outline (dark slate)
    'w': '#f8fafc', // White
    'r': '#ef4444', // Red
    'b': '#3b82f6', // Blue
    'g': '#22c55e', // Green
    'y': '#eab308', // Yellow/Gold
    's': '#fca5a5', // Skin
    'c': '#94a3b8', // Silver/Grey
    'o': '#f97316', // Orange
    'p': '#a855f7', // Purple
    'd': '#334155', // Dark Grey
};

const SPRITES = {
    // 勇者 (16x16)
    player: [
        "................",
        ".....xxxx.......",
        "....xccccx......", // Helmet
        "....xcxcx.......",
        "....xsxsx.......", // Face
        ".....xsx........",
        "...xxxbxxx......", // Shoulders
        "..xccxbxccx.....", // Arms/Armor
        "..xcxxbxxccx....",
        "..xcx.y.xc.x....", // Belt
        "......y.........",
        ".....xcx........", // Legs
        ".....xcx........",
        "....xcxcx.......",
        "....xx.xx.......",
        "................"
    ],
    // スライム
    slime: [
        "................",
        "................",
        "................",
        "......xxxx......",
        "....xxbbbbxx....",
        "...xbbbbbbbx....",
        "..xbbwbbwbbbx...", // Eyes
        "..xbbxbbxbbbx...",
        ".xbbbbbbbbbbbx..",
        ".xbbbbbbbbbbbx..",
        ".xbbbbbbbbbbbx..",
        "..xxxxxxxxxxx...",
        "................",
        "................",
        "................",
        "................"
    ],
    // コウモリ
    bat: [
        "................",
        ".x...........x..",
        ".xx.........xx..",
        ".xpTx.....xpTx..", // Purple Wings
        ".xpppx...xpppx..",
        "..xpppx.xpppx...",
        "...xpppxpppx....",
        "....xppxppx.....",
        ".....xpxpx......",
        "......xxx.......",
        "................",
        "................",
        "................",
        "................",
        "................",
        "................"
    ],
    // 骸骨
    skeleton: [
        "................",
        ".....xxxx.......",
        "....xw..wx......", // Skull eyes
        "....xwwwwwx.....",
        ".....xw.wx......",
        "......xxx.......",
        "....xxw.wxx.....", // Ribs
        "...xwwwwwwwx....",
        "...x.wwwww.x....",
        ".....wwwww......",
        ".....xwwwx......",
        "....x.x.x.x.....",
        "....w.w.w.w.....",
        "....x.x.x.x.....",
        "................",
        "................"
    ],
    // 宝箱
    chest: [
        "................",
        "................",
        "....xxxxxxx.....",
        "...xyyyyyyyx....",
        "..xyoyoyoyoyx...",
        "..xyyyyyyyyx....",
        "..xyoyoyoyoyx...",
        "..xyyyypyyyyx...", // Lock
        "..xyoyypyoyox...",
        "..xyyyyyyyyx....",
        "...xxxxxxxxx....",
        "................",
        "................",
        "................",
        "................",
        "................"
    ],
    // 階段
    stairs: [
        "................",
        "xxxxxx..........",
        "xyyyyxx.........",
        "xyyyyoyxx.......",
        "xxxxxyyyxx......",
        "....xyyyoyxx....",
        "....xxxxxyyyxx..",
        ".......xyyyoyx..",
        ".......xxxxxxx..",
        "................",
        "................",
        "................",
        "................",
        "................",
        "................",
        "................"
    ]
};

// forwardRefを使って親から操作可能にする
export const DungeonScene = forwardRef<DungeonSceneHandle, Props>(({ gameState, onCellClick }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // エフェクト管理
  const visualManagerRef = useRef<VisualManager>(new VisualManager());

  // 親コンポーネントへのメソッド公開
  useImperativeHandle(ref, () => ({
    addDamageText: (text, tileX, tileY, color) => {
        const x = tileX * TILE_SIZE + TILE_SIZE / 2;
        const y = tileY * TILE_SIZE + TILE_SIZE / 2;
        visualManagerRef.current.addDamageText(text, x, y, color);
    },
    addHitEffect: (tileX, tileY, color) => {
        const x = tileX * TILE_SIZE + TILE_SIZE / 2;
        const y = tileY * TILE_SIZE + TILE_SIZE / 2;
        visualManagerRef.current.addHitEffect(x, y, color);
    }
  }));
  
  // 画面サイズ管理
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  
  const frameIdRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight
        });
      }
    };
    window.addEventListener('resize', updateSize);
    updateSize();
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const render = useCallback((timestamp: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (!lastTimeRef.current) lastTimeRef.current = timestamp;
    const deltaTime = timestamp - lastTimeRef.current;
    lastTimeRef.current = timestamp;

    visualManagerRef.current.update(deltaTime);

    // --- 画面クリア ---
    ctx.fillStyle = '#020617'; // slate-950 (より暗い背景)
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // ctx.imageSmoothingEnabled = false; // ドット絵をくっきりさせる

    // --- カメラ計算 ---
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    const playerPixelX = gameState.player.position.x * TILE_SIZE;
    const playerPixelY = gameState.player.position.y * TILE_SIZE;

    // スムーズなカメラ追従のために、現在位置と目標位置を補間できると良いが、
    // ここでは即時追従
    const cameraX = Math.floor(playerPixelX - centerX + (TILE_SIZE / 2));
    const cameraY = Math.floor(playerPixelY - centerY + (TILE_SIZE / 2));

    // --- マップ描画 ---
    const { map, visited } = gameState.dungeon;
    const mapHeight = map.length;
    const mapWidth = map[0].length;

    const startCol = Math.floor(cameraX / TILE_SIZE);
    const endCol = startCol + (canvas.width / TILE_SIZE) + 1;
    const startRow = Math.floor(cameraY / TILE_SIZE);
    const endRow = startRow + (canvas.height / TILE_SIZE) + 1;

    for (let y = startRow; y <= endRow; y++) {
      for (let x = startCol; x <= endCol; x++) {
        if (y < 0 || y >= mapHeight || x < 0 || x >= mapWidth) continue;
        if (!visited[y][x]) continue;

        const tileType = map[y][x];
        const screenX = Math.floor(x * TILE_SIZE - cameraX);
        const screenY = Math.floor(y * TILE_SIZE - cameraY);

        drawTile(ctx, x, y, tileType, screenX, screenY);
      }
    }

    // --- アイテム描画 ---
    gameState.dungeon.items.forEach(item => {
        if (!visited[item.position.y][item.position.x]) return;
        const screenX = Math.floor(item.position.x * TILE_SIZE - cameraX);
        const screenY = Math.floor(item.position.y * TILE_SIZE - cameraY);
        
        if (isOnScreen(screenX, screenY, canvas.width, canvas.height)) {
             drawSprite(ctx, SPRITES.chest, screenX, screenY);
        }
    });

    // --- 敵描画 ---
    gameState.enemies.forEach(enemy => {
        if (!visited[enemy.position.y][enemy.position.x]) return;
        const screenX = Math.floor(enemy.position.x * TILE_SIZE - cameraX);
        const screenY = Math.floor(enemy.position.y * TILE_SIZE - cameraY);
        
        if (isOnScreen(screenX, screenY, canvas.width, canvas.height)) {
            // 敵IDに応じてスプライトを変える（簡易ロジック）
            let sprite = SPRITES.slime;
            if (enemy.id.includes('bat')) sprite = SPRITES.bat;
            if (enemy.id.includes('skeleton') || enemy.id.includes('boss')) sprite = SPRITES.skeleton;
            
            // 敵アニメーション (ふわふわ)
            const bob = Math.sin(timestamp / 200) * 2;
            drawEnemyWithHP(ctx, enemy, sprite, screenX, screenY + bob);
        }
    });

    // --- プレイヤー描画 ---
    const screenPlayerX = Math.floor(playerPixelX - cameraX);
    const screenPlayerY = Math.floor(playerPixelY - cameraY);
    // プレイヤーアニメーション (歩行っぽい揺れ)
    const playerBob = Math.abs(Math.sin(timestamp / 150)) * 2;
    drawSprite(ctx, SPRITES.player, screenPlayerX, screenPlayerY - playerBob);

    // --- エフェクト描画 ---
    visualManagerRef.current.draw(ctx, cameraX, cameraY);
    
    // --- ビネット効果（視界の隅を暗くする） ---
    const gradient = ctx.createRadialGradient(centerX, centerY, canvas.height * 0.3, centerX, centerY, canvas.height * 0.8);
    gradient.addColorStop(0, 'rgba(0,0,0,0)');
    gradient.addColorStop(1, 'rgba(0,0,0,0.6)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    frameIdRef.current = requestAnimationFrame(() => render(performance.now()));

  }, [gameState, dimensions]); 

  useEffect(() => {
    frameIdRef.current = requestAnimationFrame(() => render(performance.now()));
    return () => cancelAnimationFrame(frameIdRef.current);
  }, [render]);


  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const centerX = dimensions.width / 2;
    const centerY = dimensions.height / 2;
    const playerPixelX = gameState.player.position.x * TILE_SIZE;
    const playerPixelY = gameState.player.position.y * TILE_SIZE;
    const cameraX = playerPixelX - centerX + (TILE_SIZE / 2);
    const cameraY = playerPixelY - centerY + (TILE_SIZE / 2);

    const worldX = clickX + cameraX;
    const worldY = clickY + cameraY;

    visualManagerRef.current.add(new Shockwave(worldX, worldY, 20, 'rgba(255,255,255,0.3)'));

    const tileX = Math.floor(worldX / TILE_SIZE);
    const tileY = Math.floor(worldY / TILE_SIZE);
    onCellClick(tileX, tileY);
  };

  return (
    <div ref={containerRef} className="w-full h-full relative bg-black overflow-hidden">
      <canvas
        ref={canvasRef}
        width={dimensions.width}
        height={dimensions.height}
        onClick={handleClick}
        className="block cursor-crosshair touch-none"
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
});

// --- Helper Functions ---

const isOnScreen = (x: number, y: number, w: number, h: number) => {
    return x > -TILE_SIZE && x < w && y > -TILE_SIZE && y < h;
};

// スプライト描画関数
const drawSprite = (ctx: CanvasRenderingContext2D, data: string[], x: number, y: number, scale: number = PIXEL_SCALE) => {
    // 16x16のデータを想定
    for (let row = 0; row < data.length; row++) {
        const line = data[row];
        for (let col = 0; col < line.length; col++) {
            const char = line[col];
            if (char === '.' || !PALETTE[char]) continue;
            
            ctx.fillStyle = PALETTE[char];
            ctx.fillRect(x + col * scale, y + row * scale, scale, scale);
        }
    }
};

const drawTile = (ctx: CanvasRenderingContext2D, tileX: number, tileY: number, type: number, x: number, y: number) => {
  // 壁
  if (type === 0) {
    ctx.fillStyle = '#1e293b'; // slate-800
    ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
    // 壁の上面
    ctx.fillStyle = '#334155'; // slate-700
    ctx.fillRect(x, y, TILE_SIZE, 4);
    // 壁の側面影
    ctx.fillStyle = '#0f172a'; // slate-900
    ctx.fillRect(x + TILE_SIZE - 2, y, 2, TILE_SIZE);
  } 
  // 床
  else if (type === 1 || type === 2) {
    ctx.fillStyle = '#0f172a'; // slate-900 (darker floor)
    ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
    
    // タイル模様
    ctx.fillStyle = '#1e293b';
    if ((tileX + tileY) % 2 === 0) {
        ctx.fillRect(x + 2, y + 2, TILE_SIZE - 4, TILE_SIZE - 4);
    } else {
        ctx.fillRect(x + 4, y + 4, TILE_SIZE - 8, TILE_SIZE - 8);
    }
  }
  // 階段
  else if (type === 3) {
    // 床を描いてから階段スプライト
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
    drawSprite(ctx, SPRITES.stairs, x, y);
  }
};

const drawEnemyWithHP = (ctx: CanvasRenderingContext2D, enemy: EnemyInstance, sprite: string[], x: number, y: number) => {
    drawSprite(ctx, sprite, x, y);
    
    // HP Bar
    const hpRatio = Math.max(0, enemy.stats.hp / enemy.stats.maxHp);
    const barWidth = TILE_SIZE;
    const barHeight = 4;
    
    ctx.fillStyle = '#000';
    ctx.fillRect(x, y - 6, barWidth, barHeight);
    
    const hpColor = hpRatio > 0.5 ? '#22c55e' : hpRatio > 0.2 ? '#eab308' : '#ef4444';
    ctx.fillStyle = hpColor;
    ctx.fillRect(x + 1, y - 5, (barWidth - 2) * hpRatio, barHeight - 2);
};
