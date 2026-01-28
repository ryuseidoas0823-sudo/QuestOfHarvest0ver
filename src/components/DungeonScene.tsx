import React, { useRef, useEffect, useState, useCallback, useImperativeHandle, forwardRef } from 'react';
import { GameState, Position } from '../types/gameState';
import { EnemyInstance } from '../types/enemy';
import { ItemInstance } from '../types/item';
import { VisualManager, Shockwave } from '../utils/visualManager';

// 設定定数
const TILE_SIZE = 32; // 1タイルのピクセルサイズ
const SPRITE_SCALE = 1; // スプライトの拡大率

// 外部からVisualManagerを操作するためのハンドル
export interface DungeonSceneHandle {
    addDamageText: (text: string, x: number, y: number, color?: string) => void;
    addHitEffect: (x: number, y: number, color?: string) => void;
}

interface Props {
  gameState: GameState;
  onCellClick: (x: number, y: number) => void;
}

// forwardRefを使って親から操作可能にする
export const DungeonScene = forwardRef<DungeonSceneHandle, Props>(({ gameState, onCellClick }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // エフェクト管理
  const visualManagerRef = useRef<VisualManager>(new VisualManager());

  // 親コンポーネントへのメソッド公開
  useImperativeHandle(ref, () => ({
    addDamageText: (text, tileX, tileY, color) => {
        // タイル座標をピクセル座標に変換
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
  
  // アニメーション用
  const frameIdRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  // コンテナサイズに合わせてCanvasサイズを調整
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

  // 描画ループ
  const render = useCallback((timestamp: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // デルタタイム計算（アニメーション用）
    if (!lastTimeRef.current) lastTimeRef.current = timestamp;
    const deltaTime = timestamp - lastTimeRef.current;
    lastTimeRef.current = timestamp;

    // VisualManager更新
    visualManagerRef.current.update(deltaTime);

    // --- 1. 画面クリア ---
    ctx.fillStyle = '#0f172a'; // slate-900 (背景色)
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // --- 2. カメラ位置計算 (プレイヤー中心) ---
    // 画面中央
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    // プレイヤーのワールド座標（ピクセル単位）
    const playerPixelX = gameState.player.position.x * TILE_SIZE;
    const playerPixelY = gameState.player.position.y * TILE_SIZE;

    // カメラの左上オフセット
    const cameraX = playerPixelX - centerX + (TILE_SIZE / 2);
    const cameraY = playerPixelY - centerY + (TILE_SIZE / 2);

    // --- 3. マップ描画 ---
    const { map, visited } = gameState.dungeon;
    const mapHeight = map.length;
    const mapWidth = map[0].length;

    // 描画範囲の計算（カリング）
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

    // --- 4. アイテム描画 ---
    gameState.dungeon.items.forEach(item => {
        if (!visited[item.position.y][item.position.x]) return;
        const screenX = Math.floor(item.position.x * TILE_SIZE - cameraX);
        const screenY = Math.floor(item.position.y * TILE_SIZE - cameraY);
        if (screenX > -TILE_SIZE && screenX < canvas.width && screenY > -TILE_SIZE && screenY < canvas.height) {
            drawItem(ctx, item, screenX, screenY);
        }
    });

    // --- 5. 敵描画 ---
    gameState.enemies.forEach(enemy => {
        if (!visited[enemy.position.y][enemy.position.x]) return;
        const screenX = Math.floor(enemy.position.x * TILE_SIZE - cameraX);
        const screenY = Math.floor(enemy.position.y * TILE_SIZE - cameraY);
        if (screenX > -TILE_SIZE && screenX < canvas.width && screenY > -TILE_SIZE && screenY < canvas.height) {
            drawEnemy(ctx, enemy, screenX, screenY, deltaTime);
        }
    });

    // --- 6. プレイヤー描画 ---
    const screenPlayerX = Math.floor(playerPixelX - cameraX);
    const screenPlayerY = Math.floor(playerPixelY - cameraY);
    drawPlayer(ctx, gameState.player, screenPlayerX, screenPlayerY, deltaTime);

    // --- 7. エフェクト描画 (VisualManager連携) ---
    visualManagerRef.current.draw(ctx, cameraX, cameraY);
    
    // 次のフレームへ
    frameIdRef.current = requestAnimationFrame(() => render(performance.now()));

  }, [gameState, dimensions]); 

  // アニメーション開始・停止
  useEffect(() => {
    frameIdRef.current = requestAnimationFrame(() => render(performance.now()));
    return () => cancelAnimationFrame(frameIdRef.current);
  }, [render]);


  // --- 入力ハンドラ ---
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

    // クリックエフェクト（デバッグ/フィードバック用）
    visualManagerRef.current.add(new Shockwave(worldX, worldY, 30, '#60a5fa'));

    const tileX = Math.floor(worldX / TILE_SIZE);
    const tileY = Math.floor(worldY / TILE_SIZE);

    onCellClick(tileX, tileY);
  };


  return (
    <div ref={containerRef} className="w-full h-full relative bg-slate-950 overflow-hidden">
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


// --- 以下、描画ヘルパー関数群 ---

// マップタイルの描画
const drawTile = (ctx: CanvasRenderingContext2D, tileX: number, tileY: number, type: number, x: number, y: number) => {
  // 壁
  if (type === 0) {
    ctx.fillStyle = '#334155'; // slate-700
    ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
    // 影
    ctx.fillStyle = '#1e293b'; // slate-800
    ctx.fillRect(x, y + TILE_SIZE - 4, TILE_SIZE, 4);
  } 
  // 床
  else if (type === 1 || type === 2) {
    ctx.fillStyle = '#1e293b'; // slate-800
    ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
    ctx.strokeStyle = '#0f172a'; // slate-900
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, TILE_SIZE, TILE_SIZE);
    if ((tileX + tileY) % 2 === 0) {
       ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
       ctx.fillRect(x + 4, y + 4, TILE_SIZE - 8, TILE_SIZE - 8);
    }
  }
  // 階段
  else if (type === 3) {
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
    ctx.fillStyle = '#ca8a04'; // yellow-600
    ctx.beginPath();
    ctx.moveTo(x + TILE_SIZE / 2, y + 4);
    ctx.lineTo(x + TILE_SIZE - 4, y + TILE_SIZE - 4);
    ctx.lineTo(x + 4, y + TILE_SIZE - 4);
    ctx.fill();
  }
};

// プレイヤーの描画
const drawPlayer = (ctx: CanvasRenderingContext2D, player: any, x: number, y: number, deltaTime: number) => {
    // 影
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.beginPath();
    ctx.ellipse(x + TILE_SIZE/2, y + TILE_SIZE - 2, TILE_SIZE/3, TILE_SIZE/6, 0, 0, Math.PI * 2);
    ctx.fill();
    // 本体
    ctx.fillStyle = '#3b82f6'; // blue-500
    const size = TILE_SIZE - 8;
    ctx.fillRect(x + 4, y + 4, size, size);
    // 頭
    ctx.fillStyle = '#fca5a5'; 
    ctx.fillRect(x + 8, y + 2, size - 8, 8);
    // 武器
    ctx.fillStyle = '#cbd5e1'; 
    ctx.fillRect(x + size, y + 10, 4, 12);
};

// 敵の描画
const drawEnemy = (ctx: CanvasRenderingContext2D, enemy: EnemyInstance, x: number, y: number, deltaTime: number) => {
    // 影
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.beginPath();
    ctx.ellipse(x + TILE_SIZE/2, y + TILE_SIZE - 2, TILE_SIZE/3, TILE_SIZE/6, 0, 0, Math.PI * 2);
    ctx.fill();
    // 本体 (点滅エフェクト)
    ctx.fillStyle = enemy.color || '#ef4444'; 
    const breath = Math.sin(performance.now() / 200) * 1;
    const size = TILE_SIZE - 8;
    ctx.fillRect(x + 4, y + 4 - breath, size, size + breath);
    // HPバー
    const hpRatio = Math.max(0, enemy.stats.hp / enemy.stats.maxHp);
    ctx.fillStyle = '#1e293b'; 
    ctx.fillRect(x, y - 6, TILE_SIZE, 4);
    ctx.fillStyle = hpRatio > 0.5 ? '#22c55e' : '#ef4444'; 
    ctx.fillRect(x, y - 6, TILE_SIZE * hpRatio, 4);
};

// アイテムの描画
const drawItem = (ctx: CanvasRenderingContext2D, item: ItemInstance, x: number, y: number) => {
    const shine = Math.abs(Math.sin(performance.now() / 300));
    ctx.globalAlpha = 0.5 + shine * 0.5;
    ctx.fillStyle = '#fbbf24'; 
    ctx.fillRect(x + 6, y + 10, TILE_SIZE - 12, TILE_SIZE - 14);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 6, y + 10, TILE_SIZE - 12, TILE_SIZE - 14);
    ctx.globalAlpha = 1.0;
};
