import { Enemy, Faction } from '../types/enemy'; // Faction型をインポート
import { TileType } from '../gameLogic';

interface Point {
  x: number;
  y: number;
}

// 簡易的な経路探索 (BFS)
export const findPath = (
  startX: number,
  startY: number,
  targetX: number,
  targetY: number,
  map: TileType[][],
  maxSteps: number = 10
): Point | null => {
  const queue: { x: number; y: number; path: Point[] }[] = [
    { x: startX, y: startY, path: [] }
  ];
  const visited = new Set<string>();
  visited.add(`${startX},${startY}`);

  while (queue.length > 0) {
    const { x, y, path } = queue.shift()!;

    if (x === targetX && y === targetY) {
      return path[0] || { x: targetX, y: targetY };
    }

    if (path.length >= maxSteps) continue;

    const directions = [
      { dx: 0, dy: -1 },
      { dx: 0, dy: 1 },
      { dx: -1, dy: 0 },
      { dx: 1, dy: 0 }
    ];

    for (const dir of directions) {
      const nx = x + dir.dx;
      const ny = y + dir.dy;

      if (
        nx >= 0 && nx < map[0].length &&
        ny >= 0 && ny < map.length &&
        map[ny][nx] !== 'wall' &&
        !visited.has(`${nx},${ny}`)
      ) {
        visited.add(`${nx},${ny}`);
        queue.push({ x: nx, y: ny, path: [...path, { x: nx, y: ny }] });
      }
    }
  }

  // ターゲットへの直接経路が見つからない場合、ターゲットに近づく方向へ1歩進む
  return null;
};

export const getEnemyAction = (
  enemy: Enemy,
  playerPos: Point,
  allEnemies: Enemy[],
  map: TileType[][]
): { type: 'move' | 'attack' | 'wait', target?: Point } => {
  const dist = Math.abs(enemy.x - playerPos.x) + Math.abs(enemy.y - playerPos.y);

  // 攻撃範囲内なら攻撃
  if (dist <= 1) {
    return { type: 'attack', target: playerPos };
  }

  // 視界範囲内なら追跡
  if (dist <= (enemy.visionRange || 5)) {
    // 他の敵がいる位置は避ける
    const otherEnemyPositions = new Set(
      allEnemies
        .filter(e => e.id !== enemy.id)
        .map(e => `${e.x},${e.y}`)
    );

    // プレイヤーに向かって移動
    // 簡易的に、X軸・Y軸で近づける方へ移動
    let nextX = enemy.x;
    let nextY = enemy.y;

    if (Math.abs(enemy.x - playerPos.x) > Math.abs(enemy.y - playerPos.y)) {
      nextX += enemy.x < playerPos.x ? 1 : -1;
    } else {
      nextY += enemy.y < playerPos.y ? 1 : -1;
    }

    // 壁や他の敵がいたら、もう一方の軸を試す
    if (
      map[nextY][nextX] === 'wall' ||
      otherEnemyPositions.has(`${nextX},${nextY}`)
    ) {
        // 元に戻す
        if (nextX !== enemy.x) {
            nextX = enemy.x;
            nextY += enemy.y < playerPos.y ? 1 : -1;
        } else {
            nextY = enemy.y;
            nextX += enemy.x < playerPos.x ? 1 : -1;
        }
    }

    // それでもダメなら待機
    if (
        map[nextY][nextX] === 'wall' ||
        otherEnemyPositions.has(`${nextX},${nextY}`)
    ) {
        return { type: 'wait' };
    }

    return { type: 'move', target: { x: nextX, y: nextY } };
  }

  // それ以外はランダム移動か待機
  if (Math.random() < 0.3) {
      const dirs = [[0,1], [0,-1], [1,0], [-1,0]];
      const dir = dirs[Math.floor(Math.random() * dirs.length)];
      const nx = enemy.x + dir[0];
      const ny = enemy.y + dir[1];
      if (nx >= 0 && nx < map[0].length && ny >= 0 && ny < map.length && map[ny][nx] !== 'wall') {
          return { type: 'move', target: { x: nx, y: ny } };
      }
  }

  return { type: 'wait' };
};

// 修正箇所: string | undefined の型不一致を解消
export const findNearestTarget = (
    me: { id: string, x: number, y: number, faction?: Faction }, // factionをオプショナルかつFaction型に
    entities: { id: string, x: number, y: number, faction?: Faction }[]
) => {
    let nearest = null;
    let minDist = Infinity;

    // 自分の勢力が未定義の場合は 'enemy' (敵対) として扱うなどのデフォルト処理
    const myFaction = me.faction || 'enemy';

    for (const entity of entities) {
        if (entity.id === me.id) continue;
        
        // 相手の勢力、未定義なら 'enemy'
        const targetFaction = entity.faction || 'enemy';

        // 敵対関係にあるものだけをターゲット
        // (ここでは簡易的に、勢力が異なれば敵対とする)
        if (myFaction !== targetFaction) {
            const d = Math.abs(me.x - entity.x) + Math.abs(me.y - entity.y);
            if (d < minDist) {
                minDist = d;
                nearest = entity;
            }
        }
    }
    return nearest;
};
