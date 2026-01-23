import { Stats } from '../types';

/**
 * 敵の行動タイプ
 */
export type EnemyBehavior = 
  | 'aggressive' // プレイヤーを発見すると追いかける
  | 'passive'    // 攻撃されるまで動かない、または逃げる
  | 'patrol'     // 決まったルートを巡回する
  | 'boss';      // ボス用AI

/**
 * 敵キャラクターの定義データ
 */
export interface EnemyDefinition {
  id: string;
  name: string;
  
  // 基本ステータス
  baseStats: Pick<Stats, 'maxHp' | 'attack' | 'defense'>;
  
  // 経験値
  expReward: number;
  
  // ドロップアイテム（アイテムIDと確率）
  dropTable: {
    itemId: string;
    chance: number; // 0.0 ~ 1.0
  }[];

  // 行動パターン
  behavior: EnemyBehavior;
  
  // 感知範囲（グリッド数）
  aggroRange: number;
  
  // 攻撃範囲
  attackRange: number;
  
  // アセットキー
  assetKey: string;
}
