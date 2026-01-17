import { GAME_CONFIG, THEME, RARITY_MULTIPLIERS, ENCHANT_SLOTS, ITEM_BASE_NAMES, ICONS, ASSETS_SVG } from './constants';
import { JOB_DATA, ENEMY_TYPES, WORLD_LOCATIONS } from './data';
import { Item, Rarity, EquipmentType, WeaponStyle, WeaponClass, Enchantment, PlayerEntity, Job, Gender, EnemyEntity, ShapeType, FloorData, Tile, TileType, Biome, LightSource, Entity, GameState, CombatEntity } from './types';

// SVGをData URLに変換
export const svgToUrl = (s: string) => "data:image/svg+xml;charset=utf-8," + encodeURIComponent(s.trim());

// 衝突判定
export const checkCollision = (rect1: Entity, rect2: Entity) => rect1.x < rect2.x + rect2.width && rect1.x + rect1.width > rect2.x && rect1.y < rect2.y + rect2.height && rect1.y + rect1.height > rect2.y;

// マップ衝突解決
export const resolveMapCollision = (entity: Entity, dx: number, dy: number, map: Tile[][]): {x: number, y: number} => {
  const T = GAME_CONFIG.TILE_SIZE;
  const nextX = entity.x + dx, nextY = entity.y + dy;
  const startX = Math.floor(nextX / T), endX = Math.floor((nextX + entity.width) / T);
  const startY = Math.floor(nextY / T), endY = Math.floor((nextY + entity.height) / T);
  
  if (startY < 0 || endY >= map.length || startX < 0 || endX >= map[0].length) return { x: entity.x, y: entity.y }; // 画面外ガード
  
  for (let y = startY; y <= endY; y++) {
      for (let x = startX; x <= endX; x++) {
          if (map[y]?.[x]?.solid) return { x: entity.x, y: entity.y };
      }
  }
  return { x: nextX, y: nextY };
};

// ... generateRandomItem, createPlayer, generateEnemy, generateFloor, updatePlayerStats は
// アップロードされたファイルの内容を使用してください（長大なためここでは省略しますが、App.tsxはこれらに依存しています）

// 描画関数
export const renderGame = (ctx: CanvasRenderingContext2D, state: GameState, images: Record<string, HTMLImageElement>, width: number, height: number) => {
  ctx.fillStyle = '#111'; ctx.fillRect(0, 0, width, height);

  const T = GAME_CONFIG.TILE_SIZE;
  ctx.save();
  const camX = Math.floor(state.player.x + state.player.width/2 - width/2);
  const camY = Math.floor(state.player.y + state.player.height/2 - height/2);
  ctx.translate(-camX, -camY);
  state.camera = { x: camX, y: camY };

  // マップ描画
  const mapWidth = state.map[0]?.length || GAME_CONFIG.MAP_WIDTH;
  const mapHeight = state.map.length || GAME_CONFIG.MAP_HEIGHT;
  const startCol = Math.max(0, Math.floor(camX / T));
  const endCol = Math.min(mapWidth - 1, startCol + (width / T) + 1);
  const startRow = Math.max(0, Math.floor(camY / T));
  const endRow = Math.min(mapHeight - 1, startRow + (height / T) + 1);

  for (let y = startRow; y <= endRow; y++) {
    for (let x = startCol; x <= endCol; x++) {
      const tile = state.map[y]?.[x];
      if (!tile) continue;
      // 簡易色分け
      ctx.fillStyle = tile.solid ? '#424242' : (tile.type==='grass'?'#1e2b1e':'#37474f');
      ctx.fillRect(tile.x, tile.y, T, T);
      if(tile.type==='stairs_down') { ctx.fillStyle='#fff'; ctx.fillText('DWN', tile.x, tile.y+10); }
    }
  }

  // エンティティ描画
  [...state.enemies, state.player].sort((a,b)=>a.y-b.y).forEach(e => {
      if(e.dead) return;
      ctx.fillStyle = e.color;
      ctx.fillRect(e.x, e.y, e.width, e.height);
      // 画像があれば描画...
  });

  ctx.restore();
};

// Note: generateRandomItem等の関数実装が必須です。ローカルのutils.tsにこれらが含まれていることを確認してください。
