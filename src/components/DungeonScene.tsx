import React, { useRef, useEffect, useState, useCallback } from 'react';
import { GameState, Position } from '../types/gameState';
import { EnemyInstance } from '../types/enemy';
import { ItemInstance } from '../types/item';

// 設定定数
const TILE_SIZE = 32; // 1タイルのピクセルサイズ
const SPRITE_SCALE = 1; // スプライトの拡大率

interface Props {
  gameState: GameState;
  onCellClick: (x: number, y: number) => void;
  // 将来的に VisualManager を受け取る想定
  // visualManager?: VisualManager; 
}

export const DungeonScene: React.FC<Props> = ({ gameState, onCellClick }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
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

    // --- 1. 画面クリア ---
    ctx.fillStyle = '#0f172a'; // slate-900 (背景色)
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // --- 2. カメラ位置計算 (プレイヤー中心) ---
    // 画面中央
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    // プレイヤーのワールド座標（ピクセル単位）
    // 将来的にはスムーズな移動アニメーションのために、gameState.player.position ではなく
    // 補間された座標を使うと良い
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
    // 画面外のタイルを描画しないようにしてパフォーマンスを稼ぐ
    const startCol = Math.floor(cameraX / TILE_SIZE);
    const endCol = startCol + (canvas.width / TILE_SIZE) + 1;
    const startRow = Math.floor(cameraY / TILE_SIZE);
    const endRow = startRow + (canvas.height / TILE_SIZE) + 1;

    for (let y = startRow; y <= endRow; y++) {
      for (let x = startCol; x <= endCol; x++) {
        // マップ範囲外チェック
        if (y < 0 || y >= mapHeight || x < 0 || x >= mapWidth) continue;

        // 訪問済みチェック (FOW: Fog of War)
        // visited[y][x] が false なら描画しない（真っ暗）
        if (!visited[y][x]) continue;

        const tileType = map[y][x];
        const screenX = Math.floor(x * TILE_SIZE - cameraX);
        const screenY = Math.floor(y * TILE_SIZE - cameraY);

        // タイルの描画
        drawTile(ctx, x, y, tileType, screenX, screenY);
      }
    }

    // --- 4. アイテム描画 ---
    // 本来は座標ベースで空間分割するか、マップ描画ループ内で処理すべきだが、
    // 数が少ないので全探索でもOK
    gameState.dungeon.items.forEach(item => {
        // 訪問済みエリアのみ表示
        if (!visited[item.position.y][item.position.x]) return;

        const screenX = Math.floor(item.position.x * TILE_SIZE - cameraX);
        const screenY = Math.floor(item.position.y * TILE_SIZE - cameraY);

        // 画面内判定
        if (screenX > -TILE_SIZE && screenX < canvas.width && screenY > -TILE_SIZE && screenY < canvas.height) {
            drawItem(ctx, item, screenX, screenY);
        }
    });

    // --- 5. 敵描画 ---
    gameState.enemies.forEach(enemy => {
        // 敵は視界内（あるいは訪問済みエリア）にいる場合のみ描画
        // 本来は「現在の視界」判定が必要だが、簡易的にvisitedで代用、または常に表示
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

    // --- 7. エフェクト描画 (VisualManager連携用プレースホルダ) ---
    // if (visualManager) visualManager.draw(ctx, cameraX, cameraY);
    
    // --- 8. グリッド線 (オプション: デバッグ用や視認性向上) ---
    // drawGrid(ctx, cameraX, cameraY, canvas.width, canvas.height);

    // 次のフレームへ
    frameIdRef.current = requestAnimationFrame(() => render(performance.now()));

  }, [gameState, dimensions]); // 依存配列: stateが変わるたびにレンダリング関数を再生成しないように注意が必要だが、useCallback内でrefを使うのがベスト。ここでは簡易実装。

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

    // 画面中央からのオフセットを計算してワールド座標に戻す
    const centerX = dimensions.width / 2;
    const centerY = dimensions.height / 2;
    
    const playerPixelX = gameState.player.position.x * TILE_SIZE;
    const playerPixelY = gameState.player.position.y * TILE_SIZE;
    
    const cameraX = playerPixelX - centerX + (TILE_SIZE / 2);
    const cameraY = playerPixelY - centerY + (TILE_SIZE / 2);

    const worldX = clickX + cameraX;
    const worldY = clickY + cameraY;

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
      
      {/* デバッグ情報などを重ねる場合はここにdivを追加 */}
    </div>
  );
};


