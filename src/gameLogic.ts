import { GameState, Position, Entity, Direction, Stats, Projectile, Item } from './types';
import { JOBS } from './data/jobs';
import { GODS } from './data/gods';
import { SKILLS } from './data/skills';
import { ENEMIES } from './data/enemies';
import { ITEMS } from './data/items';
import { JobId } from './types/job';

const GRID_SIZE = 40;
const MAP_WIDTH = 50;
const MAP_HEIGHT = 50;

// ... createInitialPlayer, getDirectionVector, checkCollision, activateSkill, updateGameLogic, moveEntity は変更なし ...
// (以前のコードブロックの内容を保持してください。ここではダンジョン生成部分のみ書き換えます)

// ==========================================
// ここから既存コードの再掲（コンテキスト維持用）
// ==========================================

export const createInitialPlayer = (jobId: JobId, godId: string, startPos: Position): Entity => {
  const jobDef = JOBS[jobId];
  const godDef = GODS[godId];
  
  if (!jobDef) throw new Error(`Job definition not found: ${jobId}`);
  if (!godDef) throw new Error(`God definition not found: ${godId}`);

  let baseMaxHp = jobDef.baseStats.maxHp;
  let baseAttack = jobDef.baseStats.attack;
  let baseDefense = jobDef.baseStats.defense;

  if (godDef.passiveBonus.maxHp) baseMaxHp += godDef.passiveBonus.maxHp;
  if (godDef.passiveBonus.attack) baseAttack += godDef.passiveBonus.attack;
  if (godDef.passiveBonus.defense) baseDefense += godDef.passiveBonus.defense;

  const stats: Stats = {
    maxHp: baseMaxHp,
    hp: baseMaxHp,
    attack: baseAttack,
    defense: baseDefense,
    level: 1,
    exp: 0,
    nextLevelExp: 100,
    speed: 1,
    critRate: godDef.passiveBonus.critRate || 0,
    dropRate: godDef.passiveBonus.dropRate || 1.0,
  };

  return {
    id: 'player',
    type: 'player',
    x: startPos.x * GRID_SIZE,
    y: startPos.y * GRID_SIZE,
    width: GRID_SIZE,
    height: GRID_SIZE,
    color: godDef.color,
    direction: 'down',
    isMoving: false,
    stats: stats,
    jobId: jobId, 
    godId: godId,
    skills: [...jobDef.learnableSkills],
    skillCooldowns: {},
  } as Entity;
};

const getDirectionVector = (dir: Direction): { x: number, y: number } => {
  switch (dir) {
    case 'up': return { x: 0, y: -1 };
    case 'down': return { x: 0, y: 1 };
    case 'left': return { x: -1, y: 0 };
    case 'right': return { x: 1, y: 0 };
  }
};

const checkCollision = (x: number, y: number, width: number, height: number, map: any): boolean => {
    const corners = [
        { x: x, y: y },
        { x: x + width - 1, y: y },
        { x: x, y: y + height - 1 },
        { x: x + width - 1, y: y + height - 1 }
    ];

    for (const p of corners) {
        const gridX = Math.floor(p.x / GRID_SIZE);
        const gridY = Math.floor(p.y / GRID_SIZE);
        if (gridY < 0 || gridY >= map.height || gridX < 0 || gridX >= map.width) return true;
        if (map.tiles[gridY][gridX] === 1) return true;
    }
    return false;
};

