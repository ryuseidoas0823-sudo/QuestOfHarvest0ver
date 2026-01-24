import { DungeonMap, TileType } from './types';

const WIDTH = 40;
const HEIGHT = 40;

// 共通初期化処理
const createEmptyMap = (): { tiles: TileType[][], visited: boolean[][] } => {
  const tiles: TileType[][] = Array(HEIGHT).fill(null).map(() => Array(WIDTH).fill('wall'));
  const visited: boolean[][] = Array(HEIGHT).fill(null).map(() => Array(WIDTH).fill(false));
  return { tiles, visited };
};

/**
 * Type A: スタンダード (部屋と通路)
 */
const generateStandardFloor = (): DungeonMap => {
  const { tiles, visited } = createEmptyMap();
  const rooms: { x: number; y: number; w: number; h: number }[] = [];

  const minRooms = 5;
  const maxRooms = 9;
  const roomCount = Math.floor(Math.random() * (maxRooms - minRooms + 1)) + minRooms;

  for (let i = 0; i < roomCount; i++) {
    const w = Math.floor(Math.random() * 6) + 4;
    const h = Math.floor(Math.random() * 6) + 4;
    const x = Math.floor(Math.random() * (WIDTH - w - 2)) + 1;
    const y = Math.floor(Math.random() * (HEIGHT - h - 2)) + 1;

    // 重なりチェック省略（簡易）
    rooms.push({ x, y, w, h });

    for (let ry = y; ry < y + h; ry++) {
      for (let rx = x; rx < x + w; rx++) {
        tiles[ry][rx] = 'floor';
      }
    }

    if (i > 0) {
      const prev = rooms[i - 1];
      const curr = rooms[i];
      const prevCx = Math.floor(prev.x + prev.w / 2);
      const prevCy = Math.floor(prev.y + prev.h / 2);
      const currCx = Math.floor(curr.x + curr.w / 2);
      const currCy = Math.floor(curr.y + curr.h / 2);

      // 通路
      const startX = Math.min(prevCx, currCx);
      const endX = Math.max(prevCx, currCx);
      for (let tx = startX; tx <= endX; tx++) tiles[prevCy][tx] = 'floor';

      const startY = Math.min(prevCy, currCy);
      const endY = Math.max(prevCy, currCy);
      for (let ty = startY; ty <= endY; ty++) tiles[ty][currCx] = 'floor';
    }
  }

  const playerStart = {
    x: Math.floor(rooms[0].x + rooms[0].w / 2),
    y: Math.floor(rooms[0].y + rooms[0].h / 2)
  };
  
  const lastRoom = rooms[rooms.length - 1];
  const stairs = {
      x: Math.floor(lastRoom.x + lastRoom.w / 2),
      y: Math.floor(lastRoom.y + lastRoom.h / 2)
  };
  tiles[stairs.y][stairs.x] = 'stairs';

  return { tiles, rooms, playerStart, stairs, visited, width: WIDTH, height: HEIGHT };
};

/**
 * Type B: 大広間 (Big Room)
 */
const generateBigRoomFloor = (): DungeonMap => {
  const { tiles, visited } = createEmptyMap();
  
  // 外周を壁、中を床にする
  for (let y = 1; y < HEIGHT - 1; y++) {
    for (let x = 1; x < WIDTH - 1; x++) {
      tiles[y][x] = 'floor';
      // ランダムに柱（壁）を配置
      if (Math.random() < 0.05) tiles[y][x] = 'wall';
    }
  }

  // 中央エリアを確実に空ける
  const cx = Math.floor(WIDTH / 2);
  const cy = Math.floor(HEIGHT / 2);
  for(let y=cy-2; y<=cy+2; y++) {
      for(let x=cx-2; x<=cx+2; x++) {
          tiles[y][x] = 'floor';
      }
  }

  const rooms = [{ x: 1, y: 1, w: WIDTH - 2, h: HEIGHT - 2 }];
  const playerStart = { x: cx, y: cy + 10 };
  const stairs = { x: cx, y: cy - 10 };
  tiles[stairs.y][stairs.x] = 'stairs';

  return { tiles, rooms, playerStart, stairs, visited, width: WIDTH, height: HEIGHT };
};

