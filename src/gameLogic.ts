import { GameState, Position, Entity, Direction, Stats, Projectile, Item, MapData, Equipment } from './types';
import { JOBS } from './data/jobs';
import { GODS } from './data/gods';
import { SKILLS } from './data/skills';
import { ENEMIES } from './data/enemies';
import { ITEMS } from './data/items';
import { JobId } from './types/job';

const GRID_SIZE = 40;
const MAP_WIDTH = 50;
const MAP_HEIGHT = 50;

// タイル定義
const TILE_FLOOR = 0;
const TILE_WALL = 1;
const TILE_LAVA = 2;
const TILE_LOCKED_DOOR = 3;
const TILE_SECRET_WALL = 4;
const TILE_STAIRS = 5;
const TILE_BOSS_DOOR = 6;

// MapData型の拡張
interface ExtendedMapData extends MapData {
  isDark?: boolean;
}

// ==========================================
// ステータス計算ロジック (再計算用)
// ==========================================
const calculatePlayerStats = (basePlayer: Entity, equipment: Equipment): Stats => {
    const jobDef = JOBS[basePlayer.jobId as string];
    const godDef = GODS[basePlayer.godId as string];
    
    // 1. 基本ステータス (職業 + レベル成長)
    // 簡易計算: 初期値 + (レベル-1 * 成長率)
    const level = basePlayer.stats.level;
    let maxHp = jobDef.baseStats.maxHp + (level - 1) * jobDef.growthRates.maxHp;
    let attack = jobDef.baseStats.attack + (level - 1) * jobDef.growthRates.attack;
    let defense = jobDef.baseStats.defense + (level - 1) * jobDef.growthRates.defense;

    // 2. 神の恩恵 (パッシブ)
    if (godDef) {
        if (godDef.passiveBonus.maxHp) maxHp += godDef.passiveBonus.maxHp;
        if (godDef.passiveBonus.attack) attack += godDef.passiveBonus.attack;
        if (godDef.passiveBonus.defense) defense += godDef.passiveBonus.defense;
    }

    // 3. 装備補正
    if (equipment.mainHand) {
        const weapon = ITEMS[equipment.mainHand];
        if (weapon && weapon.baseStats) {
            if (weapon.baseStats.attack) attack += weapon.baseStats.attack;
            if (weapon.baseStats.defense) defense += weapon.baseStats.defense;
            if (weapon.baseStats.maxHp) maxHp += weapon.baseStats.maxHp;
        }
    }
    if (equipment.armor) {
        const armor = ITEMS[equipment.armor];
        if (armor && armor.baseStats) {
            if (armor.baseStats.attack) attack += armor.baseStats.attack;
            if (armor.baseStats.defense) defense += armor.baseStats.defense;
            if (armor.baseStats.maxHp) maxHp += armor.baseStats.maxHp;
        }
    }

    // 現在HPが最大HPを超えないように調整（回復はしない）
    const currentHp = Math.min(basePlayer.stats.hp, maxHp);

    return {
        ...basePlayer.stats,
        maxHp: Math.floor(maxHp),
        hp: currentHp, // 現在HPは維持
        attack: Math.floor(attack),
        defense: Math.floor(defense),
        critRate: (godDef?.passiveBonus.critRate || 0),
        dropRate: (godDef?.passiveBonus.dropRate || 1.0),
    };
};

export const createInitialPlayer = (jobId: JobId, godId: string, startPos: Position): Entity => {
  const jobDef = JOBS[jobId];
  const godDef = GODS[godId];
  
  if (!jobDef) throw new Error(`Job definition not found: ${jobId}`);
  if (!godDef) throw new Error(`God definition not found: ${godId}`);

  // 仮のStatsを作成
  const initialStats: Stats = {
    maxHp: jobDef.baseStats.maxHp,
    hp: jobDef.baseStats.maxHp,
    attack: jobDef.baseStats.attack,
    defense: jobDef.baseStats.defense,
    level: 1,
    exp: 0,
    nextLevelExp: 100,
    speed: 1,
  };

  const player: Entity = {
    id: 'player',
    type: 'player',
    x: startPos.x * GRID_SIZE,
    y: startPos.y * GRID_SIZE,
    width: GRID_SIZE,
    height: GRID_SIZE,
    color: godDef.color,
    direction: 'down',
    isMoving: false,
    stats: initialStats,
    jobId: jobId, 
    godId: godId,
    skills: [...jobDef.learnableSkills],
    skillCooldowns: {},
  };

  // ステータスを正規計算（神ボーナスなど適用）
  player.stats = calculatePlayerStats(player, { mainHand: null, armor: null });
  player.stats.hp = player.stats.maxHp; // 初期生成時はHP全快

  return player;
};