export const activateSkill = (state: GameState, skillId: string): GameState => {
  const { player, gameTime } = state;
  const skill = SKILLS[skillId];
  if (!skill) return state;

  const nextAvailableTime = player.skillCooldowns?.[skillId] || 0;
  if (gameTime < nextAvailableTime) return state;

  let newState = { ...state };
  let newPlayer = { ...player };
  let newMessages = [`${skill.name}を発動！`, ...state.messages].slice(0, 10);
  
  newPlayer.skillCooldowns = {
    ...player.skillCooldowns,
    [skillId]: gameTime + skill.cooldown
  };

  switch (skill.effectType) {
    case 'dash':
      const vec = getDirectionVector(player.direction);
      const dashDist = skill.range * GRID_SIZE;
      const targetX = newPlayer.x + vec.x * dashDist;
      const targetY = newPlayer.y + vec.y * dashDist;
      if (!checkCollision(targetX, targetY, newPlayer.width, newPlayer.height, state.map)) {
          newPlayer.x = targetX;
          newPlayer.y = targetY;
      } else {
          newMessages = [`壁に阻まれた！`, ...newMessages].slice(0, 10);
      }
      break;
    case 'projectile':
      const projVec = getDirectionVector(player.direction);
      const newProjectile: Projectile = {
        id: `proj_${gameTime}_${Math.random()}`,
        x: player.x + (player.width / 2) - 10,
        y: player.y + (player.height / 2) - 10,
        width: 20,
        height: 20,
        direction: player.direction,
        speed: 8,
        damage: player.stats.attack * skill.value,
        ownerId: player.id,
        lifeTime: 1000,
        assetKey: skill.animationKey
      };
      newState.projectiles = [...(state.projectiles || []), newProjectile];
      break;
    case 'heal':
      const healAmount = skill.value;
      newPlayer.stats = {
        ...player.stats,
        hp: Math.min(player.stats.maxHp, player.stats.hp + healAmount)
      };
      newMessages = [`HPが ${healAmount} 回復した！`, ...newMessages].slice(0, 10);
      break;
    case 'buff_atk':
      newMessages = [`攻撃力が上がった！（未実装）`, ...newMessages].slice(0, 10);
      break;
    case 'damage':
      const range = skill.range * GRID_SIZE;
      const attackVec = getDirectionVector(player.direction);
      const centerX = player.x + player.width/2 + attackVec.x * (range/2);
      const centerY = player.y + player.height/2 + attackVec.y * (range/2);
      const hitEnemies = newState.enemies.map(enemy => {
        const dx = (enemy.x + enemy.width/2) - centerX;
        const dy = (enemy.y + enemy.height/2) - centerY;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < range) {
          const damage = Math.floor(player.stats.attack * skill.value);
          const newHp = enemy.stats.hp - damage;
          return { ...enemy, stats: { ...enemy.stats, hp: newHp } };
        }
        return enemy;
      });
      newState.enemies = hitEnemies.filter(e => e.stats.hp > 0);
      break;
  }
  newState.player = newPlayer;
  newState.messages = newMessages;
  return newState;
};

export const updateGameLogic = (state: GameState, input: { keys: Record<string, boolean> }): GameState => {
  let newState = { ...state };
  if (newState.projectiles && newState.projectiles.length > 0) {
    const updatedProjectiles: Projectile[] = [];
    newState.projectiles.forEach(p => {
      const moveVec = getDirectionVector(p.direction);
      const nextX = p.x + moveVec.x * p.speed;
      const nextY = p.y + moveVec.y * p.speed;
      p.lifeTime -= 16;
      if (p.lifeTime <= 0) return;
      if (checkCollision(nextX, nextY, p.width, p.height, newState.map)) return;
      p.x = nextX;
      p.y = nextY;
      let hit = false;
      const hitEnemies = newState.enemies.map(enemy => {
        if (hit) return enemy; 
        if (
          p.x < enemy.x + enemy.width &&
          p.x + p.width > enemy.x &&
          p.y < enemy.y + enemy.height &&
          p.y + p.height > enemy.y
        ) {
          hit = true;
          const newHp = enemy.stats.hp - p.damage;
          return { ...enemy, stats: { ...enemy.stats, hp: newHp } };
        }
        return enemy;
      });
      if (hit) {
        newState.enemies = hitEnemies.filter(e => e.stats.hp > 0);
        return;
      }
      updatedProjectiles.push(p);
    });
    newState.projectiles = updatedProjectiles;
  }
  const updatedEnemies = newState.enemies.map(enemy => {
      const dx = newState.player.x - enemy.x;
      const dy = newState.player.y - enemy.y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      if (dist < 300) {
          const speed = enemy.stats.speed || 1;
          const moveX = dx !== 0 ? (dx / Math.abs(dx)) * speed : 0;
          const moveY = dy !== 0 ? (dy / Math.abs(dy)) * speed : 0;
          const nextX = enemy.x + moveX;
          const nextY = enemy.y + moveY;
          if (!checkCollision(nextX, nextY, enemy.width, enemy.height, newState.map)) {
              enemy.x = nextX;
              enemy.y = nextY;
          }
      }
      return enemy;
  });
  newState.enemies = updatedEnemies;
  newState.gameTime += 16;
  return newState;
};

