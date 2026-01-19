import { GameState, TileType } from './types';
import { THEME, GAME_CONFIG } from './config';

const pseudoRandom = (x: number, y: number) => {
  const sin = Math.sin(x * 12.9898 + y * 78.233);
  return (sin * 43758.5453) - Math.floor(sin * 43758.5453);
};

export const renderGame = (
  ctx: CanvasRenderingContext2D,
  state: GameState,
  _assets: Record<string, HTMLImageElement>
) => {
  const { width, height } = ctx.canvas;
  const tileSize = GAME_CONFIG.TILE_SIZE;
  const { player, map, camera } = state;

  const targetCamX = player.x + player.width / 2 - width / 2;
  const targetCamY = player.y + player.height / 2 - height / 2;
  camera.x += (targetCamX - camera.x) * 0.1;
  camera.y += (targetCamY - camera.y) * 0.1;

  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, width, height);

  const startCol = Math.floor(camera.x / tileSize);
  const endCol = startCol + (width / tileSize) + 1;
  const startRow = Math.floor(camera.y / tileSize);
  const endRow = startRow + (height / tileSize) + 1;
  
  const offsetX = -camera.x + startCol * tileSize;
  const offsetY = -camera.y + startRow * tileSize;

  for (let c = startCol; c <= endCol; c++) {
    for (let r = startRow; r <= endRow; r++) {
      if (r >= 0 && r < map.length && c >= 0 && c < map[0].length) {
        const tile = map[r][c];
        const x = (c - startCol) * tileSize + offsetX;
        const y = (r - startRow) * tileSize + offsetY;
        drawTile(ctx, tile.type, x, y, tileSize, c, r);
      }
    }
  }

  const renderList: { y: number, draw: () => void }[] = [];

  // プレイヤーの描画
  renderList.push({
    y: player.y + player.height,
    draw: () => {
      const dx = player.x - camera.x;
      const dy = player.y - camera.y;
      
      const bob = player.isMoving ? Math.abs(Math.sin(player.animFrame || 0)) * 6 : 0;
      const scaleX = player.isMoving ? 1 + Math.sin(player.animFrame || 0) * 0.1 : 1;

      // 影
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.beginPath();
      ctx.ellipse(dx + player.width/2, dy + player.height, player.width/2, 4, 0, 0, Math.PI*2);
      ctx.fill();

      // 本体
      ctx.save();
      ctx.translate(dx + player.width/2, dy + player.height);
      ctx.scale(scaleX, 1);
      ctx.fillStyle = player.color;
      // 足元をtranslateの中心にしているため、y座標は-height
      ctx.fillRect(-player.width/2, -player.height - bob, player.width, player.height);
      ctx.restore();

      // 攻撃エフェクト
      if (player.isAttacking) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.lineWidth = 4;
        ctx.beginPath();
        const cx = dx + player.width/2;
        const cy = dy + player.height/2;
        let startAngle = 0;
        switch(player.direction) {
            case 0: startAngle = -Math.PI/4; break;
            case 1: startAngle = Math.PI/4; break;
            case 2: startAngle = 3*Math.PI/4; break;
            case 3: startAngle = -3*Math.PI/4; break;
        }
        ctx.arc(cx, cy, 45, startAngle, startAngle + Math.PI/2);
        ctx.stroke();
      }
    }
  });

  // 敵の描画
  state.enemies.forEach((enemy: any) => {
    renderList.push({
      y: enemy.y + enemy.height,
      draw: () => {
        const dx = enemy.x - camera.x;
        const dy = enemy.y - camera.y;
        const bob = enemy.isMoving ? Math.abs(Math.sin(enemy.animFrame || 0)) * 4 : 0;

        // 影
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.ellipse(dx + enemy.width/2, dy + enemy.height, enemy.width/2, 4, 0, 0, Math.PI*2);
        ctx.fill();

        // 本体
        ctx.fillStyle = enemy.color;
        if (enemy.rank === 'Boss') {
            ctx.shadowColor = enemy.color;
            ctx.shadowBlur = 15;
        }
        ctx.fillRect(dx, dy - bob, enemy.width, enemy.height);
        ctx.shadowBlur = 0;

        // HPバー
        const hpRatio = Math.max(0, enemy.hp / enemy.maxHp);
        ctx.fillStyle = '#f00'; ctx.fillRect(dx, dy - 12, enemy.width, 4);
        ctx.fillStyle = '#0f0'; ctx.fillRect(dx, dy - 12, enemy.width * hpRatio, 4);
      }
    });
  });

  renderList.sort((a, b) => a.y - b.y).forEach(obj => obj.draw());

  state.floatingTexts.forEach((text: any) => {
      ctx.font = 'bold 18px "Segoe UI", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = text.color;
      ctx.fillText(text.text, text.x - camera.x, text.y - camera.y);
  });
};

const drawTile = (ctx: CanvasRenderingContext2D, type: TileType, x: number, y: number, size: number, gridX: number, gridY: number) => {
    const colorMap: Record<string, string> = {
      grass: THEME.colors.grass,
      dirt: THEME.colors.ground,
      floor: THEME.colors.townFloor,
      wall: THEME.colors.wall,
      water: THEME.colors.water,
      rock: '#334155',
      tree: '#064e3b',
      sand: '#fef08a',
      snow: '#f8fafc',
      town_entrance: '#fbbf24',
      dungeon_entrance: '#7c2d12',
      portal_out: '#6366f1'
    };

    const baseColor = colorMap[type] || '#ff00ff';
    ctx.fillStyle = baseColor;
    ctx.fillRect(x, y, size, size);

    const rand = pseudoRandom(gridX, gridY);
    if (type === 'grass' && rand > 0.8) {
        ctx.fillStyle = 'rgba(255,255,255,0.1)';
        ctx.fillRect(x + rand * size, y + (1-rand) * size, 2, 2);
    }
    if (type === 'dirt') {
        ctx.fillStyle = 'rgba(0,0,0,0.05)';
        ctx.fillRect(x + rand * size, y + size/2, 4, 4);
    }
};
