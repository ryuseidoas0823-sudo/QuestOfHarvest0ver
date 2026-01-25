import { DungeonMap } from './types';
import { EnemyInstance } from './types/enemy';
import { getSprite } from './assets/spriteManager';
import { visualManager } from './utils/visualManager';
import { JobId } from './types/job';

export const TILE_SIZE = 32;

/**
 * ダンジョンを描画する
 */
export const renderDungeon = (
  canvas: HTMLCanvasElement,
  map: DungeonMap,
  playerPos: { x: number; y: number },
  enemies: EnemyInstance[],
  playerJobId?: string // 追加
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

      // タイル描画
      let spriteKey = 'wall';
      if (tile === 'floor') spriteKey = 'floor';
      else if (tile === 'stairs_down') spriteKey = 'stairs';
      else if (tile === 'carpet_red') spriteKey = 'carpet_red';
      else if (tile === 'wall') spriteKey = 'wall';

      const sprite = getSprite(spriteKey);
      if (sprite) {
        ctx.drawImage(sprite, posX, posY, TILE_SIZE, TILE_SIZE);
      } else {
        // フォールバック
        ctx.fillStyle = tile === 'wall' ? '#444' : '#222';
        ctx.fillRect(posX, posY, TILE_SIZE, TILE_SIZE);
      }
    });
  });

  // 敵描画
  enemies.forEach(enemy => {
      const ex = enemy.x;
      const ey = enemy.y;
      const screenX = ex * TILE_SIZE;
      const screenY = ey * TILE_SIZE;

      if (screenX < cameraX - TILE_SIZE || screenX > cameraX + width ||
          screenY < cameraY - TILE_SIZE || screenY > cameraY + height) {
          return;
      }

      const spriteKey = enemy.assetId || enemy.id.split('_')[0] || enemy.type;
      const sprite = getSprite(spriteKey) || getSprite('goblin');

      if (sprite) {
          // 少し大きく描画して迫力を出す (32x32 -> 36x36 などを中心合わせで)
          const offset = (36 - TILE_SIZE) / 2;
          ctx.drawImage(sprite, screenX - offset, screenY - offset, 36, 36);
      } else {
          ctx.fillStyle = 'red';
          ctx.fillRect(screenX + 4, screenY + 4, TILE_SIZE - 8, TILE_SIZE - 8);
      }
      
      const hpPercent = enemy.hp / enemy.stats.maxHp;
      ctx.fillStyle = '#000';
      ctx.fillRect(screenX, screenY - 6, TILE_SIZE, 4);
      ctx.fillStyle = enemy.faction === 'player_ally' ? '#22c55e' : '#dc2626';
      ctx.fillRect(screenX, screenY - 6, TILE_SIZE * hpPercent, 4);
  });

  // プレイヤー描画
  const playerScreenX = playerPos.x * TILE_SIZE;
  const playerScreenY = playerPos.y * TILE_SIZE;
  
  // ジョブに応じたスプライトキーの決定
  let playerSpriteKey = 'hero_warrior'; // デフォルト
  if (playerJobId === 'mage') playerSpriteKey = 'hero_mage';
  else if (playerJobId === 'archer') playerSpriteKey = 'hero_archer';
  else if (playerJobId === 'cleric') playerSpriteKey = 'hero_cleric';
  else if (playerJobId === 'warrior') playerSpriteKey = 'hero_warrior';
  
  const playerSprite = getSprite(playerSpriteKey) || getSprite('player');
  
  if (playerSprite) {
      // プレイヤーも少し強調
      const offset = (40 - TILE_SIZE) / 2;
      ctx.drawImage(playerSprite, playerScreenX - offset, playerScreenY - offset, 40, 40);
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
      const screenY = popup.y * TILE_SIZE - (1.0 - popup.life) * 20; // 少し上に移動させるアニメーション
      
      ctx.globalAlpha = popup.life;
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#000';
      ctx.strokeText(popup.text, screenX, screenY);
      ctx.fillStyle = popup.color;
      ctx.fillText(popup.text, screenX, screenY);
      ctx.globalAlpha = 1.0;
  });

  ctx.restore();
};