// ... getDirectionVector, checkCollision, activateSkill ... 
// (変更なしのため省略、ファイル結合時は前回のコードを使用)
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
        const tile = map.tiles[gridY][gridX];
        if (tile === TILE_WALL || tile === TILE_LOCKED_DOOR || tile === TILE_SECRET_WALL || tile === TILE_BOSS_DOOR) return true;
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

// ... checkDungeonEvents (変更なし) ...
const checkDungeonEvents = (state: GameState): GameState => {
    let newState = { ...state };
    const { player, map, gameTime } = newState;
    
    // ダメージ床
    const cx = player.x + player.width / 2;
    const cy = player.y + player.height / 2;
    const gridX = Math.floor(cx / GRID_SIZE);
    const gridY = Math.floor(cy / GRID_SIZE);

    if (gridY >= 0 && gridY < map.height && gridX >= 0 && gridX < map.width) {
        if (map.tiles[gridY][gridX] === TILE_LAVA) {
            if (gameTime % 500 < 16) {
                const damage = Math.max(1, Math.floor(player.stats.maxHp * 0.05)); 
                newState.player.stats.hp -= damage;
                newState.messages = [`溶岩で ${damage} のダメージ！`, ...newState.messages].slice(0, 10);
            }
        }
    }

    // モンスターハウス
    if (map.rooms) {
        map.rooms.forEach((room: any) => {
            if (room.type === 'monster_house' && !room.triggered) {
                if (gridX >= room.x && gridX < room.x + room.w &&
                    gridY >= room.y && gridY < room.y + room.h) {
                    
                    room.triggered = true;
                    newState.messages = [`モンスターハウスだ！！`, ...newState.messages].slice(0, 10);
                    const enemyKeys = Object.keys(ENEMIES);
                    const spawnCount = 5 + Math.floor(Math.random() * 5); 
                    for (let i = 0; i < spawnCount; i++) {
                        const enemyKey = enemyKeys[Math.floor(Math.random() * enemyKeys.length)];
                        const ex = Math.floor(room.x + Math.random() * room.w);
                        const ey = Math.floor(room.y + Math.random() * room.h);
                        if (ex === gridX && ey === gridY) continue;
                        newState.enemies.push(createEnemyInstance(enemyKey, ex, ey, 9000 + i + gameTime, 1));
                    }
                }
            }
        });
    }
    return newState;
};

// ... checkLevelUp (変更なし) ...
const checkLevelUp = (player: Entity, messages: string[]): { player: Entity, messages: string[] } => {
    let newPlayer = { ...player };
    let newMessages = [...messages];

    while (newPlayer.stats.exp >= newPlayer.stats.nextLevelExp) {
        newPlayer.stats.exp -= newPlayer.stats.nextLevelExp;
        newPlayer.stats.level += 1;
        newPlayer.stats.nextLevelExp = Math.floor(newPlayer.stats.nextLevelExp * 1.2); 

        newPlayer.stats.maxHp += 10;
        newPlayer.stats.hp = newPlayer.stats.maxHp; 
        newPlayer.stats.attack += 2;
        newPlayer.stats.defense += 1;

        newMessages = [`レベルアップ！ Lv.${newPlayer.stats.level} になった！`, ...newMessages].slice(0, 10);
    }
    return { player: newPlayer, messages: newMessages };
};

