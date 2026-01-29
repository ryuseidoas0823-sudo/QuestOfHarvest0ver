import React, { useRef, useEffect, useState, useCallback, useImperativeHandle, forwardRef } from 'react';
import { GameState, Position } from '../types/gameState';
import { EnemyInstance } from '../types/enemy';
import { TILE_SIZE, VIEWPORT_WIDTH, VIEWPORT_HEIGHT } from '../config';
import { SpriteManager } from '../assets/spriteManager';
import { VisualManager, Shockwave, AttackSlash } from '../utils/visualManager';

interface Props {
  gameState: GameState;
  onCellClick: (x: number, y: number) => void;
}

// 外部から呼び出せるメソッドの型定義
export interface DungeonSceneHandle {
    addDamageText: (text: string, x: number, y: number, color?: string) => void;
    addHitEffect: (x: number, y: number, color?: string) => void;
    playAttackAnimation: (x: number, y: number, direction: string) => void;
}

// 描画すべきオブジェクトの型
interface RenderObject {
    type: 'player' | 'enemy' | 'effect';
    y: number; // ソート用のY座標
    draw: (ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number) => void;
}

export const DungeonScene = forwardRef<DungeonSceneHandle, Props>(({ gameState, onCellClick }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  
  // アセット管理
  const spriteManagerRef = useRef<SpriteManager>(new SpriteManager());
  const visualManagerRef = useRef<VisualManager>(new VisualManager());
  
  // アニメーション用状態
  const lastTimeRef = useRef<number>(0);
  const animationFrameRef = useRef<number>(0);
  
  // 補間移動用の状態
  const playerPosRef = useRef({ x: gameState.player.position.x * TILE_SIZE, y: gameState.player.position.y * TILE_SIZE });
  const cameraRef = useRef({ x: 0, y: 0 });

  // 外部公開メソッドの実装
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
    },
    playAttackAnimation: (tileX, tileY, direction) => {
        const x = tileX * TILE_SIZE + TILE_SIZE / 2;
        const y = tileY * TILE_SIZE + TILE_SIZE / 2;
        visualManagerRef.current.add(new AttackSlash(x, y, direction));
        // 攻撃のインパクト演出として少し揺らす等の拡張も可能
        // visualManagerRef.current.add(new Shockwave(x, y, 10, 'rgba(255,255,255,0.1)'));
    }
  }));

  // リサイズ処理
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight
        });
      }
    };
    
    window.addEventListener('resize', handleResize);
    handleResize();
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // プレイヤー位置の更新（補間移動のターゲット設定）
  useEffect(() => {
    // ターゲット位置
    const targetX = gameState.player.position.x * TILE_SIZE;
    const targetY = gameState.player.position.y * TILE_SIZE;
    
    // 現在位置が極端に離れている場合（フロア移動時など）は瞬時に移動
    const dist = Math.hypot(targetX - playerPosRef.current.x, targetY - playerPosRef.current.y);
    if (dist > TILE_SIZE * 2) {
        playerPosRef.current = { x: targetX, y: targetY };
    }
  }, [gameState.player.position]);

  // クリックハンドリング
  const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    
    // カメラ位置を考慮してワールド座標に変換
    const worldX = clickX + cameraRef.current.x;
    const worldY = clickY + cameraRef.current.y;
    
    const tileX = Math.floor(worldX / TILE_SIZE);
    const tileY = Math.floor(worldY / TILE_SIZE);
    
    onCellClick(tileX, tileY);
  }, [onCellClick]);

  // メインループ
  useEffect(() => {
    const render = (time: number) => {
        const deltaTime = time - lastTimeRef.current;
        lastTimeRef.current = time;
        
        const ctx = canvasRef.current?.getContext('2d');
        if (!ctx) {
            animationFrameRef.current = requestAnimationFrame(render);
            return;
        }

        // 1. 状態更新 (Update)
        
        // プレイヤーの補間移動 (LERP)
        const targetX = gameState.player.position.x * TILE_SIZE;
        const targetY = gameState.player.position.y * TILE_SIZE;
        const lerpFactor = 0.2; // 移動の滑らかさ
        
        playerPosRef.current.x += (targetX - playerPosRef.current.x) * lerpFactor;
        playerPosRef.current.y += (targetY - playerPosRef.current.y) * lerpFactor;
        
        // カメラ位置の更新 (プレイヤーを中心に追従)
        // 画面中央にプレイヤーが来るようにカメラ位置を計算
        let camX = playerPosRef.current.x + TILE_SIZE / 2 - dimensions.width / 2;
        let camY = playerPosRef.current.y + TILE_SIZE / 2 - dimensions.height / 2;
        
        // ダンジョン範囲内にクランプ（オプション：無限に黒背景なら不要だが、マップ端を見せるか次第）
        // 今回はクランプせず、プレイヤー中心維持を優先
        
        cameraRef.current = { x: camX, y: camY };

        // 2. 描画 (Draw)
        
        // 背景クリア
        ctx.fillStyle = '#111';
        ctx.fillRect(0, 0, dimensions.width, dimensions.height);

        // カメラ変換行列の適用は行わず、各描画座標から cameraX/Y を引く方式で実装
        // (コンテキストのsave/restore回数を減らすため、または制御しやすくするため)
        
        // --- 床・壁の描画 ---
        // 画面に見える範囲のタイルのみ描画する（カリング）
        const startCol = Math.floor(camX / TILE_SIZE);
        const endCol = startCol + Math.ceil(dimensions.width / TILE_SIZE) + 1;
        const startRow = Math.floor(camY / TILE_SIZE);
        const endRow = startRow + Math.ceil(dimensions.height / TILE_SIZE) + 1;

        for (let y = startRow; y <= endRow; y++) {
            for (let x = startCol; x <= endCol; x++) {
                if (y < 0 || y >= gameState.dungeon.height || x < 0 || x >= gameState.dungeon.width) continue;
                
                const cell = gameState.dungeon.grid[y][x];
                const drawX = Math.round(x * TILE_SIZE - camX);
                const drawY = Math.round(y * TILE_SIZE - camY);
                
                // 視界処理（未探索エリアは描画しない）
                if (!cell.isExplored) {
                    // 暗闇
                    continue; 
                }
                
                // 視界外（exploredだがvisibleでない）は暗く描画
                if (!cell.isVisible) {
                    ctx.globalAlpha = 0.3;
                } else {
                    ctx.globalAlpha = 1.0;
                }
                
                // 床・壁の描画
                if (cell.type === 'wall') {
                     spriteManagerRef.current.drawSprite(ctx, 'wall', drawX, drawY, TILE_SIZE);
                } else {
                     spriteManagerRef.current.drawSprite(ctx, 'floor', drawX, drawY, TILE_SIZE);
                     
                     // 階段
                     if (cell.type === 'stairs_down') {
                         spriteManagerRef.current.drawSprite(ctx, 'stairs', drawX, drawY, TILE_SIZE);
                     }
                }
                
                ctx.globalAlpha = 1.0;
            }
        }

        // --- エンティティの描画 (Yソート) ---
        // キャラクターやオブジェクトをY座標順にソートして描画することで、手前のものが奥のものを隠す表現をする
        
        const renderList: RenderObject[] = [];
        
        // プレイヤー
        renderList.push({
            type: 'player',
            y: playerPosRef.current.y,
            draw: (ctx, cx, cy) => {
                const px = Math.round(playerPosRef.current.x - cx);
                const py = Math.round(playerPosRef.current.y - cy);
                // 向きに応じたスプライトがあればそれを使うが、現状は単一
                spriteManagerRef.current.drawSprite(ctx, 'player', px, py, TILE_SIZE);
            }
        });
        
        // 敵キャラクター
        gameState.enemies.forEach(enemy => {
            // 視界内の敵のみ描画
            const cell = gameState.dungeon.grid[enemy.position.y][enemy.position.x];
            if (!cell.isVisible) return;
            
            renderList.push({
                type: 'enemy',
                y: enemy.position.y * TILE_SIZE,
                draw: (ctx, cx, cy) => {
                    const ex = Math.round(enemy.position.x * TILE_SIZE - cx);
                    const ey = Math.round(enemy.position.y * TILE_SIZE - cy);
                    // 敵IDに応じたスプライト（仮実装として種族やIDで分岐可能）
                    // ここでは簡易的に 'enemy' または特定の色
                    spriteManagerRef.current.drawSprite(ctx, 'enemy', ex, ey, TILE_SIZE, enemy.symbol);
                    
                    // HPバー簡易表示
                    const hpRatio = enemy.hp / enemy.maxHp;
                    ctx.fillStyle = 'red';
                    ctx.fillRect(ex, ey - 5, TILE_SIZE, 4);
                    ctx.fillStyle = 'lime';
                    ctx.fillRect(ex, ey - 5, TILE_SIZE * hpRatio, 4);
                }
            });
        });

        // ソート実行
        renderList.sort((a, b) => a.y - b.y);
        
        // 描画実行
        renderList.forEach(obj => obj.draw(ctx, camX, camY));

        // --- エフェクトレイヤー (最前面) ---
        visualManagerRef.current.draw(ctx, camX, camY);

        animationFrameRef.current = requestAnimationFrame(render);
    };
    
    animationFrameRef.current = requestAnimationFrame(render);
    
    return () => {
        cancelAnimationFrame(animationFrameRef.current);
    };
  }, [gameState, dimensions]);

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
      
      {/* デバッグ用座標表示などがあればここにHTMLオーバーレイとして配置可能 */}
    </div>
  );
});

DungeonScene.displayName = 'DungeonScene';
