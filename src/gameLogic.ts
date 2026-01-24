import { GameState, Position, Entity, Direction, Stats } from './types';
import { JOBS } from './data/jobs';
import { GODS } from './data/gods'; // 追加
import { JobId } from './types/job';

// グリッドサイズ定義
const GRID_SIZE = 40; 

/**
 * 職業と信仰する神のデータに基づいてプレイヤーの初期ステータスを生成する
 */
export const createInitialPlayer = (jobId: JobId, godId: string, startPos: Position): Entity => {
  const jobDef = JOBS[jobId];
  const godDef = GODS[godId];
  
  if (!jobDef) throw new Error(`Job definition not found: ${jobId}`);
  // godIdがnull/undefinedの場合はボーナスなしで進行する安全策をとっても良いが、今回は必須とする
  if (!godDef) throw new Error(`God definition not found: ${godId}`);

  // 基本ステータス（職業）
  let baseMaxHp = jobDef.baseStats.maxHp;
  let baseAttack = jobDef.baseStats.attack;
  let baseDefense = jobDef.baseStats.defense;

  // 神の恩恵（パッシブボーナス）を加算
  if (godDef.passiveBonus.maxHp) baseMaxHp += godDef.passiveBonus.maxHp;
  if (godDef.passiveBonus.attack) baseAttack += godDef.passiveBonus.attack;
  if (godDef.passiveBonus.defense) baseDefense += godDef.passiveBonus.defense;

  // Statsオブジェクトの構築
  const stats: Stats = {
    maxHp: baseMaxHp,
    hp: baseMaxHp, // 現在HPも最大値にする
    attack: baseAttack,
    defense: baseDefense,
    level: 1,
    exp: 0,
    nextLevelExp: 100,
    speed: 1,
    // 拡張ステータス（Stats型に本来定義すべきだが、JSオブジェクトとして保持）
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
    color: godDef.color, // プレイヤーの色を神のテーマカラーにする（デバッグ的演出）
    direction: 'down',
    isMoving: false,
    stats: stats,
    jobId: jobId, 
    godId: godId, // 神IDも保持しておく
    skills: [...jobDef.learnableSkills],
  } as Entity;
};

// ... existing code ...
// 既存の moveEntity, updateGameLogic などの関数はそのまま残す、
// または必要に応じてリファクタリングする
