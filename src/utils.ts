import { Tile, Entity, PlayerEntity } from './types';
import { GAME_CONFIG } from './config';

/**
 * 2つの矩形（Entity）が衝突しているかを判定します。
 * 中心座標(x, y)と幅・高さ(width, height)を使用します。
 */
export const checkCollision = (
  a: { x: number; y: number; width: number; height: number },
  b: { x: number; y: number; width: number; height: number }
): boolean => {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
};

/**
 * プレイヤーの移動先がマップ上の障害物と衝突するかを判定し、
 * 衝突する場合は壁沿いに滑るように補正した座標を返します。
 * (Axis-Aligned Bounding Box)
 */
export const resolveMapCollision = (
  entity: PlayerEntity,
  dx: number,
  dy: number,
  map: Tile[][]
): { x: number; y: number } => {
  let nextX = entity.x + dx;
  let nextY = entity.y + dy;

  const checkMapCollision = (checkX: number, checkY: number): boolean => {
    // エンティティの四隅と中心をチェック
    const points = [
      { x: checkX, y: checkY },
      { x: checkX + entity.width, y: checkY },
      { x: checkX, y: checkY + entity.height },
      { x: checkX + entity.width, y: checkY + entity.height },
      { x: checkX + entity.width / 2, y: checkY + entity.height / 2 },
    ];

    for (const p of points) {
      const tileX = Math.floor(p.x / GAME_CONFIG.TILE_SIZE);
      const tileY = Math.floor(p.y / GAME_CONFIG.TILE_SIZE);

      // マップ範囲外は衝突とみなす
      if (tileY < 0 || tileY >= map.length || tileX < 0 || tileX >= map[0].length) {
        return true;
      }

      // 壁または障害物
      if (map[tileY][tileX].solid) {
        return true;
      }
    }
    return false;
  };

  // X軸方向の衝突判定
  if (checkMapCollision(nextX, entity.y)) {
    nextX = entity.x; // 衝突した場合はX移動をキャンセル
  }

  // Y軸方向の衝突判定
  if (checkMapCollision(nextX, nextY)) {
    nextY = entity.y; // 衝突した場合はY移動をキャンセル
  }
  
  // 角に引っかかる場合の補正（斜め移動時のスタック防止）
  // どちらか一方だけキャンセルしても進める場合は滑らせる処理は上記if文で実現されているが、
  // 厳密なスライド処理が必要な場合はここに追加する

  return { x: nextX, y: nextY };
};
