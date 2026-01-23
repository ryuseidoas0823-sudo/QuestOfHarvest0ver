import { GameState, Position, Entity, Direction, Stats } from './types';
import { JOBS } from './data/jobs';
import { JobId } from './types/job';

// グリッドサイズ定義（config.tsからインポートするのが望ましいが、ここでは仮定）
const GRID_SIZE = 40; 
const MAP_WIDTH = 50; 
const MAP_HEIGHT = 50;

/**
 * 職業データに基づいてプレイヤーの初期ステータスを生成する
 */
export const createInitialPlayer = (jobId: JobId, startPos: Position): Entity => {
  const jobDef = JOBS[jobId];
  
  if (!jobDef) {
    throw new Error(`Job definition not found for id: ${jobId}`);
  }

  // Stats型の整合性を取るためのマッピング
  // src/types.ts の Stats 定義に合わせる
  const stats: Stats = {
    maxHp: jobDef.baseStats.maxHp,
    hp: jobDef.baseStats.maxHp,
    attack: jobDef.baseStats.attack,
    defense: jobDef.baseStats.defense,
    level: 1,
    exp: 0,
    nextLevelExp: 100,
    // 以下、JobDefinitionにないプロパティの初期値
    speed: 1, 
    // 必要に応じて他のStatsプロパティも初期化
  };

  return {
    id: 'player',
    type: 'player',
    x: startPos.x * GRID_SIZE, // グリッド座標からピクセル座標へ変換
    y: startPos.y * GRID_SIZE,
    width: GRID_SIZE,
    height: GRID_SIZE,
    color: '#00ff00', // デバッグ用色、実際はrendererでアセットを描画
    direction: 'down',
    isMoving: false,
    stats: stats,
    // 拡張プロパティ
    jobId: jobId, 
    skills: [...jobDef.learnableSkills], // 初期習得スキル（必要ならレベル判定を入れる）
  } as Entity;
};

// ... existing code ...
// 既存の moveEntity, updateGameLogic などの関数はそのまま残す、
// または必要に応じてリファクタリングする
