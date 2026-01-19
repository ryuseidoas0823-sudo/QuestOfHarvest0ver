import { GameState } from './types';

/**
 * ゲーム画面の描画クラス
 * Canvas APIを使用してワールド、エンティティ、エフェクトを描画します。
 */
export class GameRenderer {
  private ctx: CanvasRenderingContext2D;
  private canvas: HTMLCanvasElement;
  private tileSize: number = 48;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
  }

  public render(state: GameState) {
    const { ctx, canvas, tileSize } = this;
    const { player, worldMap, enemies, camera } = state;

    // 背景クリア
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // カメラオフセットの計算 (カメラが未定義の場合はプレイヤー中心)
    const camX = camera?.x ?? player.x;
    const camY = camera?.y ?? player.y;
    const offsetX = canvas.width / 2 - camX * tileSize;
    const offsetY = canvas.height / 2 - camY * tileSize;

    // 1. ワールドマップ描画
    if (worldMap) {
      for (let y = 0; y < worldMap.length; y++) {
        for (let x = 0; x < worldMap[y].length; x++) {
          const tile = worldMap[y][x];
          ctx.fillStyle = tile === 1 ? '#2563eb' : '#065f46';
          ctx.fillRect(x * tileSize + offsetX, y * tileSize + offsetY, tileSize, tileSize);
          
          // グリッド線
          ctx.strokeStyle = 'rgba(0,0,0,0.1)';
          ctx.strokeRect(x * tileSize + offsetX, y * tileSize + offsetY, tileSize, tileSize);
        }
      }
    }

    // 2. ドロップアイテム描画
    state.droppedItems?.forEach(item => {
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(item.x * tileSize + offsetX + tileSize / 2, item.y * tileSize + offsetY + tileSize / 2, 4, 0, Math.PI * 2);
      ctx.fill();
    });

    // 3. 敵キャラクター描画
    enemies.forEach(enemy => {
      this.drawEntity(ctx, enemy, offsetX, offsetY);
    });

    // 4. プレイヤー描画
    this.drawEntity(ctx, player, offsetX, offsetY);

    // 5. パーティクル
    state.particles?.forEach(p => {
      ctx.fillStyle = p.color || '#fff';
      ctx.globalAlpha = p.life || 1;
      ctx.fillRect(p.x * tileSize + offsetX, p.y * tileSize + offsetY, 2, 2);
    });
    ctx.globalAlpha = 1.0;

    // 6. フローティングテキスト
    state.floatingTexts?.forEach(t => {
      ctx.fillStyle = t.color || '#fff';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText(t.text, t.x * tileSize + offsetX, t.y * tileSize + offsetY);
    });
  }

  private drawEntity(ctx: CanvasRenderingContext2D, entity: any, offsetX: number, offsetY: number) {
    const { tileSize } = this;
    const x = entity.x * tileSize + offsetX;
    const y = entity.y * tileSize + offsetY;

    // 反転処理 (direction が 'left' の場合)
    ctx.save();
    if (entity.direction === 'left') {
      ctx.translate(x + tileSize, y);
      ctx.scale(-1, 1);
      ctx.translate(-x, -y);
    }

    // エンティティの本体 (プレースホルダーまたは色付き矩形)
    ctx.fillStyle = entity.color || (entity.id === 'player-1' ? '#3b82f6' : '#ef4444');
    const vWidth = entity.visualWidth || tileSize;
    const vHeight = entity.visualHeight || tileSize;
    ctx.fillRect(x + (tileSize - vWidth) / 2, y + (tileSize - vHeight), vWidth, vHeight);

    ctx.restore();

    // HPバー
    if (entity.hp < entity.maxHp) {
      const barW = tileSize * 0.8;
      const barH = 4;
      const barX = x + (tileSize - barW) / 2;
      const barY = y - 10;
      
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(barX, barY, barW, barH);
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(barX, barY, barW * (entity.hp / entity.maxHp), barH);
    }
  }
}
