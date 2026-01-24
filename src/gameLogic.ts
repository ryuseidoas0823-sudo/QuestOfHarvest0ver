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
// ダンジョン生成ロジック (改修部分)
// ==========================================

// ダンジョン生成関数の型定義
type DungeonGeneratorFunc = (floor: number, player: Entity) => Pick<GameState, 'map' | 'enemies' | 'items' | 'player'>;

/**
 * Type A: スタンダード・グリッド
 * 4x4程度の部屋を生成し、通路で繋ぐ
 */
const generateGridDungeon: DungeonGeneratorFunc = (floor, player) => {
  const width = MAP_WIDTH;
  const height = MAP_HEIGHT;
  const tiles: number[][] = [];
  
  // 初期化：壁
  for(let y = 0; y < height; y++) {
      tiles[y] = Array(width).fill(1);
  }

  const rooms: any[] = [];
  const maxRooms = 10 + Math.floor(Math.random() * 5); 

  // 部屋生成
  for (let i = 0; i < maxRooms; i++) {
      const roomW = 6 + Math.floor(Math.random() * 8); 
      const roomH = 6 + Math.floor(Math.random() * 8);
      const roomX = 2 + Math.floor(Math.random() * (width - roomW - 4));
      const roomY = 2 + Math.floor(Math.random() * (height - roomH - 4));

      // 重なりチェック
      let overlap = false;
      for (const r of rooms) {
          if (
              roomX < r.x + r.w + 1 &&
              roomX + roomW + 1 > r.x &&
              roomY < r.y + r.h + 1 &&
              roomY + roomH + 1 > r.y
          ) {
              overlap = true;
              break;
          }
      }

      if (!overlap) {
          for (let y = roomY; y < roomY + roomH; y++) {
              for (let x = roomX; x < roomX + roomW; x++) {
                  tiles[y][x] = 0;
              }
          }
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

  // プレイヤー配置（最初の部屋）
  const startRoom = rooms[0];
  const newPlayer = {
      ...player,
      x: (startRoom.x + Math.floor(startRoom.w / 2)) * GRID_SIZE,
      y: (startRoom.y + Math.floor(startRoom.h / 2)) * GRID_SIZE
  };

  // 敵・アイテム配置
  const { enemies, items } = placeEntities(rooms, floor);

  return {
      map: { width, height, tiles, rooms },
      enemies,
      items,
      player: newPlayer
  };
};

/**
 * Type B: 大広間 (Open Field)
 * 壁のない広大な部屋。中央に敵が密集する傾向。
 */
const generateOpenDungeon: DungeonGeneratorFunc = (floor, player) => {
    const width = MAP_WIDTH;
    const height = MAP_HEIGHT;
    const tiles: number[][] = [];

    // 外周以外を床にする
    for(let y = 0; y < height; y++) {
        tiles[y] = [];
        for(let x = 0; x < width; x++) {
            if (y === 0 || y === height - 1 || x === 0 || x === width - 1) {
                tiles[y][x] = 1; // 壁
            } else {
                tiles[y][x] = 0; // 床
            }
        }
    }
    
    // 全体を一つの部屋として定義
    const rooms = [{ x: 1, y: 1, w: width - 2, h: height - 2 }];

    // プレイヤー配置 (左上付近)
    const newPlayer = {
        ...player,
        x: 5 * GRID_SIZE,
        y: 5 * GRID_SIZE
    };

    // 敵・アイテム配置（数多め）
    const enemies: Entity[] = [];
    const items: Item[] = [];
    const enemyKeys = Object.keys(ENEMIES);

    // 大広間用配置ロジック
    // 中央付近に敵を固める
    const centerX = width / 2;
    const centerY = height / 2;

    for (let i = 0; i < 15 + floor; i++) { // フロアが進むほど増える
        const enemyKey = enemyKeys[Math.floor(Math.random() * enemyKeys.length)];
        const enemyDef = ENEMIES[enemyKey];
        if (!enemyDef) continue;
        
        // 中央から少し散らばらせる
        const offsetRange = 15; 
        const ex = Math.floor(centerX + (Math.random() * offsetRange - offsetRange/2));
        const ey = Math.floor(centerY + (Math.random() * offsetRange - offsetRange/2));

        // プレイヤーの近くには配置しない
        if (Math.abs(ex - 5) < 5 && Math.abs(ey - 5) < 5) continue;

        if (ex > 1 && ex < width - 1 && ey > 1 && ey < height - 1) {
             enemies.push(createEnemyInstance(enemyKey, ex, ey, i, floor));
        }
    }
    
    // アイテム配置（ランダム）
    // ...省略（必要なら追加）

    return {
        map: { width, height, tiles, rooms },
        enemies,
        items,
        player: newPlayer
    };
};

/**
 * Type F: ボス階層 (Boss Floor)
 * 休憩所 -> 門 -> ボス部屋 -> 宝部屋
 */
const generateBossFloor: DungeonGeneratorFunc = (floor, player) => {
    const width = 40; // 少し狭めでOK
    const height = 60; // 縦長
    const tiles: number[][] = [];
    
    // 初期化：壁
    for(let y = 0; y < height; y++) tiles[y] = Array(width).fill(1);

    const rooms: any[] = [];
    
    // 1. 休憩エリア (手前)
    const restRoom = { x: 15, y: 50, w: 10, h: 8 };
    fillRoom(tiles, restRoom);
    rooms.push(restRoom);

    // 2. ボスエリア (中央)
    const bossRoom = { x: 10, y: 20, w: 20, h: 20 };
    fillRoom(tiles, bossRoom);
    rooms.push(bossRoom);

    // 3. 奥の部屋 (最奥)
    const treasureRoom = { x: 18, y: 5, w: 4, h: 4 };
    fillRoom(tiles, treasureRoom);
    rooms.push(treasureRoom);

    // 通路で繋ぐ
    createVCorridor(tiles, restRoom.y, bossRoom.y + bossRoom.h, 20); // 休憩-ボス間
    createVCorridor(tiles, bossRoom.y, treasureRoom.y + treasureRoom.h, 20); // ボス-宝間

    // プレイヤー配置
    const newPlayer = {
        ...player,
        x: (restRoom.x + restRoom.w / 2) * GRID_SIZE,
        y: (restRoom.y + restRoom.h / 2) * GRID_SIZE
    };

    // ボス配置
    const enemies: Entity[] = [];
    const bossKey = 'orc'; // 仮のボス (実際は BOSS データから取得)
    const bossX = (bossRoom.x + bossRoom.w / 2);
    const bossY = (bossRoom.y + bossRoom.h / 2);
    
    // ボスを少し大きく強くして配置
    const bossEnemy = createEnemyInstance(bossKey, bossX, bossY, 999, floor + 5);
    bossEnemy.width = GRID_SIZE * 2;
    bossEnemy.height = GRID_SIZE * 2;
    bossEnemy.stats.maxHp *= 5;
    bossEnemy.stats.hp *= 5;
    bossEnemy.stats.attack *= 2;
    enemies.push(bossEnemy);

    // 取り巻き配置
    enemies.push(createEnemyInstance('goblin', bossX - 3, bossY + 3, 901, floor));
    enemies.push(createEnemyInstance('goblin', bossX + 3, bossY + 3, 902, floor));

    return {
        map: { width, height, tiles, rooms },
        enemies,
        items: [], // ボス部屋にはアイテムなし
        player: newPlayer
    };
};

/**
 * 汎用敵生成ヘルパー
 */
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

/**
 * 汎用エンティティ配置ヘルパー (Grid用)
 */
const placeEntities = (rooms: any[], floor: number) => {
    const enemies: Entity[] = [];
    const items: Item[] = [];
    const enemyKeys = Object.keys(ENEMIES);
    const itemKeys = Object.keys(ITEMS);

    // 最初の部屋以外に配置
    for (let i = 1; i < rooms.length; i++) {
        const room = rooms[i];
        
        // 敵配置 (50%の確率)
        if (Math.random() < 0.5) {
            const enemyKey = enemyKeys[Math.floor(Math.random() * enemyKeys.length)];
            const ex = Math.floor(room.x + Math.random() * room.w);
            const ey = Math.floor(room.y + Math.random() * room.h);
            enemies.push(createEnemyInstance(enemyKey, ex, ey, i, floor));
        }

        // アイテム配置 (30%の確率)
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

    // 2. その他の階層の抽選
    const rand = Math.random();
    
    // 6階層以降はバリエーションを増やす
    if (floor >= 6) {
        if (rand < 0.2) {
            // 20% で大広間
            console.log(`Generating Open Field for Level ${floor}`);
            return generateOpenDungeon(floor, player);
        }
        // 他のパターンもここに追加 (Maze, Snake等)
    }

    // デフォルト: Grid
    console.log(`Generating Grid Dungeon for Level ${floor}`);
    return generateGridDungeon(floor, player);
};