export const moveEntity = (entity: Entity, dx: number, dy: number, map: any): Entity => {
    const targetX = entity.x + dx;
    const targetY = entity.y + dy;
    if (!checkCollision(targetX, targetY, entity.width, entity.height, map)) {
        return {
            ...entity,
            x: targetX,
            y: targetY,
            isMoving: dx !== 0 || dy !== 0
        };
    }
    return { ...entity, isMoving: false };
};

// ==========================================
// ダンジョン生成ロジック
// ==========================================

type DungeonGeneratorFunc = (floor: number, player: Entity) => Pick<GameState, 'map' | 'enemies' | 'items' | 'player'>;

// 共通初期化: 壁で埋める
const initTiles = (width: number, height: number, fillVal = 1) => {
  const tiles: number[][] = [];
  for(let y = 0; y < height; y++) tiles[y] = Array(width).fill(fillVal);
  return tiles;
};

/**
 * Type A: スタンダード・グリッド
 */
const generateGridDungeon: DungeonGeneratorFunc = (floor, player) => {
  const width = MAP_WIDTH;
  const height = MAP_HEIGHT;
  const tiles = initTiles(width, height);
  const rooms: any[] = [];
  const maxRooms = 10 + Math.floor(Math.random() * 5); 

  // 部屋生成
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
          fillRoom(tiles, { x: roomX, y: roomY, w: roomW, h: roomH });
          rooms.push({ x: roomX, y: roomY, w: roomW, h: roomH });
      }
  }

  // 通路生成
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

  const startRoom = rooms[0];
  const newPlayer = { ...player, x: (startRoom.x + startRoom.w/2)*GRID_SIZE, y: (startRoom.y + startRoom.h/2)*GRID_SIZE };
  const { enemies, items } = placeEntities(rooms, floor);

  return { map: { width, height, tiles, rooms }, enemies, items, player: newPlayer };
};

/**
 * Type B: 大広間 (Open Field)
 */
const generateOpenDungeon: DungeonGeneratorFunc = (floor, player) => {
    const width = MAP_WIDTH;
    const height = MAP_HEIGHT;
    const tiles = initTiles(width, height, 0); // 初期床

    // 外周を壁に
    for(let y = 0; y < height; y++) {
        for(let x = 0; x < width; x++) {
            if (y === 0 || y === height - 1 || x === 0 || x === width - 1) tiles[y][x] = 1;
        }
    }
    
    const rooms = [{ x: 1, y: 1, w: width - 2, h: height - 2 }];
    const newPlayer = { ...player, x: 5 * GRID_SIZE, y: 5 * GRID_SIZE };

    const enemies: Entity[] = [];
    const items: Item[] = [];
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
    
    return { map: { width, height, tiles, rooms }, enemies, items, player: newPlayer };
};

/**
 * Type C: 三柱の間 (Vertical Pillars)
 * 縦長の中部屋(幅狭め、高さ十分)を3つ横に並べる
 */
const generatePillarsDungeon: DungeonGeneratorFunc = (floor, player) => {
    const width = MAP_WIDTH;
    const height = MAP_HEIGHT;
    const tiles = initTiles(width, height);
    const rooms: any[] = [];

    // 3つの柱（部屋）を定義
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

    // 部屋間を通路で繋ぐ（上部と下部でランダムに）
    for (let i = 0; i < 2; i++) {
        const r1 = rooms[i];
        const r2 = rooms[i+1];
        
        // 2本ずつ通路を通す
        const y1 = r1.y + 5;
        const y2 = r1.y + r1.h - 5;
        
        createHCorridor(tiles, r1.x + r1.w - 1, r2.x, y1);
        createHCorridor(tiles, r1.x + r1.w - 1, r2.x, y2);
    }

    const startRoom = rooms[1]; // 中央からスタート
    const newPlayer = { ...player, x: (startRoom.x + startRoom.w/2)*GRID_SIZE, y: (startRoom.y + startRoom.h - 2)*GRID_SIZE };
    const { enemies, items } = placeEntities(rooms, floor);

    return { map: { width, height, tiles, rooms }, enemies, items, player: newPlayer };
};

