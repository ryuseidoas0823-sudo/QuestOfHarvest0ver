import { DungeonMap, TileType } from './types';
import { EnemyInstance } from './types/enemy';
import { getSprite } from './assets/spriteManager';
import { visualManager } from './utils/visualManager';

export const TILE_SIZE = 40;

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

  ctx.imageSmoothingEnabled = false;

  const width = canvas.width;
  const height = canvas.height;

  // 背景クリア
  ctx.fillStyle = '#111';
  ctx.fillRect(0, 0, width, height);

  // カメラ位置計算
  const cameraX = playerPos.x * TILE_SIZE - width / 2 + TILE_SIZE / 2;
  const cameraY = playerPos.y * TILE_SIZE - height / 2 + TILE_SIZE / 2;

  const startX = Math.floor(cameraX / TILE_SIZE);
  const startY = Math.floor(cameraY / TILE_SIZE);
  const endX = startX + Math.ceil(width / TILE_SIZE) + 1;
  const endY = startY + Math.ceil(height / TILE_SIZE) + 1;

  // --- マップ描画 ---
  for (let y = startY; y < endY; y++) {
    for (let x = startX; x < endX; x++) {
      if (y < 0 || y >= dungeon.height || x < 0 || x >= dungeon.width) continue;

      // 視界チェック: 未探索エリアは描画しない (または暗くする)
      // ここでは完全に黒塗り（FOW）にする
      if (!dungeon.visited[y][x]) {
          ctx.fillStyle = '#000';
          const screenX = Math.floor(x * TILE_SIZE - cameraX);
          const screenY = Math.floor(y * TILE_SIZE - cameraY);
          ctx.fillRect(screenX, screenY, TILE_SIZE, TILE_SIZE);
          continue;
      }

      const tile = dungeon.tiles[y][x];
      const screenX = Math.floor(x * TILE_SIZE - cameraX);
      const screenY = Math.floor(y * TILE_SIZE - cameraY);

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

  // --- 敵・NPC描画 (視界内のみ) ---
  enemies.forEach(enemy => {
    // 視界外の敵は見えない
    if (enemy.y >= 0 && enemy.y < dungeon.height && enemy.x >= 0 && enemy.x < dungeon.width) {
        if (!dungeon.visited[enemy.y][enemy.x]) return;
    }

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

  // --- エフェクト・ポップアップ ---
  visualManager.effects.forEach(effect => {
      const screenX = Math.floor(effect.x * TILE_SIZE - cameraX);
      const screenY = Math.floor(effect.y * TILE_SIZE - cameraY);
      if (screenX < -TILE_SIZE || screenX > width || screenY < -TILE_SIZE || screenY > height) return;
      const spriteKey = `effect_${effect.type}`;
      const sprite = getSprite(spriteKey);
      if (sprite) {
          ctx.globalAlpha = effect.life;
          ctx.drawImage(sprite, screenX, screenY, TILE_SIZE, TILE_SIZE);
          ctx.globalAlpha = 1.0;
      }
  });

  ctx.font = 'bold 20px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  visualManager.popups.forEach(popup => {
      const screenX = Math.floor(popup.x * TILE_SIZE - cameraX + TILE_SIZE / 2);
      const screenY = Math.floor(popup.y * TILE_SIZE - cameraY);
      if (screenX < -100 || screenX > width + 100 || screenY < -100 || screenY > height + 100) return;
      ctx.globalAlpha = popup.life;
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#000';
      ctx.strokeText(popup.text, screenX, screenY);
      ctx.fillStyle = popup.color;
      ctx.fillText(popup.text, screenX, screenY);
      ctx.globalAlpha = 1.0;
  });

  // ==========================================
  // ミニマップ描画 (画面右下)
  // ==========================================
  const mmScale = 3; // ミニマップの1タイルのサイズ
  const mmW = dungeon.width * mmScale;
  const mmH = dungeon.height * mmScale;
  const mmX = width - mmW - 10;
  const mmY = height - mmH - 10;

  // 背景
  ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
  ctx.fillRect(mmX - 2, mmY - 2, mmW + 4, mmH + 4);
  ctx.strokeStyle = '#666';
  ctx.strokeRect(mmX - 2, mmY - 2, mmW + 4, mmH + 4);

  for (let y = 0; y < dungeon.height; y++) {
      for (let x = 0; x < dungeon.width; x++) {
          if (!dungeon.visited[y][x]) continue; // 未探索は描画しない

          const tile = dungeon.tiles[y][x];
          if (tile === 'floor') {
              ctx.fillStyle = '#555';
              ctx.fillRect(mmX + x * mmScale, mmY + y * mmScale, mmScale, mmScale);
          } else if (tile === 'stairs') {
              ctx.fillStyle = '#fbbf24';
              ctx.fillRect(mmX + x * mmScale, mmY + y * mmScale, mmScale, mmScale);
          }
      }
  }

  // プレイヤー位置 (点滅などさせても良いがシンプルに青)
  ctx.fillStyle = '#3b82f6';
  ctx.fillRect(mmX + playerPos.x * mmScale, mmY + playerPos.y * mmScale, mmScale, mmScale);
};
