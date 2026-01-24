import { GameState, Entity, Item, MapData } from './types';
import { ENEMIES } from './data/enemies';
import { ITEMS } from './data/items';
import { 
  GRID_SIZE, MAP_WIDTH, MAP_HEIGHT, 
  TILE_FLOOR, TILE_WALL, TILE_LAVA, TILE_LOCKED_DOOR, 
  TILE_SECRET_WALL, TILE_STAIRS, TILE_BOSS_DOOR 
} from './config';

// MapData型の拡張（ローカル用）
interface ExtendedMapData extends MapData {
  isDark?: boolean;
}

type DungeonGeneratorFunc = (floor: number, player: Entity) => Pick<GameState, 'map' | 'enemies' | 'items' | 'player'>;

// ==========================================
// ヘルパー関数
// ==========================================

const initTiles = (width: number, height: number, fillVal = TILE_WALL) => {
  const tiles: number[][] = [];
  for(let y = 0; y < height; y++) tiles[y] = Array(width).fill(fillVal);
  return tiles;
};

const fillRoom = (tiles: number[][], room: {x:number, y:number, w:number, h:number}, tileType: number = TILE_FLOOR) => {
    for (let y = room.y; y < room.y + room.h; y++) {
        for (let x = room.x; x < room.x + room.w; x++) {
            if(y>=0 && y<tiles.length && x>=0 && x<tiles[0].length) tiles[y][x] = tileType;
        }
    }
};

const createHCorridor = (tiles: number[][], x1: number, x2: number, y: number) => {
    const start = Math.min(x1, x2);
    const end = Math.max(x1, x2);
    for (let x = start; x <= end; x++) if(y>=0 && y<tiles.length && x>=0 && x<tiles[0].length) tiles[y][x] = TILE_FLOOR;
};

const createVCorridor = (tiles: number[][], y1: number, y2: number, x: number) => {
    const start = Math.min(y1, y2);
    const end = Math.max(y1, y2);
    for (let y = start; y <= end; y++) if(y>=0 && y<tiles.length && x>=0 && x<tiles[0].length) tiles[y][x] = TILE_FLOOR;
};

const createEnemyInstance = (key: string, gx: number, gy: number, idSuffix: number, floor: number): Entity => {
    const enemyDef = ENEMIES[key];
    return {
        id: `enemy_${idSuffix}`,
        type: 'enemy',
        x: gx * GRID_SIZE,
        y: gy * GRID_SIZE,
        width: GRID_SIZE,
        height: GRID_SIZE,
        color: 'red',
        direction: 'down',
        isMoving: false,
        stats: {
            maxHp: Math.floor(enemyDef.baseStats.maxHp * (1 + floor * 0.1)), 
            hp: Math.floor(enemyDef.baseStats.maxHp * (1 + floor * 0.1)),
            attack: Math.floor(enemyDef.baseStats.attack * (1 + floor * 0.05)),
            defense: enemyDef.baseStats.defense,
            level: floor,
            exp: enemyDef.expReward,
            nextLevelExp: 0,
            speed: 0.5
        }
    } as Entity; // 型キャスト
};

