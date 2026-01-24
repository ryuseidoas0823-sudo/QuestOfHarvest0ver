import { DungeonMap, TileType } from './types';
import { EnemyInstance } from './types/enemy';
import { getSprite } from './assets/spriteManager';

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
      // 範囲外チェック
      if (y < 0 || y >= dungeon.height || x < 0 || x >= dungeon.width) {
          // マップ外は壁扱いなどで埋めてもよい
          continue;
      }

      const tile = dungeon.tiles[y][x];
      const screenX = Math.floor(x * TILE_SIZE - cameraX);
      const screenY = Math.floor(y * TILE_SIZE - cameraY);

      // マップチップの描画
      if (tile === 'wall') {
        const sprite = getSprite('wall');
        if (sprite) {
            ctx.drawImage(sprite, screenX, screenY, TILE_SIZE, TILE_SIZE);
        } else {
            // フォールバック
            ctx.fillStyle = '#444';
            ctx.fillRect(screenX, screenY, TILE_SIZE, TILE_SIZE);
        }
      } else if (tile === 'floor' || tile === 'stairs') {
        const sprite = getSprite('floor');
        if (sprite) {
            ctx.drawImage(sprite, screenX, screenY, TILE_SIZE, TILE_SIZE);
        } else {
            ctx.fillStyle = '#222';
            ctx.fillRect(screenX, screenY, TILE_SIZE, TILE_SIZE);
        }
        
        // 階段
        if (tile === 'stairs') {
            const stairsSprite = getSprite('stairs');
            if (stairsSprite) {
                ctx.drawImage(stairsSprite, screenX, screenY, TILE_SIZE, TILE_SIZE);
            } else {
                ctx.fillStyle = '#fbbf24';
                ctx.fillText('⚡', screenX + TILE_SIZE/2, screenY + TILE_SIZE/2);
            }
        }
      }
      
      // グリッド線（オプション）
      if (showGrid) {
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
          ctx.strokeRect(screenX, screenY, TILE_SIZE, TILE_SIZE);
      }
    }
  }

  // --- 敵・NPC・アイテム描画 ---
  // ソートしてY座標が小さい順（奥）から描画すると立体感が出るが、
  // 今回はトップダウンなので出現順で簡易処理
  enemies.forEach(enemy => {
    const screenX = Math.floor(enemy.x * TILE_SIZE - cameraX);
    const screenY = Math.floor(enemy.y * TILE_SIZE - cameraY);

    // 画面外スキップ
    if (screenX < -TILE_SIZE || screenX > width || screenY < -TILE_SIZE || screenY > height) return;

    // スプライト取得
    // enemy.id または enemy.assetId を使う
    // assetIdが未設定の場合はidから推測、それもなければtypeから推測
    const spriteKey = enemy.assetId || enemy.id.split('_')[0] || enemy.type;
    const sprite = getSprite(spriteKey) || getSprite('goblin'); // 最終フォールバック

    if (sprite) {
        // ボスは少し大きくするなどの調整
        let drawSize = TILE_SIZE;
        let drawOffset = 0;
        
        if (enemy.type === 'boss') {
            drawSize = TILE_SIZE * 1.5;
            drawOffset = (TILE_SIZE - drawSize) / 2;
        }

        ctx.drawImage(sprite, screenX + drawOffset, screenY + drawOffset, drawSize, drawSize);
    } else {
        // 画像がない場合の矩形描画
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
};