/**
 * Type C: 迷路 (Maze) - 簡易的な穴掘り法
 */
const generateMazeFloor = (): DungeonMap => {
  const { tiles, visited } = createEmptyMap();
  
  // 全て壁で埋める（初期化済み）
  
  // 奇数座標を通路にしていく
  const dig = (x: number, y: number) => {
      tiles[y][x] = 'floor';
      
      const directions = [[0, -2], [0, 2], [-2, 0], [2, 0]];
      // シャッフル
      directions.sort(() => Math.random() - 0.5);
      
      for (const [dx, dy] of directions) {
          const nx = x + dx;
          const ny = y + dy;
          
          if (nx > 0 && nx < WIDTH - 1 && ny > 0 && ny < HEIGHT - 1 && tiles[ny][nx] === 'wall') {
              tiles[y + dy / 2][x + dx / 2] = 'floor'; // 壁を掘る
              dig(nx, ny);
          }
      }
  };

  dig(1, 1);

  // 部屋の概念がないためダミーを入れるか、適当なスペースを広げる
  // スタート地点周辺を広げる
  for(let y=1; y<=3; y++) for(let x=1; x<=3; x++) tiles[y][x] = 'floor';
  // ゴール地点周辺を広げる
  for(let y=HEIGHT-4; y<=HEIGHT-2; y++) for(let x=WIDTH-4; x<=WIDTH-2; x++) tiles[y][x] = 'floor';

  const rooms = [{x:1, y:1, w:3, h:3}, {x:WIDTH-4, y:HEIGHT-4, w:3, h:3}];
  const playerStart = { x: 2, y: 2 };
  const stairs = { x: WIDTH - 3, y: HEIGHT - 3 };
  tiles[stairs.y][stairs.x] = 'stairs';

  return { tiles, rooms, playerStart, stairs, visited, width: WIDTH, height: HEIGHT };
};

/**
 * Type F: ボス階層 (Boss)
 */
const generateBossFloor = (): DungeonMap => {
  const { tiles, visited } = createEmptyMap();
  const roomW = 20;
  const roomH = 20;
  const roomX = Math.floor((WIDTH - roomW) / 2);
  const roomY = Math.floor((HEIGHT - roomH) / 2);

  for (let y = roomY; y < roomY + roomH; y++) {
    for (let x = roomX; x < roomX + roomW; x++) {
      tiles[y][x] = 'floor';
    }
  }
  
  const rooms = [{ x: roomX, y: roomY, w: roomW, h: roomH }];
  const playerStart = { x: Math.floor(WIDTH / 2), y: roomY + roomH - 2 };
  const stairs = { x: Math.floor(WIDTH / 2), y: roomY + 1 };
  tiles[stairs.y][stairs.x] = 'stairs';

  return { tiles, rooms, playerStart, stairs, visited, width: WIDTH, height: HEIGHT };
};

/**
 * ダンジョン生成メイン関数
 */
export const generateDungeon = (floor: number): DungeonMap => {
  // 5階ごとにボス
  if (floor % 5 === 0) {
    return generateBossFloor();
  }

  // 階層に応じてタイプを変える
  // 1-4: Standard
  // 6-9: Standard / Maze
  // 11-14: BigRoom / Maze
  const rand = Math.random();
  
  if (floor < 5) {
      return generateStandardFloor();
  } else if (floor < 10) {
      return rand < 0.3 ? generateMazeFloor() : generateStandardFloor();
  } else if (floor < 15) {
      return rand < 0.4 ? generateBigRoomFloor() : generateStandardFloor();
  } else {
      // 深層はランダム
      if (rand < 0.4) return generateStandardFloor();
      if (rand < 0.7) return generateBigRoomFloor();
      return generateMazeFloor();
  }
};