const placeEntities = (rooms: any[], floor: number) => {
    const enemies: Entity[] = [];
    const items: Item[] = [];
    const enemyKeys = Object.keys(ENEMIES);
    const itemKeys = Object.keys(ITEMS);
    
    const hasTreasury = rooms.some(r => r.type === 'treasury');
    let keyPlaced = !hasTreasury; 

    for (let i = 1; i < rooms.length; i++) {
        const room = rooms[i];
        if (room.type === 'monster_house') continue;

        if (room.type === 'treasury') {
            const rareItems = itemKeys; 
            const itemKey = rareItems[Math.floor(Math.random() * rareItems.length)];
            const ix = (room.x + Math.floor(room.w / 2)) * GRID_SIZE;
            const iy = (room.y + Math.floor(room.h / 2)) * GRID_SIZE;
            items.push({ id: `item_treasury_${i}`, itemId: itemKey, x: ix, y: iy });
            continue;
        }

        if (Math.random() < 0.5) {
            const enemyKey = enemyKeys[Math.floor(Math.random() * enemyKeys.length)];
            const ex = Math.floor(room.x + Math.random() * room.w);
            const ey = Math.floor(room.y + Math.random() * room.h);
            enemies.push(createEnemyInstance(enemyKey, ex, ey, i, floor));
        }
        
        if (!keyPlaced && Math.random() < 0.2) {
            const kx = (room.x + Math.floor(Math.random() * room.w)) * GRID_SIZE;
            const ky = (room.y + Math.floor(Math.random() * room.h)) * GRID_SIZE;
            items.push({ id: `item_key_${i}`, itemId: 'dungeon_key', x: kx, y: ky });
            keyPlaced = true;
        } else if (Math.random() < 0.3) {
            const itemKey = itemKeys[Math.floor(Math.random() * itemKeys.length)];
            const ix = (room.x + Math.floor(Math.random() * room.w)) * GRID_SIZE;
            const iy = (room.y + Math.floor(Math.random() * room.h)) * GRID_SIZE;
            items.push({ id: `item_${i}`, itemId: itemKey, x: ix, y: iy });
        }
    }
    
    if (!keyPlaced && rooms.length > 1) {
        const lastRoom = rooms[rooms.length - 1];
        if (lastRoom.type !== 'treasury' && lastRoom.type !== 'monster_house') {
            const kx = (lastRoom.x + Math.floor(Math.random() * lastRoom.w)) * GRID_SIZE;
            const ky = (lastRoom.y + Math.floor(Math.random() * lastRoom.h)) * GRID_SIZE;
            items.push({ id: `item_key_fallback`, itemId: 'dungeon_key', x: kx, y: ky });
        }
    }
    return { enemies, items };
};

const placeStairs = (tiles: number[][], rooms: any[]) => {
    if (rooms.length > 0) {
        const lastRoom = rooms[rooms.length - 1];
        const sx = Math.floor(lastRoom.x + lastRoom.w / 2);
        const sy = Math.floor(lastRoom.y + lastRoom.h / 2);
        
        if (tiles[sy][sx] === TILE_FLOOR) {
            tiles[sy][sx] = TILE_STAIRS;
        } else {
            for(let y=lastRoom.y; y<lastRoom.y+lastRoom.h; y++) {
                for(let x=lastRoom.x; x<lastRoom.x+lastRoom.w; x++) {
                    if (tiles[y][x] === TILE_FLOOR) {
                        tiles[y][x] = TILE_STAIRS;
                        return;
                    }
                }
            }
        }
    }
};

// ==========================================
// 各種生成ロジック
// ==========================================