/**
 * Type D: 蛇行回廊 (Snake Road)
 * 縦3 x 横5 のエリアを定義し、一本道で繋ぐ
 */
const generateSnakeDungeon: DungeonGeneratorFunc = (floor, player) => {
    const width = 50;
    const height = 30; // 少し横長
    const tiles = initTiles(width, height);
    const rooms: any[] = [];

    // グリッド設定 (5x3)
    const gridCols = 5;
    const gridRows = 3;
    const cellW = Math.floor(width / gridCols);
    const cellH = Math.floor(height / gridRows);

    // 蛇行ルート生成 (左上->右へ->一段下へ->左へ...のジグザグ)
    for (let row = 0; row < gridRows; row++) {
        const isRight = row % 2 === 0;
        const colStart = isRight ? 0 : gridCols - 1;
        const colEnd = isRight ? gridCols : -1;
        const step = isRight ? 1 : -1;

        for (let col = colStart; col !== colEnd; col += step) {
             // 部屋生成
             const roomW = Math.floor(cellW * 0.7);
             const roomH = Math.floor(cellH * 0.7);
             const roomX = col * cellW + 2;
             const roomY = row * cellH + 2;
             
             const room = { x: roomX, y: roomY, w: roomW, h: roomH };
             fillRoom(tiles, room);
             rooms.push(room);
             
             // 一つ前の部屋と繋ぐ
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

    return { map: { width, height, tiles, rooms }, enemies, items, player: newPlayer };
};

/**
 * Type E: トライアル・メイズ (Maze)
 * 穴掘り法による迷路生成
 */
const generateMazeDungeon: DungeonGeneratorFunc = (floor, player) => {
    const width = 41; // 奇数推奨
    const height = 41;
    const tiles = initTiles(width, height);
    
    // 穴掘り法
    const startX = 1;
    const startY = 1;
    tiles[startY][startX] = 0;

    const directions = [
        { x: 0, y: -2 }, // Up
        { x: 0, y: 2 },  // Down
        { x: -2, y: 0 }, // Left
        { x: 2, y: 0 }   // Right
    ];

    const dig = (x: number, y: number) => {
        // シャッフル
        const dirs = [...directions].sort(() => Math.random() - 0.5);
        
        for (const dir of dirs) {
            const nx = x + dir.x;
            const ny = y + dir.y;
            
            if (nx > 0 && nx < width - 1 && ny > 0 && ny < height - 1 && tiles[ny][nx] === 1) {
                tiles[y + dir.y / 2][x + dir.x / 2] = 0; // 通路
                tiles[ny][nx] = 0; // 掘り進む先
                dig(nx, ny);
            }
        }
    };

    dig(startX, startY);

    // 一部の壁を取り払ってループを作る（難易度調整）
    for(let i=0; i<30; i++) {
        const x = 1 + Math.floor(Math.random() * (width - 2));
        const y = 1 + Math.floor(Math.random() * (height - 2));
        if (tiles[y][x] === 1) tiles[y][x] = 0;
    }

    // 部屋として認識させるためのダミーデータ
    const rooms = [{ x: 1, y: 1, w: width-2, h: height-2 }];
    
    const newPlayer = { ...player, x: startX * GRID_SIZE, y: startY * GRID_SIZE };
    
    // 敵配置: 通路上のランダムな位置
    const enemies: Entity[] = [];
    const items: Item[] = [];
    const enemyKeys = Object.keys(ENEMIES);

    for(let i=0; i<10 + floor; i++) {
        let ex, ey;
        do {
            ex = Math.floor(Math.random() * width);
            ey = Math.floor(Math.random() * height);
        } while(tiles[ey][ex] === 1 || (Math.abs(ex - startX) < 5 && Math.abs(ey - startY) < 5));
        
        const enemyKey = enemyKeys[Math.floor(Math.random() * enemyKeys.length)];
        enemies.push(createEnemyInstance(enemyKey, ex, ey, i, floor));
    }

    return { map: { width, height, tiles, rooms }, enemies, items, player: newPlayer };
};

/**
 * Type F: ボス階層 (Boss Floor)
 */
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

    return { map: { width, height, tiles, rooms }, enemies, items: [], player: newPlayer };
};

// ... createEnemyInstance, placeEntities, fillRoom, createHCorridor, createVCorridor は変更なし ...
// (以前のコードブロックの内容を保持してください)
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
            maxHp: enemyDef.baseStats.maxHp,
            hp: enemyDef.baseStats.maxHp,
            attack: enemyDef.baseStats.attack,
            defense: enemyDef.baseStats.defense,
            level: floor,
            exp: enemyDef.expReward,
            nextLevelExp: 0,
            speed: 0.5
        }
    };
};