// --- 以下、描画ヘルパー関数群 ---

// マップタイルの描画
const drawTile = (ctx: CanvasRenderingContext2D, tileX: number, tileY: number, type: number, x: number, y: number) => {
  // 壁
  if (type === 0) {
    ctx.fillStyle = '#334155'; // slate-700
    ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
    
    // 影のような装飾
    ctx.fillStyle = '#1e293b'; // slate-800
    ctx.fillRect(x, y + TILE_SIZE - 4, TILE_SIZE, 4);
  } 
  // 床 / 通路 / 部屋
  else if (type === 1 || type === 2) {
    ctx.fillStyle = '#1e293b'; // slate-800
    ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
    
    // グリッド線っぽさ
    ctx.strokeStyle = '#0f172a'; // slate-900
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, TILE_SIZE, TILE_SIZE);

    // ドットパターン装飾 (簡易)
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
    // 簡易的な円描画 (本来はPixelSpriteを描画したい)
    // 影
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.beginPath();
    ctx.ellipse(x + TILE_SIZE/2, y + TILE_SIZE - 2, TILE_SIZE/3, TILE_SIZE/6, 0, 0, Math.PI * 2);
    ctx.fill();

    // 本体 (勇者っぽい色)
    ctx.fillStyle = '#3b82f6'; // blue-500
    const size = TILE_SIZE - 8;
    ctx.fillRect(x + 4, y + 4, size, size);

    // 頭
    ctx.fillStyle = '#fca5a5'; // skin tone
    ctx.fillRect(x + 8, y + 2, size - 8, 8);
    
    // 装備中の武器を表示 (簡易)
    ctx.fillStyle = '#cbd5e1'; // silver
    ctx.fillRect(x + size, y + 10, 4, 12); // Sword
};

// 敵の描画
const drawEnemy = (ctx: CanvasRenderingContext2D, enemy: EnemyInstance, x: number, y: number, deltaTime: number) => {
    // 影
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.beginPath();
    ctx.ellipse(x + TILE_SIZE/2, y + TILE_SIZE - 2, TILE_SIZE/3, TILE_SIZE/6, 0, 0, Math.PI * 2);
    ctx.fill();

    // 本体
    ctx.fillStyle = enemy.color || '#ef4444'; // red-500 default
    
    // 少しアニメーション (呼吸)
    const breath = Math.sin(performance.now() / 200) * 1;
    
    // スプライト代わりの矩形
    const size = TILE_SIZE - 8;
    ctx.fillRect(x + 4, y + 4 - breath, size, size + breath);

    // HPバー
    const hpRatio = enemy.stats.hp / enemy.stats.maxHp;
    ctx.fillStyle = '#1e293b'; // bg
    ctx.fillRect(x, y - 6, TILE_SIZE, 4);
    ctx.fillStyle = hpRatio > 0.5 ? '#22c55e' : '#ef4444'; // green or red
    ctx.fillRect(x, y - 6, TILE_SIZE * hpRatio, 4);
};

// アイテムの描画
const drawItem = (ctx: CanvasRenderingContext2D, item: ItemInstance, x: number, y: number) => {
    // キラキラエフェクト
    const shine = Math.abs(Math.sin(performance.now() / 300));
    ctx.globalAlpha = 0.5 + shine * 0.5;

    ctx.fillStyle = '#fbbf24'; // amber-400 (宝箱色)
    // 宝箱っぽい形状
    ctx.fillRect(x + 6, y + 10, TILE_SIZE - 12, TILE_SIZE - 14);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 6, y + 10, TILE_SIZE - 12, TILE_SIZE - 14);

    ctx.globalAlpha = 1.0;
};