const generateGridDungeon: DungeonGeneratorFunc = (floor, player) => {
  const width = MAP_WIDTH;
  const height = MAP_HEIGHT;
  const tiles = initTiles(width, height);
  const rooms: any[] = [];
  const maxRooms = 10 + Math.floor(Math.random() * 5); 

  for (let i = 0; i < maxRooms; i++) {
      const roomW = 6 + Math.floor(Math.random() * 8); 
      const roomH = 6 + Math.floor(Math.random() * 8);
      const roomX = 2 + Math.floor(Math.random() * (width - roomW - 4));
      const roomY = 2 + Math.floor(Math.random() * (height - roomH - 4));

      let overlap = false;
      for (const r of rooms) {
          if (roomX < r.x + r.w + 1 && roomX + roomW + 1 > r.x && roomY < r.y + r.h + 1 && roomY + roomH + 1 > r.y) {
              overlap = true;
              break;
          }
      }

      if (!overlap) {
          const roomObj: any = { x: roomX, y: roomY, w: roomW, h: roomH };
          
          if (i > 0 && Math.random() < 0.05) {
              roomObj.type = 'treasury';
              fillRoom(tiles, roomObj, TILE_FLOOR);
          } else {
             const isLava = Math.random() < 0.1;
             const tileType = isLava ? TILE_LAVA : TILE_FLOOR;
             fillRoom(tiles, roomObj, tileType);
             
             if (!isLava && Math.random() < 0.05) {
                 roomObj.type = 'monster_house';
                 roomObj.triggered = false;
             }
             if (!isLava && roomObj.type !== 'monster_house' && Math.random() < 0.05) {
                 roomObj.type = 'secret';
             }
          }
          rooms.push(roomObj);
      }
  }

  for (let i = 0; i < rooms.length - 1; i++) {
      const r1 = rooms[i];
      const r2 = rooms[i + 1];
      const c1x = Math.floor(r1.x + r1.w / 2);
      const c1y = Math.floor(r1.y + r1.h / 2);
      const c2x = Math.floor(r2.x + r2.w / 2);
      const c2y = Math.floor(r2.y + r2.h / 2);

      if (Math.random() < 0.5) {
          createHCorridor(tiles, c1x, c2x, c1y);
          createVCorridor(tiles, c1y, c2y, c2x);
      } else {
          createVCorridor(tiles, c1y, c2y, c1x);
          createHCorridor(tiles, c1x, c2x, c2y);
      }
  }

  rooms.forEach(room => {
      if (room.type === 'treasury') {
          for (let x = room.x; x < room.x + room.w; x++) {
              if (tiles[room.y - 1][x] === TILE_FLOOR) tiles[room.y][x] = TILE_LOCKED_DOOR;
              if (tiles[room.y + room.h][x] === TILE_FLOOR) tiles[room.y + room.h - 1][x] = TILE_LOCKED_DOOR;
          }
          for (let y = room.y; y < room.y + room.h; y++) {
              if (tiles[y][room.x - 1] === TILE_FLOOR) tiles[y][room.x] = TILE_LOCKED_DOOR;
              if (tiles[y][room.x + room.w] === TILE_FLOOR) tiles[y][room.x + room.w - 1] = TILE_LOCKED_DOOR;
          }
      }
      else if (room.type === 'secret') {
          for (let x = room.x; x < room.x + room.w; x++) {
              if (tiles[room.y - 1][x] === TILE_FLOOR) tiles[room.y][x] = TILE_SECRET_WALL;
              if (tiles[room.y + room.h][x] === TILE_FLOOR) tiles[room.y + room.h - 1][x] = TILE_SECRET_WALL;
          }
          for (let y = room.y; y < room.y + room.h; y++) {
              if (tiles[y][room.x - 1] === TILE_FLOOR) tiles[y][room.x] = TILE_SECRET_WALL;
              if (tiles[y][room.x + room.w] === TILE_FLOOR) tiles[y][room.x + room.w - 1] = TILE_SECRET_WALL;
          }
      }
  });

  const startRoom = rooms[0];
  startRoom.type = 'normal';
  fillRoom(tiles, startRoom, TILE_FLOOR);

  placeStairs(tiles, rooms);

  const newPlayer = { ...player, x: (startRoom.x + startRoom.w/2)*GRID_SIZE, y: (startRoom.y + startRoom.h/2)*GRID_SIZE };
  const { enemies, items } = placeEntities(rooms, floor);

  return { map: { width, height, tiles, rooms }, enemies, items, player: newPlayer };
};

