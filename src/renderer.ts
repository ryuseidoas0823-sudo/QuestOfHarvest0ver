import { GameState, TileType } from './types';
import { THEME, GAME_CONFIG } from './config';

/**
 * 決定論的乱数生成器
 * マップの装飾（草のドットなど）が再描画のたびに動かないようにするために使用
 */
const pseudoRandom = (x: number, y: number) => {
  const sin = Math.sin(x * 12.9898 + y * 78.233);
  return (sin * 43758.5453) - Math.floor(sin * 43758.5453);
};

export const renderGame = (
  ctx: CanvasRenderingContext2D,
  state: GameState,
  assets: Record<string, HTMLImageElement>
) => {
  const { width, height } = ctx.canvas;
  const tileSize = GAME_CONFIG.TILE_SIZE;
  const { player, map, camera } = state;

  // 1. カメラ追従の更新（プレイヤーを画面中央に）
  const targetCamX = player.x + player.width / 2 - width / 2;
  const targetCamY = player.y + player.height / 2 - height / 2;
  camera.x += (targetCamX - camera.x) * 0.1;
  camera.y += (targetCamY - camera.y) * 0.1;

  // 2. 画面クリア
  ctx.fillStyle = '#020617'; // 背景色
  ctx.fillRect(0, 0, width, height);

  // 3. タイルマップ描画の最適化（画面内のみ）
  const startCol = Math.floor(camera.x / tileSize);
  const endCol = startCol + Math.ceil(width / tileSize) + 1;
  const startRow = Math.floor(camera.y / tileSize);
  const endRow = startRow + Math.ceil(height / tileSize) + 1;
  
  const offsetX = -camera.x;
  const offsetY = -camera.y;

  for (let r = startRow; r < endRow; r++) {
    for (let c = startCol; c < endCol; c++) {
      if (r >= 0 && r < map.length && c >= 0 && c < map[0].length) {
        const tile = map[r][c];
        const x = c * tileSize + offsetX;
        const y = r * tileSize + offsetY;
        drawTile(ctx, tile.type, x, y, tileSize, c, r, state.gameTime);
      }
    }
  }

  // 4. オブジェクト描画（Y軸ソートで奥行きを表現）
  const renderList: { y: number, draw: () => void }[] = [];

  // ドロップアイテム
  state.droppedItems.forEach(drop => {
    renderList.push({
      y: drop.y + drop.height,
      draw: () => {
        const dx = drop.x + offsetX;
        const dy = drop.y + offsetY;
        const floatY = Math.sin(state.gameTime * 0.1) * 4;
        
        // 影
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.ellipse(dx + drop.width / 2, dy + drop.height, drop.width / 3, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        // アイコン
        ctx.font = '20px serif';
        ctx.textAlign = 'center';
        ctx.fillText(drop.item.icon, dx + drop.width / 2, dy + drop.height / 2 + floatY);
      }
    });
  });

  // 敵キャラクター
  state.enemies.forEach(enemy => {
    if (enemy.dead) return;
    renderList.push({
      y: enemy.y + enemy.height,
      draw: () => {
        const dx = enemy.x + offsetX;
        const dy = enemy.y + offsetY;
        const bob = enemy.isMoving ? Math.abs(Math.sin(enemy.animFrame)) * 5 : 0;

        // 影
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.ellipse(dx + enemy.width / 2, dy + enemy.height, enemy.width / 2, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        // 本体（画像があれば画像、なければ色付きの矩形＋顔）
        const assetKey = enemy.shape; // または種族名
        if (assets[assetKey]) {
          ctx.drawImage(assets[assetKey], dx, dy - bob, enemy.visualWidth, enemy.visualHeight);
        } else {
          ctx.fillStyle = enemy.color;
          // 角丸の矩形で少しキャラっぽく
          drawRoundedRect(ctx, dx, dy - bob, enemy.width, enemy.height, 4);
          ctx.fill();
          
          // 目（方向に応じて配置）
          ctx.fillStyle = '#000';
          const eyeSize = 3;
          if (enemy.direction === 0) { // 右
            ctx.fillRect(dx + enemy.width - 6, dy - bob + 6, eyeSize, eyeSize);
          } else if (enemy.direction === 2) { // 左
            ctx.fillRect(dx + 3, dy - bob + 6, eyeSize, eyeSize);
          } else { // 前後
            ctx.fillRect(dx + 5, dy - bob + 6, eyeSize, eyeSize);
            ctx.fillRect(dx + enemy.width - 8, dy - bob + 6, eyeSize, eyeSize);
          }
        }

        // HPバー
        const hpRatio = Math.max(0, enemy.hp / enemy.maxHp);
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(dx, dy - 12, enemy.width, 4);
        ctx.fillStyle = hpRatio > 0.5 ? '#22c55e' : hpRatio > 0.2 ? '#eab308' : '#ef4444';
        ctx.fillRect(dx, dy - 12, enemy.width * hpRatio, 4);
      }
    });
  });

  // プレイヤーキャラクター
  renderList.push({
    y: player.y + player.height,
    draw: () => {
      const dx = player.x + offsetX;
      const dy = player.y + offsetY;
      const bob = player.isMoving ? Math.abs(Math.sin(player.animFrame)) * 6 : 0;
      const scaleX = player.isMoving ? 1 + Math.sin(player.animFrame) * 0.05 : 1;

      // 影
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.beginPath();
      ctx.ellipse(dx + player.width / 2, dy + player.height, player.width / 2, 4, 0, 0, Math.PI * 2);
      ctx.fill();

      // 本体
      ctx.save();
      ctx.translate(dx + player.width / 2, dy + player.height);
      ctx.scale(scaleX, 1);
      
      // 画像描画
      const jobKey = player.job.toLowerCase();
      if (assets[jobKey]) {
          ctx.drawImage(assets[jobKey], -player.visualWidth / 2, -player.visualHeight - bob, player.visualWidth, player.visualHeight);
      } else {
          ctx.fillStyle = player.color;
          ctx.fillRect(-player.width / 2, -player.height - bob, player.width, player.height);
          // 簡易的な目
          ctx.fillStyle = '#fff';
          ctx.fillRect(-player.width / 4, -player.height - bob + 5, 4, 4);
          ctx.fillRect(player.width / 8, -player.height - bob + 5, 4, 4);
      }
      ctx.restore();

      // 攻撃エフェクト
      if (player.isAttacking) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.beginPath();
        const cx = dx + player.width / 2;
        const cy = dy + player.height / 2;
        let startAngle = 0;
        // プレイヤーの向きに合わせて円弧の開始位置を調整
        switch(player.direction) {
            case 0: startAngle = -Math.PI / 4; break; // 右
            case 1: startAngle = Math.PI / 4; break;  // 下
            case 2: startAngle = 3 * Math.PI / 4; break; // 左
            case 3: startAngle = -3 * Math.PI / 4; break; // 上
        }
        ctx.arc(cx, cy, 40, startAngle, startAngle + Math.PI / 2);
        ctx.stroke();
      }
    }
  });

  // パーティクル
  state.particles.forEach(p => {
    renderList.push({
      y: p.y,
      draw: () => {
        const dx = p.x + offsetX;
        const dy = p.y + offsetY;
        ctx.globalAlpha = p.life / p.maxLife;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(dx, dy, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
      }
    });
  });

  // ソートして描画
  renderList.sort((a, b) => a.y - b.y).forEach(obj => obj.draw());

  // フローティングテキスト
  state.floatingTexts.forEach(text => {
    ctx.font = 'bold 16px sans-serif';
    ctx.fillStyle = text.color;
    ctx.textAlign = 'center';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.strokeText(text.text, text.x + offsetX, text.y + offsetY);
    ctx.fillText(text.text, text.x + offsetX, text.y + offsetY);
  });
};

const drawTile = (ctx: CanvasRenderingContext2D, type: TileType, x: number, y: number, size: number, gridX: number, gridY: number, _time: number) => {
    // THEME.colorsにタイル専用のプロパティがない場合のフォールバックを含むマップ
    const colorMap: Record<string, string> = {
      grass: THEME.colors.grass,
      dirt: THEME.colors.ground,
      floor: THEME.colors.townFloor,
      wall: THEME.colors.wall,
      water: THEME.colors.water,
      rock: '#334155',
      sand: '#fde047',
      snow: '#f1f5f9',
      tree: '#064e3b',
      town_entrance: '#fbbf24',
      dungeon_entrance: '#7c2d12',
      portal_out: '#6366f1'
    };

    const baseColor = colorMap[type] || '#ff00ff';
    ctx.fillStyle = baseColor;
    ctx.fillRect(x, y, size, size);

    // タイルごとのディテール描画
    const rand = pseudoRandom(gridX, gridY);
    if (type === 'grass' && rand > 0.7) {
        ctx.fillStyle = 'rgba(255,255,255,0.1)';
        ctx.fillRect(x + rand * (size - 2), y + (1 - rand) * (size - 2), 2, 2);
    } else if (type === 'water') {
        ctx.fillStyle = 'rgba(255,255,255,0.1)';
        const wave = Math.sin(_time * 0.05 + rand * 10) * 2;
        ctx.fillRect(x + 2, y + size / 2 + wave, size - 4, 1);
    }
};

const drawRoundedRect = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) => {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
};
