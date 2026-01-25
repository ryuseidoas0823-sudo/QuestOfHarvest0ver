import { DungeonMap, TileType, FloorType } from './types';
import { EnemyInstance } from './types/enemy';
import { enemies as enemyData } from './data/enemies';

// フロア生成結果の型
interface GeneratorResult {
  map: DungeonMap;
  startPos: { x: number; y: number };
  enemies: EnemyInstance[];
}

const WIDTH = 40;
const HEIGHT = 30;

// ボスの出現階層定義
const BOSS_FLOORS: Record<number, string> = {
  5: 'orc_general',
  10: 'cerberus',
  15: 'chimera_golem',
  20: 'abyss_commander',
  25: 'fallen_hero'
};

// ユーティリティ: 空のマップを作成
const createEmptyMap = (width: number, height: number, fill: TileType = 'wall') => {
  const tiles: TileType[][] = Array(height).fill(null).map(() => Array(width).fill(fill));
  const visited: boolean[][] = Array(height).fill(null).map(() => Array(width).fill(false));
  return { tiles, visited };
};

// ユーティリティ: 敵インスタンスの作成
const createEnemy = (id: string, x: number, y: number, uniqueKey: string): EnemyInstance | null => {
  const data = enemyData.find(e => e.id === id);
  if (!data) return null;
  return {
    ...data,
    uniqueId: uniqueKey,
    x,
    y,
    hp: data.maxHp,
    stats: {
      maxHp: data.maxHp, hp: data.maxHp, mp: 0, maxMp: 0,
      attack: data.attack, defense: data.defense,
      str: 0, vit: 0, dex: 0, agi: 0, int: 0, luc: 0,
      level: 1, exp: data.exp
    }
  };
};

// --- Strategy A: スタンダード（部屋と通路） ---
const generateStandard = (floor: number): GeneratorResult => {
  const { tiles, visited } = createEmptyMap(WIDTH, HEIGHT);
  const rooms: { x: number; y: number; w: number; h: number }[] = [];
  
  // 部屋生成 (簡易BSPライク)
  const minRoomSize = 4;
  const maxRooms = 8;
  
  for (let i = 0; i < maxRooms; i++) {
    const w = Math.floor(Math.random() * 6) + minRoomSize;
    const h = Math.floor(Math.random() * 6) + minRoomSize;
    const x = Math.floor(Math.random() * (WIDTH - w - 2)) + 1;
    const y = Math.floor(Math.random() * (HEIGHT - h - 2)) + 1;

    // 重なりチェック
    const overlap = rooms.some(r => 
      x < r.x + r.w + 1 && x + w + 1 > r.x &&
      y < r.y + r.h + 1 && y + h + 1 > r.y
    );

    if (!overlap) {
      rooms.push({ x, y, w, h });
      for (let ry = y; ry < y + h; ry++) {
        for (let rx = x; rx < x + w; rx++) {
          tiles[ry][rx] = 'floor';
        }
      }
    }
  }

  // 通路生成（部屋同士を繋ぐ）
  for (let i = 0; i < rooms.length - 1; i++) {
    const r1 = rooms[i];
    const r2 = rooms[i + 1];
    const c1 = { x: Math.floor(r1.x + r1.w / 2), y: Math.floor(r1.y + r1.h / 2) };
    const c2 = { x: Math.floor(r2.x + r2.w / 2), y: Math.floor(r2.y + r2.h / 2) };

    // L字型に通路を掘る
    let cx = c1.x;
    let cy = c1.y;
    while (cx !== c2.x) {
      tiles[cy][cx] = 'floor';
      cx += cx < c2.x ? 1 : -1;
    }
    while (cy !== c2.y) {
      tiles[cy][cx] = 'floor';
      cy += cy < c2.y ? 1 : -1;
    }
  }

  const startRoom = rooms[0];
  const endRoom = rooms[rooms.length - 1];
  
  const startPos = { 
    x: Math.floor(startRoom.x + startRoom.w / 2), 
    y: Math.floor(startRoom.y + startRoom.h / 2) 
  };
  const stairsPos = { 
    x: Math.floor(endRoom.x + endRoom.w / 2), 
    y: Math.floor(endRoom.y + endRoom.h / 2) 
  };
  
  tiles[stairsPos.y][stairsPos.x] = 'stairs_down';

  // 敵配置
  const enemies: EnemyInstance[] = [];
  rooms.forEach((room, idx) => {
    if (idx === 0) return; // スタート部屋には配置しない
    const count = Math.floor(Math.random() * 2) + 1;
    const validEnemies = enemyData.filter(e => e.faction === 'monster' && e.type !== 'boss');
    
    for (let i = 0; i < count; i++) {
      const ex = Math.floor(room.x + Math.random() * room.w);
      const ey = Math.floor(room.y + Math.random() * room.h);
      if (tiles[ey][ex] === 'floor') {
        const template = validEnemies[Math.floor(Math.random() * validEnemies.length)];
        const enemy = createEnemy(template.id, ex, ey, `e_${floor}_${idx}_${i}`);
        if (enemy) enemies.push(enemy);
      }
    }
  });

  return {
    map: { width: WIDTH, height: HEIGHT, tiles, rooms, playerStart: startPos, stairs: stairsPos, visited, floorType: 'standard' },
    startPos,
    enemies
  };
};

