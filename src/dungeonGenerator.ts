import { DungeonMap, Room, Position, Chest } from './types';

// 定数
const MAP_WIDTH = 50;
const MAP_HEIGHT = 50;
const MIN_ROOM_SIZE = 4;
const MAX_ROOM_SIZE = 10;
const MAX_ROOMS = 10;

export const generateDungeon = (floor: number): DungeonMap => {
  // 1. マップ初期化 (全て壁)
  const tiles: number[][] = Array(MAP_HEIGHT).fill(0).map(() => Array(MAP_WIDTH).fill(0));
  const rooms: Room[] = [];
  const chests: Chest[] = [];

  // 2. 部屋生成
  for (let i = 0; i < MAX_ROOMS; i++) {
    const w = Math.floor(Math.random() * (MAX_ROOM_SIZE - MIN_ROOM_SIZE + 1)) + MIN_ROOM_SIZE;
    const h = Math.floor(Math.random() * (MAX_ROOM_SIZE - MIN_ROOM_SIZE + 1)) + MIN_ROOM_SIZE;
    const x = Math.floor(Math.random() * (MAP_WIDTH - w - 2)) + 1;
    const y = Math.floor(Math.random() * (MAP_HEIGHT - h - 2)) + 1;

    const newRoom: Room = { x, y, w, h };

    // 他の部屋と重ならないかチェック
    let failed = false;
    for (const otherRoom of rooms) {
      if (
        newRoom.x <= otherRoom.x + otherRoom.w + 1 &&
        newRoom.x + newRoom.w + 1 >= otherRoom.x &&
        newRoom.y <= otherRoom.y + otherRoom.h + 1 &&
        newRoom.y + newRoom.h + 1 >= otherRoom.y
      ) {
        failed = true;
        break;
      }
    }

    if (!failed) {
      createRoom(newRoom, tiles);
      
      // 前の部屋があれば通路で繋ぐ
      if (rooms.length > 0) {
        const prevRoom = rooms[rooms.length - 1];
        const newCenter = getCenter(newRoom);
        const prevCenter = getCenter(prevRoom);

        if (Math.random() < 0.5) {
          createHCorridor(prevCenter.x, newCenter.x, prevCenter.y, tiles);
          createVCorridor(prevCenter.y, newCenter.y, newCenter.x, tiles);
        } else {
          createVCorridor(prevCenter.y, newCenter.y, prevCenter.x, tiles);
          createHCorridor(prevCenter.x, newCenter.x, newCenter.y, tiles);
        }
      }

      rooms.push(newRoom);
    }
  }

  // 3. 宝箱配置 (部屋の中にランダム配置)
  // 30%の確率で各部屋に宝箱を配置（スタート部屋除く）
  rooms.forEach((room, index) => {
    if (index === 0) return; // スタート部屋には置かない

    if (Math.random() < 0.4) { // 40%
        // 部屋内のランダムな位置
        const cx = room.x + Math.floor(Math.random() * room.w);
        const cy = room.y + Math.floor(Math.random() * room.h);
        
        chests.push({
            id: `chest-${floor}-${index}`,
            position: { x: cx, y: cy },
            isOpened: false,
            type: Math.random() < 0.1 ? 'gold' : (Math.random() < 0.3 ? 'silver' : 'wood')
        });
    }
  });

  // スタート地点（最初の部屋の中心）
  const startPos = getCenter(rooms[0]);

  return {
    width: MAP_WIDTH,
    height: MAP_HEIGHT,
    tiles,
    rooms,
    startPos,
    chests
  };
};

const createRoom = (room: Room, tiles: number[][]) => {
  for (let y = room.y; y < room.y + room.h; y++) {
    for (let x = room.x; x < room.x + room.w; x++) {
      tiles[y][x] = 1; // 床
    }
  }
};

const createHCorridor = (x1: number, x2: number, y: number, tiles: number[][]) => {
  for (let x = Math.min(x1, x2); x <= Math.max(x1, x2); x++) {
    tiles[y][x] = 1; // 床 (通路も床扱いにして移動しやすくする、あるいは2で区別も可)
  }
};

const createVCorridor = (y1: number, y2: number, x: number, tiles: number[][]) => {
  for (let y = Math.min(y1, y2); y <= Math.max(y1, y2); y++) {
    tiles[y][x] = 1;
  }
};

const getCenter = (room: Room): Position => {
  return {
    x: Math.floor(room.x + room.w / 2),
    y: Math.floor(room.y + room.h / 2)
  };
};
