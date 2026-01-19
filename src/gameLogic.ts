import { PlayerEntity, EnemyEntity } from "./types";

/**
 * サバイバルステータスの更新
 */
export const updateSurvival = (player: PlayerEntity, delta: number): PlayerEntity => {
  const updated = { ...player };
  const decayRate = delta / 10000; 

  updated.hunger = Math.max(0, updated.hunger - decayRate * 0.5);
  updated.thirst = Math.max(0, updated.thirst - decayRate * 0.8);
  updated.energy = Math.max(0, updated.energy - decayRate * 0.3);

  let damage = 0;
  if (updated.hunger <= 0) damage += 0.1;
  if (updated.thirst <= 0) damage += 0.2;

  if (damage > 0) {
    updated.hp = Math.max(0, updated.hp - damage);
  }

  return updated;
};

/**
 * モンスターのAI更新（リアルタイム）
 */
export const updateEnemyAI = (
  enemy: EnemyEntity, 
  player: PlayerEntity, 
  worldMap: number[][], 
  currentTime: number,
  delta: number
): { enemy: EnemyEntity, damageToPlayer: number } => {
  const updatedEnemy = { ...enemy };
  let damageToPlayer = 0;

  const dx = player.x - enemy.x;
  const dy = player.y - enemy.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  if (distance <= enemy.visionRange) {
    updatedEnemy.behavior = 'chase';
  } else {
    updatedEnemy.behavior = 'idle';
  }

  if (updatedEnemy.behavior === 'chase') {
    if (distance <= enemy.attackRange) {
      updatedEnemy.isMoving = false;
      if (currentTime - updatedEnemy.lastAttackTime > updatedEnemy.attackCooldown) {
        damageToPlayer = Math.max(1, enemy.stats.str - (player.stats.vit / 2));
        updatedEnemy.lastAttackTime = currentTime;
      }
    } else {
      updatedEnemy.isMoving = true;
      if (currentTime % 500 < delta) { 
        if (Math.abs(dx) > Math.abs(dy)) {
          const moveX = dx > 0 ? 1 : -1;
          if (worldMap[enemy.y] && worldMap[enemy.y][enemy.x + moveX] === 0) {
            updatedEnemy.x += moveX;
            updatedEnemy.direction = moveX > 0 ? 'right' : 'left';
          }
        } else {
          const moveY = dy > 0 ? 1 : -1;
          if (worldMap[enemy.y + moveY] && worldMap[enemy.y + moveY][enemy.x] === 0) {
            updatedEnemy.y += moveY;
          }
        }
      }
    }
  }

  return { enemy: updatedEnemy, damageToPlayer };
};

/**
 * ワールドマップ生成
 */
export const generateWorldMap = (width: number, height: number): number[][] => {
  const map: number[][] = [];
  for (let y = 0; y < height; y++) {
    const row: number[] = [];
    for (let x = 0; x < width; x++) {
      row.push(Math.random() > 0.1 ? 0 : 1);
    }
    map.push(row);
  }
  return map;
};

/**
 * モンスター個体の生成
 */
export const generateEnemy = (level: number, x: number = 0, y: number = 0): EnemyEntity => {
  const rarityRoll = Math.random();
  let rarity: 'Normal' | 'Elite' | 'Boss' = 'Normal';
  let multiplier = 1;

  if (rarityRoll > 0.98) {
    rarity = 'Boss';
    multiplier = 5;
  } else if (rarityRoll > 0.9) {
    rarity = 'Elite';
    multiplier = 2;
  }

  const monsterTypes = ['Slime', 'Goblin', 'Wolf', 'Bat'];
  const type = monsterTypes[Math.floor(Math.random() * monsterTypes.length)];

  return {
    id: crypto.randomUUID(),
    name: `${rarity === 'Normal' ? '' : rarity + ' '}${type}`,
    type: type,
    level,
    rarity,
    hp: 50 * level * multiplier,
    maxHp: 50 * level * multiplier,
    mp: 20 * level,
    maxMp: 20 * level,
    stats: { str: 5 + level, dex: 5, int: 5, vit: 5 + level, agi: 5, luk: 5 },
    x,
    y,
    width: 48,
    height: 48,
    visualWidth: 48,
    visualHeight: 48,
    isMoving: false,
    animFrame: 0,
    direction: 'right',
    lootTable: [],
    behavior: 'idle',
    visionRange: 6,
    attackRange: 1.2,
    attackCooldown: 1500,
    lastAttackTime: 0
  };
};

/**
 * モンスターの配置
 */
export const spawnMonsters = (worldMap: number[][], count: number, playerLevel: number): EnemyEntity[] => {
  const enemies: EnemyEntity[] = [];
  const height = worldMap.length;
  const width = worldMap[0].length;

  for (let i = 0; i < count; i++) {
    let x, y;
    let attempts = 0;
    do {
      x = Math.floor(Math.random() * width);
      y = Math.floor(Math.random() * height);
      attempts++;
    } while (worldMap[y][x] === 1 && attempts < 100);

    if (attempts < 100) {
      enemies.push(generateEnemy(playerLevel, x, y));
    }
  }
  return enemies;
};
