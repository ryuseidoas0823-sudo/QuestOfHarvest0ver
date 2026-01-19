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
  if (updated.hunger <= 0) damage += 1;
  if (updated.thirst <= 0) damage += 2;

  if (damage > 0) {
    updated.hp = Math.max(0, updated.hp - damage);
  }

  return updated;
};

/**
 * ワールドマップ生成
 */
export const generateWorldMap = (width: number, height: number): number[][] => {
  const map: number[][] = [];
  for (let y = 0; y < height; y++) {
    const row: number[] = [];
    for (let x = 0; x < width; x++) {
      // 10%の確率で水(1)、それ以外は草地(0)
      row.push(Math.random() > 0.1 ? 0 : 1);
    }
    map.push(row);
  }
  return map;
};

/**
 * モンスターの配置
 * マップ上の有効な（水ではない）タイルにモンスターを配置します
 */
export const spawnMonsters = (worldMap: number[][], count: number, playerLevel: number): EnemyEntity[] => {
  const enemies: EnemyEntity[] = [];
  const height = worldMap.length;
  const width = worldMap[0].length;

  for (let i = 0; i < count; i++) {
    let x, y;
    let attempts = 0;
    // 水タイルを避けて配置を試行する
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

/**
 * シンボルエンカウントのチェック
 * プレイヤーと同じタイル座標にいるモンスターを返します
 */
export const checkSymbolEncounter = (player: PlayerEntity, enemies: EnemyEntity[]): EnemyEntity | null => {
  return enemies.find(enemy => enemy.x === player.x && enemy.y === player.y) || null;
};

export const calculateRequiredExp = (level: number): number => {
  return Math.floor(100 * Math.pow(1.2, level - 1));
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

  // バリエーションを増やすための種類リスト
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
    stats: { str: 5, dex: 5, int: 5, vit: 5, agi: 5, luk: 5 },
    x,
    y,
    width: 48,
    height: 48,
    visualWidth: 48,
    visualHeight: 48,
    isMoving: false,
    animFrame: 0,
    direction: 'right',
    lootTable: []
  };
};
