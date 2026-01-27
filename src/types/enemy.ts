import { Position } from './input';
import { StatusEffect } from './combat';

/**
 * 敵の種族定義
 */
export type EnemyRace = 
  | 'slime'     // 粘体: 物理耐性、魔法弱点
  | 'undead'    // 死霊: 毒無効、聖弱点、再生
  | 'humanoid'  // 亜人: バランス型、集団戦術
  | 'beast'     // 魔獣: 高速、高火力
  | 'construct' // 無機物: 状態異常無効、高防御
  | 'plant'     // 植物: 火弱点、状態異常攻撃
  | 'demon'     // 悪魔: 魔法攻撃、耐性多め
  | 'dragon'    // 竜: ブレス、高ステータス
  | 'god';      // 神性: ボス級

/**
 * 属性タイプ（攻撃属性・耐性判定用）
 */
export type ElementType = 'physical' | 'fire' | 'ice' | 'thunder' | 'poison' | 'holy' | 'dark';

/**
 * 耐性定義
 * Key: 属性, Value: ダメージカット率 (0.0 ~ 1.0)
 * 例: { fire: 0.5 } -> 火属性ダメージを50%カット
 */
export type EnemyResistances = Partial<Record<ElementType, number>>;

/**
 * 弱点定義
 * Key: 属性, Value: ダメージ倍率 (> 1.0)
 * 例: { ice: 1.5 } -> 氷属性ダメージが1.5倍
 */
export type EnemyWeaknesses = Partial<Record<ElementType, number>>;

/**
 * 敵キャラクターのインターフェース
 */
export interface Enemy {
  id: string;
  name: string;
  symbol: string; // マップ上の表示文字
  color: string;  // 表示色
  position: Position;
  
  // 戦闘ステータス
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  exp: number;
  
  // AI・行動パターン
  aiType: 'chase' | 'random' | 'stationary' | 'ranged' | 'healer' | 'boss_minotaur' | 'boss_goliath';
  
  // 特性データ
  race: EnemyRace;
  resistances?: EnemyResistances;
  weaknesses?: EnemyWeaknesses;
  
  statusEffects: StatusEffect[];
}
