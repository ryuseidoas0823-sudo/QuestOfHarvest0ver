import { GameState, PlayerEntity, EnemyEntity } from "./types";
import { INITIAL_PLAYER_STATS } from "./data";

/**
 * サバイバルステータスの更新
 * @param player プレイヤー情報
 * @param delta 経過時間（ミリ秒）
 */
export const updateSurvival = (player: PlayerEntity, delta: number): PlayerEntity => {
  const updated = { ...player };
  
  // 減少レート（ゲーム内時間1分あたり、または実時間ベースで調整）
  // ここでは1秒あたり約0.1ポイント減少（約16分で0になる計算）
  const decayRate = delta / 10000; 

  updated.hunger = Math.max(0, updated.hunger - decayRate * 0.5);
  updated.thirst = Math.max(0, updated.thirst - decayRate * 0.8); // 渇きは早め
  updated.energy = Math.max(0, updated.energy - decayRate * 0.3);

  // ペナルティ判定
  let damage = 0;
  if (updated.hunger <= 0) damage += 1;
  if (updated.thirst <= 0) damage += 2; // 渇きの方がダメージ大

  if (damage > 0) {
    updated.hp = Math.max(0, updated.hp - damage);
  }

  // エネルギー不足による移動速度低下などはApp.tsx側のロジックで参照可能
  return updated;
};

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

export const calculateRequiredExp = (level: number): number => {
  return Math.floor(100 * Math.pow(1.2, level - 1));
};

export const generateEnemy = (level: number): EnemyEntity => {
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

  return {
    id: crypto.randomUUID(),
    name: `${rarity === 'Normal' ? '' : rarity + ' '}Monster`,
    level,
    rarity,
    hp: 50 * level * multiplier,
    maxHp: 50 * level * multiplier,
    mp: 20 * level,
    maxMp: 20 * level,
    stats: { str: 5, dex: 5, int: 5, vit: 5, agi: 5, luk: 5 },
    x: Math.floor(Math.random() * 20),
    y: Math.floor(Math.random() * 20),
    lootTable: []
  };
};
