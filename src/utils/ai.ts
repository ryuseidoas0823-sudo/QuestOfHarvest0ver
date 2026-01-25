import { EnemyInstance } from '../types/enemy';
import { DungeonMap } from '../types';
import { getDistance } from '../utils';

export type AIResult = 
  | { type: 'attack'; targetId: string }
  | { type: 'move'; x: number; y: number }
  | { type: 'wait' };

/**
 * 敵・NPCの行動を決定する
 */
export const decideAction = (
  actor: EnemyInstance,
  allEnemies: EnemyInstance[],
  playerPos: { x: number; y: number },
  dungeon: DungeonMap
): AIResult => {
  // 1. ターゲット選定
  let target: { id: string; x: number; y: number; dist: number; faction: string } | null = null;

  if (actor.faction === 'player_ally') {
    // 味方: 一番近いモンスター
    const enemies = allEnemies
      .filter(e => e.faction === 'monster' && e.hp > 0)
      .map(e => ({
        id: e.uniqueId,
        x: e.x,
        y: e.y,
        dist: getDistance(actor.x, actor.y, e.x, e.y),
        faction: 'monster'
      }))
      .sort((a, b) => a.dist - b.dist);
    target = enemies[0] || null;
  } else {
    // モンスター: プレイヤー or 味方NPC
    const potentialTargets = [
      { id: 'player', x: playerPos.x, y: playerPos.y, dist: getDistance(actor.x, actor.y, playerPos.x, playerPos.y), faction: 'player' },
      ...allEnemies
        .filter(e => e.faction === 'player_ally' && e.hp > 0)
        .map(e => ({
          id: e.uniqueId,
          x: e.x,
          y: e.y,
          dist: getDistance(actor.x, actor.y, e.x, e.y),
          faction: 'player_ally'
        }))
    ].sort((a, b) => a.dist - b.dist);
    target = potentialTargets[0] || null;
  }

  if (!target) {
    if (actor.faction === 'player_ally') {
      const distToPlayer = getDistance(actor.x, actor.y, playerPos.x, playerPos.y);
      if (distToPlayer > 2) return getMoveTowards(actor, playerPos.x, playerPos.y, dungeon);
    }
    return { type: 'wait' };
  }

  // 2. 行動決定 (タイプ別AI)
  const isRanged = actor.type === 'ranged' || actor.type === 'magic';
  const detectionRange = actor.faction === 'player_ally' ? 6 : (actor.visionRange || 8);

  // 索敵範囲外なら待機
  if (target.dist > detectionRange) {
    if (actor.faction === 'player_ally') return getMoveTowards(actor, playerPos.x, playerPos.y, dungeon);
    return { type: 'wait' };
  }

  // 攻撃範囲内か？
  const attackRange = isRanged ? 4.0 : 1.5;

  if (target.dist <= attackRange) {
    // 射線チェック (壁がないか)
    if (isRanged && !hasLineOfSight(actor.x, actor.y, target.x, target.y, dungeon)) {
        // 射線が通らないなら近づく
        return getMoveTowards(actor, target.x, target.y, dungeon);
    }
    return { type: 'attack', targetId: target.id };
  } else {
    // 接近
    return getMoveTowards(actor, target.x, target.y, dungeon);
  }
};

const getMoveTowards = (
  actor: { x: number; y: number },
  targetX: number,
  targetY: number,
  dungeon: DungeonMap
): AIResult => {
  let newX = actor.x;
  let newY = actor.y;

  // 簡易的な経路探索 (壁があっても避けるように少しランダム性を入れると良いが、今回はX/Y軸移動)
  if (targetX > actor.x && isWalkable(actor.x + 1, actor.y, dungeon)) newX++;
  else if (targetX < actor.x && isWalkable(actor.x - 1, actor.y, dungeon)) newX--;
  else if (targetY > actor.y && isWalkable(actor.x, actor.y + 1, dungeon)) newY++;
  else if (targetY < actor.y && isWalkable(actor.x, actor.y - 1, dungeon)) newY--;

  if (newX === actor.x && newY === actor.y) return { type: 'wait' };
  return { type: 'move', x: newX, y: newY };
};

const isWalkable = (x: number, y: number, dungeon: DungeonMap): boolean => {
    if (x < 0 || x >= dungeon.width || y < 0 || y >= dungeon.height) return false;
    const tile = dungeon.tiles[y][x];
    return tile !== 'wall';
};

// 簡易的な射線チェック (Bresenham's line algorithm base)
const hasLineOfSight = (x0: number, y0: number, x1: number, y1: number, dungeon: DungeonMap): boolean => {
    let dx = Math.abs(x1 - x0);
    let dy = Math.abs(y1 - y0);
    let sx = (x0 < x1) ? 1 : -1;
    let sy = (y0 < y1) ? 1 : -1;
    let err = dx - dy;

    let x = x0;
    let y = y0;

    while (true) {
        if (x === x1 && y === y1) return true;
        if (dungeon.tiles[y][x] === 'wall') return false;

        let e2 = 2 * err;
        if (e2 > -dy) {
            err -= dy;
            x += sx;
        }
        if (e2 < dx) {
            err += dx;
            y += sy;
        }
    }
};
