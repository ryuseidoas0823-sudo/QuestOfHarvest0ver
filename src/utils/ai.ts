import { EnemyInstance, Faction } from '../types/enemy';
import { DungeonMap, TileType } from '../types';
import { getDistance } from '../utils'; // getDistanceをインポート

// AIの行動決定結果
export type AIResult = 
  | { type: 'attack'; targetId: string }
  | { type: 'move'; x: number; y: number }
  | { type: 'wait' };

/**
 * 敵・NPCの行動を決定する
 */
export const decideAction = (
  actor: EnemyInstance,
  allEnemies: EnemyInstance[], // 自分を含む全キャラ
  playerPos: { x: number; y: number },
  dungeon: DungeonMap
): AIResult => {
  // 1. ターゲットの選定
  let target: { id: string; x: number; y: number; dist: number; faction: string } | null = null;

  if (actor.faction === 'player_ally') {
    // 味方: 一番近いモンスターを狙う
    const enemies = allEnemies
      .filter(e => e.faction === 'monster' && e.hp > 0)
      .map(e => ({
        id: e.uniqueId,
        x: e.x,
        y: e.y,
        dist: getDistance(actor.x, actor.y, e.x, e.y),
        faction: e.faction || 'monster' // factionがない場合のデフォルト
      }))
      .sort((a, b) => a.dist - b.dist);
    target = enemies[0] || null;
  } else {
    // モンスター: プレイヤー または 味方NPC の近い方を狙う
    const potentialTargets = [
      { id: 'player', x: playerPos.x, y: playerPos.y, dist: getDistance(actor.x, actor.y, playerPos.x, playerPos.y), faction: 'player' },
      ...allEnemies
        .filter(e => e.faction === 'player_ally' && e.hp > 0)
        .map(e => ({
          id: e.uniqueId,
          x: e.x,
          y: e.y,
          dist: getDistance(actor.x, actor.y, e.x, e.y),
          faction: 'player_ally'
        }))
    ].sort((a, b) => a.dist - b.dist);
    target = potentialTargets[0] || null;
  }

  // 2. 行動の決定
  if (!target) {
    // ターゲットがいない場合
    if (actor.faction === 'player_ally') {
      // 味方はプレイヤーに追従
      const distToPlayer = getDistance(actor.x, actor.y, playerPos.x, playerPos.y);
      if (distToPlayer > 2) {
        return getMoveTowards(actor, playerPos.x, playerPos.y, dungeon);
      }
    }
    return { type: 'wait' };
  }

  // ターゲットがいる場合
  // 索敵範囲 (味方は狭め、敵は広め等の調整も可。ここでは固定)
  const detectionRange = actor.faction === 'player_ally' ? 6 : 8;

  if (target.dist <= detectionRange) {
    // 攻撃範囲 (隣接)
    if (target.dist <= 1.5) {
      return { type: 'attack', targetId: target.id };
    } 
    // 移動 (接近)
    else {
      return getMoveTowards(actor, target.x, target.y, dungeon);
    }
  } else {
    // 範囲外
    if (actor.faction === 'player_ally') {
      // 追従優先
      return getMoveTowards(actor, playerPos.x, playerPos.y, dungeon);
    }
    // 敵は待機（またはランダムウォーク）
    return { type: 'wait' };
  }
};

/**
 * 目的地に向かう次の座標を計算
 */
const getMoveTowards = (
  actor: { x: number; y: number },
  targetX: number,
  targetY: number,
  dungeon: DungeonMap
): AIResult => {
  let newX = actor.x;
  let newY = actor.y;

  // X軸移動優先かY軸優先かをランダムにすると自然だが、今回は簡易的に
  // 壁判定を行いながら近づく
  if (targetX > actor.x && dungeon.tiles[actor.y][actor.x + 1] !== 'wall') newX++;
  else if (targetX < actor.x && dungeon.tiles[actor.y][actor.x - 1] !== 'wall') newX--;
  else if (targetY > actor.y && dungeon.tiles[actor.y + 1][actor.x] !== 'wall') newY++;
  else if (targetY < actor.y && dungeon.tiles[actor.y - 1][actor.x] !== 'wall') newY--;

  if (newX === actor.x && newY === actor.y) return { type: 'wait' };
  return { type: 'move', x: newX, y: newY };
};
