import { GameState, Tile, CombatEntity, PlayerEntity, EnemyEntity } from './types';
import { GAME_CONFIG } from './config';

export const renderGame = (
  ctx: CanvasRenderingContext2D,
  state: GameState,
  assets: Record<string, HTMLImageElement>
) => {
  const { width, height } = ctx.canvas;
  ctx.clearRect(0, 0, width, height);

  // カメラ位置の計算 (プレイヤー中心)
  const camX = Math.floor(state.player.x + state.player.width / 2 - width / 2);
  const camY = Math.floor(state.player.y + state.player.height / 2 - height / 2);

  state.camera.x = camX;
  state.camera.y = camY;

  ctx.save();
  ctx.translate(-camX, -camY);

  // マップの描画
  // 画面内のタイルだけ描画するカリング処理
  const startCol = Math.floor(camX / GAME_CONFIG.TILE_SIZE);
  const endCol = startCol + (width / GAME_CONFIG.TILE_SIZE) + 1;
  const startRow = Math.floor(camY / GAME_CONFIG.TILE_SIZE);
  const endRow = startRow + (height / GAME_CONFIG.TILE_SIZE) + 1;

  for (let y = startRow; y <= endRow; y++) {
    for (let x = startCol; x <= endCol; x++) {
      if (y >= 0 && y < state.map.length && x >= 0 && x < state.map[0].length) {
        const tile = state.map[y][x];
        drawTile(ctx, tile);
      }
    }
  }

  // ドロップアイテムの描画
  state.droppedItems.forEach(drop => {
    const bounce = Math.sin((state.gameTime + (drop.bounceOffset ?? 0)) * 0.1) * 5;
    ctx.fillStyle = drop.color;
    // 影
    ctx.beginPath();
    ctx.ellipse(drop.x + 16, drop.y + 32, 10, 4, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fill();
    
    // アイテム本体
    ctx.font = '24px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(drop.item.icon, drop.x + 16, drop.y + 16 + bounce);
  });

  // 敵の描画
  state.enemies.forEach(enemy => {
    drawEntity(ctx, enemy, assets);
    drawHealthBar(ctx, enemy);
  });

  // プレイヤーの描画
  drawEntity(ctx, state.player, assets);
  
  // エフェクト・パーティクルの描画 (もしあれば)
  
  // フローティングテキストの描画
  state.floatingTexts.forEach(text => {
    ctx.globalAlpha = Math.max(0, text.life / 30);
    ctx.fillStyle = text.color;
    ctx.font = 'bold 20px sans-serif';
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 3;
    ctx.strokeText(text.text, text.x, text.y);
    ctx.fillText(text.text, text.x, text.y);
    ctx.globalAlpha = 1.0;
  });

  ctx.restore();
};

const drawTile = (ctx: CanvasRenderingContext2D, tile: Tile) => {
  const size = GAME_CONFIG.TILE_SIZE;
  
  // 基本的な背景色
  let color = '#22c55e'; // grass
  if (tile.type === 'dirt') color = '#78350f';
  if (tile.type === 'rock') color = '#57534e';
  if (tile.type === 'sand') color = '#fcd34d';
  if (tile.type === 'snow') color = '#f1f5f9';
  if (tile.type === 'water') color = '#3b82f6';
  if (tile.type === 'floor') color = '#475569';
  if (tile.type === 'wall') color = '#1e293b';
  
  ctx.fillStyle = color;
  ctx.fillRect(tile.x, tile.y, size, size);

  // タイルの装飾（簡易的）
  if (tile.type === 'tree') {
     ctx.fillStyle = '#14532d'; // dark green
     ctx.beginPath();
     ctx.moveTo(tile.x + size/2, tile.y + 2);
     ctx.lineTo(tile.x + size - 2, tile.y + size - 5);
     ctx.lineTo(tile.x + 2, tile.y + size - 5);
     ctx.fill();
  }
  
  // 出入り口のハイライト
  if (tile.type === 'portal_out' || tile.type === 'town_entrance' || tile.type === 'dungeon_entrance') {
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.strokeRect(tile.x + 2, tile.y + 2, size - 4, size - 4);
    
    // 簡易的な渦巻きエフェクト
    ctx.fillStyle = 'rgba(59, 130, 246, 0.3)';
    ctx.beginPath();
    ctx.arc(tile.x + size/2, tile.y + size/2, size/3, 0, Math.PI*2);
    ctx.fill();
  }

  if (tile.solid && tile.type === 'wall') {
     ctx.fillStyle = 'rgba(0,0,0,0.2)';
     ctx.fillRect(tile.x, tile.y + size - 5, size, 5); // 影
  }
};

const drawEntity = (ctx: CanvasRenderingContext2D, entity: CombatEntity, assets: Record<string, HTMLImageElement>) => {
  const vw = entity.visualWidth || entity.width;
  const vh = entity.visualHeight || entity.height;
  const cx = entity.x + entity.width/2;
  const cy = entity.y + entity.height/2;

  // 影
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath();
  ctx.ellipse(cx, entity.y + entity.height - 2, entity.width/2, entity.width/4, 0, 0, Math.PI*2);
  ctx.fill();

  // アセットのキーを決定
  let assetKey = '';
  if (entity.type === 'player') {
    // 修正: プレイヤーのジョブと性別を組み合わせてキーを作成
    const p = entity as PlayerEntity;
    assetKey = `${p.job}_${p.gender}`;
  }
  if (entity.type === 'enemy') {
    const race = (entity as EnemyEntity).race;
    // 修正: モンスター名からアセットキーへのマッピング（部分一致）
    if (race.includes('Slime') || race.includes('Jelly')) assetKey = 'Slime';
    else if (race.includes('Bandit') || race.includes('Mercenary') || race.includes('Assassin')) assetKey = 'Bandit';
    else if (race.includes('Zombie') || race.includes('Ghoul') || race.includes('Wight')) assetKey = 'Zombie';
    else if (race.includes('Ant') || race.includes('Spider') || race.includes('Bee') || race.includes('Scorpion')) assetKey = 'Insect';
    else if (race.includes('Imp') || race.includes('Demon')) assetKey = 'Demon';
    else if (race.includes('Bat') || race.includes('Vampire')) assetKey = 'Bat';
    else if (race.includes('Dragon') || race.includes('Wyvern')) assetKey = 'Dragon';
    else if (race.includes('Boar') || race.includes('Grizzly') || race.includes('Chimera')) assetKey = 'Beast';
    else if (race.includes('Wolf') || race.includes('Hound') || race.includes('Cerberus')) assetKey = 'Wolf';
    else if (race.includes('Ghost') || race.includes('Wraith') || race.includes('Lich')) assetKey = 'Ghost';
    else assetKey = race; // そのままの名前で試行
  }

  const img = assets[assetKey] || assets[entity.type]; // 具体名 -> 汎用名 (player/enemy) の順で検索

  if (img) {
    // 画像がある場合
    ctx.drawImage(img, cx - vw/2, cy - vh/2, vw, vh);
  } else {
    // 画像がない場合のフォールバック（矩形 + 絵文字/色）
    ctx.fillStyle = entity.color;
    ctx.fillRect(cx - vw/2, cy - vh/2, vw, vh);

    // 目の描画（向き表現）- 矩形描画時のみ
    ctx.fillStyle = 'white';
    const eyeOffX = entity.direction === 0 ? 4 : entity.direction === 2 ? -4 : 0;
    const eyeOffY = entity.direction === 1 ? 2 : entity.direction === 3 ? -2 : 0;
    ctx.fillRect(cx - vw/2 + 8 + eyeOffX, cy - vh/2 + 8 + eyeOffY, 4, 4);
    ctx.fillRect(cx + vw/2 - 12 + eyeOffX, cy - vh/2 + 8 + eyeOffY, 4, 4);
  }
  
  // 攻撃時のエフェクト（簡易）
  // @ts-ignore
  if (entity.type === 'player' && entity.isAttacking) {
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 2;
      ctx.beginPath();
      const angle = entity.direction === 0 ? 0 : entity.direction === 1 ? Math.PI/2 : entity.direction === 2 ? Math.PI : -Math.PI/2;
      ctx.arc(cx, cy, 40, angle - 0.5, angle + 0.5);
      ctx.stroke();
  }
};

const drawHealthBar = (ctx: CanvasRenderingContext2D, entity: CombatEntity) => {
  const barWidth = entity.width * 1.5;
  const barHeight = 4;
  const x = entity.x + entity.width/2 - barWidth/2;
  const y = entity.y - 10;

  ctx.fillStyle = '#333';
  ctx.fillRect(x, y, barWidth, barHeight);

  const hpPercent = Math.max(0, entity.hp / entity.maxHp);
  ctx.fillStyle = hpPercent > 0.5 ? '#22c55e' : hpPercent > 0.2 ? '#eab308' : '#ef4444';
  ctx.fillRect(x, y, barWidth * hpPercent, barHeight);
};
