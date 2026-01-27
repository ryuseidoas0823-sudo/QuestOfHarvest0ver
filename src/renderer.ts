import { GameState } from './types/gameState';
import { DungeonMap, Chest } from './types';

export class Renderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private tileSize: number = 32;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());
  }

  private resizeCanvas() {
    // コンテナサイズに合わせてリサイズする処理があればここに
    // 今回は固定サイズまたはCSS制御とする
  }

  public render(gameState: GameState) {
    const { dungeon, player, enemies } = gameState;
    if (!dungeon) return;

    // キャンバスをクリア
    this.ctx.fillStyle = '#000';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // カメラ位置計算 (プレイヤー中心)
    const camX = player.position.x * this.tileSize - this.canvas.width / 2 + this.tileSize / 2;
    const camY = player.position.y * this.tileSize - this.canvas.height / 2 + this.tileSize / 2;

    this.ctx.save();
    this.ctx.translate(-Math.floor(camX), -Math.floor(camY));

    // マップ描画
    this.renderMap(dungeon);

    // 宝箱描画
    this.renderChests(dungeon.chests);

    // 敵描画
    enemies.forEach(enemy => {
        this.ctx.fillStyle = enemy.color || 'red';
        this.ctx.fillRect(
            enemy.position.x * this.tileSize + 4,
            enemy.position.y * this.tileSize + 4,
            this.tileSize - 8,
            this.tileSize - 8
        );
        // HPバーなど簡易表示
    });

    // プレイヤー描画
    this.ctx.fillStyle = 'cyan';
    this.ctx.beginPath();
    this.ctx.arc(
        player.position.x * this.tileSize + this.tileSize / 2,
        player.position.y * this.tileSize + this.tileSize / 2,
        this.tileSize / 3,
        0,
        Math.PI * 2
    );
    this.ctx.fill();
    
    // 向いている方向
    // ...

    this.ctx.restore();
  }

  private renderMap(dungeon: DungeonMap) {
    const { width, height, tiles } = dungeon;
    
    // 描画範囲の最適化（画面内のみ描画）は省略し、全体または簡易カリングを行う
    // 本来は player position から計算した範囲のみループする

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const tile = tiles[y][x];
        if (tile === 1) { // 床
          this.ctx.fillStyle = '#222';
          this.ctx.fillRect(x * this.tileSize, y * this.tileSize, this.tileSize, this.tileSize);
          this.ctx.strokeStyle = '#333';
          this.ctx.strokeRect(x * this.tileSize, y * this.tileSize, this.tileSize, this.tileSize);
        } else {
          // 壁は描画しない（背景色）か、壁色を塗る
          // this.ctx.fillStyle = '#111';
          // this.ctx.fillRect(x * this.tileSize, y * this.tileSize, this.tileSize, this.tileSize);
        }
      }
    }
  }

  private renderChests(chests: Chest[]) {
    chests.forEach(chest => {
        if (chest.isOpened) {
            // 開いた宝箱
            this.ctx.fillStyle = '#555'; // 暗い色
            this.ctx.fillRect(
                chest.position.x * this.tileSize + 8,
                chest.position.y * this.tileSize + 8,
                this.tileSize - 16,
                this.tileSize - 16
            );
        } else {
            // 閉じた宝箱
            this.ctx.fillStyle = chest.type === 'gold' ? '#FFD700' : (chest.type === 'silver' ? '#C0C0C0' : '#8B4513');
            this.ctx.fillRect(
                chest.position.x * this.tileSize + 6,
                chest.position.y * this.tileSize + 6,
                this.tileSize - 12,
                this.tileSize - 12
            );
            // 枠線
            this.ctx.strokeStyle = '#FFF';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(
                chest.position.x * this.tileSize + 6,
                chest.position.y * this.tileSize + 6,
                this.tileSize - 12,
                this.tileSize - 12
            );
        }
    });
  }
}