const generateOpenDungeon: DungeonGeneratorFunc = (floor, player) => {
    const width = MAP_WIDTH;
    const height = MAP_HEIGHT;
    const tiles = initTiles(width, height, TILE_FLOOR); 
    for(let y = 0; y < height; y++) {
        for(let x = 0; x < width; x++) {
            if (y === 0 || y === height - 1 || x === 0 || x === width - 1) tiles[y][x] = TILE_WALL;
        }
    }
    for(let i=0; i<10; i++) {
         const lx = 5 + Math.floor(Math.random() * (width - 10));
         const ly = 5 + Math.floor(Math.random() * (height - 10));
         if(lx > 0 && ly > 0) tiles[ly][lx] = TILE_LAVA;
    }

    const rooms = [{ x: 1, y: 1, w: width - 2, h: height - 2 }];
    const newPlayer = { ...player, x: 5 * GRID_SIZE, y: 5 * GRID_SIZE };
    
    const enemies: Entity[] = [];
    const items: Item[] = []; // 大広間はアイテム少なめ、または別途配置
    const enemyKeys = Object.keys(ENEMIES);
    const centerX = width / 2;
    const centerY = height / 2;

    for (let i = 0; i < 15 + floor; i++) { 
        const enemyKey = enemyKeys[Math.floor(Math.random() * enemyKeys.length)];
        const offsetRange = 20; 
        const ex = Math.floor(centerX + (Math.random() * offsetRange - offsetRange/2));
        const ey = Math.floor(centerY + (Math.random() * offsetRange - offsetRange/2));
        if (Math.abs(ex - 5) < 5 && Math.abs(ey - 5) < 5) continue;
        if (ex > 1 && ex < width - 1 && ey > 1 && ey < height - 1) {
             enemies.push(createEnemyInstance(enemyKey, ex, ey, i, floor));
        }
    }
    
    placeStairs(tiles, rooms);

    return { map: { width, height, tiles, rooms }, enemies, items, player: newPlayer };
};

const generatePillarsDungeon: DungeonGeneratorFunc = (floor, player) => {
    const width = MAP_WIDTH;
    const height = MAP_HEIGHT;
    const tiles = initTiles(width, height);
    const rooms: any[] = [];
    const margin = 4;
    const colWidth = Math.floor((width - margin * 4) / 3);
    const roomH = height - 10;
    const startY = 5;

    for (let i = 0; i < 3; i++) {
        const roomX = margin + i * (colWidth + margin);
        const room = { x: roomX, y: startY, w: colWidth, h: roomH };
        fillRoom(tiles, room); 
        rooms.push(room);
    }
    for (let i = 0; i < 2; i++) {
        const r1 = rooms[i];
        const r2 = rooms[i+1];
        const y1 = r1.y + 5;
        const y2 = r1.y + r1.h - 5;
        createHCorridor(tiles, r1.x + r1.w - 1, r2.x, y1);
        createHCorridor(tiles, r1.x + r1.w - 1, r2.x, y2);
    }

    const startRoom = rooms[1]; 
    const newPlayer = { ...player, x: (startRoom.x + startRoom.w/2)*GRID_SIZE, y: (startRoom.y + startRoom.h - 2)*GRID_SIZE };
    const { enemies, items } = placeEntities(rooms, floor);
    
    placeStairs(tiles, rooms);

    return { map: { width, height, tiles, rooms }, enemies, items, player: newPlayer };
};

