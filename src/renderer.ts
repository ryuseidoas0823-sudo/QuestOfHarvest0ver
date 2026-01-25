import { DungeonMap } from './types';
import { Enemy } from './types/enemy';
import { visualManager } from './utils/visualManager';

export const renderDungeon = (
  canvas: HTMLCanvasElement,
  map: DungeonMap,
  playerPos: { x: number, y: number },
  enemies: Enemy[]
) => {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const TILE_SIZE = 32;
  const VIEWPORT_WIDTH = canvas.width;
  const VIEWPORT_HEIGHT = canvas.height;
  
  // 画面クリア
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, VIEWPORT_WIDTH, VIEWPORT_HEIGHT);

  // カメラ位置（プレイヤー中心）
  const cameraX = playerPos.x * TILE_SIZE - VIEWPORT_WIDTH / 2;
  const cameraY = playerPos.y * TILE_SIZE - VIEWPORT_HEIGHT / 2;

  ctx.save();
  ctx.translate(-cameraX, -cameraY);

  // マップ描画
  map.forEach((row, y) => {
    row.forEach((tile, x) => {
      const posX = x * TILE_SIZE;
      const posY = y * TILE_SIZE;
      
      // 画面外カリング（簡易）
      if (posX < cameraX - TILE_SIZE || posX > cameraX + VIEWPORT_WIDTH ||
          posY < cameraY - TILE_SIZE || posY > cameraY + VIEWPORT_HEIGHT) {
          return;
      }

      if (tile === 'wall') {
        ctx.fillStyle = '#444';
        ctx.fillRect(posX, posY, TILE_SIZE, TILE_SIZE);
      } else if (tile === 'floor') {
        ctx.fillStyle = '#222';
        ctx.fillRect(posX, posY, TILE_SIZE, TILE_SIZE);
        ctx.strokeStyle = '#333';
        ctx.strokeRect(posX, posY, TILE_SIZE, TILE_SIZE);
      } else if (tile === 'stairs_down') {
        ctx.fillStyle = '#aaf';
        ctx.fillRect(posX, posY, TILE_SIZE, TILE_SIZE);
      }
    });
  });

  // 敵描画
  enemies.forEach(enemy => {
      ctx.fillStyle = 'red';
      ctx.fillRect(enemy.x * TILE_SIZE + 4, enemy.y * TILE_SIZE + 4, TILE_SIZE - 8, TILE_SIZE - 8);
  });

  // プレイヤー描画
  ctx.fillStyle = 'cyan';
  ctx.fillRect(playerPos.x * TILE_SIZE + 4, playerPos.y * TILE_SIZE + 4, TILE_SIZE - 8, TILE_SIZE - 8);

  ctx.restore();
};
