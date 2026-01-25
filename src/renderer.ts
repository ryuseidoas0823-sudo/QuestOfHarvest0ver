import { DungeonMap } from './types';
import { EnemyInstance } from './types/enemy';
import { getSprite } from './assets/spriteManager';
import { visualManager } from './utils/visualManager';

export const TILE_SIZE = 32;

/**
 * ダンジョンを描画する
 */
export const renderDungeon = (
  canvas: HTMLCanvasElement,
  map: DungeonMap, // dungeon -> map に変数名を変更して整合性を取るか、引数名を合わせる
  playerPos: { x: number; y: number },
  enemies: EnemyInstance[]
) => {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const width = canvas.width;
  const height = canvas.height;

  // 背景クリア
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, width, height);

  // カメラ位置計算
  const cameraX = playerPos.x * TILE_SIZE - width / 2;
  const cameraY = playerPos.y * TILE_SIZE - height / 2;

  ctx.save();
  ctx.translate(-cameraX, -cameraY);

  // マップ描画
  map.tiles.forEach((row, y) => {
    row.forEach((tile, x) => {
      const posX = x * TILE_SIZE;
      const posY = y * TILE_SIZE;
      
      // 画面外カリング
      if (posX < cameraX - TILE_SIZE || posX > cameraX + width ||
          posY < cameraY - TILE_SIZE || posY > cameraY + height) {
          return;
      }

      if (tile === 'wall') {
        const sprite = getSprite('wall');
        if (sprite) ctx.drawImage(sprite, posX, posY, TILE_SIZE, TILE_SIZE);
        else {
            ctx.fillStyle = '#444';
            ctx.fillRect(posX, posY, TILE_SIZE, TILE_SIZE);
        }
      } else if (tile === 'floor' || tile === 'stairs_down') {
        const sprite = getSprite('floor');
        if (sprite) ctx.drawImage(sprite, posX, posY, TILE_SIZE, TILE_SIZE);
        else {
            ctx.fillStyle = '#222';
            ctx.fillRect(posX, posY, TILE_SIZE, TILE_SIZE);
            ctx.strokeStyle = '#333';
            ctx.strokeRect(posX, posY, TILE_SIZE, TILE_SIZE);
        }
        
        if (tile === 'stairs_down') {
            const stairsSprite = getSprite('stairs');
            if (stairsSprite) ctx.drawImage(stairsSprite, posX, posY, TILE_SIZE, TILE_SIZE);
            else {
                ctx.fillStyle = '#aaf';
                ctx.fillRect(posX, posY, TILE_SIZE, TILE_SIZE);
            }
        }
      }
    });
  });

  // 敵描画 (視界内チェックはgameLogic側で行うか、ここで行う)
  enemies.forEach(enemy => {
      // 座標は EnemyInstance に含まれている (x, y)
      const ex = enemy.x;
      const ey = enemy.y;

      const screenX = ex * TILE_SIZE;
      const screenY = ey * TILE_SIZE;

      // カリング
      if (screenX < cameraX - TILE_SIZE || screenX > cameraX + width ||
          screenY < cameraY - TILE_SIZE || screenY > cameraY + height) {
          return;
      }

      const spriteKey = enemy.assetId || enemy.id.split('_')[0] || enemy.type;
      const sprite = getSprite(spriteKey) || getSprite('goblin');

      if (sprite) {
          ctx.drawImage(sprite, screenX, screenY, TILE_SIZE, TILE_SIZE);
      } else {
          ctx.fillStyle = enemy.faction === 'player_ally' ? '#4ade80' : 'red';
          ctx.fillRect(screenX + 4, screenY + 4, TILE_SIZE - 8, TILE_SIZE - 8);
      }
      
      // HPバー
      const hpPercent = enemy.hp / enemy.stats.maxHp;
      ctx.fillStyle = '#000';
      ctx.fillRect(screenX, screenY - 6, TILE_SIZE, 4);
      ctx.fillStyle = enemy.faction === 'player_ally' ? '#22c55e' : '#dc2626';
      ctx.fillRect(screenX, screenY - 6, TILE_SIZE * hpPercent, 4);
  });

  // プレイヤー描画
  const playerScreenX = playerPos.x * TILE_SIZE;
  const playerScreenY = playerPos.y * TILE_SIZE;
  
  const playerSprite = getSprite('player');
  if (playerSprite) {
      ctx.drawImage(playerSprite, playerScreenX, playerScreenY, TILE_SIZE, TILE_SIZE);
  } else {
      ctx.fillStyle = 'cyan';
      ctx.fillRect(playerScreenX + 4, playerScreenY + 4, TILE_SIZE - 8, TILE_SIZE - 8);
  }

  // エフェクト描画
  visualManager.effects.forEach(effect => {
      const screenX = effect.x * TILE_SIZE;
      const screenY = effect.y * TILE_SIZE;
      const spriteKey = `effect_${effect.type}`;
      const sprite = getSprite(spriteKey);
      
      if (sprite) {
          ctx.globalAlpha = effect.life;
          ctx.drawImage(sprite, screenX, screenY, TILE_SIZE, TILE_SIZE);
          ctx.globalAlpha = 1.0;
      }
  });

  // ポップアップ描画
  ctx.font = 'bold 16px monospace';
  ctx.textAlign = 'center';
  
  visualManager.popups.forEach(popup => {
      const screenX = popup.x * TILE_SIZE + TILE_SIZE / 2;
      const screenY = popup.y * TILE_SIZE;
      
      ctx.globalAlpha = popup.life;
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#000';
      ctx.strokeText(popup.text, screenX, screenY);
      ctx.fillStyle = popup.color;
      ctx.fillText(popup.text, screenX, screenY);
      ctx.globalAlpha = 1.0;
  });

  ctx.restore();
};import { DungeonMap } from './types';
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