const generateSnakeDungeon: DungeonGeneratorFunc = (floor, player) => {
    const width = 50;
    const height = 30; 
    const tiles = initTiles(width, height);
    const rooms: any[] = [];
    const gridCols = 5;
    const gridRows = 3;
    const cellW = Math.floor(width / gridCols);
    const cellH = Math.floor(height / gridRows);

    for (let row = 0; row < gridRows; row++) {
        const isRight = row % 2 === 0;
        const colStart = isRight ? 0 : gridCols - 1;
        const colEnd = isRight ? gridCols : -1;
        const step = isRight ? 1 : -1;

        for (let col = colStart; col !== colEnd; col += step) {
             const roomW = Math.floor(cellW * 0.7);
             const roomH = Math.floor(cellH * 0.7);
             const roomX = col * cellW + 2;
             const roomY = row * cellH + 2;
             
             const room = { x: roomX, y: roomY, w: roomW, h: roomH };
             fillRoom(tiles, room);
             rooms.push(room);
             
             if (rooms.length > 1) {
                 const prev = rooms[rooms.length - 2];
                 const curr = room;
                 const px = Math.floor(prev.x + prev.w/2);
                 const py = Math.floor(prev.y + prev.h/2);
                 const cx = Math.floor(curr.x + curr.w/2);
                 const cy = Math.floor(curr.y + curr.h/2);

                 if (Math.abs(px - cx) > Math.abs(py - cy)) {
                     createHCorridor(tiles, px, cx, py);
                     createVCorridor(tiles, py, cy, cx);
                 } else {
                     createVCorridor(tiles, py, cy, px);
                     createHCorridor(tiles, px, cx, cy);
                 }
             }
        }
    }

    const startRoom = rooms[0];
    const newPlayer = { ...player, x: (startRoom.x + startRoom.w/2)*GRID_SIZE, y: (startRoom.y + startRoom.h/2)*GRID_SIZE };
    const { enemies, items } = placeEntities(rooms, floor);
    placeStairs(tiles, rooms);
    return { map: { width, height, tiles, rooms }, enemies, items, player: newPlayer };
};

const generateMazeDungeon: DungeonGeneratorFunc = (floor, player) => {
    const width = 41; 
    const height = 41;
    const tiles = initTiles(width, height);
    
    const startX = 1;
    const startY = 1;
    tiles[startY][startX] = TILE_FLOOR;

    const directions = [{ x: 0, y: -2 }, { x: 0, y: 2 }, { x: -2, y: 0 }, { x: 2, y: 0 }];
    const dig = (x: number, y: number) => {
        const dirs = [...directions].sort(() => Math.random() - 0.5);
        for (const dir of dirs) {
            const nx = x + dir.x;
            const ny = y + dir.y;
            if (nx > 0 && nx < width - 1 && ny > 0 && ny < height - 1 && tiles[ny][nx] === TILE_WALL) {
                tiles[y + dir.y / 2][x + dir.x / 2] = TILE_FLOOR;
                tiles[ny][nx] = TILE_FLOOR;
                dig(nx, ny);
            }
        }
    };
    dig(startX, startY);

    for(let i=0; i<30; i++) {
        const x = 1 + Math.floor(Math.random() * (width - 2));
        const y = 1 + Math.floor(Math.random() * (height - 2));
        if (tiles[y][x] === TILE_WALL) tiles[y][x] = TILE_FLOOR;
    }

    const rooms = [{ x: 1, y: 1, w: width-2, h: height-2 }];
    const newPlayer = { ...player, x: startX * GRID_SIZE, y: startY * GRID_SIZE };
    
    const enemies: Entity[] = [];
    const items: Item[] = [];
    const enemyKeys = Object.keys(ENEMIES);

    for(let i=0; i<10 + floor; i++) {
        let ex, ey;
        do {
            ex = Math.floor(Math.random() * width);
            ey = Math.floor(Math.random() * height);
        } while(tiles[ey][ex] === TILE_WALL || (Math.abs(ex - startX) < 5 && Math.abs(ey - startY) < 5));
        
        const enemyKey = enemyKeys[Math.floor(Math.random() * enemyKeys.length)];
        enemies.push(createEnemyInstance(enemyKey, ex, ey, i, floor));
    }
    
    // 階段
    let sx, sy;
    do {
        sx = Math.floor(Math.random() * width);
        sy = Math.floor(Math.random() * height);
    } while(tiles[sy][sx] === TILE_WALL || (Math.abs(sx - startX) < 20 && Math.abs(sy - startY) < 20));
    tiles[sy][sx] = TILE_STAIRS;

    return { map: { width, height, tiles, rooms }, enemies, items, player: newPlayer };
};