const placeEntities = (rooms: any[], floor: number) => {
    const enemies: Entity[] = [];
    const items: Item[] = [];
    const enemyKeys = Object.keys(ENEMIES);
    const itemKeys = Object.keys(ITEMS);

    for (let i = 1; i < rooms.length; i++) {
        const room = rooms[i];
        if (Math.random() < 0.5) {
            const enemyKey = enemyKeys[Math.floor(Math.random() * enemyKeys.length)];
            const ex = Math.floor(room.x + Math.random() * room.w);
            const ey = Math.floor(room.y + Math.random() * room.h);
            enemies.push(createEnemyInstance(enemyKey, ex, ey, i, floor));
        }
        if (Math.random() < 0.3) {
            const itemKey = itemKeys[Math.floor(Math.random() * itemKeys.length)];
            const ix = (room.x + Math.floor(Math.random() * room.w)) * GRID_SIZE;
            const iy = (room.y + Math.floor(Math.random() * room.h)) * GRID_SIZE;
            items.push({ id: `item_${i}`, itemId: itemKey, x: ix, y: iy });
        }
    }
    return { enemies, items };
};

const fillRoom = (tiles: number[][], room: {x:number, y:number, w:number, h:number}) => {
    for (let y = room.y; y < room.y + room.h; y++) {
        for (let x = room.x; x < room.x + room.w; x++) {
            tiles[y][x] = 0;
        }
    }
};

const createHCorridor = (tiles: number[][], x1: number, x2: number, y: number) => {
    const start = Math.min(x1, x2);
    const end = Math.max(x1, x2);
    for (let x = start; x <= end; x++) tiles[y][x] = 0;
}

const createVCorridor = (tiles: number[][], y1: number, y2: number, x: number) => {
    const start = Math.min(y1, y2);
    const end = Math.max(y1, y2);
    for (let y = start; y <= end; y++) tiles[y][x] = 0;
}

// ==========================================
// メイン生成関数 (Strategy Pattern)
// ==========================================

export const generateDungeon: DungeonGeneratorFunc = (floor, player) => {
    // 1. ボス階層チェック (5階層ごと)
    if (floor % 5 === 0) {
        console.log(`Generating Boss Floor for Level ${floor}`);
        return generateBossFloor(floor, player);
    }

    // 2. 確率テーブルに基づいた抽選
    const rand = Math.random();
    
    // 階層テーブル実装
    if (floor <= 4) {
        // 1-4F: A(80%), C(20%)
        if (rand < 0.2) return generatePillarsDungeon(floor, player); // Type C
        return generateGridDungeon(floor, player); // Type A (Default)
    } 
    else {
        // 6F以降 (5F,10FはBoss): バリエーション豊かに
        // A(40%), B(20%), D(20%), E(20%)
        if (rand < 0.2) return generateOpenDungeon(floor, player); // Type B
        if (rand < 0.4) return generateSnakeDungeon(floor, player); // Type D
        if (rand < 0.6) return generateMazeDungeon(floor, player); // Type E
        return generateGridDungeon(floor, player); // Type A
    }
};
