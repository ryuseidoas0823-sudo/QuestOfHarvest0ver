import { DungeonMap, PlayerState, Tile } from '../types';
import { EnemyInstance } from '../types/enemy';

// AIロジック（簡易版）

export const decideEnemyAction = (
  enemy: EnemyInstance,
  dungeon: DungeonMap,
  player: PlayerState
) => {
  // マップデータへのアクセス修正
  const map = dungeon.map; // 'tiles' -> 'map'

  if (!map) return null;

  // プレイヤーとの距離計算など
  // ...

  return { type: 'wait' };
};