const generateBossFloor: DungeonGeneratorFunc = (floor, player) => {
    const width = 40; 
    const height = 60; 
    const tiles = initTiles(width, height);
    const rooms: any[] = [];
    
    const restRoom = { x: 15, y: 50, w: 10, h: 8 };
    fillRoom(tiles, restRoom);
    rooms.push(restRoom);

    const bossRoom = { x: 10, y: 20, w: 20, h: 20 };
    fillRoom(tiles, bossRoom);
    rooms.push(bossRoom);

    const treasureRoom = { x: 18, y: 5, w: 4, h: 4 };
    fillRoom(tiles, treasureRoom);
    rooms.push(treasureRoom);

    createVCorridor(tiles, restRoom.y, bossRoom.y + bossRoom.h, 20);
    createVCorridor(tiles, bossRoom.y, treasureRoom.y + treasureRoom.h, 20);
    tiles[bossRoom.y - 1][20] = TILE_BOSS_DOOR; 
    tiles[bossRoom.y - 2][20] = TILE_BOSS_DOOR; 

    const newPlayer = { ...player, x: (restRoom.x + restRoom.w/2)*GRID_SIZE, y: (restRoom.y + restRoom.h/2)*GRID_SIZE };

    const enemies: Entity[] = [];
    const bossKey = 'orc'; 
    const bossX = (bossRoom.x + bossRoom.w / 2);
    const bossY = (bossRoom.y + bossRoom.h / 2);
    
    const bossEnemy = createEnemyInstance(bossKey, bossX, bossY, 999, floor + 5);
    bossEnemy.width = GRID_SIZE * 2;
    bossEnemy.height = GRID_SIZE * 2;
    bossEnemy.stats.maxHp *= 5;
    bossEnemy.stats.hp *= 5;
    bossEnemy.stats.attack *= 2;
    enemies.push(bossEnemy);

    enemies.push(createEnemyInstance('goblin', bossX - 3, bossY + 3, 901, floor));
    enemies.push(createEnemyInstance('goblin', bossX + 3, bossY + 3, 902, floor));
    
    const tx = treasureRoom.x + 2;
    const ty = treasureRoom.y + 2;
    tiles[ty][tx] = TILE_STAIRS;

    return { map: { width, height, tiles, rooms }, enemies, items: [], player: newPlayer };
};

// ==========================================
// メイン生成関数
// ==========================================

export const generateDungeon: DungeonGeneratorFunc = (floor, player) => {
    if (floor % 5 === 0) {
        console.log(`Generating Boss Floor for Level ${floor}`);
        return generateBossFloor(floor, player);
    }

    let dungeonData: Pick<GameState, 'map' | 'enemies' | 'items' | 'player'>;
    const rand = Math.random();

    if (floor <= 4) {
        if (rand < 0.2) dungeonData = generatePillarsDungeon(floor, player);
        else dungeonData = generateGridDungeon(floor, player);
    } 
    else if (floor <= 10) {
        if (rand < 0.2) dungeonData = generateOpenDungeon(floor, player);
        else if (rand < 0.4) dungeonData = generateSnakeDungeon(floor, player);
        else if (rand < 0.6) dungeonData = generateMazeDungeon(floor, player);
        else dungeonData = generateGridDungeon(floor, player);
    }
    else {
        const type = Math.floor(Math.random() * 5); 
        switch(type) {
            case 0: dungeonData = generateGridDungeon(floor, player); break;
            case 1: dungeonData = generateOpenDungeon(floor, player); break;
            case 2: dungeonData = generatePillarsDungeon(floor, player); break;
            case 3: dungeonData = generateSnakeDungeon(floor, player); break;
            case 4: dungeonData = generateMazeDungeon(floor, player); break;
            default: dungeonData = generateGridDungeon(floor, player); break;
        }
    }

    (dungeonData.map as ExtendedMapData).isDark = Math.random() < 0.15;
    return dungeonData;
};
