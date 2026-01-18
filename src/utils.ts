import { Entity, Tile } from './types';
import { GAME_CONFIG } from './config';

export const checkCollision = (rect1: Entity, rect2: Entity) => rect1.x < rect2.x + rect2.width && rect1.x + rect1.width > rect2.x && rect1.y < rect2.y + rect2.height && rect1.y + rect1.height > rect2.y;

export const resolveMapCollision = (entity: Entity, dx: number, dy: number, map: Tile[][]): {x: number, y: number} => {
  const T = GAME_CONFIG.TILE_SIZE;
  const nextX = entity.x + dx, nextY = entity.y + dy;
  const startX = Math.floor(nextX / T), endX = Math.floor((nextX + entity.width) / T), startY = Math.floor(nextY / T), endY = Math.floor((nextY + entity.height) / T);
  // Boundary check
  if (startX < 0 || endX >= map[0].length || startY < 0 || endY >= map.length) return { x: entity.x, y: entity.y };
  
  for (let y = startY; y <= endY; y++) for (let x = startX; x <= endX; x++) if (map[y]?.[x]?.solid) return { x: entity.x, y: entity.y };
  return { x: nextX, y: nextY };
};
