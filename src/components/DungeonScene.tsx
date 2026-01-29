import React, { useRef, useEffect, useState, useCallback, useImperativeHandle, forwardRef } from 'react';
import { GameState } from '../types/gameState';
import { TILE_SIZE } from '../config';
import { SpriteManager } from '../assets/spriteManager';
import { VisualManager, AttackSlash, ClawEffect } from '../utils/visualManager'; // ClawEffectを追加

interface Props {
  gameState: GameState;
  onCellClick: (x: number, y: number) => void;
}

// 外部公開メソッドの型定義 (variantを追加)
export interface DungeonSceneHandle {
    addDamageText: (text: string, x: number, y: number, color?: string) => void;
    addHitEffect: (x: number, y: number, color?: string) => void;
    playAttackAnimation: (x: number, y: number, direction: string, variant?: 'slash' | 'claw') => void;
}

interface RenderObject {
    type: 'player' | 'enemy' | 'effect';
    y: number; 
    draw: (ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number) => void;
}

export const DungeonScene = forwardRef<DungeonSceneHandle, Props>(({ gameState, onCellClick }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  
  const spriteManagerRef = useRef<SpriteManager>(new SpriteManager());
  const visualManagerRef = useRef<VisualManager>(new VisualManager());
  
  const lastTimeRef = useRef<number>(0);
  const animationFrameRef = useRef<number>(0);
  
  const playerPosRef = useRef({ x: gameState.player.position.x * TILE_SIZE, y: gameState.player.position.y * TILE_SIZE });
  const cameraRef = useRef({ x: 0, y: 0 });

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
    // variant 対応
    playAttackAnimation: (tileX, tileY, direction, variant = 'slash') => {
        const x = tileX * TILE_SIZE + TILE_SIZE / 2;
        const y = tileY * TILE_SIZE + TILE_SIZE / 2;
        
        if (variant === 'slash') {
            visualManagerRef.current.add(new AttackSlash(x, y, direction));
        } else if (variant === 'claw') {
            visualManagerRef.current.add(new ClawEffect(x, y));
        }
    }
  }));

  // ... (以下、Resize, Update, Renderループは変更なし)
  // 以前のDungeonScene.tsxと同じ内容を維持
  // render関数内の visualManagerRef.current.draw() が拡張されたクラスを自動的に処理します。

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

  useEffect(() => {
    const targetX = gameState.player.position.x * TILE_SIZE;
    const targetY = gameState.player.position.y * TILE_SIZE;
    const dist = Math.hypot(targetX - playerPosRef.current.x, targetY - playerPosRef.current.y);
    if (dist > TILE_SIZE * 2) {
        playerPosRef.current = { x: targetX, y: targetY };
    }
  }, [gameState.player.position]);

  const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    const worldX = clickX + cameraRef.current.x;
    const worldY = clickY + cameraRef.current.y;
    const tileX = Math.floor(worldX / TILE_SIZE);
    const tileY = Math.floor(worldY / TILE_SIZE);
    onCellClick(tileX, tileY);
  }, [onCellClick]);

  useEffect(() => {
    const render = (time: number) => {
        const deltaTime = time - lastTimeRef.current;
        lastTimeRef.current = time;
        
        const ctx = canvasRef.current?.getContext('2d');
        if (!ctx) {
            animationFrameRef.current = requestAnimationFrame(render);
            return;
        }

        const targetX = gameState.player.position.x * TILE_SIZE;
        const targetY = gameState.player.position.y * TILE_SIZE;
        const lerpFactor = 0.2;
        
        playerPosRef.current.x += (targetX - playerPosRef.current.x) * lerpFactor;
        playerPosRef.current.y += (targetY - playerPosRef.current.y) * lerpFactor;
        
        let camX = playerPosRef.current.x + TILE_SIZE / 2 - dimensions.width / 2;
        let camY = playerPosRef.current.y + TILE_SIZE / 2 - dimensions.height / 2;
        cameraRef.current = { x: camX, y: camY };

        ctx.fillStyle = '#111';
        ctx.fillRect(0, 0, dimensions.width, dimensions.height);

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
                
                if (!cell.isExplored) continue; 
                
                if (!cell.isVisible) {
                    ctx.globalAlpha = 0.3;
                } else {
                    ctx.globalAlpha = 1.0;
                }
                
                if (cell.type === 'wall') {
                     spriteManagerRef.current.drawSprite(ctx, 'wall', drawX, drawY, TILE_SIZE);
                } else {
                     spriteManagerRef.current.drawSprite(ctx, 'floor', drawX, drawY, TILE_SIZE);
                     if (cell.type === 'stairs_down') {
                         spriteManagerRef.current.drawSprite(ctx, 'stairs', drawX, drawY, TILE_SIZE);
                     }
                }
                ctx.globalAlpha = 1.0;
            }
        }

        const renderList: RenderObject[] = [];
        
        renderList.push({
            type: 'player',
            y: playerPosRef.current.y,
            draw: (ctx, cx, cy) => {
                const px = Math.round(playerPosRef.current.x - cx);
                const py = Math.round(playerPosRef.current.y - cy);
                spriteManagerRef.current.drawSprite(ctx, 'player', px, py, TILE_SIZE);
            }
        });
        
        gameState.enemies.forEach(enemy => {
            const cell = gameState.dungeon.grid[enemy.position.y][enemy.position.x];
            if (!cell.isVisible) return;
            
            renderList.push({
                type: 'enemy',
                y: enemy.position.y * TILE_SIZE,
                draw: (ctx, cx, cy) => {
                    const ex = Math.round(enemy.position.x * TILE_SIZE - cx);
                    const ey = Math.round(enemy.position.y * TILE_SIZE - cy);
                    spriteManagerRef.current.drawSprite(ctx, 'enemy', ex, ey, TILE_SIZE, enemy.symbol);
                    const hpRatio = enemy.hp / enemy.maxHp;
                    ctx.fillStyle = 'red';
                    ctx.fillRect(ex, ey - 5, TILE_SIZE, 4);
                    ctx.fillStyle = 'lime';
                    ctx.fillRect(ex, ey - 5, TILE_SIZE * hpRatio, 4);
                }
            });
        });

        renderList.sort((a, b) => a.y - b.y);
        renderList.forEach(obj => obj.draw(ctx, camX, camY));

        visualManagerRef.current.draw(ctx, camX, camY);

        animationFrameRef.current = requestAnimationFrame(render);
    };
    
    animationFrameRef.current = requestAnimationFrame(render);
    return () => { cancelAnimationFrame(animationFrameRef.current); };
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
    </div>
  );
});
DungeonScene.displayName = 'DungeonScene';