// ==========================================
// アイテム使用・装備ロジック (新規)
// ==========================================
export const useItem = (state: GameState, itemId: string): GameState => {
    const itemDef = ITEMS[itemId];
    if (!itemDef) return state;

    let newState = { ...state };
    let inventory = [...newState.inventory];
    let equipment = { ...newState.equipment };
    let messages = [...newState.messages];
    
    // インベントリから1つ削除
    const idx = inventory.indexOf(itemId);
    if (idx === -1) return state; // 持ってない
    inventory.splice(idx, 1);

    if (itemDef.type === 'consumable') {
        // 消費アイテム
        if (itemDef.effects) {
            itemDef.effects.forEach(effect => {
                if (effect.type === 'heal_hp') {
                    const heal = effect.value;
                    const oldHp = newState.player.stats.hp;
                    newState.player.stats.hp = Math.min(newState.player.stats.maxHp, newState.player.stats.hp + heal);
                    messages = [`${itemDef.name}を使用: HP ${newState.player.stats.hp - oldHp} 回復`, ...messages];
                }
                // 他の効果があればここに追加
            });
        }
    } 
    else if (itemDef.type === 'weapon') {
        // 武器装備
        if (equipment.mainHand) {
            // 既に装備していたものをインベントリに戻す
            inventory.push(equipment.mainHand);
        }
        equipment.mainHand = itemId;
        messages = [`${itemDef.name} を装備した！`, ...messages];
    }
    else if (itemDef.type === 'armor') {
        // 防具装備
        if (equipment.armor) {
            inventory.push(equipment.armor);
        }
        equipment.armor = itemId;
        messages = [`${itemDef.name} を装備した！`, ...messages];
    }

    newState.inventory = inventory;
    newState.equipment = equipment;
    newState.messages = messages.slice(0, 10);

    // ステータス再計算
    newState.player.stats = calculatePlayerStats(newState.player, newState.equipment);

    return newState;
};


