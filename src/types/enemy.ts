import { Stats } from '../types';

// 勢力の定義
export type Faction = 'monster' | 'player_ally' | 'neutral' | 'player';

export type EnemyType = 'melee' | 'ranged' | 'magic' | 'boss';

export interface Enemy {
  id: string;
  name: string;
  type: EnemyType;
  // AIロジック等で参照される基本ステータス
  maxHp: number;
  attack: number;
  defense: number;
  exp: number;
  
  // ドロップアイテム定義
  dropItems: { itemId: string; rate: number }[]; 
  
  faction?: Faction;
  aiType?: 'aggressive' | 'defensive' | 'stationary';
  assetId?: string; // 見た目用アセットキー
  visionRange?: number;
}

// ゲーム内で生成された敵インスタンス
export interface EnemyInstance extends Enemy {
  uniqueId: string;
  hp: number;
  x: number;
  y: number;
  stats: Stats; // 動的なステータス管理用（バフ・デバフ対応）
}
