import { DungeonMap, Tile } from './types';

// ダンジョンの設定
const MAP_WIDTH = 40;
const MAP_HEIGHT = 40;
const MIN_ROOM_SIZE = 4;
const MAX_ROOM_SIZE = 10;
const MAX_ROOMS = 10;

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
  center: { x: number; y: number };
}

// 部屋生成ヘルパー
const createRoom = (rect: Rect, map: Tile[][]) => {
  for (let y = rect.y; y < rect.y + rect.h; y++) {
    for (let x = rect.x; x < rect.x + rect.w; x++) {
      if (y > 0 && y < MAP_HEIGHT - 1 && x > 0 && x < MAP_WIDTH - 1) {
        map[y][x] = { type: 'floor', x, y, visible: false, explored: false };
      }
    }
  }
};

// 通路生成ヘルパー（水平）
const createH_Tunnel = (x1: number, x2: number, y: number, map: Tile[][]) => {
  for (let x = Math.min(x1, x2); x <= Math.max(x1, x2); x++) {
    if (x > 0 && x < MAP_WIDTH - 1 && y > 0 && y < MAP_HEIGHT - 1) {
      map[y][x] = { type: 'floor', x, y, visible: false, explored: false };
    }
  }
};

// 通路生成ヘルパー（垂直）
const createV_Tunnel = (y1: number, y2: number, x: number, map: Tile[][]) => {
  for (let y = Math.min(y1, y2); y <= Math.max(y1, y2); y++) {
    if (y > 0 && y < MAP_HEIGHT - 1 && x > 0 && x < MAP_WIDTH - 1) {
      map[y][x] = { type: 'floor', x, y, visible: false, explored: false };
    }
  }
};

export const generateDungeon = (_floorLevel: number): DungeonMap => {
  const map: Tile[][] = [];
  for (let y = 0; y < MAP_HEIGHT; y++) {
    const row: Tile[] = [];
    for (let x = 0; x < MAP_WIDTH; x++) {
      row.push({ type: 'wall', x, y, visible: false, explored: false });
    }
    map.push(row);
  }

  const rooms: Rect[] = [];
  let playerStart = { x: 1, y: 1 };
  let validSpawnPoints: { x: number; y: number }[] = [];

  // 2. 部屋を生成して配置
  for (let i = 0; i < MAX_ROOMS; i++) {
    const w = Math.floor(Math.random() * (MAX_ROOM_SIZE - MIN_ROOM_SIZE + 1)) + MIN_ROOM_SIZE;
    const h = Math.floor(Math.random() * (MAX_ROOM_SIZE - MIN_ROOM_SIZE + 1)) + MIN_ROOM_SIZE;
    const x = Math.floor(Math.random() * (MAP_WIDTH - w - 2)) + 1;
    const y = Math.floor(Math.random() * (MAP_HEIGHT - h - 2)) + 1;

    const newRoom: Rect = {
      x, y, w, h,
      center: { x: Math.floor(x + w / 2), y: Math.floor(y + h / 2) }
    };

    let failed = false;
    for (const otherRoom of rooms) {
      if (
        newRoom.x <= otherRoom.x + otherRoom.w &&
        newRoom.x + newRoom.w >= otherRoom.x &&
        newRoom.y <= otherRoom.y + otherRoom.h &&
        newRoom.y + newRoom.h >= otherRoom.y
      ) {
        failed = true;
        break;
      }
    }

    if (!failed) {
      createRoom(newRoom, map);
      
      const { center } = newRoom;

      if (rooms.length === 0) {
        playerStart = center;
      } else {
        const prevCenter = rooms[rooms.length - 1].center;
        if (Math.random() > 0.5) {
          createH_Tunnel(prevCenter.x, center.x, prevCenter.y, map);
          createV_Tunnel(prevCenter.y, center.y, center.x, map);
        } else {
          createV_Tunnel(prevCenter.y, center.y, prevCenter.x, map);
          createH_Tunnel(prevCenter.x, center.x, center.y, map);
        }
      }

      // スポーン候補
      if (rooms.length > 0) { 
          // 敵スポーン用
          for(let k=0; k<2; k++){
              const sx = Math.floor(Math.random() * (newRoom.w - 2)) + newRoom.x + 1;
              const sy = Math.floor(Math.random() * (newRoom.h - 2)) + newRoom.y + 1;
              validSpawnPoints.push({ x: sx, y: sy });
          }
      }

      // 宝箱配置 (20%の確率で部屋に配置)
      if (Math.random() < 0.2 && rooms.length > 0) {
          const cx = Math.floor(Math.random() * (newRoom.w - 2)) + newRoom.x + 1;
          const cy = Math.floor(Math.random() * (newRoom.h - 2)) + newRoom.y + 1;
          
          // 既存のオブジェクトと被らないか簡易チェック (今回は上書き)
          map[cy][cx] = {
              type: 'chest',
              x: cx, 
              y: cy,
              visible: false,
              explored: false,
              meta: { itemId: Math.random() > 0.7 ? 'ether' : 'potion', opened: false }
          };
      }

      rooms.push(newRoom);
    }
  }

  // 3. 階段の配置（最後の部屋の中心）
  const lastRoom = rooms[rooms.length - 1];
  if (lastRoom) {
    map[lastRoom.center.y][lastRoom.center.x] = { 
      type: 'stairs_down', 
      x: lastRoom.center.x, 
      y: lastRoom.center.y, 
      visible: false, 
      explored: false 
    };
    validSpawnPoints = validSpawnPoints.filter(p => p.x !== lastRoom.center.x || p.y !== lastRoom.center.y);
  }

  return {
    floor: _floorLevel,
    map,
    width: MAP_WIDTH,
    height: MAP_HEIGHT,
    rooms: rooms,
    startPosition: playerStart,
    spawnPoints: validSpawnPoints
  };
};