// --- Strategy B: 大広間（モンスターハウス） ---
const generateBigRoom = (floor: number): GeneratorResult => {
  const { tiles, visited } = createEmptyMap(WIDTH, HEIGHT, 'wall');
  
  // 中央に巨大な部屋
  const margin = 2;
  const room = { x: margin, y: margin, w: WIDTH - margin * 2, h: HEIGHT - margin * 2 };
  
  for (let y = room.y; y < room.y + room.h; y++) {
    for (let x = room.x; x < room.x + room.w; x++) {
      tiles[y][x] = 'floor';
    }
  }

  // 柱を配置（遮蔽物）
  for (let i = 0; i < 10; i++) {
    const ox = Math.floor(Math.random() * (room.w - 4)) + room.x + 2;
    const oy = Math.floor(Math.random() * (room.h - 4)) + room.y + 2;
    tiles[oy][ox] = 'wall';
  }

  const startPos = { x: room.x + 2, y: room.y + 2 };
  const stairsPos = { x: room.x + room.w - 3, y: room.y + room.h - 3 };
  tiles[stairsPos.y][stairsPos.x] = 'stairs_down';

  // 大量の敵配置
  const enemies: EnemyInstance[] = [];
  const enemyCount = 15 + floor; // 通常より多い
  const validEnemies = enemyData.filter(e => e.faction === 'monster' && e.type !== 'boss');

  for (let i = 0; i < enemyCount; i++) {
    const ex = Math.floor(Math.random() * (room.w - 4)) + room.x + 2;
    const ey = Math.floor(Math.random() * (room.h - 4)) + room.y + 2;
    // スタート地点付近は避ける
    if (Math.abs(ex - startPos.x) < 5 && Math.abs(ey - startPos.y) < 5) continue;

    const template = validEnemies[Math.floor(Math.random() * validEnemies.length)];
    const enemy = createEnemy(template.id, ex, ey, `e_big_${floor}_${i}`);
    if (enemy) enemies.push(enemy);
  }

  return {
    map: { width: WIDTH, height: HEIGHT, tiles, rooms: [room], playerStart: startPos, stairs: stairsPos, visited, floorType: 'big_room' },
    startPos,
    enemies
  };
};

// --- Strategy C: ボス階層 ---
const generateBossFloor = (floor: number): GeneratorResult => {
  const { tiles, visited } = createEmptyMap(WIDTH, HEIGHT, 'wall');
  
  // ボス部屋 (中央)
  const roomW = 14;
  const roomH = 14;
  const roomX = Math.floor((WIDTH - roomW) / 2);
  const roomY = Math.floor((HEIGHT - roomH) / 2);
  
  // ボス部屋描画 (赤いカーペット風の床)
  for (let y = roomY; y < roomY + roomH; y++) {
    for (let x = roomX; x < roomX + roomW; x++) {
      tiles[y][x] = 'carpet_red'; // 専用タイルがあれば使う、なければfloor扱い
    }
  }

  const startPos = { x: roomX + Math.floor(roomW / 2), y: roomY + roomH - 2 };
  const stairsPos = { x: roomX + Math.floor(roomW / 2), y: roomY + 2 }; // ボスの後ろ
  tiles[stairsPos.y][stairsPos.x] = 'stairs_down';

  // ボス配置
  const enemies: EnemyInstance[] = [];
  const bossId = BOSS_FLOORS[floor] || 'orc_general';
  const boss = createEnemy(bossId, roomX + Math.floor(roomW / 2), roomY + Math.floor(roomH / 2), `boss_${floor}`);
  if (boss) enemies.push(boss);

  // 取り巻き配置
  const minionId = floor < 10 ? 'goblin' : 'skeleton_soldier';
  for (let i = 0; i < 2; i++) {
    const mx = roomX + 4 + i * 6;
    const my = roomY + Math.floor(roomH / 2) + 2;
    const minion = createEnemy(minionId, mx, my, `minion_${floor}_${i}`);
    if (minion) enemies.push(minion);
  }

  return {
    map: { width: WIDTH, height: HEIGHT, tiles, rooms: [{x: roomX, y: roomY, w: roomW, h: roomH}], playerStart: startPos, stairs: stairsPos, visited, floorType: 'boss' },
    startPos,
    enemies
  };
};

// --- Main Generator Function ---
export const generateDungeon = (floor: number): GeneratorResult => {
  // 1. ボス階層チェック
  if (BOSS_FLOORS[floor]) {
    return generateBossFloor(floor);
  }

  // 2. 特殊フロア抽選 (例: 10%で大広間)
  // ただし浅層(1-3F)はスタンダード固定
  if (floor > 3 && Math.random() < 0.1) {
    return generateBigRoom(floor);
  }

  // 3. デフォルト
  return generateStandard(floor);
};
