import { DungeonMap, TileType } from './types';
import { EnemyInstance } from './types/enemy';
import { getSprite } from './assets/spriteManager';
import { visualManager } from './utils/visualManager'; // 追加

export const TILE_SIZE = 40; // タイルサイズ

/**
 * ダンジョンを描画する
 */
export const renderDungeon = (
  canvas: HTMLCanvasElement,
  dungeon: DungeonMap,
  playerPos: { x: number; y: number },
  enemies: EnemyInstance[],
  showGrid: boolean = true
) => {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // ドット絵をくっきり表示するための設定
  ctx.imageSmoothingEnabled = false;

  const width = canvas.width;
  const height = canvas.height;

  // 背景クリア（暗い色で埋める）
  ctx.fillStyle = '#111';
  ctx.fillRect(0, 0, width, height);

  // カメラ位置計算 (プレイヤー中心)
  const cameraX = playerPos.x * TILE_SIZE - width / 2 + TILE_SIZE / 2;
  const cameraY = playerPos.y * TILE_SIZE - height / 2 + TILE_SIZE / 2;

  // 描画範囲の計算
  const startX = Math.floor(cameraX / TILE_SIZE);
  const startY = Math.floor(cameraY / TILE_SIZE);
  const endX = startX + Math.ceil(width / TILE_SIZE) + 1;
  const endY = startY + Math.ceil(height / TILE_SIZE) + 1;

  // --- マップ描画 ---
  for (let y = startY; y < endY; y++) {
    for (let x = startX; x < endX; x++) {
      if (y < 0 || y >= dungeon.height || x < 0 || x >= dungeon.width) continue;

      const tile = dungeon.tiles[y][x];
      const screenX = Math.floor(x * TILE_SIZE - cameraX);
      const screenY = Math.floor(y * TILE_SIZE - cameraY);

      // マップチップの描画
      if (tile === 'wall') {
        const sprite = getSprite('wall');
        if (sprite) ctx.drawImage(sprite, screenX, screenY, TILE_SIZE, TILE_SIZE);
        else {
            ctx.fillStyle = '#444';
            ctx.fillRect(screenX, screenY, TILE_SIZE, TILE_SIZE);
        }
      } else if (tile === 'floor' || tile === 'stairs') {
        const sprite = getSprite('floor');
        if (sprite) ctx.drawImage(sprite, screenX, screenY, TILE_SIZE, TILE_SIZE);
        else {
            ctx.fillStyle = '#222';
            ctx.fillRect(screenX, screenY, TILE_SIZE, TILE_SIZE);
        }
        
        if (tile === 'stairs') {
            const stairsSprite = getSprite('stairs');
            if (stairsSprite) ctx.drawImage(stairsSprite, screenX, screenY, TILE_SIZE, TILE_SIZE);
            else {
                ctx.fillStyle = '#fbbf24';
                ctx.fillText('⚡', screenX + TILE_SIZE/2, screenY + TILE_SIZE/2);
            }
        }
      }
      
      if (showGrid) {
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
          ctx.strokeRect(screenX, screenY, TILE_SIZE, TILE_SIZE);
      }
    }
  }

  // --- 敵・NPC・アイテム描画 ---
  enemies.forEach(enemy => {
    const screenX = Math.floor(enemy.x * TILE_SIZE - cameraX);
    const screenY = Math.floor(enemy.y * TILE_SIZE - cameraY);

    if (screenX < -TILE_SIZE || screenX > width || screenY < -TILE_SIZE || screenY > height) return;

    const spriteKey = enemy.assetId || enemy.id.split('_')[0] || enemy.type;
    const sprite = getSprite(spriteKey) || getSprite('goblin');

    if (sprite) {
        let drawSize = TILE_SIZE;
        let drawOffset = 0;
        
        if (enemy.type === 'boss') {
            drawSize = TILE_SIZE * 1.5;
            drawOffset = (TILE_SIZE - drawSize) / 2;
        }
        ctx.drawImage(sprite, screenX + drawOffset, screenY + drawOffset, drawSize, drawSize);
    } else {
        ctx.fillStyle = enemy.faction === 'player_ally' ? '#4ade80' : '#f87171';
        ctx.fillRect(screenX + 4, screenY + 4, TILE_SIZE - 8, TILE_SIZE - 8);
    }

    // HPバー
    const hpPercent = enemy.hp / enemy.maxHp;
    ctx.fillStyle = '#000';
    ctx.fillRect(screenX, screenY - 6, TILE_SIZE, 4);
    ctx.fillStyle = enemy.faction === 'player_ally' ? '#22c55e' : '#dc2626';
    ctx.fillRect(screenX, screenY - 6, TILE_SIZE * hpPercent, 4);
  });

  // --- プレイヤー描画 ---
  const playerScreenX = Math.floor(playerPos.x * TILE_SIZE - cameraX);
  const playerScreenY = Math.floor(playerPos.y * TILE_SIZE - cameraY);
  
  const playerSprite = getSprite('player');
  if (playerSprite) {
      ctx.drawImage(playerSprite, playerScreenX, playerScreenY, TILE_SIZE, TILE_SIZE);
  } else {
      ctx.fillStyle = '#3b82f6';
      ctx.beginPath();
      ctx.arc(playerScreenX + TILE_SIZE / 2, playerScreenY + TILE_SIZE / 2, TILE_SIZE * 0.35, 0, Math.PI * 2);
      ctx.fill();
  }

  // ==========================================
  // エフェクト・ポップアップ描画 (最前面)
  // ==========================================
  
  // 1. ビジュアルエフェクト (スプライト)
  visualManager.effects.forEach(effect => {
      const screenX = Math.floor(effect.x * TILE_SIZE - cameraX);
      const screenY = Math.floor(effect.y * TILE_SIZE - cameraY);
      
      // 画面外判定
      if (screenX < -TILE_SIZE || screenX > width || screenY < -TILE_SIZE || screenY > height) return;

      const spriteKey = `effect_${effect.type}`;
      const sprite = getSprite(spriteKey);
      
      if (sprite) {
          ctx.globalAlpha = effect.life; // フェードアウト
          ctx.drawImage(sprite, screenX, screenY, TILE_SIZE, TILE_SIZE);
          ctx.globalAlpha = 1.0;
      }
  });

  // 2. ダメージポップアップ (テキスト)
  ctx.font = 'bold 20px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  visualManager.popups.forEach(popup => {
      const screenX = Math.floor(popup.x * TILE_SIZE - cameraX + TILE_SIZE / 2);
      const screenY = Math.floor(popup.y * TILE_SIZE - cameraY); // 上昇済みY座標

      if (screenX < -100 || screenX > width + 100 || screenY < -100 || screenY > height + 100) return;

      ctx.globalAlpha = popup.life;
      
      // 縁取り
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#000';
      ctx.strokeText(popup.text, screenX, screenY);
      
      // 本体
      ctx.fillStyle = popup.color;
      ctx.fillText(popup.text, screenX, screenY);
      
      ctx.globalAlpha = 1.0;
  });
};
