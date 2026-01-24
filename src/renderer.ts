import { DungeonMap, TileType } from './types';
import { EnemyInstance } from './types/enemy';

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

  const width = canvas.width;
  const height = canvas.height;

  // 背景クリア
  ctx.fillStyle = '#1a1a1a'; // 暗いグレー
  ctx.fillRect(0, 0, width, height);

  // カメラ位置計算 (プレイヤー中心)
  const cameraX = playerPos.x * TILE_SIZE - width / 2 + TILE_SIZE / 2;
  const cameraY = playerPos.y * TILE_SIZE - height / 2 + TILE_SIZE / 2;

  // マップ描画
  const startX = Math.floor(cameraX / TILE_SIZE);
  const startY = Math.floor(cameraY / TILE_SIZE);
  const endX = startX + Math.ceil(width / TILE_SIZE) + 1;
  const endY = startY + Math.ceil(height / TILE_SIZE) + 1;

  for (let y = startY; y < endY; y++) {
    for (let x = startX; x < endX; x++) {
      if (y < 0 || y >= dungeon.height || x < 0 || x >= dungeon.width) continue;

      const tile = dungeon.tiles[y][x];
      const screenX = x * TILE_SIZE - cameraX;
      const screenY = y * TILE_SIZE - cameraY;

      if (tile === 'wall') {
        ctx.fillStyle = '#333';
        ctx.fillRect(screenX, screenY, TILE_SIZE, TILE_SIZE);
        ctx.strokeStyle = '#444';
        if (showGrid) ctx.strokeRect(screenX, screenY, TILE_SIZE, TILE_SIZE);
      } else if (tile === 'floor' || tile === 'stairs') {
        ctx.fillStyle = '#555';
        ctx.fillRect(screenX, screenY, TILE_SIZE, TILE_SIZE);
        ctx.strokeStyle = '#666';
        if (showGrid) ctx.strokeRect(screenX, screenY, TILE_SIZE, TILE_SIZE);
        
        if (tile === 'stairs') {
            ctx.fillStyle = '#fbbf24'; // 階段（黄色）
            ctx.font = '20px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('⚡', screenX + TILE_SIZE / 2, screenY + TILE_SIZE / 2);
        }
      }
    }
  }

  // 敵・NPC描画
  enemies.forEach(enemy => {
    const screenX = enemy.x * TILE_SIZE - cameraX;
    const screenY = enemy.y * TILE_SIZE - cameraY;

    // 画面外スキップ
    if (screenX < -TILE_SIZE || screenX > width || screenY < -TILE_SIZE || screenY > height) return;

    // Factionに応じた色分け
    if (enemy.faction === 'player_ally') {
        ctx.fillStyle = '#4ade80'; // 味方NPC: 明るい緑
    } else if (enemy.type === 'boss') {
        ctx.fillStyle = '#ef4444'; // ボス: 赤
    } else {
        ctx.fillStyle = '#f87171'; // 通常敵: 薄い赤
    }

    // サイズ調整（ボスは大きく）
    const size = enemy.type === 'boss' ? TILE_SIZE * 0.9 : TILE_SIZE * 0.7;
    const offset = (TILE_SIZE - size) / 2;

    ctx.fillRect(screenX + offset, screenY + offset, size, size);

    // HPバー (簡易)
    const hpPercent = enemy.hp / enemy.maxHp;
    ctx.fillStyle = '#000';
    ctx.fillRect(screenX, screenY - 5, TILE_SIZE, 4);
    ctx.fillStyle = enemy.faction === 'player_ally' ? '#22c55e' : '#dc2626';
    ctx.fillRect(screenX, screenY - 5, TILE_SIZE * hpPercent, 4);
  });

  // プレイヤー描画
  const playerScreenX = playerPos.x * TILE_SIZE - cameraX;
  const playerScreenY = playerPos.y * TILE_SIZE - cameraY;
  
  ctx.fillStyle = '#3b82f6'; // プレイヤー: 青
  ctx.beginPath();
  ctx.arc(playerScreenX + TILE_SIZE / 2, playerScreenY + TILE_SIZE / 2, TILE_SIZE * 0.35, 0, Math.PI * 2);
  ctx.fill();
  
  // プレイヤーの向きや装飾があればここで追加
};
