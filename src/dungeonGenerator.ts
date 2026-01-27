import { Position } from './types/input';

interface Room {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface DungeonData {
  map: number[][];
  rooms: Room[];
  stairs: Position;
  playerStart: Position;
}

// ダンジョン設定
const MAP_WIDTH = 50;
const MAP_HEIGHT = 40;
const MIN_ROOM_SIZE = 4;
const MAX_ROOM_SIZE = 10;
const MAX_ROOMS = 15;

/**
 * 通常のダンジョン生成 (BSP or Random placement)
 */
const generateNormalDungeon = (floor: number): DungeonData => {
  // 0: Wall, 1: Floor
  const map: number[][] = Array(MAP_HEIGHT).fill(0).map(() => Array(MAP_WIDTH).fill(0));
  const rooms: Room[] = [];

  for (let i = 0; i < MAX_ROOMS; i++) {
    const w = Math.floor(Math.random() * (MAX_ROOM_SIZE - MIN_ROOM_SIZE + 1)) + MIN_ROOM_SIZE;
    const h = Math.floor(Math.random() * (MAX_ROOM_SIZE - MIN_ROOM_SIZE + 1)) + MIN_ROOM_SIZE;
    const x = Math.floor(Math.random() * (MAP_WIDTH - w - 2)) + 1;
    const y = Math.floor(Math.random() * (MAP_HEIGHT - h - 2)) + 1;

    const newRoom: Room = { x, y, w, h };

    // 部屋が重ならないかチェック
    let failed = false;
    for (const other of rooms) {
      if (
        newRoom.x <= other.x + other.w &&
        newRoom.x + newRoom.w >= other.x &&
        newRoom.y <= other.y + other.h &&
        newRoom.y + newRoom.h >= other.y
      ) {
        failed = true;
        break;
      }
    }

    if (!failed) {
      // 部屋を描画
      for (let ry = 0; ry < h; ry++) {
        for (let rx = 0; rx < w; rx++) {
          map[y + ry][x + rx] = 1;
        }
      }
      
      // 前の部屋と通路でつなぐ
      if (rooms.length > 0) {
        const prev = rooms[rooms.length - 1];
        const prevCenter = { x: Math.floor(prev.x + prev.w / 2), y: Math.floor(prev.y + prev.h / 2) };
        const newCenter = { x: Math.floor(newRoom.x + newRoom.w / 2), y: Math.floor(newRoom.y + newRoom.h / 2) };

        // 横移動
        const startX = Math.min(prevCenter.x, newCenter.x);
        const endX = Math.max(prevCenter.x, newCenter.x);
        for (let tx = startX; tx <= endX; tx++) {
          map[prevCenter.y][tx] = 1;
        }

        // 縦移動
        const startY = Math.min(prevCenter.y, newCenter.y);
        const endY = Math.max(prevCenter.y, newCenter.y);
        for (let ty = startY; ty <= endY; ty++) {
          map[ty][newCenter.x] = 1;
        }
      }

      rooms.push(newRoom);
    }
  }

  // プレイヤー開始位置 (最初の部屋の中心)
  const firstRoom = rooms[0];
  const playerStart = {
    x: Math.floor(firstRoom.x + firstRoom.w / 2),
    y: Math.floor(firstRoom.y + firstRoom.h / 2)
  };

  // 階段位置 (最後の部屋の中心)
  const lastRoom = rooms[rooms.length - 1];
  const stairs = {
    x: Math.floor(lastRoom.x + lastRoom.w / 2),
    y: Math.floor(lastRoom.y + lastRoom.h / 2)
  };

  return { map, rooms, stairs, playerStart };
};

/**
 * ボスフロア生成 (Boss Arena)
 * 5階層ごとに呼び出される、中央に巨大な部屋があるだけのマップ
 */
const generateBossArena = (floor: number): DungeonData => {
  const map: number[][] = Array(MAP_HEIGHT).fill(0).map(() => Array(MAP_WIDTH).fill(0));
  
  // マップ中央に巨大な部屋 (20x20)
  const roomSize = 20;
  const startX = Math.floor((MAP_WIDTH - roomSize) / 2);
  const startY = Math.floor((MAP_HEIGHT - roomSize) / 2);

  for (let y = startY; y < startY + roomSize; y++) {
    for (let x = startX; x < startX + roomSize; x++) {
      map[y][x] = 1;
    }
  }

  // 部屋情報として登録（スポーンロジック等で使用）
  const arenaRoom: Room = {
    x: startX,
    y: startY,
    w: roomSize,
    h: roomSize
  };

  // プレイヤーは部屋の下側から開始
  const playerStart = {
    x: Math.floor(startX + roomSize / 2),
    y: startY + roomSize - 2
  };

  // 階段（次の階層へ）は部屋の上側
  const stairs = {
    x: Math.floor(startX + roomSize / 2),
    y: startY + 2
  };

  return { 
    map, 
    rooms: [arenaRoom], 
    stairs, 
    playerStart 
  };
};

/**
 * メイン生成関数
 */
export const generateDungeon = (floor: number): DungeonData => {
  // 5階層ごとはボス部屋
  if (floor > 0 && floor % 5 === 0) {
    return generateBossArena(floor);
  }
  return generateNormalDungeon(floor);
};