// ==========================================
// 更新ロジック (アイテム取得対応)
// ==========================================
export const updateGameLogic = (state: GameState, input: { keys: Record<string, boolean> }): GameState => {
  let newState = { ...state };
  
  // 1. プレイヤー移動
  const speed = state.player.stats.speed * 3;
  let dx = 0;
  let dy = 0;
  
  if (input.keys['ArrowUp'] || input.keys['w']) { dy -= speed; newState.player.direction = 'up'; }
  if (input.keys['ArrowDown'] || input.keys['s']) { dy += speed; newState.player.direction = 'down'; }
  if (input.keys['ArrowLeft'] || input.keys['a']) { dx -= speed; newState.player.direction = 'left'; }
  if (input.keys['ArrowRight'] || input.keys['d']) { dx += speed; newState.player.direction = 'right'; }

  if (dx !== 0 || dy !== 0) {
      newState.player.isMoving = true;
      const targetX = newState.player.x + dx;
      const targetY = newState.player.y + dy;

      if (!checkCollision(targetX, targetY, newState.player.width, newState.player.height, newState.map)) {
          newState.player.x = targetX;
          newState.player.y = targetY;
          
          // アイテム取得判定 (足元にあるか)
          // プレイヤーの中心座標
          const cx = newState.player.x + newState.player.width / 2;
          const cy = newState.player.y + newState.player.height / 2;
          
          const remainingItems: Item[] = [];
          newState.items.forEach(item => {
              // アイテムの中心 (簡易)
              const icx = item.x + 20; // GRID/2
              const icy = item.y + 20;
              
              const dist = Math.sqrt((cx - icx) ** 2 + (cy - icy) ** 2);
              if (dist < 20) { // 接触
                  // インベントリに追加
                  newState.inventory = [...newState.inventory, item.itemId];
                  const itemDef = ITEMS[item.itemId];
                  newState.messages = [`${itemDef ? itemDef.name : item.itemId} を拾った`, ...newState.messages].slice(0, 10);
              } else {
                  remainingItems.push(item);
              }
          });
          newState.items = remainingItems;

      } else {
          // 衝突時の特殊インタラクション (扉など)
          const centerX = newState.player.x + newState.player.width / 2;
          const centerY = newState.player.y + newState.player.height / 2;
          const checkX = Math.floor((centerX + dx * 2) / GRID_SIZE);
          const checkY = Math.floor((centerY + dy * 2) / GRID_SIZE);

          if (checkX >= 0 && checkX < MAP_WIDTH && checkY >= 0 && checkY < MAP_HEIGHT) {
              const tile = newState.map.tiles[checkY][checkX];
              if (tile === TILE_LOCKED_DOOR) {
                  const keyIndex = (newState.inventory || []).indexOf('dungeon_key');
                  if (keyIndex !== -1) {
                      const newInv = [...newState.inventory];
                      newInv.splice(keyIndex, 1);
                      newState.inventory = newInv;
                      
                      const newTiles = [...newState.map.tiles];
                      newTiles[checkY] = [...newTiles[checkY]];
                      newTiles[checkY][checkX] = TILE_FLOOR;
                      newState.map = { ...newState.map, tiles: newTiles };
                      newState.messages = ['宝物庫の鍵を使った！', ...newState.messages].slice(0, 10);
                  }
              } else if (tile === TILE_BOSS_DOOR) {
                  newState.messages = ['強力な封印が施されている...ボスを倒さねば。', ...newState.messages].slice(0, 10);
              }
          }
      }
  } else {
      newState.player.isMoving = false;
  }

  // 2. 階段移動チェック (Enterキー)
  if (input.keys['Enter']) {
      const cx = newState.player.x + newState.player.width / 2;
      const cy = newState.player.y + newState.player.height / 2;
      const gridX = Math.floor(cx / GRID_SIZE);
      const gridY = Math.floor(cy / GRID_SIZE);

      if (gridX >= 0 && gridX < MAP_WIDTH && gridY >= 0 && gridY < MAP_HEIGHT) {
          if (newState.map.tiles[gridY][gridX] === TILE_STAIRS) {
              const nextFloor = newState.floor + 1;
              const dungeonData = generateDungeon(nextFloor, newState.player);
              
              return {
                  ...newState,
                  floor: nextFloor,
                  map: dungeonData.map,
                  enemies: dungeonData.enemies,
                  items: dungeonData.items,
                  player: dungeonData.player,
                  projectiles: [],
                  messages: [`地下 ${nextFloor} 階に到達した。`, ...newState.messages].slice(0, 10),
              };
          }
      }
  }
  
  newState = checkDungeonEvents(newState);

  // 3. プロジェクタイル更新
  if (newState.projectiles && newState.projectiles.length > 0) {
    const updatedProjectiles: Projectile[] = [];
    newState.projectiles.forEach(p => {
      const moveVec = getDirectionVector(p.direction);
      const nextX = p.x + moveVec.x * p.speed;
      const nextY = p.y + moveVec.y * p.speed;
      p.lifeTime -= 16;
      if (p.lifeTime <= 0) return;
      
      const gridX = Math.floor((nextX + p.width/2) / GRID_SIZE);
      const gridY = Math.floor((nextY + p.height/2) / GRID_SIZE);
      
      if (gridX >= 0 && gridX < MAP_WIDTH && gridY >= 0 && gridY < MAP_HEIGHT) {
          if (newState.map.tiles[gridY][gridX] === TILE_SECRET_WALL) {
              const newTiles = [...newState.map.tiles];
              newTiles[gridY] = [...newTiles[gridY]];
              newTiles[gridY][gridX] = TILE_FLOOR;
              newState.map = { ...newState.map, tiles: newTiles };
              newState.messages = ['壁が崩れ落ちた！', ...newState.messages].slice(0, 10);
              return; 
          }
      }

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
        
        if (newState.enemies.length !== hitEnemies.filter(e => e.stats.hp > 0).length) {
            const expGain = 10 + newState.floor * 2;
            newState.player.stats.exp += expGain;
            
            const res = checkLevelUp(newState.player, newState.messages);
            newState.player = res.player;
            newState.messages = res.messages;

            const defeated = hitEnemies.find(e => e.stats.hp <= 0);
            if (defeated && defeated.id.includes('enemy_999')) {
                 newState.messages = ['フロアの主を倒した！封印が解かれる音がする...', ...newState.messages].slice(0, 10);
                 
                 const newTiles = [...newState.map.tiles];
                 for(let y=0; y<newState.map.height; y++) {
                     for(let x=0; x<newState.map.width; x++) {
                         if (newTiles[y][x] === TILE_BOSS_DOOR) {
                             newTiles[y] = [...newTiles[y]];
                             newTiles[y][x] = TILE_FLOOR;
                         }
                     }
                 }
                 newState.map = { ...newState.map, tiles: newTiles };
            }
        }
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

// moveEntity, generateDungeon などの他の関数は変更なしのため省略
// ファイル結合時はこれらも含めてください
// ... (generateDungeon, etc.)
// ==========================================
// ダンジョン生成ロジック
// ==========================================

type DungeonGeneratorFunc = (floor: number, player: Entity) => Pick<GameState, 'map' | 'enemies' | 'items' | 'player'>;

const initTiles = (width: number, height: number, fillVal = TILE_WALL) => {
  const tiles: number[][] = [];
  for(let y = 0; y < height; y++) tiles[y] = Array(width).fill(fillVal);
  return tiles;
};

// 階段配置ヘルパー
const placeStairs = (tiles: number[][], rooms: any[], type: 'grid' | 'other' = 'grid') => {
    // 最後の部屋、または遠い場所に階段を置く
    if (rooms.length > 0) {
        const lastRoom = rooms[rooms.length - 1];
        const sx = Math.floor(lastRoom.x + lastRoom.w / 2);
        const sy = Math.floor(lastRoom.y + lastRoom.h / 2);
        
        // 壁でなければ配置
        if (tiles[sy][sx] === TILE_FLOOR) {
            tiles[sy][sx] = TILE_STAIRS;
        } else {
            // 床を探す
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
}
const createVCorridor = (tiles: number[][], y1: number, y2: number, x: number) => {
    const start = Math.min(y1, y2);
    const end = Math.max(y1, y2);
    for (let y = start; y <= end; y++) if(y>=0 && y<tiles.length && x>=0 && x<tiles[0].length) tiles[y][x] = TILE_FLOOR;
}

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
            maxHp: Math.floor(enemyDef.baseStats.maxHp * (1 + floor * 0.1)), // 階層補正
            hp: Math.floor(enemyDef.baseStats.maxHp * (1 + floor * 0.1)),
            attack: Math.floor(enemyDef.baseStats.attack * (1 + floor * 0.05)),
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

/**
 * Type A: スタンダード・グリッド
 */
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

  // 階段配置
  placeStairs(tiles, rooms);

  const newPlayer = { ...player, x: (startRoom.x + startRoom.w/2)*GRID_SIZE, y: (startRoom.y + startRoom.h/2)*GRID_SIZE };
  const { enemies, items } = placeEntities(rooms, floor);

  return { map: { width, height, tiles, rooms }, enemies, items, player: newPlayer };
};

/**
 * Type B: 大広間
 */
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
    
    // 階段配置
    placeStairs(tiles, rooms);

    return { map: { width, height, tiles, rooms }, enemies, items, player: newPlayer };
};

/**
 * Type C: 三柱の間
 */
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

/**
 * Type D: 蛇行回廊
 */
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

/**
 * Type E: トライアル・メイズ
 */
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
    
    // 迷路のゴール地点に階段
    let sx, sy;
    do {
        sx = Math.floor(Math.random() * width);
        sy = Math.floor(Math.random() * height);
    } while(tiles[sy][sx] === TILE_WALL || (Math.abs(sx - startX) < 20 && Math.abs(sy - startY) < 20));
    tiles[sy][sx] = TILE_STAIRS;

    return { map: { width, height, tiles, rooms }, enemies, items, player: newPlayer };
};

/**
 * Type F: ボス階層
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

    // 通路
    createVCorridor(tiles, restRoom.y, bossRoom.y + bossRoom.h, 20);
    // ボス部屋と宝部屋の間には「封印された扉」を配置
    // 通路を掘ってから、特定座標を扉にする
    createVCorridor(tiles, bossRoom.y, treasureRoom.y + treasureRoom.h, 20);
    // ボス部屋上部の通路を扉で塞ぐ
    tiles[bossRoom.y - 1][20] = TILE_BOSS_DOOR; 
    tiles[bossRoom.y - 2][20] = TILE_BOSS_DOOR; 

    const newPlayer = { ...player, x: (restRoom.x + restRoom.w/2)*GRID_SIZE, y: (restRoom.y + restRoom.h/2)*GRID_SIZE };

    const enemies: Entity[] = [];
    const bossKey = 'orc'; // 仮ボス
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
    
    // 階段は宝部屋に配置
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
